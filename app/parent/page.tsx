"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AGE_BANDS, type Locale } from "@/src/domain/family";
import { loadFamily, type StoredFamily } from "@/src/domain/family-storage";

const DEMO_CHILDREN = [
  { id: "adam", nameFr: "Adam", nameEn: "Adam", ageFr: "10 ans", ageEn: "10 years old", progress: 72, barClass: "", noteFr: "Bonne semaine · fractions à revoir", noteEn: "Good week · review fractions" },
  { id: "sara", nameFr: "Sara", nameEn: "Sara", ageFr: "14 ans", ageEn: "14 years old", progress: 61, barClass: "amber", noteFr: "Projet science en cours", noteEn: "Science project in progress" },
] as const;

const DEMO_TASKS = [
  { id: "t1", childId: "adam", href: "/parent/cours/fractions", titleFr: "Valider le cours de fractions", titleEn: "Review the fractions lesson", metaFr: "Généré pour Adam · 25 min", metaEn: "Generated for Adam · 25 min", tagFr: "À valider", tagEn: "To review" },
  { id: "t2", childId: "sara", href: "/parent/cours/lettres-arabes", titleFr: "Assigner l’alphabet arabe", titleEn: "Assign the Arabic alphabet", metaFr: "Sara · Lecture et écriture", metaEn: "Sara · Reading and writing", tagFr: "Cette semaine", tagEn: "This week" },
  { id: "t3", childId: "adam", href: "/parent/cours/english-speaking", titleFr: "Assigner l’anglais oral", titleEn: "Assign spoken English", metaFr: "Adam · Conversation", metaEn: "Adam · Conversation", tagFr: "À faire", tagEn: "To do" },
] as const;

const copy = {
  fr: {
    nav: [["⌂", "Accueil", "/parent"], ["☷", "Plan de la semaine", "/parent/plan"], ["▣", "Cours", "/parent/cours"], ["✦", "Assistant IA", "/parent/generation"], ["◌", "Communauté", "#"], ["▤", "Portfolio", "#"], ["◫", "Parcours Québec", "/parent/parcours-quebec"], ["$", "Budget", "#"]],
    sideLabel: "Famille",
    sidebarBottom: <>Votre espace reste privé.<br />Les contenus générés par l’IA nécessitent votre validation.</>,
    eyebrowWeek: "Espace parent · semaine du 7 septembre",
    greetingDemo: "Bonjour, Amine", greetingReal: "Bonjour !",
    heroDemo: { eyebrow: "Votre prochain geste", title: "Préparer le projet d’apprentissage.", text: "Il reste 3 éléments à vérifier avant de générer votre brouillon pour le parcours Québec.", cta: "Continuer", href: "#" },
    heroReal: { eyebrow: "Bienvenue", title: "Votre famille est prête à commencer.", text: (name: string) => `Assignez un premier cours à ${name} pour lancer votre semaine.`, cta: "Découvrir les cours", href: "/parent/cours" },
    metricsLabels: { progress: "Progression familiale", tasks: "Tâches à valider", deadline: "Prochaine échéance" },
    metricsDemo: { progressValue: "68%", progressFoot: "+8% cette semaine", tasksValue: "4", tasksFoot: "2 contenus IA en attente", deadlineValue: "30 sept.", deadlineFoot: "Projet d’apprentissage" },
    metricsReal: { progressValue: "0%", progressFoot: "Aucune activité pour l’instant", tasksValue: "0", tasksFoot: "Aucun contenu IA en attente", deadlineValue: "—", deadlineFoot: "À définir dans le parcours Québec" },
    alertDemo: "2 contenus IA générés attendent votre validation.", alertDemoCta: "Voir les cours", alertReal: "Aucune alerte pour le moment. Vous êtes à jour !",
    filterLabel: "Filtrer par enfant", filterAll: "Tous les enfants",
    tasksHeading: "Prochaines actions", tasksSub: "Ce qui aide votre famille à avancer aujourd’hui.",
    open: "Ouvrir", emptyTasksReal: "Aucune tâche pour l’instant.", assignCourse: "Assignez un cours", emptyTasksFiltered: "Aucune tâche pour cet enfant.",
    childrenHeading: "État des enfants", childrenSub: "Une vue courte, sans diagnostic.", noProgress: "Pas encore de progression",
    family: (name: string) => `Famille ${name}`,
  },
  en: {
    nav: [["⌂", "Home", "/parent"], ["☷", "Weekly plan", "/parent/plan"], ["▣", "Courses", "/parent/cours"], ["✦", "AI Assistant", "/parent/generation"], ["◌", "Community", "#"], ["▤", "Portfolio", "#"], ["◫", "Quebec pathway", "/parent/parcours-quebec"], ["$", "Budget", "#"]],
    sideLabel: "Family",
    sidebarBottom: <>Your space stays private.<br />AI-generated content requires your validation.</>,
    eyebrowWeek: "Parent space · week of September 7",
    greetingDemo: "Hello, Amine", greetingReal: "Hello!",
    heroDemo: { eyebrow: "Your next step", title: "Prepare the learning project.", text: "3 items are left to review before generating your Quebec pathway draft.", cta: "Continue", href: "#" },
    heroReal: { eyebrow: "Welcome", title: "Your family is ready to start.", text: (name: string) => `Assign a first course to ${name} to kick off your week.`, cta: "Discover courses", href: "/parent/cours" },
    metricsLabels: { progress: "Family progress", tasks: "Tasks to review", deadline: "Next deadline" },
    metricsDemo: { progressValue: "68%", progressFoot: "+8% this week", tasksValue: "4", tasksFoot: "2 AI pieces pending", deadlineValue: "Sep 30", deadlineFoot: "Learning project" },
    metricsReal: { progressValue: "0%", progressFoot: "No activity yet", tasksValue: "0", tasksFoot: "No AI content pending", deadlineValue: "—", deadlineFoot: "To set in the Quebec pathway" },
    alertDemo: "2 AI-generated pieces of content are waiting for your review.", alertDemoCta: "View courses", alertReal: "No alerts right now. You're all caught up!",
    filterLabel: "Filter by child", filterAll: "All children",
    tasksHeading: "Next actions", tasksSub: "What helps your family move forward today.",
    open: "Open", emptyTasksReal: "No task yet.", assignCourse: "Assign a course", emptyTasksFiltered: "No task for this child.",
    childrenHeading: "Children status", childrenSub: "A short view, without diagnosis.", noProgress: "No progress yet",
    family: (name: string) => `The ${name} family`,
  },
} as const;

