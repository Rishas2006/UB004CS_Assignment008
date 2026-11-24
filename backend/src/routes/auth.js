const router = require("express").Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { z } = require("zod");
const config = require("../config");
const { query, tx, uuid } = require("../db");
const { AppError, asyncHandler, validate, makeRef } = require("../utils");
const { authenticate, signAccess } = require("../middleware/auth");
const { audit } = require("../middleware/audit");
const { issueOtp, checkOtp } = require("../services/otp");

// ---------- validation ----------
const password = z
  .string()
  .min(8, "At least 8 characters")
  .max(72)
  .refine(
    (p) =>
      [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((r) => r.test(p))
        .length >= 3,
    "Use upper and lower case letters, numbers or symbols",
  );
const email = z.string().trim().toLowerCase().email().max(120);
const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{9,15}$/, "Enter a valid phone number"),
  password,
});

const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const cookieOpts = () => ({
  httpOnly: true,
  secure: config.isProd,
  sameSite: config.isProd ? "none" : "lax",
  maxAge: config.jwt.refreshDays * 86400_000,
  path: "/api/v1/auth",
});
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  branchId: u.branch_id,
});

async function issueSession(res, user) {
  const refresh = crypto.randomBytes(48).toString("hex");
  await query(
    `INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES ($1,$2,$3, NOW() + make_interval(days => $4::int))`,
    [uuid(), user.id, sha(refresh), config.jwt.refreshDays],
  );
  res.cookie("rh_refresh", refresh, cookieOpts());
  return {
    accessToken: signAccess(user),
    refreshToken: refresh,
    user: publicUser(user),
  };
}

// ---------- POST /auth/register ----------
router.post(
  "/register",
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email: mail, phone, password: pw } = req.body;
    const dup = await query(
      "SELECT id, is_verified FROM users WHERE lower(email) = $1",
      [mail],
    );
    if (dup.rows[0]?.is_verified)
      throw new AppError(
        409,
        "An account with this email already exists",
        "email_taken",
      );
    const hash = await bcrypt.hash(pw, 12);
    const user = await tx(async (c) => {
      if (dup.rows[0]) {
        // unverified re-registration: refresh details
        await c.query(
          "UPDATE users SET name=$1, phone=$2, password_hash=$3 WHERE id=$4",
          [name, phone, hash, dup.rows[0].id],
        );
        return (
          await c.query("SELECT * FROM users WHERE id = $1", [dup.rows[0].id])
        ).rows[0];
      }
      const id = uuid();
      await c.query(
        `INSERT INTO users (id, name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5,'patient')`,
        [id, name, mail, phone, hash],
      );
      await c.query(
        "INSERT INTO patients (id, user_id, mrn, qr_token) VALUES ($1,$2,$3,$4)",
        [uuid(), id, makeRef("RH", 6), crypto.randomBytes(18).toString("hex")],
      );
      return (await c.query("SELECT * FROM users WHERE id = $1", [id])).rows[0];
    });
    await issueOtp(user);
    res
      .status(201)
      .json({ message: "Verification code sent to your email", email: mail });
  }),
);

// ---------- POST /auth/verify-otp ----------
router.post(
  "/verify-otp",
  validate(
    z.object({
      email,
      code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
    }),
  ),
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "SELECT * FROM users WHERE lower(email) = $1",
      [req.body.email],
    );
    const user = rows[0];
    if (!user) throw new AppError(400, "Incorrect code", "otp_invalid");
    await checkOtp(user.id, req.body.code, "verify");
    await query("UPDATE users SET is_verified = true WHERE id = $1", [user.id]);
    user.is_verified = true;
    req.user = user;
    audit(req, "auth.verify", "user", user.id);
    res.json(await issueSession(res, user));
  }),
);

router.post(
  "/resend-otp",
  validate(z.object({ email })),
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "SELECT * FROM users WHERE lower(email) = $1 AND is_verified = false",
      [req.body.email],
    );
    if (rows[0]) await issueOtp(rows[0]);
    res.json({ message: "If the account exists, a new code has been sent" }); // no user enumeration
  }),
);

