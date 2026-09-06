"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ParentShell, { type ParentLocale } from "@/components/parent/ParentShell";
import { contextSources, jobStatusLabels, jobTypeLabels, type QueuedJob } from "@/src/domain/generation-queue";
import type { GenerationJobType } from "@/src/domain/ai-generation-job";
import { colon } from "@/src/i18n";

type Message = { id: string; role: "parent" | "assistant"; text: string; sources?: string[] };

const children_ = [{ id: "adam", fr: "Adam · 10 ans", en: "Adam · age 10" }, { id: "sara", fr: "Sara · 14 ans", en: "Sara · age 14" }];
const types: GenerationJobType[] = ["lesson", "exercises", "weekly_report", "explanation"];

const copy = {
  fr: {
    eyebrow: "Espace parent · assistant contrôlé",
    title: "Assistant IA",
    lead: "Posez une question sur la progression de votre enfant. Toute production de contenu passe par la file de génération et par votre validation.",
    conversation: "Conversation",
    placeholder: "Ex. : Comment aider Adam avec les fractions cette semaine ?",
    send: "Envoyer",
    context: "Contexte partagé avec l’assistant",
    contextHelp: "Sélectionnez ce que l’assistant a le droit de lire. Rien d’autre ne lui est transmis.",
    child: "Enfant",
    createTitle: "Demander une production",
    createHelp: "L’assistant ne modifie jamais votre calendrier. Il prépare un brouillon que vous approuvez ensuite.",
    type: "Type",
    subject: "Matière",
    objective: "Objectif",
    create: "Créer un job de génération",
    creating: "Envoi…",
    queue: "File de génération",
    queueEmpty: "Aucun job pour le moment. Créez une demande pour commencer.",
    queueAll: "Ouvrir la file complète",
    credits: "Crédits du mois",
    creditsFull: "Limite de crédits atteinte pour ce mois.",
    error: "La demande n’a pas pu être envoyée. Réessayez.",
    loading: "Chargement de la file…",
    quick: ["Que faut-il réviser cette semaine ?", "Prépare un rapport pour le portfolio", "Explique la progression d’Adam"],
    disclaimer: "L’assistant ne pose aucun diagnostic et ne remplace pas votre jugement.",
    sent: "Job créé et placé en file.",
  },
  en: {
    eyebrow: "Parent space · supervised assistant",
    title: "AI assistant",
    lead: "Ask about your child’s progress. Any produced content goes through the generation queue and your approval.",
    conversation: "Conversation",
    placeholder: "E.g.: How can I help Adam with fractions this week?",
    send: "Send",
    context: "Context shared with the assistant",
    contextHelp: "Pick what the assistant is allowed to read. Nothing else is sent to it.",
    child: "Child",
    createTitle: "Request a production",
    createHelp: "The assistant never edits your calendar. It prepares a draft that you approve afterwards.",
    type: "Type",
    subject: "Subject",
    objective: "Objective",
    create: "Create a generation job",
    creating: "Sending…",
    queue: "Generation queue",
    queueEmpty: "No job yet. Create a request to start.",
    queueAll: "Open the full queue",
    credits: "Credits this month",
    creditsFull: "Credit limit reached for this month.",
    error: "The request could not be sent. Try again.",
    loading: "Loading the queue…",
    quick: ["What should we review this week?", "Prepare a report for the portfolio", "Explain Adam’s progress"],
    disclaimer: "The assistant makes no diagnosis and does not replace your judgement.",
    sent: "Job created and queued.",
  },
} as const;

function answerFor(question: string, locale: ParentLocale, sourceLabels: string[]): string {
  const list = sourceLabels.length ? sourceLabels.join(" · ") : locale === "fr" ? "aucune source sélectionnée" : "no source selected";
  if (locale === "en") {
    return `Based on ${list}: the steadiest gain is a short daily block rather than one long session. I can prepare a draft you review before anything reaches the plan.`;
  }
  return `À partir de ${list} : le progrès le plus régulier vient d’un bloc court chaque jour plutôt que d’une longue séance. Je peux préparer un brouillon que vous validez avant qu’il n’atteigne le plan.`;
}

