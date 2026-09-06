import Link from "next/link";

export type ParentSection = "home" | "plan" | "courses" | "assistant" | "community" | "quebec" | "budget" | "settings";

const items: Array<[string, string, string, ParentSection]> = [
  ["⌂", "Accueil", "/parent", "home"],
  ["☷", "Plan de la semaine", "/parent/plan", "plan"],
  ["▤", "Cours & ressources", "/parent/cours", "courses"],
  ["✦", "Assistant IA", "/parent/assistant", "assistant"],
  ["◌", "Communauté", "/parent/communaute", "community"],
  ["◫", "Parcours Québec", "/parent/parcours-quebec", "quebec"],
  ["$", "Budget / Services gratuits", "/parent/budget", "budget"],
];

export function ParentSidebar({ active, showChildPicker = true }: { active: ParentSection; showChildPicker?: boolean }) {
  return <aside className="sidebar courses-sidebar">
    <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
    <div className="side-label">Famille</div>
    <nav className="courses-nav" aria-label="Navigation parent">
      {items.map(([icon, label, href, section]) => <Link key={section} className={`side-link ${active === section ? "active" : ""}`} href={href}><span>{icon}</span><span>{label}</span>{active === section && <i aria-hidden="true" />}</Link>)}
    </nav>
    <Link className={`side-link side-settings-link ${active === "settings" ? "active" : ""}`} href="/parent/settings"><span>⚙</span><span>Paramètres</span></Link>
    <div className="sidebar-help"><div className="sidebar-help-mark">♥</div><div><strong>Besoin d’aide ?</strong><p>Nos conseillers pédagogiques québécois sont à votre écoute.</p><a href="mailto:bonjour@madrasaquebec.ca">Nous contacter →</a></div></div>
  </aside>;
}
