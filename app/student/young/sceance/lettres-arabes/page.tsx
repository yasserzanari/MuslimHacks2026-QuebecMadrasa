"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const letters = ["ب", "ت", "ن"];

export default function YoungArabicLettersSession() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const correct = selected === "ب";
  return <main className="young-session-page"><header className="young-session-header"><Link href="/student/young" className="young-brand"><span className="young-brand-mark">☪</span><span><strong>Madrasa</strong><small>Québec</small></span></Link><span className="young-session-count">Mission 2 / 3</span><Link href="/student/young" className="young-back-link">Quitter</Link></header><section className="young-session-shell"><p className="young-eyebrow">JEU DES LETTRES · 5 MIN</p><h1>Le jardin des lettres 🌷</h1><p className="young-session-subtitle">Quelle lettre entends-tu au début de <b lang="ar" dir="rtl">بَاب</b> (baab) ?</p><div className="young-fraction-card"><div className="young-pizza-visual" aria-label="Une fleur avec la lettre baa"><span>🌼 ب</span></div><div className="young-choice-list" role="group" aria-label="Choisir une lettre">{letters.map((letter) => <button lang="ar" className={selected === letter ? (correct ? "is-correct" : "is-wrong") : ""} onClick={() => setSelected(letter)} key={letter}>{letter}</button>)}</div>{selected && <p className={`young-feedback ${correct ? "success" : "try-again"}`} aria-live="polite">{correct ? "Bravo ! ب est la lettre baa." : "Écoute le premier son : baa commence par ب."}</p>}<button className="young-session-primary" disabled={!correct} onClick={() => router.push("/student/young")}>Terminer la séance ✓</button></div><div className="young-session-help"><span>💡</span><div><strong>Petit indice</strong><p>La lettre baa a un point sous sa forme.</p></div></div></section></main>;
}
