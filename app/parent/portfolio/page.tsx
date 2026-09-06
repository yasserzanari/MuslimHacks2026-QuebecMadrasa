"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CourseCategory } from "@/src/domain/course-catalog";
import type { Evidence, EvidenceType, Visibility } from "@/src/domain/portfolio";

const nav = [["⌂", "Accueil", "/parent"], ["☷", "Plan de la semaine", "/parent/plan"], ["▣", "Cours", "/parent/cours"], ["✦", "Assistant IA", "/parent/generation"], ["◌", "Communauté", "#"], ["▤", "Portfolio", "/parent/portfolio"], ["◫", "Parcours Québec", "/parent/parcours-quebec"], ["$", "Budget", "#"]];
const children = [{ id: "adam", name: "Adam", age: "10 ans", avatar: "👦" }, { id: "sara", name: "Sara", age: "14 ans", avatar: "👧" }];
const skills: CourseCategory[] = ["Mathematiques", "Francais", "Anglais", "Sciences", "Arabe", "Coran"];
const types: EvidenceType[] = ["achievement", "document", "photo", "reflection"];
const typeLabels: Record<EvidenceType, string> = { achievement: "Réussite", document: "Document", photo: "Photo", reflection: "Réflexion" };
const visibilityLabels: Record<Visibility, string> = { private: "Privé", family: "Famille", shared: "Partagé" };
const icons: Record<EvidenceType, string> = { achievement: "★", document: "📄", photo: "📷", reflection: "💬" };

