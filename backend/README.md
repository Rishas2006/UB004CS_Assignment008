# RH Hospital Management System — Backend API (PostgreSQL / Supabase)

Node.js 20 + Express + **PostgreSQL (Supabase)**. ~150 REST endpoints, 11 roles, 42 tables. Runs as one **Vercel Function** (production) or as a normal Node server (local).

## Quick start
```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env  -> fill DATABASE_URL and DATABASE_URL_SETUP (Supabase > Connect)
npm run db:setup         # 42 tables (Row Level Security on) + sample data
npm run dev              # http://localhost:4000/api/v1/health  ->  {"status":"ok","db":"up"}
```
- `DATABASE_URL` = Supabase **Transaction pooler** (port 6543, used by the API / Vercel). `DATABASE_URL_SETUP` = **Session pooler** (port 5432, used by `db:setup`).
- Local PostgreSQL instead: `docker compose up -d db`, leave `DATABASE_URL` empty and set `DB_HOST/DB_USER/DB_PASSWORD/DB_NAME`.
- `db:setup` never deletes anything; `npm run db:reset` drops and recreates the RH HMS tables.

## Gmail (OTP, confirmations, reminders)
Turn on 2-Step Verification → create an **App password** → `.env`: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=you@gmail.com`, `SMTP_PASS=<16 letters>`, `MAIL_FROM="RH Hospital <you@gmail.com>"`.
Check: `npm run mail:test -- other@gmail.com` must print "Sent". Empty `SMTP_HOST` = codes are printed in the terminal (development).

## PayHere
`PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET` (the secret is created per **domain** under Settings → Domains & Credentials), `PAYHERE_SANDBOX=true|false`.
`PUBLIC_API_URL` must be the public **https** address of this API: PayHere posts to `/api/v1/billing/payhere/notify`.

## Deploy on Vercel
Root Directory `backend` · entry `index.js` (exports `src/app.js`) · schedules in `vercel.json` · set the variables from `.env.example` (Production) + `CRON_SECRET` · redeploy after every change of a variable. Full guide: root `README.md` → Deployment.

Vercel specifics handled in code: transaction-pooler friendly queries, audit rows and e-mails finish before the response ends (`utils.defer`), cron jobs are plain functions behind `/api/cron/*` (Bearer `CRON_SECRET`), live pages poll (no WebSockets).

## Demo accounts (after seeding)
| Role | Login | Password |
|---|---|---|
| Super admin | admin@rhhospital.lk | `SEED_ADMIN_PASSWORD` (default Admin@12345) |
| Doctors | doctor1@rhhospital.lk ... doctor11@ | `SEED_STAFF_PASSWORD` (default Staff@12345) |
| Nurse, reception, pharmacy, lab, hr, finance, ambulance, branch admin | nurse@, reception@, pharmacy@, lab@, hr@, finance@, ambulance@, branchadmin@rhhospital.lk | same |
| Patient | patient@example.com | same |

Change all seed passwords before any public deployment.

## Scripts
`npm test` (Jest + Supertest) | `npm run test:unit` | `npm run db:schema` | `npm run db:seed` | `npm run db:reset` | `npm run mail:test`
Database-backed tests (separate database!): `DATABASE_URL=… npm run db:reset && npm run db:seed && TEST_WITH_DB=1 npm test`.

## Structure
```
index.js vercel.json                    Vercel entry + cron schedules
src/app.js server.js config.js db.js sqlutil.js utils.js
src/middleware/  auth (JWT + RBAC), error (PostgreSQL error codes), audit
src/routes/      auth public appointments queue patients clinical billing pharmacy ambulance hr admin ai cron
src/services/    slots payroll payhere otp mailer ai pdf   (slots, payroll, payhere, sqlutil are pure + unit tested)
src/jobs/cron.js reminders, no-show, monthly payroll, cleanup
src/socket.js    Socket.IO (local / always-on server only)
db/              schema.sql setup.js seed.js seed-data.json
docs/            api-examples.http  FRONTEND-INTEGRATION.md  frontend-api-client.ts
```

## PostgreSQL notes
- UUID primary keys are generated in Node (`crypto.randomUUID()`); trilingual text and arrays are `JSONB`; times are `TIMESTAMPTZ` (UTC), "today" is computed in `Asia/Colombo`.
- Double booking is blocked by the partial unique index `appt_slot_uq … WHERE status <> 'CANCELLED'`.
- Queries use `$1, $2` placeholders sent separately from the SQL (never string concatenation). Money (`NUMERIC`) and `COUNT` come back as JS numbers, `DATE` as `YYYY-MM-DD`.
- Row Level Security is enabled on every table with no policy: the public Supabase Data API cannot read patient data; only this API (server-side connection) can.

## Security notes
bcrypt (cost 12), 15 min JWT + rotating hashed refresh tokens (httpOnly cookie), lockout after 5 failures, zod validation, helmet, CORS allow-list, rate limits (per instance), audit log, PayHere md5sig verification, cron secret. Never commit `.env`.
