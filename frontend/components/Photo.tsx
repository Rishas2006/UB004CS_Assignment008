"use client";
import Image from "next/image";
import Icon, { type IconName } from "./Icon";
import { useLang } from "../lib/i18n/provider";
import type { L } from "../lib/i18n/dict";

/** Card cover: photo when available, otherwise a blue gradient with the department icon. */
export function Cover({
  src,
  alt,
  icon = "hospital",
  className = "h-40",
  sizes = "(max-width: 768px) 100vw, 33vw",
}: {
  src?: string;
  alt: string;
  icon?: IconName;
  className?: string;
  sizes?: string;
}) {
  if (!src)
    return (
      <div className={`grid w-full place-items-center bg-gradient-to-br from-brand-sky to-brand-pale text-brand ${className}`}>
        <Icon name={icon} size={44} />
      </div>
    );
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover transition duration-500 group-hover:scale-105" />
    </div>
  );
}

/** Wide rounded photo with a soft blue caption bar. */
export function PhotoBand({ src, alt, caption, className = "h-56 md:h-80", priority = false }: { src: string; alt: string; caption?: L; className?: string; priority?: boolean }) {
  const { tr } = useLang();
  return (
    <section className="wrap pt-8">
      <div className={`relative overflow-hidden rounded-3xl shadow-lift ${className}`}>
        <Image src={src} alt={alt} fill priority={priority} sizes="(max-width: 1200px) 100vw, 1200px" className="object-cover" />
        {caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark/85 to-transparent p-5 pt-14 text-sm font-bold text-white md:text-base">
            {tr(caption)}
          </div>
        )}
      </div>
    </section>
  );
}

/** Responsive grid of captioned photos. */
export function PhotoGrid({ items, cols = "md:grid-cols-3" }: { items: { src: string; alt: string; caption: L }[]; cols?: string }) {
  const { tr } = useLang();
  return (
    <section className="wrap pt-8">
      <div className={`grid gap-4 sm:grid-cols-2 ${cols}`}>
        {items.map((it) => (
          <figure key={it.src} className="group relative h-56 overflow-hidden rounded-2xl shadow-soft">
            <Image src={it.src} alt={it.alt} fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover transition duration-500 group-hover:scale-105" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-dark/85 to-transparent p-3 pt-10 text-sm font-bold text-white">{tr(it.caption)}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
