const crypto = require('crypto');

const md5 = (s) => crypto.createHash('md5').update(s).digest('hex').toUpperCase();
const fmt = (n) => Number(n).toFixed(2); // PayHere needs 2 decimals and no thousand separators

/** Hash sent with the checkout form so PayHere can trust amount/order. */
function checkoutHash({ merchantId, orderId, amount, currency = 'LKR', secret }) {
  return md5(`${merchantId}${orderId}${fmt(amount)}${currency}${md5(secret)}`);
}

/** Verifies the md5sig PayHere sends to notify_url. Use timingSafeEqual to avoid timing leaks. */
function verifyNotify(body, secret, merchantId) {
  const expected = md5(`${body.merchant_id}${body.order_id}${body.payhere_amount}${body.payhere_currency}${body.status_code}${md5(secret)}`);
  const got = String(body.md5sig || '').toUpperCase();
  if (body.merchant_id !== merchantId || got.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

const STATUS = { 2: 'SUCCESS', 0: 'PENDING', '-1': 'CANCELLED', '-2': 'FAILED', '-3': 'CHARGEBACK' };
const statusFromCode = (c) => STATUS[String(c)] || 'FAILED';

function checkoutUrl(sandbox = true) {
  return sandbox ? 'https://sandbox.payhere.lk/pay/checkout' : 'https://www.payhere.lk/pay/checkout';
}
module.exports = { md5, fmt, checkoutHash, verifyNotify, statusFromCode, checkoutUrl };
