"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { GenerationJobRecord } from "@/src/domain/ai-generation-job";

const nav = [["⌂", "Accueil", "/parent"], ["☷", "Plan de la semaine", "/parent/plan"], ["▣", "Cours", "/parent/cours"], ["✦", "Assistant IA", "/parent/generation"], ["◌", "Communauté", "#"], ["▤", "Portfolio", "#"], ["◫", "Parcours Québec", "/parent/parcours-quebec"], ["$", "Budget", "#"]];

const typeLabels: Record<string, string> = { lesson: "Leçon", exercises: "Exercices", weekly_report: "Rapport hebdomadaire", explanation: "Explication" };
const statusLabels: Record<string, string> = { queued: "En file d’attente", running: "Génération en cours", review_required: "Prêt à vérifier", approved: "Approuvé", rejected: "Rejeté", failed: "Échec", cancelled: "Annulé" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default function GenerationQueuePage() {
  const [jobs, setJobs] = useState<GenerationJobRecord[]>([]);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [openDraft, setOpenDraft] = useState<GenerationJobRecord | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/generation-jobs");
    const data = await response.json();
    setJobs(data.jobs ?? []);
    setCredits(data.credits ?? null);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function toast(text: string) { setMessage(text); window.setTimeout(() => setMessage(""), 2500); }

  async function act(jobId: string, action: "cancel" | "retry") {
    setPendingId(jobId);
    const response = await fetch("/api/generation-jobs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, action }) });
    const data = await response.json();
    setPendingId(null);
    if (!response.ok) {
      toast(data.error === "insufficient_credits" ? "Crédits insuffisants pour relancer cette demande." : "L’action n’a pas pu être effectuée.");
      return;
    }
    toast(action === "cancel" ? "Demande annulée ✓" : "Nouvelle demande relancée ✓");
    load();
  }

  return <main className="courses-shell">
    <aside className="sidebar"><Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><div className="side-label">Famille</div>{nav.map(([icon, label, href]) => <Link key={label} className={`side-link ${label === "Assistant IA" ? "active" : ""}`} href={href}><span>{icon}</span><span>{label}</span></Link>)}<div className="sidebar-bottom">Les contenus générés par l’IA nécessitent votre validation.</div></aside>
    <section className="courses-workspace">
      <header className="courses-header">
        <div><div className="eyebrow">Assistant IA · file de génération</div><h1>File de génération</h1><p>Suivez les demandes envoyées à l’IA : ce qui est en cours, ce qui attend votre vérification, et ce qui a échoué.</p></div>
        {credits !== null && <div className="credits-chip"><span>{credits}</span>{credits === 1 ? "crédit restant" : "crédits restants"}</div>}
      </header>

      {loading
        ? <p className="onboarding-empty">Chargement de la file…</p>
        : jobs.length === 0
          ? <p className="onboarding-empty">Aucune demande pour l’instant.</p>
          : <div className="job-list">{jobs.map((job) => <article className="job-card" key={job.id}>
              <div className="job-card-top">
                <span className={`job-status ${job.status}`}>{statusLabels[job.status]}</span>
                <small>{formatDate(job.createdAt)}</small>
              </div>
              <h3>{typeLabels[job.type]} · {job.subject}</h3>
              <p className="job-request">{job.requestText}</p>
              <p className="job-meta">{job.childName} · {job.creditsReserved} crédit{job.creditsReserved > 1 ? "s" : ""} réservé{job.creditsReserved > 1 ? "s" : ""}</p>
              {job.status === "failed" && job.errorCode && <p className="onboarding-error">Erreur : {job.errorCode}</p>}
              <div className="job-actions">
                {(job.status === "queued" || job.status === "running") && <button className="detail-secondary" onClick={() => act(job.id, "cancel")} disabled={pendingId === job.id}>{pendingId === job.id ? "Annulation…" : "Annuler"}</button>}
                {job.status === "failed" && <button className="detail-primary" onClick={() => act(job.id, "retry")} disabled={pendingId === job.id}>{pendingId === job.id ? "Relance…" : "Relancer"}</button>}
                {job.draft && <button className="detail-secondary" onClick={() => setOpenDraft(job)}>Ouvrir le brouillon</button>}
              </div>
            </article>)}</div>}

      {message && <div className="toast" role="status">✓ {message}</div>}

      {openDraft && openDraft.draft && <div className="session-detail-backdrop" onClick={() => setOpenDraft(null)}>
        <aside className="session-detail" onClick={(event) => event.stopPropagation()}>
          <button className="detail-close" onClick={() => setOpenDraft(null)} aria-label="Fermer">×</button>
          <span className={`job-status ${openDraft.status}`}>{statusLabels[openDraft.status]}</span>
          <h2>{openDraft.draft.title}</h2>
          <p className="detail-date">{openDraft.childName} · {openDraft.draft.subject}</p>
          <div className="detail-info"><strong>Objectif</strong><p>{openDraft.draft.objective}</p></div>
          <div className="detail-info"><strong>Consignes</strong><p>{openDraft.draft.instructions}</p></div>
          {openDraft.draft.blocks.map((block) => <div className="detail-info" key={block.title}><strong>{block.title}</strong><p>{block.prompt}</p></div>)}
          <p className="onboarding-hint">Brouillon généré par l’IA — vérification parentale requise avant tout ajout au parcours.</p>
          <div className="detail-actions"><button className="detail-secondary" onClick={() => setOpenDraft(null)}>Fermer</button></div>
        </aside>
      </div>}
    </section>
  </main>;
}
