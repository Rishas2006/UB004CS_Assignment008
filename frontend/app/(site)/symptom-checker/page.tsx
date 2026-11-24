"use client";
import { post } from "../../../lib/api";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Bot, Phone } from "lucide-react";
import { useLang } from "../../../lib/i18n/provider";
import { hasRedFlag, symptomLocal, type SymptomResult } from "../../../lib/ai";
import { deptName } from "../../../lib/data";

const tone = {
  EMERGENCY: "border-alert bg-red-50 text-red-900",
  SOON: "border-amber-400 bg-amber-50 text-amber-900",
  ROUTINE: "border-emerald-400 bg-emerald-50 text-emerald-900",
} as const;
export default function Symptom() {
  const { t, tr, lang } = useLang();
  const [text, setText] = useState("");
  const [res, setRes] = useState<SymptomResult | null>(null);
  const [busy, setBusy] = useState(false);
  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    if (hasRedFlag(text)) return setRes(symptomLocal(text, lang));
    setBusy(true);
    try {
      const j = await post<SymptomResult & { source?: string }>("/ai/symptom", { text, lang });
      if (j.source === "fallback") throw new Error("local");
      setRes(j);
    } catch {
      setRes(symptomLocal(text, lang));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="bg-primary px-4 py-10 text-white">
        <div className="wrap">
          <div className="flex items-center gap-3">
            <Bot size={28} aria-hidden="true" />
            <div>
              <h1 className="text-3xl font-black">{t("sym.title")}</h1>
              <p className="mt-2 text-white/80">{t("sym.sub")}</p>
            </div>
          </div>
        </div>
      </header>
      <section className="wrap section max-w-2xl">
        <form onSubmit={run} className="card space-y-3 p-6">
          <label className="label" htmlFor="sx">
            {t("sym.title")}
          </label>
          <textarea
            id="sx"
            rows={4}
            maxLength={500}
            className="input"
            placeholder={t("sym.placeholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="text-xs text-slate-500">{t("sym.privacy")}</p>
          <button className="btn-primary w-full" disabled={busy}>
            <Bot size={18} /> {busy ? t("sym.checking") : t("sym.check")}
          </button>
        </form>
        {res && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 rounded-2xl border-2 p-6 ${tone[res.urgency]}`}
            role="alert"
          >
            <p className="flex items-center gap-2 text-lg font-black">
              <AlertTriangle /> {t("sym.urgency")}:{" "}
              {t(`sym.${res.urgency}` as "sym.EMERGENCY")}
            </p>
            <p className="mt-3 text-sm">{res.advice}</p>
            {res.urgency !== "EMERGENCY" && deptName(res.department) && (
              <p className="mt-3 text-sm">
                <b>{t("sym.dept")}:</b> {tr(deptName(res.department))}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {res.urgency === "EMERGENCY" ? (
                <>
                  <a href="tel:1990" className="btn-danger">
                    <Phone size={16} /> 1990
                  </a>
                  <Link href="/emergency" className="btn-outline">
                    {t("nav.emergency")}
                  </Link>
                </>
              ) : (
                <Link
                  href={`/doctors?dept=${res.department}`}
                  className="btn-primary"
                >
                  {t("nav.findDoctor")}
                </Link>
              )}
            </div>
          </motion.div>
        )}
        <p className="mt-5 text-xs text-slate-500">{t("c.disclaimer")}</p>
      </section>
    </>
  );
}
