"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import ParentShell, { type ParentLocale } from "@/components/parent/ParentShell";
import { jobStatusLabels, jobTypeLabels, type QueuedJob } from "@/src/domain/generation-queue";
import type { GenerationJobStatus } from "@/src/domain/ai-generation-job";

type Filter = "all" | "active" | "review_required" | "approved" | "rejected";

const filters: Filter[] = ["all", "active", "review_required", "approved", "rejected"];
const activeStatuses: GenerationJobStatus[] = ["queued", "running"];

const copy = {
  fr: {
    eyebrow: "Espace parent · contenus générés",
    title: "File de génération",
    lead: "Chaque contenu produit par l’IA attend votre décision. Rien n’est ajouté au plan sans votre approbation.",
    filters: { all: "Tout", active: "En cours", review_required: "À valider", approved: "Approuvés", rejected: "Rejetés" },
    empty: "Aucun job dans cette vue.",
    emptyAll: "La file est vide. Ouvrez l’assistant pour créer une demande.",
    openAssistant: "Ouvrir l’assistant IA",
    loading: "Chargement de la file…",
    error: "La file n’a pas pu être chargée.",
    retryLoad: "Réessayer",
    credits: "Crédits du mois",
    cancel: "Annuler",
    approve: "Approuver",
    reject: "Rejeter",
    retry: "Relancer",
    addToPlan: "Ajouter au plan",
    added: "Ajouté au plan",
    openDraft: "Ouvrir le brouillon",
    close: "Fermer",
    draft: "Brouillon",
    objective: "Objectif",
    instructions: "Consignes",
    sources: "Sources",
    warnings: "Avertissements",
    model: "Version du générateur",
    noDraft: "Le brouillon n’est pas encore prêt.",
    created: "Créé",
    attempt: "Tentative",
    child: "Enfant",
    actionError: "L’action n’a pas pu être appliquée.",
    approvedToast: "Contenu approuvé. Vous pouvez l’ajouter au plan.",
    rejectedToast: "Contenu rejeté. Rien n’a été publié.",
    cancelledToast: "Job annulé.",
    retriedToast: "Nouvelle tentative placée en file.",
    planToast: "Ajouté au plan de la semaine.",
  },
  en: {
    eyebrow: "Parent space · generated content",
    title: "Generation queue",
    lead: "Every AI production waits for your decision. Nothing reaches the plan without your approval.",
    filters: { all: "All", active: "In progress", review_required: "Needs review", approved: "Approved", rejected: "Rejected" },
    empty: "No job in this view.",
    emptyAll: "The queue is empty. Open the assistant to create a request.",
    openAssistant: "Open the AI assistant",
    loading: "Loading the queue…",
    error: "The queue could not be loaded.",
    retryLoad: "Try again",
    credits: "Credits this month",
    cancel: "Cancel",
    approve: "Approve",
    reject: "Reject",
    retry: "Retry",
    addToPlan: "Add to plan",
    added: "Added to plan",
    openDraft: "Open draft",
    close: "Close",
    draft: "Draft",
    objective: "Objective",
    instructions: "Instructions",
    sources: "Sources",
    warnings: "Warnings",
    model: "Generator version",
    noDraft: "The draft is not ready yet.",
    created: "Created",
    attempt: "Attempt",
    child: "Child",
    actionError: "The action could not be applied.",
    approvedToast: "Content approved. You can add it to the plan.",
    rejectedToast: "Content rejected. Nothing was published.",
    cancelledToast: "Job cancelled.",
    retriedToast: "New attempt queued.",
    planToast: "Added to the week plan.",
  },
} as const;

