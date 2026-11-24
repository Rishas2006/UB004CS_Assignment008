const router = require("express").Router();
const { z } = require("zod");
const { query } = require("../db");
const { AppError, asyncHandler, validate, notFound } = require("../utils");
const { authenticate, authorize } = require("../middleware/auth");
const { audit } = require("../middleware/audit");
const { colomboNow } = require("./public");

router.use(authenticate);

// ======================= generic CMS CRUD (whitelisted columns only) =======================
/**
 * crud('/cms/news', { table, pk, cols: {column: 'text'|'json'|'num'|'bool'|'date'}, roles })
 * Column names come from this whitelist - never from the request - so SQL injection through keys is impossible.
 */
function crud(path, { table, pk, cols, roles, orderBy }) {
  const names = Object.keys(cols);
  const pick = (body) => {
    const o = {};
    for (const n of names)
      if (body[n] !== undefined)
        o[n] = cols[n] === "json" ? JSON.stringify(body[n]) : body[n];
    return o;
  };
  const guard = authorize(...roles);
  router.get(
    path,
    guard,
    asyncHandler(async (_req, res) =>
      res.json(
        (
          await query(
            `SELECT * FROM ${table} ORDER BY ${orderBy || pk} DESC LIMIT 500`,
          )
        ).rows,
      ),
    ),
  );
  const byPk = async (id) =>
    (await query(`SELECT * FROM ${table} WHERE ${pk} = $1`, [id])).rows[0];
  router.post(
    path,
    guard,
    asyncHandler(async (req, res) => {
      const d = pick(req.body);
      const keys = Object.keys(d);
      if (!keys.length)
        throw new AppError(422, "No valid fields supplied", "validation_error");
      const r = await query(
        `INSERT INTO ${table} (${keys.map((k) => `"${k}"`).join(",")}) VALUES (${keys.map((_, i) => `$${i + 1}`).join(",")}) RETURNING "${pk}"`,
        keys.map((k) => d[k]),
      );
      const id = r.rows[0][pk];
      audit(req, `cms.${table}.create`, table, id);
      res.status(201).json(await byPk(id));
    }),
  );
  router.put(
    `${path}/:id`,
    guard,
    asyncHandler(async (req, res) => {
      const d = pick(req.body);
      const keys = Object.keys(d);
      if (!keys.length)
        throw new AppError(422, "No valid fields supplied", "validation_error");
      const r = await query(
        `UPDATE ${table} SET ${keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ")} WHERE ${pk} = $${keys.length + 1}`,
        [...keys.map((k) => d[k]), req.params.id],
      );
      if (!r.rowCount) throw notFound();
      audit(req, `cms.${table}.update`, table, req.params.id);
      res.json(
        (await byPk(d[pk] !== undefined ? d[pk] : req.params.id)) || {
          ok: true,
        },
      );
    }),
  );
  router.delete(
    `${path}/:id`,
    guard,
    asyncHandler(async (req, res) => {
      const { rowCount } = await query(
        `DELETE FROM ${table} WHERE ${pk} = $1`,
        [req.params.id],
      );
      if (!rowCount) throw notFound();
      audit(req, `cms.${table}.delete`, table, req.params.id);
      res.status(204).end();
    }),
  );
}
const CMS = ["branch-admin"];
crud("/cms/news", {
  table: "news",
  pk: "slug",
  roles: CMS,
  orderBy: "published_on",
  cols: {
    slug: "text",
    published_on: "date",
    category: "json",
    title: "json",
    body: "json",
    is_published: "bool",
  },
});
crud("/cms/announcements", {
  table: "announcements",
  pk: "id",
  roles: CMS,
  orderBy: "created_at",
  cols: { id: "text", severity: "text", text: "json", is_active: "bool" },
});
crud("/cms/promotions", {
  table: "promotions",
  pk: "id",
  roles: CMS,
  orderBy: "valid_until",
  cols: {
    id: "text",
    valid_until: "date",
    title: "json",
    description: "json",
    is_active: "bool",
  },
});
crud("/cms/faqs", {
  table: "faqs",
  pk: "id",
  roles: CMS,
  cols: { id: "text", category: "text", question: "json", answer: "json" },
});
crud("/cms/packages", {
  table: "packages",
  pk: "id",
  roles: CMS,
  cols: {
    id: "text",
    icon: "text",
    name: "json",
    price: "num",
    discount: "num",
    tests: "json",
  },
});
crud("/cms/lab-tests", {
  table: "lab_tests",
  pk: "code",
  roles: ["laboratory", "branch-admin"],
  cols: {
    code: "text",
    name: "text",
    category: "text",
    price: "num",
    turnaround_hours: "num",
  },
});
crud("/cms/jobs", {
  table: "jobs",
  pk: "id",
  roles: ["hr", "branch-admin"],
  cols: {
    title: "text",
    department: "text",
    branch_id: "text",
    closing_date: "date",
    is_open: "bool",
  },
});
crud("/cms/doctors", {
  table: "doctors",
  pk: "id",
  roles: ["branch-admin"],
  cols: {
    id: "text",
    name: "text",
    initials: "text",
    dept_id: "text",
    branch_id: "text",
    experience_years: "num",
    languages: "json",
    video_enabled: "bool",
    is_resident: "bool",
    fee: "num",
    schedule_text: "text",
    slmc_no: "text",
    is_active: "bool",
  },
});
crud("/cms/parking", {
  table: "parking_lots",
  pk: "id",
  roles: ["branch-admin", "reception"],
  cols: { branch_id: "text", name: "text", total: "num", free: "num" },
});

