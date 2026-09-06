"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type GameId = "fractions" | "food" | "words" | "arabic";
type Round = { prompt: string; visual: string; visualLabel: string; answers: string[]; correct: string; hint: string };

const games: Array<{ id: GameId; icon: string; title: string; fr: string; en: string; tag: string; color: string; time: string; points: number; rounds: Round[] }> = [
  { id: "fractions", icon: "🧩", title: "Fraction puzzle", fr: "Assemble le tout avec les bonnes parts.", en: "Build a whole from the right parts.", tag: "Mathématiques", color: "blue", time: "5 min", points: 30, rounds: [
    { prompt: "Quelle part complète 2/4 pour faire une pizza entière ?", visual: "🍕", visualLabel: "Pizza partagée en quatre parts", answers: ["1/4", "2/4", "3/4"], correct: "2/4", hint: "Compte les parts déjà colorées : il en manque deux sur quatre." },
    { prompt: "Tu as 3/8 d’une pomme. Combien de parts manquent pour faire 8/8 ?", visual: "🍎", visualLabel: "Pomme partagée en huit parts", answers: ["3/8", "5/8", "8/3"], correct: "5/8", hint: "Pars de 3 et compte jusqu’à 8." },
  ] },
  { id: "food", icon: "🌱", title: "Food web", fr: "Construis une chaîne alimentaire.", en: "Build a food chain.", tag: "Sciences", color: "green", time: "8 min", points: 40, rounds: [
    { prompt: "Que mange généralement le lapin dans cette chaîne ?", visual: "🐰 → ?", visualLabel: "Un lapin cherche sa nourriture", answers: ["L’herbe", "Le renard", "Le soleil"], correct: "L’herbe", hint: "Le lapin est un herbivore : il mange des plantes." },
    { prompt: "Qui peut manger le lapin ?", visual: "🌿 → 🐰 → ?", visualLabel: "Une chaîne alimentaire simple", answers: ["Le renard", "La carotte", "L’herbe"], correct: "Le renard", hint: "Cherche le prédateur du lapin dans cette chaîne." },
  ] },
  { id: "words", icon: "🔤", title: "Word detective", fr: "Trouve l’idée principale du texte.", en: "Find the main idea in a short text.", tag: "Français", color: "purple", time: "6 min", points: 25, rounds: [
    { prompt: "Nora plante des graines. Elle les arrose chaque matin et observe les premières feuilles. Quelle est l’idée principale ?", visual: "🌱 📖", visualLabel: "Une jeune pousse dans un carnet", answers: ["Nora prend soin de ses plantes", "Nora joue au ballon", "Nora prépare un gâteau"], correct: "Nora prend soin de ses plantes", hint: "Quel sujet revient dans les deux phrases ?" },
    { prompt: "Le vent souffle fort. Les feuilles dansent et les branches bougent. Que décrit le texte ?", visual: "🍃", visualLabel: "Des feuilles bougent dans le vent", answers: ["Une journée venteuse", "Une nuit silencieuse", "Une course rapide"], correct: "Une journée venteuse", hint: "Regarde les indices : vent, feuilles et branches." },
  ] },
  { id: "arabic", icon: "ا", title: "Letters garden", fr: "Reconnais les lettres arabes en jouant.", en: "Recognize Arabic letters as you play.", tag: "Arabe", color: "gold", time: "4 min", points: 20, rounds: [
    { prompt: "Quelle lettre arabe entends-tu au début de بَاب (baab) ?", visual: "🌼 ب", visualLabel: "Une fleur avec la lettre baa", answers: ["ب", "ت", "ن"], correct: "ب", hint: "La lettre baa a un point sous sa forme." },
    { prompt: "Trouve la lettre ت dans le jardin.", visual: "🌷 ت 🌿", visualLabel: "Un jardin de lettres arabes", answers: ["ث", "ت", "ب"], correct: "ت", hint: "Taa possède deux points au-dessus." },
  ] },
];

const labels = {
  fr: { space: "Mon espace", today: "Aujourd’hui", courses: "Mes cours", play: "Jouer et apprendre", progress: "Ma progression", kicker: "Espace élève · défis courts", title: "Jouer et apprendre", heroKicker: "Choisis ton énergie", heroTitle: "Un petit défi peut débloquer une grande idée.", heroText: "Joue seul, gagne des étoiles et entraîne une compétence à la fois.", points: "points cette semaine", forMe: "Pour moi", class: "Avec ma classe", done: "Défis terminés", playNow: "Jouer maintenant", inProgress: "En cours…", groupKicker: "Défi en groupe", groupTitle: "La classe de sciences commence bientôt", groupText: "Retrouve Lina et Yusuf dans une activité de 20 minutes.", join: "Rejoindre", round: "Manche", hint: "Demander un indice", next: "Manche suivante", finish: "Défi terminé !", finishText: "Tu as gagné", replay: "Rejouer", back: "Retour aux défis", correct: "Bien joué !", wrong: "Pas encore. Observe les indices et réessaie.", complete: "Terminer" },
  en: { space: "My space", today: "Today", courses: "My courses", play: "Play and learn", progress: "My progress", kicker: "Student space · short challenges", title: "Play and learn", heroKicker: "Choose your energy", heroTitle: "A small challenge can unlock a big idea.", heroText: "Play solo, earn stars and train one skill at a time.", points: "points this week", forMe: "For me", class: "With my class", done: "Completed", playNow: "Play now", inProgress: "In progress…", groupKicker: "Group challenge", groupTitle: "Science class starts soon", groupText: "Meet Lina and Yusuf in a 20-minute activity.", join: "Join", round: "Round", hint: "Ask for a hint", next: "Next round", finish: "Challenge complete!", finishText: "You earned", replay: "Play again", back: "Back to challenges", correct: "Great job!", wrong: "Not yet. Look at the clues and try again.", complete: "Finish" },
} as const;

