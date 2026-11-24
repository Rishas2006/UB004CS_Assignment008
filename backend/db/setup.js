/**
 * Creates every table (db/schema.sql) in your PostgreSQL / Supabase database.
 *   npm run db:schema          create the tables (stops if they already exist, so nothing is deleted by accident)
 *   npm run db:reset           DROP the RH HMS tables first, then create them again  (deletes all data!)
 * Connection: DATABASE_URL (preferred) or DB_* variables. For the one-time setup on Supabase use the SESSION pooler string
 * (port 5432) in DATABASE_URL_SETUP - it works over IPv4 and accepts a whole script. The Transaction pooler (6543) also works.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const config = require('../src/config');
const { cleanDatabaseUrl } = require('../src/sqlutil');

const reset = process.argv.includes('--reset');
const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
const tables = [...sql.matchAll(/^CREATE TABLE (\w+)/gm)].map((m) => m[1]);

function clientConfig() {
  if (!process.env.DATABASE_URL_SETUP) return { ...config.db, max: undefined };
  const c = cleanDatabaseUrl(process.env.DATABASE_URL_SETUP);
  return { ...c, ssl: ['localhost', '127.0.0.1', '::1'].includes(c.host) ? false : { rejectUnauthorized: false } };
}

(async () => {
  const { max: _max, ...opts } = clientConfig();
  const c = new Client(opts);
  await c.connect();
  try {
    const { rows } = await c.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = ANY($1::text[])`, [tables]);
    if (rows.length && !reset) {
      console.error(`Found ${rows.length} existing RH HMS table(s) (${rows.map((r) => r.table_name).slice(0, 4).join(', ')}...).`);
      console.error('Nothing was changed. To delete them and start again run:  npm run db:reset   (all data in these tables is lost)');
      process.exitCode = 1;
      return;
    }
    if (reset) {
      await c.query(`DROP TABLE IF EXISTS ${tables.join(', ')} CASCADE`);
      console.log('Old RH HMS tables dropped.');
    }
    await c.query(sql); // one multi-statement script = one implicit transaction: either all tables are created or none
    console.log(`Schema created: ${tables.length} tables in database "${opts.database}" (host ${opts.host}).`);
  } finally { await c.end(); }
})().catch((e) => { console.error('Schema setup failed:', e.message); process.exit(1); });
