# RH Hospital — Frontend v2 (Blue brand, EN / සිං / தமிழ்)

Next.js 14 + Tailwind + Framer Motion + Lucide icons. Frontend with sample data; the AI routes work with or without an API key.

## Run
```bash
npm install
cp .env.local.example .env.local   # optional: add ANTHROPIC_API_KEY for live AI Doc replies
npm run dev                    # http://localhost:3000
npm run typecheck && npm run build
```

## What is new in v2
- **Brand**: blue RH theme from your mock-ups (logo with pulse line, "Your Health, Our Priority", doctors photo, AI robot, lab icon, lounge photo in `public/images`). Mock-up images are kept in `docs/design-reference`.
- **Trilingual**: language switch (EN / සිං / தமிழ்) in header, footer, auth and portal. UI text lives in `lib/i18n/dict.ts` (type-checked: every key must exist in all 3 languages). Page content uses `{en, si, ta}` objects in `lib/data.ts`; items with only English text fall back to English. Noto Sans Sinhala/Tamil fonts and taller line height are applied.
- **Animations** (Framer Motion, respects reduced-motion): drawing ECG line, hero float cards, count-up stats, staggered cards, animated bars/charts, booking step transitions, success check, live pulse dots, page transitions, chat open/typing dots.
- **Icons**: Lucide everywhere via `components/Icon.tsx`.
- **AI Doc chat** (floating robot button): red-flag check first (EN/SI/TA) -> emergency card with 1990/hotline; then `/api/ai/chat` (Claude, server-side key) with rule-based fallback; quick chips, WhatsApp/human hand-off, disclaimer.
- **AI symptom checker** `/symptom-checker` -> `/api/ai/symptom` (urgency + department, never a diagnosis).
- **All Project Book public pages**: about, services (+detail), departments, find-doctor filters (+profile), branches (OSM map), packages, laboratory catalogue, emergency + ambulance request, ambulance tracking, international, news (+article), FAQs, gallery (lightbox), careers (CV form), awards, reports, directors, policies, promotions, canteen, reviews, contact (+WhatsApp), operations (beds, parking, hours, open-now), rooms, pharmacy tracking, video consultation, QR health card, live queue display.
- **Patient flow**: 4-step booking wizard with slot grid, earliest slot hint and video option; register (password strength) -> 6-digit OTP -> patient portal; login with role tabs.
- **11 role portals** `/portal/[role]`: patient, doctor, nurse, reception, pharmacy, laboratory, hr, finance, ambulance, branch-admin, super-admin.

## Backend connection
The site reads and writes through the REST API in `../backend` (PostgreSQL on Supabase). If the API is offline the public pages fall back to the sample data in `lib/data.ts`.
- Local: `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`.
- Vercel (root directory `frontend`): `NEXT_PUBLIC_API_URL=/api/v1` and `BACKEND_URL=https://<your-api>.vercel.app`; `next.config.mjs` rewrites `/api/v1/*` to the API so login cookies are first-party. `BACKEND_URL` must be set before the build.
- Full deployment steps: root `README.md` → Deployment.

## Before showing / launching
- Sinhala and Tamil text must be proofread by native speakers (medical wording especially).
- Doctor names, prices, branch phones, board names are placeholders.
- Health content needs doctor review. The AI never diagnoses.
- Images shown are the ones you supplied; confirm you have the right to use them.
