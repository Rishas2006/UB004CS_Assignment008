"use client";
import { Download } from "lucide-react";
import PageHero from "../../../components/PageHero";
import { useLive } from "../../../lib/live";

export default function Policies() {
  const { policies } = useLive();
  return (
    <>
      <PageHero title="Policies" icon="scroll" />
      <section className="wrap section">
        <div className="card divide-y divide-brand-sky">
          {policies.map(([n, c, v]) => (
            <div
              key={n}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div>
                <p className="font-bold text-brand-dark">{n}</p>
                <p className="text-xs text-slate-500">
                  {c} · {v}
                </p>
              </div>
              <button
                className="btn-outline px-3 py-2"
                aria-label={`Download ${n}`}
              >
                <Download size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
