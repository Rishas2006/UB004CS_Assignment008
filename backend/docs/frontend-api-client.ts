// Copy to the Next.js project as lib/api.ts. NEXT_PUBLIC_API_URL = /api/v1 on Vercel (proxied) or http://localhost:4000/api/v1 locally.
// Keeps the access token in memory (not localStorage) and silently refreshes it with the httpOnly cookie.
declare const process: { env: { NEXT_PUBLIC_API_URL?: string } };
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
let accessToken: string | null = null;
export const setToken = (t: string | null) => { accessToken = t; };

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: { field: string; message: string }[]) { super(message); }
}

async function raw(path: string, init: RequestInit = {}) {
  return fetch(`${BASE}${path}`, {
    ...init, credentials: "include",
    headers: { "Content-Type": "application/json", ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...(init.headers || {}) },
  });
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  let res = await raw(path, init);
  if (res.status === 401 && !path.startsWith("/auth/")) {          // access token expired -> refresh once
    const r = await raw("/auth/refresh", { method: "POST", body: "{}" });
    if (r.ok) { setToken((await r.json()).accessToken); res = await raw(path, init); }
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body?.error?.code || "error", body?.error?.message || "Request failed", body?.error?.details);
  return body as T;
}
export const post = <T,>(p: string, data: unknown) => api<T>(p, { method: "POST", body: JSON.stringify(data) });

// Example usage inside the booking wizard (replace the fake confirm()):
//   const appt = await post<{ ref: string }>("/appointments", { doctorId, date, time, type, reason, name, phone });
//   setDone(appt.ref);
// Live slots instead of isBooked():
//   const { slots } = await api<{ slots: { time: string; available: boolean }[] }>(`/doctors/${id}/slots?date=${date}`);
// Live queue board: poll GET /queue/:branch every few seconds (Vercel functions cannot hold WebSocket connections).
