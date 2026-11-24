"use client";
import { useState, type ReactNode } from "react";
import { post, ApiError } from "../../../lib/api";
import { useLang } from "../../../lib/i18n/provider";
import { money } from "../../../lib/data";
import { useLive } from "../../../lib/live";
import { PhotoBand } from "../../../components/Photo";
import { IMG } from "../../../lib/images";

function SuccessCheck() {
  return (
    <span aria-hidden="true" className="text-4xl text-green-600">
      ✓
    </span>
  );
}

function Item({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

function RoomsHero({ title, icon }: { title: string; icon: string }) {
  return (
    <header className="wrap pt-8 pb-4">
      <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
        <span aria-hidden="true" className="text-2xl">
          {icon}
        </span>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          {title}
        </h1>
      </div>
    </header>
  );
}

const val = (id: string) =>
  (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)?.value.trim() ?? "";
const fail = (e: unknown) =>
  alert(e instanceof ApiError ? (e.details?.[0] ? `${e.details[0].field}: ${e.details[0].message}` : e.message) : "Cannot reach the server. Is the backend running?");

export default function Rooms() {
  const { rooms } = useLive();
  const { t, tr } = useLang();
  const [room, setRoom] = useState(rooms[0]?.id ?? "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [done, setDone] = useState(false);
  const r = rooms.find((x) => x.id === room) ?? rooms[0];
  const nights =
    from && to
      ? Math.max(0, Math.round((+new Date(to) - +new Date(from)) / 86400000))
      : 0;
  if (!r) return null;
  return (
    <>
      <RoomsHero title={t("nav.rooms")} icon="beddouble" />
      <PhotoBand src={IMG.ward} alt="Inpatient ward with clean beds" caption={{ en: "Clean, comfortable inpatient wards", si: "පිරිසිදු, සුවපහසු රෝගී වාට්ටු", ta: "சுத்தமான, வசதியான உள்நோயாளர் வார்டுகள்" }} />
      <section className="wrap section grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Stagger className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          {rooms.map((x) => (
            <Item key={x.id}>
              <button
                onClick={() => setRoom(x.id)}
                className={`card w-full p-5 text-left transition ${room === x.id ? "border-brand ring-2 ring-brand" : "card-hover"}`}
              >
                <p className="font-extrabold text-brand-dark">{tr(x.name)}</p>
                <p className="text-sm text-slate-600">{tr(x.desc)}</p>
                <p className="mt-2 font-black text-brand">
                  {money(x.price)}{" "}
                  <span className="text-xs font-semibold text-slate-500">
                    {t("c.perDay")}
                  </span>
                </p>
              </button>
            </Item>
          ))}
        </Stagger>
        <div className="card h-fit p-6">
          {done ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <SuccessCheck />
              <p className="font-semibold">{t("c.sentOk")}</p>
            </div>
          ) : (
            <form
              className="space-y-3"
              onSubmit={async (e) => {
                e.preventDefault();
                if (nights < 1) return;
                try {
                  await post("/room-bookings", { roomId: room, name: val("rname"), phone: val("rphone"), fromDate: from, toDate: to });
                  setDone(true);
                } catch (err) {
                  fail(err);
                }
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="rf">
                    From
                  </label>
                  <input
                    id="rf"
                    type="date"
                    className="input"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="rt">
                    To
                  </label>
                  <input
                    id="rt"
                    type="date"
                    className="input"
                    min={from}
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label" htmlFor="rname">
                    Name
                  </label>
                  <input id="rname" required className="input" />
                </div>
                <div>
                  <label className="label" htmlFor="rphone">
                    Phone
                  </label>
                  <input id="rphone" type="tel" required className="input" />
                </div>
              </div>
              <div className="rounded-xl bg-brand-pale p-4 text-sm">
                <p>
                  {tr(r.name)} × {nights}
                </p>
                <p className="text-2xl font-black text-brand">
                  {money(r.price * nights)}
                </p>
              </div>
              <button className="btn-primary w-full" disabled={nights < 1}>
                {t("c.confirm")}
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
