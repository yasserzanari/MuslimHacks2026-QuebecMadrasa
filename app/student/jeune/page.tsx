"use client";

import Image from "next/image";
import Link from "next/link";

const steps = [
  { number: "1", icon: "📖", label: "Apprendre", tone: "green" },
  { number: "2", icon: "✏️", label: "S’entraîner", tone: "mint" },
  { number: "3", icon: "🏆", label: "Célébrer", tone: "gold" },
];

export default function YoungStudentDashboard() {
  return (
    <main className="young-dashboard-page">
      <div className="young-dashboard-frame">
        <header className="young-dashboard-header">
          <Link className="young-brand" href="/student/young" aria-label="Madrasa Québec Network">
            <span className="young-brand-mark">☪</span>
            <span><strong>Madrasa</strong><small>Québec</small></span>
          </Link>
          <div className="young-header-actions">
            <div className="young-child-profile"><span className="young-mini-avatar">👦🏻</span><strong>Adam</strong></div>
            <Link className="young-help-button" href="/student/young/cours/fractions" aria-label="Aide"><span>?</span><small>Aide</small></Link>
          </div>
        </header>

        <section className="young-hero" aria-labelledby="young-greeting">
          <Image className="young-hero-art" src="/ui/student-young-hero-v1.png" alt="Adam apprend avec un Coran ouvert dans un jardin" fill priority sizes="(max-width: 800px) 100vw, 1400px" />
          <div className="young-hero-content">
            <p className="young-eyebrow">MISSION DU JOUR</p>
            <h1 id="young-greeting">Salam Adam <span aria-hidden="true">👋</span></h1>
            <p className="young-hero-subtitle">Aujourd’hui, on apprend !</p>
            <Link className="young-primary-button" href="/student/young/cours/fractions">Commencer ma mission <span>→</span></Link>
          </div>
        </section>

        <section className="young-card-grid" aria-label="Mes activités">
          <article className="young-feature-card young-mission-card">
            <div className="young-card-copy"><p className="young-card-kicker">À FAIRE AUJOURD’HUI</p><h2>Ma mission<br />du jour</h2><Link href="/student/young/cours/fractions" className="young-pill-link">Fractions <span>— 15 min&nbsp; →</span></Link></div>
            <Image src="/ui/fractions-pizza-realistic.png" alt="Une pizza découpée en fractions" width={205} height={205} className="young-card-image young-pizza" />
          </article>
          <Link href="/student/young/jeux" className="young-feature-card young-game-card">
            <div className="young-game-orbit"><span>🎮</span><i>✦</i><b>✦</b></div><div className="young-card-copy"><p className="young-card-kicker">DÉFI DU JOUR</p><h2>Jouer et<br />apprendre</h2><span className="young-round-arrow">→</span></div>
          </Link>
          <Link href="/student/young/progression" className="young-feature-card young-progress-card">
            <div className="young-stars" aria-hidden="true">⭐<strong>★</strong>⭐</div><div className="young-card-copy"><p className="young-card-kicker">MES EFFORTS</p><h2>Ma<br />progression</h2><div className="young-progress-line"><span style={{ width: "70%" }} /></div><strong className="young-progress-number">70 %</strong></div>
          </Link>
        </section>

        <section className="young-bottom-grid">
          <div className="young-learning-path" aria-label="Les étapes de l’apprentissage">
            {steps.map((step, index) => <div className="young-step-wrap" key={step.number}><div className={`young-step young-step-${step.tone}`}><span className="young-step-number">{step.number}</span><span className="young-step-icon">{step.icon}</span><strong>{step.label}</strong></div>{index < steps.length - 1 && <span className="young-step-dots">••••</span>}</div>)}
          </div>
          <Link href="/student/young/cours/fractions" className="young-help-card"><span className="young-help-illustration">🧕🏻</span><span><strong>Besoin d’aide&nbsp;?</strong><small>Demande-moi</small></span><b>→</b></Link>
        </section>
      </div>
    </main>
  );
}