// ======================= moderation & inboxes =======================
router.get(
  "/reviews",
  authorize("branch-admin"),
  asyncHandler(async (_req, res) =>
    res.json(
      (
        await query(
          `SELECT id, author, rating, body, status, created_at FROM reviews ORDER BY created_at DESC LIMIT 200`,
        )
      ).rows,
    ),
  ),
);
router.patch(
  "/reviews/:id",
  authorize("branch-admin"),
  validate(z.object({ status: z.enum(["APPROVED", "REJECTED"]) })),
  asyncHandler(async (req, res) => {
    const { rowCount } = await query(
      "UPDATE reviews SET status = $1 WHERE id = $2",
      [req.body.status, req.params.id],
    );
    if (!rowCount) throw notFound();
    audit(req, "review.moderate", "review", req.params.id, {
      status: req.body.status,
    });
    res.json({ message: "Review updated" });
  }),
);
router.get(
  "/messages",
  authorize("branch-admin", "reception"),
  asyncHandler(async (_req, res) =>
    res.json(
      (
        await query(
          "SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 200",
        )
      ).rows,
    ),
  ),
);
router.patch(
  "/messages/:id",
  authorize("branch-admin", "reception"),
  validate(z.object({ status: z.enum(["READ", "REPLIED"]) })),
  asyncHandler(async (req, res) => {
    await query("UPDATE contact_messages SET status = $1 WHERE id = $2", [
      req.body.status,
      req.params.id,
    ]);
    res.json({ message: "Updated" });
  }),
);
router.get(
  "/applications",
  authorize("hr", "branch-admin"),
  asyncHandler(async (_req, res) =>
    res.json(
      (
        await query(
          `SELECT a.*, j.title AS job FROM job_applications a LEFT JOIN jobs j ON j.id = a.job_id ORDER BY a.created_at DESC LIMIT 200`,
        )
      ).rows,
    ),
  ),
);
router.patch(
  "/applications/:id",
  authorize("hr"),
  validate(z.object({ status: z.enum(["SHORTLISTED", "REJECTED", "HIRED"]) })),
  asyncHandler(async (req, res) => {
    await query("UPDATE job_applications SET status = $1 WHERE id = $2", [
      req.body.status,
      req.params.id,
    ]);
    audit(req, "hr.application", "job_application", req.params.id, {
      status: req.body.status,
    });
    res.json({ message: "Updated" });
  }),
);

// ======================= nurse: live bed board =======================
router.get(
  "/beds",
  authorize("nurse", "branch-admin"),
  asyncHandler(async (_req, res) =>
    res.json(
      (
        await query(
          `SELECT b.id, w.name AS ward, b.label, b.status FROM beds b JOIN wards w ON w.id = b.ward_id ORDER BY w.id, b.label`,
        )
      ).rows,
    ),
  ),
);
router.patch(
  "/beds/:id",
  authorize("nurse", "branch-admin"),
  validate(
    z.object({
      status: z.enum(["available", "occupied", "cleaning", "reserved"]),
    }),
  ),
  asyncHandler(async (req, res) => {
    const { rowCount } = await query(
      "UPDATE beds SET status = $1, updated_at = now() WHERE id = $2",
      [req.body.status, req.params.id],
    );
    if (!rowCount) throw notFound("Bed not found");
    req.app
      .get("io")
      ?.to("beds")
      .emit("beds:update", {
        id: Number(req.params.id),
        status: req.body.status,
      });
    audit(req, "bed.status", "bed", req.params.id, { to: req.body.status });
    res.json({ message: "Bed updated" });
  }),
);

