const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { query, uuid } = require('../db');
const { AppError } = require('../utils');
const { sendMail } = require('./mailer');

const OTP_MINUTES = 10;
const MAX_ATTEMPTS = 5;

const generate = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

/** Creates a 6-digit OTP, stores only its bcrypt hash, and e-mails the plain code. */
async function issueOtp(user, purpose = 'verify') {
  const code = generate();
  const hash = await bcrypt.hash(code, 8);
  await query('UPDATE otp_codes SET used = true WHERE user_id = $1 AND purpose = $2 AND used = false', [user.id, purpose]);
  await query(
    `INSERT INTO otp_codes (id, user_id, code_hash, purpose, expires_at) VALUES ($1,$2,$3,$4, NOW() + make_interval(mins => $5::int))`,
    [uuid(), user.id, hash, purpose, OTP_MINUTES],
  );
  const sent = await sendMail({
    to: user.email, userId: user.id,
    subject: purpose === 'reset' ? 'RH Hospital password reset code' : 'RH Hospital verification code',
    text: `Your RH Hospital code is ${code}.\nIt expires in ${OTP_MINUTES} minutes. If you did not request it, you can ignore this message.`,
  });
  // never pretend the code was sent: the user would wait for an e-mail that will not come
  if (!sent) throw new AppError(502, 'We could not send the e-mail right now. Please try again in a few minutes.', 'mail_failed');
}

/** Verifies the latest unused OTP; locks after MAX_ATTEMPTS wrong tries. */
async function checkOtp(userId, code, purpose = 'verify') {
  const { rows } = await query(
    `SELECT * FROM otp_codes WHERE user_id = $1 AND purpose = $2 AND used = false ORDER BY created_at DESC LIMIT 1`,
    [userId, purpose],
  );
  const otp = rows[0];
  if (!otp || new Date(otp.expires_at) < new Date()) throw new AppError(400, 'Code expired. Please request a new one.', 'otp_expired');
  if (otp.attempts >= MAX_ATTEMPTS) throw new AppError(429, 'Too many wrong attempts. Request a new code.', 'otp_locked');
  const ok = await bcrypt.compare(String(code), otp.code_hash);
  if (!ok) {
    await query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1', [otp.id]);
    throw new AppError(400, 'Incorrect code', 'otp_invalid');
  }
  await query('UPDATE otp_codes SET used = true WHERE id = $1', [otp.id]);
  return true;
}
module.exports = { issueOtp, checkOtp, generate };
