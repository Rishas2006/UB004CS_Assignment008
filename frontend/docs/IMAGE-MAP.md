# Image map (where each photo is used)
All files are in `public/images`. Paths are centralised in `lib/images.ts`; components are in `components/Photo.tsx`.

| File | Used on |
|---|---|
| dept-cardiology / orthopaedics / neurology / obgyn / oncology | Department cards (home, /departments), doctor cards (home, /doctors) and doctor profile banner for that department |
| clinic-room | ENT & Eye department, /gallery |
| svc-video | General Medicine department, Video service, /video-consultation banner |
| ward-beds | Nephrology & Dialysis, Dialysis service, /operations and /rooms banners, /gallery |
| svc-emergency | Emergency service card, /emergency and /ambulance banners, home "Inside RH" |
| svc-surgery | Surgery service card and detail banner, home "Inside RH" |
| svc-laboratory | Laboratory service, /laboratory banner |
| svc-pharmacy, svc-pharmacy-delivery | Pharmacy service, /pharmacy (two photos) |
| svc-preventive | Preventive service, /health-packages and /promotions banners |
| svc-nutrition | Nutrition service, /canteen |
| svc-international | /international banner |
| canteen-hall, canteen-tray | /canteen |
| staff-team | /about, /doctors, /directors, /careers banners |

Paediatrics, Physiotherapy and Blood bank have no photo yet and show a blue gradient cover with an icon. Add a photo in `lib/images.ts` (`deptImage` / `serviceImage`) and it appears everywhere automatically.

Doctor cards use the *department* photo as the cover with the doctor's initials, because the supplied photos are department scenes, not portraits of the named (sample) doctors.

## Added in round 2
| File | Used on |
|---|---|
| dept-paediatrics | Paediatrics department (cards, doctor covers, gallery) |
| svc-physio | Physiotherapy service card + detail banner |
| svc-bloodbank | Blood bank service card + detail banner |
| dir-chairman, dir-md, dir-prof, dir-bandara | /directors portraits (Chairman, Managing Director, Clinical Governance, Independent Director). Ms. N. Fernando and Ms. P. de Silva still show initials until you add photos in `directorImage` (lib/images.ts) |
| award-trophy, award-certificate, award-team | /awards photo strip, award cards, /gallery |
| awards-reports-infographic | bottom of /awards |
| annual-report-2026, report-presenter | top of /reports (also two 2026 report entries added) |
