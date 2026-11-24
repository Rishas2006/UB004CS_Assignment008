"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Live data layer - LAZY LOADING
 *  - Open panna odane ONNUM fetch aagadhu!
 *  - Nee load('jobs') / load('canteen') nu kudutha mattum andha option mattum fetch aagum.
 *  - Fetch aana data cache aagum, thirumba click panna thirumba pogadhu.
 *  - Backend unreachable na, sample data from lib/data.ts kaamikku.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as S from "./data";
import { api, forgetSession, post, restoreSession } from "./api";

export type LiveData = {
  branches: typeof S.branches;
  departments: typeof S.departments;
  doctors: typeof S.doctors;
  services: typeof S.services;
  packages: typeof S.packages;
  labTests: typeof S.labTests;
  announcements: typeof S.announcements;
  promotions: typeof S.promotions;
  news: typeof S.news;
  faqs: typeof S.faqs;
  awards: typeof S.awards;
  reports: typeof S.reports;
  directors: typeof S.directors;
  policies: typeof S.policies;
  gallery: typeof S.gallery;
  jobs: typeof S.jobs;
  canteen: typeof S.canteen;
  reviews: typeof S.reviews;
  emergencyContacts: typeof S.emergencyContacts;
  wards: typeof S.wards;
  icuBeds: typeof S.icuBeds;
  parking: typeof S.parking;
  hours: typeof S.hours;
  rooms: typeof S.rooms;
};

const STATIC: LiveData = {
  branches: S.branches,
  departments: S.departments,
  doctors: S.doctors,
  services: S.services,
  packages: S.packages,
  labTests: S.labTests,
  announcements: S.announcements,
  promotions: S.promotions,
  news: S.news,
  faqs: S.faqs,
  awards: S.awards,
  reports: S.reports,
  directors: S.directors,
  policies: S.policies,
  gallery: S.gallery,
  jobs: S.jobs,
  canteen: S.canteen,
  reviews: S.reviews,
  emergencyContacts: S.emergencyContacts,
  wards: S.wards,
  icuBeds: S.icuBeds,
  parking: S.parking,
  hours: S.hours,
  rooms: S.rooms,
};

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
/** API row shape -> the shape the pages already use */
const SOURCES: Record<
  keyof LiveData,
  { path: string; map: (rows: any[]) => unknown }
> = {
  branches: { path: "/branches", map: (r) => r },
  departments: {
    path: "/departments",
    map: (r) =>
      r.map((x) => ({
        id: x.id,
        icon: x.icon,
        centre: !!x.isCentre,
        name: x.name,
        desc: x.description,
      })),
  },
  doctors: { path: "/doctors", map: (r) => r },
  services: {
    path: "/services",
    map: (r) =>
      r.map((x) => ({
        slug: x.slug,
        icon: x.icon,
        name: x.name,
        desc: x.description,
        points: x.points ?? [],
        hours: x.hours ?? undefined,
      })),
  },
  packages: {
    path: "/packages",
    map: (r) =>
      r.map((x) => ({
        id: x.id,
        icon: x.icon,
        price: x.price,
        discount: x.discount ?? 0,
        name: x.name,
        tests: x.tests ?? [],
      })),
  },
  labTests: {
    path: "/lab-tests",
    map: (r) =>
      r.map((x) => [x.code, x.name, x.category, x.price, x.turnaroundHours]),
  },
  announcements: { path: "/announcements", map: (r) => r },
  promotions: {
    path: "/promotions",
    map: (r) =>
      r.map((x) => ({
        id: x.id,
        until: x.until,
        title: x.title,
        desc: x.description,
      })),
  },
  news: {
    path: "/news",
    map: (r) =>
      r.map((x) => ({
        slug: x.slug,
        date: x.date,
        cat: x.category,
        title: x.title,
        body: x.body,
      })),
  },
  faqs: {
    path: "/faqs",
    map: (r) =>
      r.map((x) => ({ id: x.id, cat: x.category, q: x.question, a: x.answer })),
  },
  awards: {
    path: "/content/awards",
    map: (r) => r.map((x) => [x.year, x.title]),
  },
  reports: {
    path: "/content/reports",
    map: (r) => r.map((x) => [x.title, x.year, x.type]),
  },
  directors: {
    path: "/content/directors",
    map: (r) =>
      r.map((x) => ({ name: x.name, role: x.role, chair: !!x.chair })),
  },
  policies: {
    path: "/content/policies",
    map: (r) => r.map((x) => [x.title, x.desc, x.version]),
  },
  gallery: {
    path: "/content/gallery",
    map: (r) => r.map((x) => [x.label, x.src]),
  },
  jobs: {
    path: "/jobs",
    map: (r) =>
      r.map((x) => [
        x.title,
        x.department ?? "",
        cap(x.branchId ?? ""),
        x.closingDate ?? "",
      ]),
  },
  canteen: {
    path: "/content/canteen",
    map: (r) => r.map((x) => [x.name, x.cat, x.price]),
  },
  reviews: { path: "/reviews", map: (r) => r },
  emergencyContacts: {
    path: "/content/emergency-contacts",
    map: (r) => r.map((x) => [x.label, x.display, x.tel]),
  },
  wards: {
    path: "/operations/beds",
    map: (r) => r.map((x) => [x.name, x.occupied, x.total]),
  },
  icuBeds: {
    path: "/operations/icu-beds",
    map: (r) => r.map((s: string) => (s === "reserved" ? "maintenance" : s)),
  },
  parking: {
    path: "/parking",
    map: (r) => r.map((x) => [x.name, x.free, x.total]),
  },
  hours: {
    path: "/opening-hours",
    map: (r) => r.map((x) => [x.label, x.hours, !!x.is24x7]),
  },
  rooms: {
    path: "/rooms",
    map: (r) =>
      r.map((x) => ({
        id: x.id,
        name: x.name,
        price: x.price,
        desc: x.description,
      })),
  },
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  branchId?: string | null;
};
type Ctx = {
  data: LiveData;
  live: boolean;
  user: AuthUser | null;
  authReady: boolean;
  setUser: (u: AuthUser | null) => void;
  logout: () => Promise<void>;
  load: (...keys: (keyof LiveData)[]) => Promise<void>;
  loaded: Set<keyof LiveData>;
};
const LiveCtx = createContext<Ctx>({
  data: STATIC,
  live: false,
  user: null,
  authReady: false,
  setUser: () => {},
  logout: async () => {},
  load: async () => {},
  loaded: new Set(),
});

