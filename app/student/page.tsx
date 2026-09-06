"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useState } from "react";

type ChatMessage = { role: "tutor" | "student"; text: string };

const hints = [
  ["⌕", "Indice 1", "Observer la montée"],
  ["▥", "Indice 2", "Comparer deux pentes"],
  ["▤", "Voir un exemple", "Un cas concret"],
] as const;

type HomeworkQuestion = { title: string; prompt: string; placeholder: string; hint: string; table?: { head: string[]; rows: string[][] } };
const homeworkQuestions: HomeworkQuestion[] = [
  { title: "Fonctions affines — lire une situation", prompt: "Dans une relation affine, que représente la valeur f(0) ?", placeholder: "Explique ce que représente f(0) dans tes mots…", hint: "Regarde la valeur de la relation lorsque x = 0.", table: { head: ["x", "0", "1", "2"], rows: [["f(x)", "3", "5", "7"]] } },
  { title: "Fonctions affines — calculer le taux de variation", prompt: "À l’aide des points A(1, 2) et B(4, 8), calcule le taux de variation de la droite.", placeholder: "Étape 1 : Δy = y₂ − y₁ = …\nÉtape 2 : Δx = x₂ − x₁ = …\nÉtape 3 : a = Δy / Δx = …", hint: "Commence par calculer la variation verticale, puis la variation horizontale.", table: { head: ["Point", "x", "y"], rows: [["A", "1", "2"], ["B", "4", "8"]] } },
  { title: "Fonctions affines — comprendre la pente", prompt: "Que remarques-tu quand la pente augmente ?", placeholder: "Tape ta réponse ici…", hint: "Compare la montée verticale des deux droites pour le même déplacement horizontal." },
  { title: "Fonctions affines — problème appliqué montréalais", prompt: "Un taxi montréalais facture des frais fixes de 5 $ puis 2 $ par kilomètre parcouru. Écris la règle affine f(x) et détermine le coût d’une course de 8 km.", placeholder: "1) Règle affine : f(x) = …\n2) Pour 8 km : f(8) = …\n3) Coût total = … $", hint: "Les frais fixes sont la valeur de départ. Le prix par kilomètre est le taux de variation.", table: { head: ["Élément", "Valeur"], rows: [["Frais fixes", "5 $"], ["Par kilomètre", "2 $"], ["Distance", "8 km"]] } },
  { title: "Fonctions affines — reconnaître une relation", prompt: "Le tableau suivant décrit-il une relation affine ? Justifie ta réponse.", placeholder: "Observe les écarts entre les valeurs de y, puis justifie ta réponse…", hint: "Compare les différences entre deux valeurs de y quand x augmente toujours de 1.", table: { head: ["x", "0", "1", "2", "3"], rows: [["y", "4", "7", "10", "13"]] } },
  { title: "Fonctions affines — comparer deux droites", prompt: "Quelle droite a le plus grand taux de variation : la droite A ou la droite B ? Explique comment tu le sais.", placeholder: "La droite … a le plus grand taux de variation parce que…", hint: "Une droite qui monte plus rapidement a une pente plus grande." },
  { title: "Fonctions affines — trouver une règle", prompt: "Une droite a un taux de variation de 3 et passe par le point (2, 7). Trouve sa règle affine.", placeholder: "La forme est f(x) = ax + b. Remplace les valeurs et trouve b…", hint: "Commence par écrire f(x) = 3x + b, puis utilise le point (2, 7)." },
  { title: "Fonctions affines — expliquer une stratégie", prompt: "Résume une méthode fiable pour résoudre un problème de fonction affine.", placeholder: "Ma méthode en trois étapes :\n1) …\n2) …\n3) …", hint: "Cherche d’abord le taux de variation, puis la valeur initiale, et vérifie avec une valeur." },
];
const graphPresentations = [
  ["Tableau de valeurs — relation affine", "Observe la valeur initiale quand x = 0.", "Mettre en évidence (0, b)"],
  ["Repère cartésien — points A et B", "Observe les variations entre les deux points.", "Calculer étape par étape"],
  ["Comparer les pentes des deux droites", "Observe laquelle monte le plus rapidement.", "Réinitialiser"],
  ["Coût d’une course en taxi à Montréal", "Prise en charge à 5 $, puis 2 $ par km parcouru.", "Réinitialiser"],
  ["Tableau de valeurs — évolution régulière", "Vérifie si les écarts restent constants.", "Vérifier les écarts"],
  ["Repère cartésien — comparer deux droites", "Compare leur montée pour un même déplacement.", "Comparer les pentes"],
  ["Droite affine — trouver la règle", "Utilise le point connu pour retrouver b.", "Calculer étape par étape"],
  ["Synthèse — méthode de résolution", "Utilise le graphique pour vérifier ta stratégie.", "Réinitialiser"],
] as const;

