"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Child = { id: string; name: string; age: string; level: string };
type ProgressReport = { metrics: { label: string; value: string; detail: string; tone: "green" | "gold" | "blue" | "purple" }[]; rows: { subject: string; completed: string; score: string; trend: string; status: string; tone: "green" | "gold" | "blue" | "purple" }[]; strengths: string[]; focus: { title: string; detail: string; priority: string } };
type CourseWizard = { questions: { id: string; label: string; options: string[] }[] };
type Message = { role: "assistant" | "parent"; title?: string; body: string; sources?: string[]; action?: string; followUps?: { label: string; prompt: string }[]; progressReport?: ProgressReport; courseWizard?: CourseWizard };
type Job = { id: string; title: string; status: "queued" | "review_required" | "approved" | "rejected"; credits: number; childName: string; createdAt: string; addedToPlan?: boolean };
type TraceStep = { label: string; detail: string; tool?: string; state: "done" | "active" };

const children: Child[] = [{ id: "amine", name: "Amine", age: "10 ans", level: "5e année" }, { id: "sara", name: "Sara", age: "14 ans", level: "2e secondaire" }];
const quickPrompts = [
  ["progress", "Résumer la progression"],
  ["week", "Que travailler cette semaine ?"],
  ["lesson", "Créer une révision"],
] as const;

