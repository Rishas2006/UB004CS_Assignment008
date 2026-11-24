const { normalise, pgTimestampToIso, TYPE_PARSERS, OID, cleanDatabaseUrl, applyTypeParsers } = require('../../src/sqlutil');

describe('parameter normalisation (node-pg would turn JS arrays into Postgres arrays)', () => {
  test('undefined becomes NULL', () => { expect(normalise(undefined)).toBe(null); });
  test('arrays and objects become JSON text for JSONB columns', () => {
    expect(normalise(['en', 'si'])).toBe('["en","si"]');
    expect(normalise({ a: 1 })).toBe('{"a":1}');
  });
  test('primitives, dates and buffers pass through', () => {
    const d = new Date(); const b = Buffer.from('x');
    expect(normalise('x')).toBe('x'); expect(normalise(3)).toBe(3); expect(normalise(true)).toBe(true); expect(normalise(null)).toBe(null);
    expect(normalise(d)).toBe(d); expect(normalise(b)).toBe(b);
  });
});

describe('timestamp conversion (TIMESTAMPTZ -> ISO UTC string)', () => {
  test('handles the offset formats Postgres prints', () => {
    expect(pgTimestampToIso('2026-11-16 09:15:00+00')).toBe('2026-11-16T09:15:00Z');
    expect(pgTimestampToIso('2026-11-16 09:15:00.123456+00')).toBe('2026-11-16T09:15:00Z');
    expect(pgTimestampToIso('2026-11-16 14:45:00+05:30')).toBe('2026-11-16T09:15:00Z');
    expect(pgTimestampToIso('2026-11-16 14:45:00+0530')).toBe('2026-11-16T09:15:00Z');
    expect(pgTimestampToIso('2026-11-16T09:15:00Z')).toBe('2026-11-16T09:15:00Z');
    expect(pgTimestampToIso('2026-11-15 22:00:00-05')).toBe('2026-11-16T03:00:00Z');
  });
  test('null stays null and unknown text is returned unchanged', () => {
    expect(pgTimestampToIso(null)).toBe(null);
    expect(pgTimestampToIso('infinity')).toBe('infinity');
  });
});

describe('result type parsers', () => {
  test('NUMERIC and BIGINT become numbers (node-pg returns strings by default)', () => {
    expect(TYPE_PARSERS[OID.NUMERIC]('3500.50')).toBe(3500.5);
    expect(TYPE_PARSERS[OID.INT8]('42')).toBe(42);
    expect(TYPE_PARSERS[OID.NUMERIC](null)).toBe(null);
  });
  test('DATE stays a YYYY-MM-DD string (no timezone shift)', () => { expect(TYPE_PARSERS[OID.DATE]('2026-11-16')).toBe('2026-11-16'); });
  test('TIMESTAMP without zone is treated as UTC', () => { expect(TYPE_PARSERS[OID.TIMESTAMP]('2026-11-16 09:15:00')).toBe('2026-11-16T09:15:00Z'); });
  test('applyTypeParsers registers one parser per type', () => {
    const calls = []; applyTypeParsers({ setTypeParser: (oid) => calls.push(oid) });
    expect(calls.sort()).toEqual([20, 1082, 1114, 1184, 1700].sort());
  });
});

describe('DATABASE_URL parsing (Supabase pooler strings)', () => {
  test('reads host, port, user, password and database; decodes special characters', () => {
    const c = cleanDatabaseUrl('postgresql://postgres.abcdefgh:p%40ss%2Fword@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true');
    expect(c).toEqual({ host: 'aws-0-ap-south-1.pooler.supabase.com', port: 6543, user: 'postgres.abcdefgh', password: 'p@ss/word', database: 'postgres' });
  });
  test('defaults to port 5432 and database postgres', () => { expect(cleanDatabaseUrl('postgres://u:p@localhost')).toMatchObject({ port: 5432, database: 'postgres' }); });
  test('rejects a MySQL URL', () => { expect(() => cleanDatabaseUrl('mysql://u:p@localhost:3306/db')).toThrow(/postgresql/); });
});
