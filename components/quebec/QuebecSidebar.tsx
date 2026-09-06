"use client";

import Link from "next/link";

import type { QuebecDictionary } from "./quebec-dictionary";

const items = [
  ["⌂", "Accueil", "/parent"],
  ["▣", "Plan de la semaine", "/parent#plan"],
  ["▤", "Cours & ressources", "/parent/cours"],
  ["◫", "Parcours Québec", "/parent/parcours-quebec"],
  ["✦", "Assistant IA", "/parent/assistant"],
  ["♧", "Communauté", "/parent/communaute"],
  ["▱", "Portfolio", "/parent#portfolio"],
] as const;

/** Sidebar dédiée au module, alignée sur le thème DEM montré dans les références. */
export function QuebecSidebar({ dictionary }: { dictionary: QuebecDictionary }) {
  return <aside className="quebec-reference-sidebar">
    <Link className="quebec-reference-brand" href="/">
      <span className="quebec-brand-mark">⌂</span>
      <span><strong>Madrasa</strong><small>QUÉBEC NETWORK</small></span>
    </Link>
    <Link className="quebec-child-picker" href="/parent">
      <span className="quebec-child-avatar">A</span>
      <span><small>ENFANT SÉLECTIONNÉ</small><strong>Adam Benyoussef</strong><em>5e année · Primaire</em></span>
      <b>⌄</b>
    </Link>
    <nav className="quebec-reference-nav" aria-label={dictionary.sidebar.section}>
      {items.map(([icon, label, href]) => <Link key={label} href={href} className={label === "Parcours Québec" ? "active" : ""}><span>{icon}</span><strong>{label}</strong>{label === "Parcours Québec" ? <em>Actif</em> : null}</Link>)}
    </nav>
    <div className="quebec-reference-footer"><Link href="/parent/settings">⚙ Paramètres du compte</Link><small>Règles DEM v2026.1 <i /></small></div>
  </aside>;
}
