import { NextResponse } from "next/server";
import { answerLocal, EMERGENCY_REPLY, hasRedFlag } from "../../../../lib/ai";
import { callClaude, CHAT_SYSTEM, limited } from "../../../../lib/anthropic";

export const runtime = "nodejs";
type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (limited(ip))
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  let body: { messages?: Msg[]; lang?: string } = {};
  try {
    body = await req.json();
  } catch {}
  const lang = (
    ["en", "si", "ta"].includes(body.lang || "") ? body.lang : "en"
  ) as "en" | "si" | "ta";
  const msgs = (body.messages || []).slice(-8).map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: String(m.content).slice(0, 600),
  })) as Msg[];
  const last =
    [...msgs].reverse().find((m) => m.role === "user")?.content || "";
  if (!last) return NextResponse.json({ error: "empty" }, { status: 400 });

  if (hasRedFlag(last))
    return NextResponse.json({
      reply: EMERGENCY_REPLY[lang],
      emergency: true,
      actions: [],
      source: "rules",
    });

  const local = answerLocal(last, lang);
  try {
    const ai = await callClaude(CHAT_SYSTEM(lang), msgs);
    if (ai)
      return NextResponse.json({
        reply: ai,
        actions: local.actions,
        source: "ai",
      });
  } catch {}
  return NextResponse.json({
    reply: local.reply,
    actions: local.actions,
    source: "fallback",
  });
}
