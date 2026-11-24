// @ts-ignore Next.js processes global CSS imports at build time.
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Sinhala, Noto_Sans_Tamil } from "next/font/google";
import { LanguageProvider } from "../lib/i18n/provider";
import { MotionProvider } from "../components/Motion";
import { LiveProvider } from "../lib/live";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const sinhala = Noto_Sans_Sinhala({
  subsets: ["sinhala"],
  variable: "--font-sinhala",
  display: "swap",
});
const tamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-tamil",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RH Hospital | Your Health, Our Priority",
    template: "%s | RH Hospital",
  },
  description:
    "RH Hospital: expert doctors, 24/7 emergency care, online booking and AI help in English, Sinhala and Tamil.",
};
export const viewport: Viewport = {
  themeColor: "#1456C8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${sinhala.variable} ${tamil.variable}`}
    >
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-brand"
        >
          Skip to content
        </a>
        <LanguageProvider>
          <LiveProvider>
            <MotionProvider>{children}</MotionProvider>
          </LiveProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
