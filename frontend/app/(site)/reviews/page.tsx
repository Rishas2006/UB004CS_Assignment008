"use client";
import { useState } from "react";
import { post, ApiError } from "../../../lib/api";
import { CheckCircle2, Star } from "lucide-react";
import { useLang } from "../../../lib/i18n/provider";
import { useLive } from "../../../lib/live";

function SuccessCheck() {
  return (
    <CheckCircle2 size={40} className="text-emerald-500" aria-hidden="true" />
  );
}

const val = (id: string) =>
  (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() ?? "";
const fail = (e: unknown) =>
  alert(e instanceof ApiError ? (e.details?.[0] ? `${e.details[0].field}: ${e.details[0].message}` : e.message) : "Cannot reach the server. Is the backend running?");

export default function Reviews() {
  const { reviews } = useLive();
  const { t, tr } = useLang();
  const [r, setR] = useState(0);
  const [done, setDone] = useState(false);
  const avg = reviews.length
    ? (reviews.reduce((a, x) => a + x.rating, 0) / reviews.length).toFixed(1)
    : "–";
  return (
    <>
      <header className="wrap section pb-0">
        <div className="card flex items-center gap-4 p-6">
          <Star
            size={28}
            className="fill-amber-400 text-amber-400"
            aria-hidden="true"
          />
          <div>
            <h1 className="text-3xl font-extrabold text-brand-dark">
              {t("rev.title")}
            </h1>
            <p className="mt-1 text-slate-600">★ {avg} / 5</p>
          </div>
        </div>
      </header>
      <section className="wrap section grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {reviews.map((x) => (
            <div key={x.name} className="card p-5">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={
                      i < x.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }
                  />
                ))}
              </div>
              <p className="mt-2 text-sm">“{tr(x.text)}”</p>
              <p className="mt-1 text-xs font-bold text-brand-dark">{x.name}</p>
            </div>
          ))}
        </div>
        <div className="card h-fit p-6">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <SuccessCheck />
              <p className="font-semibold">{t("rev.thanks")}</p>
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!r) return;
                try {
                  await post("/reviews", { author: val("rn") || "Anonymous", rating: r, text: val("rm") || "Great care." });
                  setDone(true);
                } catch (err) {
                  fail(err);
                }
              }}
            >
              <h2 className="text-lg font-extrabold text-brand-dark">
                {t("rev.write")}
              </h2>
              <div
                role="radiogroup"
                aria-label={t("rev.stars")}
                className="flex gap-1"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    key={n}
                    role="radio"
                    aria-checked={r === n}
                    aria-label={`${n}`}
                    onClick={() => setR(n)}
                  >
                    <Star
                      size={30}
                      className={`transition ${n <= r ? "fill-amber-400 text-amber-400 scale-110" : "text-slate-300"}`}
                    />
                  </button>
                ))}
              </div>
              <div>
                <label className="label" htmlFor="rn">
                  {t("c.name")}
                </label>
                <input id="rn" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="rm">
                  {t("c.message")}
                </label>
                <textarea id="rm" rows={3} className="input" />
              </div>
              <button className="btn-primary w-full" disabled={!r}>
                {t("c.submit")}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
