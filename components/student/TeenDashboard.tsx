"use client";

import Link from "next/link";
import { useState } from "react";
import { localizeCourses } from "@/src/domain/course-catalog";

type Locale = "fr" | "en";

const tasks = [
  { id: "t1", courseId: "fractions", subjectFr: "Algèbre — fonctions", subjectEn: "Algebra — functions", detailFr: "Leçon 3 : exercices sur les fonctions linéaires", detailEn: "Lesson 3: linear function exercises", dueFr: "Échéance : aujourd’hui, 17 h 00", dueEn: "Due: today, 5:00 pm", urgent: true },
  { id: "t2", courseId: "lecture-francaise", subjectFr: "Français", subjectEn: "French", detailFr: "Rédaction : argumentation (brouillon)", detailEn: "Writing: argumentation (draft)", dueFr: "Échéance : aujourd’hui, 23 h 59", dueEn: "Due: today, 11:59 pm", urgent: true },
  { id: "t3", courseId: "ecosystems", subjectFr: "Sciences", subjectEn: "Science", detailFr: "Quiz : les réactions chimiques", detailEn: "Quiz: chemical reactions", dueFr: "Échéance : demain, 17 h 00", dueEn: "Due: tomorrow, 5:00 pm", urgent: false },
];

const pathSteps = [
  { fr: "Mathématiques — Les équations du 1er degré", en: "Mathematics — First-degree equations" },
  { fr: "Français — Figures de style", en: "French — Figures of speech" },
  { fr: "Sciences — La cellule et ses organites", en: "Science — The cell and its organelles" },
];

const week = [
  { fr: "LUN", en: "MON", day: 7 }, { fr: "MAR", en: "TUE", day: 8 }, { fr: "MER", en: "WED", day: 9 },
  { fr: "JEU", en: "THU", day: 10 }, { fr: "VEN", en: "FRI", day: 11 }, { fr: "SAM", en: "SAT", day: 12 }, { fr: "DIM", en: "SUN", day: 13 },
];

const copy = {
  fr: {
    hello: "Bonjour Yasmine", encourage: "Chaque petite étape t’approche de tes grandes réalisations.",
    nextGoal: "Ton prochain objectif", goalTitle: "Algèbre — fonctions", goalStep: "Termine la leçon 3 : fonctions linéaires", continue: "Continuer le cours",
    todo: "À faire aujourd’hui", tasksCount: "tâches", allTasks: "Voir toutes mes tâches", done: "Fait", markDone: "Marquer comme fait",
    progress: "Progression", detail: "Voir le détail", advanced: "Avancé", inProgress: "En cours",
    path: "Mon parcours", pathSeeAll: "Voir mon parcours", lastSteps: "Dernières étapes complétées", nextStep: "Prochaine étape",
    nextStepTitle: "Mathématiques — Systèmes d’équations", nextStepMeta: "0 / 3 leçons complétées",
    ask: "Pose une question sur ton cours", askBadge: "Assistant IA", askHelp: "Ton tuteur IA est là pour t’aider à mieux comprendre.",
    askPlaceholder: "Ex. : Peux-tu m’expliquer la différence entre une fonction linéaire et une fonction affine ?",
    askTip: "Pose une question claire pour obtenir de meilleures explications.", askSent: "Ton tuteur répond dans la leçon.",
    thisWeek: "Cette semaine", calendar: "Voir le calendrier", events: "événements", today: "Aujourd’hui, 9 septembre",
    achievement: "Réussite débloquée", achievementName: "Persévérante", achievementMeta: "7 jours consécutifs d’études", achievementCta: "Continue comme ça, Yasmine !",
    verse: "« Et dis : Mon Seigneur, augmente mes connaissances. »", verseRef: "(Sourate Tâ-Hâ, verset 114)", motto: "Planifie. Apprends. Progresse.",
  },
  en: {
    hello: "Hello Yasmine", encourage: "Every small step brings you closer to your big achievements.",
    nextGoal: "Your next goal", goalTitle: "Algebra — functions", goalStep: "Finish lesson 3: linear functions", continue: "Continue the course",
    todo: "To do today", tasksCount: "tasks", allTasks: "See all my tasks", done: "Done", markDone: "Mark as done",
    progress: "Progress", detail: "See details", advanced: "Advanced", inProgress: "In progress",
    path: "My pathway", pathSeeAll: "See my pathway", lastSteps: "Latest completed steps", nextStep: "Next step",
    nextStepTitle: "Mathematics — Systems of equations", nextStepMeta: "0 / 3 lessons completed",
    ask: "Ask a question about your course", askBadge: "AI assistant", askHelp: "Your AI tutor is here to help you understand better.",
    askPlaceholder: "E.g.: Can you explain the difference between a linear and an affine function?",
    askTip: "Ask a clear question to get better explanations.", askSent: "Your tutor answers inside the lesson.",
    thisWeek: "This week", calendar: "See the calendar", events: "events", today: "Today, September 9",
    achievement: "Achievement unlocked", achievementName: "Persistent", achievementMeta: "7 days of study in a row", achievementCta: "Keep it up, Yasmine!",
    verse: "“And say: My Lord, increase me in knowledge.”", verseRef: "(Surah Ta-Ha, verse 114)", motto: "Plan. Learn. Progress.",
  },
} as const;