// ---------- POST /auth/login ----------
const MAX_FAILS = 5;
router.post(
  "/login",
  validate(z.object({ email, password: z.string().min(1).max(72) })),
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "SELECT * FROM users WHERE lower(email) = $1",
      [req.body.email],
    );
    const user = rows[0];
    const bad = new AppError(
      401,
      "Incorrect email or password",
      "invalid_credentials",
    );
    if (!user) {
      await bcrypt.compare(
        req.body.password,
        "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidi",
      );
      throw bad;
    }
    if (user.locked_until && new Date(user.locked_until) > new Date())
      throw new AppError(
        423,
        "Account temporarily locked. Try again in 15 minutes.",
        "locked",
      );
    if (!(await bcrypt.compare(req.body.password, user.password_hash))) {
      const fails = user.failed_logins + 1;
      await query(
        `UPDATE users SET failed_logins = $1, locked_until = CASE WHEN $1::int >= $2::int THEN NOW() + INTERVAL '15 minutes' ELSE NULL END WHERE id = $3`,
        [fails, MAX_FAILS, user.id],
      );
      throw bad;
    }
    if (!user.is_active)
      throw new AppError(403, "Account disabled", "disabled");
    if (!user.is_verified)
      throw new AppError(403, "Please verify your email first", "unverified");
    await query(
      "UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = $1",
      [user.id],
    );
    req.user = user;
    audit(req, "auth.login", "user", user.id);
    res.json(await issueSession(res, user));
  }),
);

// ---------- POST /auth/refresh  (rotates the refresh token) ----------
router.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.rh_refresh || req.body?.refreshToken;
    if (!token) throw new AppError(401, "No refresh token", "unauthenticated");
    const { rows } = await query(
      `SELECT rt.id AS rt_id, u.* FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1 AND rt.revoked = false AND rt.expires_at > NOW() AND u.is_active`,
      [sha(token)],
    );
    if (!rows[0])
      throw new AppError(
        401,
        "Session expired. Please log in again.",
        "token_invalid",
      );
    await query("UPDATE refresh_tokens SET revoked = true WHERE id = $1", [
      rows[0].rt_id,
    ]);
    res.json(await issueSession(res, rows[0]));
  }),
);

router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.rh_refresh || req.body?.refreshToken;
    if (token)
      await query(
        "UPDATE refresh_tokens SET revoked = true WHERE token_hash = $1",
        [sha(token)],
      );
    res.clearCookie("rh_refresh", { path: "/api/v1/auth" });
    res.json({ message: "Logged out" });
  }),
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "SELECT id, name, email, phone, role, branch_id FROM users WHERE id = $1",
      [req.user.id],
    );
    if (!rows[0]) throw new AppError(401, "User not found", "unauthenticated");
    res.json({ user: publicUser(rows[0]) });
  }),
);

router.post(
  "/change-password",
  authenticate,
  validate(
    z.object({ currentPassword: z.string().min(1), newPassword: password }),
  ),
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.user.id],
    );
    if (
      !(await bcrypt.compare(req.body.currentPassword, rows[0].password_hash))
    )
      throw new AppError(
        400,
        "Current password is incorrect",
        "invalid_credentials",
      );
    await query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      await bcrypt.hash(req.body.newPassword, 12),
      req.user.id,
    ]);
    await query("UPDATE refresh_tokens SET revoked = true WHERE user_id = $1", [
      req.user.id,
    ]);
    audit(req, "auth.password_change", "user", req.user.id);
    res.json({ message: "Password updated. Please log in again." });
  }),
);

router.post(
  "/forgot-password",
  validate(z.object({ email })),
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "SELECT * FROM users WHERE lower(email) = $1 AND is_verified",
      [req.body.email],
    );
    if (rows[0]) await issueOtp(rows[0], "reset");
    res.json({ message: "If the account exists, a reset code has been sent" });
  }),
);
router.post(
  "/reset-password",
  validate(
    z.object({
      email,
      code: z.string().regex(/^\d{6}$/),
      newPassword: password,
    }),
  ),
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "SELECT * FROM users WHERE lower(email) = $1",
      [req.body.email],
    );
    if (!rows[0]) throw new AppError(400, "Incorrect code", "otp_invalid");
    await checkOtp(rows[0].id, req.body.code, "reset");
    await query(
      "UPDATE users SET password_hash = $1, failed_logins = 0, locked_until = NULL WHERE id = $2",
      [await bcrypt.hash(req.body.newPassword, 12), rows[0].id],
    );
    await query("UPDATE refresh_tokens SET revoked = true WHERE user_id = $1", [
      rows[0].id,
    ]);
    res.json({ message: "Password reset. You can log in now." });
  }),
);

module.exports = router;
