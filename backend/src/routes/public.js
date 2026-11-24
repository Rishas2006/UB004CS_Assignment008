const router = require("express").Router();
const { z } = require("zod");
const { query } = require("../db");
const {
  asyncHandler,
  validate,
  notFound,
  makeRef,
  isoDate,
  weekdayOf,
} = require("../utils");
const { buildSlots, earliest } = require("../services/slots");
const { optionalAuth } = require("../middleware/auth");

/** "today" in Sri Lanka (the database session runs in UTC) */
const COLOMBO_TODAY = "(NOW() AT TIME ZONE 'Asia/Colombo')::date";
const cache = (s) => (_req, res, next) => {
  res.set("Cache-Control", `public, max-age=${s}`);
  next();
};
const list = (path, sql, ttl = 60) =>
  router.get(
    path,
    cache(ttl),
    asyncHandler(async (_req, res) => res.json((await query(sql)).rows)),
  );

// ---------- simple read-only lists (public website pages) ----------
list(
  "/branches",
  "SELECT id, name, address, phone, lat, lng FROM branches ORDER BY id",
);
list(
  "/departments",
  'SELECT id, name, description, icon, is_centre AS "isCentre" FROM departments ORDER BY id',
);
list(
  "/services",
  "SELECT slug, icon, name, description, points, hours FROM services ORDER BY slug",
);
list(
  "/lab-tests",
  'SELECT code, name, category, price, turnaround_hours AS "turnaroundHours" FROM lab_tests ORDER BY name',
);
list(
  "/packages",
  "SELECT id, icon, name, price, discount, tests FROM packages ORDER BY price",
);
list("/rooms", "SELECT id, name, price, description FROM rooms ORDER BY price");
list("/faqs", "SELECT id, category, question, answer FROM faqs ORDER BY id");
list(
  "/news",
  "SELECT slug, published_on AS date, category, title, body FROM news WHERE is_published ORDER BY published_on DESC",
);
list(
  "/announcements",
  "SELECT id, severity AS sev, text FROM announcements WHERE is_active ORDER BY created_at DESC",
  30,
);
list(
  "/promotions",
  `SELECT id, valid_until AS until, title, description FROM promotions WHERE is_active AND valid_until >= ${COLOMBO_TODAY} ORDER BY valid_until`,
  30,
);
list(
  "/jobs",
  `SELECT j.id, j.title, j.department, b.id AS "branchId", j.closing_date AS "closingDate" FROM jobs j LEFT JOIN branches b ON b.id = j.branch_id WHERE j.is_open AND (j.closing_date IS NULL OR j.closing_date >= ${COLOMBO_TODAY}) ORDER BY j.closing_date`,
);
list(
  "/reviews",
  "SELECT id, author AS name, rating, body AS text FROM reviews WHERE status = 'APPROVED' ORDER BY created_at DESC LIMIT 30",
);
list(
  "/parking",
  "SELECT p.id, b.name AS branch, p.name, p.total, p.free FROM parking_lots p LEFT JOIN branches b ON b.id = p.branch_id ORDER BY p.id",
  15,
);
list(
  "/opening-hours",
  'SELECT id, label, hours, is_24x7 AS "is24x7" FROM opening_hours ORDER BY id',
);

router.get(
  "/news/:slug",
  cache(60),
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "SELECT slug, published_on AS date, category, title, body FROM news WHERE slug = $1 AND is_published",
      [req.params.slug],
    );
    if (!rows[0]) throw notFound("Article not found");
    res.json(rows[0]);
  }),
);
router.get(
  "/services/:slug",
  cache(60),
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "SELECT slug, icon, name, description, points, hours FROM services WHERE slug = $1",
      [req.params.slug],
    );
    if (!rows[0]) throw notFound("Service not found");
    res.json(rows[0]);
  }),
);

