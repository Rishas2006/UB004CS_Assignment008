import { l, type L, type Tr } from "./i18n/dict";
import type { IconName } from "../components/Icon";

export const HOTLINE = process.env.NEXT_PUBLIC_HOTLINE || "+94111234567";
export const HOTLINE_LABEL = "+94 11 123 4567";
export const WHATSAPP =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "94111234567";
export const SUWA_SERIYA = "1990";

// ---------- branches ----------
export const branches = [
  {
    id: "colombo",
    name: l(
      "Colombo (Head Office)",
      "කොළඹ (ප්‍රධාන කාර්යාලය)",
      "கொழும்பு (தலைமையகம்)",
    ),
    address: "123 Health Care Avenue, Colombo 01",
    phone: "+94 11 123 4567",
    lat: 6.9271,
    lng: 79.8612,
  },
  {
    id: "kandy",
    name: l("Kandy", "මහනුවර", "கண்டி"),
    address: "45 Temple Road, Kandy",
    phone: "+94 81 223 4567",
    lat: 7.2906,
    lng: 80.6337,
  },
  {
    id: "galle",
    name: l("Galle", "ගාල්ල", "காலி"),
    address: "12 Fort Road, Galle",
    phone: "+94 91 223 4567",
    lat: 6.0535,
    lng: 80.221,
  },
  {
    id: "jaffna",
    name: l("Jaffna", "යාපනය", "யாழ்ப்பாணம்"),
    address: "78 Hospital Road, Jaffna",
    phone: "+94 21 222 4567",
    lat: 9.6615,
    lng: 80.0255,
  },
] as const;
export type BranchId = (typeof branches)[number]["id"];

// ---------- departments ----------
export const departments: {
  id: string;
  icon: IconName;
  name: L;
  desc: L;
  centre?: boolean;
}[] = [
  {
    id: "cardiology",
    icon: "heartpulse",
    centre: true,
    name: l("Cardiology", "හෘද රෝග", "இதயவியல்"),
    desc: l(
      "Heart checks, ECG, echo and long-term cardiac care.",
      "හෘද පරීක්ෂා, ECG, එකෝ සහ දිගුකාලීන හෘද සත්කාර.",
      "இதயப் பரிசோதனை, ECG, எக்கோ மற்றும் நீண்டகால இதய சிகிச்சை.",
    ),
  },
  {
    id: "orthopaedics",
    icon: "bone",
    centre: true,
    name: l("Orthopaedics", "ඇට රෝග", "எலும்பியல்"),
    desc: l(
      "Bones, joints, sports injuries and joint replacement.",
      "ඇටකටු, සන්ධි, ක්‍රීඩා තුවාල සහ සන්ධි ප්‍රතිස්ථාපනය.",
      "எலும்பு, மூட்டு, விளையாட்டுக் காயங்கள் மற்றும் மூட்டு மாற்று சிகிச்சை.",
    ),
  },
  {
    id: "neurology",
    icon: "brain",
    name: l("Neurology", "ස්නායු රෝග", "நரம்பியல்"),
    desc: l(
      "Headache, stroke, epilepsy and nerve disorders.",
      "හිසරදය, ආඝාතය, අපස්මාරය සහ ස්නායු රෝග.",
      "தலைவலி, பக்கவாதம், வலிப்பு மற்றும் நரம்புக் கோளாறுகள்.",
    ),
  },
  {
    id: "paediatrics",
    icon: "baby",
    name: l("Paediatrics", "ළමා රෝග", "குழந்தை மருத்துவம்"),
    desc: l(
      "Child health, vaccination and growth monitoring.",
      "ළමා සෞඛ්‍යය, එන්නත් සහ වර්ධන නිරීක්ෂණය.",
      "குழந்தை நலம், தடுப்பூசி மற்றும் வளர்ச்சிக் கண்காணிப்பு.",
    ),
  },
  {
    id: "obgyn",
    icon: "heart",
    name: l(
      "Obstetrics & Gynaecology",
      "ප්‍රසව හා ගැබ්ගැනීම",
      "மகப்பேறு & மகளிர் மருத்துவம்",
    ),
    desc: l(
      "Pregnancy care, delivery and women’s health.",
      "ගර්භණී සත්කාර, ප්‍රසූතිය සහ කාන්තා සෞඛ්‍යය.",
      "கர்ப்பகால பராமரிப்பு, பிரசவம் மற்றும் பெண்கள் நலம்.",
    ),
  },
  {
    id: "general",
    icon: "stethoscope",
    name: l("General Medicine", "සාමාන්‍ය වෛද්‍ය", "பொது மருத்துவம்"),
    desc: l(
      "Fever, infections, diabetes, blood pressure and check-ups.",
      "උණ, ආසාදන, දියවැඩියාව, රුධිර පීඩනය සහ පරීක්ෂා.",
      "காய்ச்சல், தொற்று, நீரிழிவு, இரத்த அழுத்தம் மற்றும் பரிசோதனை.",
    ),
  },
  {
    id: "nephrology",
    icon: "droplets",
    name: l(
      "Nephrology & Dialysis",
      "වකුගඩු රෝග සහ ඩයලිසිස්",
      "சிறுநீரகவியல் & டயாலிசிஸ்",
    ),
    desc: l(
      "Kidney care and dialysis sessions.",
      "වකුගඩු සත්කාර සහ ඩයලිසිස් සැසි.",
      "சிறுநீரக பராமரிப்பு மற்றும் டயாலிசிஸ் அமர்வுகள்.",
    ),
  },
  {
    id: "ent",
    icon: "eye",
    name: l("ENT & Eye", "කන් නාසා ගෙල සහ ඇස්", "காது மூக்கு தொண்டை & கண்"),
    desc: l(
      "Ear, nose, throat and eye care.",
      "කන්, නාසය, ගෙල සහ ඇස් සත්කාර.",
      "காது, மூக்கு, தொண்டை மற்றும் கண் பராமரிப்பு.",
    ),
  },
  {
    id: "oncology",
    icon: "shieldcheck",
    name: l("Oncology", "පිළිකා රෝග", "புற்றுநோயியல்"),
    desc: l(
      "Cancer screening, treatment planning and supportive care.",
      "පිළිකා පරීක්ෂා, ප්‍රතිකාර සැලසුම් සහ සහාය සත්කාර.",
      "புற்றுநோய் பரிசோதனை, சிகிச்சைத் திட்டம் மற்றும் ஆதரவு பராமரிப்பு.",
    ),
  },
];
export const deptName = (id: string) =>
  departments.find((d) => d.id === id)?.name;

