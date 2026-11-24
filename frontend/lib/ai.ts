import type { Lang } from "./i18n/dict";

/** Red flags run BEFORE any AI call. Sinhala/Tamil terms must be reviewed by native speakers/clinicians. */
const RED_FLAGS = [
  "chest pain",
  "difficulty breathing",
  "can't breathe",
  "cannot breathe",
  "shortness of breath",
  "unconscious",
  "not breathing",
  "severe bleeding",
  "heavy bleeding",
  "stroke",
  "face drooping",
  "seizure",
  "suicid",
  "kill myself",
  "overdose",
  "poison",
  "severe allergic",
  "පපුවේ වේදනා",
  "පපු වේදනා",
  "හුස්ම ගැනීමට අපහසු",
  "හුස්ම ගන්න බැහැ",
  "සිහිය නැති",
  "අධික ලේ",
  "ලේ ගලනවා",
  "ආඝාත",
  "අපස්මාර",
  "සියදිවි",
  "நெஞ்சு வலி",
  "மூச்சு விட சிரமம்",
  "மூச்சுத் திணறல்",
  "மயக்கம்",
  "சுயநினைவு",
  "அதிக இரத்தப்போக்கு",
  "பக்கவாதம்",
  "வலிப்பு",
  "தற்கொலை",
];
export function hasRedFlag(text: string) {
  const t = text.toLowerCase();
  return RED_FLAGS.some((k) => t.includes(k.toLowerCase()));
}

const DEPTS: [string, string[]][] = [
  [
    "cardiology",
    [
      "heart",
      "palpitation",
      "blood pressure",
      "hypertension",
      "හෘද",
      "හදවත",
      "இதய",
    ],
  ],
  [
    "orthopaedics",
    [
      "bone",
      "joint",
      "fracture",
      "back pain",
      "knee",
      "sprain",
      "ඇට",
      "සන්ධි",
      "எலும்பு",
      "மூட்டு",
    ],
  ],
  [
    "neurology",
    [
      "headache",
      "migraine",
      "numb",
      "dizz",
      "nerve",
      "හිසරදය",
      "தலைவலி",
      "தலைசுற்று",
    ],
  ],
  [
    "paediatrics",
    ["child", "baby", "infant", "toddler", "ළමා", "දරුවා", "குழந்தை"],
  ],
  ["obgyn", ["pregnan", "period", "menstrual", "ගර්භණී", "கர்ப்ப"]],
  [
    "ent",
    [
      "ear",
      "throat",
      "nose",
      "sinus",
      "eye",
      "vision",
      "කන",
      "ඇස",
      "காது",
      "கண்",
    ],
  ],
  ["nephrology", ["kidney", "urine", "dialysis", "වකුගඩු", "சிறுநீரக"]],
];
export function suggestDepartment(text: string) {
  const t = text.toLowerCase();
  return (
    DEPTS.find(([, ks]) => ks.some((k) => t.includes(k)))?.[0] ?? "general"
  );
}

type Action = { label: string; href: string };
export type Answer = { reply: string; actions: Action[] };
const T = (en: string, si: string, ta: string) => ({ en, si, ta });
const book: Action = { label: "Book", href: "/appointments" };

