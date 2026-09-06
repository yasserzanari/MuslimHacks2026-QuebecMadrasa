"use client";

import Link from "next/link";
import { useState } from "react";

const words = ["قُلْ", "هُوَ", "اللَّهُ", "أَحَدٌ"];

export default function YoungQuranSession() {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [memoryFeedback, setMemoryFeedback] = useState<"wrong" | "">("");
  const complete = step === 3;
  return <main className="young-quran-page"><header><Link href="/student/young" className="young-back-link">← Mon accueil</Link><span className="young-quran-progress">Mission 1 / 3</span></header><section className="young-quran-shell"><p className="young-eyebrow">MÉMORISATION GUIDÉE</p><h1>Un petit verset, un grand pas 🌙</h1><p className="young-quran-subtitle">Sourate Al-Ikhlāṣ · verset 1</p><article className="young-quran-card"><div className="young-quran-orb">☽</div><p className="young-quran-arabic" lang="ar" dir="rtl">قُلْ هُوَ اللَّهُ أَحَدٌ</p><p className="young-quran-translation">« Dis : Il est Allah, l’Unique. »</p><div className="young-quran-steps"><span className={step >= 0 ? "active" : ""}>1 Écouter</span><span className={step >= 1 ? "active" : ""}>2 Répéter</span><span className={step >= 2 ? "active" : ""}>3 Se rappeler</span></div>{step === 0 && <div className="young-quran-action"><p>Écoute le modèle, puis répète doucement.</p><button onClick={() => setStep(1)}>▶ J’ai écouté</button></div>}{step === 1 && <div className="young-quran-action"><p>Répète le verset deux fois à voix haute.</p><button onClick={() => setStep(2)}>✓ J’ai répété</button></div>}{step === 2 && <div className="young-quran-action"><p>Replace les mots dans le bon ordre.</p><div className="young-word-options">{[...words].reverse().map((word) => <button className={selected === word ? "selected" : ""} onClick={() => { setSelected(word); setMemoryFeedback(""); }} key={word}>{word}</button>)}</div><button disabled={!selected} onClick={() => selected === words[0] ? setStep(3) : setMemoryFeedback("wrong")}>Vérifier ma mémoire →</button>{memoryFeedback === "wrong" && <p className="young-feedback try-again" aria-live="polite">Commence par « قُلْ », puis continue dans l’ordre.</p>}</div>}{complete && <div className="young-quran-success"><strong>🌟 Bravo !</strong><p>Tu as fait un vrai effort de mémorisation.</p><Link href="/student/young" className="young-quran-finish">Retour à mon accueil →</Link></div>}</article><p className="young-quran-source">Texte vérifié avec Quran.com · Sourate 112, verset 1.</p></section></main>;
}