// ---------- doctors (sample profiles; replace with approved staff data) ----------
export type Doctor = {
  id: string;
  name: string;
  initials: string;
  dept: string;
  branch: BranchId;
  exp: number;
  langs: ("en" | "si" | "ta")[];
  video: boolean;
  resident: boolean;
  fee: number;
  days: string;
  slmc: string;
};
export const doctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Anjali Perera",
    initials: "AP",
    dept: "cardiology",
    branch: "colombo",
    exp: 14,
    langs: ["en", "si"],
    video: true,
    resident: true,
    fee: 3500,
    days: "Mon–Fri 09:00–12:00",
    slmc: "SLMC 20431",
  },
  {
    id: "d2",
    name: "Dr. Nimal Fernando",
    initials: "NF",
    dept: "neurology",
    branch: "colombo",
    exp: 18,
    langs: ["en", "si"],
    video: true,
    resident: true,
    fee: 4000,
    days: "Tue, Thu 14:00–17:00",
    slmc: "SLMC 18820",
  },
  {
    id: "d3",
    name: "Dr. Sarah Jayasinghe",
    initials: "SJ",
    dept: "paediatrics",
    branch: "kandy",
    exp: 11,
    langs: ["en", "si", "ta"],
    video: false,
    resident: true,
    fee: 2500,
    days: "Mon–Sat 09:00–13:00",
    slmc: "SLMC 22107",
  },
  {
    id: "d4",
    name: "Dr. Kavindu Silva",
    initials: "KS",
    dept: "orthopaedics",
    branch: "galle",
    exp: 16,
    langs: ["en", "si"],
    video: true,
    resident: false,
    fee: 3500,
    days: "Mon, Wed, Fri 15:00–18:00",
    slmc: "SLMC 19654",
  },
  {
    id: "d5",
    name: "Dr. Priya Rajendran",
    initials: "PR",
    dept: "obgyn",
    branch: "jaffna",
    exp: 12,
    langs: ["en", "ta"],
    video: true,
    resident: true,
    fee: 3000,
    days: "Mon–Fri 10:00–13:00",
    slmc: "SLMC 21340",
  },
  {
    id: "d6",
    name: "Dr. Ruwan Jayasuriya",
    initials: "RJ",
    dept: "general",
    branch: "colombo",
    exp: 9,
    langs: ["en", "si", "ta"],
    video: true,
    resident: true,
    fee: 2000,
    days: "Daily 08:00–20:00",
    slmc: "SLMC 23518",
  },
  {
    id: "d7",
    name: "Dr. Thilini Wickramasinghe",
    initials: "TW",
    dept: "ent",
    branch: "kandy",
    exp: 10,
    langs: ["en", "si"],
    video: false,
    resident: false,
    fee: 2800,
    days: "Tue, Sat 09:00–12:00",
    slmc: "SLMC 22790",
  },
  {
    id: "d8",
    name: "Dr. Suresh Kumar",
    initials: "SK",
    dept: "nephrology",
    branch: "colombo",
    exp: 15,
    langs: ["en", "ta"],
    video: true,
    resident: true,
    fee: 3800,
    days: "Mon–Thu 09:00–12:00",
    slmc: "SLMC 19911",
  },
  {
    id: "d9",
    name: "Dr. Maya Gunawardena",
    initials: "MG",
    dept: "cardiology",
    branch: "galle",
    exp: 8,
    langs: ["en", "si"],
    video: true,
    resident: false,
    fee: 3000,
    days: "Wed, Fri 10:00–13:00",
    slmc: "SLMC 24006",
  },
  {
    id: "d10",
    name: "Dr. Arun Thevarajah",
    initials: "AT",
    dept: "general",
    branch: "jaffna",
    exp: 13,
    langs: ["en", "ta"],
    video: true,
    resident: true,
    fee: 2000,
    days: "Mon–Sat 09:00–17:00",
    slmc: "SLMC 20155",
  },
  {
    id: "d11",
    name: "Dr. Ishara Madushani",
    initials: "IM",
    dept: "oncology",
    branch: "colombo",
    exp: 12,
    langs: ["en", "si"],
    video: true,
    resident: true,
    fee: 4200,
    days: "Mon, Wed 09:00–13:00",
    slmc: "SLMC 22911",
  },
];
export const specialtyOf = (d: Doctor) => deptName(d.dept)!;

// ---------- services ----------
export type Service = {
  slug: string;
  icon: IconName;
  name: L;
  desc: L;
  points: Tr[];
  hours?: string;
};
export const services: Service[] = [
  {
    slug: "emergency",
    icon: "siren",
    name: l("Emergency treatment", "හදිසි ප්‍රතිකාර", "அவசர சிகிச்சை"),
    desc: l(
      "Round-the-clock emergency support when every moment matters.",
      "සෑම මොහොතක්ම වැදගත් වන විට පැය 24ම හදිසි සහාය.",
      "ஒவ்வொரு கணமும் முக்கியமான போது 24 மணி நேர அவசர ஆதரவு.",
    ),
    points: [
      { en: "Triage by trained emergency nurses" },
      { en: "Resuscitation bay and observation beds" },
      { en: "Ambulance dispatch with live tracking" },
    ],
    hours: "24/7",
  },
  {
    slug: "laboratory",
    icon: "flask",
    name: l(
      "Laboratory & diagnostics",
      "විද්‍යාගාර සහ රෝග නිර්ණය",
      "ஆய்வகம் & நோயறிதல்",
    ),
    desc: l(
      "Modern testing with online reports released after review.",
      "සමාලෝචනයෙන් පසු මාර්ගගතව නිකුත් වන නවීන පරීක්ෂණ.",
      "மதிப்பாய்வுக்குப் பிறகு ஆன்லைனில் வெளியாகும் நவீன பரிசோதனைகள்.",
    ),
    points: [
      { en: "Blood, urine and hormone tests" },
      { en: "X-ray, ultrasound and ECG" },
      { en: "Results available in the patient portal" },
    ],
    hours: "06:00–22:00",
  },
  {
    slug: "surgery",
    icon: "scissors",
    name: l(
      "Surgery & theatres",
      "ශල්‍යකර්ම සහ රඟහල්",
      "அறுவை சிகிச்சை & அரங்குகள்",
    ),
    desc: l(
      "Day-case and major surgery with modern theatres.",
      "දිනපතා සහ ප්‍රධාන ශල්‍යකර්ම නවීන රඟහල්වල.",
      "நவீன அரங்குகளில் நாள்நிலை மற்றும் பெரிய அறுவை சிகிச்சைகள்.",
    ),
    points: [
      { en: "Pre-operative assessment clinic" },
      { en: "Modular theatres with recovery rooms" },
      { en: "Clear estimates before admission" },
    ],
  },
  {
    slug: "physiotherapy",
    icon: "dumbbell",
    name: l(
      "Physiotherapy clinic",
      "භෞත චිකිත්සා සායනය",
      "இயன்முறை சிகிச்சை மையம்",
    ),
    desc: l(
      "Rehabilitation after injury, surgery or stroke.",
      "තුවාල, ශල්‍යකර්ම හෝ ආඝාතයෙන් පසු පුනරුත්ථාපනය.",
      "காயம், அறுவை சிகிச்சை அல்லது பக்கவாதத்திற்குப் பின் மறுவாழ்வு.",
    ),
    points: [
      { en: "Personal exercise plans" },
      { en: "Sports and back-pain programmes" },
    ],
    hours: "08:00–18:00",
  },
  {
    slug: "blood-bank",
    icon: "droplets",
    name: l("Blood bank", "රුධිර බැංකුව", "இரத்த வங்கி"),
    desc: l(
      "Safe screened blood and component support.",
      "පරීක්ෂා කළ ආරක්ෂිත රුධිර සහ සංඝටක සහාය.",
      "பரிசோதிக்கப்பட்ட பாதுகாப்பான இரத்தம் மற்றும் கூறுகள்.",
    ),
    points: [
      { en: "Donor registration and screening" },
      { en: "Emergency blood availability" },
    ],
    hours: "24/7",
  },
  {
    slug: "nutrition",
    icon: "apple",
    name: l(
      "Nutrition & dietetics",
      "පෝෂණ සහ ආහාර විද්‍යාව",
      "ஊட்டச்சத்து & உணவியல்",
    ),
    desc: l(
      "Diet plans for diabetes, heart health and weight.",
      "දියවැඩියාව, හෘද සෞඛ්‍යය සහ බර සඳහා ආහාර සැලසුම්.",
      "நீரிழிவு, இதய நலம் மற்றும் எடைக்கான உணவுத் திட்டங்கள்.",
    ),
    points: [
      { en: "Dietitian consultations" },
      { en: "Meal plans using local foods" },
    ],
    hours: "09:00–16:00",
  },
  {
    slug: "dialysis",
    icon: "droplets",
    name: l("Dialysis unit", "ඩයලිසිස් ඒකකය", "டயாலிசிஸ் பிரிவு"),
    desc: l(
      "Comfortable haemodialysis sessions booked as appointments.",
      "වේලාවන් ලෙස වෙන්කරන පහසු රුධිර ඩයලිසිස් සැසි.",
      "சந்திப்பாக முன்பதிவு செய்யும் வசதியான ஹீமோடயாலிசிஸ் அமர்வுகள்.",
    ),
    points: [
      { en: "Dedicated dialysis ward" },
      { en: "Scheduled recurring sessions" },
    ],
  },
  {
    slug: "pharmacy",
    icon: "pill",
    name: l("Pharmacy", "ඖෂධ ශාලාව", "மருந்தகம்"),
    desc: l(
      "Prescription dispensing with home delivery.",
      "නිවසටම බෙදාහැරීම සහිත බෙහෙත් නිකුත් කිරීම.",
      "வீட்டு விநியோகத்துடன் மருந்து வழங்கல்.",
    ),
    points: [
      { en: "Stock alerts and expiry control" },
      { en: "Pickup or delivery with status tracking" },
    ],
    hours: "24/7",
  },
  {
    slug: "preventive",
    icon: "shieldcheck",
    name: l(
      "Preventive healthcare",
      "වැළැක්වීමේ සෞඛ්‍ය සේවා",
      "தடுப்பு சுகாதாரம்",
    ),
    desc: l(
      "Screening and healthy-living guidance reviewed by doctors.",
      "වෛද්‍යවරුන් විසින් සමාලෝචනය කළ පරීක්ෂා සහ සෞඛ්‍ය උපදෙස්.",
      "மருத்துவர்கள் மதிப்பாய்வு செய்த பரிசோதனை மற்றும் ஆரோக்கிய வழிகாட்டல்.",
    ),
    points: [
      { en: "Screening packages by age and risk" },
      { en: "Vaccination and lifestyle advice" },
    ],
  },
  {
    slug: "video",
    icon: "video",
    name: l("Video consultation", "වීඩියෝ උපදේශනය", "வீடியோ ஆலோசனை"),
    desc: l(
      "See a doctor from home, then get your prescription online.",
      "නිවසේ සිට වෛද්‍යවරයෙකු හමුවී බෙහෙත් වට්ටෝරුව මාර්ගගතව ලබාගන්න.",
      "வீட்டிலிருந்தே மருத்துவரைப் பார்த்து மருந்துச் சீட்டை ஆன்லைனில் பெறுங்கள்.",
    ),
    points: [
      { en: "Secure private room per appointment" },
      { en: "Prescription PDF and pharmacy order after the call" },
    ],
  },
];

