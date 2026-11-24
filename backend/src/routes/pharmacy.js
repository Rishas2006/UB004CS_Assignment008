const router = require('express').Router();
const { z } = require('zod');
const { query, uuid } = require('../db');
const { AppError, asyncHandler, validate, notFound, makeRef } = require('../utils');
const { authenticate, optionalAuth, authorize } = require('../middleware/auth');
const { audit } = require('../middleware/audit');

const STAGES = ['RECEIVED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED'];

// ---------- public / patient ----------
router.post('/orders', optionalAuth, validate(z.object({
  prescriptionRef: z.string().trim().min(3).max(20), mode: z.enum(['pickup', 'delivery']),
  address: z.string().trim().max(250).optional(),
}).refine((v) => v.mode === 'pickup' || !!v.address, { message: 'Address is required for delivery', path: ['address'] })),
  asyncHandler(async (req, res) => {
    const rx = (await query('SELECT r.ref, p.user_id FROM prescriptions r JOIN patients p ON p.id = r.patient_id WHERE r.ref = $1', [req.body.prescriptionRef])).rows[0];
    if (!rx) throw new AppError(404, 'Prescription number not found', 'rx_not_found');
    if (req.user?.role === 'patient' && rx.user_id !== req.user.id) throw new AppError(403, 'This prescription belongs to another patient', 'forbidden');
    const pid = (await query('SELECT id FROM patients WHERE user_id = $1', [rx.user_id])).rows[0].id;
    const ref = makeRef('PH', 5);
    await query(
      `INSERT INTO pharmacy_orders (id, ref, patient_id, prescription_ref, mode, address) VALUES ($1,$2,$3,$4,$5,$6)`,
      [uuid(), ref, pid, rx.ref, req.body.mode, req.body.address || null]);
    res.status(201).json({ ref, status: 'RECEIVED' });
  }));

/** Public tracking by order reference. Returns only the stage (no personal data). */
router.get('/orders/track/:ref', asyncHandler(async (req, res) => {
  const { rows } = await query('SELECT ref, mode, status, created_at AS "createdAt" FROM pharmacy_orders WHERE ref = $1', [req.params.ref]);
  if (!rows[0]) throw notFound('Order not found');
  res.json({ ...rows[0], stage: STAGES.indexOf(rows[0].status) });
}));

// ---------- pharmacy staff ----------
router.use(authenticate, authorize('pharmacy', 'branch-admin'));

router.get('/orders', asyncHandler(async (_req, res) => {
  const { rows } = await query(`SELECT o.id, o.ref, o.prescription_ref AS "prescriptionRef", o.mode, o.status, o.address, u.name AS patient, o.created_at AS date
    FROM pharmacy_orders o LEFT JOIN patients p ON p.id = o.patient_id LEFT JOIN users u ON u.id = p.user_id ORDER BY o.created_at DESC LIMIT 200`);
  res.json(rows);
}));

router.patch('/orders/:id/status', validate(z.object({ status: z.enum(STAGES.concat('CANCELLED')) })), asyncHandler(async (req, res) => {
  const o = (await query('SELECT status, mode FROM pharmacy_orders WHERE id = $1', [req.params.id])).rows[0];
  if (!o) throw notFound('Order not found');
  const cur = STAGES.indexOf(o.status); const next = STAGES.indexOf(req.body.status);
  const ok = req.body.status === 'CANCELLED' ? cur < 3 : next === cur + 1 || (o.mode === 'pickup' && o.status === 'READY' && req.body.status === 'DELIVERED');
  if (!ok) throw new AppError(409, `Cannot move ${o.status} to ${req.body.status}`, 'bad_state');
  await query('UPDATE pharmacy_orders SET status = $1 WHERE id = $2', [req.body.status, req.params.id]);
  audit(req, 'pharmacy.order_status', 'pharmacy_order', req.params.id, { to: req.body.status });
  res.json({ message: 'Order updated', status: req.body.status });
}));

// ---------- stock CRUD ----------
const item = z.object({
  sku: z.string().trim().min(2).max(30), name: z.string().trim().min(2).max(100),
  stock: z.number().int().min(0), reorderLevel: z.number().int().min(0).default(20),
  price: z.number().min(0), expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});
const sel = 'id, sku, name, stock, reorder_level AS "reorderLevel", price, expiry';
const getItem = async (id) => (await query(`SELECT ${sel} FROM pharmacy_items WHERE id = $1`, [id])).rows[0];

router.get('/items', asyncHandler(async (req, res) => {
  const low = req.query.low === 'true';
  res.json((await query(`SELECT ${sel} FROM pharmacy_items ${low ? 'WHERE stock <= reorder_level' : ''} ORDER BY name`)).rows);
}));
router.post('/items', validate(item), asyncHandler(async (req, res) => {
  const b = req.body;
  const r = await query('INSERT INTO pharmacy_items (sku, name, stock, reorder_level, price, expiry) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id', [b.sku, b.name, b.stock, b.reorderLevel, b.price, b.expiry || null]);
  audit(req, 'pharmacy.item_create', 'pharmacy_item', r.rows[0].id);
  res.status(201).json(await getItem(r.rows[0].id));
}));
router.put('/items/:id', validate(item), asyncHandler(async (req, res) => {
  const b = req.body;
  const r = await query('UPDATE pharmacy_items SET sku=$1, name=$2, stock=$3, reorder_level=$4, price=$5, expiry=$6 WHERE id=$7', [b.sku, b.name, b.stock, b.reorderLevel, b.price, b.expiry || null, req.params.id]);
  if (!r.rowCount) throw notFound('Item not found');
  audit(req, 'pharmacy.item_update', 'pharmacy_item', req.params.id);
  res.json(await getItem(req.params.id));
}));
router.patch('/items/:id/adjust', validate(z.object({ delta: z.number().int().min(-100000).max(100000) })), asyncHandler(async (req, res) => {
  const r = await query('UPDATE pharmacy_items SET stock = stock + $1 WHERE id = $2 AND stock + $1 >= 0', [req.body.delta, req.params.id]);
  if (!r.rowCount) throw new AppError(409, 'Item not found or stock would go negative', 'bad_state');
  audit(req, 'pharmacy.stock_adjust', 'pharmacy_item', req.params.id, { delta: req.body.delta });
  res.json(await getItem(req.params.id));
}));
router.delete('/items/:id', asyncHandler(async (req, res) => {
  const { rowCount } = await query('DELETE FROM pharmacy_items WHERE id = $1', [req.params.id]);
  if (!rowCount) throw notFound('Item not found');
  audit(req, 'pharmacy.item_delete', 'pharmacy_item', req.params.id);
  res.status(204).end();
}));

module.exports = router;
