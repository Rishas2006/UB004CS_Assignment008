const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { z } = require('zod');
const { query, tx, uuid } = require('../db');
const { AppError, asyncHandler, validate, notFound, ymNow, defer } = require('../utils');
const { authenticate, authorize } = require('../middleware/auth');
const { audit } = require('../middleware/audit');
const { computePayroll } = require('../services/payroll');
const { sendMail } = require('../services/mailer');

router.use(authenticate);
const HR = authorize('hr', 'branch-admin');
const ym = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Use YYYY-MM');

/** Generates payroll rows for a month (idempotent: existing rows are kept). Also used by the monthly cron job. */
async function generatePayroll(month) {
  const [y, m] = month.split('-').map(Number);
  const first = `${month}-01`; const last = new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
  const staff = (await query('SELECT s.* FROM staff s JOIN users u ON u.id = s.user_id WHERE u.is_active')).rows;
  let created = 0;
  for (const s of staff) {
    await tx(async (c) => {
      const exists = await c.query('SELECT 1 FROM payroll WHERE staff_id = $1 AND month = $2', [s.id, month]);
      if (exists.rowCount) return;
      // unpaid leave days that fall inside the month
      const ul = await c.query(`SELECT COALESCE(SUM(LEAST(to_date, $3::date) - GREATEST(from_date, $2::date) + 1), 0) AS days
        FROM leaves WHERE staff_id = $1 AND type = 'unpaid' AND status = 'APPROVED' AND from_date <= $3::date AND to_date >= $2::date`, [s.id, first, last]);
      const adv = await c.query(`SELECT COALESCE(SUM(amount), 0) AS total FROM advances WHERE staff_id = $1 AND deduct_month = $2 AND status = 'APPROVED'`, [s.id, month]);
      const p = computePayroll(s, { unpaidDays: ul.rows[0].days, advances: adv.rows[0].total });
      await c.query(`INSERT INTO payroll (staff_id, month, basic, allowances, epf_employee, epf_employer, etf_employer, unpaid_leave_deduction, advance_deduction, net)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [s.id, month, p.basic, p.allowances, p.epfEmployee, p.epfEmployer, p.etfEmployer, p.unpaidLeaveDeduction, p.advanceDeduction, p.net]);
      await c.query(`UPDATE advances SET status = 'DEDUCTED' WHERE staff_id = $1 AND deduct_month = $2 AND status = 'APPROVED'`, [s.id, month]);
      created++;
    });
  }
  return { month, created, total: staff.length };
}

const myStaffId = async (userId) => (await query('SELECT id FROM staff WHERE user_id = $1', [userId])).rows[0]?.id;

// ---------- staff directory CRUD ----------
router.get('/staff', HR, asyncHandler(async (_req, res) => {
  const { rows } = await query(`SELECT s.id, u.name, u.email, u.phone, u.role, u.is_active AS "isActive", s.branch_id AS branch, s.job_title AS "jobTitle", s.basic_salary AS "basicSalary", s.allowances, s.join_date AS "joinDate"
    FROM staff s JOIN users u ON u.id = s.user_id ORDER BY u.name`);
  res.json(rows);
}));

router.post('/staff', HR, validate(z.object({
  name: z.string().trim().min(2).max(80), email: z.string().trim().toLowerCase().email(), phone: z.string().trim().max(20).optional(),
  role: z.enum(['doctor', 'nurse', 'reception', 'pharmacy', 'laboratory', 'hr', 'finance', 'ambulance', 'branch-admin']),
  branchId: z.string().min(2), jobTitle: z.string().trim().min(2).max(80), basicSalary: z.number().positive(), allowances: z.number().min(0).default(0),
})), asyncHandler(async (req, res) => {
  const b = req.body; const temp = `Rh@${crypto.randomBytes(5).toString('hex')}`;
  const out = await tx(async (c) => {
    const userId = uuid();
    await c.query(`INSERT INTO users (id, name, email, phone, password_hash, role, branch_id, is_verified) VALUES ($1,$2,$3,$4,$5,$6,$7,true)`, [userId, b.name, b.email, b.phone || null, await bcrypt.hash(temp, 12), b.role, b.branchId]);
    const s = await c.query('INSERT INTO staff (user_id, branch_id, job_title, basic_salary, allowances) VALUES ($1,$2,$3,$4,$5) RETURNING id', [userId, b.branchId, b.jobTitle, b.basicSalary, b.allowances]);
    return { userId, staffId: s.rows[0].id };
  });
  defer(req, sendMail({ to: b.email, userId: out.userId, subject: 'Your RH Hospital staff account', text: `Welcome ${b.name}. Temporary password: ${temp}\nPlease change it after your first login.` }));
  audit(req, 'hr.staff_create', 'staff', out.staffId);
  res.status(201).json({ ...out, message: 'Staff created. A temporary password was emailed.' });
}));

router.put('/staff/:id', HR, validate(z.object({
  jobTitle: z.string().trim().min(2).max(80).optional(), basicSalary: z.number().positive().optional(), allowances: z.number().min(0).optional(), branchId: z.string().optional(),
})), asyncHandler(async (req, res) => {
  const b = req.body;
  const { rowCount } = await query('UPDATE staff SET job_title = COALESCE($1,job_title), basic_salary = COALESCE($2,basic_salary), allowances = COALESCE($3,allowances), branch_id = COALESCE($4,branch_id) WHERE id = $5', [b.jobTitle, b.basicSalary, b.allowances, b.branchId, req.params.id]);
  if (!rowCount) throw notFound('Staff not found');
  audit(req, 'hr.staff_update', 'staff', req.params.id);
  res.json({ message: 'Updated' });
}));

router.delete('/staff/:id', HR, asyncHandler(async (req, res) => { // soft delete: keeps payroll history
  const { rowCount } = await query('UPDATE users SET is_active = false WHERE id = (SELECT user_id FROM staff WHERE id = $1)', [req.params.id]);
  if (!rowCount) throw notFound('Staff not found');
  await query('UPDATE refresh_tokens SET revoked = true WHERE user_id = (SELECT user_id FROM staff WHERE id = $1)', [req.params.id]);
  audit(req, 'hr.staff_deactivate', 'staff', req.params.id);
  res.status(204).end();
}));

// ---------- leaves (any staff member applies; HR decides) ----------
router.post('/leaves', validate(z.object({
  type: z.enum(['annual', 'sick', 'casual', 'unpaid']), fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), reason: z.string().trim().max(300).optional(),
}).refine((v) => v.toDate >= v.fromDate, { message: 'toDate must be on or after fromDate', path: ['toDate'] })), asyncHandler(async (req, res) => {
  const sid = await myStaffId(req.user.id);
  if (!sid) throw new AppError(403, 'Only staff can apply for leave', 'forbidden');
  const r = await query('INSERT INTO leaves (staff_id, type, from_date, to_date, reason) VALUES ($1,$2,$3,$4,$5) RETURNING id', [sid, req.body.type, req.body.fromDate, req.body.toDate, req.body.reason || null]);
  res.status(201).json({ id: r.rows[0].id });
}));
router.get('/leaves', asyncHandler(async (req, res) => {
  const mine = !['hr', 'branch-admin', 'super-admin'].includes(req.user.role);
  const { rows } = await query(`SELECT l.id, u.name, l.type, l.from_date AS "fromDate", l.to_date AS "toDate", l.reason, l.status FROM leaves l JOIN staff s ON s.id = l.staff_id JOIN users u ON u.id = s.user_id
    ${mine ? 'WHERE s.user_id = $1' : ''} ORDER BY l.created_at DESC LIMIT 200`, mine ? [req.user.id] : []);
  res.json(rows);
}));
router.patch('/leaves/:id', HR, validate(z.object({ status: z.enum(['APPROVED', 'REJECTED']) })), asyncHandler(async (req, res) => {
  const { rowCount } = await query(`UPDATE leaves SET status = $1, decided_by = $2 WHERE id = $3 AND status = 'PENDING'`, [req.body.status, req.user.id, req.params.id]);
  if (!rowCount) throw new AppError(409, 'Leave not found or already decided', 'bad_state');
  audit(req, 'hr.leave_decision', 'leave', req.params.id, { status: req.body.status });
  res.json({ message: 'Leave updated' });
}));

// ---------- salary advances ----------
router.post('/advances', validate(z.object({ amount: z.number().positive().max(1_000_000), reason: z.string().trim().max(300).optional(), deductMonth: ym })), asyncHandler(async (req, res) => {
  const sid = await myStaffId(req.user.id);
  if (!sid) throw new AppError(403, 'Only staff can request advances', 'forbidden');
  const r = await query('INSERT INTO advances (staff_id, amount, reason, deduct_month) VALUES ($1,$2,$3,$4) RETURNING id', [sid, req.body.amount, req.body.reason || null, req.body.deductMonth]);
  res.status(201).json({ id: r.rows[0].id });
}));
router.get('/advances', HR, asyncHandler(async (_req, res) => {
  const { rows } = await query(`SELECT a.id, u.name, a.amount, a.reason, a.deduct_month AS "deductMonth", a.status FROM advances a JOIN staff s ON s.id = a.staff_id JOIN users u ON u.id = s.user_id ORDER BY a.created_at DESC LIMIT 200`);
  res.json(rows);
}));
router.patch('/advances/:id', HR, validate(z.object({ status: z.enum(['APPROVED', 'REJECTED']) })), asyncHandler(async (req, res) => {
  const { rowCount } = await query(`UPDATE advances SET status = $1 WHERE id = $2 AND status = 'PENDING'`, [req.body.status, req.params.id]);
  if (!rowCount) throw new AppError(409, 'Advance not found or already decided', 'bad_state');
  audit(req, 'hr.advance_decision', 'advance', req.params.id, { status: req.body.status });
  res.json({ message: 'Advance updated' });
}));

// ---------- payroll ----------
router.post('/payroll/generate', HR, validate(z.object({ month: ym.default(ymNow()) })), asyncHandler(async (req, res) => {
  const out = await generatePayroll(req.body.month);
  audit(req, 'hr.payroll_generate', 'payroll', req.body.month, out);
  res.status(201).json(out);
}));
router.get('/payroll', authorize('hr', 'finance', 'branch-admin'), validate(z.object({ month: ym.optional() }), 'query'), asyncHandler(async (req, res) => {
  const { rows } = await query(`SELECT p.id, u.name, s.job_title AS "jobTitle", p.month, p.basic, p.allowances, p.epf_employee AS "epfEmployee", p.unpaid_leave_deduction AS "unpaidLeave",
      p.advance_deduction AS advances, p.net, p.status FROM payroll p JOIN staff s ON s.id = p.staff_id JOIN users u ON u.id = s.user_id
    WHERE p.month = COALESCE($1, p.month) ORDER BY p.month DESC, u.name LIMIT 500`, [req.query.month || null]);
  res.json(rows);
}));
router.patch('/payroll/:id/paid', authorize('finance', 'hr'), asyncHandler(async (req, res) => {
  const { rowCount } = await query(`UPDATE payroll SET status = 'PAID' WHERE id = $1 AND status = 'GENERATED'`, [req.params.id]);
  if (!rowCount) throw new AppError(409, 'Payroll not found or already paid', 'bad_state');
  audit(req, 'finance.payroll_paid', 'payroll', req.params.id);
  res.json({ message: 'Marked as paid' });
}));

module.exports = router;
module.exports.generatePayroll = generatePayroll;
