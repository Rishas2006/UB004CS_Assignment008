const router = require("express").Router();
const crypto = require("crypto");
const config = require("../config");
const { AppError, asyncHandler } = require("../utils");
const { jobs } = require("../jobs/cron");

/**
 * Vercel Cron entry points: GET /api/cron/<reminders|no-show|payroll|cleanup>  (schedules are in vercel.json).
 * Vercel sends "Authorization: Bearer <CRON_SECRET>"; everything else is rejected, and so is a missing CRON_SECRET.
 */
const NAMES = {
  reminders: jobs.reminders,
  "no-show": jobs.noShow,
  payroll: jobs.payroll,
  cleanup: jobs.cleanup,
};

function authorized(req) {
  if (!config.cronSecret) return false;
  const a = Buffer.from(req.headers.authorization || "");
  const b = Buffer.from(`Bearer ${config.cronSecret}`);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

router.get(
  "/:job",
  asyncHandler(async (req, res) => {
    if (!authorized(req))
      throw new AppError(401, "Unauthorized", "unauthenticated");
    const job = Object.hasOwn(NAMES, req.params.job)
      ? NAMES[req.params.job]
      : null;
    if (!job) throw new AppError(404, "Unknown job", "not_found");
    res.json({ job: req.params.job, ok: true, result: await job() });
  }),
);
module.exports = router;
