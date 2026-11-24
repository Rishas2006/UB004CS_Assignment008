const crypto = require("crypto");
const { Pool, types } = require("pg");
const config = require("./config");
const { normalise, applyTypeParsers } = require("./sqlutil");

applyTypeParsers(types);

const pool = new Pool({
  ...config.db,
  max: config.db.max,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 10_000,
  allowExitOnIdle: true, // lets a serverless instance (or a test run) finish without waiting for idle connections
});
pool.on("error", (e) => console.error("[pg] idle client error:", e.message)); // never crash the process on a dropped idle connection

/** Runs one statement and returns { rows, rowCount }. Values are sent separately from the SQL text (never concatenated). */
async function run(client, sql, params = []) {
  const res = await client.query(sql, params.map(normalise));
  return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
}

const query = (sql, params) => run(pool, sql, params);

/** Run several statements atomically: BEGIN ... COMMIT, or ROLLBACK on any error. */
async function tx(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const out = await fn({ query: (sql, params) => run(client, sql, params) });
    await client.query("COMMIT");
    return out;
  } catch (e) {
    try {
      await client.query("ROLLBACK");
    } catch {
      /* connection already gone */
    }
    throw e;
  } finally {
    client.release();
  }
}

const uuid = () => crypto.randomUUID();
module.exports = { pool, query, tx, uuid };