// awards, reports, directors, policies, gallery, canteen, emergency contacts
const CONTENT_KINDS = {
  awards: "award",
  reports: "report",
  directors: "director",
  policies: "policy",
  gallery: "gallery",
  canteen: "canteen",
  "emergency-contacts": "emergency_contact",
};
router.get(
  "/content/:kind",
  cache(60),
  asyncHandler(async (req, res) => {
    const kind = CONTENT_KINDS[req.params.kind];
    if (!kind) throw notFound("Unknown content type");
    const { rows } = await query(
      "SELECT id, data FROM content_items WHERE kind = $1 AND is_published ORDER BY sort_order, id",
      [kind],
    );
    res.json(rows.map((r) => ({ id: r.id, ...r.data })));
  }),
);

// ---------- bed capacity (live board) ----------
router.get(
  "/operations/beds",
  asyncHandler(async (_req, res) => {
    const { rows } = await query(`
    SELECT w.id, w.name, w.total_beds AS total,
           COUNT(*) FILTER (WHERE b.status = 'occupied') AS occupied,
           COUNT(*) FILTER (WHERE b.status = 'available') AS available
    FROM wards w LEFT JOIN beds b ON b.ward_id = w.id GROUP BY w.id, w.name, w.total_beds ORDER BY w.id`);
    res.json(rows);
  }),
);

