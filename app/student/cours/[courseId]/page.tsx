"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { getCourse } from "@/src/domain/course-catalog";

type Exercise = { image: string; alt: string; prompt: string; answers: string[]; correct: string; hint: string; kind: "photo" | "bar" | "recipe" };

const exercises: Exercise[] = [
  { kind: "photo", image: "/ui/fractions-pizza-realistic.png", alt: "Pizza divisée en quatre parts égales", prompt: "Quelle fraction de la pizza est colorée ?", answers: ["1/4", "2/4", "3/4", "4/4"], correct: "3/4", hint: "Compte les parts colorées, puis regarde combien il y a de parts en tout." },
  { kind: "photo", image: "/ui/fractions-apple-realistic.png", alt: "Pomme découpée en huit parts égales", prompt: "Il y a 8 parts égales. Si tu prends 3 parts, quelle fraction as-tu ?", answers: ["3/4", "3/8", "5/8", "8/3"], correct: "3/8", hint: "Le nombre du haut compte les parts choisies. Le nombre du bas compte toutes les parts." },
  { kind: "bar", image: "/ui/fractions-pizza-realistic.png", alt: "Bande de quatre cases pour représenter une fraction", prompt: "Quelle fraction de la bande est remplie ?", answers: ["1/4", "2/4", "3/4", "4/4"], correct: "2/4", hint: "Il y a quatre cases en tout. Combien sont remplies en vert ?" },
  { kind: "recipe", image: "/ui/fractions-pizza-realistic.png", alt: "Pizza utilisée comme exemple de recette", prompt: "Une recette demande 2 parts sur 4. Quelle fraction cela représente ?", answers: ["1/4", "2/4", "3/4", "4/4"], correct: "2/4", hint: "Le nombre du haut indique les parts utilisées; le nombre du bas indique le total." },
  { kind: "bar", image: "/ui/fractions-pizza-realistic.png", alt: "Bande graduée pour comparer des fractions", prompt: "Quelle fraction est la plus grande ?", answers: ["1/4", "2/4", "3/4", "Elles sont égales"], correct: "3/4", hint: "Les dénominateurs sont les mêmes. Compare seulement les nombres du haut." },
];

const copy = {
  fr: { back: "← Mes cours", activity: "Mission interactive", tutor: "Tuteur IA", tutorTitle: "Je suis là pour t’aider", goal: "Objectif", hint: "Donne-moi un indice", explain: "Explique autrement", speak: "Appuie pour parler", listening: "Je t’écoute…", type: "Écris au tuteur…", tryAgain: "Je veux essayer", correct: "Super raisonnement !", wrong: "Presque ! Essaie encore.", next: "Question suivante", finished: "Mission terminée !" },
  en: { back: "← My courses", activity: "Interactive mission", tutor: "AI tutor", tutorTitle: "I’m here to help", goal: "Goal", hint: "Give me a hint", explain: "Explain another way", speak: "Tap to speak", listening: "I’m listening…", type: "Write to your tutor…", tryAgain: "I want to try", correct: "Great reasoning!", wrong: "Almost! Try again.", next: "Next question", finished: "Mission complete!" },
} as const;

