"use client";
import { motion } from "framer-motion";

export function AreaChart({
  values,
  labels,
  height = 160,
}: {
  values: number[];
  labels?: string[];
  height?: number;
}) {
  const w = 400,
    max = Math.max(...values) * 1.15,
    min = 0;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * (w - 20) + 10,
    height - 20 - ((v - min) / (max - min)) * (height - 40),
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${height - 20} L${pts[0][0]},${height - 20} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${height}`}
      className="w-full"
      role="img"
      aria-label="Trend chart"
    >
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1456C8" stopOpacity=".28" />
          <stop offset="100%" stopColor="#1456C8" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1="10"
          x2={w - 10}
          y1={height - 20 - f * (height - 40)}
          y2={height - 20 - f * (height - 40)}
          stroke="#E4ECFA"
        />
      ))}
      <motion.path
        d={area}
        fill="url(#ag)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      />
      <motion.path
        d={line}
        fill="none"
        stroke="#1456C8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
      />
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="3.5"
          fill="#fff"
          stroke="#1456C8"
          strokeWidth="2"
        />
      ))}
      {(labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map(
        (l, i) => (
          <text
            key={i}
            x={pts[i]?.[0]}
            y={height - 4}
            textAnchor="middle"
            fontSize="10"
            fill="#5b6b8c"
          >
            {l}
          </text>
        ),
      )}
    </svg>
  );
}

export function Donut({
  parts,
}: {
  parts: { label: string; value: number; color: string }[];
}) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  let acc = 0;
  const r = 40,
    c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-5">
      <svg
        viewBox="0 0 100 100"
        className="h-32 w-32 -rotate-90"
        role="img"
        aria-label="Distribution"
      >
        {parts.map((p, i) => {
          const len = (p.value / total) * c;
          const el = (
            <motion.circle
              key={i}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth="14"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-acc}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            />
          );
          acc += len;
          return el;
        })}
      </svg>
      <ul className="space-y-1.5 text-xs">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: p.color }}
            />
            {p.label} <b>{Math.round((p.value / total) * 100)}%</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
