const router = require("express").Router();
const crypto = require("crypto");
const { z } = require("zod");
const { query, tx, uuid } = require("../db");
const {
  AppError,
  asyncHandler,
  validate,
  notFound,
  forbidden,
  makeRef,
  defer,
} = require("../utils");
const { authenticate, optionalAuth, authorize } = require("../middleware/auth");
const { audit } = require("../middleware/audit");
const { sendMail } = require("../services/mailer");
const { slotsFor, colomboNow } = require("./public");

const STAFF = ["reception", "branch-admin", "doctor", "nurse"];
const emitQueue = (req, branchId) =>
  req.app.get("io")?.to(`queue:${branchId}`).emit("queue:update", { branchId });

const bookSchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:MM"),
  type: z.enum(["IN_PERSON", "VIDEO"]).default("IN_PERSON"),
  reason: z.string().trim().max(500).optional(),
  name: z.string().trim().min(2).max(80).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9 ]{9,15}$/, "Enter a valid phone number")
    .optional(),
});

// ---------- POST /appointments : book (guest or logged-in patient) ----------
router.post(
  "/",
  optionalAuth,
  validate(bookSchema),
  asyncHandler(async (req, res) => {
    const b = req.body;
    const now = colomboNow();
    if (b.date < now.date)
      throw new AppError(422, "Cannot book a past date", "past_date");
    if (
      b.date >
      new Date(Date.parse(now.date) + 60 * 86400_000).toISOString().slice(0, 10)
    )
      throw new AppError(422, "Bookings open up to 60 days ahead", "too_far");

    const doc = (
      await query("SELECT * FROM doctors WHERE id = $1 AND is_active", [
        b.doctorId,
      ])
    ).rows[0];
    if (!doc) throw notFound("Doctor not found");
    if (b.type === "VIDEO" && !doc.video_enabled)
      throw new AppError(
        422,
        "This doctor does not offer video consultations",
        "no_video",
      );

    let patientId = null;
    let email = null;
    if (req.user?.role === "patient") {
      const p = (
        await query(
          "SELECT p.id, u.email FROM patients p JOIN users u ON u.id = p.user_id WHERE u.id = $1",
          [req.user.id],
        )
      ).rows[0];
      patientId = p?.id || null;
      email = p?.email || null;
    }
    if (!patientId && (!b.name || !b.phone))
      throw new AppError(
        422,
        "Name and phone are required for guest bookings",
        "guest_details",
      );

    // slot must exist in the doctor's schedule and still be free (unique index is the final guard against races)
    const slot = (await slotsFor(b.doctorId, b.date, now)).find(
      (s) => s.time === b.time,
    );
    if (!slot)
      throw new AppError(
        422,
        "Doctor is not available at that time",
        "not_in_schedule",
      );
    if (!slot.available)
      throw new AppError(
        409,
        "That time slot is no longer available",
        "slot_taken",
      );

    const appt = await tx(async (c) => {
      const id = uuid();
      const ref = makeRef("RH");
      await c.query(
        `INSERT INTO appointments (id, ref, patient_id, guest_name, guest_phone, doctor_id, branch_id, appt_date, appt_time, type, reason, video_room)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          id,
          ref,
          patientId,
          patientId ? null : b.name,
          patientId ? null : b.phone,
          doc.id,
          doc.branch_id,
          b.date,
          b.time,
          b.type,
          b.reason || null,
          b.type === "VIDEO"
            ? `rh-${crypto.randomBytes(8).toString("hex")}`
            : null,
        ],
      );
      if (patientId)
        await c.query(
          "INSERT INTO invoices (id, ref, patient_id, appointment_id, description, amount) VALUES ($1,$2,$3,$4,$5,$6)",
          [
            uuid(),
            makeRef("INV"),
            patientId,
            id,
            `Consultation - ${doc.name}`,
            doc.fee,
          ],
        );
      return {
        id,
        ref,
        appt_date: b.date,
        appt_time: `${b.time}:00`,
        type: b.type,
        status: "CONFIRMED",
      };
    });

    if (email)
      defer(
        req,
        sendMail({
          to: email,
          subject: `Appointment ${appt.ref} confirmed`,
          text: `Your appointment with ${doc.name} is confirmed for ${b.date} at ${b.time} (${b.type === "VIDEO" ? "video call" : "in person"}). Reference: ${appt.ref}`,
        }),
      );
    audit(req, "appointment.create", "appointment", appt.id);
    emitQueue(req, doc.branch_id);
    res.status(201).json({ ...appt, doctor: doc.name, fee: Number(doc.fee) });
  }),
);

// ---------- GET /appointments/mine ----------
router.get(
  "/mine",
  authenticate,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `
    SELECT a.id, a.ref, a.appt_date AS date, a.appt_time AS "time", a.type, a.status, a.token_no AS "tokenNo",
           CASE WHEN a.type = 'VIDEO' AND a.status IN ('CONFIRMED','CHECKED_IN','IN_CONSULT') THEN a.video_room END AS "videoRoom",
           d.name AS doctor, d.dept_id AS dept, a.branch_id AS branch
    FROM appointments a JOIN doctors d ON d.id = a.doctor_id JOIN patients p ON p.id = a.patient_id
    WHERE p.user_id = $1 ORDER BY a.appt_date DESC, a.appt_time DESC LIMIT 100`,
      [req.user.id],
    );
    res.json(rows);
  }),
);

// ---------- GET /appointments : staff schedule view ----------
router.get(
  "/",
  authenticate,
  authorize(...STAFF),
  validate(
    z.object({
      date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
      branch: z.string().optional(),
      doctorId: z.string().optional(),
      status: z.string().optional(),
    }),
    "query",
  ),
  asyncHandler(async (req, res) => {
    const date = req.query.date || colomboNow().date;
    const p = [date];
    let sql = `
    SELECT a.id, a.ref, a.patient_id AS "patientId", a.appt_time AS "time", a.type, a.status, a.token_no AS "tokenNo", a.reason,
           COALESCE(u.name, a.guest_name) AS patient, COALESCE(u.phone, a.guest_phone) AS phone, d.name AS doctor, a.branch_id AS branch
    FROM appointments a JOIN doctors d ON d.id = a.doctor_id
    LEFT JOIN patients pt ON pt.id = a.patient_id LEFT JOIN users u ON u.id = pt.user_id WHERE a.appt_date = $1`;
    const branch =
      req.user.role === "super-admin"
        ? req.query.branch
        : req.user.branchId || req.query.branch;
    if (branch) {
      p.push(branch);
      sql += ` AND a.branch_id = $${p.length}`;
    }
    if (req.query.doctorId) {
      p.push(req.query.doctorId);
      sql += ` AND a.doctor_id = $${p.length}`;
    }
    if (req.user.role === "doctor") {
      p.push(req.user.id);
      sql += ` AND d.user_id = $${p.length}`;
    }
    if (req.query.status) {
      p.push(req.query.status);
      sql += ` AND a.status = $${p.length}`;
    }
    res.json((await query(`${sql} ORDER BY a.appt_time`, p)).rows);
  }),
);

// ---------- PATCH /appointments/:id/cancel ----------
router.patch(
  "/:id/cancel",
  authenticate,
  asyncHandler(async (req, res) => {
    const a = (
      await query(
        "SELECT a.*, p.user_id FROM appointments a LEFT JOIN patients p ON p.id = a.patient_id WHERE a.id = $1",
        [req.params.id],
      )
    ).rows[0];
    if (!a) throw notFound("Appointment not found");
    const isOwner = a.user_id === req.user.id;
    if (
      !isOwner &&
      !["reception", "branch-admin", "super-admin"].includes(req.user.role)
    )
      throw forbidden();
    if (!["PENDING", "CONFIRMED"].includes(a.status))
      throw new AppError(
        409,
        "Only upcoming appointments can be cancelled",
        "bad_state",
      );
    await query(`UPDATE appointments SET status = 'CANCELLED' WHERE id = $1`, [
      a.id,
    ]);
    await query(
      `UPDATE invoices SET status = 'FAILED' WHERE appointment_id = $1 AND status = 'UNPAID'`,
      [a.id],
    );
    audit(req, "appointment.cancel", "appointment", a.id);
    emitQueue(req, a.branch_id);
    res.json({ message: "Appointment cancelled" });
  }),
);

// ---------- POST /appointments/:id/check-in : reception issues the queue token ----------
router.post(
  "/:id/check-in",
  authenticate,
  authorize("reception", "branch-admin"),
  asyncHandler(async (req, res) => {
    const out = await tx(async (c) => {
      const a = (
        await c.query("SELECT * FROM appointments WHERE id = $1 FOR UPDATE", [
          req.params.id,
        ])
      ).rows[0];
      if (!a) throw notFound("Appointment not found");
      if (a.status !== "CONFIRMED")
        throw new AppError(
          409,
          `Cannot check in an appointment that is ${a.status}`,
          "bad_state",
        );
      const n = (
        await c.query(
          "SELECT COALESCE(MAX(token_no),0) + 1 AS n FROM appointments WHERE doctor_id = $1 AND appt_date = $2",
          [a.doctor_id, a.appt_date],
        )
      ).rows[0].n;
      await c.query(
        `UPDATE appointments SET status = 'CHECKED_IN', token_no = $1, checked_in_at = now() WHERE id = $2`,
        [n, a.id],
      );
      return { tokenNo: n, branchId: a.branch_id };
    });
    audit(req, "appointment.check_in", "appointment", req.params.id);
    emitQueue(req, out.branchId);
    res.json(out);
  }),
);

// ---------- PATCH /appointments/:id/status : doctor / staff workflow ----------
const FLOW = {
  CHECKED_IN: ["IN_CONSULT", "NO_SHOW"],
  IN_CONSULT: ["COMPLETED"],
  CONFIRMED: ["NO_SHOW"],
};
router.patch(
  "/:id/status",
  authenticate,
  authorize("doctor", "nurse", "reception", "branch-admin"),
  validate(
    z.object({ status: z.enum(["IN_CONSULT", "COMPLETED", "NO_SHOW"]) }),
  ),
  asyncHandler(async (req, res) => {
    const a = (
      await query(
        "SELECT a.*, d.user_id AS doc_user FROM appointments a JOIN doctors d ON d.id = a.doctor_id WHERE a.id = $1",
        [req.params.id],
      )
    ).rows[0];
    if (!a) throw notFound("Appointment not found");
    if (req.user.role === "doctor" && a.doc_user !== req.user.id)
      throw forbidden("This is not your appointment");
    if (!(FLOW[a.status] || []).includes(req.body.status))
      throw new AppError(
        409,
        `Cannot move ${a.status} to ${req.body.status}`,
        "bad_state",
      );
    await query("UPDATE appointments SET status = $1 WHERE id = $2", [
      req.body.status,
      a.id,
    ]);
    audit(req, "appointment.status", "appointment", a.id, {
      to: req.body.status,
    });
    emitQueue(req, a.branch_id);
    res.json({ id: a.id, status: req.body.status });
  }),
);

module.exports = router;
