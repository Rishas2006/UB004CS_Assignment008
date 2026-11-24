const router = require("express").Router();
const { query } = require("../db");
const { asyncHandler } = require("../utils");
const { colomboNow } = require("./public");

/** GET /queue/:branch - public live token display (queue-display page) */
router.get(
  "/:branch",
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `
    SELECT a.token_no AS "tokenNo", a.status, d.name AS doctor, d.id AS "doctorId"
    FROM appointments a JOIN doctors d ON d.id = a.doctor_id
    WHERE a.branch_id = $1 AND a.appt_date = $2 AND a.status IN ('CHECKED_IN','IN_CONSULT') AND a.token_no IS NOT NULL
    ORDER BY d.name, a.token_no`,
      [req.params.branch, colomboNow().date],
    );
    const byDoctor = {};
    for (const r of rows) {
      const g = (byDoctor[r.doctorId] ||= {
        doctor: r.doctor,
        serving: null,
        waiting: [],
      });
      if (r.status === "IN_CONSULT") g.serving = r.tokenNo;
      else g.waiting.push(r.tokenNo);
    }
    res.set("Cache-Control", "no-store");
    res.json(Object.values(byDoctor));
  }),
);
module.exports = router;
