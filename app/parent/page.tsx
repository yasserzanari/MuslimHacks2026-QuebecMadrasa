"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Locale = "fr" | "en";

const copy = {
  fr: {
    nav: ["Accueil", "Plan de la semaine", "Cours", "Assistant IA", "Communauté", "Parcours Québec", "Budget"],
    family: "Famille",
    hello: "Bonjour, Amine",
    familyName: "Amine Benyoussef",
    next: "Prochaine priorité",
    nextTitle: "Finaliser le projet d’apprentissage.",
    nextText: "3 éléments doivent encore être vérifiés avant votre prochaine échéance Québec.",
    continue: "Continuer",
    metrics: ["Progression familiale", "À valider", "Échéance Québec"],
    metricFoot: ["cette semaine", "contenus IA en attente", "Projet d’apprentissage"],
    activity: "Activité récente",
    activityIntro: "Ce que vos enfants ont fait aujourd’hui.",
    live: "EN DIRECT",
    liveTitle: "Yasmine est en classe maintenant",
    liveText: "Fractions · compare 1/4 et 3/4 avec son groupe.",
    liveAction: "Voir la classe",
    minutes: "il y a",
    homework: "Derniers devoirs",
    done: "Terminé",
    hint: "Indice demandé",
    added: "Ajouté au plan",
    steps: "Prochaines étapes",
    stepsIntro: "Les actions les plus utiles pour avancer.",
    today: "Aujourd’hui",
    due: "À faire",
    review: "Vérifier",
    reserve: "Réserver",
    viewPlan: "Voir le plan",
    studentSpace: "Espace élève",
    private: "Votre espace reste privé.",
    aiReview: "Les contenus IA nécessitent votre validation.",
    soon: "bientôt",
    settings: "Paramètres",
    subtitle: "Voici ce qui se passe aujourd’hui avec votre famille.",
    helpTitle: "Besoin d’aide ?",
    helpText: "Notre équipe est là pour vous.",
    contact: "Nous contacter",
    adviceTitle: "Conseil du jour",
    adviceText: "Planifiez 15 minutes ce soir pour réviser ensemble ce qui a été appris aujourd’hui.",
    adviceLink: "Voir des conseils",
  },
  en: {
    nav: ["Home", "Weekly plan", "Courses", "AI assistant", "Community", "Québec path", "Budget"],
    family: "Family",
    hello: "Good morning, Amine",
    familyName: "Amine Benyoussef",
    next: "Next priority",
    nextTitle: "Finish the learning project.",
    nextText: "3 items still need review before your next Québec deadline.",
    continue: "Continue",
    metrics: ["Family progress", "To review", "Québec deadline"],
    metricFoot: ["this week", "AI drafts waiting", "Learning project"],
    activity: "Recent activity",
    activityIntro: "What your children did today.",
    live: "LIVE NOW",
    liveTitle: "Yasmine is in class now",
    liveText: "Fractions · comparing 1/4 and 3/4 with her group.",
    liveAction: "View class",
    minutes: "ago",
    homework: "Recent work",
    done: "Completed",
    hint: "Hint requested",
    added: "Added to plan",
    steps: "Next steps",
    stepsIntro: "The most useful actions to keep moving.",
    today: "Today",
    due: "To do",
    review: "Review",
    reserve: "Reserve",
    viewPlan: "View plan",
    studentSpace: "Student space",
    private: "Your family space stays private.",
    aiReview: "AI content always needs your review.",
    soon: "soon",
    settings: "Settings",
    subtitle: "Here is what is happening with your family today.",
    helpTitle: "Need help?",
    helpText: "Our team is here for you.",
    contact: "Contact us",
    adviceTitle: "Tip of the day",
    adviceText: "Plan 15 minutes tonight to review together what was learned today.",
    adviceLink: "View tips",
  },
} as const;

const routes = ["/parent", "/parent/plan", "/parent/cours", "/parent/assistant", "/parent/communaute", "/parent/parcours-quebec", "/parent/budget"];
const icons = ["⌂", "☷", "▣", "✦", "◌", "◫", "$"];

