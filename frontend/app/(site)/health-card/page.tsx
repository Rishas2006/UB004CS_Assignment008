"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Printer } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { LogoMark } from "../../../components/Logo";
import { useLang } from "../../../lib/i18n/provider";
import { api } from "../../../lib/api";
import { useSession } from "../../../lib/live";

type Mine = { name: string; mrn: string; verifyUrl: string };
type Emergency = { name: string; mrn: string; bloodGroup?: string | null; allergies?: string | null; emergencyContact?: string | null };
export default function HealthCard() {
  const { t } = useLang();
  const { authReady, user } = useSession();
  const [mine, setMine] = useState<Mine | null>(null);
  const [dob, setDob] = useState("");
  const [scan, setScan] = useState<Emergency | null>(null);
  const [err, setErr] = useState("");
  const [scanMode, setScanMode] = useState(false);
  useEffect(() => {
    // Opened from a scanned QR code (?t=TOKEN): show the minimal emergency details only
    const token = new URLSearchParams(window.location.search).get("t");
    if (!token) return;
    setScanMode(true);
    api<Emergency>(`/patients/health-card/${token}`).then(setScan).catch(() => setErr("This health card is not valid."));
  }, []);
  useEffect(() => {
    if (!authReady || !user || user.role !== "patient") return;
    Promise.all([api<Mine>("/patients/me/health-card"), api<{ dob?: string }>("/patients/me")])
      .then(([c, p]) => {
        setMine(c);
        setDob(p.dob ? String(p.dob).slice(0, 10) : "");
      })
      .catch(() => setErr("Could not load your health card."));
  }, [authReady, user]);
  if (scanMode) {
    return (
      <section className="wrap section">
        <div className="card mx-auto max-w-md space-y-2 p-6">
          <h1 className="text-xl font-black text-brand-dark">Emergency information</h1>
          {scan ? (
            <>
              <p className="text-lg font-bold">{scan.name}</p>
              <p className="text-sm">MRN: {scan.mrn}</p>
              <p className="text-sm">Blood group: <b>{scan.bloodGroup || "not recorded"}</b></p>
              <p className="text-sm">Allergies: {scan.allergies || "none recorded"}</p>
              <p className="text-sm">Emergency contact: {scan.emergencyContact || "not recorded"}</p>
            </>
          ) : (
            <p className="text-sm text-slate-600">{err || "Loading…"}</p>
          )}
        </div>
      </section>
    );
  }
  return (
    <>
      <PageHero title={t("qr.title")} desc={t("qr.desc")} icon="qr" />
      <section className="wrap section">
        {!mine ? (
          <div className="card mx-auto max-w-md p-6 text-center text-sm">
            <p className="font-bold text-brand-dark">{err || (user && user.role !== "patient" ? "Health cards are for patient accounts." : "Log in as a patient to see your health card.")}</p>
            {!user && (
              <Link href="/login" className="btn-primary mt-4 inline-flex">
                {t("nav.login")}
              </Link>
            )}
          </div>
        ) : (
          <div className="mx-auto grid max-w-3xl gap-6 md:grid-cols-2">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark to-brand p-6 text-white shadow-lift">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
              <div className="flex items-center gap-2">
                <LogoMark size={36} />
                <b className="text-lg">RH Hospital</b>
              </div>
              <p className="mt-6 text-xs font-bold tracking-widest text-sky-200">HEALTH CARD</p>
              <p className="text-2xl font-black">{mine.name}</p>
              <p className="mt-2 text-sm text-sky-100">ID: {mine.mrn}</p>
              {dob && <p className="text-sm text-sky-100">DOB: {dob}</p>}
            </div>
            <div className="card flex flex-col items-center gap-3 p-6">
              <QRCodeSVG value={mine.verifyUrl} size={168} fgColor="#0B2A6F" level="M" />
              <p className="text-center text-sm font-bold text-brand-dark">{t("qr.scan")}</p>
              <p className="text-center text-xs text-slate-500">{t("qr.desc")}</p>
              <button onClick={() => window.print()} className="btn-outline no-print">
                <Printer size={16} /> {t("c.print")}
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
