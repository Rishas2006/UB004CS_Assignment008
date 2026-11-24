/**
 * Pure helpers used by src/db.js (no dependencies, unit tested).
 *  - normalise():      undefined -> NULL, arrays/objects -> JSON text (node-pg would turn a JS array into a Postgres array literal)
 *  - pgTimestampToIso(): "2026-11-16 09:15:00.123+00" -> "2026-11-16T09:15:00Z"  (what the frontend already expects)
 *  - TYPE_PARSERS:     result type conversion (NUMERIC/BIGINT -> number, DATE stays 'YYYY-MM-DD', TIMESTAMPTZ -> ISO UTC string)
 *  - cleanDatabaseUrl(): reads a postgresql:// URL (Supabase pooler string) into driver options
 */
function normalise(v) {
  if (v === undefined) return null;
  if (
    v !== null &&
    typeof v === "object" &&
    !(v instanceof Date) &&
    !Buffer.isBuffer(v)
  )
    return JSON.stringify(v);
  return v;
}

const TS_RE =
  /^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(\.\d+)?(?:(Z)|([+-]\d{2})(?::?(\d{2}))?)?$/;
/** Converts a Postgres timestamp text value to an ISO-8601 UTC string without milliseconds. Unknown text is returned unchanged. */
function pgTimestampToIso(v) {
  if (v == null) return null;
  const m = TS_RE.exec(String(v));
  if (!m) return String(v);
  const offset = m[4] || !m[5] ? "Z" : `${m[5]}:${m[6] || "00"}`;
  const d = new Date(`${m[1]}T${m[2]}${m[3] || ""}${offset}`);
  return Number.isNaN(d.getTime())
    ? String(v)
    : d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

// pg type OIDs
const OID = {
  INT8: 20,
  NUMERIC: 1700,
  DATE: 1082,
  TIMESTAMP: 1114,
  TIMESTAMPTZ: 1184,
};
const TYPE_PARSERS = {
  [OID.INT8]: (v) => (v === null ? null : Number(v)), // COUNT(*), SUM(int), BIGINT ids
  [OID.NUMERIC]: (v) => (v === null ? null : Number(v)), // money, coordinates
  [OID.DATE]: (v) => v, // keep 'YYYY-MM-DD' (node-pg would create a local-time Date)
  [OID.TIMESTAMPTZ]: pgTimestampToIso,
  [OID.TIMESTAMP]: (v) => pgTimestampToIso(v === null ? null : `${v}Z`), // timestamp without zone: all values are written in UTC
};
function applyTypeParsers(types) {
  for (const [oid, fn] of Object.entries(TYPE_PARSERS))
    types.setTypeParser(Number(oid), fn);
}

/**
 * Parses "postgresql://user:pass@host:6543/postgres?sslmode=require" into { host, port, user, password, database }.
 * sslmode / pgbouncer query parameters are ignored on purpose: SSL is decided by the DB_SSL setting (see config.js).
 */
function cleanDatabaseUrl(url) {
  const u = new URL(url);
  if (!/^postgres(ql)?:$/.test(u.protocol))
    throw new Error("DATABASE_URL must start with postgresql://");
  return {
    host: u.hostname,
    port: Number(u.port || 5432),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: decodeURIComponent(u.pathname.slice(1)) || "postgres",
  };
}

module.exports = {
  normalise,
  pgTimestampToIso,
  applyTypeParsers,
  TYPE_PARSERS,
  OID,
  cleanDatabaseUrl,
};