export default function ParentPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const t = copy[locale];

  useEffect(() => {
    const saved = window.localStorage.getItem("madrasa-locale");
    if (saved === "en" || saved === "fr") setLocale(saved);
    document.documentElement.lang = saved === "en" ? "en" : "fr";
  }, []);

  return (
    <main className="app-shell parent-dashboard">
      <aside className="sidebar">
        <Link className="brand" href="/">
          <img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" />
        </Link>
        <div className="side-label">{t.family}</div>
        {t.nav.map((label, index) => (
          <Link key={label} className={"side-link " + (index === 0 ? "active" : "")} href={routes[index]}>
            <span>{icons[index]}</span><span>{label}</span>
          </Link>
        ))}
        <Link className="side-link side-settings-link" href="/parent/settings"><span>⚙</span><span>{t.settings}</span></Link>
        <div className="sidebar-help"><div className="sidebar-help-mark">♥</div><div><strong>{t.helpTitle}</strong><p>{t.helpText}</p><a href="mailto:bonjour@madrasaquebec.ca">{t.contact} →</a></div></div>
        <div className="sidebar-bottom">{t.private}<br />{t.aiReview}</div>
      </aside>

      <section className="workspace">
        <div className="workspace-top parent-dashboard-top">
          <div><h1>{t.hello}</h1><p className="dashboard-subtitle">{t.subtitle}</p></div>
          <Link className="profile" href="/parent/settings" aria-label={t.settings}>
            <span className="avatar">A</span><span><strong>{t.familyName}</strong><small>{locale === "fr" ? "Profil parent" : "Parent profile"}</small></span><b aria-hidden="true">›</b>
          </Link>
        </div>

        <section className="dash-hero dash-hero-compact">
          <span className="priority-icon" aria-hidden="true">◎</span>
          <div><div className="eyebrow" style={{ color: "#ffd34f" }}>{t.next}</div><h2>{t.nextTitle}</h2><p>{t.nextText}</p></div>
          <Link className="button" href="/parent/parcours-quebec">{t.continue} <span aria-hidden="true">→</span></Link>
        </section>

        <div className="metrics metrics-compact">
          <Link href="/student" className="metric-card metric-card-link"><span className="metric-icon progress-icon">↗</span><div><div className="metric-label">{t.metrics[0]}</div><div className="metric-value">67%</div></div><div className="metric-progress"><i /></div></Link>
          <Link href="/parent/cours" className="metric-card metric-card-link"><span className="metric-icon review-icon">▣</span><div><div className="metric-label">{t.metrics[1]}</div><div className="metric-value">4</div></div><span className="metric-arrow">›</span></Link>
          <Link href="/parent/parcours-quebec" className="metric-card metric-card-link"><span className="metric-icon deadline-icon">□</span><div><div className="metric-label">{t.metrics[2]}</div><div className="metric-value">30 sept.</div></div><span className="metric-arrow">›</span></Link>
        </div>

        <div className="dashboard-grid dashboard-live-grid">
          <section className="panel-card activity-panel">
            <div className="panel-heading-row"><div className="panel-title"><span className="panel-title-icon">↯</span><div><h3>{t.activity}</h3><p>{t.activityIntro}</p></div></div><Link className="panel-link" href="/parent/plan">{t.viewPlan} →</Link></div>
            <Link className="live-child-card" href="/student/live/fractions">
              <span className="live-illustration" aria-hidden="true">▣</span><div><span className="live-label"><i className="live-pulse" aria-hidden="true" />{t.live}</span><strong>{t.liveTitle}</strong><p>{t.liveText}</p><span className="live-action">{t.liveAction} →</span></div><span className="live-card-arrow" aria-hidden="true">↗</span>
            </Link>
            <div className="activity-list">
              <Link className="activity-row" href="/student/cours/fractions"><span className="activity-avatar adam">A</span><span><strong>Adam a terminé « Fractions »</strong><small>Mathématiques · 25 min · {t.minutes} 12 min</small></span><b className="activity-status done">✓</b></Link>
              <Link className="activity-row" href="/student/cours/fractions"><span className="activity-avatar sara">S</span><span><strong>Sara a demandé un indice</strong><small>Sciences et technologie · {t.minutes} 28 min</small></span><b className="activity-status">▣</b></Link>
              <Link className="activity-row" href="/parent/plan"><span className="activity-avatar plan">Y</span><span><strong>Leçon de français ajoutée au plan</strong><small>Pour Adam · demain à 9 h</small></span><b className="activity-status">▤</b></Link>
            </div>
          </section>

          <section className="panel-card next-steps-panel">
            <div className="panel-heading-row"><div className="panel-title"><span className="panel-title-icon">⚑</span><div><h3>{t.steps}</h3><p>{t.stepsIntro}</p></div></div><Link className="panel-link" href="/student">{t.studentSpace} →</Link></div>
            <Link className="next-step-card primary-step" href="/student/cours/fractions"><span className="step-number">1</span><span className="step-icon step-icon-book">▤</span><span><small>{t.today} · Adam</small><strong>Terminer les fractions</strong><em>20 min · reprendre la leçon</em></span><b aria-hidden="true">→</b></Link>
            <Link className="next-step-card" href="/parent/communaute"><span className="step-number">2</span><span className="step-icon step-icon-lab">♧</span><span><small>Jeudi · Sara</small><strong>Rejoindre la classe de sciences</strong><em>16 h 30 · 6 places disponibles</em></span><b aria-hidden="true">→</b></Link>
            <Link className="next-step-card" href="/parent/parcours-quebec"><span className="step-number">3</span><span className="step-icon step-icon-check">▣</span><span><small>Avant le 30 septembre</small><strong>Vérifier le projet Québec</strong><em>3 éléments restants</em></span><b aria-hidden="true">→</b></Link>
          </section>
        </div>
        <section className="dashboard-advice"><span className="advice-icon">□</span><strong>{t.adviceTitle}</strong><p>{t.adviceText}</p><span className="advice-leaf" aria-hidden="true">❧</span><a href="/parent/plan">{t.adviceLink} →</a></section>
      </section>
    </main>
  );
}