export default function ParentAssistantPage() {
  const [locale, setLocale] = useState<"fr" | "en">("fr");
  const [childId, setChildId] = useState("amine");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", title: "Bonjour, je peux vous aider à décider quoi faire ensuite", body: "Je peux lire la progression autorisée, les preuves et le plan de la semaine. Je ne publie jamais un devoir ni une note sans votre validation.", sources: ["Contexte familial autorisé"] }]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [trace, setTrace] = useState<TraceStep[]>([]);
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, string>>({});
  const child = children.find((item) => item.id === childId) ?? children[0];
  const isEnglish = locale === "en";

  useEffect(() => { const saved = window.localStorage.getItem("madrasa-locale"); if (saved === "en") setLocale("en"); }, []);

  async function ask(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setMessage(""); setMessages((current) => [...current, { role: "parent", body: clean }]); setBusy(true);
    const isLesson = /cours|révision|revision|devoir/i.test(clean);
    const isWeek = /semaine|plan|réserver|planifie/i.test(clean);
    const targetChildName = /\bsara\b/i.test(clean) ? "Sara" : /\bamine\b/i.test(clean) ? "Amine" : child.name;
    const firstTool = isLesson ? "Cours approuvés" : isWeek ? "Plan de la semaine" : "Progression de l’enfant";
    const firstDetail = isLesson ? `Je cherche les objectifs disponibles pour ${targetChildName}.` : isWeek ? `Je lis les créneaux et les activités de ${targetChildName}.` : `Je vérifie les activités récentes de ${targetChildName}.`;
    setTrace([
      { label: "Je comprends votre demande", detail: "Je prépare une réponse adaptée à votre famille.", state: "done" },
      { label: `Je vérifie les données de ${child.name}`, detail: firstDetail, tool: firstTool, state: "active" },
    ]);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 850));
      setTrace((current): TraceStep[] => [...current.map((step) => ({ ...step, state: "done" as const })), { label: "J’analyse les éléments utiles", detail: isLesson ? "Je compare les objectifs du cours et les activités déjà réalisées." : isWeek ? "Je cherche une recommandation réaliste selon le temps disponible." : "Je distingue les faits observés des pistes à explorer.", tool: isLesson ? "Analyse de séance" : isWeek ? "Calendrier familial" : "Analyse de progression", state: "active" }]);
      await new Promise((resolve) => window.setTimeout(resolve, 800));
      const response = await fetch("/api/parent-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: clean, childId, childName: targetChildName }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setTrace((current) => current.map((step) => ({ ...step, state: "done" as const })).concat({ label: "Réponse prête", detail: "J’ai gardé les sources visibles et laissé la validation au parent.", state: "done" }));
      setMessages((current) => [...current, { role: "assistant", ...data.response }]);
    } catch { setTrace((current) => current.map((step) => ({ ...step, state: "done" as const })).concat({ label: "Impossible de terminer", detail: "Réessayez : aucune donnée n’a été modifiée.", state: "done" })); setMessages((current) => [...current, { role: "assistant", title: "Réponse indisponible", body: "Le service est indisponible pour le moment. Vous pouvez réessayer sans perdre votre conversation." }]); }
    finally { setBusy(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void ask(message); }

  function choosePrompt(prompt: string) { setMessage(prompt); window.requestAnimationFrame(() => document.querySelector<HTMLInputElement>(".ai-composer input")?.focus()); }

  async function createLesson(customRequest?: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/generation-jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parentId: "demo-parent", childId, type: "lesson", subject: "Sciences", objective: "Comprendre et expliquer un concept avec ses propres mots", requestText: customRequest ?? `Créer une révision de fractions pour ${child.name}`, locale }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setJobs((current) => [{ id: data.id, title: data.draft?.title ?? "Révision de fractions", status: "review_required", credits: data.creditsReserved ?? 1, childName: child.name, createdAt: "à l’instant" }, ...current]);
      setMessages((current) => [...current, { role: "assistant", title: "Brouillon prêt à vérifier", body: "Le devoir est dans la file. Vérifiez l’objectif et les questions avant de l’ajouter au plan.", sources: ["Progression récente", "Cours Fractions"], action: "Voir le brouillon" }]);
    } catch { setMessages((current) => [...current, { role: "assistant", title: "Création impossible", body: "Le brouillon n’a pas pu être créé. Aucun crédit n’est débité en cas d’échec." }]); }
    finally { setBusy(false); }
  }

  function updateJob(id: string, status: Job["status"], addedToPlan = false) { setJobs((current) => current.map((job) => job.id === id ? { ...job, status, addedToPlan } : job)); }

  function selectWizardAnswer(questionId: string, answer: string) { setWizardAnswers((current) => ({ ...current, [questionId]: answer })); }

  function submitWizard(wizard: CourseWizard) {
    const summary = wizard.questions.map((question) => `${question.label} : ${wizardAnswers[question.id]}`).join(" · ");
    void createLesson(`Créer le cours personnalisé de sciences pour ${child.name}. Préférences choisies — ${summary}`);
    setWizardAnswers({});
  }

  const suggestions = [
    ["↗", `Résume la progression d’${child.name} cette semaine`, "progress"],
    ["♧", `Regarder quoi améliorer pour le cours de français de ${child.name === "Amine" ? "Sara" : "Amine"}`, "week"],
    ["✎", `Créer un cours personnalisé de sciences pour ${child.name}`, "lesson"],
    ["?", `Pourquoi ${child.name === "Amine" ? "Sara" : "Amine"} bloque sur les fractions ?`, "progress"],
    ["▣", "Planifie les révisions du brevet québécois pour jeudi", "week"],
  ] as const;

  return <main className="app-shell parent-ai-shell">
    <aside className="sidebar parent-ai-sidebar">
      <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
      <div className="side-label">{isEnglish ? "Family" : "Famille"}</div>
      <Link className="side-link" href="/parent"><span>⌂</span><span>{isEnglish ? "Home" : "Accueil"}</span></Link>
      <Link className="side-link" href="/parent/plan"><span>☷</span><span>{isEnglish ? "Weekly plan" : "Plan de la semaine"}</span></Link>
      <Link className="side-link" href="/parent/cours"><span>▣</span><span>{isEnglish ? "Courses" : "Cours"}</span></Link>
      <Link className="side-link active" href="/parent/assistant"><span>✦</span><span>{isEnglish ? "AI assistant" : "Assistant IA"}</span></Link>
      <Link className="side-link" href="/parent/communaute"><span>◌</span><span>{isEnglish ? "Community" : "Communauté"}</span></Link>
      <Link className="side-link" href="/parent/parcours-quebec"><span>◫</span><span>{isEnglish ? "Québec path" : "Parcours Québec"}</span></Link>
      <Link className="side-link" href="/parent/budget"><span>$</span><span>{isEnglish ? "Budget" : "Budget"}</span></Link>
      <Link className="side-link side-settings-link" href="/parent/settings"><span>⚙</span><span>{isEnglish ? "Settings" : "Paramètres"}</span></Link>
      <div className="sidebar-bottom">{isEnglish ? "AI content always needs your review." : "Les contenus générés par l’IA nécessitent votre validation."}</div>
    </aside>

    <section className="workspace parent-ai-workspace">
      <header className="parent-ai-header"><div><div className="eyebrow">{isEnglish ? "Family space · guided AI" : "Espace parent · IA guidée"}</div><div className="ai-page-title"><h1>{isEnglish ? "Parent AI assistant" : "Assistant IA parent"}</h1><span className="ai-safe-badge">♢ {isEnglish ? "Secure and private data" : "Données sécurisées et privées"}</span></div><p>{isEnglish ? "Your assistant uses your family’s learning data to help you plan, understand and support with confidence." : "Votre assistant utilise les données d’apprentissage de votre famille pour vous aider à planifier, comprendre et accompagner avec confiance."}</p></div><div className="ai-child-selector"><span>{isEnglish ? "Child" : "Enfant"}</span>{children.map((item) => <button key={item.id} className={item.id === childId ? "selected" : ""} onClick={() => setChildId(item.id)}><b>{item.name[0]}</b><span>{item.name}</span><small>{item.level}</small></button>)}</div></header>

      <div className="parent-ai-layout">
        <section className="parent-ai-chat panel-card"><div className="ai-welcome"><div className="ai-welcome-orb">✦</div><h2>{isEnglish ? "Speak or write to your assistant" : "Parlez ou écrivez à votre assistant"}</h2><p>{isEnglish ? "I use your family’s learning data to give useful, concrete answers." : "Je m’appuie sur les données d’apprentissage de votre famille pour vous apporter des réponses utiles et concrètes."}</p></div><div className="ai-quick-actions"><span>{isEnglish ? "Try a request" : "Essayez une demande"}</span>{suggestions.map(([icon, label, intent]) => <button className="ai-prompt-row" key={label} onClick={() => choosePrompt(label)} disabled={busy}><i>{icon}</i><span>{label}</span><b>›</b></button>)}</div><div className="ai-messages" aria-live="polite">{messages.slice(1).map((item, index) => <div className={`ai-message ${item.role}`} key={`${item.role}-${index}`}><span className="ai-message-avatar">{item.role === "assistant" ? "✦" : child.name[0]}</span><div>{item.title && <strong>{item.title}</strong>}<p>{item.body}</p>{item.progressReport && <div className="ai-progress-report"><div className="ai-report-kicker">Bilan de la semaine · 2 au 8 septembre</div><div className="ai-report-metrics">{item.progressReport.metrics.map((metric) => <div className={`ai-report-metric ${metric.tone}`} key={metric.label}><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.detail}</small></div>)}</div><div className="ai-report-table-wrap"><table className="ai-report-table"><thead><tr><th>Matière</th><th>Activités</th><th>Note</th><th>Tendance</th><th>Lecture IA</th></tr></thead><tbody>{item.progressReport.rows.map((row) => <tr key={row.subject}><td><i className={`ai-dot ${row.tone}`} />{row.subject}</td><td>{row.completed}</td><td><b>{row.score}</b></td><td className="ai-trend">{row.trend}</td><td><span className={`ai-status ${row.tone}`}>{row.status}</span></td></tr>)}</tbody></table></div><div className="ai-report-bottom"><div><span className="ai-report-label">Ce qui va bien</span>{item.progressReport.strengths.map((strength) => <p key={strength}>✓ {strength}</p>)}</div><div className="ai-focus"><span>{item.progressReport.focus.priority}</span><strong>{item.progressReport.focus.title}</strong><p>{item.progressReport.focus.detail}</p></div></div></div>}{item.sources && <div className="ai-sources">{item.sources.map((source) => <span key={source}>✓ {source}</span>)}</div>}{item.action === "Créer une révision" && <button className="ai-inline-action" onClick={() => void createLesson()}>Créer une révision</button>}{item.followUps && <div className="ai-followups"><span>Pour aller plus loin</span>{item.followUps.map((followUp) => <button key={followUp.label} onClick={() => choosePrompt(followUp.prompt)}>{followUp.label} <b>›</b></button>)}</div>}</div></div>)}{busy && <div className="ai-trace" aria-label="Étapes de réflexion de l’assistant">{trace.map((step, index) => <div className={`ai-trace-step ${step.state}`} key={`${step.label}-${index}`}><span>{step.state === "active" ? "…" : "✓"}</span><div><strong>{step.label}</strong><small>{step.detail}</small>{step.tool && <em>Outil · {step.tool}</em>}</div></div>)}</div>}</div><form className="ai-composer" onSubmit={submit}><span className="ai-composer-mic" aria-hidden="true">♩</span><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Parlez ou écrivez à votre assistant…" aria-label="Message à l’assistant" /><button type="submit" disabled={busy || !message.trim()}>Envoyer ↗</button></form><p className="ai-disclaimer">♩ {isEnglish ? "Click the microphone to speak · Your assistant never changes the plan without approval." : "Cliquez sur le micro pour parler · L’assistant ne modifie jamais le plan sans validation parentale."}</p></section>

        <aside className="parent-ai-context"><section className="ai-advice-card"><div className="ai-card-title"><span>✦</span><div><h2>Conseils IA</h2><p>Des pistes concrètes selon les activités récentes.</p></div><button className="ai-view-link" onClick={() => choosePrompt("Que devrait-on améliorer cette semaine ?")}>Voir le détail →</button></div><div className="ai-advice-row"><span className="advice-icon gold">AB⌁</span><div><strong>Amélioration en Français (Sara)</strong><p>Difficultés en accords et grammaire.</p><b>Recommandation : 15 min de dictée interactive ciblée</b></div><span className="advice-arrow">›</span></div><div className="ai-advice-row"><span className="advice-icon mint">◐</span><div><strong>Créer un cours personnalisé</strong><p>Idéal pour consolider une notion avant l’évaluation de fin de module.</p></div><button className="advice-create" onClick={() => choosePrompt("Créer un cours personnalisé de sciences")}>Créer ›</button></div><div className="ai-week-summary"><div><strong>◉ Résumé hebdomadaire prêt</strong><b>85%</b></div><p>Progression globale familiale : 85% d’activités complétées cette semaine, rythme soutenu.</p><i><span /></i></div><button className="ai-alert-row" onClick={() => choosePrompt("Quelles échéances MEQ approchent ?")}><span>!</span><div><strong>Point de vigilance MEQ</strong><p>2 échéances officielles d’évaluation approchent.</p></div><b>›</b></button></section><section className="ai-jobs-card"><div className="ai-card-title"><span>▣</span><div><h2>File de génération</h2><p>Les contenus longs restent à valider.</p></div><Link href="#" className="ai-view-link">Voir tout</Link></div>{jobs.length === 0 ? <div className="ai-empty-job"><span>＋</span><p>Aucun brouillon en attente.<br /><button onClick={() => void createLesson()}>Créer une révision de fractions</button></p></div> : jobs.map((job) => <div className="ai-job" key={job.id}><div><strong>{job.title}</strong><small>{job.childName} · {job.credits} crédit · {job.createdAt}</small></div><span className={`ai-job-status ${job.status}`}>{job.status === "review_required" ? "À valider" : job.status === "approved" ? "Approuvé" : "En attente"}</span>{job.status === "review_required" && <div className="ai-job-actions"><button onClick={() => updateJob(job.id, "approved")}>Approuver</button><button onClick={() => updateJob(job.id, "rejected")}>Rejeter</button></div>}{job.status === "approved" && <button className="ai-add-plan" onClick={() => updateJob(job.id, "approved", true)}>{job.addedToPlan ? "✓ Ajouté au plan" : "✓ Ajout manuel au plan"}</button>}</div>)}</section><section className="ai-guardrail-card"><strong>Validation parentale requise</strong><p>Un brouillon IA ne devient jamais automatiquement un devoir dans le calendrier.</p></section></aside>
      </div>
    </section>
  </main>;
}
