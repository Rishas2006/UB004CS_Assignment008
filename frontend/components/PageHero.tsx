"use client";
import { motion } from "framer-motion";
import Icon, { type IconName } from "./Icon";

export default function PageHero({
  title,
  desc,
  icon = "hospital",
  children,
}: {
  title: string;
  desc?: string;
  icon?: IconName;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-pale via-white to-brand-sky">
      <svg
        className="pointer-events-none absolute -right-10 top-4 hidden h-40 w-[520px] text-brand/15 md:block"
        viewBox="0 0 520 100"
        fill="none"
        aria-hidden
      >
        <path
          className="ecg animate-draw"
          d="M0 55h120l20-34 28 70 24-52 14 16h314"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="wrap relative py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start gap-4"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-lift">
            <Icon name={icon} size={28} />
          </span>
          <div>
            <h1 className="h1">{title}</h1>
            {desc && <p className="mt-3 max-w-2xl text-slate-600">{desc}</p>}
            {children && <div className="mt-5">{children}</div>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
