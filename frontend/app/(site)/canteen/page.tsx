"use client";
import { money } from "../../../lib/data";
import { useLive } from "../../../lib/live";
import { PhotoGrid } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

function PageHero({ title }: { title: string }) {
  return (
    <header className="wrap py-10">
      <h1 className="text-3xl font-black text-brand-dark">{title}</h1>
    </header>
  );
}

export default function Canteen() {
  const { canteen } = useLive();
  return (
    <>
      <PageHero title="Canteen" />
      <PhotoGrid items={[{ src: IMG.canteenHall, alt: "Canteen dining hall", caption: { en: "Bright, clean canteen for patients and visitors", si: "රෝගීන් සහ අමුත්තන් සඳහා ආලෝකමත් පිරිසිදු කැන්ටීම", ta: "நோயாளிகள் மற்றும் பார்வையாளர்களுக்கான பிரகாசமான, சுத்தமான உணவகம்" } }, { src: IMG.canteenTray, alt: "Child with a fresh meal tray", caption: { en: "Fresh daily meals", si: "දිනපතා නැවුම් ආහාර", ta: "தினமும் புதிய உணவுகள்" } }, { src: IMG.nutrition, alt: "Healthy meal tray", caption: { en: "Balanced, healthy options", si: "සමබර සෞඛ්\u200dය සම්පන්න විකල්ප", ta: "சமநிலையான ஆரோக்கிய உணவு வகைகள்" } }]} />
      <section className="wrap section">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {canteen.map(([n, c, p]) => (
            <div key={n} className="card p-5">
              <p className="chip">{c}</p>
              <p className="mt-3 font-extrabold text-brand-dark">{n}</p>
              <p className="font-black text-brand">{money(p)}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
