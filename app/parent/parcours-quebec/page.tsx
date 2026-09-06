"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildQuebecSteps, currentSchoolYearLabel, OFFICIAL_SOURCES, type QuebecStep, type StepId } from "@/src/domain/quebec-pathway";
import { loadSubmission, markExported, saveSubmission, verifySubmission, type StepSubmission } from "@/src/domain/quebec-pathway-storage";
import { loadFamily, type StoredFamily } from "@/src/domain/family-storage";

const nav = [["⌂", "Accueil", "/parent"], ["☷", "Plan de la semaine", "/parent/plan"], ["▣", "Cours", "/parent/cours"], ["✦", "Assistant IA", "/parent/generation"], ["◌", "Communauté", "#"], ["▤", "Portfolio", "/parent/portfolio"], ["◫", "Parcours Québec", "/parent/parcours-quebec"], ["$", "Budget", "#"]];

type DisplayStatus = "done" | "overdue" | "in-progress" | "upcoming" | "ongoing" | "todo";

const statusLabel: Record<DisplayStatus, string> = { done: "✓ Terminé", overdue: "En retard", "in-progress": "Brouillon enregistré", upcoming: "À faire", ongoing: "En continu", todo: "À faire" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
}

function stepDisplayStatus(step: QuebecStep, submission: StepSubmission | null, familyDone: boolean): DisplayStatus {
  if (step.id === "profile") return familyDone ? "done" : "todo";
  if (submission?.status === "verified" || submission?.status === "exported") return "done";
  if (submission) return "in-progress";
  if (step.ongoing) return "ongoing";
  if (!step.dueDate) return "upcoming";
  return new Date(step.dueDate) < new Date() ? "overdue" : "upcoming";
}

