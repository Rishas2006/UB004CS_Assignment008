/** Sends a test e-mail with your SMTP (Gmail) settings:   npm run mail:test -- you@gmail.com */
require('dotenv').config();
const config = require('../src/config');
const nodemailer = require('nodemailer');

(async () => {
  const to = process.argv[2];
  if (!to) return console.log('Usage: npm run mail:test -- recipient@example.com');
  if (!config.mail.host) return console.log('SMTP_HOST is empty in .env - fill the SMTP_* settings first.');
  const t = nodemailer.createTransport({ host: config.mail.host, port: config.mail.port, secure: config.mail.port === 465, auth: { user: config.mail.user, pass: config.mail.pass }, connectionTimeout: 10000 });
  await t.verify();
  console.log('SMTP login OK.');
  const info = await t.sendMail({ from: config.mail.from, to, subject: 'RH Hospital test e-mail', text: 'If you can read this, OTP e-mails will work.' });
  console.log('Sent:', info.messageId);
})().catch((e) => { console.error('FAILED:', e.message); if (/535|Invalid login|Username and Password/i.test(e.message)) console.error('Gmail needs 2-Step Verification + a 16-letter App Password in SMTP_PASS (not your normal password).'); process.exit(1); });
