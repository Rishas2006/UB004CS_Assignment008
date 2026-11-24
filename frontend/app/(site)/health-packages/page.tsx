"use client";
import Link from "next/link";
import { Check } from "lucide-react";
import PageHero from "../../../components/PageHero";
import Icon from "../../../components/Icon";
import { Item, Stagger } from "../../../components/Motion";
import { useLang } from "../../../lib/i18n/provider";
import { money } from "../../../lib/data";
import { useLive } from "../../../lib/live";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

const steps = [
  "Choose a package",
  "Pick a date and branch",
  "Fast for 8–10 hours if advised",
  "Visit, scan your QR card and get reports online",
];

export default function Packages() {
  const { packages } = useLive();
  const { t, tr } = useLang();
  return (
    <>
      <PageHero
        title={t("nav.packages")}
        desc={t("nav.book")}
        icon="sparkles"
      />
      <PhotoBand
        src={IMG.preventive}
        alt="Health icons on wooden blocks"
        caption={{
          en: "Prevention and regular check-ups keep families healthy",
          si: "වැළැක්වීම සහ නිතිපතා පරීක්ෂා පවුල් සෞඛ්\u200dය සම්පන්නව තබයි",
          ta: "தடுப்பும் வழக்கமான பரிசோதனையும் குடும்பங்களை ஆரோக்கியமாக வைக்கும்",
        }}
      />
      <section className="wrap section">
        <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((p) => (
            <Item key={p.id}>
              <div className="card card-hover flex h-full flex-col p-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-pale text-brand">
                  <Icon name={p.icon} size={24} />
                </span>
                <h2 className="mt-3 text-lg font-extrabold text-brand-dark">
                  {tr(p.name)}
                </h2>
                <p className="mt-1">
                  <span className="text-xs text-slate-400 line-through">
                    {money(p.price)}
                  </span>{" "}
                  <b className="text-2xl text-brand">{money(p.discount)}</b>
                </p>
                <ul className="mt-3 flex-1 space-y-1.5 text-sm text-slate-600">
                  {p.tests.map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <Check size={15} className="text-brand" />
                      {x}
                    </li>
                  ))}
                </ul>
                <Link href="/appointments" className="btn-primary mt-5 w-full">
                  {t("c.bookNow")}
                </Link>
              </div>
            </Item>
          ))}
        </Stagger>
        <div className="card mt-10 p-6">
          <h2 className="h2 mb-4">{t("c.howToBook")}</h2>
          <ol className="grid gap-4 md:grid-cols-4">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand font-black text-white">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-brand-dark">
                  {s}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
