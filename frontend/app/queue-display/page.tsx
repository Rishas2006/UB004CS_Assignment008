"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LangSwitch } from "../../components/Header";
import { api } from "../../lib/api";

// Public display shows token numbers only, never patient names. Data comes from the reception check-in desk (refreshes every 5 s).
type QueueRow = { doctor: string; serving: number | null; waiting: number[] };
export default function QueueDisplay() {
  const labels: Record<string, string> = {
    "c.live": "Live",
    "queue.now": "Now Serving",
    "queue.token": "Token",
    "queue.room": "Waiting",
    "queue.keep": "Please wait",
    "queue.next": "Next",
  };
  const t = (key: string) => labels[key] ?? key;
  const [rows, setRows] = useState<[string, number, number][]>([]);
  const [flash, setFlash] = useState(-1);
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    tick();
    const c = setInterval(tick, 15000);
    const branch = new URLSearchParams(window.location.search).get("branch") || "colombo";
    const poll = () =>
      api<QueueRow[]>(`/queue/${branch}`)
        .then((list) => {
          const next = list.map((x) => [x.doctor, x.serving ?? x.waiting[0] ?? 0, x.waiting.length] as [string, number, number]);
          setRows((prev) => {
            const i = next.findIndex((x, k) => prev[k] && prev[k][1] !== x[1]);
            if (i >= 0) {
              setFlash(i);
              setTimeout(() => setFlash(-1), 1800);
            }
            return next;
          });
        })
        .catch(() => {});
    poll();
    const q = setInterval(poll, 5000);
    return () => {
      clearInterval(c);
      clearInterval(q);
    };
  }, []);
  return (
    <main className="flex min-h-screen flex-col bg-[#071733] p-6 text-white md:p-10">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-bold text-sky-300">
          <span className="pulse-dot" /> RH Hospital · {t("c.live")}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black tabular-nums">{now}</span>
          <LangSwitch dark />
        </div>
      </div>
      <h1 className="my-8 text-center text-4xl font-black tracking-wide text-sky-300 md:text-6xl">
        {t("queue.now")}
      </h1>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4">
        {rows.length === 0 && (
          <p className="mt-10 text-center text-2xl text-sky-300">No active tokens right now</p>
        )}
        {rows.map(([name, token, room], i) => (
          <motion.div
            key={name}
            animate={{
              scale: flash === i ? 1.02 : 1,
              borderColor: flash === i ? "#38BDF8" : "#1E3A6E",
            }}
            className="flex items-center justify-between gap-4 rounded-2xl border-2 bg-[#0C2349] px-6 py-5 md:px-10 md:py-7"
          >
            <p className="text-lg font-semibold md:text-3xl">{name}</p>
            <div className="flex items-center gap-6 md:gap-10">
              <span className="hidden text-sm text-sky-300 sm:block">
                {t("queue.token")}
              </span>
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={token}
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 30, opacity: 0 }}
                  className="text-5xl font-black text-sky-300 tabular-nums md:text-7xl"
                >
                  {String(token).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
              <span className="text-sm md:text-xl">
                {t("queue.room")} {room}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="mt-8 text-center text-sky-200">
        {t("queue.keep")} · {t("queue.next")}:{" "}
        {rows.map((r) => String(r[1] + 1).padStart(2, "0")).join(", ")}
      </p>
    </main>
  );
}