// ---------- packages ----------
export const packages = [
  {
    id: "basic",
    icon: "heartpulse" as IconName,
    price: 7500,
    discount: 6500,
    name: l(
      "Basic health check",
      "මූලික සෞඛ්‍ය පරීක්ෂාව",
      "அடிப்படை சுகாதாரப் பரிசோதனை",
    ),
    tests: [
      "Full blood count",
      "Fasting blood sugar",
      "Lipid profile",
      "BMI & blood pressure",
    ],
  },
  {
    id: "executive",
    icon: "briefcase" as IconName,
    price: 22000,
    discount: 19500,
    name: l("Executive check", "විධායක පරීක්ෂාව", "நிர்வாகப் பரிசோதனை"),
    tests: [
      "Basic check tests",
      "Liver & kidney profile",
      "ECG",
      "Chest X-ray",
      "Doctor review",
    ],
  },
  {
    id: "cardiac",
    icon: "heart" as IconName,
    price: 18000,
    discount: 16000,
    name: l("Cardiac screening", "හෘද පරීක්ෂාව", "இதயப் பரிசோதனை"),
    tests: [
      "ECG",
      "Echocardiogram",
      "Lipid profile",
      "Cardiologist consultation",
    ],
  },
  {
    id: "women",
    icon: "sparkles" as IconName,
    price: 16500,
    discount: 14500,
    name: l("Women’s wellness", "කාන්තා සුවතා පැකේජය", "பெண்கள் நலத் தொகுப்பு"),
    tests: [
      "Pap smear",
      "Breast examination",
      "Thyroid profile",
      "Gynaecologist consultation",
    ],
  },
  {
    id: "senior",
    icon: "users" as IconName,
    price: 20000,
    discount: 18000,
    name: l("Senior care", "වැඩිහිටි සත්කාර", "முதியோர் பராமரிப்பு"),
    tests: [
      "Bone density",
      "Eye & hearing screen",
      "Blood sugar & pressure",
      "Physician review",
    ],
  },
  {
    id: "diabetes",
    icon: "droplets" as IconName,
    price: 9500,
    discount: 8500,
    name: l("Diabetes care", "දියවැඩියා සත්කාර", "நீரிழிவு பராமரிப்பு"),
    tests: ["HbA1c", "Kidney profile", "Foot & eye check", "Dietitian session"],
  },
];

// ---------- lab tests ----------
export const labTests = [
  ["LAB-FBC", "Full blood count", "Blood", 1200, 4],
  ["LAB-FBS", "Fasting blood sugar", "Blood", 600, 2],
  ["LAB-HBA1C", "HbA1c", "Blood", 2200, 6],
  ["LAB-LIP", "Lipid profile", "Blood", 2800, 6],
  ["LAB-LFT", "Liver function tests", "Blood", 3200, 8],
  ["LAB-RFT", "Renal function tests", "Blood", 3000, 8],
  ["LAB-TSH", "Thyroid (TSH)", "Hormone", 2500, 12],
  ["LAB-VITD", "Vitamin D", "Blood", 6500, 24],
  ["LAB-UFR", "Urine full report", "Urine", 700, 2],
  ["LAB-DENG", "Dengue NS1 antigen", "Infection", 3500, 4],
  ["LAB-CRP", "C-reactive protein", "Blood", 1800, 4],
  ["LAB-ECG", "ECG", "Cardiac", 1500, 1],
  ["LAB-XRC", "Chest X-ray", "Imaging", 2500, 1],
  ["LAB-USA", "Ultrasound abdomen", "Imaging", 4500, 2],
  ["LAB-ECHO", "Echocardiogram", "Cardiac", 8500, 2],
  ["LAB-PSA", "PSA", "Hormone", 3800, 12],
] as [string, string, string, number, number][];

