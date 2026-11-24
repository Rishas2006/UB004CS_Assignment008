"use client";
import Link from "next/link";
import { useState } from "react";
import { CalendarCheck, MessageCircle, Phone, Siren } from "lucide-react";
import AIChat, { ChatButton } from "./AIChat";
import { useLang } from "../lib/i18n/provider";
import { HOTLINE, WHATSAPP } from "../lib/data";

export default function FloatingActions() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  return (
    <>
      <AIChat open={open} onClose={() => setOpen(false)} />
      <div className="no-print fixed bottom-20 right-4 z-40 flex flex-col items-center gap-3 lg:bottom-5">
        <a
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello RH Hospital, I need help.")}`}
          target="_blank"
          rel="noreferrer"
          aria-label={t("chat.whatsapp")}
          className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-white shadow-lift transition hover:scale-110"
        >
          <MessageCircle />
        </a>
        <ChatButton open={open} onClick={() => setOpen(!open)} />
      </div>
      {/* sticky mobile action bar */}
      <div className="no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-brand-sky bg-white/95 backdrop-blur lg:hidden">
        <Link
          href="/appointments"
          className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold text-brand"
        >
          <CalendarCheck size={20} />
          {t("c.bookNow")}
        </Link>
        <a
          href={`tel:${HOTLINE}`}
          className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold text-brand"
        >
          <Phone size={20} />
          {t("c.call")}
        </a>
        <Link
          href="/emergency"
          className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold text-alert"
        >
          <Siren size={20} />
          {t("nav.emergency")}
        </Link>
      </div>
    </>
  );
}

export function AnnouncementBar() {
  return (
    <div className="bg-blue-600 text-white text-center text-sm py-2 px-4">
      24/7 Emergency Care - Hotline: 011-2345678
    </div>
  );
}
