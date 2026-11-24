"use client";
import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Video } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { useLang } from "../../../lib/i18n/provider";
import { money, specialtyOf } from "../../../lib/data";
import { useLive } from "../../../lib/live";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";
import { Cover } from "../../../components/Photo";
import { deptImage } from "../../../lib/images";

function Finder() {
  const { branches, departments, doctors } = useLive();
  const { t, tr, lang } = useLang();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") || "");
  const [dept, setDept] = useState(sp.get("dept") || "");
  const [branch, setBranch] = useState("");
  const [language, setLanguage] = useState("");
  const [video, setVideo] = useState(false);
  const [resident, setResident] = useState(false);
  const list = useMemo(
    () =>
      doctors.filter(
        (d) =>
          (!q ||
            (d.name + tr(specialtyOf(d)))
              .toLowerCase()
              .includes(q.toLowerCase())) &&
          (!dept || d.dept === dept) &&
          (!branch || d.branch === branch) &&
          (!language || d.langs.includes(language as "en")) &&
          (!video || d.video) &&
          (!resident || d.resident),
      ),
    [q, dept, branch, language, video, resident, lang],
  ); // eslint-disable-line

  return (
    <section className="wrap section">
      <div className="card mb-8 grid gap-3 p-4 md:grid-cols-5">
        <input
          className="input md:col-span-2"
          placeholder={t("hero.search")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label={t("c.search")}
        />
        <select
          className="input"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
          aria-label={t("filter.specialty")}
        >
          <option value="">
            {t("filter.specialty")}: {t("filter.any")}
          </option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {tr(d.name)}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          aria-label={t("filter.branch")}
        >
          <option value="">
            {t("filter.branch")}: {t("filter.any")}
          </option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {tr(b.name)}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          aria-label={t("filter.language")}
        >
          <option value="">
            {t("filter.language")}: {t("filter.any")}
          </option>
          <option value="en">English</option>
          <option value="si">සිංහල</option>
          <option value="ta">தமிழ்</option>
        </select>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={video}
            onChange={(e) => setVideo(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />{" "}
          {t("filter.video")}
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={resident}
            onChange={(e) => setResident(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />{" "}
          {t("filter.resident")}
        </label>
      </div>
      {list.length === 0 && (
        <p className="text-slate-500">{t("c.noResults")}</p>
      )}
      <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {list.map((d) => (
            <motion.div
              layout
              key={d.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card card-hover group overflow-hidden p-5"
            >
              <div className="-mx-5 -mt-5 mb-4">
                <Cover src={deptImage[d.dept]} alt={tr(specialtyOf(d))} icon={departments.find((x) => x.id === d.dept)?.icon} className="h-36" />
              </div>
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-brand text-xl font-black text-white">
                  {d.initials}
                </span>
                <div>
                  <Link
                    href={`/doctors/${d.id}`}
                    className="font-extrabold text-brand-dark hover:text-brand"
                  >
                    {d.name}
                  </Link>
                  <p className="text-sm font-semibold text-brand">
                    {tr(specialtyOf(d))}
                  </p>
                  <p className="text-xs text-slate-500">
                    {tr(branches.find((b) => b.id === d.branch)!.name)} ·{" "}
                    {d.exp} {t("c.years")}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {d.video && (
                  <span className="chip">
                    <Video size={12} /> {t("c.video")}
                  </span>
                )}
                {d.resident && <span className="chip">{t("c.resident")}</span>}
                {d.langs.map((x) => (
                  <span key={x} className="chip bg-slate-100 text-slate-600">
                    {x.toUpperCase()}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {t("c.fee")}:{" "}
                  <b className="text-brand-dark">{money(d.fee)}</b>
                </span>
                <Link
                  href={`/appointments?doctor=${d.id}`}
                  className="btn-primary px-4 py-2"
                >
                  {t("c.bookNow")}
                </Link>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
export default function Doctors() {
  const { doctors } = useLive();
  const { t } = useLang();
  return (
    <>
      <PageHero
        title={t("nav.findDoctor")}
        desc={t("sec.doctorsDesc")}
        icon="stethoscope"
      />
      <PhotoBand src={IMG.team} alt="RH Hospital doctors and nurses" caption={{ en: "Our doctors, nurses and care team", si: "අපගේ වෛද්\u200dයවරු, හෙදියන් සහ සත්කාර කණ්ඩායම", ta: "எங்கள் மருத்துவர்கள், செவிலியர்கள் மற்றும் பராமரிப்புக் குழு" }} />
      <Suspense
        fallback={
          <div className="wrap section">
            <div className="skeleton h-40" />
          </div>
        }
      >
        <Finder />
      </Suspense>
    </>
  );
}
