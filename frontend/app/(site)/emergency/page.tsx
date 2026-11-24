"use client";
import { useState } from "react";
import { post, ApiError } from "../../../lib/api";
import { Phone } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { SuccessCheck, Reveal } from "../../../components/Motion";
import { useLang } from "../../../lib/i18n/provider";
import { useLive } from "../../../lib/live";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

export default function Emergency() {
  const { emergencyContacts } = useLive();
  const { t } = useLang();
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(false);
  const [apiErr, setApiErr] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!String(f.get("phone")).trim() || !String(f.get("address")).trim())
      return setErr(true);
    setErr(false);
    setApiErr("");
    try {
      const r = await post<{ ref: string }>("/ambulance/requests", {
        callerName: String(f.get("name") || "Caller").trim() || "Caller",
        phone: String(f.get("phone")).trim(),
        address: String(f.get("address")).trim(),
      });
      localStorage.setItem("rh-amb-ref", r.ref);
      setSent(true);
    } catch (e2) {
      setApiErr(e2 instanceof ApiError ? e2.message : "Cannot reach the server. Call 1990 now.");
    }
  }
  return (
    <>
      <PageHero title={t("em.title")} desc={t("em.desc")} icon="siren" />
      <PhotoBand src={IMG.emergency} alt="Ambulance at the RH emergency entrance" caption={{ en: "24/7 emergency unit with ambulance support", si: "ගිලන්රථ සහාය සහිත 24/7 හදිසි ඒකකය", ta: "ஆம்புலன்ஸ் ஆதரவுடன் 24/7 அவசரப் பிரிவு" }} />
      <section className="wrap section grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {emergencyContacts.map(([n, label, tel], i) => (
            <Reveal key={n} delay={i * 0.05}>
              <a
                href={`tel:${tel}`}
                className={`card card-hover flex items-center gap-4 p-5 ${i < 2 ? "border-alert/40 bg-red-50" : ""}`}
              >
                <span
                  className={`grid h-12 w-12 place-items-center rounded-xl text-white ${i < 2 ? "bg-alert" : "bg-brand"}`}
                >
                  <Phone size={22} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-600">
                    {i === 1 ? t("em.suwa") : i === 0 ? t("em.hotline") : n}
                  </p>
                  <p className="text-2xl font-black text-brand-dark">{label}</p>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
        <div className="card p-6">
          <h2 className="h2 mb-4">{t("em.request")}</h2>
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <SuccessCheck />
              <p className="font-semibold text-brand-dark">{t("em.sent")}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div>
                <label className="label" htmlFor="caller">
                  {t("c.name")}
                </label>
                <input id="caller" name="name" className="input" />
              </div>
              <div>
                <label className="label" htmlFor="phone">
                  {t("em.caller")} *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  inputMode="tel"
                />
              </div>
              <div>
                <label className="label" htmlFor="address">
                  {t("em.address")} *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  className="input"
                />
              </div>
              {err && (
                <p role="alert" className="text-sm font-semibold text-alert">
                  {t("c.required")}
                </p>
              )}
              {apiErr && (
                <p role="alert" className="text-sm font-semibold text-alert">
                  {apiErr}
                </p>
              )}
              <button className="btn-danger w-full">{t("em.request")}</button>
              <p className="text-xs text-slate-500">{t("em.sent")}</p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
