"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { localizeCourses, type CourseCategory } from "@/src/domain/course-catalog";

type Locale = "fr" | "en";

const nav: [string, string, string, string][] = [
  ["⌂", "Accueil", "Home", "/parent"],
  ["☷", "Plan de la semaine", "Week plan", "/parent/plan"],
  ["▣", "Cours", "Courses", "/parent/cours"],
  ["✦", "Assistant IA", "AI assistant", "/parent/assistant"],
  ["◌", "Communauté", "Community", "/parent/communaute"],
  ["▤", "Portfolio", "Portfolio", "/parent/portfolio"],
  ["◫", "Parcours Québec", "Québec pathway", "/parent/parcours-quebec"],
  ["$", "Budget et bourses", "Budget and aid", "/parent/budget"],
  ["⚙", "Paramètres et sécurité", "Settings and safety", "/parent/settings"],
];
const children = [
  { id: "amine", name: "Amine", ageFr: "10 ans", ageEn: "age 10", avatar: "👦" },
  { id: "sara", name: "Sara", ageFr: "14 ans", ageEn: "age 14", avatar: "👧" },
];
const categories: CourseCategory[] = ["Mathematiques", "Francais", "Anglais", "Sciences", "Arabe", "Coran"];
const categoryLabels: Record<CourseCategory, { fr: string; en: string }> = {
  Mathematiques: { fr: "Mathématiques", en: "Mathematics" },
  Francais: { fr: "Français", en: "French" },
  Anglais: { fr: "Anglais", en: "English" },
  Sciences: { fr: "Sciences", en: "Science" },
  Arabe: { fr: "Arabe", en: "Arabic" },
  Coran: { fr: "Coran", en: "Quran" },
};

const copy = {
  fr: {
    family: "Famille", eyebrow: "Apprentissage intégral · Académique · Arabe · Coran", title: "Cours et ressources",
    lead: "Des cours de qualité alignés au curriculum du Québec, enrichis par l’apprentissage de l’arabe et du Coran.",
    pickChild: "Sélectionner un enfant", search: "Rechercher une leçon", subject: "Matière", all: "Toutes", reset: "Réinitialiser",
    level: "Niveau", objective: "Objectif", progress: "Progression", openLesson: "Voir la leçon", options: "Options",
    assignedTo: "Assigné à", toAssign: "À assigner cette semaine", suggestionsFor: "Suggestions personnalisées pour",
    assign: "Assigner", assigned: "Assigné", allSuggestions: "Voir toutes les suggestions", empty: "Aucun cours ne correspond à cette recherche.",
    principles: [
      ["⚜", "Aligné au curriculum du Québec (MEQ)", "Des contenus conformes aux attentes du MEQ."],
      ["▤", "Foi et savoir", "Arabe et Coran intégrés au quotidien."],
      ["♟", "Apprentissage à la maison", "Des ressources flexibles pour soutenir votre enseignement."],
    ],
  },
  en: {
    family: "Family", eyebrow: "Whole learning · Academic · Arabic · Quran", title: "Courses and resources",
    lead: "Quality courses aligned with the Québec curriculum, enriched by Arabic and Quran learning.",
    pickChild: "Select a child", search: "Search a lesson", subject: "Subject", all: "All", reset: "Reset",
    level: "Level", objective: "Objective", progress: "Progress", openLesson: "Open the lesson", options: "Options",
    assignedTo: "Assigned to", toAssign: "To assign this week", suggestionsFor: "Personalised suggestions for",
    assign: "Assign", assigned: "Assigned", allSuggestions: "See all suggestions", empty: "No course matches this search.",
    principles: [
      ["⚜", "Aligned with the Québec curriculum (MEQ)", "Content that follows the MEQ expectations."],
      ["▤", "Faith and knowledge", "Arabic and Quran woven into daily learning."],
      ["♟", "Learning at home", "Flexible resources to support your teaching."],
    ],
  },
} as const;