function GraphGrid({ viewBox = "-7 -7 14 14" }: { viewBox?: string }) {
  return <><defs><marker id="lesson-special-arrow" markerWidth="4" markerHeight="4" refX="5" refY="5" orient="auto"><path d="M0 1.5L8 5L0 8.5z" fill="#111827" /></marker></defs><g className="special-grid">{Array.from({ length: 13 }, (_, i) => i - 6).map((n) => <line key={`v${n}`} x1={n} x2={n} y1="-6.5" y2="6.5" />)}{Array.from({ length: 13 }, (_, i) => i - 6).map((n) => <line key={`h${n}`} x1="-6.5" x2="6.5" y1={n} y2={n} />)}</g><line className="special-axis" x1="-6.5" x2="6.5" y1="0" y2="0" markerEnd="url(#lesson-special-arrow)" /><line className="special-axis" x1="0" x2="0" y1="6.5" y2="-6.5" markerEnd="url(#lesson-special-arrow)" /><text className="special-axis-label" x="6.8" y=".1">x</text><text className="special-axis-label" x=".3" y="-6.4">y</text></>;
}

function InterceptGraph() {
  return <svg className="lesson-graph lesson-special-graph" viewBox="-7 -7 14 14" role="img" aria-label="Deux droites avec leurs intersections sur l’axe vertical"><GraphGrid /><line className="special-axis-highlight" x1="0" x2="0" y1="6.5" y2="-6.5" /><line className="graph-orange" x1="-6.5" x2="6.5" y1="6.2" y2="-4.2" /><circle className="special-intercept orange" cx="0" cy="1" r=".48" /><text className="special-label orange-text" x=".5" y="1.25">(0, -1)</text><line className="graph-teal" x1="-6.5" x2="6" y1="-.25" y2="-6" /><circle className="special-intercept teal" cx="0" cy="-3" r=".5" /><text className="special-label teal-text" x=".5" y="-3.2">(0, 3)</text><circle className="special-point teal" cx="4" cy="-5" r=".25" /><g className="special-ticks"><text x="-6" y=".55">-6</text><text x="-3" y=".55">-3</text><text x="3" y=".55">3</text><text x="6" y=".55">6</text><text x="-.25" y="-3">3</text><text x="-.25" y="1">-1</text></g></svg>;
}

function RateGraph() {
  return <svg className="lesson-graph lesson-special-graph" viewBox="-1.5 -10.5 8 11.5" role="img" aria-label="Droite passant par les points A 1 2 et B 4 8"><GraphGrid /><polygon className="slope-area" points="1,-2 4,-2 4,-8" /><line className="special-delta-x" x1="1" x2="4" y1="-2" y2="-2" /><line className="special-delta-y" x1="4" x2="4" y1="-2" y2="-8" /><line className="rate-line" x1="-.2" x2="4.7" y1=".4" y2="-9.4" /><circle className="special-point teal" cx="1" cy="-2" r=".24" /><circle className="special-point teal" cx="4" cy="-8" r=".24" /><text className="special-label teal-text" x="1.2" y="-2.6">A (1, 2)</text><text className="special-label teal-text" x="3.1" y="-8.3">B (4, 8)</text><text className="delta-label blue-text" x="2.5" y="-1.45">Δx = +3</text><text className="delta-label orange-text" x="4.2" y="-5">Δy = +6</text></svg>;
}

