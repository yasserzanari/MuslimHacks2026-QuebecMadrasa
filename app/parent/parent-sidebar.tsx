import Link from "next/link";

export type ParentSection = "home" | "plan" | "courses" | "assistant";

const items: Array<[string, string, string, ParentSection]> = [
  ["⌂", "Accueil", "/parent", "home"],
  ["▣", "Plan de la semaine", "/parent#plan", "plan"],
  ["▤", "Cours & ressources", "/parent/cours", "courses"],
  ["✦", "Assistant IA", "/parent/assistant", "assistant"],
];

export function ParentSidebar({ active, showChildPicker = true }: { active: ParentSection; showChildPicker?: boolean }) {
  return <aside className="parent-unified-sidebar">
    <Link className="parent-unified-brand" href="/"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec" /></Link>
    {showChildPicker && <div className="parent-unified-child"><span className="parent-unified-avatar">A</span><div><small>Enfant sélectionné</small><strong>Adam Benyoussef</strong><em>5e année · Primaire</em></div><span>⌄</span></div>}
    <nav className="parent-unified-nav" aria-label="Navigation parent">
      {items.map(([icon, label, href, section]) => <Link key={section} className={active === section ? "active" : ""} href={href}><span>{icon}</span>{label}</Link>)}
    </nav>
    <div className="parent-unified-profile"><div className="parent-unified-avatar small">A</div><div><strong>Amine</strong><small>Parent</small></div><span>›</span></div>
  </aside>;
}
