const config = require('../config');

const LANG = { en: 'English', si: 'Sinhala', ta: 'Tamil' };
const RED_FLAGS = [
  'chest pain', 'difficulty breathing', "can't breathe", 'cannot breathe', 'shortness of breath', 'unconscious',
  'not breathing', 'severe bleeding', 'heavy bleeding', 'stroke', 'face drooping', 'seizure', 'suicid',
  'kill myself', 'overdose', 'poison', 'severe allergic',
  'පපුවේ වේදනා', 'පපු වේදනා', 'හුස්ම ගැනීමට අපහසු', 'හුස්ම ගන්න බැහැ', 'සිහිය නැති', 'අධික ලේ', 'ආඝාත', 'අපස්මාර', 'සියදිවි',
  'நெஞ்சு வலி', 'மூச்சு விட சிரமம்', 'மூச்சுத் திணறல்', 'மயக்கம்', 'சுயநினைவு', 'அதிக இரத்தப்போக்கு', 'பக்கவாதம்', 'வலிப்பு', 'தற்கொலை',
];
const hasRedFlag = (t) => RED_FLAGS.some((k) => String(t).toLowerCase().includes(k.toLowerCase()));

const EMERGENCY = {
  en: 'This may be an emergency. Call 1990 (Suwa Seriya) or our hotline +94 11 123 4567 now, or go to the nearest emergency unit.',
  si: 'මෙය හදිසි තත්ත්වයක් විය හැක. දැන්ම 1990 (සුව සැරිය) හෝ අපගේ දුරකථන +94 11 123 4567 අමතන්න.',
  ta: 'இது அவசர நிலையாக இருக்கலாம். உடனே 1990 (சுவ செரிய) அல்லது +94 11 123 4567 ஐ அழைக்கவும்.',
};

const CHAT_SYSTEM = (lang) => `You are "RH AI Doc", the assistant for RH Hospital, a multi-branch hospital in Sri Lanka.
Reply in ${LANG[lang]}, in at most 4 short sentences.
You may answer about services, departments, booking steps, opening hours, health packages, lab test preparation, pharmacy, video consultation and general health education.
Hospital facts: outpatient 08:00-20:00; emergency and pharmacy 24/7; laboratory 06:00-22:00; hotline +94 11 123 4567; Suwa Seriya ambulance 1990.
Never diagnose, never give medicine doses, never claim certainty about a medical condition. For urgent symptoms tell the person to call 1990 or the hotline immediately.
If asked about anything outside hospital or general health topics, politely decline and offer to help with booking.`;

const SYMPTOM_SYSTEM = (lang) => `You are a triage helper for RH Hospital. You do NOT diagnose. Return ONLY JSON (no markdown) with keys:
"urgency" one of EMERGENCY|SOON|ROUTINE, "department" one of cardiology|orthopaedics|neurology|paediatrics|obgyn|general|nephrology|ent|oncology,
"advice" (max 2 short sentences of general self-care in ${LANG[lang]}, no medicine doses), "redFlag" boolean.`;

async function callClaude(system, messages, maxTokens = 400) {
  if (!config.ai.key) return null;
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': config.ai.key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: config.ai.model, max_tokens: maxTokens, system, messages }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.content || []).map((b) => (b.type === 'text' ? b.text : '')).join('') || null;
}

const FALLBACK = {
  en: 'I can help with booking, services, opening hours and packages. For medical advice please consult a doctor.',
  si: 'වේලාවන් වෙන්කිරීම, සේවා, විවෘත වේලාවන් සහ පැකේජ ගැන මට උදව් කළ හැක. වෛද්‍ය උපදෙස් සඳහා වෛද්‍යවරයෙකු හමුවන්න.',
  ta: 'முன்பதிவு, சேவைகள், நேரங்கள் மற்றும் தொகுப்புகள் குறித்து உதவ முடியும். மருத்துவ ஆலோசனைக்கு மருத்துவரை அணுகவும்.',
};
module.exports = { hasRedFlag, EMERGENCY, CHAT_SYSTEM, SYMPTOM_SYSTEM, callClaude, FALLBACK };