export default function CoursesPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [childId, setChildId] = useState("amine");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | CourseCategory>("all");
  const [assigned, setAssigned] = useState<string[]>([]);
  const t = copy[locale];
  const child = children.find((item) => item.id === childId) ?? children[0];
  const catalogue = useMemo(() => localizeCourses(locale), [locale]);
  const visibleCourses = useMemo(
    () => catalogue.filter((course) => (category === "all" || course.category === category) && `${course.title} ${course.objective}`.toLowerCase().includes(query.toLowerCase())),
    [catalogue, category, query],
  );

  async function assign(courseId: string) {
    await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, childId }) });
    setAssigned((current) => [...current, courseId]);
  }

  return (
    <main className="courses-shell">
      <aside className="sidebar">
        <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <div className="side-label">{t.family}</div>
        {nav.map(([icon, fr, en, href]) => (
          <Link key={href} className={`side-link ${href === "/parent/cours" ? "active" : ""}`} href={href}><span>{icon}</span><span>{locale === "fr" ? fr : en}</span></Link>
        ))}
        <div className="sidebar-bottom">{locale === "fr" ? "Votre espace reste privé." : "Your space stays private."}</div>
      </aside>

      <section className="courses-workspace">
        <header className="courses-header">
          <div>
            <div className="eyebrow">{t.eyebrow}</div>
            <h1>{t.title}</h1>
            <p>{t.lead}</p>
          </div>
          <div className="child-picker">
            <span>{t.pickChild}<button className="locale-switch" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>{locale === "fr" ? "EN" : "FR"}</button></span>
            <div>
              {children.map((item) => (
                <button key={item.id} className={item.id === childId ? "selected" : ""} onClick={() => setChildId(item.id)}>
                  <b>{item.avatar}</b><strong>{item.name}</strong><small>{locale === "fr" ? item.ageFr : item.ageEn}</small>{item.id === childId && <i>✓</i>}
                </button>
              ))}
            </div>
          </div>
        </header>

        <section className="course-toolbar">
          <div className="course-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} /></div>
          <label>{t.subject}
            <select value={category} onChange={(event) => setCategory(event.target.value as "all" | CourseCategory)}>
              <option value="all">{t.all}</option>
              {categories.map((item) => <option key={item} value={item}>{categoryLabels[item][locale]}</option>)}
            </select>
          </label>
          <button className="reset-button" onClick={() => { setQuery(""); setCategory("all"); }}>{t.reset} ↻</button>
        </section>

        <div className="courses-body">
          <section className="course-grid">
            {visibleCourses.length === 0 && <p className="assistant-empty">{t.empty}</p>}
            {visibleCourses.map((course) => (
              <article className="course-card" key={course.id}>
                <div className={`course-visual ${course.color}`}><span>{course.icon}</span></div>
                <div className="course-card-content">
                  <div className="course-card-top">
                    <span className={`course-tag ${course.color}`}>{categoryLabels[course.category][locale]}</span>
                    <button className="more-button" aria-label={`${t.options} ${course.title}`}>⋮</button>
                  </div>
                  <h2>{course.title}</h2>
                  <p className="course-level">{t.level} : {course.level}</p>
                  <p className="course-duration">◷ &nbsp;{course.duration}</p>
                  <strong className="objective-label">{t.objective}</strong>
                  <p className="course-objective">{course.objective}</p>
                  <div className="course-progress"><span>{t.progress}</span><div><i style={{ width: `${course.progress}%` }} /></div><b>{course.progress} %</b></div>
                  <div className="course-card-bottom">
                    <span className={`course-badge ${course.color}`}>{course.badge}</span>
                    <Link href={`/parent/cours/${course.id}`} className="course-open">{t.openLesson} &nbsp;›</Link>
                  </div>
                  {assigned.includes(course.id) && <div className="assigned-note">✓ {t.assignedTo} {child.name}</div>}
                </div>
              </article>
            ))}
          </section>

          <aside className="assign-panel">
            <div className="assign-panel-heading"><span>▣</span><div><h2>{t.toAssign}</h2><p>{t.suggestionsFor} {child.name}.</p></div></div>
            {catalogue.slice(0, 2).map((course) => (
              <div className="suggestion-card" key={course.id}>
                <div className={`suggestion-icon ${course.color}`}>{course.icon}</div>
                <span className={`course-tag ${course.color}`}>{categoryLabels[course.category][locale]}</span>
                <h3>{course.title}</h3>
                <p>{t.level} : {course.level}</p>
                <p>◷ &nbsp;{course.duration}</p>
                <strong>{t.objective}</strong>
                <p>{course.objective}</p>
                <button className="assign-button" onClick={() => assign(course.id)} disabled={assigned.includes(course.id)}>{assigned.includes(course.id) ? t.assigned : t.assign}</button>
                <Link href={`/parent/cours/${course.id}`} className="suggestion-open">{t.openLesson}</Link>
              </div>
            ))}
            <Link href="/parent/generation" className="all-suggestions">{t.allSuggestions} &nbsp;›</Link>
          </aside>
        </div>

        <div className="course-principles">
          {t.principles.map(([icon, title, detail]) => (
            <div key={title}>{icon} <strong>{title}</strong><span>{detail}</span></div>
          ))}
        </div>
      </section>
    </main>
  );
}
