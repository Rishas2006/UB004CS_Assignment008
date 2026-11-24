"use client";
import { useState } from "react";
import { post, ApiError } from "../../../lib/api";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { SuccessCheck } from "../../../components/Motion";
import { useLang } from "../../../lib/i18n/provider";
import {
  branches as staticBranches,
  HOTLINE,
  HOTLINE_LABEL,
  WHATSAPP,
} from "../../../lib/data";
import { useLive } from "../../../lib/live";

const val = (id: string) =>
  (
    document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null
  )?.value.trim() ?? "";
const fail = (e: unknown) =>
  alert(
    e instanceof ApiError
      ? e.details?.[0]
        ? `${e.details[0].field}: ${e.details[0].message}`
        : e.message
      : "Cannot reach the server. Is the backend running?",
  );

export default function Contact() {
  const { branches } = useLive();
  const { t, tr } = useLang();
  const [sent, setSent] = useState(false);
  const b = branches[0] ?? staticBranches[0];

  // FIX: lat/lng illana Colombo default - Map Grey aagaadhu
  const lat = (b as any).lat ?? 6.9271;
  const lng = (b as any).lng ?? 79.8612;

  return (
    <>
      <PageHero
        title={t("nav.contact")}
        desc={t("brand.slogan")}
        icon="phone"
      />
      <section className="wrap section grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <a
            href={`tel:${HOTLINE}`}
            className="card card-hover flex items-center gap-4 p-5"
          >
            <Phone className="text-brand" />
            <div>
              <p className="text-xs font-bold text-slate-500">
                {t("top.hotline")}
              </p>
              <p className="text-xl font-black text-brand-dark">
                {HOTLINE_LABEL}
              </p>
            </div>
          </a>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello RH Hospital")}`}
            target="_blank"
            rel="noreferrer"
            className="card card-hover flex items-center gap-4 p-5"
          >
            <MessageCircle className="text-emerald-500" />
            <p className="font-extrabold text-brand-dark">WhatsApp</p>
          </a>
          <div className="card flex items-start gap-4 p-5">
            <Mail className="mt-1 text-brand" />
            <p className="font-semibold text-brand-dark">
              info@rhhospital.example.com
            </p>
          </div>
          <div className="card overflow-hidden">
            <div className="flex items-start gap-3 p-4">
              <MapPin className="mt-0.5 text-brand" />
              <p className="text-sm">
                <b>{tr(b.name)}</b>
                <br />
                {b.address}
              </p>
            </div>
            {/* FIX: OpenStreetMap -> Google Maps (API Key thevai illa) */}
            <iframe
              title="Map"
              className="h-56 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
              target="_blank"
              rel="noreferrer"
              className="block p-3 text-center text-sm font-bold text-brand hover:underline"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
        <div className="card h-fit p-6">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <SuccessCheck />
              <p className="font-semibold">{t("c.sentOk")}</p>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await post("/contact", {
                    name: val("n"),
                    email: val("e"),
                    phone: val("p"),
                    message: val("m"),
                  });
                  setSent(true);
                } catch (err) {
                  fail(err);
                }
              }}
            >
              <div>
                <label className="label" htmlFor="n">
                  {t("c.name")}
                </label>
                <input id="n" required className="input" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="e">
                    {t("c.email")}
                  </label>
                  <input id="e" type="email" required className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="p">
                    {t("c.phone")}
                  </label>
                  <input id="p" type="tel" className="input" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="m">
                  {t("c.message")}
                </label>
                <textarea id="m" rows={5} required className="input" />
              </div>
              <button className="btn-primary w-full">{t("c.send")}</button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