export default function QuebecPathwayPage() {
  const steps = useMemo(() => buildQuebecSteps(), []);
  const schoolYear = useMemo(() => currentSchoolYearLabel(), []);
  const [family, setFamily] = useState<StoredFamily | null>(null);
  const [submissions, setSubmissions] = useState<Partial<Record<StepId, StepSubmission | null>>>({});
  const [openStepId, setOpenStepId] = useState<StepId | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [verifyChecked, setVerifyChecked] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setFamily(loadFamily());
    const loaded: Partial<Record<StepId, StepSubmission | null>> = {};
    for (const step of steps) loaded[step.id] = loadSubmission(step.id);
    setSubmissions(loaded);
  }, [steps]);

  function toast(text: string) { setMessage(text); window.setTimeout(() => setMessage(""), 2500); }

  const familyDone = !!family;
  const statuses = useMemo(() => Object.fromEntries(steps.map((step) => [step.id, stepDisplayStatus(step, submissions[step.id] ?? null, familyDone)])) as Record<StepId, DisplayStatus>, [steps, submissions, familyDone]);
  const currentStepId = useMemo(() => steps.find((step) => statuses[step.id] !== "done" && step.id !== "progress-log")?.id ?? steps.find((step) => statuses[step.id] !== "done")?.id, [steps, statuses]);

  const openStep = steps.find((step) => step.id === openStepId) ?? null;

  function openPanel(step: QuebecStep) {
    if (step.id === "profile") return;
    setOpenStepId(step.id);
    setDraft(submissions[step.id]?.values ?? {});
    setVerifyChecked(false);
  }

  function updateField(fieldId: string, value: string) { setDraft((current) => ({ ...current, [fieldId]: value })); }

  function handleSave() {
    if (!openStepId) return;
    const submission = saveSubmission(openStepId, draft);
    setSubmissions((current) => ({ ...current, [openStepId]: submission }));
    toast("Brouillon enregistré ✓");
  }

  function handleVerify() {
    if (!openStepId || !verifyChecked) return;
    const submission = verifySubmission(openStepId);
    if (!submission) { toast("Enregistrez d’abord un brouillon."); return; }
    setSubmissions((current) => ({ ...current, [openStepId]: submission }));
    toast("Vérifié ✓");
  }

  function handleExport() {
    if (!openStepId || !openStep) return;
    const submission = submissions[openStepId];
    if (!submission || submission.status === "draft") { toast("Vérifiez le brouillon avant d’exporter."); return; }
    const lines = [
      `${openStep.title} — ${schoolYear}`,
      "Brouillon préparé avec l’aide de la plateforme — vérification parentale requise.",
      submission.verifiedAt ? `Vérifié par un parent le ${formatDate(submission.verifiedAt)}.` : "",
      "",
      ...openStep.fields.map((field) => `${field.label} :\n${submission.values[field.id] || "—"}\n`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${openStep.id}-${schoolYear}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    const updated = markExported(openStepId);
    if (updated) setSubmissions((current) => ({ ...current, [openStepId]: updated }));
    toast("Exporté ✓");
  }

  const upcomingDates = steps.filter((step) => step.dueDate).sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1));

  return <main className="courses-shell">
    <aside className="sidebar"><Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><div className="side-label">Famille</div>{nav.map(([icon, label, href]) => <Link key={label} className={`side-link ${label === "Parcours Québec" ? "active" : ""}`} href={href}><span>{icon}</span><span>{label}</span></Link>)}<div className="sidebar-bottom">Votre espace reste privé.<br />Les contenus générés par l’IA nécessitent votre validation.</div></aside>
    <section className="courses-workspace">
      <header className="courses-header">
        <div><div className="eyebrow">Année scolaire {schoolYear}</div><h1>Parcours Québec</h1><p>Votre parcours d’instruction en famille au Québec, étape par étape.</p></div>
      </header>

      <div className="courses-body">
        <section>
          <h2 className="qc-section-title">Étapes de l’année</h2>
          <div className="qc-timeline">
            {steps.map((step) => {
              const status = statuses[step.id];
              const isCurrent = step.id === currentStepId;
              const cardInner = <>
                <div className="qc-step-icon">{step.icon}</div>
                <div className="qc-step-body">
                  <div className="qc-step-top"><strong>{step.title}</strong><span className={`qc-status ${status}`}>{statusLabel[status]}</span></div>
                  <p>{step.description}</p>
                  {isCurrent && status !== "done" && <span className="qc-cta">{step.id === "profile" ? "Compléter mon inscription →" : "Commencer maintenant →"}</span>}
                </div>
                <div className="qc-step-due">{step.ongoing ? <span>En continu ⟳</span> : step.dueDate ? <span>À faire avant<br /><b>{formatDate(step.dueDate)}</b></span> : null}{step.id !== "profile" && <b className="qc-chevron">›</b>}</div>
              </>;
              return <div className={`qc-step ${isCurrent ? "current" : ""}`} key={step.id}>
                <div className={`qc-step-number ${status === "done" ? "done" : ""}`}>{status === "done" ? "✓" : step.order}</div>
                {step.id === "profile"
                  ? familyDone
                    ? <div className="qc-step-card qc-step-static">{cardInner}</div>
                    : <Link href="/parent/onboarding" className="qc-step-card">{cardInner}</Link>
                  : <button className="qc-step-card" onClick={() => openPanel(step)}>{cardInner}</button>}
              </div>;
            })}
          </div>

          <div className="qc-source-card">
            <span>🏛</span>
            <div><strong>Source officielle</strong><p>Consultez le site du gouvernement du Québec pour tous les détails officiels sur l’instruction en famille.</p></div>
            <a href={OFFICIAL_SOURCES[0].url} target="_blank" rel="noopener noreferrer" className="detail-secondary">Consulter le site du gouvernement ↗</a>
          </div>
          <div className="qc-sources-list"><strong>Sources officielles</strong>{OFFICIAL_SOURCES.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a>)}</div>
        </section>

        <aside className="plan-side">
          <div className="plan-side-card">
            <div className="side-card-heading"><div className="plan-side-icon">👤</div><h3>À vérifier avec un humain</h3></div>
            <p className="qc-human-note"><b>?</b> Vous avez une situation particulière (besoins particuliers, déménagement, multiâges, etc.) ? Parlez-en à un conseiller ou à une communauté de parents.</p>
            <p className="qc-human-note"><b>⚖</b> Les règles peuvent changer. Vérifiez toujours les exigences officielles.</p>
            <p className="qc-human-note"><b>📄</b> Conservez une preuve de vos envois et de vos documents.</p>
          </div>
          <div className="plan-side-card">
            <div className="side-card-heading"><div className="plan-side-icon">📅</div><h3>Dates importantes</h3></div>
            {upcomingDates.map((step) => <div className="qc-date-row" key={step.id}><b>{formatDate(step.dueDate!)}</b><span>Date limite : {step.title.toLowerCase()}.</span></div>)}
          </div>
        </aside>
      </div>

      <div className="qc-footer-note">ⓘ Information générale — vérifiez toujours votre situation auprès des sources officielles.</div>
      {message && <div className="toast" role="status">✓ {message}</div>}

      {openStep && <div className="session-detail-backdrop" onClick={() => setOpenStepId(null)}>
        <aside className="session-detail" onClick={(event) => event.stopPropagation()}>
          <button className="detail-close" onClick={() => setOpenStepId(null)} aria-label="Fermer">×</button>
          <span className={`qc-status ${statuses[openStep.id]}`}>{statusLabel[statuses[openStep.id]]}</span>
          <h2>{openStep.title}</h2>
          <p className="detail-date">{openStep.ongoing ? "En continu" : openStep.dueDate ? `À faire avant le ${formatDate(openStep.dueDate)}` : ""}</p>
          {openStep.fields.map((field) => <div className="detail-info" key={field.id}>
            <strong>{field.label}</strong>
            {field.type === "textarea"
              ? <textarea rows={3} value={draft[field.id] ?? ""} placeholder={field.placeholder} onChange={(event) => updateField(field.id, event.target.value)} />
              : <input type={field.type} value={draft[field.id] ?? ""} placeholder={field.placeholder} onChange={(event) => updateField(field.id, event.target.value)} />}
          </div>)}
          {submissions[openStep.id]?.savedAt && <p className="onboarding-hint">Enregistré le {formatDate(submissions[openStep.id]!.savedAt!)}{submissions[openStep.id]?.verifiedAt ? ` · Vérifié le ${formatDate(submissions[openStep.id]!.verifiedAt!)}` : ""}{submissions[openStep.id]?.exportedAt ? ` · Exporté le ${formatDate(submissions[openStep.id]!.exportedAt!)}` : ""}</p>}
          <label className="onboarding-consent" style={{ marginTop: 16 }}><input type="checkbox" checked={verifyChecked} onChange={(event) => setVerifyChecked(event.target.checked)} /><span>Je confirme avoir vérifié ces renseignements avant l’envoi.</span></label>
          <div className="detail-actions">
            <button className="detail-secondary" onClick={handleSave}>Sauvegarder</button>
            <button className="detail-secondary" onClick={handleVerify} disabled={!verifyChecked}>Vérifier</button>
            <button className="detail-primary" onClick={handleExport} disabled={submissions[openStep.id]?.status !== "verified" && submissions[openStep.id]?.status !== "exported"}>Exporter</button>
          </div>
        </aside>
      </div>}
    </section>
  </main>;
}
