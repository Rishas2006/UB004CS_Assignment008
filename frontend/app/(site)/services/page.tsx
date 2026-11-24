"use client";
import Link from "next/link";
import Icon from "../../../components/Icon";
import { useLang } from "../../../lib/i18n/provider";
import { useLive } from "../../../lib/live";
import { Cover } from "../../../components/Photo";
import { serviceImage } from "../../../lib/images";

export default function Services() {
  const { services } = useLive();
  const { t, tr } = useLang();
  return (
    <>
      <section className="bg-brand-pale py-12">
        <div className="wrap flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-brand">
            <Icon name="shieldcheck" size={28} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold text-brand-dark">
              {t("sec.services")}
            </h1>
            <p className="mt-2 text-slate-600">{t("sec.servicesDesc")}</p>
          </div>
        </div>
      </section>
      <section className="wrap section">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="card card-hover group flex h-full flex-col overflow-hidden p-6"
              >
                <div className="-mx-6 -mt-6 mb-5">
                  <Cover
                    src={serviceImage[s.slug]}
                    alt={tr(s.name)}
                    icon={s.icon}
                    className="h-40"
                  />
                </div>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-pale text-brand transition group-hover:bg-brand group-hover:text-white">
                  <Icon name={s.icon} size={28} />
                </span>
                <h2 className="mt-4 text-lg font-extrabold text-brand-dark">
                  {tr(s.name)}
                </h2>
                <p className="mt-2 flex-1 text-sm text-slate-600">
                  {tr(s.desc)}
                </p>
                <span className="mt-4 text-sm font-bold text-brand">
                  {t("c.learnMore")} →
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
