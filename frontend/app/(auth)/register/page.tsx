"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { useLang } from "../../../lib/i18n/provider";
import { post, ApiError } from "../../../lib/api";

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}
export default function Register() {
  const { t } = useLang();
  const router = useRouter();
  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    pw: "",
    pw2: "",
  });
  const [err, setErr] = useState("");
  const s = strength(f.pw);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.value });
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || !f.email.includes("@") || !f.phone.trim())
      return setErr(t("c.required"));
    if (s < 3) return setErr(t("a.pwRule"));
    if (f.pw !== f.pw2) return setErr(t("a.pwMismatch"));
    setErr("");
    setBusy(true);
    try {
      await post("/auth/register", {
        name: f.name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
        password: f.pw,
      });
      router.push(`/verify-otp?email=${encodeURIComponent(f.email.trim())}`);
    } catch (e2) {
      setErr(
        e2 instanceof ApiError
          ? e2.details?.[0]
            ? `${e2.details[0].field}: ${e2.details[0].message}`
            : e2.message
          : "Cannot reach the server. Is the backend running?",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="h1 text-3xl md:text-4xl">{t("a.createTitle")}</h1>
      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="rn">
            {t("c.name")}
          </label>
          <input
            id="rn"
            className="input"
            value={f.name}
            onChange={set("name")}
            autoComplete="name"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="re">
              {t("c.email")}
            </label>
            <input
              id="re"
              type="email"
              className="input"
              value={f.email}
              onChange={set("email")}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="rp">
              {t("c.phone")}
            </label>
            <input
              id="rp"
              type="tel"
              className="input"
              value={f.phone}
              onChange={set("phone")}
              autoComplete="tel"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="rw">
            {t("a.password")}
          </label>
          <input
            id="rw"
            type="password"
            className="input"
            value={f.pw}
            onChange={set("pw")}
            autoComplete="new-password"
          />
          <div className="mt-2 flex items-center gap-2" aria-live="polite">
            <div className="flex flex-1 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition ${i < s ? (s < 3 ? "bg-amber-400" : "bg-emerald-500") : "bg-brand-sky"}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500">
              {f.pw
                ? s < 2
                  ? t("a.pwWeak")
                  : s < 4
                    ? t("a.pwOk")
                    : t("a.pwStrong")
                : ""}
            </span>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="rw2">
            {t("a.confirmPw")}
          </label>
          <input
            id="rw2"
            type="password"
            className="input"
            value={f.pw2}
            onChange={set("pw2")}
            autoComplete="new-password"
          />
        </div>
        {err && (
          <p role="alert" className="text-sm font-semibold text-alert">
            {err}
          </p>
        )}
        <button className="btn-primary w-full" disabled={busy}>
          {t("nav.register")}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        {t("a.haveAccount")}{" "}
        <Link href="/login" className="font-bold text-brand">
          {t("nav.login")}
        </Link>
      </p>
    </motion.div>
  );
}
