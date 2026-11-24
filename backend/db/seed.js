/**
 * Seeds the PostgreSQL (Supabase) database with the same sample content the frontend ships (db/seed-data.json) plus demo accounts.
 * Run AFTER db/schema.sql:   npm run db:seed      (or both:  npm run db:setup)
 * DEVELOPMENT ONLY - passwords come from SEED_* environment variables.
 */
require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { pool, tx, uuid } = require('../src/db');
const data = require('./seed-data.json');

const J = (o) => JSON.stringify(o);
const DAY = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
const ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

/** "Mon–Fri 09:00–12:00" | "Tue, Thu 14:00–17:00" | "Daily 08:00–20:00" -> { weekdays:[1..5], start:'09:00', end:'12:00' } */
function parseDays(text) {
  const days = text.replace(/\s*\d{2}:\d{2}.*$/, '');
  const times = text.match(/(\d{2}:\d{2})\s*[–-]\s*(\d{2}:\d{2})/);
  let list = [];
  if (/daily/i.test(days)) list = ORDER;
  else if (/[–-]/.test(days)) {
    const [a, b] = days.split(/[–-]/).map((s) => s.trim().slice(0, 3).toLowerCase());
    list = ORDER.slice(ORDER.indexOf(a), ORDER.indexOf(b) + 1);
  } else list = days.split(',').map((s) => s.trim().slice(0, 3).toLowerCase());
  return { weekdays: list.map((d) => DAY[d]), start: times[1], end: times[2] };
}

