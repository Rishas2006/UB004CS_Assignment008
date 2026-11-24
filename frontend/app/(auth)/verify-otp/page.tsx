"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLang } from "../../../lib/i18n/provider";
import { post, setToken, ApiError } from "../../../lib/api";

export default function VerifyOtp() {
  const { t } = useLang();
  const router = useRouter();
  const [d, setD] = useState<string[]>(Array(6).fill(""));
  const [left, setLeft] = useState(300);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const getEmail = () =>
    new URLSearchParams(window.location.search).get("email") || "";
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    const i = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(i);
  }, []);
  function change(i: number, v: string) {
    const c = v.replace(/\D/g, "").slice(-1);
    const n = [...d];
    n[i] = c;
    setD(n);
    if (c && i < 5) refs.current[i + 1]?.focus();
  }
  function paste(e: React.ClipboardEvent) {
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (p) {
      setD(
        p
          .padEnd(6, " ")
          .split("")
          .map((x) => x.trim()),
      );
      e.preventDefault();
    }
  }
  async function verify() {
    setErr("");
    try {
      const r = await post<{ accessToken: string }>("/auth/verify-otp", {
        email: getEmail(),
        code: d.join(""),
      });
      setToken(r.accessToken);
      setOk(true);
      setTimeout(() => router.push("/portal/patient"), 1400);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Cannot reach the server.");
    }
  }
  async function resend() {
    setErr("");
    try {
      await post("/auth/resend-otp", { email: getEmail() });
      setLeft(600);
      setD(Array(6).fill(""));
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Cannot reach the server.");
    }
  }
  const code = d.join("");
  return (
    <div className="text-center">
      {ok ? (
        <div className="flex flex-col items-center gap-4 py-10">
          <svg
            aria-hidden="true"
            viewBox="0 0 96 96"
            className="h-24 w-24 text-green-600"
          >
            <circle
              cx="48"
              cy="48"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
            />
            <path
              d="m27 49 14 14 29-31"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="font-bold text-brand-dark">{t("a.verified")}</p>
        </div>
      ) : (
        <>
          <h1 className="h1 text-3xl">{t("a.otpTitle")}</h1>
          <p className="mt-2 text-slate-600">{t("a.otpDesc")}</p>
          <div className="mt-6 flex justify-center gap-2" onPaste={paste}>
            {d.map((v, i) => (
              <input
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                value={v}
                onChange={(e) => change(i, e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Backspace" &&
                  !d[i] &&
                  i > 0 &&
                  refs.current[i - 1]?.focus()
                }
                inputMode="numeric"
                maxLength={1}
                aria-label={`Digit ${i + 1}`}
                className="h-14 w-11 rounded-xl border-2 border-brand-sky bg-brand-ice text-center text-2xl font-black outline-none focus:border-brand sm:w-12"
              />
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">
            {t("a.expiresIn")}{" "}
            <b className="text-brand">
              {String(Math.floor(left / 60)).padStart(2, "0")}:
              {String(left % 60).padStart(2, "0")}
            </b>
          </p>
          {err && (
            <p role="alert" className="mt-3 text-sm font-semibold text-alert">
              {err}
            </p>
          )}
          <button
            onClick={verify}
            disabled={code.length < 6 || left === 0}
            className="btn-primary mt-6 w-full"
          >
            {t("a.verify")}
          </button>
          <button
            onClick={resend}
            className="mt-3 text-sm font-bold text-brand"
          >
            {t("a.resend")}
          </button>
        </>
      )}
    </div>
  );
}
