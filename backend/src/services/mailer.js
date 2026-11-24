const nodemailer = require('nodemailer');
const config = require('../config');
const { query } = require('../db');

let transporter = null;
if (config.mail.host) {
  transporter = nodemailer.createTransport({
    host: config.mail.host, port: config.mail.port, secure: config.mail.port === 465,
    auth: config.mail.user ? { user: config.mail.user, pass: config.mail.pass } : undefined,
    connectionTimeout: 10_000, greetingTimeout: 10_000, socketTimeout: 20_000, // a serverless function must never hang on SMTP
  });
}

const escapeHtml = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
/** Simple branded HTML wrapper; the plain text version is always sent too. */
const html = (text) => `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #dbeafe;border-radius:12px">
<h2 style="color:#0b3c6b;margin:0 0 12px">RH Hospital</h2>
<p style="font-size:15px;line-height:1.6;color:#1e293b;white-space:pre-line">${escapeHtml(text)}</p>
<p style="font-size:12px;color:#64748b;margin-top:20px">Hotline +94 11 123 4567 - Care Today... Healthier Tomorrow</p></div>`;

/** Checks the SMTP login once at start-up so a wrong password is reported immediately in the console. */
async function verifyMail() {
  if (!transporter) return console.log('[mail] SMTP_HOST is empty: e-mails are printed in this console (development mode).');
  try { await transporter.verify(); console.log(`[mail] SMTP ready (${config.mail.host}) - e-mails will be delivered.`); }
  catch (e) { console.error(`[mail] SMTP login FAILED: ${e.message}. Check SMTP_HOST / SMTP_USER / SMTP_PASS (Gmail needs a 16-letter App Password, not your normal password).`); }
}

/** Sends an email. In development (no SMTP_HOST) the message is printed to the console instead. Returns true when sent. */
async function sendMail({ to, subject, text, userId = null }) {
  try {
    if (transporter) await transporter.sendMail({ from: config.mail.from, to, subject, text, html: html(text) });
    else console.log(`\n[mail:dev] to=${to}\n  subject: ${subject}\n  ${text.replace(/\n/g, '\n  ')}\n`);
    if (userId) await query('INSERT INTO notifications (user_id, channel, subject, body) VALUES ($1,$2,$3,$4)', [userId, 'email', subject, text]);
    return true;
  } catch (e) {
    console.error('[mail] failed:', e.message);
    return false;
  }
}
module.exports = { sendMail, verifyMail };