export default function ParentAssistantPage() {
  const [locale, setLocale] = useState<ParentLocale>("fr");
  const [childId, setChildId] = useState("adam");
  const [selectedSources, setSelectedSources] = useState<string[]>(["snap-adam-week"]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draftMessage, setDraftMessage] = useState("");
  const [jobs, setJobs] = useState<QueuedJob[]>([]);
  const [credits, setCredits] = useState({ used: 0, total: 20 });
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState("");
  const [type, setType] = useState<GenerationJobType>("lesson");
  const [subject, setSubject] = useState("Mathématiques");
  const [objective, setObjective] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const t = copy[locale];

  const loadQueue = useCallback(async () => {
    try {
      const response = await fetch("/api/generation-jobs");
      if (!response.ok) throw new Error("load_failed");
      const data = await response.json();
      setJobs(data.jobs ?? []);
      setCredits(data.credits ?? { used: 0, total: 20 });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadQueue();
    pollRef.current = setInterval(loadQueue, 2000);
    return () => clearInterval(pollRef.current);
  }, [loadQueue]);

  const visibleSources = contextSources.filter((source) => source.childId === childId);
  const sourceLabels = contextSources.filter((source) => selectedSources.includes(source.id)).map((source) => (locale === "fr" ? source.labelFr : source.labelEn));
  const creditsFull = credits.used >= credits.total;

  function toggleSource(id: string) {
    setSelectedSources((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function ask(question: string) {
    const text = question.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { id: `m-${Date.now()}`, role: "parent", text },
      { id: `a-${Date.now()}`, role: "assistant", text: answerFor(text, locale, sourceLabels), sources: sourceLabels },
    ]);
    setDraftMessage("");
  }

  async function createJob() {
    setCreating(true);
    try {
      const response = await fetch("/api/generation-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, subject, objective: objective || undefined, childId, locale, sourceSnapshotIds: selectedSources, requestText: objective || `${jobTypeLabels[type][locale]} · ${subject}` }),
      });
      if (!response.ok) throw new Error("create_failed");
      setToast(t.sent);
      setObjective("");
      window.setTimeout(() => setToast(""), 2600);
      await loadQueue();
    } catch {
      setToast(t.error);
      window.setTimeout(() => setToast(""), 3200);
    } finally {
      setCreating(false);
    }
  }

  return (
    <ParentShell active="assistant" locale={locale} onLocaleChange={setLocale} eyebrow={t.eyebrow} title={t.title}>
      <p className="assistant-lead">{t.lead}</p>
      <div className="assistant-layout">
        <section className="panel-card assistant-chat" aria-label={t.conversation}>
          <div className="assistant-chat-head">
            <div><span className="panel-kicker">{t.conversation}</span><h3>{t.disclaimer}</h3></div>
            <label className="assistant-child">{t.child}
              <select value={childId} onChange={(event) => { setChildId(event.target.value); setSelectedSources([]); }}>
                {children_.map((child) => <option key={child.id} value={child.id}>{locale === "fr" ? child.fr : child.en}</option>)}
              </select>
            </label>
          </div>
          <div className="assistant-thread">
            {messages.length === 0 && <p className="assistant-empty">{locale === "fr" ? "Aucun échange pour l’instant. Choisissez une question ou écrivez la vôtre." : "No exchange yet. Pick a question or write your own."}</p>}
            {messages.map((message) => (
              <div key={message.id} className={`assistant-bubble ${message.role}`}>
                <p>{message.text}</p>
                {message.sources && message.sources.length > 0 && <small>{locale === "fr" ? "Sources lues" : "Sources read"}{colon(locale)}{message.sources.join(" · ")}</small>}
              </div>
            ))}
          </div>
          <div className="assistant-quick">{t.quick.map((question) => <button key={question} onClick={() => ask(question)}>{question}</button>)}</div>
          <form className="assistant-compose" onSubmit={(event) => { event.preventDefault(); ask(draftMessage); }}>
            <input value={draftMessage} onChange={(event) => setDraftMessage(event.target.value)} placeholder={t.placeholder} aria-label={t.placeholder} />
            <button type="submit" className="button">{t.send}</button>
          </form>
        </section>

        <aside className="assistant-side">
          <section className="panel-card assistant-context">
            <span className="panel-kicker">{t.context}</span>
            <p>{t.contextHelp}</p>
            {visibleSources.map((source) => (
              <label key={source.id} className={`assistant-source ${selectedSources.includes(source.id) ? "selected" : ""}`}>
                <input type="checkbox" checked={selectedSources.includes(source.id)} onChange={() => toggleSource(source.id)} />
                <span><strong>{locale === "fr" ? source.labelFr : source.labelEn}</strong><small>{locale === "fr" ? source.detailFr : source.detailEn}</small></span>
              </label>
            ))}
          </section>

          <section className="panel-card assistant-create">
            <span className="panel-kicker">{t.createTitle}</span>
            <p>{t.createHelp}</p>
            <label>{t.type}
              <select value={type} onChange={(event) => setType(event.target.value as GenerationJobType)}>
                {types.map((item) => <option key={item} value={item}>{jobTypeLabels[item][locale]}</option>)}
              </select>
            </label>
            <label>{t.subject}<input value={subject} onChange={(event) => setSubject(event.target.value)} /></label>
            <label>{t.objective}<input value={objective} onChange={(event) => setObjective(event.target.value)} placeholder={locale === "fr" ? "Additionner deux fractions" : "Add two fractions"} /></label>
            <button className="button" onClick={createJob} disabled={creating || creditsFull}>{creating ? t.creating : t.create}</button>
            {creditsFull && <p className="assistant-warning" role="alert">{t.creditsFull}</p>}
            <div className="assistant-credits"><span>{t.credits}</span><b>{credits.used}/{credits.total}</b><div className="assistant-credit-bar"><i style={{ width: `${Math.min(100, (credits.used / credits.total) * 100)}%` }} /></div></div>
          </section>

          <section className="panel-card assistant-queue">
            <div className="assistant-queue-head"><span className="panel-kicker">{t.queue}</span><Link className="assistant-queue-link" href="/parent/generation">{t.queueAll} →</Link></div>
            {status === "loading" && <p className="assistant-empty">{t.loading}</p>}
            {status === "error" && <p className="assistant-warning" role="alert">{t.error}</p>}
            {status === "ready" && jobs.length === 0 && <p className="assistant-empty">{t.queueEmpty}</p>}
            {jobs.slice(0, 4).map((job) => (
              <Link key={job.id} className="assistant-job" href="/parent/generation">
                <span><strong>{jobTypeLabels[job.type][locale]} · {job.subject}</strong><small>{job.requestText}</small></span>
                <em className={`queue-status ${job.status}`}>{jobStatusLabels[job.status][locale]}</em>
              </Link>
            ))}
          </section>
        </aside>
      </div>
      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </ParentShell>
  );
}
