"use client";

import Link from "next/link";
import { useState } from "react";

export default function YoungProgressRoute() {
  const [goal, setGoal] = useState(false);
  return <main className="young-progress-page"><header className="young-simple-header"><Link href="/student/young" className="young-brand"><span className="young-brand-mark">☪</span><span><strong>Madrasa</strong><small>Québec</small></span></Link><Link href="/student/young" className="young-back-link">← Mon accueil</Link></header><section className="young-progress-shell"><p className="young-eyebrow">MES EFFORTS</p><h1>Ma progression ⭐</h1><p className="young-simple-lead">Regarde tout ce que tu as déjà appris cette semaine.</p><div className="young-progress-summary"><div className="young-progress-medal">🏅</div><div><strong>3 petites victoires</strong><p>Tu avances à ton rythme. Continue comme ça !</p></div><b>70 %</b></div><section className="young-progress-list"><h2>Mes aventures</h2><div><span>🍕</span><p><strong>Fractions simples</strong><small>Mission en cours</small><i><em style={{ width: "70%" }} /></i></p><b>70 %</b></div><div><span>🌙</span><p><strong>Mémorisation du Coran</strong><small>À commencer</small><i><em style={{ width: "20%" }} /></i></p><b>20 %</b></div></section><label className="young-goal-check"><input type="checkbox" checked={goal} onChange={(event) => setGoal(event.target.checked)} /> <span>{goal ? "Objectif de la semaine réussi ! 🌟" : "Terminer une mission cette semaine"}</span></label><Link href="/student/young/cours/fractions" className="young-session-primary">Continuer ma mission →</Link></section></main>;
}
