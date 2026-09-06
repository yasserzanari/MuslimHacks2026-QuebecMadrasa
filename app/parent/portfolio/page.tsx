"use client";

import { useCallback, useEffect, useState } from "react";
import ParentShell, { type ParentLocale } from "@/components/parent/ParentShell";
import { evidenceSourceLabels, evidenceTypeLabels, skills, visibilityLabels, type Evidence, type EvidenceType, type EvidenceVisibility, type SkillProgress } from "@/src/domain/portfolio";

const children_ = [{ id: "adam", fr: "Adam · 10 ans", en: "Adam · age 10" }, { id: "sara", fr: "Sara · 14 ans", en: "Sara · age 14" }];
const types: EvidenceType[] = ["text", "photo", "audio", "document", "quiz"];
const visibilities: EvidenceVisibility[] = ["private", "family", "shared_link"];

const copy = {
  fr: {
    eyebrow: "Espace parent · preuves d’apprentissage",
    title: "Portfolio",
    lead: "Rassemblez ce que votre enfant a réellement produit. Chaque preuve garde sa source, sa visibilité et son historique.",
    add: "Ajouter une preuve", addTitle: "Titre", addSkill: "Compétence", addType: "Type", addNote: "Note", addVisibility: "Visibilité",
    save: "Ajouter au portfolio", saving: "Ajout…",
    skillsTitle: "Compétences couvertes", skillsHelp: "Le nombre de preuves rattachées à chaque compétence.",
    none: "Aucune preuve", empty: "Aucune preuve pour cet enfant. Ajoutez-en une pour commencer.",
    loading: "Chargement du portfolio…", error: "Le portfolio n’a pas pu être chargé.", retry: "Réessayer",
    comment: "Commenter", commentPlaceholder: "Ajouter un commentaire…", send: "Envoyer",
    remove: "Supprimer", confirmRemove: "Supprimer cette preuve ? Cette action est définitive.", cancel: "Annuler",
    share: "Visibilité", log: "Journal d’accès", logHelp: "Les 8 dernières actions sur les preuves de cette famille.",
    child: "Enfant", titleRequired: "Un titre est nécessaire.",
    added: "Preuve ajoutée.", commented: "Commentaire ajouté.", removed: "Preuve supprimée.", visibilityDone: "Visibilité mise à jour.",
    by: { parent: "Parent", child: "Enfant", tutor: "Tuteur" },
  },
  en: {
    eyebrow: "Parent space · learning evidence",
    title: "Portfolio",
    lead: "Collect what your child actually produced. Every piece of evidence keeps its source, visibility and history.",
    add: "Add evidence", addTitle: "Title", addSkill: "Skill", addType: "Type", addNote: "Note", addVisibility: "Visibility",
    save: "Add to portfolio", saving: "Adding…",
    skillsTitle: "Skills covered", skillsHelp: "How many pieces of evidence are attached to each skill.",
    none: "No evidence", empty: "No evidence for this child yet. Add one to start.",
    loading: "Loading the portfolio…", error: "The portfolio could not be loaded.", retry: "Try again",
    comment: "Comment", commentPlaceholder: "Add a comment…", send: "Send",
    remove: "Delete", confirmRemove: "Delete this evidence? This cannot be undone.", cancel: "Cancel",
    share: "Visibility", log: "Access log", logHelp: "The last 8 actions on this family’s evidence.",
    child: "Child", titleRequired: "A title is required.",
    added: "Evidence added.", commented: "Comment added.", removed: "Evidence deleted.", visibilityDone: "Visibility updated.",
    by: { parent: "Parent", child: "Child", tutor: "Tutor" },
  },
} as const;

