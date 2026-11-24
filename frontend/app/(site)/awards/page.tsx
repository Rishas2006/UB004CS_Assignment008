"use client";
import { useState } from "react";
import PageHero from "../../../components/PageHero";
import Icon from "../../../components/Icon";
import { Item, Stagger } from "../../../components/Motion";
import { useLang } from "../../../lib/i18n/provider";
import { useLive } from "../../../lib/live";
import Image from "next/image";
import { PhotoGrid } from "../../../components/Photo";
import { IMG, awardImage } from "../../../lib/images";

export default function Awards() {
  const { awards } = useLive();
  const { t } = useLang();
  const [y, setY] = useState("");
  const years = Array.from(new Set(awards.map((a) => a[0])));
  return (
    <>
      <PageHero title={t("nav.awards")} icon="award" />
      <PhotoGrid
        items={[
          { src: IMG.trophy, alt: "Best Hospital of the Year 2024 trophy", caption: { en: "Best Hospital of the Year 2024", si: "වසරේ හොඳම රෝහල 2024", ta: "ஆண்டின் சிறந்த மருத்துவமனை 2024" } },
          { src: IMG.certificate, alt: "Healthcare Excellence Award certificate", caption: { en: "Healthcare Excellence Award", si: "සෞඛ්‍ය විශිෂ්ටතා සම්මානය", ta: "சுகாதாரச் சிறப்பு விருது" } },
          { src: IMG.awardTeam, alt: "RH team celebrating the Patient Safety Award", caption: { en: "Patient Safety Award 2024", si: "රෝගී ආරක්ෂණ සම්මානය 2024", ta: "நோயாளி பாதுகாப்பு விருது 2024" } },
        ]}
      />
      <section className="wrap section">
        <div className="mb-5 flex gap-2">
          <button
            onClick={() => setY("")}
            className={`chip ${!y ? "bg-brand text-white" : ""}`}
          >
            {t("c.all")}
          </button>
          {years.map((x) => (
            <button
              key={x}
              onClick={() => setY(x)}
              className={`chip ${y === x ? "bg-brand text-white" : ""}`}
            >
              {x}
            </button>
          ))}
        </div>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {awards
            .filter((a) => !y || a[0] === y)
            .map(([yr, n]) => (
              <Item key={n}>
                <div className="card flex items-center gap-4 p-5">
                  {awardImage[n] ? (
                    <Image src={awardImage[n]!} alt={n} width={96} height={64} className="h-14 w-20 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
                      <Icon name="award" />
                    </span>
                  )}
                  <div>
                    <p className="text-xs font-black text-brand">{yr}</p>
                    <p className="font-bold text-brand-dark">{n}</p>
                  </div>
                </div>
              </Item>
            ))}
        </Stagger>
      </section>
      <section className="wrap pb-14">
        <div className="mx-auto max-w-md overflow-hidden rounded-3xl shadow-lift">
          <Image src={IMG.awardsInfographic} alt="RH Hospital awards and annual report highlights" width={768} height={1376} className="h-auto w-full" />
        </div>
      </section>
    </>
  );
}
