"use client";

import Link from "next/link";
import { useState } from "react";

const challenges = [
  { title: "Le puzzle des fractions", icon: "🧩", text: "Trouve la part qui complète le tout.", href: "/student/young/cours/fractions" },
  { title: "Le jardin des lettres", icon: "🌷", text: "Reconnais une lettre arabe en jouant.", href: "/student/young/sceance/lettres-arabes" },
];

export default function YoungGamesRoute() {
  const [selected, setSelected] = useState<string | null>(null);
  return <main className="young-games-page"><header className="young-simple-header"><Link href="/student/young" className="young-brand"><span className="young-brand-mark">☪</span><span><strong>Madrasa</strong><small>Québec</small></span></Link><Link href="/student/young" className="young-back-link">← Mon accueil</Link></header><section className="young-games-shell"><p className="young-eyebrow">DÉFI DU JOUR</p><h1>Jouer et apprendre 🎮</h1><p className="young-simple-lead">Choisis un petit défi. Chaque bonne réponse te donne une étoile.</p><div className="young-star-score" aria-live="polite">⭐ {selected ? "1 étoile gagnée" : "0 étoile"}</div><div className="young-challenge-grid">{challenges.map((challenge) => <article className={`young-challenge-card ${selected === challenge.title ? "selected" : ""}`} key={challenge.title}><span className="young-challenge-icon">{challenge.icon}</span><h2>{challenge.title}</h2><p>{challenge.text}</p><button onClick={() => setSelected(challenge.title)}>{selected === challenge.title ? "Défi choisi ✓" : "Choisir ce défi →"}</button>{selected === challenge.title && <Link href={challenge.href} className="young-challenge-start">Commencer maintenant</Link>}</article>)}</div></section></main>;
}