export default function ParentPortfolioPage() {
  const [locale, setLocale] = useState<ParentLocale>("fr");
  const [childId, setChildId] = useState("adam");
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [progress, setProgress] = useState<SkillProgress[]>([]);
  const [accessLog, setAccessLog] = useState<{ id: string; at: string; action: string; actor: string }[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formSkill, setFormSkill] = useState(skills[0].id);
  const [formType, setFormType] = useState<EvidenceType>("text");
  const [formNote, setFormNote] = useState("");
  const [formVisibility, setFormVisibility] = useState<EvidenceVisibility>("family");
  const [formError, setFormError] = useState("");
  const [commentFor, setCommentFor] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const t = copy[locale];

  const load = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/portfolio?childId=${id}`);
      if (!response.ok) throw new Error("load_failed");
      const data = await response.json();
      setEvidence(data.evidence ?? []);
      setProgress(data.skills ?? []);
      setAccessLog(data.accessLog ?? []);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { setStatus("loading"); load(childId); }, [childId, load]);

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2400); }

  async function submitEvidence() {
    if (!formTitle.trim()) { setFormError(t.titleRequired); return; }
    setFormError("");
    setSaving(true);
    const response = await fetch("/api/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ childId, skillId: formSkill, type: formType, titleFr: formTitle, noteFr: formNote, visibility: formVisibility }) });
    setSaving(false);
    if (!response.ok) { setFormError(t.error); return; }
    setFormTitle(""); setFormNote("");
    flash(t.added);
    await load(childId);
  }

  async function submitComment(evidenceId: string) {
    if (!commentText.trim()) return;
    const response = await fetch("/api/portfolio", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "comment", evidenceId, text: commentText }) });
    if (response.ok) { setCommentText(""); setCommentFor(null); flash(t.commented); await load(childId); }
  }

  async function changeVisibility(evidenceId: string, visibility: EvidenceVisibility) {
    const response = await fetch("/api/portfolio", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "visibility", evidenceId, visibility }) });
    if (response.ok) { flash(t.visibilityDone); await load(childId); }
  }

  async function remove(evidenceId: string) {
    const response = await fetch(`/api/portfolio?evidenceId=${evidenceId}`, { method: "DELETE" });
    setConfirmId(null);
    if (response.ok) { flash(t.removed); await load(childId); }
  }

  return (
    <ParentShell active="portfolio" locale={locale} onLocaleChange={setLocale} eyebrow={t.eyebrow} title={t.title}>
      <p className="assistant-lead">{t.lead}</p>
      <div className="portfolio-toolbar">
        <label className="assistant-child">{t.child}
          <select value={childId} onChange={(event) => setChildId(event.target.value)}>
            {children_.map((child) => <option key={child.id} value={child.id}>{locale === "fr" ? child.fr : child.en}</option>)}
          </select>
        </label>
        <span className="portfolio-count">{evidence.length} {locale === "fr" ? "preuves" : "items"}</span>
      </div>

      <div className="portfolio-layout">
        <section className="portfolio-main">
          {status === "loading" && <div className="panel-card queue-state">{t.loading}</div>}
          {status === "error" && <div className="panel-card queue-state" role="alert"><p>{t.error}</p><button className="button" onClick={() => load(childId)}>{t.retry}</button></div>}
          {status === "ready" && evidence.length === 0 && <div className="panel-card queue-state">{t.empty}</div>}
          {evidence.map((item) => {
            const skill = skills.find((entry) => entry.id === item.skillId);
            return (
              <article className="panel-card portfolio-card" key={item.id}>
                <div className="portfolio-card-top">
                  <div>
                    <span className="panel-kicker">{skill ? (locale === "fr" ? skill.subjectFr : skill.subjectEn) : "—"} · {evidenceTypeLabels[item.type][locale]}</span>
                    <h3>{locale === "fr" ? item.titleFr : item.titleEn}</h3>
                    <small>{evidenceSourceLabels[item.source][locale]} · {new Date(item.createdAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA", { day: "numeric", month: "long", year: "numeric" })}</small>
                  </div>
                  <span className={`portfolio-visibility ${item.visibility}`}>{visibilityLabels[item.visibility][locale]}</span>
                </div>
                {(locale === "fr" ? item.noteFr : item.noteEn) && <p className="portfolio-note">{locale === "fr" ? item.noteFr : item.noteEn}</p>}
                {skill && <p className="portfolio-skill">▤ {locale === "fr" ? skill.labelFr : skill.labelEn}</p>}
                {item.comments.map((comment) => (
                  <div className="portfolio-comment" key={comment.id}><strong>{t.by[comment.author]}</strong><p>{comment.text}</p></div>
                ))}
                {commentFor === item.id ? (
                  <form className="portfolio-comment-form" onSubmit={(event) => { event.preventDefault(); submitComment(item.id); }}>
                    <input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder={t.commentPlaceholder} aria-label={t.commentPlaceholder} autoFocus />
                    <button className="button" type="submit">{t.send}</button>
                    <button className="button-soft" type="button" onClick={() => { setCommentFor(null); setCommentText(""); }}>{t.cancel}</button>
                  </form>
                ) : (
                  <div className="portfolio-actions">
                    <button className="button-soft" onClick={() => { setCommentFor(item.id); setCommentText(""); }}>{t.comment}</button>
                    <label className="portfolio-share">{t.share}
                      <select value={item.visibility} onChange={(event) => changeVisibility(item.id, event.target.value as EvidenceVisibility)}>
                        {visibilities.map((value) => <option key={value} value={value}>{visibilityLabels[value][locale]}</option>)}
                      </select>
                    </label>
                    <button className="button-soft danger" onClick={() => setConfirmId(item.id)}>{t.remove}</button>
                  </div>
                )}
                {confirmId === item.id && (
                  <div className="portfolio-confirm" role="alertdialog">
                    <p>{t.confirmRemove}</p>
                    <div><button className="button-soft danger" onClick={() => remove(item.id)}>{t.remove}</button><button className="button-soft" onClick={() => setConfirmId(null)}>{t.cancel}</button></div>
                  </div>
                )}
              </article>
            );
          })}
        </section>

        <aside className="portfolio-side">
          <section className="panel-card">
            <span className="panel-kicker">{t.add}</span>
            <label className="portfolio-field">{t.addTitle}<input value={formTitle} onChange={(event) => setFormTitle(event.target.value)} placeholder={locale === "fr" ? "Ex. : dictée réussie" : "E.g.: successful dictation"} /></label>
            <label className="portfolio-field">{t.addSkill}
              <select value={formSkill} onChange={(event) => setFormSkill(event.target.value)}>
                {skills.map((skill) => <option key={skill.id} value={skill.id}>{locale === "fr" ? skill.labelFr : skill.labelEn}</option>)}
              </select>
            </label>
            <label className="portfolio-field">{t.addType}
              <select value={formType} onChange={(event) => setFormType(event.target.value as EvidenceType)}>
                {types.map((type) => <option key={type} value={type}>{evidenceTypeLabels[type][locale]}</option>)}
              </select>
            </label>
            <label className="portfolio-field">{t.addNote}<input value={formNote} onChange={(event) => setFormNote(event.target.value)} /></label>
            <label className="portfolio-field">{t.addVisibility}
              <select value={formVisibility} onChange={(event) => setFormVisibility(event.target.value as EvidenceVisibility)}>
                {visibilities.map((value) => <option key={value} value={value}>{visibilityLabels[value][locale]}</option>)}
              </select>
            </label>
            <small className="portfolio-help">{visibilityLabels[formVisibility][locale === "fr" ? "helpFr" : "helpEn"]}</small>
            {formError && <p className="assistant-warning" role="alert">{formError}</p>}
            <button className="button" onClick={submitEvidence} disabled={saving}>{saving ? t.saving : t.save}</button>
          </section>

          <section className="panel-card">
            <span className="panel-kicker">{t.skillsTitle}</span>
            <p className="portfolio-help">{t.skillsHelp}</p>
            {progress.map((row) => (
              <div className="portfolio-skill-row" key={row.skill.id}>
                <span><strong>{locale === "fr" ? row.skill.labelFr : row.skill.labelEn}</strong><small>{locale === "fr" ? row.skill.subjectFr : row.skill.subjectEn}</small></span>
                <b className={row.count === 0 ? "empty" : ""}>{row.count === 0 ? t.none : row.count}</b>
              </div>
            ))}
          </section>

          <section className="panel-card">
            <span className="panel-kicker">{t.log}</span>
            <p className="portfolio-help">{t.logHelp}</p>
            {accessLog.map((entry) => (
              <div className="portfolio-log-row" key={entry.id}><code>{entry.action}</code><small>{new Date(entry.at).toLocaleTimeString(locale === "fr" ? "fr-CA" : "en-CA")}</small></div>
            ))}
          </section>
        </aside>
      </div>
      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </ParentShell>
  );
}
