"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { getCourse } from "@/src/domain/course-catalog";

const copy = {
  fr: { back: "← Mes cours", goal: "Objectif du cours", activity: "Activité interactive", done: "✓ Terminé", inProgress: "En cours", try: "Essaie une idée avant de demander un indice.", reasoning: "Ton raisonnement", answerPlaceholder: "Écris ton idée ici…", check: "Vérifier mon raisonnement", saved: "Réponse enregistrée", hint: "Donner un indice", think: "Réfléchir", celebrate: "Célébrer", tutor: "Tuteur IA", tutorTitle: "Je t’aide à trouver", understood: "Objectif compris", ask: "Pose-moi une question", nextHint: "Indice suivant", example: "Exemple différent", compose: "Écris ou parle à ton tuteur…", note: "Je ne donne pas la réponse tout de suite : je t’aide à la trouver.", nextAction: "Avant de répondre, explique-moi ce que tu remarques." },
  en: { back: "← My courses", goal: "Course objective", activity: "Interactive activity", done: "✓ Completed", inProgress: "In progress", try: "Try an idea before asking for a hint.", reasoning: "Your reasoning", answerPlaceholder: "Write your idea here…", check: "Check my reasoning", saved: "Answer saved", hint: "Give me a hint", think: "Think", celebrate: "Celebrate", tutor: "AI tutor", tutorTitle: "I’ll help you find it", understood: "Goal understood", ask: "Ask me a question", nextHint: "Next hint", example: "Different example", compose: "Write or talk to your tutor…", note: "I won’t give the answer right away: I’ll help you find it.", nextAction: "Before answering, explain what you notice." },
} as const;

export default function StudentLessonPage() {
  const params = useParams<{ courseId: string }>();
  const course = getCourse(params.courseId) ?? getCourse("fractions")!;
  const isParentPreview = useSearchParams().get("preview") === "parent";
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [helpLevel, setHelpLevel] = useState("question");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [tutorMessage, setTutorMessage] = useState<string>(copy.fr.nextAction);
  const [complete, setComplete] = useState(false);
  const t = copy[locale];

  async function askTutor(nextLevel = helpLevel, studentMessage = message) {
    setHelpLevel(nextLevel);
    const response = await fetch("/api/student/tutor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: course.id, locale, helpLevel: nextLevel, studentAttempt: answer, message: studentMessage }) });
    const data = await response.json();
    setTutorMessage(data.message);
    setMessage("");
  }

  return (
    <main className="lesson-v2-shell">
      {isParentPreview && <div className="preview-banner" role="status">
        <span>👁</span>
        <p>{locale === "fr" ? "Aperçu parent · vous voyez exactement ce que verra votre enfant." : "Parent preview · you're seeing exactly what your child will see."}</p>
        <Link href={`/parent/cours/${course.id}`}>{locale === "fr" ? "Retour au cours ›" : "Back to course ›"}</Link>
      </div>}
      <header className="lesson-v2-header">
        <Link href="/student/cours" className="lesson-v2-back">{t.back}</Link>
        <div><span>{course.category}</span><strong>{course.title}</strong></div>
        <div className="lesson-v2-header-tools"><button className="lesson-v2-locale" onClick={() => { const next = locale === "fr" ? "en" : "fr"; setLocale(next); setTutorMessage(copy[next].nextAction); }}>{locale === "fr" ? "EN" : "FR"}</button><div className="lesson-v2-progress-label">{locale === "fr" ? "Question 3 sur 8" : "Question 3 of 8"}</div></div>
      </header>
      <div className="lesson-v2-layout">
        <section className="lesson-v2-work">
          <div className="lesson-v2-objective"><span>{t.goal}</span><strong>{course.objective}</strong></div>
          <div className={`lesson-v2-activity ${course.color}`}>
            <div className="lesson-v2-activity-top"><span>{t.activity}</span><b>{complete ? t.done : t.inProgress}</b></div>
            <h1>{course.studentPrompt}</h1><p>{course.description}</p>
            <div className="lesson-v2-visual"><span>{course.icon}</span><div><b>{course.title}</b><small>{t.try}</small></div></div>
            <label htmlFor="student-answer">{t.reasoning}</label>
            <textarea id="student-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={t.answerPlaceholder} />
            <div className="lesson-v2-actions"><button className="lesson-v2-primary" onClick={() => setComplete(true)}>{complete ? t.saved : t.check}</button><button className="lesson-v2-ghost" onClick={() => askTutor("hint_1")}>{t.hint}</button></div>
          </div>
          <div className="lesson-v2-hints"><span>1. {t.think}</span><span className={helpLevel !== "question" ? "used" : ""}>2. {locale === "fr" ? "Indice" : "Hint"}</span><span className={complete ? "used" : ""}>3. {t.celebrate} ✦</span></div>
        </section>
        <aside className="lesson-v2-tutor">
          <div className="lesson-v2-tutor-head"><div className="lesson-v2-tutor-avatar">✦</div><div><span>{t.tutor}</span><strong>{t.tutorTitle}</strong></div><i>●</i></div>
          <div className="lesson-v2-goal"><span>{t.understood}</span><b>{course.objective}</b></div>
          <div className="lesson-v2-chat"><div className="lesson-v2-bubble tutor">{tutorMessage}</div>{answer && <div className="lesson-v2-bubble student">{answer}</div>}</div>
          <div className="lesson-v2-tutor-actions"><button onClick={() => askTutor("question")}>{t.ask}</button><button onClick={() => askTutor("hint_2")}>{t.nextHint}</button><button onClick={() => askTutor("example")}>{t.example}</button></div>
          <div className="lesson-v2-compose"><input value={message} placeholder={t.compose} aria-label={t.compose} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") askTutor(helpLevel, message); }} /><button aria-label={locale === "fr" ? "Envoyer" : "Send"} onClick={() => askTutor(helpLevel, message)}>↑</button></div>
          <p className="lesson-v2-note">{t.note}</p>
        </aside>
      </div>
    </main>
  );
}
