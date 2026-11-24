const { ZodError } = require('zod');

class AppError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.status = status;
    this.code = code || 'error';
    this.details = details;
  }
}
const badRequest = (m, d) => new AppError(400, m, 'bad_request', d);
const notFound = (m = 'Not found') => new AppError(404, m, 'not_found');
const forbidden = (m = 'You do not have permission') => new AppError(403, m, 'forbidden');
const conflict = (m) => new AppError(409, m, 'conflict');

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** validate(schema, 'body'|'query'|'params') -> replaces req[part] with parsed (trimmed, typed) data */
const validate = (schema, part = 'body') => (req, _res, next) => {
  try {
    req[part] = schema.parse(req[part]);
    next();
  } catch (e) {
    if (e instanceof ZodError) {
      return next(new AppError(422, 'Validation failed', 'validation_error',
        e.issues.map((i) => ({ field: i.path.join('.'), message: i.message }))));
    }
    next(e);
  }
};

/** Human-friendly reference numbers, e.g. RH-483920 */
const makeRef = (prefix, digits = 6) =>
  `${prefix}-${String(Math.floor(Math.random() * 10 ** digits)).padStart(digits, '0')}`;

/**
 * Registers fire-and-forget work (audit rows, e-mails) with the request. app.js delays the end of the response until it settles,
 * because a serverless platform (Vercel) freezes the function as soon as the response is finished.
 */
const defer = (req, promise) => {
  (req.pending ||= []).push(Promise.resolve(promise).catch((e) => console.error('[deferred]', e.message)));
  return promise;
};

const isoDate = (d) => d.toISOString().slice(0, 10);
const weekdayOf = (dateStr) => new Date(`${dateStr}T00:00:00Z`).getUTCDay();
const ymNow = () => new Date().toISOString().slice(0, 7);

module.exports = { AppError, badRequest, notFound, forbidden, conflict, asyncHandler, validate, makeRef, defer, isoDate, weekdayOf, ymNow };
