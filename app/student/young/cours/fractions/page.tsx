"use client";

import Link from "next/link";
import { useState } from "react";

const choices = ["1/4", "2/4", "3/4"];

export default function YoungFractionsRoute() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const correct = answer === "2/4";

  return <main className="young-session-page"><header className="young-session-header"><Link href="/student/young" className="young-brand"><span className="young-brand-mark">☪</span><span><strong>Madrasa</strong><small>Québec</small></span></Link><span className="young-session-count">Mission 1 / 3</span><Link href="/student/young" className="young-back-link">Quitter</Link></header><section className="young-session-shell"><p className="young-eyebrow">MISSION FRACTIONS · 15 MIN</p><h1>Construis une pizza entière 🍕</h1><p className="young-session-subtitle">Il y a déjà 2 parts sur 4. Combien de parts manquent pour compléter le tout ?</p><div className="young-fraction-card"><div className="young-pizza-visual" aria-label="Pizza avec deux parts sur quatre déjà colorées"><span>🍕</span><b>2 / 4</b></div><div className="young-choice-list" role="group" aria-label="Choisir une réponse">{choices.map((choice) => <button className={answer === choice ? (correct ? "is-correct" : "is-wrong") : ""} onClick={() => setAnswer(choice)} key={choice}>{choice}</button>)}</div>{answer && <p className={`young-feedback ${correct ? "success" : "try-again"}`} aria-live="polite">{correct ? "Bravo ! Il manque bien 2 parts sur 4." : "Regarde les parts déjà colorées et compte celles qui manquent."}</p>}<button className="young-session-primary" disabled={!correct} onClick={() => setStep(2)}>{step === 1 ? "Vérifier ma réponse →" : "Mission terminée ✓"}</button>{step === 2 && <p className="young-complete-message">🌟 Super effort ! Tu peux maintenant choisir une autre aventure.</p>}</div><div className="young-session-help"><span>💡</span><div><strong>Petit indice</strong><p>Une pizza entière a 4 parts. Fais 4 moins 2.</p></div></div><Link href="/student/young/cours" className="young-session-courses">Voir mes autres missions →</Link></section></main>;
}
