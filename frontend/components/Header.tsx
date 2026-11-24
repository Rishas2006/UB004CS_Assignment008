"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogIn, Menu, Phone, X } from "lucide-react";
import Logo from "./Logo";
import Icon from "./Icon";
import { useLang } from "../lib/i18n/provider";
import { useSession } from "../lib/live";
import { LANGS } from "../lib/i18n/dict";
import { mainNav, navGroups } from "../lib/nav";
import { HOTLINE, HOTLINE_LABEL } from "../lib/data";

export function LangSwitch({ dark = false }: { dark?: boolean }) {
  const { lang, setLang } = useLang();
  return (
    <div
      role="group"
      aria-label="Language"
      className={`flex overflow-hidden rounded-lg border ${dark ? "border-white/30" : "border-brand-sky"}`}
    >
      {LANGS.map((x) => (
        <button
          key={x.code}
          onClick={() => setLang(x.code)}
          aria-pressed={lang === x.code}
          title={x.native}
          className={`px-2.5 py-1 text-xs font-bold transition ${lang === x.code ? (dark ? "bg-white text-brand-dark" : "bg-brand text-white") : dark ? "text-white/80 hover:bg-white/15" : "text-brand-dark hover:bg-brand-pale"}`}
        >
          {x.short}
        </button>
      ))}
    </div>
  );
}

export default function Header() {
  const { t } = useLang();
  const { user } = useSession();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [path]);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-brand-dark text-xs text-sky-100">
        <div className="wrap flex items-center justify-between gap-3 py-1.5">
          <div className="flex items-center gap-4">
            <a
              href={`tel:${HOTLINE}`}
              className="flex items-center gap-1.5 font-semibold hover:text-white"
            >
              <Phone size={13} /> {t("top.hotline")}: {HOTLINE_LABEL}
            </a>
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className="pulse-dot" /> {t("top.emergency")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LangSwitch dark />
          </div>
        </div>
      </div>
      <div className="border-b border-brand-sky bg-white/90 backdrop-blur">
        <div className="wrap flex h-[72px] items-center justify-between gap-4">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {mainNav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-brand-pale hover:text-brand ${path === n.href ? "text-brand" : "text-slate-700"}`}
              >
                {t(n.key)}
              </Link>
            ))}
            <div className="relative" onMouseLeave={() => setMega(false)}>
              <button
                onClick={() => setMega(!mega)}
                onMouseEnter={() => setMega(true)}
                aria-expanded={mega}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-brand-pale hover:text-brand"
              >
                {t("nav.more")}{" "}
                <ChevronDown
                  size={14}
                  className={`transition ${mega ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {mega && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full z-50 w-[min(860px,92vw)] pt-2"
                  >
                    <div className="card grid grid-cols-3 gap-5 p-5">
                      {navGroups.map((g) => (
                        <div key={g.key}>
                          <p className="mb-2 text-xs font-extrabold text-brand">
                            {t(g.key)}
                          </p>
                          <ul className="space-y-0.5">
                            {g.links.map((l) => (
                              <li key={l.href}>
                                <Link
                                  href={l.href}
                                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-brand-pale hover:text-brand"
                                >
                                  <Icon
                                    name={l.icon}
                                    size={15}
                                    className="text-brand"
                                  />{" "}
                                  {t(l.key)}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href={user ? `/portal/${user.role}` : "/login"}
              className="btn-outline hidden px-3 py-2 sm:inline-flex"
            >
              <LogIn size={15} /> {user ? "My dashboard" : t("nav.login")}
            </Link>
            <Link
              href="/appointments"
              className="btn-primary px-3 py-2 sm:px-4"
            >
              {t("nav.book")}
            </Link>
            <button
              className="rounded-lg p-2 text-brand-dark hover:bg-brand-pale lg:hidden"
              aria-label={t("nav.menu")}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-h-[75vh] overflow-y-auto border-b border-brand-sky bg-white lg:hidden"
            aria-label="Mobile"
          >
            <div className="wrap space-y-4 py-4">
              <Link href={user ? `/portal/${user.role}` : "/login"} className="btn-outline w-full">
                <LogIn size={15} /> {user ? "My dashboard" : t("nav.login")}
              </Link>
              {navGroups.map((g) => (
                <div key={g.key}>
                  <p className="mb-1 text-xs font-extrabold text-brand">
                    {t(g.key)}
                  </p>
                  <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2">
                    {g.links.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-brand-pale"
                      >
                        <Icon name={l.icon} size={16} className="text-brand" />{" "}
                        {t(l.key)}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
