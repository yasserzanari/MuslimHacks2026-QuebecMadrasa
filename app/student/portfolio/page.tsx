"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Evidence } from "@/src/domain/portfolio";

const STUDENT_ID = "yasmine";
const STUDENT_NAME = "Yasmine";
const icons: Record<string, string> = { achievement: "★", document: "📄", photo: "📷", reflection: "💬" };
const visibilityLabels: Record<string, string> = { private: "Privé", family: "Famille", shared: "Partagé" };

function formatDate(iso: string) { return new Date(iso).toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" }); }

export default function StudentPortfolioPage() {
  const [items, setItems] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [reflection, setReflection] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    const response = await fetch(`/api/portfolio?childId=${STUDENT_ID}`);
    const data = await response.json();
    setItems(data.evidence ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function toast(text: string) { setMessage(text); window.setTimeout(() => setMessage(""), 2200); }

  const openItem = items.find((item) => item.id === openId) ?? null;

  async function addReflection() {
    if (!reflection.trim()) return;
    const response = await fetch("/api/portfolio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ childId: STUDENT_ID, childName: STUDENT_NAME, skill: "Francais", type: "reflection", title: "Ma réflexion", description: reflection, visibility: "private" }) });
    if (!response.ok) { toast("L’ajout a échoué."); return; }
    setReflection("");
    toast("Réflexion ajoutée ✓");
    load();
  }

  async function submitComment() {
    if (!openId || !commentText.trim()) return;
    const response = await fetch("/api/portfolio", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "comment", evidenceId: openId, author: "student", authorName: STUDENT_NAME, text: commentText }) });
    if (!response.ok) { toast("Le commentaire n’a pas pu être ajouté."); return; }
    setCommentText("");
    load();
  }

  return <main className="student-v2-shell"><aside className="student-v2-sidebar"><Link href="/" className="student-v2-logo"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><span className="student-v2-label">Mon espace</span><Link className="student-v2-nav" href="/student">⌂ <span>Aujourd’hui</span></Link><Link className="student-v2-nav" href="/student/cours">▣ <span>Mes cours</span></Link><Link className="student-v2-nav active" href="/student/portfolio">▤ <span>Mon portfolio</span></Link><div className="student-v2-sidebar-help">Ce que tu ajoutes ici reste privé, sauf si un parent le partage.</div></aside>
    <section className="student-v2-main">
      <header className="student-v2-top"><div><p className="student-v2-kicker">Mon espace · portfolio</p><h1>Mon portfolio</h1></div><div className="student-v2-profile"><span>Y</span><b>Mon profil</b></div></header>

      <section className="student-v2-panel" style={{ marginBottom: 15 }}>
        <div className="student-v2-panel-head"><div><p className="student-v2-kicker">Ajouter</p><h2>Écrire une réflexion</h2></div></div>
        <div className="input-row" style={{ marginTop: 12 }}>
          <input value={reflection} onChange={(event) => setReflection(event.target.value)} placeholder="Qu’as-tu appris aujourd’hui ?" onKeyDown={(event) => { if (event.key === "Enter") addReflection(); }} />
          <button onClick={addReflection} aria-label="Ajouter">↑</button>
        </div>
      </section>

      {loading
        ? <p className="onboarding-empty">Chargement…</p>
        : items.length === 0
          ? <p className="onboarding-empty">Aucune preuve pour l’instant.</p>
          : <div className="portfolio-grid">{items.map((item) => <article className="portfolio-card" key={item.id}>
              <div className="portfolio-card-top"><span className="portfolio-icon">{icons[item.type]}</span><span className={`portfolio-visibility ${item.visibility}`}>{visibilityLabels[item.visibility]}</span></div>
              <h3>{item.title}</h3>
              <p className="portfolio-desc">{item.description}</p>
              <p className="portfolio-meta">{item.skill} · {formatDate(item.createdAt)}</p>
              <div className="portfolio-actions"><button className="detail-secondary" onClick={() => setOpenId(item.id)}>Commenter {item.comments.length > 0 ? `(${item.comments.length})` : ""}</button></div>
            </article>)}</div>}

      {message && <div className="toast" role="status">✓ {message}</div>}

      {openItem && <div className="session-detail-backdrop" onClick={() => setOpenId(null)}>
        <aside className="session-detail" onClick={(event) => event.stopPropagation()}>
          <button className="detail-close" onClick={() => setOpenId(null)} aria-label="Fermer">×</button>
          <span className={`portfolio-visibility ${openItem.visibility}`}>{visibilityLabels[openItem.visibility]}</span>
          <h2>{openItem.title}</h2>
          <p className="detail-date">{openItem.skill} · {formatDate(openItem.createdAt)}</p>
          <div className="detail-info"><strong>Description</strong><p>{openItem.description || "—"}</p></div>
          <div className="portfolio-comments">
            <strong>Commentaires</strong>
            {openItem.comments.length === 0 && <p className="onboarding-empty">Aucun commentaire pour l’instant.</p>}
            {openItem.comments.map((comment) => <div className="portfolio-comment" key={comment.id}><b>{comment.authorName}</b><span>{comment.text}</span><small>{formatDate(comment.createdAt)}</small></div>)}
            <div className="portfolio-compose"><input value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Écrire un commentaire…" onKeyDown={(event) => { if (event.key === "Enter") submitComment(); }} /><button onClick={submitComment} aria-label="Envoyer">↑</button></div>
          </div>
        </aside>
      </div>}
    </section>
  </main>;
}
