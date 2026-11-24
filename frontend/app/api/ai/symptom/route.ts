import { NextResponse } from "next/server";
import { callClaude, limited, SYMPTOM_SYSTEM } from "../../../../lib/anthropic";

export const runtime = "nodejs";
const DEPTS = [
  "cardiology",
  "orthopaedics",
  "neurology",
  "paediatrics",
  "obgyn",
  "general",
  "nephrology",
  "ent",
];

type SymptomResult = {
  urgency: "EMERGENCY" | "SOON" | "ROUTINE";
  department: string;
  advice: string;
  redFlag: boolean;
};

function hasRedFlag(text: string): boolean {
  return /\b(chest pain|difficulty breathing|shortness of breath|unconscious|fainted|stroke|face droop|weakness on one side|severe bleeding|seizure|suicidal|overdose)\b/i.test(
    text,
  );
}

function symptomLocal(text: string, lang: "en" | "si" | "ta"): SymptomResult {
  const redFlag = hasRedFlag(text);
  const advice = redFlag
    ? {
        en: "Seek emergency medical care now or contact your local emergency service.",
        si: "වහාම හදිසි වෛද්‍ය ප්‍රතිකාර ලබාගන්න.",
        ta: "உடனடியாக அவசர மருத்துவ உதவியை நாடுங்கள்.",
      }[lang]
    : {
        en: "Consult a healthcare professional for advice, especially if symptoms worsen or persist.",
        si: "රෝග ලක්ෂණ වැඩි වුවහොත් හෝ දිගටම පවතින්නේ නම් වෛද්‍යවරයෙකු හමුවන්න.",
        ta: "அறிகுறிகள் மோசமடைந்தாலோ நீடித்தாலோ மருத்துவரை அணுகவும்.",
      }[lang];
  return {
    urgency: redFlag ? "EMERGENCY" : "ROUTINE",
    department: "general",
    advice,
    redFlag,
  };
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (limited(ip, 8))
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  let body: { text?: string; lang?: string } = {};
  try {
    body = await req.json();
  } catch {}
  const lang = (
    ["en", "si", "ta"].includes(body.lang || "") ? body.lang : "en"
  ) as "en" | "si" | "ta";
  const text = String(body.text || "").slice(0, 500);
  if (!text.trim())
    return NextResponse.json({ error: "empty" }, { status: 400 });

  // Safety first: rule-based red flags run before any AI call.
  if (hasRedFlag(text))
    return NextResponse.json({ ...symptomLocal(text, lang), source: "rules" });

  try {
    const raw = await callClaude(
      SYMPTOM_SYSTEM(lang),
      [{ role: "user", content: text }],
      300,
    );
    if (raw) {
      const j = JSON.parse(
        raw.replace(/```json|```/g, "").trim(),
      ) as SymptomResult;
      const ok =
        ["EMERGENCY", "SOON", "ROUTINE"].includes(j.urgency) &&
        DEPTS.includes(j.department) &&
        typeof j.advice === "string";
      if (ok)
        return NextResponse.json({
          urgency: j.urgency,
          department: j.department,
          advice: j.advice.slice(0, 400),
          redFlag: !!j.redFlag,
          source: "ai",
        });
    }
  } catch {}
  return NextResponse.json({ ...symptomLocal(text, lang), source: "fallback" });
}
