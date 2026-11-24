"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Phone,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import Icon, { type IconName } from "../../components/Icon";
import { CountUp, Item, Reveal, Stagger } from "../../components/Motion";
import { useLang } from "../../lib/i18n/provider";
import { HOTLINE, HOTLINE_LABEL, money, specialtyOf } from "../../lib/data";
import { useLive, useLiveLoader } from "../../lib/live";
import type { Key } from "../../lib/i18n/dict";
import { Cover } from "../../components/Photo";
import { deptImage, serviceImage, IMG } from "../../lib/images";

const tiles: [Key, IconName, string][] = [
  ["q.appointment", "calendar", "/appointments"],
  ["q.video", "video", "/video-consultation"],
  ["q.ambulance", "ambulance", "/ambulance"],
  ["q.ai", "bot", "/symptom-checker"],
  ["q.lab", "flask", "/laboratory"],
  ["q.pharmacy", "pill", "/pharmacy"],
];
const why: Key[] = ["why.1", "why.2", "why.3", "why.4", "why.5", "why.6"];

export default function Home() {
  const { departments, doctors, news, packages, reviews, services } = useLive();
  const { load } = useLiveLoader();
  const { t, tr, lang } = useLang();
  const router = useRouter();
  const [q, setQ] = useState("");

  // ✅ Need Home page open run
  // departments, doctors, services, packages, news, reviews
  useEffect(() => {
    load("departments", "doctors", "services", "packages", "news", "reviews");
  }, [load]);

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/doctors?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-brand-sky">
        <svg
          className="pointer-events-none absolute inset-x-0 top-[38%] hidden h-24 w-full text-brand/15 md:block"
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden
        >
          <path
            className="ecg animate-draw"
            style={{ strokeDasharray: 1600, strokeDashoffset: 1600 }}
            d="M0 55h380l30-40 40 80 32-60 20 20h698"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="wrap relative grid items-center gap-10 py-12 md:py-16 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="chip mb-5"
            >
              <ShieldCheck size={14} /> {t("hero.kicker")}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-black leading-[1.05] tracking-tight text-brand-dark md:text-6xl"
            >
              {t("hero.title1")}
              <br />
              <span className="text-brand">{t("hero.title2")}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-5 max-w-xl text-lg text-slate-600"
            >
              {t("hero.desc")}
            </motion.p>
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-5 space-y-2 font-semibold text-brand-dark"
            >
              {(["hero.check1", "hero.check2", "hero.check3"] as Key[]).map(
                (k) => (
                  <li key={k} className="flex items-center gap-2">
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-white">
                      <Check size={13} strokeWidth={3} />
                    </span>
                    {t(k)}
                  </li>
                ),
              )}
            </motion.ul>
            <motion.form
              onSubmit={go}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mt-7 flex max-w-xl gap-2 rounded-2xl bg-white p-2 shadow-lift"
            >
              <label className="flex flex-1 items-center gap-2 px-3">
                <Search size={18} className="text-brand" />
                <span className="sr-only">{t("hero.search")}</span>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={t("hero.search")}
                  className="w-full bg-transparent py-2.5 text-sm outline-none"
                />
              </label>
              <button className="btn-primary">{t("hero.find")}</button>
            </motion.form>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/appointments" className="btn-primary">
                {t("nav.book")} <ArrowRight size={16} />
              </Link>
              <a href={`tel:${HOTLINE}`} className="btn-outline">
                <Phone size={16} /> {HOTLINE_LABEL}
              </a>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="relative mx-auto w-full max-w-[520px]"
          >
            <div className="absolute -inset-4 rounded-[2.5rem] bg-brand/10 blur-2xl" />
            <Image
              src="/images/doctors-team.jpg"
              alt="RH Hospital care team"
              width={1254}
              height={1254}
              priority
              className="relative aspect-square w-full rounded-[2rem] object-cover shadow-lift"
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="card absolute -left-3 bottom-8 flex items-center gap-3 p-3"
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                <Icon name="siren" size={20} />
              </span>
              <div className="text-xs">
                <p className="font-extrabold text-brand-dark">
                  {t("top.emergency")}
                </p>
                <p className="flex items-center gap-1.5 text-slate-500">
                  <span className="pulse-dot" /> {t("c.live")}
                </p>
              </div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="card absolute -right-2 top-8 flex items-center gap-2 p-3 text-xs"
            >
              <Star className="fill-amber-400 text-amber-400" size={18} />
              <b className="text-brand-dark">4.9</b>
              <span className="text-slate-500">
                98% {t("stat.satisfaction")}
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* QUICK TILES */}
      <section className="wrap -mt-2 pb-4">
        <Stagger
          className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6"
          gap={0.06}
        >
          {tiles.map(([k, ic, href]) => (
            <Item key={href}>
              <Link
                href={href}
                className="card card-hover flex h-full flex-col items-center gap-3 p-4 text-center"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-pale text-brand">
                  <Icon name={ic} size={26} />
                </span>
                <span className="text-sm font-bold text-brand-dark">
                  {t(k)}
                </span>
              </Link>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* STATS */}
      <section className="wrap section">
        <div className="grid grid-cols-2 gap-4 rounded-3xl bg-gradient-to-r from-brand-dark to-brand p-6 text-white md:grid-cols-4 md:p-8">
          {[
            [25, "+", "stat.departments", "building"],
            [500, "+", "stat.doctors", "stethoscope"],
            [1, "M+", "stat.patients", "users"],
            [98, "%", "stat.satisfaction", "heart"],
          ].map(([n, s, k, ic]) => (
            <div key={k as string} className="flex items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/15">
                <Icon name={ic as IconName} size={24} />
              </span>
              <div>
                <p className="text-3xl font-black">
                  <CountUp to={n as number} suffix={s as string} />
                </p>
                <p className="text-xs text-sky-100">{t(k as Key)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="wrap pb-6">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="h2">{t("sec.services")}</h2>
              <p className="mt-1 text-slate-600">{t("sec.servicesDesc")}</p>
            </div>
            <Link
              href="/services"
              className="font-bold text-brand hover:underline"
            >
              {t("c.viewAll")} →
            </Link>
          </div>
        </Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 8).map((s) => (
            <Item key={s.slug}>
              <Link
                href={`/services/${s.slug}`}
                className="card card-hover group block h-full overflow-hidden p-5"
              >
                <div className="-mx-5 -mt-5 mb-4">
                  <Cover
                    src={serviceImage[s.slug]}
                    alt={tr(s.name)}
                    icon={s.icon}
                    className="h-32"
                  />
                </div>
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-pale text-brand transition group-hover:bg-brand group-hover:text-white">
                  <Icon name={s.icon} size={24} />
                </span>
                <h3 className="mt-4 font-extrabold text-brand-dark">
                  {tr(s.name)}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600">{tr(s.desc)}</p>
                <span className="mt-3 inline-block text-sm font-bold text-brand">
                  {t("c.learnMore")} →
                </span>
              </Link>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* DEPARTMENTS */}
      <section className="bg-brand-ice section mt-10">
        <div className="wrap">
          <Reveal>
            <h2 className="h2 mb-6">{t("nav.departments")}</h2>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {departments.map((d, i) => (
              <Reveal key={d.id} delay={i * 0.04}>
                <Link
                  href={`/doctors?dept=${d.id}`}
                  className="card card-hover flex items-center gap-3 p-4"
                >
                  {deptImage[d.id] ? (
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl">
                      <Image
                        src={deptImage[d.id]!}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    </span>
                  ) : (
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand text-white">
                      <Icon name={d.icon} size={22} />
                    </span>
                  )}
                  <span className="text-sm font-bold text-brand-dark">
                    {tr(d.name)}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DOCTORS */}
      <section className="wrap section">
        <Reveal>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="h2">{t("sec.doctors")}</h2>
              <p className="mt-1 text-slate-600">{t("sec.doctorsDesc")}</p>
            </div>
            <Link
              href="/doctors"
              className="font-bold text-brand hover:underline"
            >
              {t("c.viewAll")} →
            </Link>
          </div>
        </Reveal>
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {doctors.slice(0, 4).map((d) => (
            <Item key={d.id}>
              <div className="card card-hover overflow-hidden">
                <div className="group relative">
                  <Cover
                    src={deptImage[d.dept]}
                    alt={tr(specialtyOf(d))}
                    icon={departments.find((x) => x.id === d.dept)?.icon}
                    className="h-36"
                  />
                  <span className="absolute -bottom-7 left-4 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-brand text-lg font-black text-white shadow-soft">
                    {d.initials}
                  </span>
                </div>
                <div className="p-4 pt-9">
                  <p className="font-extrabold text-brand-dark">{d.name}</p>
                  <p className="text-sm font-semibold text-brand">
                    {tr(specialtyOf(d))}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {d.exp} {t("c.years")}
                  </p>
                  <Link
                    href={`/appointments?doctor=${d.id}`}
                    className="mt-3 inline-block text-sm font-bold text-brand"
                  >
                    {t("c.bookVisit")} →
                  </Link>
                </div>
              </div>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* INSIDE RH */}
      <section className="wrap pb-6">
        <Reveal>
          <h2 className="h2 mb-6">
            {tr({
              en: "Inside RH Hospital",
              si: "RH රෝහල තුළ",
              ta: "RH மருத்துவமனையின் உள்ளே",
            })}
          </h2>
        </Reveal>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {[
            {
              src: IMG.surgery,
              href: "/services/surgery",
              en: "Operating theatres",
              si: "ශල්‍යාගාර",
              ta: "அறுவை அரங்குகள்",
            },
            {
              src: IMG.ward,
              href: "/operations",
              en: "Inpatient wards",
              si: "රෝගී වාට්ටු",
              ta: "உள்நோயாளர் வார்டுகள்",
            },
            {
              src: IMG.lab,
              href: "/laboratory",
              en: "Laboratory",
              si: "විද්‍යාගාරය",
              ta: "ஆய்வகம்",
            },
            {
              src: IMG.pharmacyShelves,
              href: "/pharmacy",
              en: "Pharmacy",
              si: "ඖෂධ ශාලාව",
              ta: "மருந்தகம்",
            },
            {
              src: IMG.emergency,
              href: "/emergency",
              en: "Emergency & ambulance",
              si: "හදිසි සහ ගිලන්රථ",
              ta: "அவசரம் & ஆம்புலன்ஸ்",
            },
            {
              src: IMG.canteenHall,
              href: "/canteen",
              en: "Canteen",
              si: "කැන්ටීම",
              ta: "உணவகம்",
            },
          ].map((x) => (
            <Link
              key={x.href}
              href={x.href}
              className="group relative block h-40 overflow-hidden rounded-2xl shadow-soft md:h-56"
            >
              <Image
                src={x.src}
                alt={x.en}
                fill
                sizes="(max-width: 768px) 50vw, 400px"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark/85 to-transparent p-3 pt-10 text-sm font-bold text-white">
                {tr(x)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* VISION + WHY */}
      <section className="bg-gradient-to-br from-brand-pale to-white section">
        <div className="wrap grid items-center gap-8 lg:grid-cols-2">
          <Reveal className="space-y-4">
            <div className="card p-6">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-brand-dark">
                <Icon name="eye" className="text-brand" /> {t("sec.vision")}
              </h3>
              <p className="mt-2 text-slate-600">{t("vision.text")}</p>
            </div>
            <div className="card p-6">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-brand-dark">
                <Icon name="heart" className="text-brand" /> {t("sec.mission")}
              </h3>
              <p className="mt-2 text-slate-600">{t("mission.text")}</p>
            </div>
            <div className="card p-6">
              <h3 className="mb-3 text-lg font-extrabold text-brand-dark">
                {t("sec.why")}
              </h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {why.map((k) => (
                  <li key={k} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-brand" /> {t(k)}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <Image
              src="/images/rh-hospital-campus.png"
              alt="RH Hospital campus"
              width={1335}
              height={891}
              className="w-full rounded-3xl object-cover shadow-lift"
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="card absolute -left-3 bottom-8 flex items-center gap-3 p-3"
            ></motion.div>
          </Reveal>
        </div>
      </section>

      {/* AI BANNER */}
      <section className="wrap section">
        <Reveal>
          <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl bg-gradient-to-r from-brand-dark via-brand to-brand-mid p-8 text-white md:flex-row md:p-10">
            <Image
              src="/images/ai-doc.jpg"
              alt="RH AI Doc"
              width={120}
              height={120}
              className="h-28 w-28 rounded-3xl bg-white p-1 animate-floaty"
            />
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-black md:text-3xl">
                {t("ai.title")}
              </h2>
              <p className="mt-2 text-sky-100">{t("ai.desc")}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href="/symptom-checker" className="btn-white">
                <Icon name="bot" size={18} /> {t("nav.symptom")}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* PACKAGES */}
      <section className="wrap pb-6">
        <Reveal>
          <div className="mb-6 flex items-end justify-between">
            <h2 className="h2">{t("sec.packages")}</h2>
            <Link
              href="/health-packages"
              className="font-bold text-brand hover:underline"
            >
              {t("c.viewAll")} →
            </Link>
          </div>
        </Reveal>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {packages.slice(0, 3).map((p) => (
            <Item key={p.id}>
              <div className="card card-hover h-full p-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-pale text-brand">
                  <Icon name={p.icon} size={24} />
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-brand-dark">
                  {tr(p.name)}
                </h3>
                <p className="mt-1">
                  <span className="text-xs text-slate-400 line-through">
                    {money(p.price)}
                  </span>{" "}
                  <b className="text-xl text-brand">{money(p.discount)}</b>
                </p>
                <Link
                  href="/health-packages"
                  className="btn-outline mt-4 w-full"
                >
                  {t("c.learnMore")}
                </Link>
              </div>
            </Item>
          ))}
        </Stagger>
      </section>

      {/* NEWS + REVIEWS */}
      <section className="bg-brand-ice section mt-10">
        <div className="wrap grid gap-10 lg:grid-cols-2">
          <div>
            <Reveal>
              <h2 className="h2 mb-5">{t("sec.news")}</h2>
            </Reveal>
            <div className="space-y-3">
              {news.slice(0, 3).map((n) => (
                <Reveal key={n.slug}>
                  <Link
                    href={`/news/${n.slug}`}
                    className="card card-hover flex items-center gap-4 p-4"
                  >
                    <Icon
                      name="news"
                      className="shrink-0 text-brand"
                      size={26}
                    />
                    <div>
                      <p className="text-xs text-slate-500">
                        {n.date} · {tr(n.cat)}
                      </p>
                      <p className="font-bold text-brand-dark">{tr(n.title)}</p>
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <Reveal>
              <h2 className="h2 mb-5">{t("sec.reviews")}</h2>
            </Reveal>
            <div className="space-y-3">
              {reviews.map((r: (typeof reviews)[number]) => (
                <Reveal key={r.name}>
                  <div className="card p-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={15}
                          className={
                            i < r.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }
                        />
                      ))}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-700">
                      “{tr(r.text)}”
                    </p>
                    <p className="mt-1 text-xs font-bold text-brand-dark">
                      {r.name}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EMERGENCY STRIP */}
      <section className="wrap section">
        <Reveal>
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border-2 border-alert/30 bg-red-50 p-5">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-alert text-white">
              <Icon name="siren" />
            </span>
            <div className="flex-1">
              <p className="font-extrabold text-red-900">{t("em.title")}</p>
              <p className="text-sm text-red-800">{t("em.desc")}</p>
            </div>
            <a href={`tel:${HOTLINE}`} className="btn-danger">
              <Phone size={16} /> {HOTLINE_LABEL}
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
