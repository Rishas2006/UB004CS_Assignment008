"use client";
import Link from "next/link";
import { Award } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { Item, Stagger } from "../../../components/Motion";
import { useLang } from "../../../lib/i18n/provider";
import { useLive } from "../../../lib/live";
import { Cover } from "../../../components/Photo";
import { deptImage } from "../../../lib/images";
import Icon from "../../../components/Icon";

export default function Departments() {
  const { departments } = useLive();
  const { t, tr } = useLang();
  return (
    <>
      <PageHero
        title={t("nav.departments")}
        desc={t("sec.servicesDesc")}
        icon="heartpulse"
      />
      <section className="wrap section">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {departments.map((d) => (
            <Item key={d.id}>
              <div className="card card-hover group flex h-full flex-col overflow-hidden p-6">
                <div className="-mx-6 -mt-6 mb-5">
                  <Cover
                    src={deptImage[d.id]}
                    alt={tr(d.name)}
                    icon={d.icon}
                    className="h-44"
                  />
                </div>
                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white">
                    <Icon name={d.icon} size={28} />
                  </span>
                  {d.centre && (
                    <span className="chip">
                      <Award size={13} /> {t("c.centre")}
                    </span>
                  )}
                </div>
                <h2 className="mt-4 font-extrabold text-brand-dark">
                  {tr(d.name)}
                </h2>
                <p className="mt-2 flex-1 text-sm text-slate-600">
                  {tr(d.desc)}
                </p>
                <Link
                  href={`/doctors?dept=${d.id}`}
                  className="mt-4 text-sm font-bold text-brand"
                >
                  {t("nav.findDoctor")} →
                </Link>
              </div>
            </Item>
          ))}
        </Stagger>
      </section>
    </>
  );
}
