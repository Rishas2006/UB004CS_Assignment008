# Frontend <-> backend status

**Wired to the database (live data, with the old sample data only as an offline fallback):**
- Every public list: doctors, departments, services, packages, lab tests, branches, rooms, news, FAQs, promotions, announcements, awards, reports, directors, policies, gallery, careers, canteen, reviews, emergency contacts, bed/parking/opening-hours board (`frontend/lib/live.tsx`).
- Login, register, OTP, booking wizard (live slots, real appointments).
- Forms that now save to PostgreSQL (Supabase): contact, careers application, review (needs admin approval), room request, pharmacy order (with live status tracking).
- All 11 role portals show real numbers and tables for the signed-in role (`frontend/lib/portalLive.ts`). The API returns 401/403 for the wrong role.

**Still simulated in the UI (backend endpoints exist, screens not wired yet):**
- Ambulance map / tracking page, queue display board, QR health-card page, symptom checker (uses its own Next.js API route), PayHere pay button.
- Portal screens are read-only: approving leave, dispatching ambulances, editing stock etc. work through the API (see `docs/api-examples.http`) but have no buttons yet.

To change what a public page shows, edit the row in PostgreSQL (Supabase) (or use the `/admin/cms/*` endpoints) and refresh the page.

---
# Connecting the Next.js frontend to this API

1. Copy `docs/frontend-api-client.ts` to `lib/api.ts` in the frontend and set `NEXT_PUBLIC_API_URL`.
2. `npm i socket.io-client` in the frontend for the live queue, bed board and ambulance tracking.
3. Add the frontend origin to `CORS_ORIGINS` in the backend `.env`.

| Frontend page / component | Replace sample data with | Endpoint(s) |
|---|---|---|
| `/register`, `/verify-otp`, `/login` | real auth | `POST /auth/register`, `/auth/verify-otp`, `/auth/resend-otp`, `/auth/login` |
| `/appointments` (4-step wizard) | `isBooked()` demo | `GET /doctors?dept=`, `GET /doctors/:id/slots?date=`, `GET /doctors/:id/earliest`, `POST /appointments` |
| `/doctors`, `/doctors/[id]` | `doctors` array | `GET /doctors`, `GET /doctors/:id` |
| `/departments`, `/services`, `/health-packages`, `/laboratory`, `/rooms` | arrays in `lib/data.ts` | `GET /departments`, `/services`, `/packages`, `/lab-tests`, `/rooms` |
| `/news`, `/faqs`, `/promotions`, `/careers`, `/reviews`, `AnnouncementBar` | arrays | `GET /news`, `/faqs`, `/promotions`, `/jobs`, `/reviews`, `/announcements` |
| `/awards`, `/reports`, `/directors`, `/policies`, `/gallery`, `/canteen` | arrays | `GET /content/awards` (also reports, directors, policies, gallery, canteen) |
| `/contact`, `/careers` form, `/reviews` form, `/rooms` form | `onSubmit` stubs | `POST /contact`, `/careers/apply`, `/reviews`, `/room-bookings` |
| `/emergency`, `/ambulance` | simulated map | `POST /ambulance/requests`, `GET /ambulance/track/:ref`, socket `track:ambulance` |
| `/operations` | sample beds/parking | `GET /operations/beds`, `/parking`, `/opening-hours`; socket `beds:join` |
| `/queue-display` | simulated | `GET /queue/:branch`; socket `queue:join` |
| `/pharmacy` | stage demo | `POST /pharmacy/orders`, `GET /pharmacy/orders/track/:ref` |
| `/health-card` | sample QR | `GET /patients/me/health-card`, public `GET /patients/health-card/:token` |
| `/symptom-checker`, `AIChat` | Next API routes | `POST /ai/symptom`, `POST /ai/chat` (or keep the Next routes) |
| `/portal/patient` | sample rows | `GET /appointments/mine`, `/patients/me/records`, `/billing/invoices/mine`, `POST /billing/invoices/:id/pay` |
| `/portal/doctor` | sample rows | `GET /appointments`, `PATCH /appointments/:id/status`, `POST /clinical/prescriptions`, `POST /clinical/lab/orders` |
| `/portal/reception` | sample rows | `GET /appointments`, `POST /appointments/:id/check-in`, `POST /billing/invoices/:id/mark-paid` |
| `/portal/nurse` | sample rows | `GET/PATCH /admin/beds` |
| `/portal/pharmacy` | sample rows | `/pharmacy/orders`, `/pharmacy/items` (CRUD, `/adjust`) |
| `/portal/laboratory` | sample rows | `GET /clinical/lab/orders`, `PATCH /clinical/lab/orders/:id` |
| `/portal/hr` | sample rows | `/hr/staff`, `/hr/leaves`, `/hr/advances`, `/hr/payroll`, `POST /hr/payroll/generate` |
| `/portal/finance` | sample rows | `GET /billing/invoices`, `/billing/payments`, `GET /admin/analytics` |
| `/portal/ambulance` | sample rows | `/ambulance/requests`, `/ambulance/vehicles`, `POST /ambulance/vehicles/:id/position` |
| `/portal/branch-admin`, `/portal/super-admin` | sample rows | `/admin/cms/*`, `/admin/reviews`, `/admin/messages`, `/admin/users`, `/admin/audit-logs`, `/admin/analytics` |

PayHere checkout: call `POST /billing/invoices/:id/pay`, then build an HTML `<form method="POST" action={action}>` with one hidden input per entry in `fields`, and submit it. PayHere calls `POST /billing/payhere/notify` (server to server) to confirm; the invoice becomes PAID only after that verified call.
