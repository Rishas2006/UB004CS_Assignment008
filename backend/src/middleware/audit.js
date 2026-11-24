const { query } = require('../db');
const { defer } = require('../utils');

/** Audit trail entry. Never blocks or breaks the request; the response waits for the insert to finish (see utils.defer). */
function audit(req, action, entity, entityId, meta) {
  return defer(req, query(
    'INSERT INTO audit_logs (user_id, action, entity, entity_id, ip, meta) VALUES ($1,$2,$3,$4,$5,$6)',
    [req.user?.id || null, action, entity || null, entityId != null ? String(entityId) : null, req.ip, meta || null],
  ).catch((e) => console.error('[audit]', e.message)));
}
module.exports = { audit };
