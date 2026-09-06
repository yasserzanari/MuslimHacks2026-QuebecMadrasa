"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

type ChatMessage = { role: "tutor" | "student"; text: string };

const hints = [
  ["⌕", "Indice 1", "Observer la montée"],
  ["▥", "Indice 2", "Comparer deux pentes"],
  ["▤", "Voir un exemple", "Un cas concret"],
] as const;

export default function StudentPage() {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    { role: "tutor", text: "Salam ! Je suis ton tuteur IA. Je suis là pour t’aider à réfléchir et progresser." },
    { role: "tutor", text: "Qu’est-ce qui change entre les deux droites ? Compare d’abord leur montée pour le même déplacement horizontal." },
  ]);

  function checkReasoning(event: FormEvent) {
    event.preventDefault();
    setChecked(true);
  }

  function sendMessage(text = chatInput) {
    const clean = text.trim();
    if (!clean) return;
    setChat((current) => [...current, { role: "student", text: clean }, { role: "tutor", text: clean.toLowerCase().includes("indice") ? "Regarde la distance verticale entre les deux points d’une même droite. Que se passe-t-il quand elle augmente ?" : "Bonne piste. Explique-moi avec tes mots ce que représente la pente sur le graphique." }]);
    setChatInput("");
  }

  return (
    <main className="lesson-reference-page">
      <div className="lesson-reference-frame">
        <header className="lesson-reference-topbar">
          <div className="lesson-reference-brand"><span className="lesson-brand-mark">⌂</span><span><b>Madrasa</b><b>Québec</b></span><nav><Link href="/student/cours">Mes cours</Link><i>/</i><span>Mathématiques</span><i>/</i><span>Algèbre</span></nav></div>
          <div className="lesson-question-progress"><strong>Question 3 sur 8</strong><div><span><i /></span><em><b /><b /><b /></em></div></div>
          <Link href="/student/cours" className="lesson-exit">↪ &nbsp; Quitter la leçon</Link>
        </header>

        <div className="lesson-reference-grid">
          <section className="lesson-reference-left">
            <h1>Fonctions affines <span>—</span> comprendre la pente</h1>
            <div className="lesson-slope-banner"><div className="lesson-slope-copy"><span className="lesson-slope-icon">⌁</span><div><p>La pente d’une droite indique combien la droite monte (ou descend) pour chaque unité qu’on avance vers la droite.</p><strong>Plus la pente est grande, plus la droite monte rapidement.</strong></div></div><svg className="lesson-slope-diagram" viewBox="0 0 240 90" aria-label="Diagramme de pente"><text x="100" y="14">Déplacement horizontal</text><line x1="60" y1="24" x2="140" y2="24" /><text x="100" y="27">+1</text><line className="slope-line" x1="56" y1="74" x2="168" y2="30" /><circle cx="56" cy="74" r="4.5" /><circle cx="144" cy="40" r="4.5" /><line className="rise-line" x1="168" y1="28" x2="168" y2="74" /><text className="rise-text" x="180" y="44">Montée verticale</text><text className="rise-text large" x="180" y="62">+2</text></svg></div>
            <div className="lesson-exercise-grid">
              <div className="lesson-graph-card"><div className="lesson-card-row"><span>Déplace les points pour modifier la pente des droites.</span><button onClick={() => setHint(null)}>↻ &nbsp;Réinitialiser</button></div><svg className="lesson-graph" viewBox="-7 -7 14 14" role="img" aria-label="Graphique de deux droites de pentes différentes"><defs><marker id="lesson-arrow" markerWidth="4" markerHeight="4" refX="5" refY="5" orient="auto"><path d="M0 1.5L8 5L0 8.5z" fill="#111827" /></marker></defs><g className="graph-grid">{[-6,-5,-4,-3,-2,-1,1,2,3,4,5,6].map((n) => <line key={`v${n}`} x1={n} x2={n} y1="-6.5" y2="6.5" />)}{[-6,-5,-4,-3,-2,-1,1,2,3,4,5,6].map((n) => <line key={`h${n}`} x1="-6.5" x2="6.5" y1={n} y2={n} />)}</g><line className="graph-axis" x1="-6.5" x2="6.5" y1="0" y2="0" markerEnd="url(#lesson-arrow)" /><line className="graph-axis" x1="0" x2="0" y1="6.5" y2="-6.5" markerEnd="url(#lesson-arrow)" /><text className="axis-label" x="6.8" y=".1">x</text><text className="axis-label" x=".3" y="-6.4">y</text><line className="graph-orange" x1="-6.5" x2="6.5" y1="4.9" y2="-2.9" /><circle className="graph-orange-point" cx="-5" cy="4" r=".28" /><circle className="graph-orange-point" cx="5" cy="-2" r=".28" /><line className="graph-teal" x1="-5.5" x2="5.5" y1="4.37" y2="-5.97" /><circle className="graph-teal-point" cx="-4" cy="3" r=".28" /><circle className="graph-teal-point" cx="4.5" cy="-5" r=".28" /></svg><div className="lesson-legend"><span><i className="teal-dot" /> Droite A</span><span><i className="orange-dot" /> Droite B</span></div></div>
              <div className="lesson-answer-card"><div className="lesson-question-heading"><span>3</span><div><h2>Que remarques-tu quand la pente augmente ?</h2><p>Décris avec tes propres mots.</p></div></div><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Tape ta réponse ici…" maxLength={400} rows={6} /><div className="lesson-character-count">{answer.length} / 400 caractères</div><button className="lesson-check-button" onClick={checkReasoning}>✓ &nbsp; Vérifier mon raisonnement</button><button className="lesson-next-button" onClick={() => { setAnswer(""); setChecked(false); }}>Suivant &nbsp; →</button>{checked && <p className="lesson-answer-feedback">Merci pour ta réponse. Compare bien la montée verticale des deux droites.</p>}</div>
            </div>
            <div className="lesson-hints"><h3>Besoin d’aide ? Choisis un indice.</h3><div>{hints.map(([icon, title, caption], index) => <button key={title} onClick={() => { setHint(index); sendMessage(index === 0 ? "Je veux un indice" : `Explique l’indice ${index + 1}`); }}><span>{icon}</span><strong>{title}</strong><small>{caption}</small></button>)}</div><p>⌘ &nbsp; Les indices ne donnent pas la réponse.</p></div>
          </section>

          <aside className="lesson-reference-tutor"><div className="lesson-tutor-title"><span>✦</span><strong>Tuteur IA</strong></div><div className="lesson-objective">◎ &nbsp; <b>Objectif :</b> interpréter une pente</div><div className="lesson-chat">{chat.map((message, index) => <div className={`lesson-chat-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === "tutor" ? "✦" : "Y"}</span><p>{message.text}<small>10:24</small></p></div>)}{hint !== null && <div className="lesson-chat-hint">Indice {hint + 1} affiché dans la conversation.</div>}</div><div className="lesson-tutor-footer"><div className="lesson-quick-actions"><button onClick={() => sendMessage("Je veux un indice")}>☀ &nbsp; Donner un indice</button><button onClick={() => sendMessage("Pose-moi une question")}>? &nbsp; Me poser une question</button><button onClick={() => sendMessage("Expliquer autrement")}>☷ &nbsp; Expliquer autrement</button></div><div className="lesson-voice">〰〰 <button aria-label="Activer le microphone">♩</button> 〰〰</div><form onSubmit={(event) => { event.preventDefault(); sendMessage(); }}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Écris ou parle à ton tuteur…" aria-label="Message au tuteur IA" /><button type="submit" aria-label="Envoyer le message">➤</button></form><div className="lesson-pledge">🛡 &nbsp; Je ne donne pas la réponse tout de suite : je t’aide à la trouver.</div></div></aside>
        </div>
      </div>
    </main>
  );
}
