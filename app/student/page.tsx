"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type ChatMessage = { role: "ai" | "student"; text: string };

const steps = [
  { label: "Comprendre", caption: "Repérer les données", done: true },
  { label: "Modéliser", caption: "Choisir l’équation", done: false },
  { label: "Résoudre", caption: "Calculer et vérifier", done: false },
];

export default function StudentPage() {
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hint, setHint] = useState(0);
  const [chat, setChat] = useState<ChatMessage[]>([
    { role: "ai", text: "Je suis là pour t’aider à raisonner. Qu’est-ce que tu sais déjà dans ce problème ?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  function checkAnswer(event: FormEvent) {
    event.preventDefault();
    if (!answer.trim()) return;
    setFeedback(answer.trim() === "24" ? "Bien joué — ton modèle est correct." : "Pas encore. Vérifie d’abord quelle quantité représente x.");
  }

  function askTutor(text = chatInput) {
    const clean = text.trim();
    if (!clean) return;
    setChat((current) => [...current, { role: "student", text: clean }, { role: "ai", text: clean.toLowerCase().includes("indice") ? "Indice 1 : commence par écrire ce que représente le nombre 6 dans l’énoncé. Ensuite, demande-toi quelle opération relie 6 à x." : "Bonne question. Regarde les informations connues et essaie de les traduire en une seule phrase mathématique. Je peux te donner un indice si tu veux." }]);
    setChatInput("");
  }

  return (
    <main className="senior-student-shell">
      <aside className="senior-student-sidebar">
        <Link href="/" className="senior-student-brand"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <div className="senior-student-space-label">MON ESPACE</div>
        <Link className="senior-student-nav" href="/student">⌂ <span>Aujourd’hui</span></Link>
        <Link className="senior-student-nav active" href="/student/cours">▣ <span>Mes travaux</span><b>1</b></Link>
        <Link className="senior-student-nav" href="/student/jeux">◈ <span>Défis rapides</span></Link>
        <Link className="senior-student-nav" href="/student/progression">✦ <span>Ma progression</span></Link>
        <div className="senior-student-sidebar-bottom"><span>💡</span><div><strong>Besoin d’un coup de main ?</strong><small>Ton tuteur t’aide à réfléchir, étape par étape.</small></div></div>
      </aside>

      <section className="senior-student-main">
        <header className="senior-student-header"><div><Link href="/student/cours" className="senior-back">← Mes travaux</Link><p className="senior-kicker">MATHÉMATIQUES · PROBLÈME GUIDÉ</p><h1>Comprendre avant de calculer.</h1></div><div className="senior-header-profile"><button aria-label="Changer de langue">FR</button><span>Y</span><div><strong>Yasmine</strong><small>2e secondaire</small></div><b>⌄</b></div></header>

        <div className="senior-student-progress"><div><span>Travail 2 sur 4</span><strong>Problèmes algébriques</strong></div><div className="senior-progress-track"><i style={{ width: "42%" }} /></div><span>42%</span></div>

        <div className="senior-workspace-grid">
          <section className="senior-problem-column">
            <div className="senior-problem-card"><div className="senior-problem-top"><span className="senior-subject-pill">∑ Algèbre</span><span>⏱ 20 min</span></div><h2>Le billet de cinéma</h2><p className="senior-problem-text">Yasmine achète 3 billets de cinéma et un sac de maïs soufflé pour <strong>42 $</strong>. Le sac coûte <strong>6 $</strong>. Combien coûte un billet ?</p><div className="senior-equation"><span>3 billets</span><b>+</b><span>6 $</span><b>=</b><strong>42 $</strong></div><div className="senior-step-heading"><div><span className="senior-kicker">ÉTAPE 2 · À TOI</span><h3>Quelle équation représente la situation ?</h3></div><span className="senior-step-count">2 / 3</span></div><div className="senior-step-list">{steps.map((step, index) => <div className={`senior-step ${step.done ? "done" : index === 1 ? "current" : ""}`} key={step.label}><span>{step.done ? "✓" : index + 1}</span><div><strong>{step.label}</strong><small>{step.caption}</small></div>{index === 1 && <b>En cours</b>}</div>)}</div><div className="senior-answer-box"><label htmlFor="answer">Écris la valeur de x</label><form onSubmit={checkAnswer}><div className="senior-answer-input"><span>x =</span><input id="answer" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="ta réponse" inputMode="numeric" /><span>$</span></div><button className="senior-primary" type="submit">Vérifier ma réponse <span>→</span></button></form>{feedback && <p className={answer.trim() === "24" ? "answer-success" : "answer-help"}>{feedback}</p>}</div><div className="senior-hint-row"><span>🔎</span><div><strong>Besoin d’un indice ?</strong><small>{hint === 0 ? "Un indice sera révélé progressivement." : hint === 1 ? "Commence par enlever le prix du maïs soufflé." : "42 − 6 = 36. Que faire ensuite avec 36 ?"}</small></div><button onClick={() => setHint((current) => Math.min(2, current + 1))} disabled={hint >= 2}>{hint >= 2 ? "Indice complet" : "Voir un indice"}</button></div></div>
            <div className="senior-bottom-nav"><Link href="/student/cours">← Retour aux travaux</Link><span>Ta réponse est sauvegardée automatiquement</span><button onClick={() => { setAnswer(""); setFeedback(""); setHint(0); }}>Recommencer ↻</button></div>
          </section>

          <aside className="senior-tutor-card"><div className="senior-tutor-header"><div className="senior-tutor-orb">✦</div><div><span className="senior-kicker">TUTEUR IA</span><h2>On réfléchit ensemble</h2></div><span className="senior-online"><i /> En ligne</span></div><div className="senior-chat"><div className="senior-chat-note">Le tuteur pose des questions et donne des indices. Il ne fait pas le travail à ta place.</div>{chat.map((message, index) => <div className={`senior-chat-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === "ai" ? "✦" : "Y"}</span><p>{message.text}</p></div>)}</div><div className="senior-suggestions"><span>Essaie une question</span><button onClick={() => askTutor("Je veux un indice")}>💡 Donne-moi un indice</button><button onClick={() => askTutor("Je ne comprends pas l’équation")}>🤔 Je bloque sur l’équation</button></div><form className="senior-chat-form" onSubmit={(event) => { event.preventDefault(); askTutor(); }}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Écris au tuteur…" aria-label="Message au tuteur IA" /><button type="submit" aria-label="Envoyer">↑</button></form><div className="senior-tutor-footer">🛡️ Ton travail reste privé · <Link href="/parent">Voir par mon parent</Link></div></aside>
        </div>
      </section>
    </main>
  );
}