function TaxiGraph() {
  return <svg className="lesson-graph lesson-special-graph taxi-special-graph" viewBox="-2 -2 14 26" role="img" aria-label="Graphique du coût d’un taxi montréalais"><defs><marker id="taxi-special-arrow" markerWidth="4" markerHeight="4" refX="5" refY="5" orient="auto"><path d="M0 1.5L8 5L0 8.5z" fill="#111827" /></marker></defs><g className="taxi-grid">{Array.from({ length: 11 }, (_, i) => <line key={`x${i}`} x1={i} x2={i} y1="0" y2="24" />)}{Array.from({ length: 7 }, (_, i) => <line key={`y${i}`} x1="0" x2="10.5" y1={i * 4} y2={i * 4} />)}</g><line className="taxi-axis" x1="0" x2="11" y1="24" y2="24" markerEnd="url(#taxi-special-arrow)" /><line className="taxi-axis" x1="0" x2="0" y1="24" y2=".5" markerEnd="url(#taxi-special-arrow)" /><text className="taxi-label" x="5" y="25.5">Distance parcourue (km)</text><text className="taxi-label" transform="rotate(-90)" x="-12" y="-1">Coût total ($)</text><line className="taxi-base" x1="0" x2="8" y1="19" y2="19" /><line className="taxi-projection" x1="8" x2="8" y1="24" y2="3" /><line className="taxi-projection" x1="0" x2="8" y1="3" y2="3" /><line className="taxi-line" x1="0" x2="9.5" y1="19" y2="5" /><circle className="taxi-point" cx="8" cy="3" r=".45" /><rect className="taxi-tooltip" height="2.2" rx=".5" width="4.8" x="4.8" y=".8" /><text className="taxi-tooltip-text" x="7.2" y="2.2">8 km = 21,00 $</text><text className="taxi-note orange-text" x="2.2" y="17">+4 $ (2 km × 2 $)</text><text className="taxi-note orange-text" x=".5" y="18.3">b = 5 $ (frais fixes)</text></svg>;
}

function SpecialGraphCard({ questionIndex }: { questionIndex: number }) {
  const presentation = graphPresentations[questionIndex];
  return <div className="lesson-graph-card lesson-special-card"><div className="lesson-card-row"><span><b>{presentation[0]}</b><small>{presentation[1]}</small></span><button type="button">↻ &nbsp;{presentation[2]}</button></div>{questionIndex === 0 ? <InterceptGraph /> : questionIndex === 1 || questionIndex === 2 ? <RateGraph /> : <TaxiGraph />}<div className="lesson-legend"><span><i className="teal-dot" /> Données principales</span><span><i className="orange-dot" /> Variation</span></div></div>;
}

