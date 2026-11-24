const jwt = require('jsonwebtoken');
const config = require('../config');
const { AppError, forbidden } = require('../utils');

/** Reads "Authorization: Bearer <accessToken>" and sets req.user = { id, role, branchId, name } */
function authenticate(req, _res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return next(new AppError(401, 'Authentication required', 'unauthenticated'));
  try {
    const p = jwt.verify(token, config.jwt.accessSecret);
    req.user = { id: p.sub, role: p.role, branchId: p.branch || null, name: p.name };
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token', 'token_invalid'));
  }
}

/** Optional auth: attaches req.user when a valid token exists, otherwise continues as guest. */
function optionalAuth(req, _res, next) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return next();
  try {
    const p = jwt.verify(h.slice(7), config.jwt.accessSecret);
    req.user = { id: p.sub, role: p.role, branchId: p.branch || null, name: p.name };
  } catch { /* ignore - treat as guest */ }
  next();
}

/** Role based authorization. super-admin always passes. */
const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) return next(new AppError(401, 'Authentication required', 'unauthenticated'));
  if (req.user.role === 'super-admin' || roles.includes(req.user.role)) return next();
  next(forbidden());
};

const signAccess = (u) =>
  jwt.sign({ role: u.role, branch: u.branch_id, name: u.name }, config.jwt.accessSecret, {
    subject: u.id, expiresIn: config.jwt.accessTtl,
  });

module.exports = { authenticate, optionalAuth, authorize, signAccess };
