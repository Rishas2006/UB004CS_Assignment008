"use client";
import { useState } from "react";
import { Phone } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { useLive } from "../../../lib/live";

export default function Branches() {
  const { branches } = useLive();
  const lang =
    typeof document !== "undefined" &&
    document.documentElement.lang.toLowerCase().startsWith("ar")
      ? "ar"
      : "en";
  const labels =
    lang === "ar"
      ? { title: "الفروع", description: "اختر أحد فروعنا لعرض موقعه." }
      : {
          title: "Branches",
          description: "Select a branch to view its location.",
        };
  const tr = (value: unknown) => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object") {
      const names = value as { en?: string; ar?: string };
      return (
        (lang === "ar" ? names.ar : names.en) ?? names.en ?? names.ar ?? ""
      );
    }
    return "";
  };
  const [id, setId] = useState<string>(branches[0].id);
  const b = branches.find((x) => x.id === id)!;
  const d = 0.02;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${b.lng - d},${b.lat - d},${b.lng + d},${b.lat + d}&layer=mapnik&marker=${b.lat},${b.lng}`;
  return (
    <>
      <PageHero
        title={labels.title}
        desc={labels.description}
        icon="building"
      />
      <section className="wrap section grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          {branches.map((x) => (
            <button
              key={x.id}
              onClick={() => setId(x.id)}
              aria-pressed={id === x.id}
              className={`card w-full p-4 text-left transition ${id === x.id ? "border-brand ring-2 ring-brand/30" : "card-hover"}`}
            >
              <p className="font-extrabold text-brand-dark">{tr(x.name)}</p>
              <p className="text-sm text-slate-600">{x.address}</p>
              <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-brand">
                <Phone size={14} /> {x.phone}
              </span>
            </button>
          ))}
        </div>
        <div className="card overflow-hidden">
          <iframe
            key={b.id}
            title={`Map ${b.id}`}
            src={src}
            className="h-[420px] w-full border-0"
            loading="lazy"
          />
          <a
            className="block p-3 text-center text-sm font-bold text-brand hover:underline"
            target="_blank"
            rel="noreferrer"
            href={`https://www.openstreetmap.org/?mlat=${b.lat}&mlon=${b.lng}#map=16/${b.lat}/${b.lng}`}
          >
            OpenStreetMap ↗
          </a>
        </div>
      </section>
    </>
  );
}