const INTENTS: {
  keys: string[];
  ans: Record<Lang, string>;
  actions: Action[];
}[] = [
  {
    keys: ["emergency", "ambulance", "හදිසි", "ගිලන්", "அவசர", "ஆம்புலன்ஸ்"],
    ans: T(
      "For emergencies call 1990 (Suwa Seriya) or the RH 24/7 hotline +94 11 123 4567. You can also request an ambulance on the Emergency page.",
      "හදිසි අවස්ථාවලදී 1990 (සුව සැරිය) හෝ RH 24/7 හොට්ලයින් +94 11 123 4567 අමතන්න. හදිසි පිටුවෙන් ගිලන්රථයක් ද ඉල්ලිය හැක.",
      "அவசரத்தில் 1990 (சுவ செரிய) அல்லது RH 24/7 ஹாட்லைன் +94 11 123 4567 ஐ அழைக்கவும். அவசரப் பக்கத்தில் ஆம்புலன்ஸ் கோரலாம்.",
    ),
    actions: [{ label: "Emergency", href: "/emergency" }],
  },
  {
    keys: [
      "visit",
      "hours",
      "open",
      "time",
      "වේලාව",
      "විවෘත",
      "நேரம்",
      "திறந்",
    ],
    ans: T(
      "Outpatient clinics: 08:00–20:00. Emergency and pharmacy: 24/7. Laboratory: 06:00–22:00. General ward visiting: 11:00–13:00 and 17:00–19:00.",
      "බාහිර රෝගී සායන: 08:00–20:00. හදිසි සහ ඖෂධ ශාලාව: 24/7. විද්‍යාගාරය: 06:00–22:00. සාමාන්‍ය වාට්ටු බැලීම: 11:00–13:00 සහ 17:00–19:00.",
      "வெளிநோயாளர் மருத்துவ நிலையங்கள்: 08:00–20:00. அவசரம் & மருந்தகம்: 24/7. ஆய்வகம்: 06:00–22:00. பொது வார்டு பார்வை: 11:00–13:00 மற்றும் 17:00–19:00.",
    ),
    actions: [{ label: "Hours", href: "/operations" }],
  },
  {
    keys: [
      "package",
      "checkup",
      "check-up",
      "health check",
      "පැකේජ",
      "පරීක්ෂා",
      "தொகுப்பு",
      "பரிசோதனை",
    ],
    ans: T(
      "We offer basic, executive, cardiac, women’s wellness, senior care and diabetes packages. Open Health Packages to compare tests and prices.",
      "මූලික, විධායක, හෘද, කාන්තා සුවතා, වැඩිහිටි සහ දියවැඩියා පැකේජ අපි ලබා දෙමු. පරීක්ෂණ සහ මිල සංසන්දනයට සෞඛ්‍ය පැකේජ විවෘත කරන්න.",
      "அடிப்படை, நிர்வாக, இதய, பெண்கள் நலம், முதியோர் மற்றும் நீரிழிவு தொகுப்புகள் உள்ளன. பரிசோதனைகளையும் விலையையும் ஒப்பிட சுகாதாரத் தொகுப்புகளைத் திறக்கவும்.",
    ),
    actions: [{ label: "Packages", href: "/health-packages" }],
  },
  {
    keys: [
      "lab",
      "test",
      "report",
      "blood",
      "විද්‍යාගාර",
      "වාර්තා",
      "ஆய்வக",
      "அறிக்கை",
    ],
    ans: T(
      "Our laboratory catalogue lists prices and turnaround times. Reports appear in your patient portal after the lab releases them.",
      "අපගේ විද්‍යාගාර නාමාවලියේ මිල සහ ලැබෙන කාලය ඇත. විද්‍යාගාරය නිකුත් කළ පසු වාර්තා ඔබේ රෝගී ද්වාරයේ දිස්වේ.",
      "எங்கள் ஆய்வகப் பட்டியலில் விலையும் முடிவு நேரமும் உள்ளன. ஆய்வகம் வெளியிட்ட பின் அறிக்கைகள் உங்கள் நோயாளி தளத்தில் தோன்றும்.",
    ),
    actions: [{ label: "Laboratory", href: "/laboratory" }],
  },
  {
    keys: ["pharmacy", "medicine", "deliver", "ඖෂධ", "බෙහෙත්", "மருந்து"],
    ans: T(
      "You can create a pharmacy order from a prescription and choose pickup or home delivery, then track its status.",
      "බෙහෙත් වට්ටෝරුවකින් ඖෂධ ඇණවුමක් සාදා ගෙන්වා ගැනීම හෝ නිවසටම බෙදාහැරීම තෝරා තත්ත්වය ලුහුබැඳිය හැක.",
      "மருந்துச் சீட்டிலிருந்து மருந்து ஆர்டர் செய்து, பெறுதல் அல்லது வீட்டு விநியோகத்தைத் தேர்ந்து நிலையைக் கண்காணிக்கலாம்.",
    ),
    actions: [{ label: "Pharmacy", href: "/pharmacy" }],
  },
  {
    keys: ["video", "online consult", "telemedicine", "වීඩියෝ", "வீடியோ"],
    ans: T(
      "Book a video slot, pay online, and join the secure room a few minutes before your time. Your prescription is sent after the call.",
      "වීඩියෝ වේලාවක් වෙන්කර, මාර්ගගතව ගෙවා, වේලාවට මිනිත්තු කිහිපයකට පෙර ආරක්ෂිත කාමරයට ඇතුල් වන්න. ඇමතුමෙන් පසු බෙහෙත් වට්ටෝරුව එවයි.",
      "வீடியோ நேரத்தை முன்பதிவு செய்து, ஆன்லைனில் செலுத்தி, நேரத்திற்கு சில நிமிடம் முன் பாதுகாப்பான அறையில் இணையுங்கள். அழைப்புக்குப் பின் மருந்துச் சீட்டு அனுப்பப்படும்.",
    ),
    actions: [{ label: "Video", href: "/video-consultation" }],
  },
  {
    keys: [
      "book",
      "appointment",
      "channel",
      "doctor",
      "වෙන්",
      "වේලාවක්",
      "වෛද්‍ය",
      "முன்பதிவு",
      "மருத்துவர்",
    ],
    ans: T(
      "Choose a department, doctor, date and a free slot on the booking page. You will get a confirmation email and reminders.",
      "වෙන්කිරීමේ පිටුවේ දෙපාර්තමේන්තුවක්, වෛද්‍යවරයෙකු, දිනයක් සහ නිදහස් වේලාවක් තෝරන්න. තහවුරු කිරීමේ විද්‍යුත් තැපෑලක් සහ මතක් කිරීම් ලැබේ.",
      "முன்பதிவுப் பக்கத்தில் துறை, மருத்துவர், தேதி, காலி நேரத்தைத் தேர்ந்தெடுக்கவும். உறுதிப்படுத்தும் மின்னஞ்சலும் நினைவூட்டல்களும் வரும்.",
    ),
    actions: [book],
  },
  {
    keys: [
      "international",
      "foreign",
      "passport",
      "abroad",
      "විදේශ",
      "வெளிநாட்",
    ],
    ans: T(
      "Our international desk helps with appointments, estimates, pickup and translation.",
      "අපගේ ජාත්‍යන්තර මෙසය වේලාවන්, ඇස්තමේන්තු, පිටත්කිරීම් සහ පරිවර්තනයට උදව් කරයි.",
      "எங்கள் சர்வதேச மையம் சந்திப்பு, மதிப்பீடு, வரவேற்பு மற்றும் மொழிபெயர்ப்பில் உதவும்.",
    ),
    actions: [{ label: "International", href: "/international" }],
  },
];
const DEFAULT: Record<Lang, string> = T(
  "I can help with booking, opening hours, packages, tests and pharmacy. For medical concerns, please see a doctor. I cannot diagnose.",
  "වේලා වෙන්කිරීම්, විවෘත වේලාවන්, පැකේජ, පරීක්ෂණ සහ ඖෂධ ශාලාව ගැන මට උදව් කළ හැක. වෛද්‍ය ගැටලු සඳහා වෛද්‍යවරයෙකු හමුවන්න. මට රෝග නිර්ණය කළ නොහැක.",
  "முன்பதிவு, திறக்கும் நேரம், தொகுப்புகள், பரிசோதனைகள் மற்றும் மருந்தகம் பற்றி உதவ முடியும். மருத்துவ கவலைகளுக்கு மருத்துவரைப் பாருங்கள். என்னால் நோயறிதல் செய்ய முடியாது.",
);
export function answerLocal(text: string, lang: Lang): Answer {
  const t = text.toLowerCase();
  const hit = INTENTS.find((i) =>
    i.keys.some((k) => t.includes(k.toLowerCase())),
  );
  return hit
    ? { reply: hit.ans[lang], actions: hit.actions }
    : { reply: DEFAULT[lang], actions: [book] };
}