export default function StudentLessonPage() {
  const params = useParams<{ courseId: string }>();
  const course = getCourse(params.courseId) ?? getCourse("fractions")!;
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [message, setMessage] = useState("Regarde les parts colorées. Combien y en a-t-il sur le total ?");
  const [typed, setTyped] = useState("");
  const t = copy[locale];
  const exercise = exercises[index];

  function choose(value: string) {
    setAnswer(value);
    const correct = value === exercise.correct;
    setFeedback(correct ? t.correct : t.wrong);
    setMessage(correct ? (locale === "fr" ? "Oui ! Tu as compté les parts avec attention." : "Yes! You counted the parts carefully.") : (locale === "fr" ? "Regarde encore et explique-moi ton idée." : "Look again and explain your idea."));
  }
  function next() { setIndex((value) => Math.min(value + 1, exercises.length - 1)); setAnswer(""); setFeedback(""); setMessage(locale === "fr" ? "Prends ton temps et dis-moi ce que tu remarques." : "Take your time and tell me what you notice."); }
  function toggleVoice() { const active = !voiceActive; setVoiceActive(active); setMessage(active ? (locale === "fr" ? "Je t’écoute. Dis-moi ce que tu observes." : "I’m listening. Tell me what you notice.") : (locale === "fr" ? "Je suis prêt à continuer." : "I’m ready to continue.")); }

  return <main className="lesson-kids-shell">
    <aside className="lesson-kids-sidebar"><Link href="/student" className="lesson-kids-logo"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><nav><Link href="/student">☀ <span>Aujourd’hui</span></Link><Link className="active" href="/student/cours">▣ <span>Mes cours</span></Link><Link href="#">◈ <span>Jouer</span></Link><Link href="#">▥ <span>Ma progression</span></Link></nav><div className="kids-side-footer">✦<br /><small>{locale === "fr" ? "Ton tuteur t’aide à réfléchir." : "Your tutor helps you think."}</small></div></aside>
    <section className="lesson-kids-main"><header className="lesson-kids-header"><Link href="/student/cours" className="lesson-kids-back">{t.back}</Link><div className="lesson-kids-heading"><span>{course.category}</span><strong>{course.title}</strong></div><div className="lesson-kids-header-right"><button className="kids-locale" onClick={() => setLocale((value) => value === "fr" ? "en" : "fr")}>{locale === "fr" ? "EN" : "FR"}</button><span className="kids-progress">{index + 1} / {exercises.length}</span></div></header>
      <div className="lesson-kids-layout"><section className="kids-lesson-column"><div className="kids-lesson-top"><div><p className="kids-kicker">{t.activity}</p><h1>Les fractions</h1></div><div className="kids-progress-bar"><span style={{ width: `${((index + 1) / exercises.length) * 100}%` }} /></div></div><div className="kids-goal"><span>{t.goal}</span><strong>Comprendre les parts d’un tout</strong></div><article className="kids-exercise"><div className="kids-exercise-head"><span>À toi de jouer</span><b>{index + 1} / {exercises.length}</b></div><h2>{exercise.prompt}</h2>{exercise.kind === "bar" ? <div className="kids-fraction-bar" aria-label="Deux cases sur quatre sont remplies"><span className="filled" /><span className="filled" /><span /><span /></div> : exercise.kind === "recipe" ? <div className="kids-recipe-card"><span>🍽️</span><div><strong>Recette de famille</strong><small>Utilise 2 parts parmi 4 parts égales</small></div></div> : <div className="kids-pizza-wrap"><Image src={exercise.image} alt={exercise.alt} width={460} height={460} priority /></div>}<div className="kids-answer-grid">{exercise.answers.map((value) => <button key={value} className={answer === value ? (value === exercise.correct ? "correct" : "incorrect") : ""} onClick={() => choose(value)}>{value}</button>)}</div><div className="kids-exercise-actions"><button className="kids-try" onClick={() => { setAnswer(""); setFeedback(""); }}>{t.tryAgain}</button>{feedback && (answer === exercise.correct && index < exercises.length - 1 ? <button className="kids-next" onClick={next}>{t.next} →</button> : <span className="kids-feedback">{index === exercises.length - 1 && answer === exercise.correct ? t.finished : feedback}</span>)}</div></article></section>
        <aside className={`kids-tutor-panel ${voiceActive ? "is-listening" : ""}`}><div className="kids-tutor-header"><div className="kids-tutor-title"><span className="kids-tutor-status">●</span><div><b>{t.tutor}</b><small>{t.tutorTitle}</small></div></div><span className="kids-sparkles">✦</span></div><div className="kids-tutor-goal"><span>{t.goal}</span><strong>Représenter une fraction</strong></div><div className="kids-avatar-stage"><div className="kids-avatar-waves">⌁</div><div className="kids-avatar"><div className="kids-avatar-cap">⌒</div><div className="kids-avatar-face"><i /><i /><b /></div></div><span className="kids-speaking-dot">{voiceActive ? "●" : ""}</span></div><div className="kids-tutor-bubble">{message}</div><button className="kids-quick yellow" onClick={() => setMessage(exercise.hint)}>💡 {t.hint}</button><button className="kids-quick blue" onClick={() => setMessage(locale === "fr" ? "Imagine que tu partages la pizza avec un ami." : "Imagine sharing the pizza with a friend.")}>💬 {t.explain}</button><div className="kids-voice-zone"><button className="kids-mic-button" aria-label={voiceActive ? t.listening : t.speak} onClick={toggleVoice}><span className="voice-ring ring-one" /><span className="voice-ring ring-two" /><span className="voice-mic">●</span></button><strong>{voiceActive ? t.listening : t.speak}</strong><small>{locale === "fr" ? "Le micro s’allume seulement quand tu appuies." : "The microphone turns on only when you tap."}</small></div><form className="kids-type-row" onSubmit={(event) => { event.preventDefault(); if (typed) { setMessage(typed); setTyped(""); } }}><input value={typed} onChange={(event) => setTyped(event.target.value)} placeholder={t.type} aria-label={t.type} /><button aria-label={locale === "fr" ? "Envoyer" : "Send"}>↑</button></form></aside>
      </div></section>
  </main>;
}
