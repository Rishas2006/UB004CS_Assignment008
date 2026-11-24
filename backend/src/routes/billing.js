const router = require('express').Router();
const express = require('express');
const crypto = require('crypto');
const { z } = require('zod');
const config = require('../config');
const { query, tx, uuid } = require('../db');
const { AppError, asyncHandler, validate, notFound, forbidden, makeRef } = require('../utils');
const { authenticate, authorize } = require('../middleware/auth');
const { audit } = require('../middleware/audit');
const { checkoutHash, verifyNotify, statusFromCode, checkoutUrl, fmt } = require('../services/payhere');

// ---------- PayHere server-to-server notification (PUBLIC, authenticated by md5sig) ----------
router.post('/payhere/notify', express.urlencoded({ extended: false }), asyncHandler(async (req, res) => {
  const b = req.body;
  if (!verifyNotify(b, config.payhere.merchantSecret, config.payhere.merchantId)) {
    console.warn('[payhere] invalid signature for order', b.order_id);
    return res.status(400).send('invalid signature');
  }
  const status = statusFromCode(b.status_code);
  await tx(async (c) => {
    const pay = (await c.query('SELECT * FROM payments WHERE order_id = $1 FOR UPDATE', [b.order_id])).rows[0];
    if (!pay) throw new AppError(404, 'Unknown order', 'not_found');
    if (Number(b.payhere_amount) !== Number(pay.amount) || b.payhere_currency !== pay.currency) throw new AppError(400, 'Amount mismatch', 'amount_mismatch');
    if (pay.status === 'SUCCESS') return; // idempotent: PayHere may retry
    await c.query('UPDATE payments SET status = $1, status_code = $2, gateway_payment_id = $3, raw = $4 WHERE id = $5', [status, Number(b.status_code), b.payment_id || null, JSON.stringify(b), pay.id]);
    if (status === 'SUCCESS') await c.query(`UPDATE invoices SET status = 'PAID' WHERE id = $1`, [pay.invoice_id]);
    if (status === 'FAILED' || status === 'CANCELLED') await c.query(`UPDATE invoices SET status = 'UNPAID' WHERE id = $1 AND status <> 'PAID'`, [pay.invoice_id]);
    if (status === 'CHARGEBACK') await c.query(`UPDATE invoices SET status = 'REFUNDED' WHERE id = $1`, [pay.invoice_id]);
  });
  res.send('OK');
}));

router.use(authenticate);

// ---------- invoices ----------
router.get('/invoices/mine', authorize('patient'), asyncHandler(async (req, res) => {
  const { rows } = await query(`SELECT i.id, i.ref, i.description, i.amount, i.status, i.created_at AS date FROM invoices i JOIN patients p ON p.id = i.patient_id WHERE p.user_id = $1 ORDER BY i.created_at DESC`, [req.user.id]);
  res.json(rows);
}));

router.get('/invoices', authorize('finance', 'reception', 'branch-admin'), asyncHandler(async (_req, res) => {
  const { rows } = await query(`SELECT i.id, i.ref, u.name AS patient, i.description, i.amount, i.status, i.created_at AS date FROM invoices i JOIN patients p ON p.id = i.patient_id JOIN users u ON u.id = p.user_id ORDER BY i.created_at DESC LIMIT 200`);
  res.json(rows);
}));

router.post('/invoices', authorize('finance', 'reception'), validate(z.object({
  patientId: z.string().uuid(), description: z.string().trim().min(3).max(200), amount: z.number().positive().max(10_000_000),
})), asyncHandler(async (req, res) => {
  const id = uuid(); const ref = makeRef('INV');
  await query('INSERT INTO invoices (id, ref, patient_id, description, amount) VALUES ($1,$2,$3,$4,$5)', [id, ref, req.body.patientId, req.body.description, req.body.amount]);
  audit(req, 'invoice.create', 'invoice', id);
  res.status(201).json({ id, ref });
}));

/** Cash / card-at-counter payment recorded by staff */
router.post('/invoices/:id/mark-paid', authorize('finance', 'reception'), asyncHandler(async (req, res) => {
  const { rowCount } = await query(`UPDATE invoices SET status = 'PAID' WHERE id = $1 AND status = 'UNPAID'`, [req.params.id]);
  if (!rowCount) throw new AppError(409, 'Invoice not found or already settled', 'bad_state');
  audit(req, 'invoice.mark_paid', 'invoice', req.params.id);
  res.json({ message: 'Invoice marked as paid' });
}));

// ---------- start an online payment (returns the fields for the PayHere checkout form) ----------
router.post('/invoices/:id/pay', authorize('patient'), asyncHandler(async (req, res) => {
  if (!config.payhere.merchantId || !config.payhere.merchantSecret) throw new AppError(503, 'Online payments are not configured', 'payments_off');
  // PayHere must be able to call notify_url from the internet; localhost can never receive it
  if (!/^https:\/\//.test(config.publicApiUrl)) throw new AppError(503, 'PUBLIC_API_URL must be a public https address so PayHere can confirm the payment', 'payments_off');
  const { rows } = await query(`SELECT i.*, u.name, u.email, u.phone, p.address FROM invoices i JOIN patients p ON p.id = i.patient_id JOIN users u ON u.id = p.user_id WHERE i.id = $1 AND u.id = $2`, [req.params.id, req.user.id]);
  const inv = rows[0];
  if (!inv) throw notFound('Invoice not found');
  if (inv.status !== 'UNPAID') throw new AppError(409, 'This invoice is not payable', 'bad_state');
  const orderId = `${inv.ref}-${crypto.randomBytes(3).toString('hex')}`;
  await query('INSERT INTO payments (id, invoice_id, order_id, amount) VALUES ($1,$2,$3,$4)', [uuid(), inv.id, orderId, inv.amount]);
  const [first, ...rest] = inv.name.split(' ');
  res.json({
    action: checkoutUrl(config.payhere.sandbox), method: 'POST',
    fields: {
      merchant_id: config.payhere.merchantId,
      return_url: `${config.frontendUrl}/portal/patient?paid=1`, cancel_url: `${config.frontendUrl}/portal/patient?paid=0`,
      notify_url: `${config.publicApiUrl}/api/v1/billing/payhere/notify`,
      order_id: orderId, items: inv.description, currency: 'LKR', amount: fmt(inv.amount),
      first_name: first, last_name: rest.join(' ') || '-', email: inv.email, phone: inv.phone || '0000000000',
      address: inv.address || 'Sri Lanka', city: 'Colombo', country: 'Sri Lanka',
      hash: checkoutHash({ merchantId: config.payhere.merchantId, orderId, amount: inv.amount, currency: 'LKR', secret: config.payhere.merchantSecret }),
    },
  });
}));

router.get('/payments', authorize('finance', 'branch-admin'), asyncHandler(async (_req, res) => {
  const { rows } = await query(`SELECT pay.order_id AS "orderId", i.ref AS invoice, pay.amount, pay.status, pay.gateway_payment_id AS "gatewayId", pay.created_at AS date FROM payments pay JOIN invoices i ON i.id = pay.invoice_id ORDER BY pay.created_at DESC LIMIT 200`);
  res.json(rows);
}));

module.exports = router;
