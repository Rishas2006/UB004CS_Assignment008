"use client";
import { useEffect, useState } from "react";
import { api, post, ApiError } from "../../../lib/api";
import { motion } from "framer-motion";
import { Check, Package, Pill, Truck } from "lucide-react";
import { PhotoGrid } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

const flow = ["Pending", "Preparing", "Ready", "Out for delivery", "Delivered"];
const icons = [Pill, Package, Check, Truck, Check];

function PharmacyHero({ title }: { title: string }) {
  return (
    <section className="bg-brand-sky py-10">
      <div className="wrap flex items-center gap-3">
        <Pill size={28} className="text-brand" aria-hidden="true" />
        <h1 className="h1">{title}</h1>
      </div>
    </section>
  );
}

export default function Pharmacy() {
  const t = (key: string) =>
    ({
      "nav.pharmacy": "Pharmacy",
      "em.address": "Address",
      "c.submit": "Submit",
    })[key] ?? key;
  const tr = (value: string) => value;
  const [mode, setMode] = useState<"pickup" | "delivery">("delivery");
  const [stage, setStage] = useState<number | null>(null);
  const [orderRef, setOrderRef] = useState<string | null>(null);
  const [err, setErr] = useState("");
  // follow the real order status from the pharmacy
  useEffect(() => {
    if (!orderRef) return;
    let alive = true;
    const poll = () =>
      api<{ stage: number }>(`/pharmacy/orders/track/${orderRef}`)
        .then((r) => alive && setStage(r.stage))
        .catch(() => {});
    poll();
    const i = setInterval(poll, 8000);
    return () => {
      alive = false;
      clearInterval(i);
    };
  }, [orderRef]);
  return (
    <>
      <PharmacyHero title={t("nav.pharmacy")} />
      <PhotoGrid cols="md:grid-cols-2" items={[{ src: IMG.pharmacyShelves, alt: "Pharmacist checking stock on shelves", caption: { en: "24/7 pharmacy with batch and expiry control", si: "කාණ්ඩ සහ කල් ඉකුත්වීම් පාලනය සහිත 24/7 ඖෂධ ශාලාව", ta: "தொகுப்பு மற்றும் காலாவதிக் கட்டுப்பாட்டுடன் 24/7 மருந்தகம்" } }, { src: IMG.pharmacyDelivery, alt: "Pharmacist preparing a delivery parcel", caption: { en: "Home delivery of your prescription", si: "ඔබේ බෙහෙත් නිවසටම බෙදාහැරීම", ta: "உங்கள் மருந்துகள் வீட்டிற்கே விநியோகம்" } }]} />
      <section className="wrap section grid gap-6 lg:grid-cols-2">
        <form
          className="card space-y-4 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr("");
            const v = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value.trim() ?? "";
            try {
              const r = await post<{ ref: string }>("/pharmacy/orders", {
                prescriptionRef: v("rx"),
                mode,
                address: mode === "delivery" ? v("ad") : undefined,
              });
              setOrderRef(r.ref);
              setStage(0);
            } catch (e2) {
              setErr(e2 instanceof ApiError ? e2.message : "Cannot reach the server. Is the backend running?");
            }
          }}
        >
          <div>
            <label className="label" htmlFor="rx">
              Prescription no.
            </label>
            <input id="rx" className="input" placeholder="P-1042" required />
          </div>
          <div className="flex gap-2">
            {(["pickup", "delivery"] as const).map((m) => (
              <button
                type="button"
                key={m}
                onClick={() => setMode(m)}
                className={`chip ${mode === m ? "bg-brand text-white" : ""}`}
              >
                {m === "pickup" ? "Pickup" : "Delivery"}
              </button>
            ))}
          </div>
          {mode === "delivery" && (
            <div>
              <label className="label" htmlFor="ad">
                {t("em.address")}
              </label>
              <textarea id="ad" rows={2} className="input" required />
            </div>
          )}
          {err && (
            <p role="alert" className="text-sm font-semibold text-alert">
              {err}
            </p>
          )}
          <button className="btn-primary w-full">{t("c.submit")}</button>
        </form>
        <div className="card p-6">
          <h2 className="h2 mb-5">Status</h2>
          {orderRef && <p className="mb-4 text-sm font-bold text-brand-dark">Order {orderRef}</p>}
          <ol className="space-y-4">
            {flow.map((s, i) => {
              const I = icons[i];
              const on = stage !== null && i <= stage;
              return (
                <li key={i} className="flex items-center gap-3">
                  <motion.span
                    animate={{ scale: on ? 1 : 0.9 }}
                    className={`grid h-10 w-10 place-items-center rounded-full ${on ? "bg-brand text-white" : "bg-brand-sky text-slate-400"}`}
                  >
                    <I size={18} />
                  </motion.span>
                  <span
                    className={`font-bold ${on ? "text-brand-dark" : "text-slate-400"}`}
                  >
                    {tr(s)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </>
  );
}
