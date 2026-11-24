"use client";
import Link from "next/link";
import { useLive } from "../../../lib/live";

export default function News() {
  const { news } = useLive();
  const t = (key: string) => (key === "nav.news" ? "News" : "Latest news");
  const tr = (value: string | { en: string }) =>
    typeof value === "string" ? value : value.en;

  return (
    <>
      <header className="section bg-slate-50">
        <div className="wrap">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-primary">
            News
          </p>
          <h1 className="mt-2 text-4xl font-black text-brand-dark">
            {t("nav.news")}
          </h1>
          <p className="mt-3 max-w-2xl text-slate-600">{t("sec.news")}</p>
        </div>
      </header>

      <section className="wrap section">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {news.map((n) => (
            <Link
              key={n.slug}
              href={`/news/${n.slug}`}
              className="card card-hover block h-full p-6"
            >
              <p className="chip">{tr(n.cat)}</p>
              <h2 className="mt-3 text-lg font-extrabold text-brand-dark">
                {tr(n.title)}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                {n.body.en}
              </p>
              <p className="mt-3 text-xs text-slate-500">{n.date}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
