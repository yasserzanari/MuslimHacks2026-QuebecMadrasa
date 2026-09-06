"use client";

import { useMemo, useState } from "react";
import StudentNav from "@/components/student/StudentNav";

type Locale = "fr" | "en";

type GameQuestion = {
  id: string;
  promptFr: string;
  promptEn: string;
  choices: { id: string; fr: string; en: string }[];
  correctId: string;
  explainFr: string;
  explainEn: string;
};

type Game = {
  id: string;
  icon: string;
  color: "blue" | "purple" | "green" | "gold";
  titleFr: string;
  titleEn: string;
  subjectFr: string;
  subjectEn: string;
  questions: GameQuestion[];
};

const games: Game[] = [
  {
    id: "fractions", icon: "¾", color: "blue", titleFr: "Défi des fractions", titleEn: "Fraction challenge", subjectFr: "Mathématiques", subjectEn: "Mathematics",
    questions: [
      { id: "f1", promptFr: "Quelle fraction est la plus grande ?", promptEn: "Which fraction is bigger?", choices: [{ id: "a", fr: "1/4", en: "1/4" }, { id: "b", fr: "3/4", en: "3/4" }, { id: "c", fr: "2/4", en: "2/4" }], correctId: "b", explainFr: "3 parts sur 4, c’est plus que 2 parts sur 4.", explainEn: "3 parts out of 4 is more than 2 parts out of 4." },
      { id: "f2", promptFr: "La pizza est coupée en 4. Tu manges 1 part. Que reste-t-il ?", promptEn: "The pizza is cut into 4. You eat 1 slice. What is left?", choices: [{ id: "a", fr: "3/4", en: "3/4" }, { id: "b", fr: "1/4", en: "1/4" }, { id: "c", fr: "4/4", en: "4/4" }], correctId: "a", explainFr: "Il reste 3 parts sur les 4 du début.", explainEn: "3 of the original 4 slices are left." },
      { id: "f3", promptFr: "2/4, c’est la même chose que…", promptEn: "2/4 is the same as…", choices: [{ id: "a", fr: "1/2", en: "1/2" }, { id: "b", fr: "1/4", en: "1/4" }, { id: "c", fr: "2/2", en: "2/2" }], correctId: "a", explainFr: "Deux parts sur quatre, c’est la moitié.", explainEn: "Two parts out of four is one half." },
    ],
  },
  {
    id: "lecture", icon: "ABC", color: "purple", titleFr: "Chasse à l’idée principale", titleEn: "Main idea hunt", subjectFr: "Français", subjectEn: "French",
    questions: [
      { id: "l1", promptFr: "L’idée principale d’un texte, c’est…", promptEn: "The main idea of a text is…", choices: [{ id: "a", fr: "Ce dont le texte parle surtout", en: "What the text is mostly about" }, { id: "b", fr: "Le premier mot", en: "The first word" }, { id: "c", fr: "Le plus long paragraphe", en: "The longest paragraph" }], correctId: "a", explainFr: "C’est le message que l’auteur veut faire passer.", explainEn: "It is the message the author wants to convey." },
      { id: "l2", promptFr: "Pour justifier ta réponse, tu utilises…", promptEn: "To back up your answer you use…", choices: [{ id: "a", fr: "Une phrase du texte", en: "A sentence from the text" }, { id: "b", fr: "Ton avis seulement", en: "Only your opinion" }, { id: "c", fr: "Un dessin", en: "A drawing" }], correctId: "a", explainFr: "Une preuve tirée du texte rend ta réponse solide.", explainEn: "Evidence from the text makes your answer solid." },
    ],
  },
  {
    id: "ecosystemes", icon: "⌁", color: "green", titleFr: "Chaîne alimentaire", titleEn: "Food chain", subjectFr: "Sciences", subjectEn: "Science",
    questions: [
      { id: "e1", promptFr: "Que font les abeilles pour les fleurs ?", promptEn: "What do bees do for flowers?", choices: [{ id: "a", fr: "Elles les pollinisent", en: "They pollinate them" }, { id: "b", fr: "Elles les mangent", en: "They eat them" }, { id: "c", fr: "Elles les arrosent", en: "They water them" }], correctId: "a", explainFr: "En butinant, elles transportent le pollen d’une fleur à l’autre.", explainEn: "While foraging they carry pollen from flower to flower." },
      { id: "e2", promptFr: "Sans plantes à fleurs, les oiseaux ont…", promptEn: "Without flowering plants, birds have…", choices: [{ id: "a", fr: "Moins de nourriture", en: "Less food" }, { id: "b", fr: "Plus de nourriture", en: "More food" }, { id: "c", fr: "La même nourriture", en: "The same food" }], correctId: "a", explainFr: "Moins de fruits et de graines, donc moins à manger.", explainEn: "Fewer fruits and seeds means less to eat." },
    ],
  },
  {
    id: "lettres", icon: "ا ب", color: "gold", titleFr: "Sons des lettres arabes", titleEn: "Arabic letter sounds", subjectFr: "Arabe", subjectEn: "Arabic",
    questions: [
      { id: "a1", promptFr: "Combien de lettres compte l’alphabet arabe ?", promptEn: "How many letters are in the Arabic alphabet?", choices: [{ id: "a", fr: "28", en: "28" }, { id: "b", fr: "26", en: "26" }, { id: "c", fr: "30", en: "30" }], correctId: "a", explainFr: "L’alphabet arabe compte 28 lettres.", explainEn: "The Arabic alphabet has 28 letters." },
      { id: "a2", promptFr: "L’arabe se lit…", promptEn: "Arabic is read…", choices: [{ id: "a", fr: "De droite à gauche", en: "Right to left" }, { id: "b", fr: "De gauche à droite", en: "Left to right" }, { id: "c", fr: "De bas en haut", en: "Bottom to top" }], correctId: "a", explainFr: "On commence par la droite de la ligne.", explainEn: "You start at the right of the line." },
    ],
  },
];

