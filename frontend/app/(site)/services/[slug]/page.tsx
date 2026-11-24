"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import * as LucideIcons from "lucide-react";
import { Check, Clock, Stethoscope } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLang } from "../../../../lib/i18n/provider";
import { useLive } from "../../../../lib/live";
import { PhotoBand } from "../../../../components/Photo";
import { serviceImage } from "../../../../lib/images";

export default function ServiceDetail() {
  const { services } = useLive();
  const { slug } = useParams<{ slug: string }>();
  const { t, tr } = useLang();
  const s = services.find((x) => x.slug === slug);
  if (!s)
    return (
      <div className="wrap section">
        <p>{t("c.noResults")}</p>
        <Link href="/services" className="btn-outline mt-4">
          {t("nav.services")}
        </Link>
      </div>
    );
  const ServiceIcon =
    (Object.entries(LucideIcons).find(
      ([name]) => name.toLowerCase() === String(s.icon).toLowerCase(),
    )?.[1] as LucideIcon | undefined) ?? Stethoscope;
  return (
    <>
      <section className="wrap section pb-0">
        <div className="card flex items-center gap-4 p-6">
          <ServiceIcon className="shrink-0 text-brand" size={32} />
          <div>
            <h1 className="h1">{tr(s.name)}</h1>
            <p className="mt-2 text-slate-600">{tr(s.desc)}</p>
          </div>
        </div>
      </section>
      {serviceImage[s.slug] && (
        <PhotoBand src={serviceImage[s.slug]!} alt={tr(s.name)} className="h-56 md:h-72" />
      )}
      <section className="wrap section grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <h2 className="h2 mb-4">{t("c.includes")}</h2>
          <ul className="space-y-3">
            {s.points.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="mt-0.5 shrink-0 text-brand" size={18} />
                {tr(p)}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs text-slate-500">{t("c.fallbackNote")}</p>
        </div>
        <div className="space-y-4">
          {s.hours && (
            <div className="card flex items-center gap-3 p-5">
              <Clock className="text-brand" />
              <div>
                <p className="text-xs font-bold text-slate-500">
                  {t("c.hours")}
                </p>
                <p className="font-extrabold text-brand-dark">{s.hours}</p>
              </div>
            </div>
          )}
          <div className="card p-5">
            <p className="font-extrabold text-brand-dark">{t("c.howToBook")}</p>
            <p className="mt-1 text-sm text-slate-600">{t("b.sub")}</p>
            <Link href="/appointments" className="btn-primary mt-4 w-full">
              {t("nav.book")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