function formatDate(iso: string) { return new Date(iso).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" }); }

export default function ParentPortfolioPage() {
  const [childId, setChildId] = useState<string>("all");
  const [items, setItems] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ childId: "adam", title: "", description: "", skill: "Mathematiques" as CourseCategory, type: "achievement" as EvidenceType });
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch(`/api/portfolio${childId !== "all" ? `?childId=${childId}` : ""}`);
    const data = await response.json();
    setItems((data.evidence ?? []).filter((item: Evidence) => item.childId === "adam" || item.childId === "sara"));
    setLoading(false);
  }
  useEffect(() => { load(); }, [childId]);

  function toast(text: string) { setMessage(text); window.setTimeout(() => setMessage(""), 2500); }

  const openItem = items.find((item) => item.id === openId) ?? null;

  async function submitAdd() {
    if (!form.title.trim()) { toast("Le titre est requis."); return; }
    const child = children.find((c) => c.id === form.childId)!;
    const response = await fetch("/api/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ childId: child.id, childName: child.name, skill: form.skill, type: form.type, title: form.title, description: form.description }) });
    if (!response.ok) { toast("L’ajout a échoué."); return; }
    setShowAdd(false);
    setForm({ childId: "adam", title: "", description: "", skill: "Mathematiques", type: "achievement" });
    toast("Preuve ajoutée ✓");
    load();
  }

  async function submitComment() {
    if (!openId || !commentText.trim()) return;
    const response = await fetch("/api/portfolio", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "comment", evidenceId: openId, author: "parent", authorName: "Amine", text: commentText }) });
    if (!response.ok) { toast("Le commentaire n’a pas pu être ajouté."); return; }
    setCommentText("");
    load();
  }

  async function changeVisibility(evidenceId: string, visibility: Visibility) {
    const response = await fetch("/api/portfolio", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "share", evidenceId, visibility }) });
    if (!response.ok) { toast("Le partage n’a pas pu être modifié."); return; }
    toast(`Visibilité mise à jour : ${visibilityLabels[visibility]}`);
    load();
  }

  async function remove(evidenceId: string) {
    if (!window.confirm("Supprimer définitivement cette preuve ?")) return;
    const response = await fetch(`/api/portfolio?id=${evidenceId}`, { method: "DELETE" });
    if (!response.ok) { toast("La suppression a échoué."); return; }
    if (openId === evidenceId) setOpenId(null);
    toast("Preuve supprimée ✓");
    load();
  }

  return <main className="courses-shell">
    <aside className="sidebar"><Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><div className="side-label">Famille</div>{nav.map(([icon, label, href]) => <Link key={label} className={`side-link ${label === "Portfolio" ? "active" : ""}`} href={href}><span>{icon}</span><span>{label}</span></Link>)}<div className="sidebar-bottom">Votre espace reste privé.<br />Vous choisissez ce qui est partagé.</div></aside>
    <section className="courses-workspace">
      <header className="courses-header">
        <div><div className="eyebrow">Preuves et compétences</div><h1>Portfolio</h1><p>Les preuves d’apprentissage de vos enfants, avec vos permissions de partage.</p></div>
        <div className="child-picker"><span>Filtrer par enfant</span><div>
          <button className={childId === "all" ? "selected" : ""} onClick={() => setChildId("all")}><b>◎</b><strong>Tous</strong></button>
          {children.map((child) => <button key={child.id} className={childId === child.id ? "selected" : ""} onClick={() => setChildId(child.id)}><b>{child.avatar}</b><strong>{child.name}</strong></button>)}
        </div></div>
      </header>

      <div className="portfolio-toolbar"><button className="detail-primary" onClick={() => setShowAdd(true)}>＋ Ajouter une preuve</button></div>

      {loading
        ? <p className="onboarding-empty">Chargement du portfolio…</p>
        : items.length === 0
          ? <p className="onboarding-empty">Aucune preuve pour l’instant.</p>
          : <div className="portfolio-grid">{items.map((item) => <article className="portfolio-card" key={item.id}>
              <div className="portfolio-card-top"><span className="portfolio-icon">{icons[item.type]}</span><span className={`portfolio-visibility ${item.visibility}`}>{visibilityLabels[item.visibility]}</span></div>
              <h3>{item.title}</h3>
              <p className="portfolio-desc">{item.description}</p>
              <p className="portfolio-meta">{item.childName} · {item.skill} · {formatDate(item.createdAt)}</p>
              <div className="portfolio-actions">
                <button className="detail-secondary" onClick={() => setOpenId(item.id)}>Commenter {item.comments.length > 0 ? `(${item.comments.length})` : ""}</button>
                <select value={item.visibility} onChange={(event) => changeVisibility(item.id, event.target.value as Visibility)} aria-label="Partager">
                  {(["private", "family", "shared"] as Visibility[]).map((value) => <option key={value} value={value}>{visibilityLabels[value]}</option>)}
                </select>
                <button className="detail-secondary" onClick={() => remove(item.id)} aria-label="Supprimer">🗑</button>
              </div>
            </article>)}</div>}

      {message && <div className="toast" role="status">✓ {message}</div>}

      {openItem && <div className="session-detail-backdrop" onClick={() => setOpenId(null)}>
        <aside className="session-detail" onClick={(event) => event.stopPropagation()}>
          <button className="detail-close" onClick={() => setOpenId(null)} aria-label="Fermer">×</button>
          <span className={`portfolio-visibility ${openItem.visibility}`}>{visibilityLabels[openItem.visibility]}</span>
          <h2>{openItem.title}</h2>
          <p className="detail-date">{openItem.childName} · {openItem.skill} · {formatDate(openItem.createdAt)}</p>
          <div className="detail-info"><strong>Description</strong><p>{openItem.description || "—"}</p></div>
          <div className="detail-info"><strong>Source</strong><p>{openItem.source}</p></div>
          <div className="portfolio-comments">
            <strong>Commentaires</strong>
            {openItem.comments.length === 0 && <p className="onboarding-empty">Aucun commentaire pour l’instant.</p>}
            {openItem.comments.map((comment) => <div className="portfolio-comment" key={comment.id}><b>{comment.authorName}</b><span>{comment.text}</span><small>{formatDate(comment.createdAt)}</small></div>)}
            <div className="portfolio-compose"><input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Écrire un commentaire…" onKeyDown={(event) => { if (event.key === "Enter") submitComment(); }} /><button onClick={submitComment} aria-label="Envoyer">↑</button></div>
          </div>
        </aside>
      </div>}

      {showAdd && <div className="session-detail-backdrop" onClick={() => setShowAdd(false)}>
        <aside className="session-detail" onClick={(event) => event.stopPropagation()}>
          <button className="detail-close" onClick={() => setShowAdd(false)} aria-label="Fermer">×</button>
          <span className="detail-type lesson">Nouvelle preuve</span>
          <h2>Ajouter une preuve</h2>
          <div className="detail-info"><strong>Enfant</strong><select value={form.childId} onChange={(event) => setForm((current) => ({ ...current, childId: event.target.value }))}>{children.map((child) => <option key={child.id} value={child.id}>{child.name}</option>)}</select></div>
          <div className="detail-info"><strong>Titre</strong><input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Ex. Première dictée réussie" /></div>
          <div className="detail-info"><strong>Compétence</strong><select value={form.skill} onChange={(event) => setForm((current) => ({ ...current, skill: event.target.value as CourseCategory }))}>{skills.map((skill) => <option key={skill} value={skill}>{skill}</option>)}</select></div>
          <div className="detail-info"><strong>Type</strong><select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as EvidenceType }))}>{types.map((type) => <option key={type} value={type}>{typeLabels[type]}</option>)}</select></div>
          <div className="detail-info"><strong>Description</strong><textarea rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></div>
          <div className="detail-actions"><button className="detail-primary" onClick={submitAdd}>Ajouter</button><button className="detail-secondary" onClick={() => setShowAdd(false)}>Annuler</button></div>
        </aside>
      </div>}
    </section>
  </main>;
}