export default function TeenDashboard({ locale }: { locale: Locale }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [sent, setSent] = useState(false);
  const t = copy[locale];
  const open = tasks.filter((task) => !completed.includes(task.id));

  return (
    <>
      <section className="teen-hero">
        <div className="teen-hero-left">
          <div className="teen-hero-mark">◎</div>
          <div><h2>{t.hello} <span>✦</span></h2><p>{t.encourage}</p></div>
        </div>
        <div className="teen-hero-goal">
          <span>{t.nextGoal}</span>
          <strong>{t.goalTitle}</strong>
          <small>{t.goalStep}</small>
          <div className="teen-goal-bar"><i style={{ width: "60%" }} /><b>60 %</b></div>
        </div>
        <Link className="teen-hero-cta" href="/student/cours/fractions">{t.continue} →</Link>
      </section>

      <div className="teen-grid">
        <section className="panel-card teen-card">
          <div className="teen-card-head"><strong>☑ {t.todo}</strong><span className="teen-pill">{open.length} {t.tasksCount}</span></div>
          {tasks.map((task) => {
            const isDone = completed.includes(task.id);
            return (
              <div className={`teen-task ${isDone ? "done" : ""}`} key={task.id}>
                <button className="teen-check" aria-label={t.markDone} aria-pressed={isDone} onClick={() => setCompleted((current) => current.includes(task.id) ? current.filter((id) => id !== task.id) : [...current, task.id])}>{isDone ? "✓" : ""}</button>
                <div>
                  <strong>{locale === "fr" ? task.subjectFr : task.subjectEn}</strong>
                  <small>{locale === "fr" ? task.detailFr : task.detailEn}</small>
                  <em className={task.urgent ? "urgent" : ""}>{isDone ? `✓ ${t.done}` : locale === "fr" ? task.dueFr : task.dueEn}</em>
                </div>
                <Link href={`/student/cours/${task.courseId}`} aria-label={locale === "fr" ? task.subjectFr : task.subjectEn}>›</Link>
              </div>
            );
          })}
          <Link className="teen-link" href="/student/cours">{t.allTasks}</Link>
        </section>

        <section className="panel-card teen-card">
          <div className="teen-card-head"><strong>📈 {t.progress}</strong><Link className="teen-link" href="/student/progression">{t.detail}</Link></div>
          {localizeCourses(locale).slice(0, 4).map((course) => (
            <div className="teen-progress" key={course.id}>
              <span className={`student-v2-subject-icon ${course.color}`}>{course.icon}</span>
              <div>
                <strong>{course.title}</strong>
                <div className="progress-bar"><i style={{ width: `${course.progress}%` }} /></div>
                <small className={course.progress >= 65 ? "advanced" : ""}>{course.progress >= 65 ? t.advanced : t.inProgress}</small>
              </div>
              <b>{course.progress} %</b>
            </div>
          ))}
        </section>

        <section className="panel-card teen-card">
          <div className="teen-card-head"><strong>🗺 {t.path}</strong><Link className="teen-link" href="/student/progression">{t.pathSeeAll}</Link></div>
          <p className="teen-subhead">{t.lastSteps}</p>
          {pathSteps.map((step) => <div className="teen-step" key={step.fr}><span>✓</span><p>{locale === "fr" ? step.fr : step.en}</p></div>)}
          <hr className="settings-rule" />
          <p className="teen-subhead">{t.nextStep}</p>
          <div className="teen-next"><span>★</span><div><strong>{t.nextStepTitle}</strong><small>{t.nextStepMeta}</small></div></div>
        </section>

        <section className="panel-card teen-card">
          <div className="teen-card-head"><strong>✦ {t.ask}</strong><span className="teen-pill">{t.askBadge}</span></div>
          <p className="teen-subhead">{t.askHelp}</p>
          <form className="teen-ask" onSubmit={(event) => { event.preventDefault(); if (!question.trim()) return; setSent(true); window.setTimeout(() => setSent(false), 2600); setQuestion(""); }}>
            <textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={t.askPlaceholder} aria-label={t.ask} />
            <button type="submit" aria-label={t.ask}>➤</button>
          </form>
          <small className="teen-tip">💡 {sent ? t.askSent : t.askTip}</small>
        </section>

        <section className="panel-card teen-card">
          <div className="teen-card-head"><strong>🗓 {t.thisWeek}</strong><Link className="teen-link" href="/student/live">{t.calendar}</Link></div>
          <div className="teen-week">
            {week.map((day, index) => (
              <div className={`teen-day ${index === 2 ? "active" : ""}`} key={day.day}><small>{locale === "fr" ? day.fr : day.en}</small><b>{day.day}</b></div>
            ))}
          </div>
          <div className="teen-card-head"><small>{t.today}</small><small>2 {t.events}</small></div>
          <div className="teen-event"><b>16 h 00</b><p>{locale === "fr" ? "Sciences — Classe collaborative" : "Science — Collaborative class"}</p><Link className="teen-pill live" href="/student/live">{locale === "fr" ? "En ligne" : "Online"}</Link></div>
          <div className="teen-event"><b>19 h 30</b><p>{locale === "fr" ? "Révision : quiz de maths" : "Review: math quiz"}</p><Link className="teen-pill" href="/student/jouer">{locale === "fr" ? "Étude" : "Study"}</Link></div>
        </section>

        <section className="panel-card teen-card teen-achievement">
          <strong>🏆 {t.achievement}</strong>
          <div className="teen-badge">★</div>
          <b>{t.achievementName}</b>
          <small>{t.achievementMeta}</small>
          <em>{t.achievementCta}</em>
        </section>
      </div>

      <footer className="teen-verse"><span>◈</span><p>{t.verse} <small>{t.verseRef}</small></p><b>{t.motto}</b></footer>
    </>
  );
}
