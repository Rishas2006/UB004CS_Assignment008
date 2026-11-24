"use client";
import { useLang } from "../../../lib/i18n/provider";
import { useLive } from "../../../lib/live";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";
import Image from "next/image";
import { directorImage } from "../../../lib/images";

function PageHero({ title, icon }: { title: string; icon: string }) {
  return (
    <section className="bg-brand-dark py-12 text-white" data-icon={icon}>
      <div className="wrap">
        <h1 className="text-3xl font-black">{title}</h1>
      </div>
    </section>
  );
}

export default function Directors() {
  const { directors } = useLive();
  const { t } = useLang();
  const initials = (n: string) =>
    n
      .split(" ")
      .filter((w) => /^[A-Z]/.test(w) && !w.endsWith("."))
      .map((w) => w[0])
      .slice(0, 2)
      .join("");
  return (
    <>
      <PageHero title={t("nav.directors")} icon="users" />
      <PhotoBand
        src={IMG.team}
        alt="RH Hospital leadership and staff"
        caption={{
          en: "Our doctors, nurses and care team",
          si: "අපගේ වෛද්\u200dයවරු, හෙදියන් සහ සත්කාර කණ්ඩායම",
          ta: "எங்கள் மருத்துவர்கள், செவிலியர்கள் மற்றும் பராமரிப்புக் குழு",
        }}
      />
      <section className="wrap section">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {directors.map((d) => (
            <div
              key={d.name}
              className={`card p-6 text-center ${d.chair ? "border-brand ring-2 ring-brand/30" : ""}`}
            >
              {directorImage[d.name] ? (
                <Image
                  src={directorImage[d.name]!}
                  alt={d.name}
                  width={160}
                  height={160}
                  className={`mx-auto h-28 w-28 rounded-full border-4 border-white object-cover shadow-lift ${d.chair ? "ring-4 ring-brand" : "ring-2 ring-brand-sky"}`}
                />
              ) : (
                <span className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-brand text-3xl font-black text-white shadow-soft">
                  {initials(d.name)}
                </span>
              )}
              <p className="mt-3 font-extrabold text-brand-dark">{d.name}</p>
              <p className="text-sm font-semibold text-brand">{d.role}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
