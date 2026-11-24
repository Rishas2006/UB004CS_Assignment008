import Link from "next/link";

export function LogoMark({
  size = 44,
  animate = false,
}: {
  size?: number;
  animate?: boolean;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <rect width="64" height="64" rx="16" fill="#1456C8" />
      <path d="M26 12h12v14h14v12H38v14H26V38H12V26h14z" fill="#fff" />
      <path
        className={animate ? "ecg animate-draw" : ""}
        d="M6 33h14l5-9 7 18 6-13 4 4h16"
        fill="none"
        stroke="#1456C8"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Logo({
  light = false,
  tagline,
}: {
  light?: boolean;
  tagline?: string;
}) {
  return (
    <Link
      href="/"
      className="flex items-center gap-3"
      aria-label="RH Hospital home"
    >
      <LogoMark />
      <span className="leading-none">
        <span
          className={`block text-2xl font-black tracking-tight ${light ? "text-white" : "text-brand-dark"}`}
        >
          RH
        </span>
        <span
          className={`block text-[10px] font-bold tracking-[.32em] ${light ? "text-sky-200" : "text-brand"}`}
        >
          HOSPITAL
        </span>
        {tagline && (
          <span
            className={`mt-1 block text-[10px] italic ${light ? "text-sky-200" : "text-slate-500"}`}
          >
            {tagline}
          </span>
        )}
      </span>
    </Link>
  );
}
