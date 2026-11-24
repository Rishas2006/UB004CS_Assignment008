"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLang } from "../../../../lib/i18n/provider";
import { useLive } from "../../../../lib/live";

function PageHero({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <header className="wrap section" data-icon={icon}>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-600">{desc}</p>
    </header>
  );
}

export default function Article() {
  const { news } = useLive();
  const { slug } = useParams<{ slug: string }>();
  const { t, tr } = useLang();
  const n = news.find((x) => x.slug === slug);
  if (!n)
    return (
      <div className="wrap section">
        <p>{t("c.noResults")}</p>
      </div>
    );
  return (
    <>
      <PageHero
        title={tr(n.title)}
        desc={`${n.date} · ${tr(n.cat)}`}
        icon="news"
      />
      <article className="wrap section max-w-3xl">
        <p className="text-lg leading-8 text-slate-700">{tr(n.body)}</p>
        <p className="mt-4 text-xs text-slate-500">{t("c.fallbackNote")}</p>
        <Link href="/news" className="btn-outline mt-6">
          ← {t("nav.news")}
        </Link>
      </article>
    </>
  );
}
