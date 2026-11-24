/**
 * API tests (supertest). Group A needs NO database. Group B needs a seeded PostgreSQL / Supabase database
 * (use a separate TEST project or a local PostgreSQL, never your real data):
 *   DATABASE_URL=postgresql://... npm run db:reset && npm run db:seed && TEST_WITH_DB=1 npm test
 */
process.env.NODE_ENV = 'test';
const request = require('supertest');
process.env.CRON_SECRET = '';
const app = require('../../src/app');
const { pool } = require('../../src/db');

afterAll(() => pool.end());

describe('A. no-database behaviour', () => {
  test('GET /health returns ok', async () => { const r = await request(app).get('/health'); expect(r.status).toBe(200); expect(r.body.status).toBe('ok'); });
  test('unknown route -> 404 JSON', async () => { const r = await request(app).get('/api/v1/nope'); expect(r.status).toBe(404); expect(r.body.error.code).toBe('not_found'); });
  test('register rejects weak password and bad phone (422)', async () => {
    const r = await request(app).post('/api/v1/auth/register').send({ name: 'A', email: 'bad', phone: '12', password: 'abc' });
    expect(r.status).toBe(422); expect(r.body.error.details.length).toBeGreaterThan(2);
  });
  test('login requires credentials (422)', async () => { expect((await request(app).post('/api/v1/auth/login').send({})).status).toBe(422); });
  test('protected route without token -> 401', async () => { expect((await request(app).get('/api/v1/appointments/mine')).status).toBe(401); });
  test('protected route with garbage token -> 401', async () => { expect((await request(app).get('/api/v1/patients/me').set('Authorization', 'Bearer nope')).status).toBe(401); });
  test('forged PayHere notification is rejected (400)', async () => {
    const r = await request(app).post('/api/v1/billing/payhere/notify').type('form').send({ merchant_id: 'x', order_id: 'o', payhere_amount: '1.00', payhere_currency: 'LKR', status_code: '2', md5sig: 'BAD' });
    expect(r.status).toBe(400);
  });
  test('AI chat flags emergencies without calling any model', async () => {
    const r = await request(app).post('/api/v1/ai/chat').send({ lang: 'en', messages: [{ role: 'user', content: 'I have severe chest pain' }] });
    expect(r.status).toBe(200); expect(r.body.emergency).toBe(true); expect(r.body.source).toBe('rules');
  });
  test('AI symptom endpoint validates input', async () => { expect((await request(app).post('/api/v1/ai/symptom').send({ text: '' })).status).toBe(422); });
  test('cron endpoints reject calls without the CRON_SECRET (401)', async () => {
    expect((await request(app).get('/api/cron/cleanup')).status).toBe(401);
    expect((await request(app).get('/api/cron/cleanup').set('Authorization', 'Bearer wrong')).status).toBe(401);
  });
  test('ambulance request validates phone', async () => {
    expect((await request(app).post('/api/v1/ambulance/requests').send({ callerName: 'Test', phone: 'abc', address: '12 Main Road' })).status).toBe(422);
  });
});

const hasDb = !!process.env.TEST_WITH_DB;
(hasDb ? describe : describe.skip)('B. database backed flows (set TEST_WITH_DB=1)', () => {
  let patientToken; let adminToken; let apptId;
  test('login as seeded patient', async () => {
    const r = await request(app).post('/api/v1/auth/login').send({ email: 'patient@example.com', password: process.env.SEED_STAFF_PASSWORD || 'Staff@12345' });
    expect(r.status).toBe(200); patientToken = r.body.accessToken;
  });
  test('public doctors list is seeded', async () => { const r = await request(app).get('/api/v1/doctors'); expect(r.body.length).toBeGreaterThanOrEqual(11); });
  test('book the first free slot', async () => {
    let date; let time;
    for (let i = 1; i < 10 && !time; i++) {
      date = new Date(Date.now() + i * 86400000).toISOString().slice(0, 10);
      const s = await request(app).get(`/api/v1/doctors/d6/slots?date=${date}`); time = s.body.slots.find((x) => x.available)?.time;
    }
    const r = await request(app).post('/api/v1/appointments').set('Authorization', `Bearer ${patientToken}`).send({ doctorId: 'd6', date, time, type: 'IN_PERSON', reason: 'Fever' });
    expect(r.status).toBe(201); apptId = r.body.id;
    const again = await request(app).post('/api/v1/appointments').set('Authorization', `Bearer ${patientToken}`).send({ doctorId: 'd6', date, time });
    expect(again.status).toBe(409); // double booking prevented
  });
  test('patient cannot call admin endpoints (403)', async () => { expect((await request(app).get('/api/v1/admin/users').set('Authorization', `Bearer ${patientToken}`)).status).toBe(403); });
  test('admin can list users', async () => {
    const l = await request(app).post('/api/v1/auth/login').send({ email: 'admin@rhhospital.lk', password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345' });
    adminToken = l.body.accessToken;
    expect((await request(app).get('/api/v1/admin/users').set('Authorization', `Bearer ${adminToken}`)).status).toBe(200);
  });
  test('patient cancels own appointment', async () => { expect((await request(app).patch(`/api/v1/appointments/${apptId}/cancel`).set('Authorization', `Bearer ${patientToken}`)).status).toBe(200); });
  test('a cancelled slot can be booked again (partial unique index)', async () => {
    const a = (await request(app).get(`/api/v1/appointments/mine`).set('Authorization', `Bearer ${patientToken}`)).body.find((x) => x.id === apptId);
    const r = await request(app).post('/api/v1/appointments').set('Authorization', `Bearer ${patientToken}`).send({ doctorId: 'd6', date: a.date, time: a.time.slice(0, 5) });
    expect(r.status).toBe(201);
  });
  test('malformed UUID in the URL is a clean 400, not a 500', async () => {
    expect((await request(app).patch('/api/v1/appointments/not-a-uuid/cancel').set('Authorization', `Bearer ${patientToken}`)).status).toBe(400);
  });
});
