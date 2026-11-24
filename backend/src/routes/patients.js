const router = require('express').Router();
const { z } = require('zod');
const config = require('../config');
const { query } = require('../db');
const { asyncHandler, validate, notFound } = require('../utils');
const { authenticate, authorize } = require('../middleware/auth');
const { audit } = require('../middleware/audit');
const { qrDataUrl } = require('../services/pdf');

// ---------- public emergency view for the QR health card (minimal data only) ----------
router.get('/health-card/:token', asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT u.name, p.mrn, p.blood_group AS "bloodGroup", p.allergies, p.emergency_contact AS "emergencyContact"
     FROM patients p JOIN users u ON u.id = p.user_id WHERE p.qr_token = $1 AND u.is_active`, [req.params.token]);
  if (!rows[0]) throw notFound('Health card not found');
  res.set('Cache-Control', 'no-store');
  res.json(rows[0]);
}));

// ---------- the logged-in patient ----------
router.use(authenticate);

router.get('/me', authorize('patient'), asyncHandler(async (req, res) => {
  const { rows } = await query(
    `SELECT u.name, u.email, u.phone, p.mrn, p.dob, p.gender, p.nic, p.address, p.blood_group AS "bloodGroup", p.allergies, p.emergency_contact AS "emergencyContact"
     FROM patients p JOIN users u ON u.id = p.user_id WHERE u.id = $1`, [req.user.id]);
  if (!rows[0]) throw notFound('Patient profile not found');
  res.json(rows[0]);
}));

router.put('/me', authorize('patient'), validate(z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().regex(/^\+?[0-9 ]{9,15}$/).optional(),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  nic: z.string().trim().max(20).optional(),
  address: z.string().trim().max(200).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  allergies: z.string().trim().max(300).optional(),
  emergencyContact: z.string().trim().max(120).optional(),
})), asyncHandler(async (req, res) => {
  const b = req.body;
  if (b.name || b.phone) await query('UPDATE users SET name = COALESCE($1,name), phone = COALESCE($2,phone) WHERE id = $3', [b.name, b.phone, req.user.id]);
  await query(
    `UPDATE patients SET dob = COALESCE($1,dob), gender = COALESCE($2,gender), nic = COALESCE($3,nic), address = COALESCE($4,address),
       blood_group = COALESCE($5,blood_group), allergies = COALESCE($6,allergies), emergency_contact = COALESCE($7,emergency_contact) WHERE user_id = $8`,
    [b.dob, b.gender, b.nic, b.address, b.bloodGroup, b.allergies, b.emergencyContact, req.user.id]);
  audit(req, 'patient.update_profile', 'user', req.user.id);
  res.json({ message: 'Profile updated' });
}));

router.get('/me/records', authorize('patient'), asyncHandler(async (req, res) => {
  const pid = (await query('SELECT id FROM patients WHERE user_id = $1', [req.user.id])).rows[0]?.id;
  const [rx, lab, inv] = await Promise.all([
    query(`SELECT r.id, r.ref, r.created_at AS date, d.name AS doctor
           FROM prescriptions r JOIN doctors d ON d.id = r.doctor_id WHERE r.patient_id = $1 ORDER BY r.created_at DESC LIMIT 50`, [pid]),
    query(`SELECT o.ref, t.name AS test, o.status, o.result_text AS result, o.created_at AS date FROM lab_orders o JOIN lab_tests t ON t.code = o.test_code WHERE o.patient_id = $1 ORDER BY o.created_at DESC LIMIT 50`, [pid]),
    query(`SELECT ref, description, amount, status, created_at AS date FROM invoices WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 50`, [pid]),
  ]);
  // medicines of each prescription (one extra query, grouped here in JS)
  if (rx.rows.length) {
    const ids = rx.rows.map((r) => r.id);
    const items = (await query(
      `SELECT prescription_id, drug, dose, frequency, days FROM prescription_items WHERE prescription_id IN (${ids.map((_, i) => `$${i + 1}`).join(',')}) ORDER BY id`, ids)).rows;
    for (const r of rx.rows) { r.items = items.filter((i) => i.prescription_id === r.id).map(({ drug, dose, frequency, days }) => ({ drug, dose, frequency, days })); delete r.id; }
  }
  res.json({ prescriptions: rx.rows, labReports: lab.rows, invoices: inv.rows });
}));

router.get('/me/health-card', authorize('patient'), asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT u.name, p.mrn, p.qr_token FROM patients p JOIN users u ON u.id = p.user_id WHERE u.id = $1', [req.user.id]);
  if (!rows[0]) throw notFound('Patient profile not found');
  const verifyUrl = `${config.frontendUrl}/health-card?t=${rows[0].qr_token}`;
  res.json({ name: rows[0].name, mrn: rows[0].mrn, verifyUrl, qr: await qrDataUrl(verifyUrl) });
}));

// ---------- staff patient search ----------
router.get('/', authorize('reception', 'doctor', 'nurse', 'branch-admin', 'pharmacy', 'laboratory'),
  validate(z.object({ q: z.string().trim().min(2).max(60) }), 'query'), asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT p.id, p.mrn, u.name, u.phone, p.dob, p.blood_group AS "bloodGroup" FROM patients p JOIN users u ON u.id = p.user_id
       WHERE u.name ILIKE $1 OR p.mrn ILIKE $1 OR u.phone ILIKE $1 ORDER BY u.name LIMIT 25`, [`%${req.query.q}%`]);
    audit(req, 'patient.search', 'patient', null, { q: req.query.q });
    res.json(rows);
  }));

module.exports = router;
