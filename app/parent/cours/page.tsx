"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { courses, type CourseCategory } from "@/src/domain/course-catalog";

const nav = [["⌂", "Accueil", "/parent"], ["☷", "Plan de la semaine", "/parent/plan"], ["▣", "Cours", "/parent/cours"], ["✦", "Assistant IA", "/parent/assistant"], ["◌", "Communauté", "/parent/communaute"], ["◫", "Parcours Québec", "/parent/parcours-quebec"], ["$", "Budget", "/parent/budget"]];
const children = [{ id: "amine", name: "Amine", age: "10 ans", avatar: "👦" }, { id: "sara", name: "Sara", age: "14 ans", avatar: "👧" }];
const categoryLabels: Record<string, string> = { Mathematiques: "Mathématiques", Francais: "Français", Anglais: "Anglais", Sciences: "Sciences", Arabe: "Arabe", Coran: "Coran" };

export default function CoursesPage() {
  const [childId, setChildId] = useState("amine");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"Toutes" | CourseCategory>("Toutes");
  const [assigned, setAssigned] = useState<string[]>([]);
  const child = children.find((item) => item.id === childId) ?? children[0];
  const visibleCourses = useMemo(() => courses.filter((course) => (category === "Toutes" || course.category === category) && `${course.title} ${course.objective}`.toLowerCase().includes(query.toLowerCase())), [category, query]);

  async function assign(courseId: string) {
    await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId, childId }) });
    setAssigned((current) => current.includes(courseId) ? current : [...current, courseId]);
  }

  return <main className="courses-shell courses-reference-shell">
    <aside className="sidebar courses-sidebar">
      <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
      <div className="side-label">Famille</div>
      <nav className="courses-nav">{nav.map(([icon, label, href]) => <Link key={label} className={`side-link ${label === "Cours" ? "active" : ""}`} href={href}><span>{icon}</span><span>{label === "Cours" ? "Cours & ressources" : label}</span>{label === "Cours" && <i aria-hidden="true" />}</Link>)}</nav>
      <Link className="side-link side-settings-link" href="/parent/settings"><span>⚙</span><span>Paramètres</span></Link>
      <div className="sidebar-help"><div className="sidebar-help-mark">♥</div><div><strong>Besoin d’aide ?</strong><p>Nos conseillers pédagogiques québécois sont à votre écoute.</p><a href="mailto:bonjour@madrasaquebec.ca">Nous contacter →</a></div></div>
    </aside>

    <section className="courses-workspace courses-reference-workspace">
      <header className="courses-header courses-reference-header">
        <div><div className="courses-kicker">Apprentissage intégral <b>•</b> Académique <b>•</b> Arabe <b>•</b> Coran</div><h1>Cours et ressources</h1><p>Des cours de qualité alignés au curriculum du Québec (MEQ), enrichis par l’apprentissage structuré de l’arabe et du Coran.</p></div>
        <div className="child-picker"><span>Sélectionner un enfant :</span><div>{children.map((item) => <button key={item.id} className={item.id === childId ? "selected" : ""} onClick={() => setChildId(item.id)}><b>{item.avatar}</b><strong>{item.name}</strong><small>({item.age})</small>{item.id === childId && <i>✓</i>}</button>)}<button className="add-child" aria-label="Ajouter ou gérer les profils">＋</button></div></div>
      </header>

      <div className="courses-reference-content">
        <section className="course-catalog-column">
          <div className="course-toolbar course-reference-toolbar"><div className="course-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher une leçon, un sujet ou une compétence..." aria-label="Rechercher une leçon" /></div><label>Matière :<select value={category} onChange={(event) => setCategory(event.target.value as "Toutes" | CourseCategory)}><option value="Toutes">Toutes les matières</option>{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button className="reset-button" onClick={() => { setQuery(""); setCategory("Toutes"); }}>Réinitialiser ↻</button></div>
          <div className="course-grid course-reference-grid">{visibleCourses.map((course) => <article className="course-card course-reference-card" key={course.id}><div className={`course-visual ${course.color}`}><span>{course.icon}</span></div><div className="course-card-content"><div className="course-card-top"><span className={`course-tag ${course.color}`}>{categoryLabels[course.category]}</span><button className="more-button" aria-label={`Options ${course.title}`}>⋮</button></div><h2>{course.title}</h2><p className="course-level">Niveau : {course.level}</p><p className="course-duration">◷ &nbsp;{course.duration}</p><strong className="objective-label">Objectif</strong><p className="course-objective">{course.objective}</p><div className="course-progress"><span>Progression</span><div><i style={{ width: `${course.progress}%` }} /></div><b>{course.progress}%</b></div><div className="course-card-bottom"><span className={`course-badge ${course.color}`}>{course.badge}</span><Link href={`/parent/cours/${course.id}`} className="course-open">Voir la leçon ›</Link></div>{assigned.includes(course.id) && <div className="assigned-note">✓ Assigné à {child.name}</div>}</div></article>)}</div>
        </section>

        <aside className="assign-panel assign-reference-panel"><div className="assign-panel-heading"><span>▣</span><div><h2>À assigner cette semaine</h2><p>Suggestions personnalisées pour <strong>{child.name}</strong>.</p></div></div><div className="weekly-load"><div><span>● &nbsp;Charge hebdomadaire</span><b>3 h 15 / 4 h</b></div><div className="weekly-load-bar"><i /></div><small>Rythme optimal recommandé respecté.</small></div>{courses.slice(0, 2).map((course, index) => <div className={`suggestion-card suggestion-reference-card ${index === 1 ? "compact-suggestion" : ""}`} key={course.id}><div className={`suggestion-icon ${course.color}`}>{course.icon}</div><span className={`course-tag ${course.color}`}>{categoryLabels[course.category]}</span><h3>{course.title}</h3><p>Niveau : {course.level}</p><p>◷ &nbsp;{course.duration}</p>{index === 0 && <><p className="tutor-advice"><strong>Conseil du tuteur :</strong> Consolider la simplification avant l’évaluation de vendredi.</p><button className="assign-button" onClick={() => assign(course.id)} disabled={assigned.includes(course.id)}>{assigned.includes(course.id) ? "Assigné" : "＋ Assigner au planning"}</button><Link href={`/parent/cours/${course.id}`} className="suggestion-open">Voir la leçon</Link></>}</div>)}<div className="meq-notice"><span>✓</span><div><strong>Conforme MEQ &amp; Valeurs familiales</strong><p>Chaque contenu académique répond aux exigences du ministère de l’Éducation du Québec pour l’enseignement à la maison.</p></div></div></aside>
      </div>
    </section>
  </main>;
}
