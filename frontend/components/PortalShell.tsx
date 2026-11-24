"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, Menu, Search, X } from "lucide-react";
import Logo from "./Logo";
import Icon from "./Icon";
import { LangSwitch } from "./Header";
import { useLang } from "../lib/i18n/provider";
import { roles } from "../lib/data";

function Nav({ onPick }: { onPick?: () => void }) {
  const { t, tr } = useLang();
  const path = usePathname();
  return (
    <nav className="space-y-1" aria-label={t("p.switch")}>
      <p className="mb-2 px-3 text-[11px] font-bold text-sky-300">
        {t("p.switch")}
      </p>
      {roles.map((r) => {
        const on = path === `/portal/${r.slug}`;
        return (
          <Link
            key={r.slug}
            href={`/portal/${r.slug}`}
            onClick={onPick}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${on ? "bg-white text-brand-dark shadow-soft" : "text-sky-100 hover:bg-white/10"}`}
          >
            <Icon name={r.icon} size={18} /> {tr(r.label)}
          </Link>
        );
      })}
    </nav>
  );
}

export default function PortalShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-brand-ice">
      <aside className="hidden w-64 shrink-0 flex-col gap-6 bg-brand-dark p-5 text-white md:flex">
        <Logo light />
        <Nav />
        <Link
          href="/"
          className="mt-auto flex items-center gap-2 px-3 text-sm text-sky-200 hover:text-white"
        >
          <LogOut size={16} /> {t("p.logout")}
        </Link>
      </aside>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 z-50 w-64 space-y-6 overflow-y-auto bg-brand-dark p-5 text-white md:hidden"
            >
              <Logo light />
              <Nav onPick={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-brand-sky bg-white/90 px-4 backdrop-blur md:px-6">
          <button
            className="rounded-lg p-2 hover:bg-brand-pale md:hidden"
            aria-label={t("nav.menu")}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <label className="hidden flex-1 items-center gap-2 rounded-xl bg-brand-ice px-3 py-2 sm:flex">
            <Search size={16} className="text-slate-400" />
            <span className="sr-only">{t("c.search")}</span>
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder={t("p.search")}
            />
          </label>
          <div className="ml-auto flex items-center gap-3">
            <LangSwitch />
            <button
              aria-label="Notifications"
              className="relative rounded-lg p-2 hover:bg-brand-pale"
            >
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-alert" />
            </button>
            <span className="hidden items-center gap-2 text-sm font-bold sm:flex">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white">
                RH
              </span>
              {t("p.workspace")}
            </span>
          </div>
        </header>
        <div className="mx-auto max-w-7xl p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
