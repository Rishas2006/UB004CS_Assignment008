"use client";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { useLive } from "../../../lib/live";

export default function Gallery() {
  const { gallery } = useLive();
  const t = (key: string) => key;
  const [sel, setSel] = useState<number | null>(null);
  return (
    <>
      <PageHero title={t("RH Gallery")} icon="image" />
      <section className="wrap section">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map(([cap, src]: [string, string], i) => (
            <motion.button
              key={src}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSel(i)}
              className="card overflow-hidden text-left"
            >
              <Image
                src={src}
                alt={cap}
                width={800}
                height={600}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <p className="p-3 text-sm font-bold text-brand-dark">{cap}</p>
            </motion.button>
          ))}
        </div>
      </section>
      <AnimatePresence>
        {sel !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4"
            onClick={() => setSel(null)}
            role="dialog"
            aria-modal
          >
            <button
              aria-label={t("c.close")}
              className="absolute right-4 top-4 rounded-full bg-white p-2"
            >
              <X />
            </button>
            <Image
              src={gallery[sel][1]}
              alt={gallery[sel][0]}
              width={1400}
              height={1000}
              className="max-h-[85vh] w-auto rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
