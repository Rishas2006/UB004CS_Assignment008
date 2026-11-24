"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { useLang } from "../../../lib/i18n/provider";
import { useLive } from "../../../lib/live";

export default function Faqs() {
  const { faqs } = useLive();
  const { t, tr } = useLang();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState<string | null>("f1");
  const cats = Array.from(new Set(faqs.map((f) => f.cat)));
  const list = faqs.filter(
    (f) =>
      (!cat || f.cat === cat) &&
      (tr(f.q) + tr(f.a)).toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHero title={t("nav.faq")} icon="message" />
      <section className="wrap section max-w-3xl">
        <input
          className="input mb-4"
          placeholder={t("search.ph")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={t("c.search")}
        />
        <div className="mb-5 flex flex-wrap gap-2">
          <button
            onClick={() => setCat("")}
            className={`chip ${!cat ? "bg-brand text-white" : ""}`}
          >
            {t("c.all")}
          </button>
          {cats.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`chip capitalize ${cat === c ? "bg-brand text-white" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {list.map((f) => (
            <div key={f.id} className="card overflow-hidden">
              <button
                onClick={() => setOpen(open === f.id ? null : f.id)}
                aria-expanded={open === f.id}
                className="flex w-full items-center justify-between gap-3 p-4 text-left font-bold text-brand-dark"
              >
                {tr(f.q)}
                <ChevronDown
                  className={`shrink-0 text-brand transition ${open === f.id ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {open === f.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-sm text-slate-600">
                      {tr(f.a)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {list.length === 0 && (
            <p className="text-slate-500">{t("c.noResults")}</p>
          )}
        </div>
      </section>
    </>
  );
}
