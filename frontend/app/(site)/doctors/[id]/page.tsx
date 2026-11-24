"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BadgeCheck,
  CalendarDays,
  Languages,
  MapPin,
  Stethoscope,
  Video,
} from "lucide-react";
import { useLang } from "../../../../lib/i18n/provider";
import { money, specialtyOf } from "../../../../lib/data";
import { useLive } from "../../../../lib/live";
import { PhotoBand } from "../../../../components/Photo";
import { deptImage } from "../../../../lib/images";

export default function DoctorProfile() {
  const { branches, doctors } = useLive();
  const { id } = useParams<{ id: string }>();
  const { t, tr } = useLang();
  const d = doctors.find((x) => x.id === id);
  if (!d)
    return (
      <div className="wrap section">
        <p>{t("c.noResults")}</p>
      </div>
    );
  const b = branches.find((x) => x.id === d.branch)!;
  const rows = [
    [BadgeCheck, t("c.experience"), `${d.exp} ${t("c.years")} · ${d.slmc}`],
    [MapPin, t("c.branch"), `${tr(b.name)} · ${b.address}`],
    [CalendarDays, t("c.hours"), d.days],
    [
      Languages,
      t("c.languages"),
      d.langs.map((x) => x.toUpperCase()).join(", "),
    ],
  ] as const;
  return (
    <>
      <section className="wrap section pb-0">
        <div className="card flex items-center gap-4 p-6">
          <Stethoscope className="text-brand" size={32} />
          <div>
            <h1 className="text-3xl font-black text-brand-dark">{d.name}</h1>
            <p className="mt-1 text-slate-500">{tr(specialtyOf(d))}</p>
          </div>
        </div>
      </section>
      {deptImage[d.dept] && (
        <PhotoBand src={deptImage[d.dept]!} alt={tr(specialtyOf(d))} className="h-56 md:h-72" />
      )}
      <section className="wrap section grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card divide-y divide-brand-sky">
          {rows.map(([I, k, v]) => (
            <div key={k} className="flex items-start gap-3 p-5">
              <I className="mt-0.5 text-brand" size={20} />
              <div>
                <p className="text-xs font-bold text-slate-500">{k}</p>
                <p className="font-semibold text-brand-dark">{v}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="card h-fit p-6">
          <p className="text-sm text-slate-500">{t("c.fee")}</p>
          <p className="text-3xl font-black text-brand">{money(d.fee)}</p>
          {d.video && (
            <p className="chip mt-3">
              <Video size={13} /> {t("c.video")}
            </p>
          )}
          <Link
            href={`/appointments?doctor=${d.id}`}
            className="btn-primary mt-5 w-full"
          >
            {t("nav.book")}
          </Link>
        </div>
      </section>
    </>
  );
}
