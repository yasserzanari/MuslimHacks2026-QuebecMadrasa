import Link from "next/link";
import { ParentSidebar } from "@/app/parent/parent-sidebar";

const navigation = [
  ["⌂", "Accueil", "/parent"],
  ["▣", "Plan de la semaine", "#plan"],
  ["▤", "Cours", "/parent/cours"],
  ["✦", "Parcours Québec", "#quebec"],
  ["♧", "Communauté", "#communaute"],
  ["▱", "Portfolio", "#portfolio"],
  ["$", "Budget", "#budget"],
] as const;

const children = [
  { name: "Amine", age: "5e année", progress: 72, accent: "blue", avatar: "A", subjects: [["Français", true], ["Mathématiques", true], ["Univers social", false], ["Sciences", true]] },
  { name: "Sara", age: "3e année", progress: 58, accent: "lilac", avatar: "S", subjects: [["Français", true], ["Mathématiques", true], ["Univers social", false], ["Sciences", false]] },
] as const;

const actions = [
  { icon: "▤", title: "Finaliser le projet d'apprentissage", meta: "Amine — Le système solaire", cta: "Ouvrir", href: "#quebec", tone: "green" },
  { icon: "♢", title: "Assigner la leçon de fractions", meta: "Adam — Mathématiques", cta: "Assigner", href: "/parent/cours", tone: "green" },
  { icon: "♧", title: "Confirmer la séance du pod", meta: "Groupe 3e année — Samedi 9 h 00", cta: "Confirmer", href: "#communaute", tone: "green" },
] as const;

const activity = [
  ["▤", "Amine a soumis son texte d'opinion.", "Français — 5e année", "Aujourd'hui, 10 h 15", "green"],
  ["✓", "Sara a complété la leçon sur les solides.", "Mathématiques — 3e année", "Hier, 16 h 40", "solid"],
  ["♧", "Séance de pod non confirmée pour samedi.", "Groupe 3e année — 9 h 00", "Hier, 14 h 22", "green"],
  ["▱", "Nouveau document ajouté au portfolio d'Amine.", "Projet — Le système solaire", "Hier, 11 h 03", "green"],
] as const;

const calendar = [
  ["27", "muted"], ["28", "muted"], ["29", "muted"], ["30", "muted"], ["1", ""], ["2", ""], ["3", ""],
  ["4", ""], ["5", ""], ["6", ""], ["7", ""], ["8", ""], ["9", ""], ["10", ""],
  ["11", ""], ["12", ""], ["13", ""], ["14", ""], ["15", ""], ["16", "today"], ["17", ""],
  ["18", ""], ["19", ""], ["20", ""], ["21", ""], ["22", ""], ["23", ""], ["24", ""],
  ["25", ""], ["26", ""], ["27", ""], ["28", ""], ["29", ""], ["30", ""], ["31", ""],
] as const;

function ProgressRing({ value, accent }: { value: number; accent: "blue" | "lilac" }) {
  return <div className={`parent-progress-ring ${accent}`} style={{ background: `conic-gradient(var(--progress-color) ${value * 3.6}deg, rgba(255,255,255,.68) 0deg)` }}><div><strong>{value}%</strong><small>Complète</small></div></div>;
}

