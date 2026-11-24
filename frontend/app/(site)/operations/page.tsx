"use client";
import { useEffect, useState } from "react";
import { Car, Clock } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { AnimatedBar } from "../../../components/Motion";
import { useLang } from "../../../lib/i18n/provider";
import { useLive } from "../../../lib/live";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

const color = {
  occupied: "bg-red-100 border-red-300 text-red-700",
  available: "bg-emerald-100 border-emerald-300 text-emerald-700",
  cleaning: "bg-amber-100 border-amber-300 text-amber-700",
  maintenance: "bg-slate-200 border-slate-300 text-slate-600",
} as const;
function useOpenNow() {
  const [m, setM] = useState<number | null>(null);
  useEffect(() => {
    const d = new Date();
    setM(d.getHours() * 60 + d.getMinutes());
  }, []);
  return m;
}

export default function Operations() {
  const { hours, icuBeds, parking, wards } = useLive();
  const { t } = useLang();
  const m = useOpenNow();
  const open = (txt: string, h24: boolean) => {
    if (h24) return true;
    if (m === null) return null;
    const r = txt.match(/(\d\d):(\d\d)–(\d\d):(\d\d)/);
    if (!r) return null;
    return m >= +r[1] * 60 + +r[2] && m < +r[3] * 60 + +r[4];
  };
  return (
    <>
      <PageHero title={t("nav.ops")} icon="bed">
        <span className="chip">
          <span className="pulse-dot" /> {t("c.live")}
        </span>
      </PageHero>
      <PhotoBand src={IMG.ward} alt="Inpatient ward with clean beds" caption={{ en: "Clean, comfortable inpatient wards", si: "පිරිසිදු, සුවපහසු රෝගී වාට්ටු", ta: "சுத்தமான, வசதியான உள்நோயாளர் வார்டுகள்" }} />
      <section className="wrap section grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="h2 mb-5">{t("ops.beds")}</h2>
          <div className="space-y-4">
            {wards.map(([n, o, tot], i) => {
              const p = Math.round((o / tot) * 100);
              return (
                <div key={n}>
                  <div className="mb-1 flex justify-between text-sm font-bold text-brand-dark">
                    <span>{n}</span>
                    <span>
                      {o}/{tot}
                    </span>
                  </div>
                  <AnimatedBar
                    pct={p}
                    delay={i * 0.08}
                    className={
                      p > 85
                        ? "bg-red-500"
                        : p > 65
                          ? "bg-amber-400"
                          : "bg-emerald-500"
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="h2 mb-5">{t("ops.map")}</h2>
          <div className="grid grid-cols-5 gap-2">
            {icuBeds.map((s, i) => (
              <div
                key={i}
                className={`grid h-14 place-items-center rounded-xl border text-sm font-black ${color[s]}`}
              >
                B{i + 1}
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            {(
              ["available", "occupied", "cleaning", "maintenance"] as const
            ).map((k) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className={`h-3 w-3 rounded border ${color[k]}`} />
                {k === "available"
                  ? t("c.available")
                  : k === "occupied"
                    ? t("ops.occupied")
                    : k === "cleaning"
                      ? t("ops.cleaning")
                      : t("ops.maintenance")}
              </span>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="h2 mb-5 flex items-center gap-2">
            <Car className="text-brand" /> {t("ops.parking")}
          </h2>
          <div className="space-y-4">
            {parking.map(([n, u, tot]) => (
              <div key={n}>
                <div className="mb-1 flex justify-between text-sm font-bold text-brand-dark">
                  <span>{n}</span>
                  <span>
                    {tot - u} / {tot} {t("c.available").toLowerCase()}
                  </span>
                </div>
                <AnimatedBar pct={Math.round((u / tot) * 100)} />
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="h2 mb-5 flex items-center gap-2">
            <Clock className="text-brand" /> {t("ops.hours")}
          </h2>
          <ul className="divide-y divide-brand-sky">
            {hours.map(([n, h, h24]) => {
              const o = open(h, h24);
              return (
                <li
                  key={n}
                  className="flex items-center justify-between gap-3 py-3 text-sm"
                >
                  <span className="font-bold text-brand-dark">{n}</span>
                  <span className="flex items-center gap-2 text-slate-600">
                    {h24 ? t("c.open24") : h}
                    {o !== null && (
                      <span
                        className={`chip ${o ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                      >
                        {o ? t("c.openNow") : t("c.closed")}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
