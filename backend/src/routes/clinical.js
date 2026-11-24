const router = require('express').Router();
const { z } = require('zod');
const { query, tx, uuid } = require('../db');
const { AppError, asyncHandler, validate, notFound, forbidden, makeRef } = require('../utils');
const { authenticate, authorize } = require('../middleware/auth');
const { audit } = require('../middleware/audit');
const { prescriptionPdf } = require('../services/pdf');

router.use(authenticate);

// ---------- prescriptions ----------
router.post('/prescriptions', authorize('doctor'), validate(z.object({
  patientId: z.string().uuid(), appointmentId: z.string().uuid().optional(), notes: z.string().trim().max(1000).optional(),
  items: z.array(z.object({
    drug: z.string().trim().min(2).max(100), dose: z.string().trim().min(1).max(50),
    frequency: z.string().trim().min(1).max(50), days: z.number().int().min(1).max(365),
  })).min(1).max(20),
})), asyncHandler(async (req, res) => {
  const doc = (await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id])).rows[0];
  if (!doc) throw forbidden('Only doctors with a linked doctor profile can write prescriptions');
  const b = req.body;
  const out = await tx(async (c) => {
    const id = uuid(); const ref = makeRef('P', 5);
    await c.query('INSERT INTO prescriptions (id, ref, appointment_id, patient_id, doctor_id, notes) VALUES ($1,$2,$3,$4,$5,$6)',
      [id, ref, b.appointmentId || null, b.patientId, doc.id, b.notes || null]);
    for (const i of b.items) await c.query('INSERT INTO prescription_items (prescription_id, drug, dose, frequency, days) VALUES ($1,$2,$3,$4,$5)', [id, i.drug, i.dose, i.frequency, i.days]);
    return { id, ref };
  });
  audit(req, 'prescription.create', 'prescription', out.id);
  res.status(201).json(out);
}));

/** Recent prescriptions: a doctor sees their own, pharmacy / admins see all. */
router.get('/prescriptions', authorize('doctor', 'pharmacy', 'branch-admin'), asyncHandler(async (req, res) => {
  const own = req.user.role === 'doctor';
  const { rows } = await query(`
    SELECT r.id, r.ref, r.created_at AS date, u.name AS patient, d.name AS doctor
    FROM prescriptions r JOIN patients p ON p.id = r.patient_id JOIN users u ON u.id = p.user_id JOIN doctors d ON d.id = r.doctor_id
    ${own ? 'WHERE d.user_id = $1' : ''} ORDER BY r.created_at DESC LIMIT 50`, own ? [req.user.id] : []);
  if (rows.length) {
    const ids = rows.map((r) => r.id);
    const items = (await query(`SELECT prescription_id, drug, dose FROM prescription_items WHERE prescription_id IN (${ids.map((_, i) => `$${i + 1}`).join(',')}) ORDER BY id`, ids)).rows;
    for (const r of rows) { r.medicines = items.filter((i) => i.prescription_id === r.id).map((i) => `${i.drug} ${i.dose}`).join(', '); delete r.id; }
  }
  res.json(rows);
}));

router.get('/prescriptions/:ref/pdf', asyncHandler(async (req, res) => {
  const { rows } = await query(`
    SELECT r.id, r.ref, r.notes, r.created_at, u.name AS patient_name, p.mrn, p.user_id AS patient_user, d.name AS doctor_name, d.slmc_no, d.user_id AS doctor_user
    FROM prescriptions r JOIN patients p ON p.id = r.patient_id JOIN users u ON u.id = p.user_id JOIN doctors d ON d.id = r.doctor_id WHERE r.ref = $1`, [req.params.ref]);
  const rx = rows[0];
  if (!rx) throw notFound('Prescription not found');
  const allowed = rx.patient_user === req.user.id || rx.doctor_user === req.user.id || ['pharmacy', 'super-admin', 'branch-admin'].includes(req.user.role);
  if (!allowed) throw forbidden();
  rx.items = (await query('SELECT drug, dose, frequency, days FROM prescription_items WHERE prescription_id = $1 ORDER BY id', [rx.id])).rows;
  audit(req, 'prescription.pdf', 'prescription', rx.id);
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `inline; filename="${rx.ref}.pdf"` });
  prescriptionPdf(res, rx);
}));

// ---------- laboratory ----------
router.post('/lab/orders', authorize('doctor', 'nurse'), validate(z.object({ patientId: z.string().uuid(), testCode: z.string().min(2) })),
  asyncHandler(async (req, res) => {
    const doc = (await query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id])).rows[0];
    const id = uuid(); const ref = makeRef('L', 5);
    await query('INSERT INTO lab_orders (id, ref, patient_id, test_code, ordered_by) VALUES ($1,$2,$3,$4,$5)', [id, ref, req.body.patientId, req.body.testCode, doc?.id || null]);
    audit(req, 'lab.order', 'lab_order', id);
    res.status(201).json({ id, ref });
  }));

router.get('/lab/orders', authorize('laboratory', 'doctor', 'nurse', 'branch-admin'), asyncHandler(async (req, res) => {
  const { rows } = await query(`
    SELECT o.id, o.ref, t.name AS test, o.status, u.name AS patient, o.created_at AS date, o.result_text AS result
    FROM lab_orders o JOIN lab_tests t ON t.code = o.test_code JOIN patients p ON p.id = o.patient_id JOIN users u ON u.id = p.user_id
    ORDER BY o.created_at DESC LIMIT 100`);
  res.json(rows);
}));

const FLOW = { ORDERED: ['SAMPLE_COLLECTED', 'CANCELLED'], SAMPLE_COLLECTED: ['PROCESSING'], PROCESSING: ['COMPLETED'] };
router.patch('/lab/orders/:id', authorize('laboratory'), validate(z.object({
  status: z.enum(['SAMPLE_COLLECTED', 'PROCESSING', 'COMPLETED', 'CANCELLED']), resultText: z.string().trim().max(2000).optional(),
})), asyncHandler(async (req, res) => {
  const o = (await query('SELECT status FROM lab_orders WHERE id = $1', [req.params.id])).rows[0];
  if (!o) throw notFound('Lab order not found');
  if (!(FLOW[o.status] || []).includes(req.body.status)) throw new AppError(409, `Cannot move ${o.status} to ${req.body.status}`, 'bad_state');
  if (req.body.status === 'COMPLETED' && !req.body.resultText) throw new AppError(422, 'Result text is required to complete an order', 'validation_error');
  await query('UPDATE lab_orders SET status = $1, result_text = COALESCE($2, result_text), resulted_at = $3 WHERE id = $4',
    [req.body.status, req.body.resultText, req.body.status === 'COMPLETED' ? new Date().toISOString() : null, req.params.id]);
  audit(req, 'lab.update', 'lab_order', req.params.id, { to: req.body.status });
  res.json({ message: 'Lab order updated' });
}));

module.exports = router;
