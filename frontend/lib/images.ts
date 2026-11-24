// Central place for every photo used on the site. File names live in /public/images.
export const IMG = {
  team: "/images/staff-team.jpg",
  heroTeam: "/images/doctors-team.jpg",
  surgery: "/images/svc-surgery.jpg",
  ward: "/images/ward-beds.jpg",
  clinic: "/images/clinic-room.jpg",
  lab: "/images/svc-laboratory.jpg",
  emergency: "/images/svc-emergency.jpg",
  pharmacyShelves: "/images/svc-pharmacy.jpg",
  pharmacyDelivery: "/images/svc-pharmacy-delivery.jpg",
  preventive: "/images/svc-preventive.jpg",
  international: "/images/svc-international.jpg",
  video: "/images/svc-video.jpg",
  nutrition: "/images/svc-nutrition.jpg",
  canteenHall: "/images/canteen-hall.jpg",
  canteenTray: "/images/canteen-tray.jpg",
  lounge: "/images/waiting-lounge.jpg",
  annualReport: "/images/annual-report-2026.jpg",
  reportPresenter: "/images/report-presenter.jpg",
  awardsInfographic: "/images/awards-reports-infographic.jpg",
  trophy: "/images/award-trophy.jpg",
  certificate: "/images/award-certificate.jpg",
  awardTeam: "/images/award-team.jpg",
} as const;

/** Department id -> photo (departments without a photo get a gradient + icon cover). */
export const deptImage: Record<string, string | undefined> = {
  cardiology: "/images/dept-cardiology.jpg",
  orthopaedics: "/images/dept-orthopaedics.jpg",
  neurology: "/images/dept-neurology.jpg",
  obgyn: "/images/dept-obgyn.jpg",
  oncology: "/images/dept-oncology.jpg",
  ent: IMG.clinic,
  general: IMG.video,
  nephrology: IMG.ward,
  paediatrics: "/images/dept-paediatrics.jpg",
};

/** Service slug -> photo. */
export const serviceImage: Record<string, string | undefined> = {
  emergency: IMG.emergency,
  laboratory: IMG.lab,
  surgery: IMG.surgery,
  nutrition: IMG.nutrition,
  dialysis: IMG.ward,
  pharmacy: IMG.pharmacyShelves,
  preventive: IMG.preventive,
  video: IMG.video,
  physiotherapy: "/images/svc-physio.jpg",
  "blood-bank": "/images/svc-bloodbank.jpg",
};

/** Board member name -> portrait (members without a photo show initials). */
export const directorImage: Record<string, string | undefined> = {
  "Mr. R. Hettiarachchi": "/images/dir-chairman.jpg",
  "Dr. S. Wijeratne": "/images/dir-md.jpg",
  "Prof. K. Rajasingham": "/images/dir-prof.jpg",
  "Mr. A. Bandara": "/images/dir-bandara.jpg",
  "Ms. N. Fernando": "/images/dir-fernando.jpg",
  "Ms. P. de Silva": "/images/dir-deSilva.jpg",
};

/** Award name -> photo. */
export const awardImage: Record<string, string | undefined> = {
  "Healthcare Excellence Award": IMG.certificate,
  "Best Hospital of the Year": IMG.trophy,
  "Patient Safety Award": IMG.awardTeam,
};
