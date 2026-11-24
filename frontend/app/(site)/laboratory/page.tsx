"use client";
import Image from "next/image";
import { useState } from "react";
import PageHero from "../../../components/PageHero";
import { useLang } from "../../../lib/i18n/provider";
import { money } from "../../../lib/data";
import { useLive } from "../../../lib/live";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

export default function Laboratory() {
  const { labTests } = useLive();
  const { t } = useLang();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const cats = Array.from(new Set(labTests.map((x) => x[2])));
  const list = labTests.filter(
    (x) =>
      (!cat || x[2] === cat) && x[1].toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageHero
        title={t("nav.lab")}
        desc={t("sec.servicesDesc")}
        icon="flask"
      />
      <PhotoBand src={IMG.lab} alt="Laboratory technologist at an analyser" caption={{ en: "Modern laboratory and diagnostics", si: "නවීන විද්\u200dයාගාරය සහ රෝග නිර්ණය", ta: "நவீன ஆய்வகம் மற்றும் நோயறிதல்" }} />
      <section className="wrap section">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Image
            src="/images/lab-icon.jpg"
            alt=""
            width={56}
            height={56}
            className="rounded-xl"
          />
          <input
            className="input max-w-xs"
            placeholder={t("search.ph")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label={t("c.search")}
          />
          <div className="flex flex-wrap gap-2">
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
                className={`chip ${cat === c ? "bg-brand text-white" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-brand-pale text-xs text-brand-dark">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">{t("tbl.name")}</th>
                <th className="p-3">{t("c.price")}</th>
                <th className="p-3">Turnaround</th>
              </tr>
            </thead>
            <tbody>
              {list.map(([code, name, , price, h]) => (
                <tr
                  key={code}
                  className="border-t border-brand-sky hover:bg-brand-ice"
                >
                  <td className="p-3 font-mono text-xs text-slate-500">
                    {code}
                  </td>
                  <td className="p-3 font-semibold text-brand-dark">{name}</td>
                  <td className="p-3">{money(price)}</td>
                  <td className="p-3">{h} h</td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && (
            <p className="p-5 text-slate-500">{t("c.noResults")}</p>
          )}
        </div>
      </section>
    </>
  );
}
