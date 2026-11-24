const cron = require('node-cron');
const { query } = require('../db');
const { sendMail } = require('../services/mailer');
const { generatePayroll } = require('../routes/hr');
const { colomboNow } = require('../routes/public');

const DAY = 86400_000;
const addDays = (dateStr, n) => new Date(Date.parse(`${dateStr}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);

/**
 * The scheduled jobs. They are plain async functions so that they can be started by
 *   - node-cron          (startJobs below: local development or a always-on server), or
 *   - Vercel Cron        (GET /api/cron/<name>, see routes/cron.js and vercel.json).
 * Every job is idempotent and does not depend on the exact minute it runs (Vercel Hobby only guarantees "within the hour").
 */
const jobs = {
  /** E-mail reminders for tomorrow's confirmed appointments (Sri Lanka date). */
  async reminders() {
    const tomorrow = addDays(colomboNow().date, 1);
    const { rows } = await query(`
      SELECT a.ref, a.appt_time AS t, d.name AS doctor, u.email, u.id AS uid
      FROM appointments a JOIN doctors d ON d.id = a.doctor_id JOIN patients p ON p.id = a.patient_id JOIN users u ON u.id = p.user_id
      WHERE a.status = 'CONFIRMED' AND a.appt_date = $1`, [tomorrow]);
    let sent = 0;
    for (const r of rows) {
      const ok = await sendMail({ to: r.email, userId: r.uid, subject: `Reminder: appointment ${r.ref} tomorrow`, text: `You have an appointment with ${r.doctor} tomorrow at ${r.t.slice(0, 5)}. Reference ${r.ref}.` });
      if (ok) sent++;
    }
    return { tomorrow, found: rows.length, sent };
  },

  /** Confirmed appointments of a past day that never checked in become NO_SHOW. */
  async noShow() {
    const r = await query(`UPDATE appointments SET status = 'NO_SHOW' WHERE status = 'CONFIRMED' AND appt_date < $1`, [colomboNow().date]);
    return { marked: r.rowCount };
  },

  /** Automatic salary run for the previous month (idempotent: existing rows are kept). */
  async payroll() {
    const [y, m] = colomboNow().date.split('-').map(Number);
    const month = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7); // previous month, calculated from the Sri Lanka date
    return generatePayroll(month);
  },

  /** Housekeeping of expired security records. */
  async cleanup() {
    const otp = await query(`DELETE FROM otp_codes WHERE expires_at < NOW() - INTERVAL '1 day'`);
    const rt = await query(`DELETE FROM refresh_tokens WHERE expires_at < NOW() OR (revoked = true AND created_at < NOW() - INTERVAL '30 days')`);
    return { otpDeleted: otp.rowCount, refreshTokensDeleted: rt.rowCount };
  },
};

const TZ = { timezone: 'Asia/Colombo' };
const safe = (name, fn) => async () => {
  try { console.log(`[cron:${name}]`, JSON.stringify(await fn())); } catch (e) { console.error(`[cron:${name}]`, e.message); }
};

/** Starts the in-process scheduler (only for an always-on Node server; on Vercel the schedules live in vercel.json). */
function startJobs() {
  cron.schedule('0 18 * * *', safe('reminders', jobs.reminders), TZ);   // 18:00 daily
  cron.schedule('30 0 * * *', safe('no-show', jobs.noShow), TZ);        // 00:30 daily (yesterday's missed bookings)
  cron.schedule('0 1 1 * *', safe('payroll', jobs.payroll), TZ);        // 01:00 on the 1st of every month
  cron.schedule('0 3 * * *', safe('cleanup', jobs.cleanup), TZ);        // 03:00 daily
  console.log('[cron] jobs scheduled (Asia/Colombo)');
}
module.exports = { jobs, startJobs };
