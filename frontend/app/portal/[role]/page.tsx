"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TrendingDown, TrendingUp } from "lucide-react";
import Icon from "../../../components/Icon";
import { useLang } from "../../../lib/i18n/provider";
import { roleBySlug } from "../../../lib/data";
import { ApiError } from "../../../lib/api";
import { useSession } from "../../../lib/live";
import { hasLoader, loadPortal, type Act, type LivePanel, type LiveRow, type LivePortal } from "../../../lib/portalLive";

function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
    >
      {children}
    </motion.div>
  );
}

function Item({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
    >
      {children}
    </motion.div>
  );
}

const chip: Record<string, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  PAID: "bg-emerald-100 text-emerald-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  ACTIVE: "bg-emerald-100 text-emerald-700",
  RELEASED: "bg-emerald-100 text-emerald-700",
  READY: "bg-blue-100 text-blue-700",
  CHECKED_IN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  OUT_FOR_DELIVERY: "bg-blue-100 text-blue-700",
  PENDING: "bg-amber-100 text-amber-700",
  WAITING: "bg-amber-100 text-amber-700",
  DRAFT: "bg-slate-100 text-slate-600",
  LOW: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

function AreaChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const points = values
    .map(
      (value, index) =>
        `${values.length < 2 ? 0 : (index / (values.length - 1)) * 100},${36 - (value / max) * 30}`,
    )
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 40"
      className="h-40 w-full"
      role="img"
      aria-label="Analytics chart"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke="#1456C8"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function Donut({
  parts,
}: {
  parts: { label: string; value: number; color: string }[];
}) {
  const total = parts.reduce((sum, part) => sum + part.value, 0) || 1;
  let offset = 0;
  const segments = parts.map((part) => {
    const start = offset;
    offset += (part.value / total) * 100;
    return `${part.color} ${start}% ${offset}%`;
  });
  return (
    <div className="flex flex-wrap items-center justify-center gap-5">
      <div
        className="grid h-32 w-32 place-items-center rounded-full"
        style={{ background: `conic-gradient(${segments.join(", ")})` }}
        role="img"
        aria-label="Overview chart"
      >
        <div className="h-20 w-20 rounded-full bg-white" />
      </div>
      <ul className="space-y-2 text-xs text-slate-600">
        {parts.map((part) => (
          <li key={part.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: part.color }}
            />
            {part.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const errText = (e: unknown) =>
  e instanceof ApiError
    ? e.details?.[0]
      ? `${e.details[0].field}: ${e.details[0].message}`
      : e.message
    : e instanceof Error
      ? e.message
      : "Something went wrong. Is the backend running?";

/** Row/toolbar action buttons. Actions with fields open a small form; the others run straight away. */
function Acts({ acts, reload, primary }: { acts?: Act[]; reload: () => void; primary?: boolean }) {
  const [open, setOpen] = useState<Act | null>(null);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  if (!acts?.length) return null;
  async function exec(a: Act, v: Record<string, string>) {
    setBusy(true);
    setMsg("");
    try {
      await a.run(v);
      setOpen(null);
      reload();
    } catch (e) {
      if (a.fields?.length) setMsg(errText(e));
      else alert(errText(e));
    } finally {
      setBusy(false);
    }
  }
  function click(a: Act) {
    if (a.fields?.length) {
      setVals(Object.fromEntries(a.fields.map((f) => [f.key, f.initial ?? ""])));
      setMsg("");
      setOpen(a);
      return;
    }
    if (a.confirm && !window.confirm(a.confirm)) return;
    void exec(a, {});
  }
  return (
    <>
      <div className="flex flex-wrap gap-1.5">
        {acts.map((a) => (
          <button
            key={a.label}
            type="button"
            disabled={busy}
            onClick={() => click(a)}
            className={`${primary ? "btn-primary px-3 py-2 text-sm" : "btn-outline px-2.5 py-1.5 text-xs"} ${a.tone === "danger" ? "!text-red-600" : ""}`}
          >
            {a.label}
          </button>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <form
            className="card max-h-[90vh] w-full max-w-md space-y-3 overflow-y-auto p-6"
            onSubmit={(e) => {
              e.preventDefault();
              void exec(open, vals);
            }}
          >
            <h3 className="text-lg font-extrabold text-brand-dark">{open.label}</h3>
            {open.fields?.map((f) => (
              <div key={f.key}>
                <label className="label" htmlFor={`f-${f.key}`}>
                  {f.label}
                </label>
                {f.type === "textarea" ? (
                  <textarea id={`f-${f.key}`} rows={3} className="input" required={f.required} value={vals[f.key] ?? ""} placeholder={f.placeholder} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
                ) : f.type === "select" ? (
                  <select id={`f-${f.key}`} className="input" required={f.required} value={vals[f.key] ?? ""} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })}>
                    <option value="">Select…</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input id={`f-${f.key}`} type={f.type ?? "text"} className="input" required={f.required} value={vals[f.key] ?? ""} placeholder={f.placeholder} onChange={(e) => setVals({ ...vals, [f.key]: e.target.value })} />
                )}
              </div>
            ))}
            {msg && (
              <p role="alert" className="text-sm font-semibold text-alert">
                {msg}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" className="btn-outline px-4 py-2" onClick={() => setOpen(null)}>
                Cancel
              </button>
              <button className="btn-primary px-4 py-2" disabled={busy}>
                {busy ? "…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default function RolePortal() {
  const { role } = useParams<{ role: string }>();
  const router = useRouter();
  const { t, tr } = useLang();
  const r = roleBySlug(role);
  const [panel, setPanel] = useState(0);
  const { authReady, user, logout } = useSession();
  const userId = user?.id;
  const [liveP, setLiveP] = useState<LivePortal | null>(null);
  const [problem, setProblem] = useState<"login" | "forbidden" | "offline" | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const reload = () => setTick((x) => x + 1);

  // FIX 1: User oda real role vs URL role match aagalana, avanoda dashboard ku thiruppi anuppu
  // Idhu dhaan ella dashboard um kaatradha stop pannum
  useEffect(() => {
    if (!authReady) return;
    if (user && user.role && user.role !== role) {
      router.replace(`/portal/${user.role}`);
    }
  }, [authReady, user, role, router]);

  useEffect(() => {
    if (!authReady) return;
    // Vera role ah paakka try pannina, load pannadha
    if (user && user.role && user.role !== role) return;
    let alive = true;
    if (tick === 0) setLiveP(null);
    setProblem(null);
    if (!hasLoader(role)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    loadPortal(role)
      .then((x) => alive && setLiveP(x))
      .catch((e) => {
        if (!alive) return;
        if (e instanceof ApiError && e.status === 401) setProblem("login");
        else if (e instanceof ApiError && e.status === 403) setProblem("forbidden");
        else setProblem("offline");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [role, authReady, user, userId, tick]);
  if (!r) return <p>{t("c.noResults")}</p>;
  // Vera role ah paakka try pannina, blank kaatu - redirect aagidum
  if (authReady && user && user.role && user.role !== role) {
    return <p>Redirecting to your dashboard…</p>;
  }
  // live numbers/tables replace the sample ones; the sample data is only shown when the backend is unreachable
  const showSample = problem === "offline";
  const stats = r.stats.map((s, i) =>
    liveP ? { label: liveP.stats[i]?.label ?? s.label, value: liveP.stats[i]?.value ?? "—", trend: "" } : s,
  );
  type Tab = { id: string; icon: (typeof r.panels)[number]["icon"]; title: string; rows: LiveRow[]; toolbar?: Act[] };
  // FIX 2: Backend la irundhu extra panels vandhalum serkka koodadhu.
  // Ippo indha role ku mattum ulla panels dhaan kaatum.
  const panels: Tab[] = liveP
    ? r.panels.map((x) => {
          const lp = liveP.panels.find((q: LivePanel) => q.id === x.id);
          return { id: x.id, icon: x.icon, title: tr(x.title), rows: lp?.rows ?? [], toolbar: lp?.toolbar };
        })
    : r.panels.map((x) => ({ id: x.id, icon: x.icon, title: tr(x.title), rows: x.rows.map((cells) => ({ cells })) as LiveRow[], toolbar: undefined }));
  const p = panels[Math.min(panel, panels.length - 1)];
  const hasActs = p.rows.some((x) => x.acts?.length);
  const chartVals = liveP ? liveP.chart : r.chart;
  const donutParts = liveP
    ? liveP.donut
    : [
        { label: "Medicine", value: 32, color: "#1456C8" },
        { label: "Surgery", value: 28, color: "#16A34A" },
        { label: "Paediatrics", value: 22, color: "#F59E0B" },
        { label: "Other", value: 18, color: "#94A3B8" },
      ];
  const statusText = (s: string) =>
    t(`status.${s}` as "status.PAID") || s.replace(/_/g, " ").toLowerCase();
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand text-white">
            <Icon name={r.icon} size={26} />
          </span>
          <div>
            <h1 className="text-2xl font-black text-brand-dark">
              {tr(r.label)} · {t("p.dashboard")}
            </h1>
            <p className="text-xs text-slate-500">
              {liveP
                ? `Live data from the hospital database${user ? ` · ${user.name}` : ""}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {user && (
            <button onClick={() => logout().then(() => (window.location.href = "/login"))} className="btn-outline px-3 py-2">
              Log out
            </button>
          )}
          {r.actions.map((a) => (
            <Link
              key={a.href + a.icon}
              href={a.href}
              className="btn-outline px-3 py-2"
            >
              <Icon name={a.icon} size={16} /> {tr(a.label)}
            </Link>
          ))}
        </div>
      </div>

      <Stagger key={r.slug} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => {
          const down = s.trend.startsWith("-");
          return (
            <Item key={s.label.en}>
              <div className="card p-4">
                <p className="text-xs font-bold text-slate-500">
                  {tr(s.label)}
                </p>
                <p className="mt-1 text-2xl font-black text-brand-dark md:text-3xl">
                  {s.value}
                </p>
                {s.trend && (
                  <p
                    className={`mt-1 flex items-center gap-1 text-xs font-bold ${down ? "text-red-500" : "text-emerald-600"}`}
                  >
                    {down ? (
                      <TrendingDown size={14} />
                    ) : (
                      <TrendingUp size={14} />
                    )}{" "}
                    {s.trend}
                  </p>
                )}
              </div>
            </Item>
          );
        })}
      </Stagger>

      {problem === "login" && (
        <div className="card p-5 text-sm">
          <p className="font-bold text-brand-dark">Please log in to see this dashboard.</p>
          <Link href="/login" className="btn-primary mt-3 inline-flex">
            {t("nav.login")}
          </Link>
        </div>
      )}
      {problem === "forbidden" && (
        <div className="card p-5 text-sm">
          <p className="font-bold text-brand-dark">
            Your account ({user?.role ?? "unknown role"}) cannot open the {tr(r.label)} dashboard.
          </p>
          <Link href={user ? `/portal/${user.role}` : "/login"} className="btn-outline mt-3 inline-flex">
            {user ? "Go to my dashboard" : t("nav.login")}
          </Link>
        </div>
      )}

      {(chartVals?.length || donutParts?.length) && (
        <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
          {chartVals && chartVals.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-2 font-extrabold text-brand-dark">{t("p.analytics")}</h2>
              <AreaChart key={r.slug} values={chartVals} />
            </div>
          )}
          {donutParts && donutParts.length > 0 && (
            <div className="card p-5">
              <h2 className="mb-3 font-extrabold text-brand-dark">{t("p.overview")}</h2>
              <Donut parts={donutParts} />
            </div>
          )}
        </div>
      )}

      <div className="card overflow-hidden">
        <div
          className="flex gap-1 overflow-x-auto border-b border-brand-sky bg-brand-ice p-2"
          role="tablist"
        >
          {panels.map((x, i) => (
            <button
              key={x.id}
              role="tab"
              aria-selected={panel === i}
              onClick={() => setPanel(i)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${panel === i ? "bg-white text-brand shadow-soft" : "text-slate-600 hover:bg-white/60"}`}
            >
              <Icon name={x.icon} size={16} /> {x.title}
            </button>
          ))}
        </div>
        {p.toolbar && p.toolbar.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b border-brand-sky p-3">
            <Acts acts={p.toolbar} reload={reload} primary />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={r.slug + p.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="overflow-x-auto"
          >
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs text-slate-500">
                <tr>
                  <th className="p-4">{t("tbl.name")}</th>
                  <th className="p-4">{t("tbl.detail")}</th>
                  <th className="p-4">{t("tbl.status")}</th>
                  <th className="p-4">{t("tbl.time")}</th>
                  {hasActs && <th className="p-4" />}
                </tr>
              </thead>
              <tbody>
                {p.rows.length === 0 && (
                  <tr className="border-t border-brand-sky">
                    <td colSpan={5} className="p-6 text-center text-slate-500">
                      {loading ? "…" : t("c.noResults")}
                    </td>
                  </tr>
                )}
                {p.rows.map(({ cells: [a, b, s, tm], acts }, idx) => (
                  <tr
                    key={`${idx}-${a}`}
                    className="border-t border-brand-sky transition hover:bg-brand-ice"
                  >
                    <td className="p-4 font-bold text-brand-dark">{a}</td>
                    <td className="p-4 text-slate-600">{b}</td>
                    <td className="p-4">
                      {s && (
                        <span className={`chip ${chip[s] || ""}`}>
                          {statusText(s)}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">{tm}</td>
                    {hasActs && (
                      <td className="p-4">
                        <Acts acts={acts} reload={reload} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}