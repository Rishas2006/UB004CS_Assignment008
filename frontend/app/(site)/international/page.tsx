"use client";
import { useState } from "react";
import { post, ApiError } from "../../../lib/api";
import {
  BedDouble,
  CalendarDays,
  Car,
  Check,
  FileText,
  Globe,
  Languages,
} from "lucide-react";
import PageHero from "../../../components/PageHero";
import { Item, Stagger, SuccessCheck } from "../../../components/Motion";
import { useLang } from "../../../lib/i18n/provider";
import { l } from "../../../lib/i18n/dict";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

type HelpIconKey =
  | "calendar"
  | "car"
  | "languages"
  | "file"
  | "globe"
  | "beddouble";
const help: [HelpIconKey, ReturnType<typeof l>][] = [
  [
    "calendar",
    l(
      "Appointments & estimates",
      "වේලාවන් සහ ඇස්තමේන්තු",
      "சந்திப்பு & மதிப்பீடு",
    ),
  ],
  [
    "car",
    l(
      "Airport pickup & transport",
      "ගුවන්තොටුපළ පිටත්කිරීම් සහ ප්‍රවාහනය",
      "விமான நிலைய வரவேற்பு & போக்குவரத்து",
    ),
  ],
  [
    "languages",
    l("Translation support", "පරිවර්තන සහාය", "மொழிபெயர்ப்பு உதவி"),
  ],
  [
    "file",
    l(
      "Medical record & report copies",
      "වෛද්‍ය වාර්තා පිටපත්",
      "மருத்துவ பதிவுப் பிரதிகள்",
    ),
  ],
  [
    "globe",
    l(
      "Visa letter & insurance help",
      "වීසා ලිපිය සහ රක්ෂණ සහාය",
      "விசா கடிதம் & காப்பீட்டு உதவி",
    ),
  ],
  [
    "beddouble",
    l(
      "Accommodation for family",
      "පවුලට නවාතැන්",
      "குடும்பத்திற்கான தங்குமிடம்",
    ),
  ],
];
const helpIcons = {
  calendar: CalendarDays,
  car: Car,
  languages: Languages,
  file: FileText,
  globe: Globe,
  beddouble: BedDouble,
};
export default function International() {
  const { t, tr } = useLang();
  const [ok, setOk] = useState(false);
  const v = (id: string) => (document.getElementById(id) as HTMLInputElement | null)?.value.trim() ?? "";
  async function send(e: React.FormEvent) {
    e.preventDefault();
    try {
      await post("/contact", { name: v("in-n"), email: v("in-e"), subject: "International patient enquiry", message: `Country: ${v("in-c")}. ${v("in-m") || "Please contact me about treatment options."}` });
      setOk(true);
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Cannot reach the server. Is the backend running?");
    }
  }
  return (
    <>
      <PageHero
        title={t("nav.international")}
        desc={t("f.branchesNote")}
        icon="globe"
      />
      <PhotoBand src={IMG.international} alt="Doctor holding a globe, international patient care" caption={{ en: "Care without borders for international patients", si: "විදේශීය රෝගීන් සඳහා සීමාවන් නැති සත්කාර", ta: "வெளிநாட்டு நோயாளிகளுக்கான எல்லையற்ற பராமரிப்பு" }} />
      <section className="wrap section grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <Stagger className="grid gap-4 sm:grid-cols-2">
          {help.map(([ic, txt]) => {
            const HelpIcon = helpIcons[ic];
            return (
              <Item key={ic}>
                <div className="card flex items-center gap-3 p-5">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-pale text-brand">
                    <HelpIcon size={20} />
                  </span>
                  <span className="font-bold text-brand-dark">{tr(txt)}</span>
                </div>
              </Item>
            );
          })}
        </Stagger>
        <div className="card p-6">
          {ok ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <SuccessCheck />
              <p className="font-semibold">{t("c.sentOk")}</p>
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={send}
            >
              <h2 className="text-xl font-extrabold text-brand-dark">
                {t("nav.international")}
              </h2>
              <div>
                <label className="label" htmlFor="in-n">
                  {t("c.name")}
                </label>
                <input id="in-n" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="in-e">
                  {t("c.email")}
                </label>
                <input id="in-e" type="email" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="in-c">
                  Country
                </label>
                <input id="in-c" required className="input" />
              </div>
              <div>
                <label className="label" htmlFor="in-m">
                  {t("c.message")}
                </label>
                <textarea id="in-m" rows={3} className="input" />
              </div>
              <button className="btn-primary w-full">
                <Check size={16} /> {t("c.submit")}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