export const EMERGENCY_REPLY: Record<Lang, string> = T(
  "This may be an emergency. Please call 1990 (Suwa Seriya) or the RH 24/7 hotline now, or go to the nearest emergency unit. Do not wait for an online reply.",
  "මෙය හදිසි අවස්ථාවක් විය හැක. කරුණාකර දැන්ම 1990 (සුව සැරිය) හෝ RH 24/7 හොට්ලයින් අමතන්න, නැතහොත් ළඟම හදිසි ඒකකයට යන්න. මාර්ගගත පිළිතුරක් බලා නොසිටින්න.",
  "இது அவசர நிலையாக இருக்கலாம். உடனே 1990 (சுவ செரிய) அல்லது RH 24/7 ஹாட்லைனை அழைக்கவும், அல்லது அருகிலுள்ள அவசரப் பிரிவுக்குச் செல்லவும். ஆன்லைன் பதிலுக்காகக் காத்திருக்க வேண்டாம்.",
);

export type SymptomResult = {
  urgency: "EMERGENCY" | "SOON" | "ROUTINE";
  department: string;
  advice: string;
  redFlag: boolean;
};
const SOON = [
  "fever",
  "vomit",
  "infection",
  "pain",
  "rash",
  "persistent",
  "blood",
  "උණ",
  "වේදනා",
  "காய்ச்சல்",
  "வலி",
];
export function symptomLocal(text: string, lang: Lang): SymptomResult {
  if (hasRedFlag(text))
    return {
      urgency: "EMERGENCY",
      department: "general",
      advice: EMERGENCY_REPLY[lang],
      redFlag: true,
    };
  const soon = SOON.some((k) => text.toLowerCase().includes(k));
  const advice = T(
    "Rest, drink fluids and monitor your symptoms. Book a doctor if they last more than 2 days or get worse.",
    "විවේක ගන්න, දියර පානය කරන්න සහ රෝග ලක්ෂණ නිරීක්ෂණය කරන්න. දින 2කට වඩා පවතී නම් හෝ නරක් වේ නම් වෛද්‍යවරයෙකු හමුවන්න.",
    "ஓய்வெடுக்கவும், திரவங்கள் குடிக்கவும், அறிகுறிகளைக் கவனிக்கவும். 2 நாட்களுக்கு மேல் நீடித்தால் அல்லது மோசமானால் மருத்துவரைப் பாருங்கள்.",
  )[lang];
  return {
    urgency: soon ? "SOON" : "ROUTINE",
    department: suggestDepartment(text),
    advice,
    redFlag: false,
  };
}
