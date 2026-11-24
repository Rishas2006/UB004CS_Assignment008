"use client";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from "lucide-react";
import Logo from "./Logo";
import { LangSwitch } from "./Header";
import { useLang } from "../lib/i18n/provider";
import { HOTLINE, HOTLINE_LABEL, WHATSAPP } from "../lib/data";

export default function Footer() {
  const { t } = useLang();
  const quick = [
    ["nav.findDoctor", "/doctors"],
    ["nav.departments", "/departments"],
    ["nav.packages", "/health-packages"],
    ["nav.news", "/news"],
    ["nav.careers", "/careers"],
    ["nav.contact", "/contact"],
  ] as const;
  const social = [
    [Facebook, "Facebook"],
    [Instagram, "Instagram"],
    [Youtube, "YouTube"],
    [Linkedin, "LinkedIn"],
  ] as const;
  return (
    <footer className="mt-10 bg-brand-dark text-sky-100">
      <div className="wrap grid gap-8 py-12 md:grid-cols-4">
        <div className="space-y-3">
          <Logo light tagline={t("brand.tagline")} />
          <p className="text-sm text-sky-200">{t("f.about")}</p>
          <LangSwitch dark />
        </div>
        <div>
          <p className="mb-3 font-bold text-white">{t("f.quick")}</p>
          <ul className="space-y-2 text-sm">
            {quick.map(([k, h]) => (
              <li key={h}>
                <Link href={h} className="hover:text-white">
                  {t(k)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-2 text-sm">
          <p className="mb-3 font-bold text-white">{t("f.contact")}</p>
          <a
            href={`tel:${HOTLINE}`}
            className="flex items-center gap-2 hover:text-white"
          >
            <Phone size={15} /> {HOTLINE_LABEL}
          </a>
          <a
            href={`https://wa.me/${WHATSAPP}`}
            className="flex items-center gap-2 hover:text-white"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
          <p className="flex items-start gap-2">
            <MapPin size={15} className="mt-0.5 shrink-0" /> 123 Health Care
            Avenue, Colombo 01
          </p>
        </div>
        <div>
          <p className="mb-3 font-bold text-white">{t("f.follow")}</p>
          <div className="flex gap-2">
            {social.map(([I, n]) => (
              <a
                key={n}
                href="#"
                aria-label={n}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:-translate-y-1 hover:bg-white hover:text-brand"
              >
                <I size={18} />
              </a>
            ))}
          </div>
          <p className="mt-4 text-xs text-sky-300">{t("f.branchesNote")}</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-wrap items-center justify-between gap-2 py-4 text-xs text-sky-300">
          <span>© 2026 RH Hospital. {t("f.rights")}</span>
          <span className="flex gap-4">
            <Link href="/policies" className="hover:text-white">
              {t("f.privacy")}
            </Link>
            <Link href="/policies" className="hover:text-white">
              {t("f.terms")}
            </Link>
            <Link href="/policies" className="hover:text-white">
              {t("f.access")}
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