const copy = {
  fr: {
    kicker: "Espace élève", title: "Jouer et apprendre",
    lead: "Des mini-défis courts pour revoir ce que tu as appris. Aucun classement, aucun chrono.",
    play: "Jouer", questions: "questions", replay: "Rejouer", next: "Question suivante", finish: "Voir mon résultat", back: "Retour aux jeux",
    correct: "Bonne réponse !", wrong: "Pas encore. Regarde l’explication.", score: "Ton résultat", of: "sur",
    great: "Bravo, tu maîtrises ce défi.", good: "Bien joué. Rejoue pour consolider.", keep: "Continue, tu progresses à chaque essai.",
    why: "Pourquoi", question: "Question",
  },
  en: {
    kicker: "Student space", title: "Play and learn",
    lead: "Short challenges to review what you learned. No ranking, no timer.",
    play: "Play", questions: "questions", replay: "Play again", next: "Next question", finish: "See my result", back: "Back to the games",
    correct: "Correct!", wrong: "Not yet. Look at the explanation.", score: "Your result", of: "out of",
    great: "Well done, you have this one.", good: "Nice work. Play again to lock it in.", keep: "Keep going, you improve every try.",
    why: "Why", question: "Question",
  },
} as const;

export default function StudentPlayPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [gameId, setGameId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const t = copy[locale];

  const game = useMemo(() => games.find((item) => item.id === gameId) ?? null, [gameId]);
  const question = game?.questions[index];

  function start(id: string) { setGameId(id); setIndex(0); setChosen(null); setScore(0); setDone(false); }
  function choose(choiceId: string) {
    if (chosen || !question) return;
    setChosen(choiceId);
    if (choiceId === question.correctId) setScore((value) => value + 1);
  }
  function next() {
    if (!game) return;
    if (index + 1 >= game.questions.length) { setDone(true); return; }
    setIndex((value) => value + 1);
    setChosen(null);
  }

  return (
    <main className="student-v2-shell min-h-screen bg-[#f3faf5]">
      <StudentNav active="play" locale={locale} />
      <section className="student-v2-main">
        <header className="student-v2-top">
          <div><p className="student-v2-kicker">{t.kicker}</p><h1>{t.title}</h1></div>
          <button className="student-v2-locale" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>{locale === "fr" ? "EN" : "FR"}</button>
        </header>

        {!game && (
          <>
            <p className="assistant-lead">{t.lead}</p>
            <div className="play-grid">
              {games.map((item) => (
                <article className="play-card" key={item.id}>
                  <span className={`play-icon ${item.color}`}>{item.icon}</span>
                  <h2>{locale === "fr" ? item.titleFr : item.titleEn}</h2>
                  <small>{locale === "fr" ? item.subjectFr : item.subjectEn} · {item.questions.length} {t.questions}</small>
                  <button className="student-v2-primary" onClick={() => start(item.id)}>{t.play} →</button>
                </article>
              ))}
            </div>
          </>
        )}

        {game && !done && question && (
          <section className="play-round">
            <div className="play-round-top">
              <span className="student-v2-kicker">{locale === "fr" ? game.titleFr : game.titleEn}</span>
              <b>{t.question} {index + 1}/{game.questions.length}</b>
            </div>
            <h2>{locale === "fr" ? question.promptFr : question.promptEn}</h2>
            <div className="play-choices">
              {question.choices.map((choice) => {
                const state = !chosen ? "" : choice.id === question.correctId ? "right" : choice.id === chosen ? "wrong" : "dim";
                return <button key={choice.id} className={`play-choice ${state}`} onClick={() => choose(choice.id)} disabled={Boolean(chosen)}>{locale === "fr" ? choice.fr : choice.en}</button>;
              })}
            </div>
            {chosen && (
              <div className={`play-feedback ${chosen === question.correctId ? "right" : "wrong"}`}>
                <strong>{chosen === question.correctId ? `✓ ${t.correct}` : `↻ ${t.wrong}`}</strong>
                <p><b>{t.why} :</b> {locale === "fr" ? question.explainFr : question.explainEn}</p>
                <button className="student-v2-primary" onClick={next}>{index + 1 >= game.questions.length ? t.finish : t.next} →</button>
              </div>
            )}
            <button className="student-v2-ghost" onClick={() => setGameId(null)}>← {t.back}</button>
          </section>
        )}

        {game && done && (
          <section className="play-round play-result">
            <div className="play-result-badge">★</div>
            <h2>{t.score} : {score} {t.of} {game.questions.length}</h2>
            <p>{score === game.questions.length ? t.great : score > 0 ? t.good : t.keep}</p>
            <div className="play-result-actions">
              <button className="student-v2-primary" onClick={() => start(game.id)}>{t.replay}</button>
              <button className="student-v2-ghost" onClick={() => setGameId(null)}>{t.back}</button>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