export default function ParentPage() {
  return <main className="parent-dashboard-shell">
    <ParentSidebar active="home" showChildPicker={false} />

    <section className="parent-dashboard-main">
      <header className="parent-dashboard-header">
        <div><span className="parent-overline">ESPACE PARENT · SEMAINE DU 12 MAI</span><h1>Tableau de bord parent</h1><p>Bonjour, Amine <span className="wave">👋</span></p><div className="parent-header-description">Accompagnez vos enfants dans un apprentissage aligné<br className="desktop-only" /> sur le parcours québécois, avec foi et confiance.</div></div>
        <div className="parent-header-actions"><Link href="/parent/onboarding" className="parent-help-button"><span>?</span><small>Aide</small></Link><div className="parent-header-avatar">A</div></div>
      </header>

      <section className="parent-feature-strip" aria-label="Résumé des espaces parent">
        <div><span className="feature-strip-icon">♧</span><div><strong>Parcours<br />Québec</strong><small>Compétences et contenus conformes au MEQ</small></div></div>
        <div><span className="feature-strip-icon">▤</span><div><strong>Apprentissage</strong><small>Leçons, projets et évaluations adaptés à chaque enfant</small></div></div>
        <div><span className="feature-strip-icon">♧</span><div><strong>Communauté</strong><small>Pods, événements et entraide entre familles</small></div></div>
        <div><span className="feature-strip-icon">▱</span><div><strong>Portfolio</strong><small>Suivez les progrès et conservez leurs réalisations</small></div></div>
      </section>

      <div className="parent-dashboard-columns">
        <div className="parent-dashboard-left">
          <section className="parent-section-block" aria-labelledby="progression-title"><div className="parent-section-heading"><h2 id="progression-title">Progression de la semaine</h2><Link href="#portfolio">Voir le détail <span>→</span></Link></div><div className="parent-child-list">{children.map((child) => <article className={`parent-child-card ${child.accent}`} key={child.name}><div className={`parent-avatar parent-avatar-${child.accent}`}>{child.avatar}</div><div className="parent-child-name"><strong>{child.name}</strong><small>{child.age}</small></div><ProgressRing value={child.progress} accent={child.accent} /><ul>{child.subjects.map(([subject, done]) => <li className={done ? "done" : "pending"} key={subject}><span>{done ? "✓" : "○"}</span>{subject}</li>)}</ul></article>)}</div></section>

          <section className="parent-panel parent-activity-panel" aria-labelledby="activity-title"><div className="parent-panel-heading"><h2 id="activity-title">Activité récente</h2><button aria-label="Filtrer l'activité">⋯</button></div><div className="parent-activity-list">{activity.map(([icon, title, meta, date, tone]) => <div className="parent-activity-row" key={title}><span className={`parent-activity-icon ${tone}`}>{icon}</span><div><strong>{title}</strong><small>{meta}</small></div><time>{date}</time></div>)}</div><Link className="parent-panel-link" href="#activite">Voir toute l'activité <span>→</span></Link></section>
        </div>

        <div className="parent-dashboard-right">
          <section className="parent-section-block" aria-labelledby="actions-title"><div className="parent-section-heading"><h2 id="actions-title">Prochaines actions</h2><span className="parent-count-badge">3</span></div><div className="parent-action-list">{actions.map((action) => <Link className="parent-action-row" href={action.href} key={action.title}><span className={`parent-action-icon ${action.tone}`}>{action.icon}</span><div><strong>{action.title}</strong><small>{action.meta}</small></div><span className="parent-action-cta">{action.cta}<b>›</b></span></Link>)}</div><div className="parent-deadline"><span className="parent-action-icon amber">!</span><div><strong>Échéance à vérifier</strong><small>Le projet d'apprentissage d'Amine arrive à échéance<br />Date limite : 23 mai 2025</small></div><Link href="#quebec">Voir les détails <b>›</b></Link></div></section>

          <section id="plan" className="parent-section-block parent-upcoming" aria-labelledby="upcoming-title"><div className="parent-section-heading"><h2 id="upcoming-title">Plan de la semaine</h2><Link href="#plan">Voir le calendrier <span>→</span></Link></div><div className="parent-upcoming-grid"><div className="parent-calendar"><div className="calendar-heading"><button aria-label="Mois précédent">‹</button><strong>Mai 2025</strong><button aria-label="Mois suivant">›</button></div><div className="calendar-week"><span>D</span><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span></div><div className="calendar-days">{calendar.map(([day, state], index) => <span className={state} key={`${day}-${index}`}>{day}</span>)}</div></div><div className="parent-event-list"><div className="parent-event"><span className="event-icon green">♧</span><div><strong>Séance de pod — 3e année</strong><small>Samedi 17 mai</small></div><time>9 h 00</time></div><div className="parent-event"><span className="event-icon blue">▤</span><div><strong>Sortie éducative — Musée de la civilisation</strong><small>Mardi 20 mai</small></div><time>10 h 00</time></div><div className="parent-event"><span className="event-icon blue">▣</span><div><strong>Remise : Projet d'apprentissage</strong><small>Vendredi 23 mai</small></div><time>23 h 59</time></div></div></div></section>
        </div>
      </div>
    </section>
  </main>;
}
