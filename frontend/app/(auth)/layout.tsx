"use client";
import Image from "next/image";
import { Check } from "lucide-react";
import Logo from "../../components/Logo";
import { LangSwitch } from "../../components/Header";
import { useLang } from "../../lib/i18n/provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLang();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-mid p-10 text-white lg:flex">
        <Logo light tagline={t("brand.tagline")} />
        <div>
          <Image
            src="/images/doctors-team.jpg"
            alt=""
            width={520}
            height={520}
            className="mx-auto mb-8 w-72 rounded-3xl object-cover shadow-lift"
          />
          <h2 className="text-3xl font-black">{t("brand.slogan")}</h2>
          <ul className="mt-5 space-y-2 text-sky-100">
            {(["b.sub", "qr.title", "hero.check3"] as const).map((k) => (
              <li key={k} className="flex items-center gap-2">
                <Check size={16} /> {t(k)}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-sky-200">© 2026 RH Hospital</p>
      </aside>
      <main id="main" className="flex flex-col p-6 sm:p-10">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          <LangSwitch />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