export default function ParentGenerationPage() {
  const [locale, setLocale] = useState<ParentLocale>("fr");
  const [jobs, setJobs] = useState<QueuedJob[]>([]);
  const [credits, setCredits] = useState({ used: 0, total: 20 });
  const [filter, setFilter] = useState<Filter>("all");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [openJob, setOpenJob] = useState<QueuedJob | null>(null);
  const [toast, setToast] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const t = copy[locale];

  const load = useCallback(async () => {
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
    load();
    pollRef.current = setInterval(load, 1800);
    return () => clearInterval(pollRef.current);
  }, [load]);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function act(jobId: string, action: "cancel" | "approve" | "reject" | "retry" | "add_to_plan") {
    const response = await fetch("/api/generation-jobs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, action }) });
    if (!response.ok) { flash(t.actionError); return; }
    const data = await response.json();
    setOpenJob((current) => (current && current.id === jobId ? data.job : current));
    flash(action === "approve" ? t.approvedToast : action === "reject" ? t.rejectedToast : action === "cancel" ? t.cancelledToast : action === "retry" ? t.retriedToast : t.planToast);
    await load();
  }

  const visible = jobs.filter((job) => {
    if (filter === "all") return true;
    if (filter === "active") return activeStatuses.includes(job.status);
    return job.status === filter;
  });

  return (
    <ParentShell active="assistant" locale={locale} onLocaleChange={setLocale} eyebrow={t.eyebrow} title={t.title}>
      <p className="assistant-lead">{t.lead}</p>
      <div className="queue-toolbar">
        <div className="queue-filters" role="tablist">
          {filters.map((item) => (
            <button key={item} role="tab" aria-selected={filter === item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
              {t.filters[item]}
            </button>
          ))}
        </div>
        <div className="queue-credits"><span>{t.credits}</span><b>{credits.used}/{credits.total}</b></div>
      </div>

      {status === "loading" && <section className="panel-card queue-state">{t.loading}</section>}
      {status === "error" && (
        <section className="panel-card queue-state" role="alert">
          <p>{t.error}</p>
          <button className="button" onClick={() => { setStatus("loading"); load(); }}>{t.retryLoad}</button>
        </section>
      )}
      {status === "ready" && visible.length === 0 && (
        <section className="panel-card queue-state">
          <p>{jobs.length === 0 ? t.emptyAll : t.empty}</p>
          <Link className="button" href="/parent/assistant">{t.openAssistant}</Link>
        </section>
      )}

      <div className="queue-list">
        {visible.map((job) => (
          <article className="panel-card queue-card" key={job.id}>
            <div className="queue-card-top">
              <div>
                <span className="panel-kicker">{jobTypeLabels[job.type][locale]} · {job.subject}</span>
                <h3>{job.requestText}</h3>
                <small>{t.child} : {job.childId ?? "—"} · {t.created} : {new Date(job.createdAt).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA")}{job.attemptCount > 0 ? ` · ${t.attempt} ${job.attemptCount + 1}` : ""}</small>
              </div>
              <span className={`queue-status ${job.status}`}>{jobStatusLabels[job.status][locale]}</span>
            </div>
            {activeStatuses.includes(job.status) && <div className="queue-progress"><i className={job.status} /></div>}
            <div className="queue-actions">
              {job.draft && <button className="button-soft" onClick={() => setOpenJob(job)}>{t.openDraft}</button>}
              {activeStatuses.includes(job.status) && <button className="button-soft" onClick={() => act(job.id, "cancel")}>{t.cancel}</button>}
              {job.status === "review_required" && <><button className="button" onClick={() => act(job.id, "approve")}>{t.approve}</button><button className="button-soft" onClick={() => act(job.id, "reject")}>{t.reject}</button></>}
              {(job.status === "rejected" || job.status === "failed") && <button className="button-soft" onClick={() => act(job.id, "retry")}>{t.retry}</button>}
              {job.status === "approved" && (job.addedToPlan ? <span className="queue-added">✓ {t.added}</span> : <button className="button" onClick={() => act(job.id, "add_to_plan")}>{t.addToPlan}</button>)}
            </div>
          </article>
        ))}
      </div>

      {openJob && (
        <div className="queue-drawer-backdrop" onClick={() => setOpenJob(null)}>
          <aside className="queue-drawer" onClick={(event) => event.stopPropagation()} aria-label={t.draft}>
            <button className="detail-close" onClick={() => setOpenJob(null)} aria-label={t.close}>×</button>
            <span className={`queue-status ${openJob.status}`}>{jobStatusLabels[openJob.status][locale]}</span>
            {openJob.draft ? (
              <>
                <h2>{openJob.draft.title}</h2>
                <p className="queue-drawer-objective"><strong>{t.objective}</strong> — {openJob.draft.objective}</p>
                <p>{openJob.draft.instructions}</p>
                {openJob.draft.blocks.map((block) => (
                  <div className="queue-block" key={block.type}><strong>{block.title}</strong><p>{block.prompt}</p></div>
                ))}
                <div className="queue-meta">
                  <div><strong>{t.sources}</strong><p>{openJob.draft.sources.length ? openJob.draft.sources.join(" · ") : "—"}</p></div>
                  <div><strong>{t.model}</strong><p>{openJob.draft.modelVersion}</p></div>
                </div>
                <div className="queue-warnings"><strong>{t.warnings}</strong><ul>{openJob.draft.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div>
                {openJob.status === "review_required" && (
                  <div className="queue-actions">
                    <button className="button" onClick={() => act(openJob.id, "approve")}>{t.approve}</button>
                    <button className="button-soft" onClick={() => act(openJob.id, "reject")}>{t.reject}</button>
                  </div>
                )}
                {openJob.status === "approved" && !openJob.addedToPlan && <div className="queue-actions"><button className="button" onClick={() => act(openJob.id, "add_to_plan")}>{t.addToPlan}</button></div>}
              </>
            ) : (
              <p>{t.noDraft}</p>
            )}
          </aside>
        </div>
      )}
      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </ParentShell>
  );
}
