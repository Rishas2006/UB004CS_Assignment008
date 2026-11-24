"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { dict, type Key, type Lang, type L, type Tr } from "./dict";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  tr: (o: L | Tr | undefined) => string;
};
const LangCtx = createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => dict.en[k],
  tr: (o) => (o ? o.en : ""),
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    try {
      const s = localStorage.getItem("rh-lang");
      if (s === "en" || s === "si" || s === "ta") setLangState(s);
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem("rh-lang", l);
      document.cookie = `rh-lang=${l};path=/;max-age=31536000`;
    } catch {}
  }, []);
  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (k) => dict[lang][k] ?? dict.en[k],
      tr: (o) => (o ? (o as Tr)[lang] || o.en : ""),
    }),
    [lang, setLang],
  );
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}
export const useLang = () => useContext(LangCtx);
