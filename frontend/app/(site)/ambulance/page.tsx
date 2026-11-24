"use client";
import { useEffect, useState } from "react";
import { api, post, ApiError } from "../../../lib/api";
import { Navigation } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { useLang } from "../../../lib/i18n/provider";
import { l } from "../../../lib/i18n/dict";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

const steps = [
  l("Requested", "ඉල්ලා ඇත", "கோரப்பட்டது"),
  l("Dispatched", "යවා ඇත", "அனுப்பப்பட்டது"),
  l("Arrived", "පැමිණ ඇත", "வந்தடைந்தது"),
  l("Transporting", "රැගෙන යමින්", "கொண்டு செல்கிறது"),
  l("Completed", "අවසන්", "முடிந்தது"),
];

export default function Ambulance() {
  const { t, tr } = useLang();
  const [ref, setRef] = useState<string | null>(null);
  const [track, setTrack] = useState<{ status: string; etaMinutes: number | null; plate: string | null } | null>(null);
  const [form, setForm] = useState({ callerName: "", phone: "", address: "", notes: "" });
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  // remember the request on this phone so the tracking survives a page refresh
  useEffect(() => {
    const saved = localStorage.getItem("rh-amb-ref");
    if (saved) setRef(saved);
  }, []);
  // live tracking: ask the backend every 5 seconds
  useEffect(() => {
    if (!ref) return;
    let alive = true;
    const poll = () =>
      api<{ status: string; etaMinutes: number | null; plate: string | null }>(`/ambulance/track/${ref}`)
        .then((x) => alive && setTrack(x))
        .catch(() => {});
    poll();
    const i = setInterval(poll, 5000);
    return () => {
      alive = false;
      clearInterval(i);
    };
  }, [ref]);
  const stepOf: Record<string, number> = { REQUESTED: 0, DISPATCHED: 1, ON_SCENE: 2, TRANSPORTING: 3, ARRIVED: 4, CLOSED: 4 };
  const step = track ? (stepOf[track.status] ?? 0) : 0;
  const eta = track?.etaMinutes ?? null;
  async function request(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const r = await post<{ ref: string }>("/ambulance/requests", { ...form, notes: form.notes || undefined, ...(coords ?? {}) });
      localStorage.setItem("rh-amb-ref", r.ref);
      setRef(r.ref);
    } catch (e2) {
      setErr(e2 instanceof ApiError ? (e2.details?.[0] ? `${e2.details[0].field}: ${e2.details[0].message}` : e2.message) : "Cannot reach the server. For emergencies call 1990.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHero title={t("nav.ambulance")} desc={t("em.desc")} icon="ambulance">
        {ref && <span className="chip">{ref}</span>}
      </PageHero>
      <PhotoBand
        src={IMG.emergency}
        alt="Ambulance at the RH emergency entrance"
        caption={{
          en: "24/7 emergency unit with ambulance support",
          si: "ගිලන්රථ සහාය සහිත 24/7 හදිසි ඒකකය",
          ta: "ஆம்புலன்ஸ் ஆதரவுடன் 24/7 அவசரப் பிரிவு",
        }}
      />
      <section className="wrap section grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card overflow-hidden">
          <svg
            viewBox="0 0 600 400"
            className="w-full bg-[#EEF4FF]"
            role="img"
            aria-label="Live map"
          >
            {[80, 180, 280, 360].map((y) => (
              <rect key={y} x="0" y={y} width="600" height="14" fill="#fff" />
            ))}
            {[90, 220, 340, 470].map((x) => (
              <rect key={x} x={x} y="0" width="14" height="400" fill="#fff" />
            ))}
            <rect
              x="240"
              y="100"
              width="90"
              height="60"
              rx="8"
              fill="#CFE1FF"
            />
            <path
              id="route"
              d="M97 340 V187 H227 V110 H345 L420 60"
              fill="none"
              stroke="#1456C8"
              strokeWidth="5"
              strokeDasharray="10 8"
              strokeLinecap="round"
            />
            <circle cx="420" cy="60" r="14" fill="#1456C8" />
            <text
              x="420"
              y="40"
              textAnchor="middle"
              fontSize="13"
              fontWeight="700"
              fill="#0B2A6F"
            >
              RH Hospital
            </text>
            <circle cx="97" cy="340" r="12" fill="#DC2626" />
            <text
              x="97"
              y="372"
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill="#7f1d1d"
            >
              Patient pickup
            </text>
            <g>
              <circle r="16" fill="#fff" stroke="#DC2626" strokeWidth="4">
                <animateMotion
                  dur="14s"
                  repeatCount="indefinite"
                  path="M97 340 V187 H227 V110 H345 L420 60"
                />
              </circle>
              <text
                fontSize="11"
                fontWeight="800"
                fill="#DC2626"
                textAnchor="middle"
                dy="-24"
              >
                <animateMotion
                  dur="14s"
                  repeatCount="indefinite"
                  path="M97 340 V187 H227 V110 H345 L420 60"
                />
                {track?.plate ?? "AMB"}
              </text>
            </g>
          </svg>
        </div>
        {!ref ? (
          <form className="card space-y-3 p-6" onSubmit={request}>
            <h2 className="text-lg font-extrabold text-brand-dark">Request an ambulance</h2>
            <p className="text-xs text-slate-500">Life-threatening emergency? Call 1990 now.</p>
            {(
              [
                ["callerName", "Your name", "text"],
                ["phone", "Phone", "tel"],
                ["address", "Pickup address", "text"],
              ] as const
            ).map(([k, label, type]) => (
              <div key={k}>
                <label className="label" htmlFor={`a-${k}`}>
                  {label}
                </label>
                <input id={`a-${k}`} type={type} required className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <div>
              <label className="label" htmlFor="a-notes">
                Notes (patient condition)
              </label>
              <textarea id="a-notes" rows={2} className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <button
              type="button"
              className="btn-outline w-full"
              onClick={() => navigator.geolocation.getCurrentPosition((p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }), () => setErr("Location permission denied"))}
            >
              {coords ? "Location added ✓" : "Use my current location"}
            </button>
            {err && (
              <p role="alert" className="text-sm font-semibold text-alert">
                {err}
              </p>
            )}
            <button className="btn-primary w-full" disabled={busy}>
              {busy ? "…" : "Send request"}
            </button>
          </form>
        ) : (
          <div className="card p-6">
            <p className="flex items-center gap-2 text-sm font-bold text-brand">
              <span className="pulse-dot" /> {t("c.live")} · {ref}
            </p>
            <p className="mt-3 flex items-center gap-2 text-4xl font-black text-brand-dark">
              <Navigation className="text-brand" /> {eta != null ? `${eta} min` : "—"}
            </p>
            <ol className="mt-5 space-y-3">
              {steps.map((s, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className={`h-3.5 w-3.5 rounded-full ${i <= step ? "bg-brand" : "bg-brand-sky"}`} />
                  <span className={i <= step ? "font-bold text-brand-dark" : "text-slate-400"}>{tr(s)}</span>
                </li>
              ))}
            </ol>
            <button
              className="btn-outline mt-5 w-full"
              onClick={() => {
                localStorage.removeItem("rh-amb-ref");
                setRef(null);
                setTrack(null);
              }}
            >
              New request
            </button>
          </div>
        )}
      </section>
    </>
  );
}
