import type { Key } from "./i18n/dict";
import type { IconName } from "../components/Icon";

export type NavLink = { key: Key; href: string; icon: IconName };
export const navGroups: { key: Key; links: NavLink[] }[] = [
  {
    key: "grp.about",
    links: [
      { key: "nav.story", href: "/about", icon: "hospital" },
      { key: "nav.directors", href: "/directors", icon: "users" },
      { key: "nav.policies", href: "/policies", icon: "scroll" },
      { key: "nav.awards", href: "/awards", icon: "award" },
      { key: "nav.reports", href: "/reports", icon: "file" },
    ],
  },
  {
    key: "grp.care",
    links: [
      { key: "nav.findDoctor", href: "/doctors", icon: "stethoscope" },
      { key: "nav.departments", href: "/departments", icon: "heartpulse" },
      { key: "nav.services", href: "/services", icon: "shieldcheck" },
      { key: "nav.lab", href: "/laboratory", icon: "flask" },
      { key: "nav.emergency", href: "/emergency", icon: "siren" },
    ],
  },
  {
    key: "grp.book",
    links: [
      { key: "nav.book", href: "/appointments", icon: "calendar" },
      { key: "nav.video", href: "/video-consultation", icon: "video" },
      { key: "nav.packages", href: "/health-packages", icon: "sparkles" },
      { key: "nav.rooms", href: "/rooms", icon: "beddouble" },
      { key: "nav.pharmacy", href: "/pharmacy", icon: "pill" },
    ],
  },
  {
    key: "grp.visit",
    links: [
      { key: "nav.international", href: "/international", icon: "globe" },
      { key: "nav.ops", href: "/operations", icon: "bed" },
      { key: "nav.branches", href: "/branches", icon: "building" },
      { key: "nav.canteen", href: "/canteen", icon: "utensils" },
      { key: "nav.faq", href: "/faqs", icon: "message" },
    ],
  },
  {
    key: "grp.media",
    links: [
      { key: "nav.news", href: "/news", icon: "news" },
      { key: "nav.promotions", href: "/promotions", icon: "percent" },
      { key: "nav.gallery", href: "/gallery", icon: "image" },
      { key: "nav.reviews", href: "/reviews", icon: "star" },
    ],
  },
  {
    key: "grp.connect",
    links: [
      { key: "nav.contact", href: "/contact", icon: "phone" },
      { key: "nav.symptom", href: "/symptom-checker", icon: "bot" },
      { key: "nav.card", href: "/health-card", icon: "qr" },
      { key: "nav.ambulance", href: "/ambulance", icon: "ambulance" },
      { key: "nav.careers", href: "/careers", icon: "briefcase" },
    ],
  },
];
export const mainNav: { key: Key; href: string }[] = [
  { key: "nav.home", href: "/" },
  { key: "nav.findDoctor", href: "/doctors" },
  { key: "nav.services", href: "/services" },
  { key: "nav.packages", href: "/health-packages" },
  { key: "nav.international", href: "/international" },
  { key: "nav.about", href: "/about" },
];