// ---------- content ----------
export const announcements: {
  id: string;
  sev: "info" | "warning" | "urgent";
  text: L;
}[] = [
  {
    id: "a1",
    sev: "info",
    text: l(
      "New cardiac centre opens at the Colombo branch this month.",
      "මෙම මාසයේ කොළඹ ශාඛාවේ නව හෘද මධ්‍යස්ථානයක් විවෘත වේ.",
      "இந்த மாதம் கொழும்பு கிளையில் புதிய இதய மையம் திறக்கப்படுகிறது.",
    ),
  },
  {
    id: "a2",
    sev: "warning",
    text: l(
      "Holiday clinic hours apply on public holidays. Emergency care stays open 24/7.",
      "රජයේ නිවාඩු දිනවල සායන වේලාවන් වෙනස් වේ. හදිසි සේවය 24/7 විවෘතයි.",
      "பொது விடுமுறை நாட்களில் மருத்துவ நிலைய நேரங்கள் மாறும். அவசர சிகிச்சை 24/7 திறந்திருக்கும்.",
    ),
  },
];
export const promotions = [
  {
    id: "p1",
    until: "2026-12-31",
    title: l(
      "Health checkup offer",
      "සෞඛ්‍ය පරීක්ෂා දීමනාව",
      "சுகாதாரப் பரிசோதனை சலுகை",
    ),
    desc: l(
      "Save up to 15% on selected health packages this season.",
      "මෙම කාලයේ තෝරාගත් සෞඛ්‍ය පැකේජ මත 15% දක්වා ඉතිරි කරගන්න.",
      "இந்தப் பருவத்தில் தேர்ந்தெடுத்த தொகுப்புகளில் 15% வரை சேமியுங்கள்.",
    ),
  },
  {
    id: "p2",
    until: "2026-12-15",
    title: l(
      "Free first dietitian visit",
      "නොමිලේ පළමු ආහාර උපදේශනය",
      "முதல் உணவியல் ஆலோசனை இலவசம்",
    ),
    desc: l(
      "Book any package and get a dietitian visit included.",
      "ඕනෑම පැකේජයක් වෙන්කර ආහාර උපදේශනයක් ඇතුළත් කරගන්න.",
      "எந்த தொகுப்பையும் முன்பதிவு செய்து உணவியல் ஆலோசனையைப் பெறுங்கள்.",
    ),
  },
  {
    id: "p3",
    until: "2027-01-31",
    title: l(
      "Family vaccination week",
      "පවුල් එන්නත් සතිය",
      "குடும்பத் தடுப்பூசி வாரம்",
    ),
    desc: l(
      "Walk-in vaccination support for children and adults.",
      "ළමුන් සහ වැඩිහිටියන් සඳහා එන්නත් සහාය.",
      "குழந்தைகள் மற்றும் பெரியவர்களுக்கான தடுப்பூசி உதவி.",
    ),
  },
];
export const news: {
  slug: string;
  date: string;
  cat: L;
  title: L;
  body: Tr;
}[] = [
  {
    slug: "new-cardiac-centre",
    date: "2026-11-04",
    cat: l("Centre of excellence", "විශිෂ්ටතා මධ්‍යස්ථාන", "சிறப்பு மையம்"),
    title: l(
      "New cardiac centre opens at Colombo",
      "කොළඹ නව හෘද මධ්‍යස්ථානය විවෘත වේ",
      "கொழும்பில் புதிய இதய மையம் திறப்பு",
    ),
    body: {
      en: "RH Hospital is opening an upgraded cardiac centre with ECG, echocardiography and a dedicated cardiology clinic for same-week appointments. Patients can book online or through the hotline.",
    },
  },
  {
    slug: "trilingual-portal",
    date: "2026-10-28",
    cat: l("Digital health", "ඩිජිටල් සෞඛ්‍ය", "டிஜிட்டல் சுகாதாரம்"),
    title: l(
      "Patient portal now in English, Sinhala and Tamil",
      "රෝගී ද්වාරය දැන් සිංහල, දෙමළ සහ ඉංග්‍රීසියෙන්",
      "நோயாளி தளம் இப்போது தமிழ், சிங்களம், ஆங்கிலத்தில்",
    ),
    body: {
      en: "Booking, records and payments are available in all three languages so every family can use RH services comfortably.",
    },
  },
  {
    slug: "qr-health-card",
    date: "2026-10-20",
    cat: l("Digital health", "ඩිජිටල් සෞඛ්‍ය", "டிஜிட்டல் சுகாதாரம்"),
    title: l(
      "Introducing the RH QR health card",
      "RH QR සෞඛ්‍ය කාඩ්පත හඳුන්වා දෙමු",
      "RH QR சுகாதார அட்டை அறிமுகம்",
    ),
    body: {
      en: "Scan at reception for fast check-in. The QR holds only a secure random token, never medical details.",
    },
  },
  {
    slug: "heart-health-tips",
    date: "2026-10-12",
    cat: l("Preventive healthcare", "වැළැක්වීමේ සෞඛ්‍ය", "தடுப்பு சுகாதாரம்"),
    title: l(
      "Five everyday habits for a healthier heart",
      "සෞඛ්‍ය සම්පන්න හදවතක් සඳහා දෛනික පුරුදු පහක්",
      "ஆரோக்கியமான இதயத்திற்கான ஐந்து அன்றாடப் பழக்கங்கள்",
    ),
    body: {
      en: "Walk daily, reduce salt, avoid tobacco, sleep well and keep regular check-ups. Reviewed by our cardiology team.",
    },
  },
  {
    slug: "ambulance-tracking",
    date: "2026-10-02",
    cat: l("Emergency", "හදිසි", "அவசரம்"),
    title: l(
      "Live ambulance tracking for families",
      "පවුල් සඳහා සජීවී ගිලන්රථ ලුහුබැඳීම",
      "குடும்பங்களுக்கான நேரடி ஆம்புலன்ஸ் கண்காணிப்பு",
    ),
    body: {
      en: "Follow your ambulance on a live map with an estimated arrival time. For life-threatening cases always call 1990 first.",
    },
  },
];
export const faqs: { id: string; cat: string; q: L; a: L }[] = [
  {
    id: "f1",
    cat: "booking",
    q: l(
      "How do I book an appointment?",
      "වේලාවක් වෙන්කරන්නේ කෙසේද?",
      "நேரத்தை எப்படி முன்பதிவு செய்வது?",
    ),
    a: l(
      "Choose a department, a doctor, a date and a free slot on the booking page. You will receive a confirmation email.",
      "වෙන්කිරීමේ පිටුවේ දෙපාර්තමේන්තුවක්, වෛද්‍යවරයෙකු, දිනයක් සහ නිදහස් වේලාවක් තෝරන්න. තහවුරු කිරීමේ විද්‍යුත් තැපෑලක් ලැබේ.",
      "முன்பதிவுப் பக்கத்தில் துறை, மருத்துவர், தேதி மற்றும் காலி நேரத்தைத் தேர்ந்தெடுக்கவும். உறுதிப்படுத்தும் மின்னஞ்சல் வரும்.",
    ),
  },
  {
    id: "f2",
    cat: "booking",
    q: l(
      "Can I cancel or reschedule?",
      "අවලංගු කිරීම හෝ වෙනස් කිරීම කළ හැකිද?",
      "ரத்து செய்யவோ மாற்றவோ முடியுமா?",
    ),
    a: l(
      "Yes. Use the links in your reminder email or the patient portal before the appointment time.",
      "ඔව්. වේලාවට පෙර මතක් කිරීමේ විද්‍යුත් තැපෑලේ සබැඳි හෝ රෝගී ද්වාරය භාවිතා කරන්න.",
      "ஆம். நேரத்திற்கு முன் நினைவூட்டல் மின்னஞ்சல் இணைப்புகள் அல்லது நோயாளி தளத்தைப் பயன்படுத்தவும்.",
    ),
  },
  {
    id: "f3",
    cat: "visit",
    q: l(
      "What are the visiting hours?",
      "බැලීමේ වේලාවන් මොනවාද?",
      "பார்வை நேரங்கள் என்ன?",
    ),
    a: l(
      "General wards: 11:00–13:00 and 17:00–19:00. ICU visits are limited; please ask the nurse in charge.",
      "සාමාන්‍ය වාට්ටු: 11:00–13:00 සහ 17:00–19:00. ICU බැලීම් සීමිතයි; භාර හෙදියගෙන් විමසන්න.",
      "பொது வார்டுகள்: 11:00–13:00 மற்றும் 17:00–19:00. ICU வருகை வரையறுக்கப்பட்டது; பொறுப்பு செவிலியரிடம் கேளுங்கள்.",
    ),
  },
  {
    id: "f4",
    cat: "digital",
    q: l(
      "What does the QR health card contain?",
      "QR සෞඛ්‍ය කාඩ්පතේ ඇත්තේ කුමක්ද?",
      "QR சுகாதார அட்டையில் என்ன உள்ளது?",
    ),
    a: l(
      "Only a random secure token. Medical details are visible only to logged-in staff.",
      "අහඹු ආරක්ෂිත ටෝකනයක් පමණි. වෛද්‍ය තොරතුරු දැකිය හැක්කේ ඇතුල් වී සිටින කාර්ය මණ්ඩලයට පමණි.",
      "சீரற்ற பாதுகாப்பான டோக்கன் மட்டுமே. மருத்துவ விவரங்களை உள்நுழைந்த ஊழியர்கள் மட்டுமே பார்க்க முடியும்.",
    ),
  },
  {
    id: "f5",
    cat: "digital",
    q: l(
      "How do video consultations work?",
      "වීඩියෝ උපදේශන ක්‍රියා කරන්නේ කෙසේද?",
      "வீடியோ ஆலோசனை எப்படி செயல்படுகிறது?",
    ),
    a: l(
      "Book a video slot and pay online. A secure link opens a few minutes before your time. The doctor sends your prescription after the call.",
      "වීඩියෝ වේලාවක් වෙන්කර මාර්ගගතව ගෙවන්න. ඔබේ වේලාවට මිනිත්තු කිහිපයකට පෙර ආරක්ෂිත සබැඳියක් විවෘත වේ. ඇමතුමෙන් පසු වෛද්‍යවරයා බෙහෙත් වට්ටෝරුව එවයි.",
      "வீடியோ நேரத்தை முன்பதிவு செய்து ஆன்லைனில் செலுத்தவும். உங்கள் நேரத்திற்கு சில நிமிடங்கள் முன் பாதுகாப்பான இணைப்பு திறக்கும். அழைப்புக்குப் பின் மருத்துவர் மருந்துச் சீட்டை அனுப்புவார்.",
    ),
  },
  {
    id: "f6",
    cat: "billing",
    q: l(
      "Which payment methods are accepted?",
      "ගෙවීම් ක්‍රම මොනවාද?",
      "எந்த கட்டண முறைகள் ஏற்கப்படுகின்றன?",
    ),
    a: l(
      "Online card payments, cash and card at the counter, and bank transfer.",
      "මාර්ගගත කාඩ්පත් ගෙවීම්, කවුන්ටරයේ මුදල් සහ කාඩ්පත්, සහ බැංකු මාරු කිරීම්.",
      "ஆன்லைன் அட்டைக் கட்டணம், கவுண்டரில் பணம் மற்றும் அட்டை, வங்கி மாற்றம்.",
    ),
  },
  {
    id: "f7",
    cat: "emergency",
    q: l(
      "What should I do in an emergency?",
      "හදිසි අවස්ථාවකදී කුමක් කළ යුතුද?",
      "அவசரத்தில் என்ன செய்ய வேண்டும்?",
    ),
    a: l(
      "Call 1990 or the RH 24/7 hotline immediately, or go to the nearest emergency unit. Do not wait for online replies.",
      "වහාම 1990 හෝ RH 24/7 හොට්ලයින් අමතන්න, නැතහොත් ළඟම හදිසි ඒකකයට යන්න. මාර්ගගත පිළිතුරු බලා නොසිටින්න.",
      "உடனே 1990 அல்லது RH 24/7 ஹாட்லைனை அழைக்கவும், அல்லது அருகிலுள்ள அவசரப் பிரிவுக்குச் செல்லவும். ஆன்லைன் பதிலுக்குக் காத்திருக்க வேண்டாம்.",
    ),
  },
  {
    id: "f8",
    cat: "international",
    q: l(
      "Do you help international patients?",
      "විදේශීය රෝගීන්ට උදව් කරනවාද?",
      "வெளிநாட்டு நோயாளிகளுக்கு உதவுகிறீர்களா?",
    ),
    a: l(
      "Yes. Our international desk helps with appointments, estimates, airport pickup and translation.",
      "ඔව්. අපගේ ජාත්‍යන්තර මෙසය වේලාවන්, ඇස්තමේන්තු, ගුවන්තොටුපළ පිටත්කිරීම් සහ පරිවර්තන සඳහා උදව් කරයි.",
      "ஆம். எங்கள் சர்வதேச மையம் சந்திப்பு, மதிப்பீடு, விமான நிலைய வரவேற்பு மற்றும் மொழிபெயர்ப்பில் உதவும்.",
    ),
  },
];
export const awards = [
  ["2026", "Excellence in Patient Experience"],
  ["2025", "Best Digital Hospital Initiative"],
  ["2025", "Quality & Safety Accreditation"],
  ["2024", "Healthcare Excellence Award"],
  ["2024", "Best Hospital of the Year"],
  ["2024", "Patient Safety Award"],
  ["2024", "Green Healthcare Award"],
  ["2023", "Community Health Champion"],
] as [string, string][];
export const reports = [
  ["Annual Report 2026", "2026", "Annual"],
  ["Financial Annual Report 2026", "2026", "Financial"],
  ["Annual Report 2025", "2025", "Annual"],
  ["Financial Statements 2025", "2025", "Financial"],
  ["Annual Report 2024", "2024", "Annual"],
  ["Financial Statements 2024", "2024", "Financial"],
  ["Sustainability Report 2024", "2024", "Sustainability"],
] as [string, string, string][];
export const directors = [
  { name: "Mr. R. Hettiarachchi", role: "Chairman", chair: true },
  { name: "Dr. S. Wijeratne", role: "Managing Director" },
  { name: "Ms. N. Fernando", role: "Director, Finance" },
  { name: "Prof. K. Rajasingham", role: "Director, Clinical Governance" },
  { name: "Mr. A. Bandara", role: "Independent Director" },
  { name: "Ms. P. de Silva", role: "Independent Director" },
];
export const policies = [
  ["Privacy Policy", "Data protection", "v1.2"],
  ["Patient Rights & Responsibilities", "Clinical", "v1.0"],
  ["Medical Disclaimer", "Legal", "v1.0"],
  ["Terms of Use", "Legal", "v1.1"],
  ["Cookie Notice", "Legal", "v1.0"],
  ["Code of Conduct", "Governance", "v2.0"],
] as [string, string, string][];
export const gallery = [
  ["Reception lounge", "/images/waiting-lounge.jpg"],
  ["Hospital campus", "/images/rh-hospital-campus.png"],
  ["Our care team", "/images/staff-team.jpg"],
  ["Operating theatre", "/images/svc-surgery.jpg"],
  ["Inpatient ward", "/images/ward-beds.jpg"],
  ["Cardiology department", "/images/dept-cardiology.jpg"],
  ["Neurology department", "/images/dept-neurology.jpg"],
  ["Orthopaedics department", "/images/dept-orthopaedics.jpg"],
  ["Oncology care", "/images/dept-oncology.jpg"],
  ["Women's health", "/images/dept-obgyn.jpg"],
  ["Clinic room", "/images/clinic-room.jpg"],
  ["Laboratory", "/images/svc-laboratory.jpg"],
  ["Paediatrics", "/images/dept-paediatrics.jpg"],
  ["Physiotherapy", "/images/svc-physio.jpg"],
  ["Blood bank", "/images/svc-bloodbank.jpg"],
  ["Patient Safety Award 2024", "/images/award-team.jpg"],
  ["Healthcare Excellence Award", "/images/award-certificate.jpg"],
  ["Best Hospital of the Year", "/images/award-trophy.jpg"],
  ["Pharmacy", "/images/svc-pharmacy.jpg"],
  ["Pharmacy delivery", "/images/svc-pharmacy-delivery.jpg"],
  ["Emergency unit & ambulance", "/images/svc-emergency.jpg"],
  ["Canteen hall", "/images/canteen-hall.jpg"],
  ["Healthy meals", "/images/svc-nutrition.jpg"],
] as [string, string][];
export const jobs = [
  ["Staff Nurse", "Nursing", "Colombo", "2026-12-20"],
  ["Medical Laboratory Technologist", "Laboratory", "Kandy", "2026-12-18"],
  ["Pharmacist", "Pharmacy", "Galle", "2026-12-22"],
  ["Receptionist", "Front desk", "Colombo", "2026-12-15"],
  ["Full-stack Developer", "IT", "Colombo", "2026-12-30"],
  ["HR Executive", "HR", "Jaffna", "2026-12-28"],
] as [string, string, string, string][];
export const canteen = [
  ["Rice & curry (veg)", "Meals", 450],
  ["Rice & curry (fish)", "Meals", 550],
  ["String hoppers set", "Breakfast", 380],
  ["Egg sandwich", "Snacks", 250],
  ["Fresh fruit bowl", "Healthy", 300],
  ["Vegetable soup", "Healthy", 280],
  ["Tea / Coffee", "Drinks", 120],
  ["King coconut", "Drinks", 200],
] as [string, string, number][];
export const reviews = [
  {
    name: "Amara W.",
    rating: 5,
    text: l(
      "Booking was easy and the queue screen kept us informed.",
      "වේලාව වෙන්කිරීම පහසු විය, පෝලිම් තිරය අපව දැනුවත් කළා.",
      "முன்பதிவு எளிதாக இருந்தது, வரிசைத் திரை எங்களுக்கு தகவல் தந்தது.",
    ),
  },
  {
    name: "Kumar S.",
    rating: 5,
    text: l(
      "Doctors explained everything clearly in Tamil.",
      "වෛද්‍යවරු සියල්ල දෙමළෙන් පැහැදිලිව පැහැදිලි කළා.",
      "மருத்துவர்கள் எல்லாவற்றையும் தமிழில் தெளிவாக விளக்கினர்.",
    ),
  },
  {
    name: "Nadeesha P.",
    rating: 4,
    text: l(
      "Got my lab report online the same evening.",
      "එදිනම සවස මාර්ගගතව විද්‍යාගාර වාර්තාව ලැබුණා.",
      "அதே மாலையே ஆய்வக அறிக்கையை ஆன்லைனில் பெற்றேன்.",
    ),
  },
];
export const emergencyContacts = [
  ["Emergency hotline", HOTLINE_LABEL, HOTLINE],
  ["Suwa Seriya ambulance", "1990", "1990"],
  ["Ambulance dispatch desk", "+94 11 123 4570", "+94111234570"],
  ["Colombo branch front desk", "+94 11 123 4567", "+94111234567"],
] as [string, string, string][];
export const wards = [
  ["ICU", 8, 10],
  ["HDU", 5, 8],
  ["General", 42, 60],
  ["Private", 19, 30],
  ["Maternity", 9, 16],
  ["Paediatric", 6, 14],
] as [string, number, number][];
export const icuBeds: (
  | "occupied"
  | "available"
  | "cleaning"
  | "maintenance"
)[] = [
  "occupied",
  "occupied",
  "available",
  "cleaning",
  "occupied",
  "occupied",
  "available",
  "occupied",
  "available",
  "maintenance",
];
export const parking = [
  ["Basement 1", 62, 80],
  ["Basement 2", 40, 80],
  ["Ground visitors", 28, 30],
  ["Staff", 95, 120],
] as [string, number, number][];
export const hours = [
  ["Outpatient clinics", "08:00–20:00", false],
  ["Emergency", "24/7", true],
  ["Pharmacy", "24/7", true],
  ["Laboratory", "06:00–22:00", false],
  ["Physiotherapy", "08:00–18:00", false],
  ["Visiting (general ward)", "11:00–13:00, 17:00–19:00", false],
] as [string, string, boolean][];
export const rooms = [
  {
    id: "std",
    name: l("Standard room", "සම්මත කාමරය", "நிலையான அறை"),
    price: 8500,
    desc: l(
      "Single bed, attached bath, nurse call.",
      "තනි ඇඳක්, අමුණන ලද නාන කාමරය, හෙදි ඇමතුම.",
      "ஒற்றைப் படுக்கை, இணைந்த குளியலறை, செவிலியர் அழைப்பு.",
    ),
  },
  {
    id: "dlx",
    name: l("Deluxe room", "ඩිලක්ස් කාමරය", "டீலக்ஸ் அறை"),
    price: 14500,
    desc: l(
      "Private room with guest bed and TV.",
      "අමුත්තන් සඳහා ඇඳක් සහ රූපවාහිනිය සහිත පෞද්ගලික කාමරය.",
      "விருந்தினர் படுக்கை மற்றும் டிவி கொண்ட தனி அறை.",
    ),
  },
  {
    id: "suite",
    name: l("Family suite", "පවුල් සූට්", "குடும்பச் சூட்"),
    price: 22000,
    desc: l(
      "Separate living area for family stays.",
      "පවුල සඳහා වෙනම ජීවන ප්‍රදේශයක්.",
      "குடும்பம் தங்க தனி வரவேற்பறை.",
    ),
  },
];

