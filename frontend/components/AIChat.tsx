"use client";
import { post } from "../lib/api";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Phone, Send, X } from "lucide-react";
import { useLang } from "../lib/i18n/provider";
import { answerLocal, EMERGENCY_REPLY, hasRedFlag } from "../lib/ai";
import { HOTLINE, WHATSAPP } from "../lib/data";
import type { Key } from "../lib/i18n/dict";

type Msg = {
  role: "user" | "bot";
  text: string;
  emergency?: boolean;
  actions?: { label: string; href: string }[];
};

export function ChatButton({
  onClick,
  open,
}: {
  onClick: () => void;
  open: boolean;
}) {
  const { t } = useLang();
  return (
    <button
      onClick={onClick}
      aria-label={t("chat.open")}
      aria-expanded={open}
      className="relative grid h-14 w-14 place-items-center rounded-full bg-white shadow-lift ring-2 ring-brand transition hover:scale-105"
    >
      {!open && (
        <span className="absolute inset-0 rounded-full bg-brand/40 animate-pulseRing" />
      )}
      {open ? (
        <X className="text-brand" />
      ) : (
        <Image
          src="/images/ai-doc.jpg"
          alt=""
          width={44}
          height={44}
          className="rounded-full animate-floaty"
        />
      )}
    </button>
  );
}

export default function AIChat({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && msgs.length === 0)
      setMsgs([{ role: "bot", text: t("chat.hello") }]);
  }, [open]); // eslint-disable-line
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  async function send(text: string) {
    const q = text.trim().slice(0, 600);
    if (!q || busy) return;
    setInput("");
    const history = [...msgs, { role: "user", text: q } as Msg];
    setMsgs(history);
    if (hasRedFlag(q)) {
      setMsgs([
        ...history,
        { role: "bot", text: EMERGENCY_REPLY[lang], emergency: true },
      ]);
      return;
    }
    setBusy(true);
    try {
      const d = await post<{ reply: string; emergency?: boolean; actions?: never; source?: string }>("/ai/chat", {
        lang,
        messages: history.slice(-8).map((m) => ({ role: m.role === "bot" ? "assistant" : "user", content: m.text })),
      });
      if (d.source === "fallback") throw new Error("local");
      setMsgs([
        ...history,
        {
          role: "bot",
          text: d.reply,
          emergency: d.emergency,
          actions: d.actions,
        },
      ]);
    } catch {
      const a = answerLocal(q, lang);
      setMsgs([...history, { role: "bot", text: a.reply, actions: a.actions }]);
    } finally {
      setBusy(false);
    }
  }

  const chips: [Key, string][] = [
    ["chat.chip1", "Book an appointment"],
    ["chat.chip2", "What are the visiting hours?"],
    ["chat.chip3", "Health packages"],
    ["chat.chip4", "symptom"],
    ["chat.chip5", "emergency"],
  ];
  return (
    <AnimatePresence>
      {open && (
        <motion.section
          role="dialog"
          aria-label={t("chat.title")}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          className="fixed bottom-24 right-4 z-50 flex h-[min(560px,78vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-brand-sky bg-white shadow-lift"
        >
          <header className="flex items-center gap-3 bg-gradient-to-r from-brand-dark to-brand p-4 text-white">
            <Image
              src="/images/ai-doc.jpg"
              alt=""
              width={42}
              height={42}
              className="rounded-full bg-white"
            />
            <div className="min-w-0 flex-1">
              <p className="font-extrabold leading-tight">{t("chat.title")}</p>
              <p className="truncate text-xs text-sky-100">{t("chat.sub")}</p>
            </div>
            <button
              onClick={onClose}
              aria-label={t("c.close")}
              className="rounded-lg p-1 hover:bg-white/15"
            >
              <X size={20} />
            </button>
          </header>
          <div
            className="flex-1 space-y-3 overflow-y-auto bg-brand-ice p-4"
            aria-live="polite"
          >
            {msgs.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${m.role === "user" ? "rounded-br-md bg-brand text-white" : m.emergency ? "rounded-bl-md border-2 border-alert bg-red-50 text-red-900" : "rounded-bl-md bg-white text-slate-800 shadow-soft"}`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  {m.emergency && (
                    <div className="mt-2 flex gap-2">
                      <a
                        href="tel:1990"
                        className="btn-danger px-3 py-1.5 text-xs"
                      >
                        <Phone size={13} /> 1990
                      </a>
                      <a
                        href={`tel:${HOTLINE}`}
                        className="btn-outline px-3 py-1.5 text-xs"
                      >
                        {t("top.hotline")}
                      </a>
                    </div>
                  )}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.actions.map((a) => (
                        <Link
                          key={a.href}
                          href={a.href}
                          onClick={onClose}
                          className="chip hover:bg-brand hover:text-white"
                        >
                          {a.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {busy && (
              <div
                className="flex items-center gap-1 pl-2"
                aria-label={t("chat.typing")}
              >
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 rounded-full bg-brand animate-dot"
                    style={{ animationDelay: `${d * 0.15}s` }}
                  />
                ))}
              </div>
            )}
            <div ref={end} />
          </div>
          <div className="space-y-2 border-t border-brand-sky bg-white p-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {chips.map(([k, q]) => (
                <button
                  key={k}
                  onClick={() => send(q)}
                  className="chip shrink-0 whitespace-nowrap hover:bg-brand hover:text-white"
                >
                  {t(k)}
                </button>
              ))}
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={600}
                placeholder={t("chat.placeholder")}
                aria-label={t("chat.placeholder")}
                className="input py-2.5"
              />
              <button
                className="btn-primary px-3.5"
                aria-label={t("c.send")}
                disabled={busy}
              >
                <Send size={18} />
              </button>
            </form>
            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500">
              <span className="leading-snug">{t("c.disclaimer")}</span>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello RH Hospital")}`}
                target="_blank"
                rel="noreferrer"
                className="flex shrink-0 items-center gap-1 font-bold text-emerald-600"
              >
                <MessageCircle size={14} /> {t("chat.human")}
              </a>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
