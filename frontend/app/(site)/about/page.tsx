"use client";
import Image from "next/image";
import Link from "next/link";
import Icon from "../../../components/Icon";
import { useLang } from "../../../lib/i18n/provider";
import { l } from "../../../lib/i18n/dict";
import type { Key } from "../../../lib/i18n/dict";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

const timeline = [
  [
    "2008",
    l(
      "RH opens its first clinic in Colombo",
      "RH කොළඹ පළමු සායනය විවෘත කරයි",
      "RH கொழும்பில் முதல் மருத்துவ நிலையத்தைத் திறக்கிறது",
    ),
  ],
  [
    "2014",
    l(
      "First inpatient wing and 24/7 emergency unit",
      "පළමු රෝගී වාට්ටුව සහ 24/7 හදිසි ඒකකය",
      "முதல் உள்நோயாளர் பிரிவு மற்றும் 24/7 அவசரப் பிரிவு",
    ),
  ],
  [
    "2019",
    l(
      "Branches open in Kandy and Galle",
      "මහනුවර සහ ගාල්ලේ ශාඛා විවෘත වේ",
      "கண்டி மற்றும் காலியில் கிளைகள் திறப்பு",
    ),
  ],
  [
    "2023",
    l(
      "Jaffna branch and Tamil-language care desk",
      "යාපනය ශාඛාව සහ දෙමළ භාෂා සේවා මෙසය",
      "யாழ்ப்பாணக் கிளை மற்றும் தமிழ் சேவை மையம்",
    ),
  ],
  [
    "2026",
    l(
      "Digital platform with QR health card and AI Doc",
      "QR සෞඛ්‍ය කාඩ්පත සහ AI Doc සහිත ඩිජිටල් වේදිකාව",
      "QR சுகாதார அட்டை மற்றும் AI Doc உடன் டிஜிட்டல் தளம்",
    ),
  ],
] as const;
const why: Key[] = ["why.1", "why.2", "why.3", "why.4", "why.5", "why.6"];

export default function About() {
  const { t, tr } = useLang();
  return (
    <>
      <section className="bg-brand-ice py-12">
        <div className="wrap flex items-center gap-5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-white">
            <Icon name="hospital" />
          </span>
          <div>
            <h1 className="text-3xl font-black text-brand-dark">
              {t("nav.story")}
            </h1>
            <p className="mt-2 text-slate-600">{t("brand.slogan")}</p>
          </div>
        </div>
      </section>
      <PhotoBand
        src={IMG.team}
        alt="RH Hospital care team"
        caption={{
          en: "Our doctors, nurses and care team",
          si: "අපගේ වෛද්\u200dයවරු, හෙදියන් සහ සත්කාර කණ්ඩායම",
          ta: "எங்கள் மருத்துவர்கள், செவிலியர்கள் மற்றும் பராமரிப்புக் குழு",
        }}
      />
      <section className="wrap section grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="card p-6">
            <h2 className="text-xl font-extrabold text-brand-dark">
              {t("sec.vision")}
            </h2>
            <p className="mt-2 text-slate-600">{t("vision.text")}</p>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-extrabold text-brand-dark">
              {t("sec.mission")}
            </h2>
            <p className="mt-2 text-slate-600">{t("mission.text")}</p>
          </div>
        </div>
        <div>
          <Image
            src="/images/rh-hospital-campus.png"
            alt="RH Hospital Campus"
            width={1335}
            height={891}
            className="w-full rounded-3xl object-cover shadow-lift"
          />
        </div>
      </section>
      <section className="bg-brand-ice section">
        <div className="wrap">
          <h2 className="h2 mb-8">{t("nav.story")}</h2>
          <ol className="relative space-y-6 border-l-2 border-brand-sky pl-6">
            {timeline.map(([y, e]) => (
              <li key={y} className="relative">
                <span className="absolute -left-[33px] top-1 h-4 w-4 rounded-full border-4 border-white bg-brand shadow" />
                <p className="text-sm font-black text-brand">{y}</p>
                <p className="font-semibold text-brand-dark">{tr(e)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="wrap section">
        <h2 className="h2 mb-6">{t("sec.why")}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {why.map((k, i) => (
            <div key={k}>
              <div className="card flex items-center gap-3 p-5">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand text-white">
                  <Icon
                    name={
                      (
                        [
                          "shieldcheck",
                          "stethoscope",
                          "microscope",
                          "siren",
                          "heart",
                          "languages",
                        ] as const
                      )[i]
                    }
                  />
                </span>
                <span className="font-bold text-brand-dark">{t(k)}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/directors" className="btn-outline">
            {t("nav.directors")}
          </Link>
          <Link href="/awards" className="btn-outline">
            {t("nav.awards")}
          </Link>
          <Link href="/reports" className="btn-outline">
            {t("nav.reports")}
          </Link>
        </div>
      </section>
    </>
  );
}
