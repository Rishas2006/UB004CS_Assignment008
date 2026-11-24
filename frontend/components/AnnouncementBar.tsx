"use client";
import { useState } from "react";
import { AlertTriangle, Info, Megaphone, X } from "lucide-react";
import { useLive } from "../lib/live";
import { useLang } from "../lib/i18n/provider";

const style = {
  info: "bg-brand text-white",
  warning: "bg-amber-400 text-amber-950",
  urgent: "bg-alert text-white",
} as const;
export default function AnnouncementBar() {
  const { announcements } = useLive();
  const { tr } = useLang();
  const [hidden, setHidden] = useState<string[]>([]);
  const a = announcements.find((x) => !hidden.includes(x.id));
  if (!a) return null;
  const I =
    a.sev === "info" ? Info : a.sev === "warning" ? AlertTriangle : Megaphone;
  return (
    <div className={`${style[a.sev]} text-sm`} role="status">
      <div className="wrap flex items-center justify-between gap-3 py-2">
        <span className="flex items-center gap-2">
          <I size={16} className="shrink-0" /> {tr(a.text)}
        </span>
        <button
          aria-label="Dismiss"
          onClick={() => setHidden([...hidden, a.id])}
          className="rounded p-1 hover:bg-black/10"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