function ageBandLabel(ageBand: string, locale: Locale) {
  const band = AGE_BANDS.find((item) => item.id === ageBand);
  return band ? (locale === "fr" ? band.labelFr : band.labelEn) : ageBand;
}

function familyInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const letters = words.length > 1 ? [words[0][0], words[1][0]] : [name[0], name[1] ?? ""];
  return letters.join("").toUpperCase() || "FM";
}

export default function ParentPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [family, setFamily] = useState<StoredFamily | null | undefined>(undefined);
  const [filter, setFilter] = useState<string>("all");
  useEffect(() => { setFamily(loadFamily()); }, []);

  const t = copy[locale];
  const familyLabel = t.family(family ? family.name : "Ghorbel");

  const childOptions = useMemo(() => family ? family.children.map((child) => ({ id: child.id, label: child.displayName })) : DEMO_CHILDREN.map((child) => ({ id: child.id, label: locale === "fr" ? child.nameFr : child.nameEn })), [family, locale]);
  const visibleDemoTasks = useMemo(() => DEMO_TASKS.filter((task) => filter === "all" || task.childId === filter), [filter]);
  const visibleRealChildren = useMemo(() => family ? family.children.filter((child) => filter === "all" || child.id === filter) : [], [family, filter]);
  const visibleDemoChildren = useMemo(() => DEMO_CHILDREN.filter((child) => filter === "all" || child.id === filter), [filter]);

  return <main className="app-shell">
    <aside className="sidebar">
      <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
      <div className="side-label">{t.sideLabel}</div>
      {t.nav.map(([icon, label, href], index) => <Link key={label} className={`side-link ${index === 0 ? "active" : ""}`} href={href}><span>{icon}</span><span>{label}</span></Link>)}
      <div className="sidebar-bottom">{t.sidebarBottom}</div>
    </aside>

    <section className="workspace">
      <div className="workspace-top">
        <div><div className="eyebrow">{t.eyebrowWeek}</div><h1>{family ? t.greetingReal : t.greetingDemo}</h1></div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="real-language-switch" aria-label={locale === "fr" ? "Choisir la langue" : "Choose language"}>
            <button className={locale === "fr" ? "active" : ""} onClick={() => setLocale("fr")} aria-pressed={locale === "fr"}>FR</button>
            <button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")} aria-pressed={locale === "en"}>EN</button>
          </div>
          <div className="profile"><span className="avatar">{family ? familyInitials(family.name) : "AG"}</span><span>{familyLabel}⌄</span></div>
        </div>
      </div>

      {family
        ? <section className="dash-hero"><div><div className="eyebrow" style={{ color: "#a9d8b9" }}>{t.heroReal.eyebrow}</div><h2>{t.heroReal.title}</h2><p>{t.heroReal.text(family.children[0]?.displayName ?? "")}</p></div><Link className="button" href={t.heroReal.href}>{t.heroReal.cta}</Link></section>
        : <section className="dash-hero"><div><div className="eyebrow" style={{ color: "#a9d8b9" }}>{t.heroDemo.eyebrow}</div><h2>{t.heroDemo.title}</h2><p>{t.heroDemo.text}</p></div><Link className="button" href={t.heroDemo.href}>{t.heroDemo.cta}</Link></section>}

      <div className="metrics">
        <div className="metric-card"><div className="metric-label">{t.metricsLabels.progress}</div><div className="metric-value">{family ? t.metricsReal.progressValue : t.metricsDemo.progressValue}</div><div className="metric-foot">{family ? t.metricsReal.progressFoot : t.metricsDemo.progressFoot}</div></div>
        <div className="metric-card"><div className="metric-label">{t.metricsLabels.tasks}</div><div className="metric-value">{family ? t.metricsReal.tasksValue : t.metricsDemo.tasksValue}</div><div className="metric-foot">{family ? t.metricsReal.tasksFoot : t.metricsDemo.tasksFoot}</div></div>
        <div className="metric-card"><div className="metric-label">{t.metricsLabels.deadline}</div><div className="metric-value">{family ? t.metricsReal.deadlineValue : t.metricsDemo.deadlineValue}</div><div className="metric-foot">{family ? t.metricsReal.deadlineFoot : t.metricsDemo.deadlineFoot}</div></div>
      </div>

      <div className={`alert-banner ${family ? "ok" : "warn"}`}>
        <span>{family ? "✓" : "⚠"}</span>
        <p>{family ? t.alertReal : t.alertDemo}</p>
        {!family && <Link href="/parent/cours" className="alert-cta">{t.alertDemoCta}</Link>}
      </div>

      {childOptions.length > 0 && <div className="child-picker">
        <span>{t.filterLabel}</span>
        <div>
          <button className={filter === "all" ? "selected" : ""} onClick={() => setFilter("all")}><b>◎</b><strong>{t.filterAll}</strong></button>
          {childOptions.map((child) => <button key={child.id} className={filter === child.id ? "selected" : ""} onClick={() => setFilter(child.id)}><b>{child.label.slice(0, 1)}</b><strong>{child.label}</strong></button>)}
        </div>
      </div>}

      <div className="dashboard-grid">
        <section className="panel-card">
          <h3>{t.tasksHeading}</h3><p>{t.tasksSub}</p>
          {family
            ? <p className="onboarding-empty">{t.emptyTasksReal} <Link href="/parent/cours">{t.assignCourse}</Link></p>
            : visibleDemoTasks.length === 0
              ? <p className="onboarding-empty">{t.emptyTasksFiltered}</p>
              : visibleDemoTasks.map((task) => <div className="task-row" key={task.id}><div><div className="task-title">{locale === "fr" ? task.titleFr : task.titleEn}</div><div className="task-meta">{locale === "fr" ? task.metaFr : task.metaEn}</div></div><span className="tag">{locale === "fr" ? task.tagFr : task.tagEn}</span><Link href={task.href} className="course-open">{t.open} ›</Link></div>)}
        </section>

        <section className="panel-card">
          <h3>{t.childrenHeading}</h3><p>{t.childrenSub}</p>
          {family
            ? visibleRealChildren.map((child) => <div className="task-row" key={child.id}><div><div className="task-title">{child.displayName} · {ageBandLabel(child.ageBand, locale)}</div><div className="bar"><span style={{ width: "0%" }} /></div><div className="task-meta">{t.noProgress}</div></div><span>0%</span></div>)
            : visibleDemoChildren.map((child) => <div className="task-row" key={child.id}><div><div className="task-title">{locale === "fr" ? child.nameFr : child.nameEn} · {locale === "fr" ? child.ageFr : child.ageEn}</div><div className={`bar ${child.barClass}`}><span style={{ width: `${child.progress}%` }} /></div><div className="task-meta">{locale === "fr" ? child.noteFr : child.noteEn}</div></div><span>{child.progress}%</span></div>)}
        </section>
      </div>
    </section>
  </main>;
}
