"use client";

import Link from "next/link";
import { useState } from "react";

const participants = [
  { name: "Yasmine", avatar: "👧🏻", tone: "mint", active: true },
  { name: "Adam", avatar: "🧑🏻", tone: "cream" },
  { name: "Sara", avatar: "👧🏼", tone: "blue" },
  { name: "Omar", avatar: "🧑🏽", tone: "teal" },
];

export default function StudentLivePage() {
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [idea, setIdea] = useState("");
  const [shared, setShared] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [help, setHelp] = useState<"hint" | "rephrase" | null>(null);
  const fr = locale === "fr";

  return <main className="collab-student-shell">
    <header className="collab-header">
      <Link href="/student" className="collab-brand"><span className="collab-brand-mark">☾</span><strong>{fr ? "Classe collaborative" : "Collaborative class"}</strong><span className="collab-people-icon">♧</span></Link>
      <div className="collab-header-block"><span>{fr ? "Cours" : "Course"}</span><b>{fr ? "Sciences — l’eau et les écosystèmes" : "Science — water and ecosystems"}</b></div>
      <div className="collab-header-block collab-objective"><span>{fr ? "Objectif" : "Goal"}</span><b>{fr ? "Expliquer comment un écosystème reste en équilibre" : "Explain how an ecosystem stays balanced"}</b></div>
      <div className="collab-header-status"><span className="collab-live-dot">● {fr ? "En direct" : "Live"}</span><span className="collab-clock">◷ 12:34</span><span>♧ 4 {fr ? "élèves" : "students"}</span><button className="collab-lang" onClick={() => setLocale(fr ? "en" : "fr")}>{fr ? "EN" : "FR"}</button></div>
    </header>
    <section className="collab-student-body">
      <div className="collab-student-participants">{participants.map((person) => <article className={`collab-person-card ${person.active ? "selected" : ""}`} key={person.name}><div className={`collab-person-art ${person.tone}`}><span>{person.avatar}</span><i>▮▮▮</i></div><strong>{person.name}</strong></article>)}</div>
      <div className="collab-student-main-grid">
        <section className="collab-work-card"><div className="collab-work-diagram"><div className="collab-diagram-label flowers">{fr ? "FLEURS" : "FLOWERS"}</div><div className="collab-diagram-flower">🌼<br />🌿</div><div className="collab-diagram-bee">🐝</div><div className="collab-diagram-bird">🐦</div><div className="collab-diagram-label plants">{fr ? "PLANTES" : "PLANTS"}</div><div className="collab-diagram-label honey">{fr ? "MIEL" : "HONEY"}</div><div className="collab-diagram-label insects">{fr ? "AUTRES INSECTES" : "OTHER INSECTS"}</div><span className="diagram-arrow arrow-one">→</span><span className="diagram-arrow arrow-two">→</span><span className="diagram-arrow arrow-three">↗</span></div><div className="collab-work-prompt"><span className="collab-kicker">{fr ? "Défi partagé" : "Shared challenge"}</span><h1>{fr ? "Que se passe-t-il si les abeilles disparaissent ?" : "What happens if bees disappear?"}</h1><p className="collab-instruction">💡 {fr ? "Observe le schéma et explique les effets possibles sur l’écosystème." : "Observe the diagram and explain possible effects on the ecosystem."}</p><textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder={fr ? "Écris ton idée ici…" : "Write your idea here…"} /><div className="collab-work-actions"><button className="collab-primary" onClick={() => setShared(true)}>⇧ {shared ? (fr ? "Idée partagée ✓" : "Idea shared ✓") : (fr ? "Partager mon idée" : "Share my idea")}</button><button className="collab-outline amber" onClick={() => setHelp("hint")}>? {fr ? "Demander un indice" : "Ask for a hint"}</button></div></div></section>
        <aside className="collab-turn-card"><span className="collab-turn-icon">⌛</span><h2>{fr ? "Tu es le prochain à parler" : "You speak next"}</h2><p>{fr ? "Prépare ton idée." : "Prepare your idea."}</p><div className="collab-countdown"><strong>18</strong><span>{fr ? "secondes" : "seconds"}</span></div><button className="collab-primary" onClick={() => setHandRaised(true)}>☝ {handRaised ? (fr ? "Main levée ✓" : "Hand raised ✓") : (fr ? "Je suis prêt" : "I’m ready")}</button></aside>
        <aside className="collab-ai-card"><div className="collab-ai-heading"><span>✦</span><h2>{fr ? "Aide IA" : "AI help"}</h2></div><div className="collab-chat-bubble">{fr ? "Je peux t’aider à préparer ton idée." : "I can help you prepare your idea."}</div><div className="collab-chat-bubble">{fr ? "Quelle preuve peux-tu utiliser ?" : "What evidence could you use?"}</div><button onClick={() => setHelp("hint")}>💡 {fr ? "Indice" : "Hint"}</button><button onClick={() => setHelp("rephrase")}>⟳ {fr ? "Reformuler" : "Rephrase"}</button><div className="collab-ai-compose"><span>◉</span><input placeholder={fr ? "Écris ou parle…" : "Write or speak…"} /><b>➤</b></div><small>♧ {fr ? "IA pour t’aider à réfléchir, pas pour remplacer tes idées." : "AI helps you think, it does not replace your ideas."}</small></aside>
      </div>
      <div className="collab-bottom-grid"><section className="collab-notes-card"><div><span className="collab-notes-icon">▤</span><h2>{fr ? "Notes de la session" : "Session notes"}</h2><small>{fr ? "Tes notes sont privées et visibles seulement par toi." : "Your notes are private and visible only to you."}</small></div><textarea placeholder={fr ? "J’écris mes idées, des mots-clés ou des exemples ici…" : "Write ideas, keywords or examples here…"} /><span className="collab-character-count">0/1000</span></section><button className="collab-challenge-card" onClick={() => setHelp("hint")}><span className="collab-trophy">♜</span><div><h2>{fr ? "Défi de fin — 3 questions" : "Final challenge — 3 questions"}</h2><p>{fr ? "Réponds pour vérifier ce que tu as compris." : "Answer to check what you understood."}</p></div><b>▶</b></button></div>
    </section>
    <footer className="collab-footer"><button>◉<span>Micro</span></button><button>▣<span>{fr ? "Caméra" : "Camera"}</span></button><button onClick={() => setHandRaised(!handRaised)}>☝<span>{fr ? "Lever la main" : "Raise hand"}</span></button><button>•••<span>Chat</span></button><i /><button className="collab-leave">☎ {fr ? "Quitter" : "Leave"}</button></footer>
    {help && <div className="collab-toast" role="status">{help === "hint" ? (fr ? "Indice : pense à ce que les fleurs et les fruits ont en commun." : "Hint: think about what flowers and fruit have in common.") : (fr ? "Reformulation : comment la disparition d’un pollinisateur change-t-elle la chaîne ?" : "Rephrase: how does losing a pollinator change the chain?")}<button onClick={() => setHelp(null)}>×</button></div>}
  </main>;
}
