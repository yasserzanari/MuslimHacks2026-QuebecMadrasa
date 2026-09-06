"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import StudentNav from "@/components/student/StudentNav";
import { courses } from "@/src/domain/course-catalog";
import type { SkillProgress } from "@/src/domain/portfolio";

type Locale = "fr" | "en";

const copy = {
  fr: {
    kicker: "Espace élève", title: "Ma progression",
    lead: "Voici ce que tu as travaillé. Chaque barre montre où tu en es, pas une note.",
    subjects: "Mes matières", skills: "Mes compétences", evidence: "preuves", noEvidence: "Pas encore de preuve",
    lastWork: "Dernier travail", never: "Pas encore commencé",
    open: "Continuer", streak: "Jours d’affilée", done: "Cours terminés", started: "Cours commencés",
    loading: "Chargement…", error: "La progression n’a pas pu être chargée.", retry: "Réessayer",
    encourage: "Continue comme ça. Une petite étape chaque jour, c’est déjà beaucoup.",
    noNote: "Ici, aucune note et aucun classement. Seulement ton chemin.",
  },
  en: {
    kicker: "Student space", title: "My progress",
    lead: "Here is what you worked on. Each bar shows where you are, not a grade.",
    subjects: "My subjects", skills: "My skills", evidence: "evidence", noEvidence: "No evidence yet",
    lastWork: "Last worked on", never: "Not started yet",
    open: "Continue", streak: "Day streak", done: "Courses finished", started: "Courses started",
    loading: "Loading…", error: "Progress could not be loaded.", retry: "Try again",
    encourage: "Keep going. One small step a day is already a lot.",
    noNote: "No grades and no ranking here. Only your path.",
  },
} as const;

export default function StudentProgressPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [skills, setSkills] = useState<SkillProgress[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const t = copy[locale];

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/portfolio?childId=adam");
      if (!response.ok) throw new Error("load_failed");
      const data = await response.json();
      setSkills(data.skills ?? []);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const finished = courses.filter((course) => course.progress >= 100).length;
  const started = courses.filter((course) => course.progress > 0 && course.progress < 100).length;

  return (
    <main className="student-v2-shell min-h-screen bg-[#f3faf5]">
      <StudentNav active="progress" locale={locale} />
      <section className="student-v2-main">
        <header className="student-v2-top">
          <div><p className="student-v2-kicker">{t.kicker}</p><h1>{t.title}</h1></div>
          <button className="student-v2-locale" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>{locale === "fr" ? "EN" : "FR"}</button>
        </header>
        <p className="assistant-lead">{t.lead}</p>

        <div className="progress-stats">
          <div><b>7</b><span>{t.streak}</span></div>
          <div><b>{finished}</b><span>{t.done}</span></div>
          <div><b>{started}</b><span>{t.started}</span></div>
        </div>

        <section className="panel-card progress-panel">
          <span className="panel-kicker">{t.subjects}</span>
          {courses.map((course) => (
            <div className="progress-row" key={course.id}>
              <span className={`student-v2-subject-icon ${course.color}`}>{course.icon}</span>
              <div>
                <strong>{course.title}</strong>
                <div className="progress-bar"><i style={{ width: `${course.progress}%` }} /></div>
              </div>
              <b>{course.progress}%</b>
              <Link className="student-v2-link" href={`/student/cours/${course.id}`}>{t.open} →</Link>
            </div>
          ))}
        </section>

        <section className="panel-card progress-panel">
          <span className="panel-kicker">{t.skills}</span>
          {status === "loading" && <p className="assistant-empty">{t.loading}</p>}
          {status === "error" && <div role="alert"><p className="assistant-warning">{t.error}</p><button className="button" onClick={load}>{t.retry}</button></div>}
          {status === "ready" && skills.map((row) => (
            <div className="progress-skill" key={row.skill.id}>
              <div>
                <strong>{locale === "fr" ? row.skill.labelFr : row.skill.labelEn}</strong>
                <small>{locale === "fr" ? row.skill.subjectFr : row.skill.subjectEn} · {t.lastWork} : {row.lastAt ? new Date(row.lastAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA") : t.never}</small>
              </div>
              <b className={row.count === 0 ? "empty" : ""}>{row.count === 0 ? t.noEvidence : `${row.count} ${t.evidence}`}</b>
            </div>
          ))}
        </section>

        <p className="progress-note">🌱 {t.encourage} {t.noNote}</p>
      </section>
    </main>
  );
}
