"use client";
import { Download } from "lucide-react";
import { useLang } from "../../../lib/i18n/provider";
import { useLive } from "../../../lib/live";
import Image from "next/image";
import { IMG } from "../../../lib/images";

export default function Reports() {
  const { reports } = useLive();
  const { t } = useLang();
  const years = Array.from(new Set(reports.map((r) => r[1])));
  return (
    <>
      <section className="bg-brand-dark py-12 text-white">
        <div className="wrap">
          <h1 className="text-3xl font-extrabold">{t("nav.reports")}</h1>
        </div>
      </section>
      <section className="wrap pt-8">
        <div className="grid gap-4 md:grid-cols-[1.7fr_1fr]">
          <div className="relative overflow-hidden rounded-3xl shadow-lift">
            <Image
              src={IMG.annualReport}
              alt="RH Hospital Annual Report 2026 highlights"
              width={1400}
              height={933}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <div className="relative min-h-56 overflow-hidden rounded-3xl shadow-soft">
            <Image
              src={IMG.reportPresenter}
              alt="Doctor presenting performance charts"
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          </div>
        </div>
      </section>
      <section className="wrap section space-y-8">
        {years.map((y) => (
          <div key={y}>
            <h2 className="mb-3 text-xl font-extrabold text-brand-dark">{y}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {reports
                .filter((r) => r[1] === y)
                .map(([n, , type]) => (
                  <div
                    key={n}
                    className="card flex items-center justify-between gap-3 p-4"
                  >
                    <div>
                      <p className="font-bold text-brand-dark">{n}</p>
                      <p className="text-xs text-slate-500">{type} · PDF</p>
                    </div>
                    <button
                      className="btn-outline px-3 py-2"
                      aria-label={`${t("c.download")} ${n}`}
                    >
                      <Download size={16} />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