// ---------- portals ----------
export type Row = [string, string, string, string];
export type Panel = { id: string; title: L; icon: IconName; rows: Row[] };
export type Role = {
  slug: string;
  icon: IconName;
  label: L;
  stats: { label: L; value: string; trend: string }[];
  actions: { label: L; href: string; icon: IconName }[];
  panels: Panel[];
  chart: number[];
};
const A = (n: L, href: string, icon: IconName) => ({ label: n, href, icon });
const S = (
  en: string,
  si: string,
  ta: string,
  value: string,
  trend: string,
) => ({ label: l(en, si, ta), value, trend });
export const roles: Role[] = [
  {
    slug: "patient",
    icon: "users",
    label: l("Patient", "රෝගී", "நோயாளி"),
    chart: [3, 4, 3, 5, 6, 5, 7],
    stats: [
      S("Upcoming visits", "ඉදිරි වේලාවන්", "வரவிருக்கும் வருகைகள்", "2", "+1"),
      S("Prescriptions", "බෙහෙත් වට්ටෝරු", "மருந்துச் சீட்டுகள்", "5", "+2"),
      S("Lab reports", "විද්‍යාගාර වාර්තා", "ஆய்வக அறிக்கைகள்", "3", "+1"),
      S(
        "Due invoices",
        "ගෙවිය යුතු බිල්පත්",
        "செலுத்த வேண்டிய பட்டியல்",
        "1",
        "0",
      ),
    ],
    actions: [
      A(
        l("Book appointment", "වේලාවක් වෙන්කරන්න", "நேரம் முன்பதிவு"),
        "/appointments",
        "calendar",
      ),
      A(
        l("QR health card", "QR සෞඛ්‍ය කාඩ්පත", "QR சுகாதார அட்டை"),
        "/health-card",
        "qr",
      ),
      A(
        l("Pharmacy order", "ඖෂධ ඇණවුම", "மருந்து ஆர்டர்"),
        "/pharmacy",
        "pill",
      ),
      A(
        l("Symptom checker", "රෝග ලක්ෂණ පරීක්ෂකය", "அறிகுறி சரிபார்ப்பு"),
        "/symptom-checker",
        "bot",
      ),
    ],
    panels: [
      {
        id: "appointments",
        title: l("My appointments", "මගේ වේලාවන්", "என் சந்திப்புகள்"),
        icon: "calendar",
        rows: [
          [
            "Dr. Anjali Perera",
            "Cardiology · Colombo",
            "CONFIRMED",
            "Wed 10:00",
          ],
          ["Dr. Ruwan Jayasuriya", "General · Video", "PENDING", "Fri 18:30"],
        ],
      },
      {
        id: "records",
        title: l(
          "Prescriptions & reports",
          "බෙහෙත් වට්ටෝරු සහ වාර්තා",
          "மருந்துச் சீட்டு & அறிக்கைகள்",
        ),
        icon: "file",
        rows: [
          ["Prescription #P-1042", "Aspirin, Atorvastatin", "READY", "2 Nov"],
          ["Lipid profile", "Laboratory", "RELEASED", "1 Nov"],
          ["HbA1c", "Laboratory", "PENDING", "9 Nov"],
        ],
      },
      {
        id: "billing",
        title: l(
          "Invoices & payments",
          "බිල්පත් සහ ගෙවීම්",
          "பட்டியல் & கட்டணங்கள்",
        ),
        icon: "wallet",
        rows: [
          ["INV-2026-0831", "Consultation · LKR 3,500", "PAID", "2 Nov"],
          ["INV-2026-0902", "Lab tests · LKR 5,400", "PENDING", "9 Nov"],
        ],
      },
    ],
  },
  {
    slug: "doctor",
    icon: "stethoscope",
    label: l("Doctor", "වෛද්‍ය", "மருத்துவர்"),
    chart: [12, 15, 14, 18, 16, 20, 17],
    stats: [
      S("Today’s queue", "අද පෝලිම", "இன்றைய வரிசை", "18", "+4"),
      S("Completed", "සම්පූර්ණ", "முடிந்தவை", "11", "+3"),
      S(
        "Avg. consult (min)",
        "සාමාන්‍ය කාලය (මිනි)",
        "சராசரி நேரம் (நிமி)",
        "12",
        "-1",
      ),
      S("Video visits", "වීඩියෝ වේලාවන්", "வீடியோ வருகைகள்", "4", "+1"),
    ],
    actions: [
      A(
        l("Call next token", "ඊළඟ ටෝකනය අමතන්න", "அடுத்த டோக்கனை அழை"),
        "/queue-display",
        "users",
      ),
      A(
        l("Video room", "වීඩියෝ කාමරය", "வீடியோ அறை"),
        "/video-consultation",
        "video",
      ),
    ],
    panels: [
      {
        id: "queue",
        title: l("Today’s schedule", "අද කාලසටහන", "இன்றைய அட்டவணை"),
        icon: "clock",
        rows: [
          ["Nimal Perera", "Consultation · Token 07", "IN_PROGRESS", "09:00"],
          ["Sanduni Silva", "Follow-up · Token 08", "WAITING", "10:30"],
          [
            "Kasun Wijesinghe",
            "Consultation · Token 09",
            "CHECKED_IN",
            "14:00",
          ],
        ],
      },
      {
        id: "rx",
        title: l("Prescriptions", "බෙහෙත් වට්ටෝරු", "மருந்துச் சீட்டுகள்"),
        icon: "file",
        rows: [
          ["P-1045", "Amlodipine 5 mg", "COMPLETED", "08:40"],
          ["P-1046", "Metformin 500 mg", "DRAFT", "09:20"],
        ],
      },
      {
        id: "lab",
        title: l("Lab orders", "විද්‍යාගාර ඇණවුම්", "ஆய்வக ஆர்டர்கள்"),
        icon: "flask",
        rows: [
          ["Lipid profile", "Patient A. Perera", "PENDING", "09:05"],
          ["ECG", "Patient K. Silva", "COMPLETED", "08:30"],
        ],
      },
    ],
  },
  {
    slug: "nurse",
    icon: "heartpulse",
    label: l("Nurse", "හෙදිය", "செவிலியர்"),
    chart: [8, 9, 9, 10, 8, 9, 10],
    stats: [
      S("Beds occupied", "භාවිතයේ ඇඳන්", "நிரம்பிய படுக்கைகள்", "89", "+2"),
      S("Admissions today", "අද ඇතුළත් කිරීම්", "இன்றைய அனுமதிகள்", "7", "+1"),
      S("Discharges", "මුදා හැරීම්", "வெளியேற்றங்கள்", "5", "0"),
      S("Cleaning", "පිරිසිදු කරමින්", "சுத்தம்", "4", "-1"),
    ],
    actions: [
      A(
        l("Live bed board", "සජීවී ඇඳ පුවරුව", "நேரடி படுக்கைப் பலகை"),
        "/operations",
        "bed",
      ),
    ],
    panels: [
      {
        id: "beds",
        title: l("Ward beds", "වාට්ටු ඇඳන්", "வார்டு படுக்கைகள்"),
        icon: "bed",
        rows: [
          ["ICU B3", "Ready for admission", "READY", "Now"],
          ["General G12", "Cleaning", "IN_PROGRESS", "15 min"],
          ["Private P4", "Discharge today", "PENDING", "14:00"],
        ],
      },
    ],
  },
  {
    slug: "reception",
    icon: "users",
    label: l("Reception", "පිළිගැනීම", "வரவேற்பு"),
    chart: [30, 34, 28, 40, 38, 45, 36],
    stats: [
      S("Check-ins", "පැමිණීම්", "வருகைப் பதிவுகள்", "64", "+9"),
      S("Active tokens", "සක්‍රීය ටෝකන", "செயலில் உள்ள டோக்கன்", "22", "+3"),
      S(
        "Pending payments",
        "ගෙවීම් පොරොත්තුවෙන්",
        "நிலுவைக் கட்டணங்கள்",
        "6",
        "-2",
      ),
      S("Room requests", "කාමර ඉල්ලීම්", "அறை கோரிக்கைகள்", "3", "+1"),
    ],
    actions: [
      A(
        l(
          "Scan QR check-in",
          "QR පිවිසුම ස්කෑන් කරන්න",
          "QR பதிவை ஸ்கேன் செய்",
        ),
        "/health-card",
        "qr",
      ),
      A(
        l("Queue screen", "පෝලිම් තිරය", "வரிசைத் திரை"),
        "/queue-display",
        "users",
      ),
    ],
    panels: [
      {
        id: "checkin",
        title: l("Check-ins", "පැමිණීම්", "வருகைகள்"),
        icon: "users",
        rows: [
          ["Amara Wijesinghe", "Dr. Perera · Token 12", "CHECKED_IN", "09:30"],
          ["Sahan Perera", "Dr. Fernando · Token 13", "WAITING", "10:15"],
        ],
      },
      {
        id: "pay",
        title: l("Payments", "ගෙවීම්", "கட்டணங்கள்"),
        icon: "wallet",
        rows: [
          ["INV-2026-0905", "Cash · LKR 2,500", "PAID", "09:40"],
          ["INV-2026-0906", "Card POS · LKR 7,500", "PENDING", "10:05"],
        ],
      },
    ],
  },
  {
    slug: "pharmacy",
    icon: "pill",
    label: l("Pharmacy", "ඖෂධ ශාලාව", "மருந்தகம்"),
    chart: [20, 24, 22, 27, 25, 30, 26],
    stats: [
      S("Orders today", "අද ඇණවුම්", "இன்றைய ஆர்டர்கள்", "58", "+7"),
      S("Low stock items", "තොගය අඩු භාණ්ඩ", "இருப்பு குறைவு", "9", "+2"),
      S("Near expiry", "කල් ඉකුත් වීමට ආසන්න", "காலாவதிக்கு அருகில்", "4", "0"),
      S("Deliveries", "බෙදාහැරීම්", "விநியோகங்கள்", "13", "+3"),
    ],
    actions: [
      A(
        l("Orders & delivery", "ඇණවුම් සහ බෙදාහැරීම", "ஆர்டர் & விநியோகம்"),
        "/pharmacy",
        "truck",
      ),
    ],
    panels: [
      {
        id: "orders",
        title: l("Orders", "ඇණවුම්", "ஆர்டர்கள்"),
        icon: "pill",
        rows: [
          ["PO-3011", "P-1042 · Delivery", "OUT_FOR_DELIVERY", "10:10"],
          ["PO-3012", "P-1045 · Pickup", "READY", "10:25"],
        ],
      },
      {
        id: "stock",
        title: l(
          "Stock alerts (FEFO)",
          "තොග අනතුරු ඇඟවීම්",
          "இருப்பு எச்சரிக்கைகள்",
        ),
        icon: "clipboard",
        rows: [
          ["Paracetamol 500 mg", "Batch B-221 · 40 left", "LOW", "Reorder"],
          [
            "Amoxicillin 250 mg",
            "Batch B-198 · expires in 45 days",
            "URGENT",
            "Use first",
          ],
        ],
      },
    ],
  },
  {
    slug: "laboratory",
    icon: "flask",
    label: l("Laboratory", "විද්‍යාගාරය", "ஆய்வகம்"),
    chart: [40, 44, 42, 50, 47, 55, 49],
    stats: [
      S("Orders today", "අද ඇණවුම්", "இன்றைய ஆர்டர்கள்", "112", "+14"),
      S("In processing", "සැකසෙමින්", "செயலாக்கத்தில்", "31", "+5"),
      S(
        "Ready to release",
        "නිකුත් කිරීමට සූදානම්",
        "வெளியிடத் தயார்",
        "18",
        "+2",
      ),
      S("Urgent", "හදිසි", "அவசரம்", "3", "0"),
    ],
    actions: [
      A(
        l("Test catalogue", "පරීක්ෂණ නාමාවලිය", "பரிசோதனைப் பட்டியல்"),
        "/laboratory",
        "flask",
      ),
    ],
    panels: [
      {
        id: "orders",
        title: l("Lab orders", "විද්‍යාගාර ඇණවුම්", "ஆய்வக ஆர்டர்கள்"),
        icon: "flask",
        rows: [
          ["LAB-FBC · K. Silva", "Sample collected", "IN_PROGRESS", "09:10"],
          ["LAB-LIP · A. Perera", "Result uploaded", "READY", "09:50"],
          ["LAB-DENG · N. Fernando", "Priority", "URGENT", "10:05"],
        ],
      },
    ],
  },
  {
    slug: "hr",
    icon: "usercog",
    label: l("HR & payroll", "HR සහ වැටුප්", "HR & சம்பளம்"),
    chart: [95, 96, 94, 97, 96, 98, 97],
    stats: [
      S("Headcount", "සේවක සංඛ්‍යාව", "ஊழியர் எண்ணிக்கை", "412", "+6"),
      S("On leave today", "අද නිවාඩුවේ", "இன்று விடுப்பில்", "14", "+2"),
      S(
        "Advances outstanding",
        "ගෙවිය යුතු අත්තිකාරම්",
        "நிலுவை முன்பணம்",
        "9",
        "-1",
      ),
      S("Payroll status", "වැටුප් තත්ත්වය", "சம்பள நிலை", "Draft", ""),
    ],
    actions: [
      A(
        l("Careers applications", "රැකියා අයදුම්පත්", "வேலை விண்ணப்பங்கள்"),
        "/careers",
        "briefcase",
      ),
    ],
    panels: [
      {
        id: "leaves",
        title: l("Leave requests", "නිවාඩු ඉල්ලීම්", "விடுப்பு கோரிக்கைகள்"),
        icon: "calendar",
        rows: [
          ["S. Rathnayake", "Annual leave · 2 days", "PENDING", "12 Nov"],
          ["M. Fernando", "Medical leave · 1 day", "APPROVED", "10 Nov"],
        ],
      },
      {
        id: "payroll",
        title: l("Payroll run", "වැටුප් ධාවනය", "சம்பளப் பதிவு"),
        icon: "wallet",
        rows: [
          ["Nov 2026 run", "412 payslips", "DRAFT", "30 Nov"],
          ["Oct 2026 run", "408 payslips", "COMPLETED", "31 Oct"],
        ],
      },
    ],
  },
  {
    slug: "finance",
    icon: "wallet",
    label: l("Finance", "මූල්‍ය", "நிதி"),
    chart: [60, 66, 62, 74, 70, 82, 78],
    stats: [
      S(
        "Revenue today (LKR)",
        "අද ආදායම (රු.)",
        "இன்றைய வருவாய் (ரூ.)",
        "845,000",
        "+12%",
      ),
      S("Invoices", "බිල්පත්", "பட்டியல்கள்", "214", "+18"),
      S("Collections", "එකතු කිරීම්", "வசூல்", "92%", "+3%"),
      S("Pending", "පොරොත්තුවෙන්", "நிலுவை", "21", "-4"),
    ],
    actions: [
      A(
        l("Financial reports", "මූල්‍ය වාර්තා", "நிதி அறிக்கைகள்"),
        "/reports",
        "file",
      ),
    ],
    panels: [
      {
        id: "payments",
        title: l("Payments", "ගෙවීම්", "கட்டணங்கள்"),
        icon: "wallet",
        rows: [
          ["PAY-8841", "Card · LKR 3,500", "PAID", "10:02"],
          ["PAY-8842", "Bank transfer · LKR 22,000", "PENDING", "10:20"],
        ],
      },
    ],
  },
  {
    slug: "ambulance",
    icon: "ambulance",
    label: l("Ambulance driver", "ගිලන්රථ රියදුරු", "ஆம்புலன்ஸ் ஓட்டுநர்"),
    chart: [2, 3, 2, 4, 3, 5, 3],
    stats: [
      S("Trips today", "අද ගමන්", "இன்றைய பயணங்கள்", "6", "+1"),
      S("Active trip", "සක්‍රීය ගමන", "செயலில் உள்ள பயணம்", "#218", ""),
      S("ETA (min)", "ළඟා වීමට (මිනි)", "வருகை நேரம் (நிமி)", "6", ""),
      S("GPS", "GPS", "GPS", "On", ""),
    ],
    actions: [
      A(
        l("Open trip map", "ගමන් සිතියම විවෘත කරන්න", "பயண வரைபடத்தைத் திற"),
        "/ambulance",
        "ambulance",
      ),
    ],
    panels: [
      {
        id: "trips",
        title: l("Assigned trips", "පවරා ඇති ගමන්", "ஒதுக்கப்பட்ட பயணங்கள்"),
        icon: "ambulance",
        rows: [
          ["Trip #218", "Pickup → RH Hospital", "IN_PROGRESS", "6 min"],
          ["Trip #219", "Transfer to Kandy", "PENDING", "14:30"],
        ],
      },
    ],
  },
  {
    slug: "branch-admin",
    icon: "building",
    label: l("Branch admin", "ශාඛා පරිපාලක", "கிளை நிர்வாகி"),
    chart: [50, 54, 52, 60, 58, 64, 61],
    stats: [
      S("Patients today", "අද රෝගීන්", "இன்றைய நோயாளிகள்", "128", "+9%"),
      S("Appointments", "වේලාවන්", "சந்திப்புகள்", "214", "+18%"),
      S(
        "Staff on duty",
        "රාජකාරියේ කාර්ය මණ්ඩලය",
        "பணியில் உள்ள ஊழியர்",
        "86",
        "+2",
      ),
      S("Bed occupancy", "ඇඳ භාවිතය", "படுக்கைப் பயன்பாடு", "78%", "+5%"),
    ],
    actions: [
      A(
        l("Operations board", "මෙහෙයුම් පුවරුව", "செயல்பாட்டுப் பலகை"),
        "/operations",
        "chart",
      ),
    ],
    panels: [
      {
        id: "schedule",
        title: l(
          "Doctor schedules",
          "වෛද්‍ය කාලසටහන්",
          "மருத்துவர் அட்டவணைகள்",
        ),
        icon: "calendar",
        rows: [
          ["Dr. A. Perera", "Cardiology · Mon–Fri", "ACTIVE", "09:00"],
          ["Dr. N. Fernando", "Neurology · Tue, Thu", "ACTIVE", "14:00"],
        ],
      },
    ],
  },
  {
    slug: "super-admin",
    icon: "shieldcheck",
    label: l("Super admin", "ප්‍රධාන පරිපාලක", "தலைமை நிர்வாகி"),
    chart: [48, 55, 50, 66, 59, 72, 64],
    stats: [
      S("Total patients", "මුළු රෝගීන්", "மொத்த நோயாளிகள்", "48,750", "+12.5%"),
      S(
        "Appointments today",
        "අද වේලාවන්",
        "இன்றைய சந்திப்புகள்",
        "2,840",
        "+8.3%",
      ),
      S("Available beds", "ඇති ඇඳන්", "கிடைக்கும் படுக்கைகள்", "320", "+5.1%"),
      S("Revenue (LKR)", "ආදායම (රු.)", "வருவாய் (ரூ.)", "125,780", "+14.2%"),
    ],
    actions: [
      A(
        l("Audit log", "විගණන සටහන", "தணிக்கைப் பதிவு"),
        "/portal/super-admin",
        "shield",
      ),
      A(
        l("Public website", "ප්‍රසිද්ධ වෙබ් අඩවිය", "பொது இணையதளம்"),
        "/",
        "globe",
      ),
    ],
    panels: [
      {
        id: "audit",
        title: l("Audit log", "විගණන සටහන", "தணிக்கைப் பதிவு"),
        icon: "shield",
        rows: [
          [
            "admin@rh",
            "Viewed patient record RH-P-000123",
            "COMPLETED",
            "10:12",
          ],
          ["reception01", "QR scan check-in", "COMPLETED", "10:09"],
          [
            "doctor.perera",
            "Created prescription P-1046",
            "COMPLETED",
            "09:20",
          ],
        ],
      },
      {
        id: "content",
        title: l(
          "Content & users",
          "අන්තර්ගතය සහ පරිශීලකයින්",
          "உள்ளடக்கம் & பயனர்கள்",
        ),
        icon: "users",
        rows: [
          ["News: New cardiac centre", "Published", "ACTIVE", "4 Nov"],
          ["User: hr.manager", "Role HR_MANAGER", "ACTIVE", "1 Nov"],
        ],
      },
    ],
  },
];
export const roleBySlug = (s: string) => roles.find((r) => r.slug === s);

// ---------- booking helpers ----------
export const SLOT_TIMES = [
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
  "10:45",
  "11:00",
  "11:15",
  "11:30",
  "11:45",
];
export function isBooked(doctorId: string, dateKey: string, time: string) {
  let h = 7;
  for (const c of doctorId + dateKey + time)
    h = (h * 31 + c.charCodeAt(0)) % 997;
  return h % 4 === 0;
}
export const money = (n: number) => `LKR ${n.toLocaleString("en-US")}`;