export default function StudentGamesPage() {
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [activeId, setActiveId] = useState<GameId | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | "">("");
  const [showHint, setShowHint] = useState(false);
  const [earned, setEarned] = useState(0);
  const fr = locale === "fr";
  const t = labels[locale];
  const activeGame = useMemo(() => games.find((game) => game.id === activeId) ?? null, [activeId]);
  const round = activeGame?.rounds[roundIndex] ?? null;
  const finished = Boolean(activeGame && roundIndex >= activeGame.rounds.length);

  function startGame(id: GameId) { setActiveId(id); setRoundIndex(0); setAnswer(""); setFeedback(""); setShowHint(false); setEarned(0); }
  function choose(value: string) { if (!round || feedback === "correct") return; const isCorrect = value === round.correct; setAnswer(value); setFeedback(isCorrect ? "correct" : "wrong"); if (isCorrect) setEarned((score) => score + Math.round((activeGame?.points ?? 0) / activeGame!.rounds.length)); }
  function nextRound() { setRoundIndex((value) => value + 1); setAnswer(""); setFeedback(""); setShowHint(false); }
  function closeGame() { setActiveId(null); setRoundIndex(0); setAnswer(""); setFeedback(""); }

  return <main className="student-v2-shell games-shell">
    <aside className="student-v2-sidebar hidden lg:flex"><Link href="/" className="student-v2-logo"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><span className="student-v2-label">{t.space}</span><Link className="student-v2-nav" href="/student">☀ <span>{t.today}</span></Link><Link className="student-v2-nav" href="/student/cours">▣ <span>{t.courses}</span></Link><Link className="student-v2-nav active" href="/student/jeux">🎮 <span>{t.play}</span></Link><Link className="student-v2-nav" href="/student/progression">✦ <span>{t.progress}</span></Link></aside>
    <section className="student-v2-main"><header className="student-v2-top"><div><p className="student-v2-kicker">{t.kicker}</p><h1>{t.title}</h1></div><button className="student-v2-locale" onClick={() => setLocale(fr ? "en" : "fr")}>{fr ? "EN" : "FR"}</button></header>
      <section className="games-hero"><div><span className="student-v2-kicker">{t.heroKicker}</span><h2>{t.heroTitle}</h2><p>{t.heroText}</p></div><div className="games-score"><span>✦</span><strong>245</strong><small>{t.points}</small></div></section>
      {activeGame && <section className="game-play-panel" aria-live="polite"><div className="game-play-top"><button className="game-back" onClick={closeGame}>← {t.back}</button><span>{activeGame.icon} {activeGame.title}</span><b>{finished ? activeGame.rounds.length : roundIndex + 1} / {activeGame.rounds.length}</b></div>{finished ? <div className="game-finished"><div className="game-finished-stars">✦ ✦ ✦</div><h2>{t.finish}</h2><p>{t.finishText} <strong>+{earned} ✦</strong></p><button className="game-primary" onClick={() => startGame(activeGame.id)}>{t.replay} →</button></div> : round && <><div className="game-progress-track"><i style={{ width: `${(roundIndex / activeGame.rounds.length) * 100}%` }} /></div><div className="game-round"><span className="game-round-label">{t.round} {roundIndex + 1}</span><div className="game-visual" aria-label={round.visualLabel}>{round.visual}</div><h2>{round.prompt}</h2><div className="game-choice-grid">{round.answers.map((value) => <button key={value} className={answer === value ? (value === round.correct ? "is-correct" : "is-wrong") : ""} onClick={() => choose(value)}>{value}</button>)}</div><div className="game-feedback-row">{feedback === "wrong" && <span className="game-feedback wrong">{t.wrong}</span>}{feedback === "correct" && <span className="game-feedback correct">✓ {t.correct}</span>}{feedback === "correct" ? <button className="game-primary compact" onClick={nextRound}>{roundIndex === activeGame.rounds.length - 1 ? t.complete : t.next} →</button> : <button className="game-hint" onClick={() => setShowHint((value) => !value)}>💡 {t.hint}</button>}</div>{showHint && <p className="game-hint-text">{round.hint}</p>}</div></>}</section>}
      <div className="games-tabs"><button className="active">{t.forMe}</button><button>{t.class}</button><button>{t.done}</button></div><section className="games-grid">{games.map((game) => <article className={`game-card ${game.color}`} key={game.id}><div className="game-card-icon">{game.icon}</div><span className="game-tag">{game.tag}</span><h2>{game.title}</h2><p>{fr ? game.fr : game.en}</p><div className="game-meta"><span>◷ {game.time}</span><strong>+{game.points} ✦</strong></div><button onClick={() => startGame(game.id)}>{activeId === game.id ? t.inProgress : t.playNow} →</button></article>)}</section><section className="games-live-banner"><div className="games-live-icon">◉</div><div><span className="student-v2-kicker">{t.groupKicker}</span><h2>{t.groupTitle}</h2><p>{t.groupText}</p></div><Link href="/student/live/atelier-ecosystemes" className="student-v2-primary">{t.join} →</Link></section>
    </section>
  </main>;
}
