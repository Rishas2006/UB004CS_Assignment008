// NEXT_PUBLIC_API_URL: "/api/v1" on Vercel (proxied to the API by next.config.mjs) or http://localhost:4000/api/v1 for local development.
// Keeps the access token in memory (not localStorage) and silently refreshes it with the httpOnly cookie.
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
let accessToken: string | null = null;
export const setToken = (t: string | null) => {
  accessToken = t;
};

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: { field: string; message: string }[],
  ) {
    super(message);
  }
}

async function raw(path: string, init: RequestInit = {}) {
  return fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(init.headers || {}),
    },
  });
}

// --- FIX: Shared Refresh Promise - Parallel Request ku 1 Refresh ---
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const r = await raw("/auth/refresh", { method: "POST", body: "{}" });
      if (!r.ok) return false;
      const data = await r.json().catch(() => ({}));
      if (!data.accessToken) return false;
      setToken(data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      // Allow next refresh after a short delay to prevent bursts of refresh requests
      // wait 100ms before clearing the refreshPromise so that any other requests that come in during this time will wait for the same refreshPromise instead of starting a new one.
      setTimeout(() => {
        refreshPromise = null;
      }, 100);
    }
  })();

  return refreshPromise;
}

export async function api<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let res = await raw(path, init);
  if (res.status === 401 && !path.startsWith("/auth/")) {
    // access token expired -> refresh once (shared)
    const ok = await doRefresh();
    if (ok) {
      res = await raw(path, init);
    }
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new ApiError(
      res.status,
      body?.error?.code || "error",
      body?.error?.message || "Request failed",
      body?.error?.details,
    );
  return body as T;
}
export const post = <T>(p: string, data: unknown) =>
  api<T>(p, { method: "POST", body: JSON.stringify(data) });

// Example usage inside the booking wizard (replace the fake confirm()):
//   const appt = await post<{ ref: string }>("/appointments", { doctorId, date, time, type, reason, name, phone });
//   setDone(appt.ref);
// Live slots instead of isBooked():
//   const { slots } = await api<{ slots: { time: string; available: boolean }[] }>(`/doctors/${id}/slots?date=${date}`);
// Live queue / ambulance / pharmacy pages poll the API every few seconds (Vercel serverless functions cannot hold WebSocket connections).

let restoring: Promise<boolean> | null = null;
/** Restores the session from the httpOnly refresh cookie. Shared promise: safe to call from several components. */
export function restoreSession(): Promise<boolean> {
  restoring ??= (async () => {
    try {
      const ok = await doRefresh();
      return ok;
    } catch {
      return false;
    }
  })();
  return restoring;
}
export const forgetSession = () => {
  restoring = null;
  refreshPromise = null;
  setToken(null);
};

/** Downloads a protected file (for example a prescription PDF) and opens it in a new tab. */
export async function openPdf(path: string): Promise<void> {
  let res = await raw(path);
  if (res.status === 401) {
    const ok = await doRefresh();
    if (ok) res = await raw(path);
  }
  if (!res.ok)
    throw new ApiError(res.status, "error", "Could not download the file");
  window.open(URL.createObjectURL(await res.blob()), "_blank");
}
