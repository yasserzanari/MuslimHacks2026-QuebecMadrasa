"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export type ParentLocale = "fr" | "en";

export type ParentNavKey =
  | "home"
  | "plan"
  | "courses"
  | "assistant"
  | "community"
  | "portfolio"
  | "quebec"
  | "budget"
  | "settings";

const nav: { key: ParentNavKey; icon: string; href: string; fr: string; en: string }[] = [
  { key: "home", icon: "⌂", href: "/parent", fr: "Accueil", en: "Home" },
  { key: "plan", icon: "☷", href: "/parent/plan", fr: "Plan de la semaine", en: "Week plan" },
  { key: "courses", icon: "▣", href: "/parent/cours", fr: "Cours", en: "Courses" },
  { key: "assistant", icon: "✦", href: "/parent/assistant", fr: "Assistant IA", en: "AI assistant" },
  { key: "community", icon: "◌", href: "/parent/communaute", fr: "Communauté", en: "Community" },
  { key: "portfolio", icon: "▤", href: "/parent/portfolio", fr: "Portfolio", en: "Portfolio" },
  { key: "quebec", icon: "◫", href: "/parent/parcours-quebec", fr: "Parcours Québec", en: "Québec pathway" },
  { key: "budget", icon: "$", href: "/parent/budget", fr: "Budget et bourses", en: "Budget and aid" },
  { key: "settings", icon: "⚙", href: "/parent/settings", fr: "Paramètres et sécurité", en: "Settings and safety" },
];

export default function ParentShell({
  active,
  locale,
  onLocaleChange,
  eyebrow,
  title,
  shellClassName = "",
  children,
}: {
  active: ParentNavKey;
  locale: ParentLocale;
  onLocaleChange: (locale: ParentLocale) => void;
  eyebrow: string;
  title: string;
  shellClassName?: string;
  children: ReactNode;
}) {
  return (
    <main className={`app-shell ${shellClassName}`}>
      <aside className="sidebar">
        <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <div className="side-label">{locale === "fr" ? "Famille" : "Family"}</div>
        {nav.map((item) => (
          <Link key={item.key} className={`side-link ${item.key === active ? "active" : ""}`} href={item.href}>
            <span>{item.icon}</span><span>{locale === "fr" ? item.fr : item.en}</span>
          </Link>
        ))}
        <div className="sidebar-bottom">
          {locale === "fr" ? "Votre espace reste privé." : "Your space stays private."}<br />
          {locale === "fr" ? "Les contenus générés par l’IA nécessitent votre validation." : "AI-generated content needs your approval."}
        </div>
      </aside>
      <section className="workspace">
        <div className="workspace-top">
          <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div>
          <div className="workspace-top-tools">
            <button className="locale-switch" onClick={() => onLocaleChange(locale === "fr" ? "en" : "fr")} aria-label={locale === "fr" ? "Switch to English" : "Passer en français"}>
              {locale === "fr" ? "EN" : "FR"}
            </button>
            <div className="profile"><span className="avatar">AG</span><span>{locale === "fr" ? "Famille Ghorbel" : "Ghorbel family"}⌄</span></div>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
