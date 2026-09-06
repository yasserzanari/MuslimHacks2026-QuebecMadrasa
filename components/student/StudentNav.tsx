"use client";

import Link from "next/link";

export type StudentNavKey = "today" | "courses" | "classes" | "play" | "progress";

const items: { key: StudentNavKey; icon: string; href: string; fr: string; en: string }[] = [
  { key: "today", icon: "⌂", href: "/student", fr: "Aujourd’hui", en: "Today" },
  { key: "courses", icon: "▣", href: "/student/cours", fr: "Mes cours", en: "My courses" },
  { key: "classes", icon: "◍", href: "/student/live", fr: "Mes classes", en: "My classes" },
  { key: "play", icon: "◈", href: "/student/jouer", fr: "Jouer et apprendre", en: "Play and learn" },
  { key: "progress", icon: "✦", href: "/student/progression", fr: "Ma progression", en: "My progress" },
];

export default function StudentNav({ active, locale }: { active: StudentNavKey; locale: "fr" | "en" }) {
  return (
    <aside className="student-v2-sidebar hidden lg:flex">
      <Link href="/" className="student-v2-logo"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
      <span className="student-v2-label">{locale === "fr" ? "Mon espace" : "My space"}</span>
      {items.map((item) => (
        <Link key={item.key} className={`student-v2-nav ${item.key === active ? "active" : ""}`} href={item.href}>
          {item.icon} <span>{locale === "fr" ? item.fr : item.en}</span>
        </Link>
      ))}
      <div className="student-v2-sidebar-help">
        {locale === "fr" ? "Besoin d’aide ?" : "Need help?"}<br />
        <small>{locale === "fr" ? "Ton tuteur t’aide à réfléchir." : "Your tutor helps you think."}</small>
      </div>
    </aside>
  );
}