(async () => {
  try {
    const adminPw = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@12345', 12);
    const staffPw = await bcrypt.hash(process.env.SEED_STAFF_PASSWORD || 'Staff@12345', 12);

    await tx(async (c) => {
      for (const b of data.branches) await c.query('INSERT INTO branches (id, name, address, phone, lat, lng) VALUES ($1,$2,$3,$4,$5,$6)', [b.id, J(b.name), b.address, b.phone, b.lat, b.lng]);
      for (const d of data.departments) await c.query('INSERT INTO departments (id, name, description, icon, is_centre) VALUES ($1,$2,$3,$4,$5)', [d.id, J(d.name), J(d.desc), d.icon, !!d.centre]);
      for (const s of data.services) await c.query('INSERT INTO services (slug, icon, name, description, points, hours) VALUES ($1,$2,$3,$4,$5,$6)', [s.slug, s.icon, J(s.name), J(s.desc), J(s.points), s.hours || null]);
      for (const [code, name, cat, price, hrs] of data.labTests) await c.query('INSERT INTO lab_tests (code, name, category, price, turnaround_hours) VALUES ($1,$2,$3,$4,$5)', [code, name, cat, price, hrs]);
      for (const p of data.packages) await c.query('INSERT INTO packages (id, icon, name, price, discount, tests) VALUES ($1,$2,$3,$4,$5,$6)', [p.id, p.icon, J(p.name), p.price, p.discount, J(p.tests)]);
      for (const r of data.rooms) await c.query('INSERT INTO rooms (id, name, price, description) VALUES ($1,$2,$3,$4)', [r.id, J(r.name), r.price, J(r.desc)]);
      for (const f of data.faqs) await c.query('INSERT INTO faqs (id, category, question, answer) VALUES ($1,$2,$3,$4)', [f.id, f.cat, J(f.q), J(f.a)]);
      for (const n of data.news) await c.query('INSERT INTO news (slug, published_on, category, title, body) VALUES ($1,$2,$3,$4,$5)', [n.slug, n.date, J(n.cat), J(n.title), J(n.body)]);
      for (const a of data.announcements) await c.query('INSERT INTO announcements (id, severity, text) VALUES ($1,$2,$3)', [a.id, a.sev, J(a.text)]);
      for (const p of data.promotions) await c.query('INSERT INTO promotions (id, valid_until, title, description) VALUES ($1,$2,$3,$4)', [p.id, p.until, J(p.title), J(p.desc)]);
      for (const [title, dept, branch, closing] of data.jobs) await c.query('INSERT INTO jobs (title, department, branch_id, closing_date) VALUES ($1,$2,$3,$4)', [title, dept, branch.toLowerCase(), closing]);
      for (const r of data.reviews) await c.query(`INSERT INTO reviews (author, rating, body, status) VALUES ($1,$2,$3,'APPROVED')`, [r.name, r.rating, J(r.text)]);
      for (const [h, t, is24] of data.hours) await c.query('INSERT INTO opening_hours (label, hours, is_24x7) VALUES ($1,$2,$3)', [h, t, !!is24]);
      for (const [name, free, total] of data.parking) await c.query('INSERT INTO parking_lots (branch_id, name, total, free) VALUES ($1,$2,$3,$4)', ['colombo', name, total, free]);

      const content = [['award', data.awards.map(([year, title]) => ({ year, title }))],
        ['report', data.reports.map(([title, year, type]) => ({ title, year, type }))],
        ['director', data.directors], ['policy', data.policies.map(([title, desc, version]) => ({ title, desc, version }))],
        ['gallery', data.gallery.map(([label, src]) => ({ label, src }))], ['canteen', data.canteen.map(([name, cat, price]) => ({ name, cat, price }))],
        ['emergency_contact', data.emergencyContacts.map(([label, display, tel]) => ({ label, display, tel }))]];
      for (const [kind, rows] of content) for (const [i, d] of rows.entries()) await c.query('INSERT INTO content_items (kind, data, sort_order) VALUES ($1,$2,$3)', [kind, J(d), i]);

      for (const [name, occupied, total] of data.wards) {
        const w = await c.query('INSERT INTO wards (branch_id, name, total_beds) VALUES ($1,$2,$3) RETURNING id', ['colombo', name, total]);
        for (let i = 1; i <= total; i++) await c.query('INSERT INTO beds (ward_id, label, status) VALUES ($1,$2,$3)', [w.rows[0].id, `${name.slice(0, 3).toUpperCase()}-${String(i).padStart(2, '0')}`, i <= occupied ? 'occupied' : 'available']);
      }

      // doctors + login accounts (doctor1@rhhospital.lk ...) + weekly schedules
      for (const [i, d] of data.doctors.entries()) {
        const uid = uuid();
        await c.query(`INSERT INTO users (id, name, email, phone, password_hash, role, branch_id, is_verified) VALUES ($1,$2,$3,$4,$5,'doctor',$6,true)`, [uid, d.name, `doctor${i + 1}@rhhospital.lk`, '+94112345678', staffPw, d.branch]);
        await c.query(`INSERT INTO doctors (id, user_id, name, initials, dept_id, branch_id, experience_years, languages, video_enabled, is_resident, fee, schedule_text, slmc_no)
                       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [d.id, uid, d.name, d.initials, d.dept, d.branch, d.exp, J(d.langs), !!d.video, !!d.resident, d.fee, d.days, d.slmc]);
        const s = parseDays(d.days);
        for (const wd of s.weekdays) await c.query('INSERT INTO doctor_schedules (doctor_id, weekday, start_time, end_time) VALUES ($1,$2,$3,$4)', [d.id, wd, s.start, s.end]);
        await c.query('INSERT INTO staff (user_id, branch_id, job_title, basic_salary, allowances) VALUES ($1,$2,$3,$4,$5)', [uid, d.branch, `Consultant - ${d.dept}`, 250000, 30000]);
      }

      // one demo account per remaining role
      const accounts = [['Super Admin', 'admin@rhhospital.lk', 'super-admin', adminPw, 'Hospital Administrator', 400000],
        ['Nimali Silva', 'nurse@rhhospital.lk', 'nurse', staffPw, 'Staff Nurse', 85000], ['Kamal Jayasuriya', 'reception@rhhospital.lk', 'reception', staffPw, 'Receptionist', 70000],
        ['Ruwan Pharmacist', 'pharmacy@rhhospital.lk', 'pharmacy', staffPw, 'Pharmacist', 120000], ['Dilani Lab', 'lab@rhhospital.lk', 'laboratory', staffPw, 'Medical Laboratory Technologist', 110000],
        ['Hasini HR', 'hr@rhhospital.lk', 'hr', staffPw, 'HR Manager', 180000], ['Farook Finance', 'finance@rhhospital.lk', 'finance', staffPw, 'Accountant', 160000],
        ['Sunil Driver', 'ambulance@rhhospital.lk', 'ambulance', staffPw, 'Ambulance Coordinator', 90000], ['Branch Admin', 'branchadmin@rhhospital.lk', 'branch-admin', staffPw, 'Branch Manager', 220000]];
      for (const [name, email, role, pw, title, salary] of accounts) {
        const uid = uuid();
        await c.query(`INSERT INTO users (id, name, email, phone, password_hash, role, branch_id, is_verified) VALUES ($1,$2,$3,'+94771234567',$4,$5,'colombo',true)`, [uid, name, email, pw, role]);
        await c.query(`INSERT INTO staff (user_id, branch_id, job_title, basic_salary, allowances) VALUES ($1,'colombo',$2,$3,10000)`, [uid, title, salary]);
      }
      const pu = uuid();
      await c.query(`INSERT INTO users (id, name, email, phone, password_hash, role, is_verified) VALUES ($1,'Demo Patient','patient@example.com','+94771112233',$2,'patient',true)`, [pu, staffPw]);
      const pid = uuid();
      await c.query(`INSERT INTO patients (id, user_id, mrn, dob, gender, blood_group, emergency_contact, qr_token) VALUES ($1,$2,'RH-000001','1990-05-14','female','O+','Mother - +94771119999',$3)`, [pid, pu, crypto.randomBytes(18).toString('hex')]);

      for (const [plate, lat, lng] of [['WP CAB-1234', 6.9271, 79.8612], ['WP CAB-5678', 6.9344, 79.8428], ['CP KA-4321', 7.2906, 80.6337]])
        await c.query('INSERT INTO ambulance_vehicles (plate, branch_id, lat, lng) VALUES ($1,$2,$3,$4)', [plate, plate.startsWith('CP') ? 'kandy' : 'colombo', lat, lng]);
      for (const [sku, name, stock, price] of [['PCM-500', 'Paracetamol 500mg', 1200, 3.5], ['AMX-500', 'Amoxicillin 500mg', 80, 28], ['MET-500', 'Metformin 500mg', 600, 6], ['ATV-20', 'Atorvastatin 20mg', 45, 22], ['SAL-INH', 'Salbutamol inhaler', 12, 950]])
        await c.query('INSERT INTO pharmacy_items (sku, name, stock, price, expiry) VALUES ($1,$2,$3,$4,$5)', [sku, name, stock, price, '2027-12-31']);

      // ---- a little demo activity so every portal has something to show (replace with real data in production) ----
      const day = (n) => new Date(Date.now() + n * 86400_000).toISOString().slice(0, 10);
      const apptId = uuid();
      await c.query(`INSERT INTO appointments (id, ref, patient_id, doctor_id, branch_id, appt_date, appt_time, type, reason) VALUES ($1,'RH-100001',$2,'d6','colombo',$3,'10:00','IN_PERSON','Fever and cough')`, [apptId, pid, day(1)]);
      await c.query(`INSERT INTO invoices (id, ref, patient_id, appointment_id, description, amount) VALUES ($1,'INV-100001',$2,$3,'Consultation - General physician',2500)`, [uuid(), pid, apptId]);
      const rxId = uuid();
      await c.query(`INSERT INTO prescriptions (id, ref, patient_id, doctor_id, notes) VALUES ($1,'P-10001',$2,'d6','Rest and plenty of fluids')`, [rxId, pid]);
      await c.query(`INSERT INTO prescription_items (prescription_id, drug, dose, frequency, days) VALUES ($1,'Paracetamol','500 mg','3 times daily',5), ($1,'Amoxicillin','500 mg','twice daily',7)`, [rxId]);
      await c.query(`INSERT INTO lab_orders (id, ref, patient_id, test_code, ordered_by) VALUES ($1,'L-20001',$2,'LAB-FBC','d6')`, [uuid(), pid]);
      await c.query(`INSERT INTO pharmacy_orders (id, ref, patient_id, prescription_ref, mode, address) VALUES ($1,'PH-30001',$2,'P-10001','delivery','12 Lake Road, Colombo 05')`, [uuid(), pid]);
      await c.query(`INSERT INTO ambulance_requests (id, ref, caller_name, phone, address, lat, lng) VALUES ($1,'AMB-50001','Kamal Perera','+94771234567','45 Galle Road, Colombo 03',6.9,79.85)`, [uuid()]);
      const nurse = (await c.query(`SELECT s.id FROM staff s JOIN users u ON u.id = s.user_id WHERE u.email = 'nurse@rhhospital.lk'`)).rows[0];
      await c.query(`INSERT INTO leaves (staff_id, type, from_date, to_date, reason) VALUES ($1,'annual',$2,$3,'Family event')`, [nurse.id, day(10), day(12)]);
      await c.query(`INSERT INTO advances (staff_id, amount, reason, deduct_month) VALUES ($1,15000,'Medical expense',$2)`, [nurse.id, day(30).slice(0, 7)]);
    });
    console.log('Seed complete.\n  admin@rhhospital.lk / (SEED_ADMIN_PASSWORD)\n  doctor1@rhhospital.lk, nurse@, reception@, pharmacy@, lab@, hr@, finance@, ambulance@, branchadmin@rhhospital.lk / (SEED_STAFF_PASSWORD)\n  patient@example.com / (SEED_STAFF_PASSWORD)');
  } catch (e) {
    console.error('Seed failed:', e.message);
    if (e.code === '23505') console.error('The sample data is already in the database. Run "npm run db:reset" to start from an empty schema.');
    if (e.code === '42P01') console.error('The tables do not exist yet. Run "npm run db:schema" first.');
    process.exitCode = 1;
  }
  finally { await pool.end(); }
})();
