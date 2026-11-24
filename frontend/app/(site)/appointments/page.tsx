"use client";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Video } from "lucide-react";
import PageHero from "../../../components/PageHero";
import Icon from "../../../components/Icon";
import { SuccessCheck } from "../../../components/Motion";
import { useLang } from "../../../lib/i18n/provider";
import { api, post, ApiError } from "../../../lib/api";
import { money, specialtyOf } from "../../../lib/data";
import { useLive } from "../../../lib/live";
import type { Key } from "../../../lib/i18n/dict";

const steps: Key[] = ["b.step1", "b.step2", "b.step3", "b.step4"];
const key = (d: Date) => d.toISOString().slice(0, 10);

function Wizard() {
  const { branches, departments, doctors } = useLive();
  const { t, tr, lang } = useLang();
  const sp = useSearchParams();
  const pre = doctors.find(
    (d: (typeof doctors)[number]) => d.id === sp.get("doctor"),
  );
  const [step, setStep] = useState(pre ? 2 : 0);
  const [dept, setDept] = useState(pre?.dept || "");
  const [docId, setDocId] = useState(pre?.id || "");
  const [days, setDays] = useState<Date[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<"IN_PERSON" | "VIDEO">("IN_PERSON");
  const [done, setDone] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", reason: "" });
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookErr, setBookErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const base = new Date();
    const arr = Array.from(
      { length: 7 },
      (_, i) =>
        new Date(base.getFullYear(), base.getMonth(), base.getDate() + i),
    );
    setDays(arr);
    setDate(key(arr[0]));
  }, []);
  const doc = doctors.find((d) => d.id === docId);
  const docs = useMemo(
    () => doctors.filter((d) => !dept || d.dept === dept),
    [dept],
  );
  // live availability from the backend (schedule minus booked rows)
  useEffect(() => {
    if (!docId || !date) return;
    let alive = true;
    setLoadingSlots(true);
    api<{ slots: { time: string; available: boolean }[] }>(
      `/doctors/${docId}/slots?date=${date}`,
    )
      .then((r) => alive && setSlots(r.slots))
      .catch(() => alive && setSlots([]))
      .finally(() => alive && setLoadingSlots(false));
    return () => {
      alive = false;
    };
  }, [docId, date]);
  const free = useMemo(
    () => slots.filter((s) => s.available).map((s) => s.time),
    [slots],
  );
  const fmt = new Intl.DateTimeFormat(
    lang === "en" ? "en-GB" : lang === "si" ? "si-LK" : "ta-LK",
    { weekday: "short", day: "numeric" },
  );
  const canNext =
    step === 0
      ? !!dept
      : step === 1
        ? !!docId
        : step === 2
          ? !!time
          : !!form.name.trim() && !!form.phone.trim();

  async function confirm() {
    if (!doc) return;
    setBookErr("");
    setBusy(true);
    try {
      const r = await post<{ ref: string }>("/appointments", {
        doctorId: doc.id,
        date,
        time,
        type,
        reason: form.reason || undefined,
        name: form.name.trim(),
        phone: form.phone.trim(),
      });
      setDone(r.ref);
    } catch (e) {
      setBookErr(
        e instanceof ApiError
          ? e.details?.[0]
            ? `${e.details[0].field}: ${e.details[0].message}`
            : e.message
          : "Cannot reach the server. Is the backend running?",
      );
      if (e instanceof ApiError && e.status === 409) setTime("");
    } finally {
      setBusy(false);
    }
  }
  if (done && doc)
    return (
      <div className="card mx-auto max-w-xl p-8 text-center">
        <div className="flex justify-center">
          <SuccessCheck size={88} />
        </div>
        <h2 className="h2 mt-4">{t("b.done")}</h2>
        <p className="mt-2 text-slate-600">{t("b.doneDesc")}</p>
        <div className="mt-5 rounded-2xl bg-brand-pale p-4 text-left text-sm">
          <p>
            <b>{doc.name}</b> · {tr(specialtyOf(doc))}
          </p>
          <p>
            {date} · {time} ·{" "}
            {type === "VIDEO" ? t("b.videoCall") : t("b.inPerson")}
          </p>
          <p className="mt-1">
            {t("b.token")}: <b className="font-mono">{done}</b>
          </p>
        </div>
        <div className="mt-6 flex justify-center gap-3">
          <button
            className="btn-outline"
            onClick={() => {
              setDone(null);
              setStep(0);
              setTime("");
              setDocId("");
              setDept("");
            }}
          >
            {t("b.another")}
          </button>
          <Link href="/health-card" className="btn-primary">
            {t("nav.card")}
          </Link>
        </div>
      </div>
    );

  return (
    <div className="card mx-auto max-w-4xl p-5 md:p-8">
      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Steps">
        {steps.map((k, i) => (
          <li key={k}>
            <div
              className={`h-1.5 rounded-full transition ${i <= step ? "bg-brand" : "bg-brand-sky"}`}
            />
            <p
              className={`mt-1.5 text-center text-[11px] font-bold sm:text-xs ${i === step ? "text-brand" : "text-slate-400"}`}
            >
              {t(k)}
            </p>
          </li>
        ))}
      </ol>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {departments.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setDept(d.id);
                    setDocId("");
                  }}
                  className={`card flex flex-col items-center gap-2 p-4 text-center transition ${dept === d.id ? "border-brand bg-brand-pale ring-2 ring-brand" : "card-hover"}`}
                >
                  <Icon name={d.icon} className="text-brand" size={28} />
                  <span className="text-sm font-bold text-brand-dark">
                    {tr(d.name)}
                  </span>
                </button>
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {docs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDocId(d.id)}
                  className={`card flex items-center gap-3 p-4 text-left transition ${docId === d.id ? "border-brand bg-brand-pale ring-2 ring-brand" : "card-hover"}`}
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand font-black text-white">
                    {d.initials}
                  </span>
                  <span>
                    <b className="block text-brand-dark">{d.name}</b>
                    <span className="text-sm text-brand">
                      {tr(specialtyOf(d))}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {tr(branches.find((b) => b.id === d.branch)!.name)} ·{" "}
                      {money(d.fee)}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
          {step === 2 && doc && (
            <div className="grid gap-6 md:grid-cols-[1fr_1.4fr]">
              <div className="card p-4">
                <p className="font-extrabold text-brand-dark">{doc.name}</p>
                <p className="text-sm text-brand">{tr(specialtyOf(doc))}</p>
                <p className="mt-2 text-sm text-slate-600">
                  {t("c.fee")}: <b>{money(doc.fee)}</b>
                </p>
                <p className="text-xs text-slate-500">{doc.days}</p>
                <p className="label mt-4">{t("b.type")}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setType("IN_PERSON")}
                    className={`chip ${type === "IN_PERSON" ? "bg-brand text-white" : ""}`}
                  >
                    {t("b.inPerson")}
                  </button>
                  {doc.video && (
                    <button
                      onClick={() => setType("VIDEO")}
                      className={`chip ${type === "VIDEO" ? "bg-brand text-white" : ""}`}
                    >
                      <Video size={12} /> {t("b.videoCall")}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="label">{t("b.selectDate")}</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {days.map((d) => (
                    <button
                      key={key(d)}
                      onClick={() => {
                        setDate(key(d));
                        setTime("");
                      }}
                      className={`shrink-0 rounded-xl border px-3 py-2 text-center text-xs font-bold transition ${date === key(d) ? "border-brand bg-brand text-white" : "border-brand-sky bg-white hover:border-brand"}`}
                    >
                      {fmt.format(d)}
                    </button>
                  ))}
                </div>
                <p className="label mt-4">
                  {t("b.slots")}{" "}
                  {free[0] && (
                    <span className="ml-2 font-normal text-slate-500">
                      · {t("b.suggest")}:{" "}
                      <b className="text-brand">{free[0]}</b>
                    </span>
                  )}
                </p>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {loadingSlots && (
                    <p className="col-span-full text-xs text-slate-500">...</p>
                  )}
                  {!loadingSlots && slots.length === 0 && (
                    <p className="col-span-full text-xs text-slate-500">
                      No slots on this day. Try another date.
                    </p>
                  )}
                  {slots.map(({ time: s, available }) => {
                    const b = !available;
                    return (
                      <button
                        key={s}
                        disabled={b}
                        onClick={() => setTime(s)}
                        aria-pressed={time === s}
                        className={`rounded-xl border py-2 text-sm font-bold transition ${b ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 line-through" : time === s ? "border-brand bg-brand text-white" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-brand"}`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {!time && (
                  <p className="mt-3 text-xs text-slate-500">
                    {t("b.pickSlot")}
                  </p>
                )}
              </div>
            </div>
          )}
          {step === 3 && doc && (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <label className="label" htmlFor="bn">
                    {t("c.name")} *
                  </label>
                  <input
                    id="bn"
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="bp">
                    {t("c.phone")} *
                  </label>
                  <input
                    id="bp"
                    type="tel"
                    className="input"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label" htmlFor="br">
                    {t("c.reason")}
                  </label>
                  <textarea
                    id="br"
                    rows={3}
                    className="input"
                    value={form.reason}
                    onChange={(e) =>
                      setForm({ ...form, reason: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="rounded-2xl bg-brand-pale p-5 text-sm">
                <p className="font-extrabold text-brand-dark">{doc.name}</p>
                <p>{tr(specialtyOf(doc))}</p>
                <p className="mt-2">
                  {date} · <b>{time}</b>
                </p>
                <p>{type === "VIDEO" ? t("b.videoCall") : t("b.inPerson")}</p>
                <p className="mt-3 text-lg font-black text-brand">
                  {money(doc.fee)}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {bookErr && (
        <p role="alert" className="mt-4 text-sm font-semibold text-alert">
          {bookErr}
        </p>
      )}
      <div className="mt-6 flex justify-between">
        <button
          className="btn-outline"
          disabled={step === 0}
          onClick={() => setStep(step - 1)}
        >
          {t("c.back")}
        </button>
        {step < 3 ? (
          <button
            className="btn-primary"
            disabled={!canNext}
            onClick={() => setStep(step + 1)}
          >
            {t("c.next")}
          </button>
        ) : (
          <button
            className="btn-primary"
            disabled={!canNext || busy}
            onClick={confirm}
          >
            <Check size={16} /> {t("b.confirmBtn")}
          </button>
        )}
      </div>
    </div>
  );
}
export default function Appointments() {
  const { t } = useLang();
  return (
    <>
      <PageHero title={t("b.title")} desc={t("b.sub")} icon="calendar" />
      <section className="wrap section">
        <Suspense
          fallback={<div className="skeleton mx-auto h-72 max-w-4xl" />}
        >
          <Wizard />
        </Suspense>
      </section>
    </>
  );
}
