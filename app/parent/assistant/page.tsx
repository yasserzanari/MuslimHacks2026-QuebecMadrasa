"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { parentAssistantTools } from "@/src/domain/parent-ai-mocks";

type Child = { id: string; name: string; age: string; level: string };
type Message = { role: "assistant" | "parent"; title?: string; body: string; sources?: string[]; action?: string };
type Job = { id: string; title: string; status: "queued" | "review_required" | "approved" | "rejected"; credits: number; childName: string; createdAt: string; addedToPlan?: boolean };

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
  const child = children.find((item) => item.id === childId) ?? children[0];
  const isEnglish = locale === "en";

  useEffect(() => { const saved = window.localStorage.getItem("madrasa-locale"); if (saved === "en") setLocale("en"); }, []);

  async function ask(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setMessage(""); setMessages((current) => [...current, { role: "parent", body: clean }]); setBusy(true);
    try {
      const response = await fetch("/api/parent-assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: clean, childId, childName: child.name }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessages((current) => [...current, { role: "assistant", ...data.response }]);
    } catch { setMessages((current) => [...current, { role: "assistant", title: "Réponse indisponible", body: "Le service est indisponible pour le moment. Vous pouvez réessayer sans perdre votre conversation." }]); }
    finally { setBusy(false); }
  }

  function submit(event: FormEvent) { event.preventDefault(); void ask(message); }

  async function createLesson() {
    setBusy(true);
    try {
      const response = await fetch("/api/generation-jobs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ parentId: "demo-parent", childId, type: "lesson", subject: "Fractions", objective: "Comparer deux fractions et expliquer son raisonnement", requestText: `Créer une révision de fractions pour ${child.name}`, locale }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setJobs((current) => [{ id: data.id, title: data.draft?.title ?? "Révision de fractions", status: "review_required", credits: data.creditsReserved ?? 1, childName: child.name, createdAt: "à l’instant" }, ...current]);
      setMessages((current) => [...current, { role: "assistant", title: "Brouillon prêt à vérifier", body: "Le devoir est dans la file. Vérifiez l’objectif et les questions avant de l’ajouter au plan.", sources: ["Progression récente", "Cours Fractions"], action: "Voir le brouillon" }]);
    } catch { setMessages((current) => [...current, { role: "assistant", title: "Création impossible", body: "Le brouillon n’a pas pu être créé. Aucun crédit n’est débité en cas d’échec." }]); }
    finally { setBusy(false); }
  }

  function updateJob(id: string, status: Job["status"], addedToPlan = false) { setJobs((current) => current.map((job) => job.id === id ? { ...job, status, addedToPlan } : job)); }

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
      <header className="parent-ai-header"><div><div className="eyebrow">{isEnglish ? "Parent space · controlled AI" : "Espace parent · IA contrôlée"}</div><h1>{isEnglish ? "Assistant for your family" : "Assistant pour votre famille"}</h1><p>{isEnglish ? "Understand what your child needs next, then decide what to create." : "Comprenez le prochain besoin de votre enfant, puis décidez quoi créer."}</p></div><div className="ai-child-selector"><span>{isEnglish ? "Child" : "Enfant"}</span>{children.map((item) => <button key={item.id} className={item.id === childId ? "selected" : ""} onClick={() => setChildId(item.id)}><b>{item.name[0]}</b><span>{item.name}</span><small>{item.level}</small></button>)}</div></header>

      <div className="parent-ai-layout">
        <section className="parent-ai-chat panel-card"><div className="ai-section-heading"><div><span className="ai-icon">✦</span><div><h2>Votre assistant pédagogique</h2><p>Réponses courtes, sources visibles, décision toujours entre vos mains.</p></div></div><span className="ai-safe-badge">● Données autorisées</span></div><div className="ai-quick-actions"><span>Questions rapides</span>{quickPrompts.map(([intent, label]) => <button key={intent} onClick={() => void ask(label)} disabled={busy}>{label}</button>)}</div><div className="ai-messages" aria-live="polite">{messages.map((item, index) => <div className={`ai-message ${item.role}`} key={`${item.role}-${index}`}><span className="ai-message-avatar">{item.role === "assistant" ? "✦" : child.name[0]}</span><div>{item.title && <strong>{item.title}</strong>}<p>{item.body}</p>{item.sources && <div className="ai-sources">{item.sources.map((source) => <span key={source}>✓ {source}</span>)}</div>}{item.action === "Créer une révision" && <button className="ai-inline-action" onClick={() => void createLesson()}>Créer une révision</button>}</div></div>)}{busy && <div className="ai-typing">L’assistant prépare une réponse…</div>}</div><form className="ai-composer" onSubmit={submit}><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ex. Que devrait travailler Sara cette semaine ?" aria-label="Message à l’assistant" /><button type="submit" disabled={busy || !message.trim()}>Envoyer</button></form><p className="ai-disclaimer">L’assistant ne pose pas de diagnostic, ne donne pas de fatwa et ne modifie jamais le plan sans validation.</p></section>

        <aside className="parent-ai-context"><section className="ai-context-card"><div className="ai-card-title"><span>◉</span><div><h2>Contexte utilisé</h2><p>Ce que l’assistant peut lire pour {child.name}.</p></div></div><div className="ai-tool-list">{parentAssistantTools.map((tool) => <div key={tool.id}><span>✓</span><div><strong>{tool.name}</strong><small>{tool.source}</small></div></div>)}</div><div className="ai-context-note">Aucune conversation privée, donnée financière ou adresse précise n’est transmise.</div></section><section className="ai-jobs-card"><div className="ai-card-title"><span>▣</span><div><h2>File de génération</h2><p>Les contenus longs restent à valider.</p></div><Link href="#" className="ai-view-link">Voir tout</Link></div>{jobs.length === 0 ? <div className="ai-empty-job"><span>＋</span><p>Aucun brouillon en attente.<br /><button onClick={() => void createLesson()}>Créer une révision de fractions</button></p></div> : jobs.map((job) => <div className="ai-job" key={job.id}><div><strong>{job.title}</strong><small>{job.childName} · {job.credits} crédit · {job.createdAt}</small></div><span className={`ai-job-status ${job.status}`}>{job.status === "review_required" ? "À valider" : job.status === "approved" ? "Approuvé" : "En attente"}</span>{job.status === "review_required" && <div className="ai-job-actions"><button onClick={() => updateJob(job.id, "approved")}>Approuver</button><button onClick={() => updateJob(job.id, "rejected")}>Rejeter</button></div>}{job.status === "approved" && <button className="ai-add-plan" onClick={() => updateJob(job.id, "approved", true)}>{job.addedToPlan ? "✓ Ajouté au plan" : "✓ Ajout manuel au plan"}</button>}</div>)}</section><section className="ai-guardrail-card"><strong>Validation parentale requise</strong><p>Un brouillon IA ne devient jamais automatiquement un devoir dans le calendrier.</p></section></aside>
      </div>
    </section>
  </main>;
}
