"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { getCourse, localizeCourse } from "@/src/domain/course-catalog";

type Locale = "fr" | "en";

const copy = {
  fr: {
    family: "Famille", home: "Accueil", courses: "Cours", plan: "Plan de la semaine", assistant: "Assistant IA",
    sidebarNote: "Les contenus générés par l’IA nécessitent la validation du parent.",
    back: "Retour aux cours", assignChild: "Assigner à un enfant", addToPlan: "Ajouter au plan",
    assignedToast: "Cours assigné à Amine.", plannedToast: "Ajouté au plan de la semaine.",
    objective: "Objectif pédagogique", currentProgress: "Progression actuelle d’Amine",
    path: "Parcours de la leçon", intro: "Introduction · 5 min", challenge: "Défi · 5 min", guided: "Activité guidée · 8 min",
    tutor: "Tuteur IA élève", tutorLead: "Il guidera le raisonnement, pas la réponse.", startQuestion: "Question de départ",
    studentView: "Voir la vue élève",
  },
  en: {
    family: "Family", home: "Home", courses: "Courses", plan: "Week plan", assistant: "AI assistant",
    sidebarNote: "AI-generated content needs the parent’s approval.",
    back: "Back to the courses", assignChild: "Assign to a child", addToPlan: "Add to the plan",
    assignedToast: "Course assigned to Amine.", plannedToast: "Added to the week plan.",
    objective: "Learning objective", currentProgress: "Amine’s current progress",
    path: "Lesson path", intro: "Introduction · 5 min", challenge: "Challenge · 5 min", guided: "Guided activity · 8 min",
    tutor: "Student AI tutor", tutorLead: "It guides the reasoning, not the answer.", startQuestion: "Opening question",
    studentView: "Open the student view",
  },
} as const;

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const [locale, setLocale] = useState<Locale>("fr");
  const [toast, setToast] = useState("");
  const base = getCourse(params.courseId);
  if (!base) notFound();
  const course = localizeCourse(base, locale);
  const t = copy[locale];

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2400); }

  return (
    <main className="courses-shell">
      <aside className="sidebar">
        <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <div className="side-label">{t.family}</div>
        <Link className="side-link" href="/parent"><span>⌂</span><span>{t.home}</span></Link>
        <Link className="side-link active" href="/parent/cours"><span>▣</span><span>{t.courses}</span></Link>
        <Link className="side-link" href="/parent/plan"><span>☷</span><span>{t.plan}</span></Link>
        <Link className="side-link" href="/parent/assistant"><span>✦</span><span>{t.assistant}</span></Link>
        <div className="sidebar-bottom">{t.sidebarNote}</div>
      </aside>

      <section className="courses-workspace detail-workspace">
        <div className="detail-topbar">
          <Link href="/parent/cours" className="back-link">‹ &nbsp; {t.back}</Link>
          <button className="locale-switch" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>{locale === "fr" ? "EN" : "FR"}</button>
        </div>

        <div className="detail-hero">
          <div className={`course-visual large ${course.color}`}><span>{course.icon}</span></div>
          <div>
            <span className={`course-tag ${course.color}`}>{course.aligned} · {course.badge}</span>
            <h1>{course.title}</h1>
            <p className="detail-level">{course.level} · {course.duration}</p>
            <p className="detail-description">{course.description}</p>
            <div className="detail-actions">
              <button className="detail-primary" onClick={() => flash(t.assignedToast)}>{t.assignChild}</button>
              <button className="detail-secondary" onClick={() => flash(t.plannedToast)}>{t.addToPlan}</button>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <section className="detail-panel">
            <div className="panel-kicker">{t.objective}</div>
            <h2>{course.objective}</h2>
            <div className="detail-progress">
              <div><span>{t.currentProgress}</span><b>{course.progress} %</b></div>
              <div className="bar"><i style={{ width: `${course.progress}%` }} /></div>
            </div>
          </section>
          <section className="detail-panel">
            <div className="panel-kicker">{t.path}</div>
            <ol>
              {course.modules.map((module, index) => (
                <li key={module}>
                  <span>{index + 1}</span>
                  <div><strong>{module}</strong><small>{index === 0 ? t.intro : index === course.modules.length - 1 ? t.challenge : t.guided}</small></div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="tutor-preview">
          <div className="tutor-avatar">✦</div>
          <div>
            <span className="panel-kicker">{t.tutor}</span>
            <h2>{t.tutorLead}</h2>
            <p>{t.startQuestion} : « {course.studentPrompt} »</p>
          </div>
          <Link href={`/student/cours/${course.id}`} className="course-open">{t.studentView} ›</Link>
        </section>
        {toast && <div className="toast" role="status">✓ {toast}</div>}
      </section>
    </main>
  );
}
