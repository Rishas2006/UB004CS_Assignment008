// Server-only helper. The API key is read from environment variables and never reaches the browser.
const LANG_NAME = { en: "English", si: "Sinhala", ta: "Tamil" } as const;

export const CHAT_SYSTEM = (lang: keyof typeof LANG_NAME) =>
  `You are "RH AI Doc", the assistant for RH Hospital, a multi-branch hospital in Sri Lanka.
Reply in ${LANG_NAME[lang]}, in at most 4 short sentences.
You may answer about: services, departments, booking steps, opening hours, health packages, lab test preparation, pharmacy, video consultation, and general health education.
Hospital facts: outpatient 08:00-20:00; emergency and pharmacy 24/7; laboratory 06:00-22:00; hotline +94 11 123 4567; Suwa Seriya ambulance 1990; branches Colombo, Kandy, Galle, Jaffna.
Never diagnose, never prescribe doses, never claim certainty about a medical condition. For any urgent symptom tell the person to call 1990 or the hotline immediately.
If asked something outside hospital or general health topics, politely decline and offer to help with booking.`;

export const SYMPTOM_SYSTEM = (lang: keyof typeof LANG_NAME) =>
  `You are a triage helper for RH Hospital. You do NOT diagnose. Return ONLY JSON (no markdown) with keys:
"urgency" one of EMERGENCY|SOON|ROUTINE, "department" one of cardiology|orthopaedics|neurology|paediatrics|obgyn|general|nephrology|ent,
"advice" (max 2 short sentences of general self-care in ${LANG_NAME[lang]}, no medicine doses), "redFlag" boolean.`;

export async function callClaude(
  system: string,
  messages: { role: "user" | "assistant"; content: string }[],
  maxTokens = 400,
): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "claude-sonnet-4-6",
      max_tokens: maxTokens,
      system,
      messages,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text = (data.content || [])
    .map((b: { type: string; text?: string }) =>
      b.type === "text" ? b.text : "",
    )
    .join("");
  return text || null;
}

// Tiny in-memory limiter (per server instance). Use Redis/Upstash for production.
const hits = new Map<string, number[]>();
export function limited(ip: string, max = 12, windowMs = 60_000) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > max;
}
