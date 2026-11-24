"use client";
import { useState } from "react";
import { post, ApiError } from "../../../lib/api";
import { MapPin, Upload } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { SuccessCheck } from "../../../components/Motion";
import { useLang } from "../../../lib/i18n/provider";
import { useLive } from "../../../lib/live";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

const val = (id: string) =>
  (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() ?? "";
const fail = (e: unknown) =>
  alert(e instanceof ApiError ? (e.details?.[0] ? `${e.details[0].field}: ${e.details[0].message}` : e.message) : "Cannot reach the server. Is the backend running?");

export default function Careers() {
  const { jobs } = useLive();
  const { t } = useLang();
  const [job, setJob] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  return (
    <>
      <PageHero title={t("nav.careers")} icon="briefcase" />
      <PhotoBand
        src={IMG.team}
        alt="RH Hospital staff"
        caption={{
          en: "Our doctors, nurses and care team",
          si: "අපගේ වෛද්\u200dයවරු, හෙදියන් සහ සත්කාර කණ්ඩායම",
          ta: "எங்கள் மருத்துவர்கள், செவிலியர்கள் மற்றும் பராமரிப்புக் குழு",
        }}
      />
      <section className="wrap section grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-3">
          {jobs.map(([title, dept, loc, close]) => (
            <button
              key={title}
              onClick={() => {
                setJob(title);
                setDone(false);
              }}
              className={`card card-hover flex w-full items-center justify-between gap-3 p-5 text-left ${job === title ? "ring-2 ring-brand" : ""}`}
            >
              <div>
                <p className="font-extrabold text-brand-dark">{title}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin size={14} />
                  {loc} · {dept}
                </p>
              </div>
              <span className="chip shrink-0">{close}</span>
            </button>
          ))}
        </div>
        <div className="card h-fit p-6">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <SuccessCheck />
              <p className="font-semibold">{t("c.sentOk")}</p>
            </div>
          ) : job ? (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await post("/careers/apply", { name: val("cn"), email: val("ce"), phone: val("cp"), coverNote: `Applied for: ${job}` });
                  setDone(true);
                } catch (err) {
                  fail(err);
                }
              }}
            >
              <h2 className="text-lg font-extrabold text-brand-dark">{job}</h2>
              <div>
                <label className="label" htmlFor="cn">
                  {t("c.name")}
                </label>
                <input id="cn" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="ce">
                  {t("c.email")}
                </label>
                <input id="ce" type="email" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="cp">
                  Phone
                </label>
                <input id="cp" type="tel" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="cv">
                  CV (PDF, max 5 MB)
                </label>
                <input
                  id="cv"
                  type="file"
                  accept="application/pdf"
                  className="input"
                />
              </div>
              <button className="btn-primary w-full">
                <Upload size={16} /> {t("c.submit")}
              </button>
            </form>
          ) : (
            <p className="text-slate-500">← {t("nav.careers")}</p>
          )}
        </div>
      </section>
    </>
  );
}
