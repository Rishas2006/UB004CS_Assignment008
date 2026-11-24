"use client";
import Link from "next/link";
import PageHero from "../../../components/PageHero";
import { Item, Stagger } from "../../../components/Motion";
import { useLang } from "../../../lib/i18n/provider";
import { useLive } from "../../../lib/live";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

export default function Promotions() {
  const { promotions } = useLive();
  const { t, tr } = useLang();
  return (
    <>
      <PageHero title={t("nav.promotions")} icon="percent" />
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
        <Stagger className="grid gap-5 md:grid-cols-3">
          {promotions.map((p) => (
            <Item key={p.id}>
              <div className="card card-hover h-full bg-gradient-to-br from-white to-brand-pale p-6">
                <p className="chip">→ {p.until}</p>
                <h2 className="mt-3 text-xl font-extrabold text-brand-dark">
                  {tr(p.title)}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{tr(p.desc)}</p>
                <Link href="/health-packages" className="btn-primary mt-5">
                  {t("c.bookNow")}
                </Link>
              </div>
            </Item>
          ))}
        </Stagger>
      </section>
    </>
  );
}