function StudentLessonPage() {
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [hint, setHint] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [questionIndex, setQuestionIndex] = useState(2);
  const [chat, setChat] = useState<ChatMessage[]>([
    { role: "tutor", text: "Salam ! Je suis ton tuteur IA. Je suis là pour t’aider à réfléchir et progresser." },
    { role: "tutor", text: "Qu’est-ce qui change entre les deux droites ? Compare d’abord leur montée pour le même déplacement horizontal." },
  ]);
  const question = homeworkQuestions[questionIndex];

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

  function nextQuestion() {
    setQuestionIndex((current) => Math.min(current + 1, homeworkQuestions.length - 1));
    setAnswer("");
    setChecked(false);
    setHint(null);
  }

  return (
    <main className="lesson-reference-page">
      <aside className="student-senior-sidebar" aria-label="Navigation élève">
        <Link href="/student" className="senior-sidebar-brand"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <p className="senior-sidebar-label">MON ESPACE</p>
        <nav className="senior-sidebar-nav">
          <Link className="active" href="/student"><span className="senior-nav-icon home">⌂</span><span>Accueil</span><small>⌘1</small></Link>
          <Link href="/student/cours"><span className="senior-nav-icon courses">▣</span><span>Mes cours</span><small>⌘2</small></Link>
          <Link href="/student/jeux"><span className="senior-nav-icon games">◇</span><span>Jouer &amp; apprendre</span><small>⌘3</small></Link>
          <Link href="/student/progression"><span className="senior-nav-icon progress">↗</span><span>Ma progression</span><small>⌘4</small></Link>
        </nav>
        <div className="senior-sidebar-bottom"><span className="senior-sidebar-avatar">Y</span><div><strong>Yasser</strong><small>Élève · Secondaire</small></div><button type="button" aria-label="Ouvrir le profil">⋯</button></div>
      </aside>
      <div className="lesson-reference-frame">
        <header className="lesson-reference-topbar">
          <div className="lesson-reference-brand"><span className="lesson-brand-mark">⌂</span><span><b>Madrasa</b><b>Québec</b></span><nav><Link href="/student/cours">Mes cours</Link><i>/</i><span>Mathématiques</span><i>/</i><span>Algèbre</span></nav></div>
          <div className="lesson-question-progress"><strong>Question {questionIndex + 1} sur {homeworkQuestions.length}</strong><div><span><i style={{ width: `${((questionIndex + 1) / homeworkQuestions.length) * 100}%` }} /></span><em>{homeworkQuestions.map((item, index) => <b className={index <= questionIndex ? "is-done" : ""} key={item.title} />)}</em></div></div>
          <Link href="/student/cours" className="lesson-exit">↪ &nbsp; Quitter la leçon</Link>
        </header>

        <div className={`lesson-reference-grid lesson-question-${questionIndex}`}>
          <section className="lesson-reference-left">
            <h1>{question.title}</h1>
            <div className="lesson-slope-banner"><div className="lesson-slope-copy"><span className="lesson-slope-icon">⌁</span><div><p>Une fonction affine relie deux quantités avec une évolution régulière.</p><strong>Lis le tableau ou le graphique avant de formuler ta réponse.</strong></div></div><svg className="lesson-slope-diagram" viewBox="0 0 240 90" aria-label="Diagramme de variation"><text x="100" y="14">Déplacement horizontal</text><line x1="60" y1="24" x2="140" y2="24" /><text x="100" y="27">+1</text><line className="slope-line" x1="56" y1="74" x2="168" y2="30" /><circle cx="56" cy="74" r="4.5" /><circle cx="144" cy="40" r="4.5" /><line className="rise-line" x1="168" y1="28" x2="168" y2="74" /><text className="rise-text" x="180" y="44">Variation</text><text className="rise-text large" x="180" y="62">+2</text></svg></div>
            <div className="lesson-exercise-grid">{(questionIndex === 0 || questionIndex === 1 || questionIndex === 2 || questionIndex === 3) && <SpecialGraphCard questionIndex={questionIndex} />}
              <div className="lesson-graph-card"><div className="lesson-card-row"><span><b>{graphPresentations[questionIndex][0]}</b><small>{graphPresentations[questionIndex][1]}</small></span><button onClick={() => setHint(null)}>↻ &nbsp;{graphPresentations[questionIndex][2]}</button></div>{question.table ? <table className="lesson-graph-data-table"><thead><tr>{question.table.head.map((cell) => <th key={cell}>{cell}</th>)}</tr></thead><tbody>{question.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table> : <div className="lesson-graph-observation"><span>◎</span><p>Utilise les deux droites et leurs points repères pour justifier ton observation.</p></div>}<svg className="lesson-graph" viewBox="-7 -7 14 14" role="img" aria-label={graphPresentations[questionIndex][0]}><defs><marker id="lesson-arrow" markerWidth="4" markerHeight="4" refX="5" refY="5" orient="auto"><path d="M0 1.5L8 5L0 8.5z" fill="#111827" /></marker></defs><g className="graph-grid">{[-6,-5,-4,-3,-2,-1,1,2,3,4,5,6].map((n) => <line key={`v${n}`} x1={n} x2={n} y1="-6.5" y2="6.5" />)}{[-6,-5,-4,-3,-2,-1,1,2,3,4,5,6].map((n) => <line key={`h${n}`} x1="-6.5" x2="6.5" y1={n} y2={n} />)}</g><line className="graph-axis" x1="-6.5" x2="6.5" y1="0" y2="0" markerEnd="url(#lesson-arrow)" /><line className="graph-axis" x1="0" x2="0" y1="6.5" y2="-6.5" markerEnd="url(#lesson-arrow)" /><text className="axis-label" x="6.8" y=".1">x</text><text className="axis-label" x=".3" y="-6.4">y</text><line className="graph-orange" x1="-6.5" x2="6.5" y1="4.9" y2="-2.9" /><circle className="graph-orange-point" cx="-5" cy="4" r=".28" /><circle className="graph-orange-point" cx="5" cy="-2" r=".28" /><line className="graph-teal" x1="-5.5" x2="5.5" y1="4.37" y2="-5.97" /><circle className="graph-teal-point" cx="-4" cy="3" r=".28" /><circle className="graph-teal-point" cx="4.5" cy="-5" r=".28" /></svg><div className="lesson-legend"><span><i className="teal-dot" /> Droite A</span><span><i className="orange-dot" /> Droite B</span></div></div>
              <div className="lesson-answer-card"><div className="lesson-question-heading"><span>{questionIndex + 1}</span><div><h2>{question.prompt}</h2><p>Décris ton raisonnement étape par étape.</p></div></div>{question.table && <table className="lesson-question-table"><thead><tr>{question.table.head.map((cell) => <th key={cell}>{cell}</th>)}</tr></thead><tbody>{question.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table>}<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder={question.placeholder} maxLength={400} rows={question.table ? 4 : 6} /><div className="lesson-character-count">{answer.length} / 400 caractères</div><button className="lesson-check-button" onClick={checkReasoning}>✓ &nbsp; Vérifier mon raisonnement</button><button className="lesson-next-button" onClick={nextQuestion}>{questionIndex === homeworkQuestions.length - 1 ? "Terminer le devoir" : "Suivant"} &nbsp; →</button>{checked && <p className="lesson-answer-feedback">{questionIndex === 2 ? "Merci pour ta réponse." : "Merci pour ta réponse. Ton raisonnement a bien été enregistré."}</p>}</div>
            </div>
            <div className="lesson-hints"><h3>Besoin d’aide ? Choisis un indice.</h3><div>{hints.map(([icon, title, caption], index) => <button key={title} onClick={() => { setHint(index); sendMessage(index === 0 ? question.hint : `Explique l’indice ${index + 1}`); }}><span>{icon}</span><strong>{title}</strong><small>{index === 0 ? question.hint : caption}</small></button>)}</div><p>⌘ &nbsp; Les indices ne donnent pas la réponse.</p></div>
          </section>

          <aside className="lesson-reference-tutor"><div className="lesson-tutor-title"><span>✦</span><strong>Tuteur IA</strong></div><div className="lesson-objective">◎ &nbsp; <b>Objectif :</b> interpréter une pente</div><div className="lesson-chat">{chat.map((message, index) => <div className={`lesson-chat-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === "tutor" ? "✦" : "Y"}</span><p>{message.text}<small>10:24</small></p></div>)}{hint !== null && <div className="lesson-chat-hint">Indice {hint + 1} affiché dans la conversation.</div>}</div><div className="lesson-tutor-footer"><div className="lesson-quick-actions"><button onClick={() => sendMessage("Je veux un indice")}>☀ &nbsp; Donner un indice</button><button onClick={() => sendMessage("Pose-moi une question")}>? &nbsp; Me poser une question</button><button onClick={() => sendMessage("Expliquer autrement")}>☷ &nbsp; Expliquer autrement</button></div><div className="lesson-voice">〰〰 <button aria-label="Activer le microphone">♩</button> 〰〰</div><form onSubmit={(event) => { event.preventDefault(); sendMessage(); }}><input value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Écris ou parle à ton tuteur…" aria-label="Message au tuteur IA" /><button type="submit" aria-label="Envoyer le message">➤</button></form><div className="lesson-pledge">🛡 &nbsp; Je ne donne pas la réponse tout de suite : je t’aide à la trouver.</div></div></aside>
        </div>
      </div>
    </main>
  );
}

export default function StudentPage() {
  const pathname = usePathname();
  if (pathname.includes("/student/sceance/fonction-affine-102")) return <StudentLessonPage />;
  return <main className="student-v2-shell student-dashboard-home"><aside className="student-v2-sidebar hidden lg:flex"><Link href="/" className="student-v2-logo"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><span className="student-v2-label">MON ESPACE</span><Link className="student-v2-nav active" href="/student">⌂ <span>Aujourd’hui</span></Link><Link className="student-v2-nav" href="/student/cours">▣ <span>Mes cours</span></Link><Link className="student-v2-nav" href="/student/jeux">◈ <span>Jouer et apprendre</span></Link><Link className="student-v2-nav" href="/student/progression">✦ <span>Ma progression</span></Link><div className="student-v2-sidebar-help">Besoin d’aide ?<br /><small>Ton tuteur t’aide à réfléchir.</small></div></aside><section className="student-v2-main"><header className="student-v2-top"><div><p className="student-v2-kicker">ESPACE ÉLÈVE · CETTE SEMAINE</p><h1>Bonjour Yasmine <span>👋</span></h1></div><div className="student-v2-profile"><span>Y</span><b>Mon profil</b></div></header><section className="student-v2-hero"><div><p className="student-v2-kicker">MISSION DU JOUR</p><h2>Une mission claire,<br />puis une petite victoire.</h2><p>Commence par ton cours de mathématiques. Tu peux demander un indice quand tu bloques.</p><div className="student-dashboard-actions"><Link href="/student/sceance/fonction-affine-102" className="student-v2-primary">Continuer le devoir <span>→</span></Link><Link href="/student/cours" className="student-v2-ghost">Voir tous les cours</Link></div></div><div className="student-v2-mission"><span>Mission du jour · 15 min</span><strong>Fonctions affines</strong><small>Comprendre la pente</small><div className="student-v2-progress"><i style={{ width: "60%" }} /></div><em>60%</em></div></section><div className="student-v2-grid"><section className="student-v2-panel"><div className="student-v2-panel-head"><div><p className="student-v2-kicker">MES COURS</p><h2>Les prochaines victoires</h2></div><Link href="/student/cours" className="student-v2-link">Tout voir →</Link></div><div className="student-v2-subjects"><Link href="/student/sceance/fonction-affine-102" className="student-v2-subject"><span className="student-v2-subject-icon blue">∑</span><span><b>Fonctions affines</b><small>Comprendre la pente</small></span><strong>60%</strong></Link><Link href="/student/cours/francais" className="student-v2-subject"><span className="student-v2-subject-icon purple">Aa</span><span><b>Français</b><small>Argumenter clairement</small></span><strong>42%</strong></Link><Link href="/student/cours/sciences" className="student-v2-subject"><span className="student-v2-subject-icon green">⌁</span><span><b>Sciences</b><small>Les écosystèmes</small></span><strong>28%</strong></Link></div></section><aside className="student-v2-ai"><div className="student-v2-ai-orb">✦</div><p className="student-v2-kicker">TUTEUR IA</p><h2>Tu bloques ? On va trouver une piste.</h2><p>Écris ou parle à ton tuteur. Il te posera d’abord une question pour t’aider à raisonner.</p><Link href="/student/sceance/fonction-affine-102" className="student-v2-ai-link">Ouvrir le tuteur →</Link></aside></div><section className="student-v2-create"><div><span className="student-v2-create-icon">✦</span><div><p className="student-v2-kicker">PROCHAINE ÉTAPE</p><h2>Terminer la question sur la pente</h2><p>Une réponse courte suffit. L’important est d’expliquer ton idée.</p></div></div><Link href="/student/sceance/fonction-affine-102" className="student-v2-primary">Reprendre →</Link></section></section></main>;
}