// ======================= super-admin only =======================
const SA = authorize(); // empty list => only super-admin passes
router.get(
  "/users",
  SA,
  asyncHandler(async (_req, res) =>
    res.json(
      (
        await query(
          'SELECT id, name, email, role, branch_id AS "branchId", is_active AS "isActive", is_verified AS "isVerified", created_at FROM users ORDER BY created_at DESC LIMIT 500',
        )
      ).rows,
    ),
  ),
);
router.patch(
  "/users/:id",
  SA,
  validate(
    z.object({
      role: z
        .enum([
          "patient",
          "doctor",
          "nurse",
          "reception",
          "pharmacy",
          "laboratory",
          "hr",
          "finance",
          "ambulance",
          "branch-admin",
          "super-admin",
        ])
        .optional(),
      branchId: z.string().nullable().optional(),
      isActive: z.boolean().optional(),
    }),
  ),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user.id && req.body.isActive === false)
      throw new AppError(
        409,
        "You cannot deactivate your own account",
        "bad_state",
      );
    const b = req.body;
    const sets = [];
    const p = [];
    if (b.role !== undefined) {
      p.push(b.role);
      sets.push(`role = $${p.length}`);
    }
    if (b.branchId !== undefined) {
      p.push(b.branchId);
      sets.push(`branch_id = $${p.length}`);
    }
    if (b.isActive !== undefined) {
      p.push(b.isActive);
      sets.push(`is_active = $${p.length}`);
    }
    if (!sets.length)
      throw new AppError(422, "Nothing to update", "validation_error");
    p.push(req.params.id);
    const { rowCount } = await query(
      `UPDATE users SET ${sets.join(", ")} WHERE id = $${p.length}`,
      p,
    );
    if (!rowCount) throw notFound("User not found");
    if (b.isActive === false)
      await query(
        "UPDATE refresh_tokens SET revoked = true WHERE user_id = $1",
        [req.params.id],
      );
    audit(req, "admin.user_update", "user", req.params.id, b);
    res.json({ message: "User updated" });
  }),
);
router.get(
  "/audit-logs",
  SA,
  validate(
    z.object({
      limit: z.coerce.number().int().min(1).max(500).default(100),
      action: z.string().max(60).optional(),
    }),
    "query",
  ),
  asyncHandler(async (req, res) => {
    const p = [];
    let where = "";
    if (req.query.action) {
      p.push(`${req.query.action}%`);
      where = `WHERE a.action LIKE $${p.length}`;
    }
    p.push(req.query.limit);
    const { rows } = await query(
      `SELECT a.id, a.created_at AS date, u.name AS "user", a.action, a.entity, a.entity_id AS "entityId", a.ip
    FROM audit_logs a LEFT JOIN users u ON u.id = a.user_id ${where} ORDER BY a.id DESC LIMIT $${p.length}`,
      p,
    );
    res.json(rows);
  }),
);

// ======================= analytics dashboard =======================
router.get(
  "/analytics",
  authorize("branch-admin", "finance"),
  asyncHandler(async (_req, res) => {
    const today = colomboNow().date;
    const [kpi, perDay, topDepts, revenue] = await Promise.all([
      query(
        `SELECT (SELECT COUNT(*) FROM patients) AS patients,
                  (SELECT COUNT(*) FROM appointments WHERE appt_date = $1 AND status <> 'CANCELLED') AS "appointmentsToday",
                  (SELECT COUNT(*) FROM appointments WHERE status = 'NO_SHOW' AND appt_date >= $1::date - 30) AS "noShows30d",
                  (SELECT COALESCE(SUM(amount), 0) FROM invoices WHERE status = 'PAID' AND created_at >= date_trunc('month', NOW())) AS "revenueMonth",
                  (SELECT COUNT(*) FROM invoices WHERE status = 'UNPAID') AS "unpaidInvoices"`,
        [today],
      ),
      query(
        `SELECT to_char(appt_date, 'YYYY-MM-DD') AS date, COUNT(*) AS "count" FROM appointments
           WHERE status <> 'CANCELLED' AND appt_date >= $1::date - 6 GROUP BY appt_date ORDER BY appt_date`,
        [today],
      ),
      query(
        `SELECT dp.id AS dept, COUNT(*) AS "count" FROM appointments a JOIN doctors d ON d.id = a.doctor_id JOIN departments dp ON dp.id = d.dept_id
           WHERE a.appt_date >= $1::date - 30 AND a.status <> 'CANCELLED' GROUP BY dp.id ORDER BY COUNT(*) DESC LIMIT 5`,
        [today],
      ),
      query(`SELECT to_char(created_at AT TIME ZONE 'Asia/Colombo', 'YYYY-MM') AS month, SUM(amount) AS total FROM invoices
           WHERE status = 'PAID' AND created_at >= NOW() - INTERVAL '6 months' GROUP BY 1 ORDER BY 1`),
    ]);
    // fill days without appointments with 0 so the chart always has 7 points
    const have = Object.fromEntries(perDay.rows.map((r) => [r.date, r.count]));
    const appointmentsPerDay = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.parse(`${today}T00:00:00Z`) - i * 86400_000)
        .toISOString()
        .slice(0, 10);
      appointmentsPerDay.push({ date: d, count: have[d] || 0 });
    }
    res.json({
      ...kpi.rows[0],
      appointmentsPerDay,
      topDepartments: topDepts.rows,
      revenueByMonth: revenue.rows,
    });
  }),
);

module.exports = router;
