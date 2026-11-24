const config = require('../config');

function notFoundHandler(req, res) {
  res.status(404).json({ error: { code: 'not_found', message: `Route ${req.method} ${req.originalUrl} not found` } });
}

/**
 * PostgreSQL error codes (err.code, 5 characters) turned into clean API errors:
 *   23505 unique violation | 23503 foreign key | 23514 CHECK failed | 23502 NOT NULL
 *   22001 value too long | 22P02 invalid text representation (for example a malformed UUID) | 22007 / 22008 / 22003 bad date or number
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, _next) {
  if (err.code === '23505') {
    const slot = err.constraint === 'appt_slot_uq';
    return res.status(409).json({ error: { code: 'duplicate', message: slot ? 'That time slot has just been booked. Please choose another.' : 'Record already exists' } });
  }
  if (err.code === '23503') return res.status(409).json({ error: { code: 'fk_violation', message: 'Related record does not exist or is in use' } });
  if (err.code === '22P02') return res.status(400).json({ error: { code: 'bad_request', message: 'Invalid identifier or value' } });
  if (['23514', '23502', '22001', '22007', '22008', '22003'].includes(err.code)) return res.status(422).json({ error: { code: 'invalid_data', message: 'Invalid data supplied' } });

  const status = err.status || 500;
  if (status >= 500) console.error('[error]', err);
  res.status(status).json({
    error: {
      code: err.code && !/^[0-9A-Z]{5}$/.test(err.code) ? err.code : 'server_error',
      message: status >= 500 && config.isProd ? 'Something went wrong. Please try again.' : err.message,
      details: err.details,
    },
  });
}
module.exports = { notFoundHandler, errorHandler };
