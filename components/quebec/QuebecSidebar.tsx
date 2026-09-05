"use client";

/**
 * Barre latérale parent.
 *
 * Duplique volontairement le gabarit de `app/parent/page.tsx` : il n'existe pas
 * de `app/parent/layout.tsx`, et le périmètre de cette mission n'autorise dans
 * la page parent que le changement d'un seul href. Toute nouvelle entrée de
 * navigation doit donc être ajoutée aux deux endroits, jusqu'à ce qu'un gabarit
 * partagé soit extrait.
 */

import Link from "next/link";

import type { QuebecDictionary } from "./quebec-dictionary";

const links = [
  ["⌂", "Accueil", "/parent"],
  ["☷", "Plan de la semaine", "/parent/plan"],
  ["▣", "Cours", "/parent/cours"],
  ["✦", "Assistant IA", "#"],
  ["◌", "Communauté", "/parent/communaute"],
  ["▤", "Portfolio", "#"],
  ["◫", "Parcours Québec", "/parent/parcours-quebec"],
  ["$", "Budget / Services gratuits", "/parent/budget"],
];

const PARCOURS_INDEX = 6;

export function QuebecSidebar({ dictionary }: { dictionary: QuebecDictionary }) {
  return (
    <aside className="sidebar">
      <Link className="brand" href="/">
        <img
          className="sidebar-logo-image"
          src="/ui/logo-madrasa-quebec.png"
          alt={dictionary.sidebar.logoAlt}
        />
      </Link>
      <div className="side-label">{dictionary.sidebar.section}</div>
      {links.map(([icon, label, href], index) => {
        const isActive = index === PARCOURS_INDEX;
        return (
          <Link
            key={label}
            className={`side-link ${isActive ? "active" : ""}`}
            href={href}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </Link>
        );
      })}
      <div className="sidebar-bottom">{dictionary.sidebar.privacy}</div>
    </aside>
  );
}
