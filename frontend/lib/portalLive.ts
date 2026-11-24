/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Live data AND actions for the 11 role portals.
 * Each role loads its own tables from the backend; buttons call the matching API endpoint.
 * The API enforces the role on every call (401 = not signed in, 403 = wrong role), so nothing here is trusted by itself.
 */
import { api, openPdf } from "./api";
import { deptName, type Row } from "./data";
import type { L } from "./i18n/dict";

export type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select" | "email";
  options?: { value: string; label: string }[];
  initial?: string;
  required?: boolean;
  placeholder?: string;
};
export type Act = {
  label: string;
  tone?: "danger";
  confirm?: string;
  fields?: Field[];
  run: (v: Record<string, string>) => Promise<unknown>;
};
export type LiveRow = { cells: Row; acts?: Act[] };
export type LivePanel = {
  id: string;
  title?: string;
  rows: LiveRow[];
  toolbar?: Act[];
};
export type LivePortal = {
  stats: { label?: L; value: string }[];
  panels: LivePanel[];
  chart?: number[];
  donut?: { label: string; value: number; color: string }[];
};

// ---------- small helpers ----------
const dn = (id: string) => deptName(id)?.en ?? id;
const E = (s: string): L => ({ en: s, si: s, ta: s });
const d = (iso?: string | null) => (iso ? String(iso).slice(0, 10) : "—");
const hm = (t?: string | null) => (t ? String(t).slice(0, 5) : "—");
const tm = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const lkr = (n: number) => `LKR ${Number(n).toLocaleString("en-US")}`;
const cap = (s?: string | null) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
const today = () => new Date().toISOString().slice(0, 10);
const n = (v: number) => String(v);
const num = (v: string) => Number(v);
const send = (method: string, path: string, body?: unknown) =>
  api(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const tri = (s: string) => ({ en: s, si: s, ta: s });
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "item";
const uid = () => Date.now().toString(36);
const opt = (...v: string[]) => v.map((x) => ({ value: x, label: cap(x) }));

// FIX: Invoice ID can come as id / invoice_id / invoiceId / ref - backend la edhu vandhalum eduthukkum
const invId = (i: any) => i?.id ?? i?.invoice_id ?? i?.invoiceId ?? i?.ref;

const ST: Record<string, string> = {
  IN_CONSULT: "IN_PROGRESS",
  SAMPLE_COLLECTED: "IN_PROGRESS",
  PROCESSING: "IN_PROGRESS",
  PREPARING: "IN_PROGRESS",
  DISPATCHED: "IN_PROGRESS",
  ON_SCENE: "IN_PROGRESS",
  TRANSPORTING: "IN_PROGRESS",
  ORDERED: "PENDING",
  RECEIVED: "PENDING",
  UNPAID: "PENDING",
  REQUESTED: "PENDING",
  NEW: "PENDING",
  SUCCESS: "PAID",
  ARRIVED: "COMPLETED",
  CLOSED: "COMPLETED",
  GENERATED: "DRAFT",
  READ: "WAITING",
  REPLIED: "COMPLETED",
  SHORTLISTED: "WAITING",
  HIRED: "COMPLETED",
  available: "READY",
  cleaning: "PENDING",
  occupied: "IN_PROGRESS",
  reserved: "WAITING",
};
const st = (s: string) => ST[s] ?? s;
const COLORS = ["#1456C8", "#16A34A", "#F59E0B", "#94A3B8", "#EF4444"];
const donutOf = (top: { dept: string; count: number }[]) =>
  top.map((x, i) => ({
    label: dn(x.dept),
    value: x.count,
    color: COLORS[i % COLORS.length],
  }));
const row = (
  cells: Row,
  acts?: (Act | false | null | undefined)[],
): LiveRow => ({ cells, acts: acts?.filter(Boolean) as Act[] | undefined });
const panel = (
  id: string,
  rows: LiveRow[],
  toolbar?: Act[],
  title?: string,
): LivePanel => ({ id, rows, toolbar, title });
const act = (label: string, run: Act["run"], o: Partial<Act> = {}): Act => ({
  label,
  run,
  ...o,
});

type Analytics = {
  patients: number;
  appointmentsToday: number;
  unpaidInvoices: number;
  revenueMonth: number;
  appointmentsPerDay: { date: string; count: number }[];
  topDepartments: { dept: string; count: number }[];
  revenueByMonth: { month: string; total: number }[];
};

function submitForm(action: string, fields: Record<string, string>) {
  const f = document.createElement("form");
  f.method = "POST";
  f.action = action;
  for (const [k, v] of Object.entries(fields)) {
    const i = document.createElement("input");
    i.type = "hidden";
    i.name = k;
    i.value = v;
    f.appendChild(i);
  }
  document.body.appendChild(f);
  f.submit();
}

// ---------- the CMS panels shared by branch admin and super admin ----------
async function cmsPanels(): Promise<LivePanel[]> {
  const [news, anns, reviews, msgs] = await Promise.all([
    api<any[]>("/admin/cms/news"),
    api<any[]>("/admin/cms/announcements"),
    api<any[]>("/admin/reviews"),
    api<any[]>("/admin/messages"),
  ]);
  return [
    panel(
      "news",
      news.map((x) =>
        row(
          [
            x.title?.en ?? x.slug,
            x.category?.en ?? "—",
            x.is_published ? "ACTIVE" : "DRAFT",
            d(x.published_on),
          ],
          [
            act(x.is_published ? "Unpublish" : "Publish", () =>
              send("PUT", `/admin/cms/news/${x.slug}`, {
                is_published: !x.is_published,
              }),
            ),
            act("Delete", () => send("DELETE", `/admin/cms/news/${x.slug}`), {
              tone: "danger",
              confirm: "Delete this article?",
            }),
          ],
        ),
      ),
      [
        act(
          "Add news",
          (v) =>
            send("POST", "/admin/cms/news", {
              slug: `${slug(v.title)}-${uid()}`,
              published_on: today(),
              category: tri(v.category || "News"),
              title: tri(v.title),
              body: tri(v.body),
              is_published: true,
            }),
          {
            fields: [
              { key: "title", label: "Title", required: true },
              { key: "category", label: "Category", placeholder: "News" },
              {
                key: "body",
                label: "Article text",
                type: "textarea",
                required: true,
              },
            ],
          },
        ),
      ],
      "News",
    ),
    panel(
      "announcements",
      anns.map((x) =>
        row(
          [
            x.text?.en ?? x.id,
            cap(x.severity),
            x.is_active ? "ACTIVE" : "DRAFT",
            d(x.created_at),
          ],
          [
            act(x.is_active ? "Hide" : "Show", () =>
              send("PUT", `/admin/cms/announcements/${x.id}`, {
                is_active: !x.is_active,
              }),
            ),
            act(
              "Delete",
              () => send("DELETE", `/admin/cms/announcements/${x.id}`),
              { tone: "danger", confirm: "Delete this announcement?" },
            ),
          ],
        ),
      ),
      [
        act(
          "Add announcement",
          (v) =>
            send("POST", "/admin/cms/announcements", {
              id: `ann-${uid()}`,
              severity: v.severity || "info",
              text: tri(v.text),
              is_active: true,
            }),
          {
            fields: [
              { key: "text", label: "Message", required: true },
              {
                key: "severity",
                label: "Severity",
                type: "select",
                options: opt("info", "warning", "urgent"),
                initial: "info",
              },
            ],
          },
        ),
      ],
      "Announcements",
    ),
    panel(
      "reviews",
      reviews.map((x) =>
        row(
          [
            x.author,
            `${x.rating}★ ${x.body?.en ?? ""}`,
            x.status === "APPROVED"
              ? "APPROVED"
              : x.status === "REJECTED"
                ? "DRAFT"
                : "PENDING",
            d(x.created_at),
          ],
          x.status === "PENDING"
            ? [
                act("Approve", () =>
                  send("PATCH", `/admin/reviews/${x.id}`, {
                    status: "APPROVED",
                  }),
                ),
                act(
                  "Reject",
                  () =>
                    send("PATCH", `/admin/reviews/${x.id}`, {
                      status: "REJECTED",
                    }),
                  { tone: "danger" },
                ),
              ]
            : undefined,
        ),
      ),
      undefined,
      "Reviews",
    ),
    panel(
      "messages",
      msgs.map((x) =>
        row(
          [
            x.name,
            `${x.subject ? `${x.subject}: ` : ""}${String(x.message).slice(0, 80)}`,
            st(x.status),
            d(x.created_at),
          ],
          x.status !== "REPLIED"
            ? [
                act("Mark replied", () =>
                  send("PATCH", `/admin/messages/${x.id}`, {
                    status: "REPLIED",
                  }),
                ),
              ]
            : undefined,
        ),
      ),
      undefined,
      "Messages",
    ),
  ];
}

const LOADERS: Record<string, () => Promise<LivePortal>> = {
  // ---------------------------------------------------------------- patient
  async patient() {
    const [appts, rec, prof] = await Promise.all([
      api<any[]>("/appointments/mine"),
      api<any>("/patients/me/records"),
      api<any>("/patients/me"),
    ]);
    const upcoming = appts.filter(
      (a) =>
        ["CONFIRMED", "CHECKED_IN"].includes(a.status) && a.date >= today(),
    ).length;
    return {
      stats: [
        { value: n(upcoming) },
        { value: n(rec.prescriptions.length) },
        { value: n(rec.labReports.length) },
        {
          value: n(
            rec.invoices.filter((i: any) => i.status === "UNPAID").length,
          ),
        },
      ],
      panels: [
        panel(
          "appointments",
          appts.slice(0, 25).map((a) =>
            row(
              [
                a.doctor,
                `${dn(a.dept)} · ${cap(a.branch)}${a.type === "VIDEO" ? " · Video" : ""}`,
                st(a.status),
                `${d(a.date)} ${hm(a.time)}`,
              ],
              [
                a.videoRoom &&
                  act("Join video", async () => {
                    window.open(`https://meet.jit.si/${a.videoRoom}`, "_blank");
                  }),
                a.status === "CONFIRMED" &&
                  act(
                    "Cancel",
                    () => send("PATCH", `/appointments/${a.id}/cancel`),
                    { tone: "danger", confirm: "Cancel this appointment?" },
                  ),
              ],
            ),
          ),
        ),
        panel("records", [
          ...rec.prescriptions.map((p: any) =>
            row(
              [
                `Prescription #${p.ref}`,
                p.items.map((i: any) => i.drug).join(", ") || "—",
                "READY",
                d(p.date),
              ],
              [
                act("Download PDF", () =>
                  openPdf(`/clinical/prescriptions/${p.ref}/pdf`),
                ),
              ],
            ),
          ),
          ...rec.labReports.map((o: any) =>
            row([
              o.test,
              o.result ? String(o.result).slice(0, 60) : `Lab order ${o.ref}`,
              st(o.status),
              d(o.date),
            ]),
          ),
        ]),
        panel(
          "billing",
          rec.invoices.map((i: any) =>
            row(
              [
                i.ref,
                `${i.description} · ${lkr(i.amount)}`,
                st(i.status),
                d(i.date),
              ],
              [
                i.status === "UNPAID" &&
                  act("Pay online", async () => {
                    const id = invId(i);
                    if (!id) {
                      alert(
                        "Invoice ID missing. Please refresh and try again.",
                      );
                      return;
                    }
                    const p: any = await send(
                      "POST",
                      `/billing/invoices/${id}/pay`,
                    );
                    submitForm(p.action, p.fields);
                  }),
              ],
            ),
          ),
        ),
        panel(
          "profile",
          [
            row(["Medical record no.", prof.mrn, "", ""]),
            row(["Phone", prof.phone || "—", "", ""]),
            row(["Date of birth", d(prof.dob), "", ""]),
            row(["Blood group", prof.bloodGroup || "—", "", ""]),
            row(["Allergies", prof.allergies || "—", "", ""]),
            row(["Emergency contact", prof.emergencyContact || "—", "", ""]),
          ],
          [
            act(
              "Edit profile",
              (v) =>
                send(
                  "PUT",
                  "/patients/me",
                  Object.fromEntries(
                    Object.entries(v).filter(([, x]) => x !== ""),
                  ),
                ),
              {
                fields: [
                  { key: "phone", label: "Phone", initial: prof.phone ?? "" },
                  {
                    key: "dob",
                    label: "Date of birth",
                    type: "date",
                    initial: prof.dob ? d(prof.dob) : "",
                  },
                  {
                    key: "gender",
                    label: "Gender",
                    type: "select",
                    options: opt("female", "male", "other"),
                    initial: prof.gender ?? "",
                  },
                  {
                    key: "bloodGroup",
                    label: "Blood group",
                    type: "select",
                    options: [
                      "A+",
                      "A-",
                      "B+",
                      "B-",
                      "AB+",
                      "AB-",
                      "O+",
                      "O-",
                    ].map((x) => ({ value: x, label: x })),
                    initial: prof.bloodGroup ?? "",
                  },
                  {
                    key: "allergies",
                    label: "Allergies",
                    initial: prof.allergies ?? "",
                  },
                  {
                    key: "emergencyContact",
                    label: "Emergency contact",
                    initial: prof.emergencyContact ?? "",
                  },
                  {
                    key: "address",
                    label: "Address",
                    initial: prof.address ?? "",
                  },
                ],
              },
            ),
          ],
          "My profile",
        ),
      ],
    };
  },
  // ---------------------------------------------------------------- doctor
  async doctor() {
    const [appts, rx, lab, tests] = await Promise.all([
      api<any[]>("/appointments"),
      api<any[]>("/clinical/prescriptions"),
      api<any[]>("/clinical/lab/orders"),
      api<any[]>("/lab-tests"),
    ]);
    const active = appts.filter((a) => a.status !== "CANCELLED");
    const setStatus = (id: string, status: string) =>
      send("PATCH", `/appointments/${id}/status`, { status });
    return {
      stats: [
        { value: n(active.length) },
        { value: n(active.filter((a) => a.status === "COMPLETED").length) },
        { value: "—" },
        { value: n(active.filter((a) => a.type === "VIDEO").length) },
      ],
      panels: [
        panel(
          "queue",
          active.map((a) =>
            row(
              [
                a.patient,
                `${a.reason || "Consultation"} · ${a.tokenNo ? `Token ${a.tokenNo}` : "no token yet"}`,
                st(a.status),
                hm(a.time),
              ],
              [
                a.status === "CHECKED_IN" &&
                  act("Start", () => setStatus(a.id, "IN_CONSULT")),
                a.status === "IN_CONSULT" &&
                  act("Complete", () => setStatus(a.id, "COMPLETED")),
                a.status === "CONFIRMED" &&
                  act("No-show", () => setStatus(a.id, "NO_SHOW"), {
                    tone: "danger",
                    confirm: "Mark as no-show?",
                  }),
                a.patientId &&
                  ["IN_CONSULT", "COMPLETED"].includes(a.status) &&
                  act(
                    "Prescribe",
                    (v) =>
                      send("POST", "/clinical/prescriptions", {
                        patientId: a.patientId,
                        appointmentId: a.id,
                        notes: v.notes || undefined,
                        items: [
                          {
                            drug: v.drug,
                            dose: v.dose,
                            frequency: v.frequency,
                            days: num(v.days),
                          },
                        ],
                      }),
                    {
                      fields: [
                        { key: "drug", label: "Medicine", required: true },
                        {
                          key: "dose",
                          label: "Dose",
                          placeholder: "500 mg",
                          required: true,
                        },
                        {
                          key: "frequency",
                          label: "Frequency",
                          placeholder: "3 times daily",
                          required: true,
                        },
                        {
                          key: "days",
                          label: "Days",
                          type: "number",
                          initial: "5",
                          required: true,
                        },
                        { key: "notes", label: "Notes", type: "textarea" },
                      ],
                    },
                  ),
                a.patientId &&
                  ["IN_CONSULT", "COMPLETED"].includes(a.status) &&
                  act(
                    "Order lab test",
                    (v) =>
                      send("POST", "/clinical/lab/orders", {
                        patientId: a.patientId,
                        testCode: v.testCode,
                      }),
                    {
                      fields: [
                        {
                          key: "testCode",
                          label: "Test",
                          type: "select",
                          options: tests.map((t) => ({
                            value: t.code,
                            label: `${t.name} (${lkr(t.price)})`,
                          })),
                          required: true,
                        },
                      ],
                    },
                  ),
              ],
            ),
          ),
        ),
        panel(
          "rx",
          rx.map((r) =>
            row(
              [
                r.ref,
                `${r.patient} · ${r.medicines || "—"}`,
                "COMPLETED",
                d(r.date),
              ],
              [
                act("PDF", () =>
                  openPdf(`/clinical/prescriptions/${r.ref}/pdf`),
                ),
              ],
            ),
          ),
        ),
        panel(
          "lab",
          lab.map((o) => row([o.test, o.patient, st(o.status), d(o.date)])),
        ),
      ],
    };
  },
  // ---------------------------------------------------------------- nurse
  async nurse() {
    const beds = await api<any[]>("/admin/beds");
    const c = (s: string) => beds.filter((b) => b.status === s).length;
    const order = ["cleaning", "reserved", "occupied", "available"];
    const sorted = [...beds]
      .sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status))
      .slice(0, 60);
    const set = (b: any, status: string) =>
      b.status !== status &&
      act(`Set ${status}`, () =>
        send("PATCH", `/admin/beds/${b.id}`, { status }),
      );
    return {
      stats: [
        { value: n(c("occupied")) },
        { label: E("Beds available"), value: n(c("available")) },
        { label: E("Beds reserved"), value: n(c("reserved")) },
        { value: n(c("cleaning")) },
      ],
      panels: [
        panel(
          "beds",
          sorted.map((b) =>
            row(
              [`${b.ward} ${b.label}`, cap(b.status), st(b.status), "—"],
              [set(b, "available"), set(b, "occupied"), set(b, "cleaning")],
            ),
          ),
        ),
      ],
    };
  },
  // ---------------------------------------------------------------- reception
  async reception() {
    const [appts, inv] = await Promise.all([
      api<any[]>("/appointments"),
      api<any[]>("/billing/invoices"),
    ]);
    return {
      stats: [
        {
          value: n(
            appts.filter((a) =>
              ["CHECKED_IN", "IN_CONSULT", "COMPLETED"].includes(a.status),
            ).length,
          ),
        },
        {
          value: n(
            appts.filter((a) => ["CHECKED_IN", "IN_CONSULT"].includes(a.status))
              .length,
          ),
        },
        { value: n(inv.filter((i) => i.status === "UNPAID").length) },
        { value: "—" },
      ],
      panels: [
        panel(
          "checkin",
          appts.map((a) =>
            row(
              [
                a.patient,
                `${a.doctor} · ${a.tokenNo ? `Token ${a.tokenNo}` : "not checked in"}`,
                st(a.status),
                hm(a.time),
              ],
              [
                a.status === "CONFIRMED" &&
                  act("Check in", () =>
                    send("POST", `/appointments/${a.id}/check-in`),
                  ),
                a.status === "CONFIRMED" &&
                  act(
                    "Cancel",
                    () => send("PATCH", `/appointments/${a.id}/cancel`),
                    { tone: "danger", confirm: "Cancel this appointment?" },
                  ),
              ],
            ),
          ),
        ),
        panel(
          "pay",
          inv
            .slice(0, 40)
            .map((i) =>
              row(
                [
                  i.ref,
                  `${i.patient} · ${lkr(i.amount)}`,
                  st(i.status),
                  d(i.date),
                ],
                [
                  i.status === "UNPAID" &&
                    act(
                      "Mark paid",
                      () =>
                        send("POST", `/billing/invoices/${invId(i)}/mark-paid`),
                      { confirm: "Record a counter payment for this invoice?" },
                    ),
                ],
              ),
            ),
        ),
      ],
    };
  },
  // ---------------------------------------------------------------- pharmacy
  async pharmacy() {
    const [orders, items] = await Promise.all([
      api<any[]>("/pharmacy/orders"),
      api<any[]>("/pharmacy/items"),
    ]);
    const low = items.filter((i) => i.stock <= i.reorderLevel);
    const next = (o: any) =>
      (
        ({
          RECEIVED: ["PREPARING", "Start preparing"],
          PREPARING: ["READY", "Mark ready"],
          READY:
            o.mode === "delivery"
              ? ["OUT_FOR_DELIVERY", "Out for delivery"]
              : ["DELIVERED", "Handed over"],
          OUT_FOR_DELIVERY: ["DELIVERED", "Delivered"],
        }) as Record<string, string[]>
      )[o.status];
    return {
      stats: [
        { value: n(orders.length) },
        { value: n(low.length) },
        { value: "—" },
        { value: n(orders.filter((o) => o.mode === "delivery").length) },
      ],
      panels: [
        panel(
          "orders",
          orders.map((o) => {
            const nx = next(o);
            return row(
              [
                o.ref,
                `${o.prescriptionRef} · ${cap(o.mode)}`,
                st(o.status),
                d(o.date),
              ],
              [
                nx &&
                  act(nx[1], () =>
                    send("PATCH", `/pharmacy/orders/${o.id}/status`, {
                      status: nx[0],
                    }),
                  ),
                ["RECEIVED", "PREPARING", "READY"].includes(o.status) &&
                  act(
                    "Cancel",
                    () =>
                      send("PATCH", `/pharmacy/orders/${o.id}/status`, {
                        status: "CANCELLED",
                      }),
                    { tone: "danger", confirm: "Cancel this order?" },
                  ),
              ],
            );
          }),
        ),
        panel(
          "stock",
          [...items]
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 60)
            .map((i) =>
              row(
                [
                  i.name,
                  `${i.stock} in stock (reorder at ${i.reorderLevel})`,
                  i.stock <= i.reorderLevel ? "LOW" : "ACTIVE",
                  d(i.expiry),
                ],
                [
                  act(
                    "Adjust stock",
                    (v) =>
                      send("PATCH", `/pharmacy/items/${i.id}/adjust`, {
                        delta: num(v.delta),
                      }),
                    {
                      fields: [
                        {
                          key: "delta",
                          label: "Add (+) or remove (-) units",
                          type: "number",
                          initial: "50",
                          required: true,
                        },
                      ],
                    },
                  ),
                ],
              ),
            ),
          [
            act(
              "Add item",
              (v) =>
                send("POST", "/pharmacy/items", {
                  sku: v.sku,
                  name: v.name,
                  stock: num(v.stock),
                  reorderLevel: num(v.reorderLevel),
                  price: num(v.price),
                  expiry: v.expiry || undefined,
                }),
              {
                fields: [
                  { key: "sku", label: "SKU", required: true },
                  { key: "name", label: "Name", required: true },
                  {
                    key: "stock",
                    label: "Stock",
                    type: "number",
                    initial: "0",
                    required: true,
                  },
                  {
                    key: "reorderLevel",
                    label: "Reorder level",
                    type: "number",
                    initial: "20",
                    required: true,
                  },
                  {
                    key: "price",
                    label: "Unit price (LKR)",
                    type: "number",
                    required: true,
                  },
                  { key: "expiry", label: "Expiry", type: "date" },
                ],
              },
            ),
          ],
        ),
      ],
    };
  },
  // ---------------------------------------------------------------- laboratory
  async laboratory() {
    const orders = await api<any[]>("/clinical/lab/orders");
    const c = (...s: string[]) =>
      orders.filter((o) => s.includes(o.status)).length;
    const setS = (o: any, status: string, label: string) =>
      act(label, () =>
        send("PATCH", `/clinical/lab/orders/${o.id}`, { status }),
      );
    return {
      stats: [
        { value: n(orders.length) },
        { value: n(c("SAMPLE_COLLECTED", "PROCESSING")) },
        { label: E("Completed"), value: n(c("COMPLETED")) },
        { value: "—" },
      ],
      panels: [
        panel(
          "orders",
          orders.map((o) =>
            row(
              [
                `${o.ref} · ${o.patient}`,
                o.result ? String(o.result).slice(0, 60) : o.test,
                st(o.status),
                d(o.date),
              ],
              [
                o.status === "ORDERED" &&
                  setS(o, "SAMPLE_COLLECTED", "Collect sample"),
                o.status === "SAMPLE_COLLECTED" &&
                  setS(o, "PROCESSING", "Start processing"),
                o.status === "PROCESSING" &&
                  act(
                    "Enter result",
                    (v) =>
                      send("PATCH", `/clinical/lab/orders/${o.id}`, {
                        status: "COMPLETED",
                        resultText: v.resultText,
                      }),
                    {
                      fields: [
                        {
                          key: "resultText",
                          label: `Result for ${o.test}`,
                          type: "textarea",
                          required: true,
                        },
                      ],
                    },
                  ),
                o.status === "ORDERED" && setS(o, "CANCELLED", "Cancel"),
              ],
            ),
          ),
        ),
      ],
    };
  },
  // ---------------------------------------------------------------- hr
  async hr() {
    const [staff, leaves, adv, pay, apps, branches] = await Promise.all([
      api<any[]>("/hr/staff"),
      api<any[]>("/hr/leaves"),
      api<any[]>("/hr/advances"),
      api<any[]>("/hr/payroll"),
      api<any[]>("/admin/applications"),
      api<any[]>("/branches"),
    ]);
    const t = today();
    const onLeave = leaves.filter(
      (l) => l.status === "APPROVED" && l.fromDate <= t && l.toDate >= t,
    ).length;
    const latest = pay[0];
    const decide = (path: string) => (status: string) =>
      act(
        status === "APPROVED" ? "Approve" : "Reject",
        () => send("PATCH", path, { status }),
        status === "REJECTED" ? { tone: "danger" } : {},
      );
    return {
      stats: [
        { value: n(staff.length) },
        { value: n(onLeave) },
        {
          value: n(
            adv.filter((a) => ["PENDING", "APPROVED"].includes(a.status))
              .length,
          ),
        },
        { value: latest ? (latest.status === "PAID" ? "Paid" : "Draft") : "—" },
      ],
      panels: [
        panel("leaves", [
          ...leaves
            .slice(0, 40)
            .map((l) =>
              row(
                [
                  l.name,
                  `${cap(l.type)} leave · ${d(l.fromDate)} → ${d(l.toDate)}`,
                  st(l.status),
                  d(l.fromDate),
                ],
                l.status === "PENDING"
                  ? [
                      decide(`/hr/leaves/${l.id}`)("APPROVED"),
                      decide(`/hr/leaves/${l.id}`)("REJECTED"),
                    ]
                  : undefined,
              ),
            ),
          ...adv
            .slice(0, 40)
            .map((a) =>
              row(
                [
                  a.name,
                  `Advance ${lkr(a.amount)} · deduct ${a.deductMonth}`,
                  st(a.status),
                  a.deductMonth,
                ],
                a.status === "PENDING"
                  ? [
                      decide(`/hr/advances/${a.id}`)("APPROVED"),
                      decide(`/hr/advances/${a.id}`)("REJECTED"),
                    ]
                  : undefined,
              ),
            ),
        ]),
        panel(
          "payroll",
          pay
            .slice(0, 60)
            .map((p) =>
              row(
                [
                  p.name,
                  `${p.month} · net ${lkr(p.net)}`,
                  st(p.status),
                  p.month,
                ],
                [
                  p.status === "GENERATED" &&
                    act("Mark paid", () =>
                      send("PATCH", `/hr/payroll/${p.id}/paid`),
                    ),
                ],
              ),
            ),
          [
            act(
              "Generate payroll",
              (v) => send("POST", "/hr/payroll/generate", { month: v.month }),
              {
                fields: [
                  {
                    key: "month",
                    label: "Month (YYYY-MM)",
                    initial: today().slice(0, 7),
                    required: true,
                  },
                ],
              },
            ),
          ],
        ),
        panel(
          "staff",
          staff.map((s) =>
            row(
              [
                s.name,
                `${s.jobTitle} · ${s.role}`,
                s.isActive ? "ACTIVE" : "DRAFT",
                d(s.joinDate),
              ],
              [
                s.isActive &&
                  act("Deactivate", () => send("DELETE", `/hr/staff/${s.id}`), {
                    tone: "danger",
                    confirm: `Deactivate ${s.name}'s account?`,
                  }),
              ],
            ),
          ),
          [
            act(
              "Add staff",
              (v) =>
                send("POST", "/hr/staff", {
                  name: v.name,
                  email: v.email,
                  phone: v.phone || undefined,
                  role: v.role,
                  branchId: v.branchId,
                  jobTitle: v.jobTitle,
                  basicSalary: num(v.basicSalary),
                  allowances: num(v.allowances || "0"),
                }),
              {
                fields: [
                  { key: "name", label: "Full name", required: true },
                  {
                    key: "email",
                    label: "Email",
                    type: "email",
                    required: true,
                  },
                  { key: "phone", label: "Phone" },
                  {
                    key: "role",
                    label: "Role",
                    type: "select",
                    options: opt(
                      "doctor",
                      "nurse",
                      "reception",
                      "pharmacy",
                      "laboratory",
                      "hr",
                      "finance",
                      "ambulance",
                      "branch-admin",
                    ),
                    initial: "nurse",
                  },
                  {
                    key: "branchId",
                    label: "Branch",
                    type: "select",
                    options: branches.map((b) => ({
                      value: b.id,
                      label: cap(b.id),
                    })),
                    initial: "colombo",
                  },
                  { key: "jobTitle", label: "Job title", required: true },
                  {
                    key: "basicSalary",
                    label: "Basic salary (LKR)",
                    type: "number",
                    required: true,
                  },
                  {
                    key: "allowances",
                    label: "Allowances (LKR)",
                    type: "number",
                    initial: "0",
                  },
                ],
              },
            ),
          ],
          "Staff",
        ),
        panel(
          "applications",
          apps.map((a) =>
            row(
              [
                a.name,
                `${a.job ?? "General"} · ${a.email}`,
                st(a.status === "RECEIVED" ? "NEW" : a.status),
                d(a.created_at),
              ],
              a.status !== "HIRED" && a.status !== "REJECTED"
                ? [
                    act("Shortlist", () =>
                      send("PATCH", `/admin/applications/${a.id}`, {
                        status: "SHORTLISTED",
                      }),
                    ),
                    act("Hire", () =>
                      send("PATCH", `/admin/applications/${a.id}`, {
                        status: "HIRED",
                      }),
                    ),
                    act(
                      "Reject",
                      () =>
                        send("PATCH", `/admin/applications/${a.id}`, {
                          status: "REJECTED",
                        }),
                      { tone: "danger" },
                    ),
                  ]
                : undefined,
            ),
          ),
          undefined,
          "Job applications",
        ),
      ],
    };
  },
  // ---------------------------------------------------------------- finance
  async finance() {
    const [inv, pays, an, pay] = await Promise.all([
      api<any[]>("/billing/invoices"),
      api<any[]>("/billing/payments"),
      api<Analytics>("/admin/analytics"),
      api<any[]>("/hr/payroll"),
    ]);
    const paid = inv.filter((i) => i.status === "PAID").length;
    const revToday = pays
      .filter((p) => p.status === "SUCCESS" && d(p.date) === today())
      .reduce((s, p) => s + p.amount, 0);
    return {
      stats: [
        { value: Math.round(revToday).toLocaleString("en-US") },
        { value: n(inv.length) },
        {
          value: inv.length ? `${Math.round((paid / inv.length) * 100)}%` : "—",
        },
        { value: n(inv.filter((i) => i.status === "UNPAID").length) },
      ],
      panels: [
        panel(
          "payments",
          pays.map((p) =>
            row([
              p.orderId,
              `${p.invoice} · ${lkr(p.amount)}`,
              st(p.status),
              d(p.date),
            ]),
          ),
        ),
        panel(
          "invoices",
          inv
            .slice(0, 80)
            .map((i) =>
              row(
                [
                  i.ref,
                  `${i.patient} · ${lkr(i.amount)}`,
                  st(i.status),
                  d(i.date),
                ],
                [
                  i.status === "UNPAID" &&
                    act(
                      "Mark paid",
                      () =>
                        send("POST", `/billing/invoices/${invId(i)}/mark-paid`),
                      { confirm: "Record a counter payment?" },
                    ),
                ],
              ),
            ),
          undefined,
          "Invoices",
        ),
        panel(
          "salaries",
          pay
            .slice(0, 60)
            .map((p) =>
              row(
                [
                  p.name,
                  `${p.month} · net ${lkr(p.net)}`,
                  st(p.status),
                  p.month,
                ],
                [
                  p.status === "GENERATED" &&
                    act("Mark paid", () =>
                      send("PATCH", `/hr/payroll/${p.id}/paid`),
                    ),
                ],
              ),
            ),
          undefined,
          "Salaries",
        ),
      ],
      chart:
        an.revenueByMonth.length > 1
          ? an.revenueByMonth.map((r) => r.total)
          : undefined,
    };
  },
  // ---------------------------------------------------------------- ambulance
  async ambulance() {
    const [reqs, veh] = await Promise.all([
      api<any[]>("/ambulance/requests"),
      api<any[]>("/ambulance/vehicles"),
    ]);
    const active = reqs.find((r) =>
      ["DISPATCHED", "ON_SCENE", "TRANSPORTING"].includes(r.status),
    );
    const setS = (r: any, status: string, label: string, danger = false) =>
      act(
        label,
        () => send("PATCH", `/ambulance/requests/${r.id}`, { status }),
        danger ? { tone: "danger", confirm: "Cancel this request?" } : {},
      );
    const free = veh.filter((v) => v.status === "AVAILABLE");
    return {
      stats: [
        { value: n(reqs.filter((r) => d(r.date) === today()).length) },
        { value: active ? active.ref : "—" },
        { label: E("Vehicles available"), value: n(free.length) },
        {
          label: E("Vehicles busy"),
          value: n(veh.filter((v) => v.status === "BUSY").length),
        },
      ],
      panels: [
        panel(
          "trips",
          reqs.map((r) =>
            row(
              [
                `Trip ${r.ref}`,
                `${r.callerName} · ${r.phone} · ${r.address}`,
                st(r.status),
                tm(r.date),
              ],
              [
                r.status === "REQUESTED" &&
                  act(
                    "Dispatch",
                    (v) =>
                      send("PATCH", `/ambulance/requests/${r.id}`, {
                        status: "DISPATCHED",
                        vehicleId: num(v.vehicleId),
                      }),
                    {
                      fields: [
                        {
                          key: "vehicleId",
                          label: "Vehicle",
                          type: "select",
                          options: free.map((v) => ({
                            value: String(v.id),
                            label: v.plate,
                          })),
                          required: true,
                        },
                      ],
                    },
                  ),
                r.status === "DISPATCHED" && setS(r, "ON_SCENE", "On scene"),
                r.status === "ON_SCENE" &&
                  setS(r, "TRANSPORTING", "Transporting"),
                r.status === "TRANSPORTING" && setS(r, "ARRIVED", "Arrived"),
                r.status === "ARRIVED" && setS(r, "CLOSED", "Close"),
                ["REQUESTED", "DISPATCHED"].includes(r.status) &&
                  setS(r, "CANCELLED", "Cancel", true),
              ],
            ),
          ),
        ),
        panel(
          "vehicles",
          veh.map((v) =>
            row(
              [
                v.plate,
                v.lat != null ? `${v.lat}, ${v.lng}` : "no position",
                v.status === "AVAILABLE"
                  ? "READY"
                  : v.status === "BUSY"
                    ? "IN_PROGRESS"
                    : "DRAFT",
                cap(v.branch),
              ],
              [
                act(
                  "Share my GPS",
                  () =>
                    new Promise<void>((resolve, reject) =>
                      navigator.geolocation.getCurrentPosition(
                        (p) =>
                          send("POST", `/ambulance/vehicles/${v.id}/position`, {
                            lat: p.coords.latitude,
                            lng: p.coords.longitude,
                          }).then(() => resolve(), reject),
                        () => reject(new Error("Location permission denied")),
                      ),
                    ),
                ),
              ],
            ),
          ),
          undefined,
          "Vehicles",
        ),
      ],
    };
  },
  // ---------------------------------------------------------------- branch admin
  async "branch-admin"() {
    const [an, docs, cms] = await Promise.all([
      api<Analytics>("/admin/analytics"),
      api<any[]>("/admin/cms/doctors"),
      cmsPanels(),
    ]);
    return {
      stats: [
        { label: E("Total patients"), value: n(an.patients) },
        { label: E("Appointments today"), value: n(an.appointmentsToday) },
        { label: E("Unpaid invoices"), value: n(an.unpaidInvoices) },
        {
          label: E("Revenue this month (LKR)"),
          value: Math.round(an.revenueMonth).toLocaleString("en-US"),
        },
      ],
      panels: [
        panel(
          "schedule",
          docs.map((x) =>
            row(
              [
                x.name,
                `${dn(x.dept_id)} · ${x.schedule_text ?? ""}`,
                x.is_active ? "ACTIVE" : "DRAFT",
                lkr(x.fee),
              ],
              [
                act(x.is_active ? "Deactivate" : "Activate", () =>
                  send("PUT", `/admin/cms/doctors/${x.id}`, {
                    is_active: !x.is_active,
                  }),
                ),
                act(
                  "Change fee",
                  (v) =>
                    send("PUT", `/admin/cms/doctors/${x.id}`, {
                      fee: num(v.fee),
                    }),
                  {
                    fields: [
                      {
                        key: "fee",
                        label: "Consultation fee (LKR)",
                        type: "number",
                        initial: String(x.fee),
                        required: true,
                      },
                    ],
                  },
                ),
              ],
            ),
          ),
        ),
        ...cms,
      ],
      chart: an.appointmentsPerDay.map((x) => x.count),
      donut: donutOf(an.topDepartments),
    };
  },
  // ---------------------------------------------------------------- super admin
  async "super-admin"() {
    const [an, audit, users, beds, cms] = await Promise.all([
      api<Analytics>("/admin/analytics"),
      api<any[]>("/admin/audit-logs?limit=40"),
      api<any[]>("/admin/users"),
      api<any[]>("/operations/beds"),
      cmsPanels(),
    ]);
    return {
      stats: [
        { label: E("Total patients"), value: n(an.patients) },
        { label: E("Appointments today"), value: n(an.appointmentsToday) },
        {
          label: E("Available beds"),
          value: n(beds.reduce((s, b) => s + b.available, 0)),
        },
        {
          label: E("Revenue this month (LKR)"),
          value: Math.round(an.revenueMonth).toLocaleString("en-US"),
        },
      ],
      panels: [
        panel(
          "audit",
          audit.map((a) =>
            row([
              a.user || "system",
              `${a.action}${a.entity ? ` · ${a.entity}` : ""}${a.entityId ? ` ${a.entityId}` : ""}`,
              "COMPLETED",
              tm(a.date),
            ]),
          ),
        ),
        panel(
          "content",
          users
            .slice(0, 80)
            .map((u) =>
              row(
                [
                  u.name,
                  `${u.role}${u.branchId ? ` · ${u.branchId}` : ""} · ${u.email}`,
                  u.isActive ? "ACTIVE" : "DRAFT",
                  d(u.created_at),
                ],
                [
                  act(
                    u.isActive ? "Deactivate" : "Activate",
                    () =>
                      send("PATCH", `/admin/users/${u.id}`, {
                        isActive: !u.isActive,
                      }),
                    u.isActive
                      ? { tone: "danger", confirm: `Deactivate ${u.name}?` }
                      : {},
                  ),
                  act(
                    "Change role",
                    (v) =>
                      send("PATCH", `/admin/users/${u.id}`, { role: v.role }),
                    {
                      fields: [
                        {
                          key: "role",
                          label: "Role",
                          type: "select",
                          options: opt(
                            "patient",
                            "doctor",
                            "nurse",
                            "reception",
                            "pharmacy",
                            "laboratory",
                            "hr",
                            "finance",
                            "ambulance",
                            "branch-admin",
                            "super-admin",
                          ),
                          initial: u.role,
                        },
                      ],
                    },
                  ),
                ],
              ),
            ),
        ),
        ...cms,
      ],
      chart: an.appointmentsPerDay.map((x) => x.count),
      donut: donutOf(an.topDepartments),
    };
  },
};

export const hasLoader = (slug: string) => slug in LOADERS;
export const loadPortal = (slug: string): Promise<LivePortal> =>
  LOADERS[slug]();