router.get(
  "/operations/icu-beds",
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT b.status FROM beds b JOIN wards w ON w.id = b.ward_id WHERE w.name = 'ICU' ORDER BY b.id`,
    );
    res.json(rows.map((r) => r.status));
  }),
);

// ---------- doctors: find + filters + profile + live slots ----------
const doctorSelect = `SELECT d.id, d.name, d.initials, d.dept_id AS dept, d.branch_id AS branch, d.experience_years AS exp,
  d.languages AS langs, d.video_enabled AS video, d.is_resident AS resident, d.fee, d.schedule_text AS days, d.slmc_no AS slmc
  FROM doctors d WHERE d.is_active`;

router.get(
  "/doctors",
  validate(
    z.object({
      dept: z.string().optional(),
      branch: z.string().optional(),
      lang: z.enum(["en", "si", "ta"]).optional(),
      video: z.enum(["true", "false"]).optional(),
      q: z.string().trim().max(60).optional(),
    }),
    "query",
  ),
  asyncHandler(async (req, res) => {
    const { dept, branch, lang, video, q } = req.query;
    const p = [];
    let sql = doctorSelect;
    if (dept) {
      p.push(dept);
      sql += ` AND d.dept_id = $${p.length}`;
    }
    if (branch) {
      p.push(branch);
      sql += ` AND d.branch_id = $${p.length}`;
    }
    if (lang) {
      p.push(lang);
      sql += ` AND d.languages @> to_jsonb($${p.length}::text)`;
    }
    if (video === "true") sql += " AND d.video_enabled";
    if (q) {
      p.push(`%${q}%`);
      sql += ` AND d.name ILIKE $${p.length}`;
    }
    res.set("Cache-Control", "public, max-age=30");
    res.json((await query(`${sql} ORDER BY d.name`, p)).rows);
  }),
);

router.get(
  "/doctors/:id",
  asyncHandler(async (req, res) => {
    const { rows } = await query(`${doctorSelect} AND d.id = $1`, [
      req.params.id,
    ]);
    if (!rows[0]) throw notFound("Doctor not found");
    res.json(rows[0]);
  }),
);

/** GET /doctors/:id/slots?date=YYYY-MM-DD  -> real availability from schedules minus booked rows */
async function slotsFor(doctorId, date, now) {
  const [sch, bk] = await Promise.all([
    query(
      "SELECT start_time, end_time, slot_minutes FROM doctor_schedules WHERE doctor_id = $1 AND weekday = $2 ORDER BY start_time",
      [doctorId, weekdayOf(date)],
    ),
    query(
      `SELECT appt_time AS t FROM appointments WHERE doctor_id = $1 AND appt_date = $2 AND status <> 'CANCELLED'`,
      [doctorId, date],
    ),
  ]);
  return buildSlots(
    sch.rows,
    bk.rows.map((r) => r.t),
    { now, dateStr: date },
  );
}
const colomboNow = () => {
  const s = new Date().toLocaleString("sv-SE", { timeZone: "Asia/Colombo" }); // 'YYYY-MM-DD HH:MM:SS'
  return { date: s.slice(0, 10), time: s.slice(11, 16) };
};

router.get(
  "/doctors/:id/slots",
  validate(
    z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
    "query",
  ),
  asyncHandler(async (req, res) => {
    const d = await query("SELECT 1 FROM doctors WHERE id = $1 AND is_active", [
      req.params.id,
    ]);
    if (!d.rows[0]) throw notFound("Doctor not found");
    res.json({
      date: req.query.date,
      slots: await slotsFor(req.params.id, req.query.date, colomboNow()),
    });
  }),
);

/** GET /doctors/:id/earliest -> next available slot in the coming 14 days ("earliest slot hint") */
router.get(
  "/doctors/:id/earliest",
  asyncHandler(async (req, res) => {
    const now = colomboNow();
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = isoDate(
        new Date(Date.parse(`${now.date}T00:00:00Z`) + i * 86400_000),
      );
      days.push({ date, slots: await slotsFor(req.params.id, date, now) });
    }
    res.json(earliest(days) || { date: null, time: null });
  }),
);

// ---------- public submissions ----------
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ]{9,15}$/, "Enter a valid phone number");

router.post(
  "/contact",
  validate(
    z.object({
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email().optional().or(z.literal("")),
      phone: phone.optional().or(z.literal("")),
      subject: z.string().trim().max(120).optional(),
      message: z.string().trim().min(5).max(2000),
    }),
  ),
  asyncHandler(async (req, res) => {
    const b = req.body;
    await query(
      "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES ($1,$2,$3,$4,$5)",
      [b.name, b.email || null, b.phone || null, b.subject || null, b.message],
    );
    res
      .status(201)
      .json({ message: "Thank you. We will contact you shortly." });
  }),
);

router.post(
  "/careers/apply",
  validate(
    z.object({
      jobId: z.number().int().positive().optional(),
      name: z.string().trim().min(2).max(80),
      email: z.string().trim().email(),
      phone,
      coverNote: z.string().trim().max(2000).optional(),
      cvUrl: z.string().url().max(300).optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const b = req.body;
    await query(
      "INSERT INTO job_applications (job_id, name, email, phone, cover_note, cv_url) VALUES ($1,$2,$3,$4,$5,$6)",
      [
        b.jobId || null,
        b.name,
        b.email,
        b.phone,
        b.coverNote || null,
        b.cvUrl || null,
      ],
    );
    res.status(201).json({ message: "Application received" });
  }),
);

router.post(
  "/reviews",
  validate(
    z.object({
      author: z.string().trim().min(2).max(60),
      rating: z.number().int().min(1).max(5),
      text: z.string().trim().min(5).max(600),
    }),
  ),
  asyncHandler(async (req, res) => {
    await query(
      "INSERT INTO reviews (author, rating, body) VALUES ($1,$2,$3)",
      [req.body.author, req.body.rating, JSON.stringify({ en: req.body.text })],
    );
    res
      .status(201)
      .json({ message: "Thanks! Your review will appear after moderation." });
  }),
);

router.post(
  "/room-bookings",
  optionalAuth,
  validate(
    z
      .object({
        roomId: z.string().min(1),
        name: z.string().trim().min(2).max(80),
        phone,
        fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .refine((v) => v.toDate >= v.fromDate, {
        message: "toDate must be on or after fromDate",
        path: ["toDate"],
      }),
  ),
  asyncHandler(async (req, res) => {
    const b = req.body;
    const r = await query(
      `INSERT INTO room_bookings (room_id, patient_id, name, phone, from_date, to_date)
       VALUES ($1, (SELECT id FROM patients WHERE user_id = $2), $3,$4,$5,$6) RETURNING id`,
      [b.roomId, req.user?.id || null, b.name, b.phone, b.fromDate, b.toDate],
    );
    res
      .status(201)
      .json({
        id: r.rows[0].id,
        message: "Room request received. We will confirm by phone.",
      });
  }),
);

module.exports = router;
module.exports.slotsFor = slotsFor;
module.exports.colomboNow = colomboNow;
