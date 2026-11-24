"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Lock, Mail } from "lucide-react";
import { useLang } from "../../../lib/i18n/provider";
import type { Key } from "../../../lib/i18n/dict";
import { post, setToken, ApiError } from "../../../lib/api";

const tabs: [Key, string][] = [
  ["a.patient", "patient"],
  ["a.doctor", "doctor"],
  ["a.staff", "reception"],
  ["a.admin", "super-admin"],
];
export default function Login() {
  const { t } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email")).trim();
    const password = String(f.get("password"));
    if (!email || password.length < 4) return setErr(t("c.required"));
    setErr("");
    setBusy(true);
    try {
      const r = await post<{ accessToken: string; user: { role: string } }>(
        "/auth/login",
        { email, password },
      );
      setToken(r.accessToken);
      router.push(`/portal/${r.user.role}`);
    } catch (e2) {
      setErr(
        e2 instanceof ApiError
          ? e2.message
          : "Cannot reach the server. Is the backend running?",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="h1 text-3xl md:text-4xl">{t("a.welcome")}</h1>
      <p className="mt-2 text-slate-600">{t("a.signInSub")}</p>
      <div
        role="tablist"
        className="mt-6 grid grid-cols-4 rounded-xl bg-brand-pale p-1"
      >
        {tabs.map(([k], i) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={`rounded-lg py-2 text-xs font-bold transition ${tab === i ? "bg-white text-brand shadow-soft" : "text-slate-600"}`}
          >
            {t(k)}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        <div>
          <label className="label" htmlFor="email">
            {t("c.email")}
          </label>
          <div className="relative">
            <Mail
              size={16}
              className="absolute left-3 top-3.5 text-slate-400"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="input pl-10"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="pw">
            {t("a.password")}
          </label>
          <div className="relative">
            <Lock
              size={16}
              className="absolute left-3 top-3.5 text-slate-400"
            />
            <input
              id="pw"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              className="input px-10"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              aria-label="Toggle password"
              className="absolute right-3 top-3 text-slate-500"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="accent-brand" /> {t("a.remember")}
          </label>
          <Link href="/verify-otp" className="font-bold text-brand">
            {t("a.forgot")}
          </Link>
        </div>
        {err && (
          <p role="alert" className="text-sm font-semibold text-alert">
            {err}
          </p>
        )}
        <button className="btn-primary w-full" disabled={busy}>
          <LogIn size={16} /> {t("a.signIn")}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-slate-600">
        {t("a.noAccount")}{" "}
        <Link href="/register" className="font-bold text-brand">
          {t("nav.register")}
        </Link>
      </p>
    </motion.div>
  );
}