export function LiveProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<LiveData>(STATIC);
  const [live, setLive] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const loadedRef = useRef<Set<keyof LiveData>>(new Set());
  const loadingRef = useRef<Set<keyof LiveData>>(new Set());
  const [loadedTick, setLoadedTick] = useState(0);

  // ✅ Nee kudutha option mattum fetch aagum. Thumba click panna cache la irundhu varum.
  const load = useCallback(async (...keys: (keyof LiveData)[]) => {
    const toFetch = keys.filter(
      (k) => !loadedRef.current.has(k) && !loadingRef.current.has(k),
    );
    if (toFetch.length === 0) return;
    toFetch.forEach((k) => loadingRef.current.add(k));
    const results = await Promise.allSettled(
      toFetch.map((k) => api<any[]>(SOURCES[k].path)),
    );
    const next: Record<string, unknown> = {};
    let reached = false;
    results.forEach((r, i) => {
      const k = toFetch[i];
      loadingRef.current.delete(k);
      if (r.status === "fulfilled" && Array.isArray(r.value)) {
        reached = true;
        loadedRef.current.add(k);
        next[k] = SOURCES[k].map(r.value);
      }
    });
    if (Object.keys(next).length > 0) {
      setData((prev) => ({ ...prev, ...next }) as LiveData);
      setLoadedTick((t) => t + 1);
    }
    if (reached) setLive(true);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (await restoreSession()) {
        try {
          const r = await api<{ user: AuthUser }>("/auth/me");
          if (alive) setUser(r.user);
        } catch {
          /* not signed in */
        }
      }
      if (alive) setAuthReady(true);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await post("/auth/logout", {});
    } catch {
      /* ignore */
    }
    forgetSession();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      data,
      live,
      user,
      authReady,
      setUser,
      logout,
      load,
      loaded: loadedRef.current,
    }),
    [data, live, user, authReady, logout, load, loadedTick],
  );
  return <LiveCtx.Provider value={value}>{children}</LiveCtx.Provider>;
}

/** The lists (doctors, departments, news ...) - from the database when the backend is reachable. */
export const useLive = () => useContext(LiveCtx).data;
/** Nee kudutha option ah mattum fetch panna: const { load } = useLiveLoader(); load('jobs') */
export const useLiveLoader = () => {
  const c = useContext(LiveCtx);
  return { load: c.load, loaded: c.loaded, live: c.live };
};
/** Signed-in user and whether the data really comes from the backend. */
export const useSession = () => {
  const c = useContext(LiveCtx);
  return {
    live: c.live,
    user: c.user,
    authReady: c.authReady,
    setUser: c.setUser,
    logout: c.logout,
  };
};
