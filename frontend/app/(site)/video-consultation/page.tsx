"use client";
import Link from "next/link";
import PageHero from "../../../components/PageHero";
import Icon from "../../../components/Icon";
import { Item, Stagger } from "../../../components/Motion";
import { useLang } from "../../../lib/i18n/provider";
import { l } from "../../../lib/i18n/dict";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";
const steps = [
  [
    "calendar" as const,
    l(
      "Book a video slot",
      "වීඩියෝ වේලාවක් වෙන්කරන්න",
      "வீடியோ நேரத்தை முன்பதிவு செய்யுங்கள்",
    ),
  ],
  [
    "wallet" as const,
    l(
      "Pay securely online",
      "අන්තර්ජාලය හරහා ආරක්ෂිතව ගෙවන්න",
      "ஆன்லைனில் பாதுகாப்பாகச் செலுத்துங்கள்",
    ),
  ],
  [
    "message" as const,
    l(
      "Get a reminder with a secure link",
      "ආරක්ෂිත සබැඳියක් සහිත මතක් කිරීමක් ලබාගන්න",
      "பாதுகாப்பான இணைப்புடன் நினைவூட்டல் பெறுங்கள்",
    ),
  ],
  [
    "video" as const,
    l(
      "Join 10 minutes before your time",
      "වේලාවට මිනිත්තු 10කට පෙර සම්බන්ධ වන්න",
      "நேரத்திற்கு 10 நிமிடம் முன் இணையுங்கள்",
    ),
  ],
  [
    "file" as const,
    l(
      "Receive prescription PDF and lab request",
      "බෙහෙත් වට්ටෝරු PDF සහ විද්‍යාගාර ඉල්ලීම ලබාගන්න",
      "மருந்துச் சீட்டு PDF மற்றும் ஆய்வகக் கோரிக்கையைப் பெறுங்கள்",
    ),
  ],
  [
    "pill" as const,
    l(
      "Order medicine delivery",
      "ඖෂධ බෙදාහැරීම ඇණවුම් කරන්න",
      "மருந்து விநியோகத்தை ஆர்டர் செய்யுங்கள்",
    ),
  ],
] as const;
export default function Video() {
  const { t, tr } = useLang();
  return (
    <>
      <PageHero title={t("nav.video")} desc={t("q.video")} icon="video">
        <Link href="/doctors" className="btn-primary">
          {t("nav.book")}
        </Link>
      </PageHero>
      <PhotoBand src={IMG.video} alt="Doctor on a video consultation" caption={{ en: "See your doctor from home", si: "නිවසේ සිට ඔබේ වෛද්\u200dයවරයා හමුවන්න", ta: "வீட்டிலிருந்தே உங்கள் மருத்துவரைச் சந்தியுங்கள்" }} />
      <section className="wrap section">
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map(([ic, s], i) => (
            <Item key={i}>
              <div className="card flex items-center gap-4 p-5">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand text-white">
                  <Icon name={ic} />
                </span>
                <div>
                  <p className="text-xs font-black text-brand">{i + 1}</p>
                  <p className="font-bold text-brand-dark">{tr(s)}</p>
                </div>
              </div>
            </Item>
          ))}
        </Stagger>
        <p className="mt-6 text-sm text-slate-500">{t("c.disclaimer")}</p>
      </section>
    </>
  );
}
