"use client";

import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useState } from "react";
import { getCourse } from "@/src/domain/course-catalog";

const children = [{ id: "amine", name: "Amine", age: "10 ans", avatar: "👦" }, { id: "sara", name: "Sara", age: "14 ans", avatar: "👧" }];

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const course = getCourse(params.courseId);
  const [childId, setChildId] = useState("amine");
  const [assigned, setAssigned] = useState<string | null>(null);
  const [assignError, setAssignError] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [planResult, setPlanResult] = useState<{ date: string; startTime: string } | "none" | null>(null);
  const [planError, setPlanError] = useState(false);
  const [addingToPlan, setAddingToPlan] = useState(false);

  if (!course) notFound();
  const child = children.find((item) => item.id === childId)!;

  async function assign() {
    setAssigning(true);
    setAssignError(false);
    const response = await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ courseId: course!.id, childId }) });
    setAssigning(false);
    if (!response.ok) { setAssignError(true); return; }
    setAssigned(childId);
  }

  async function addToPlan() {
    setAddingToPlan(true);
    setPlanError(false);
    const slotResponse = await fetch(`/api/week-plan?childId=${childId}&nextSlot=1`);
    const slotData = await slotResponse.json();
    if (!slotData.slot) { setPlanResult("none"); setAddingToPlan(false); return; }
    const response = await fetch("/api/week-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, courseId: course!.id, title: course!.title, date: slotData.slot.date, startTime: slotData.slot.startTime, duration: 30, type: "lesson", note: course!.objective }),
    });
    setAddingToPlan(false);
    if (!response.ok) { setPlanError(true); return; }
    setPlanResult(slotData.slot);
  }

  return <main className="courses-shell">
    <aside className="sidebar"><Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><div className="side-label">Famille</div><Link className="side-link" href="/parent"><span>⌂</span><span>Accueil</span></Link><Link className="side-link active" href="/parent/cours"><span>▣</span><span>Cours</span></Link><Link className="side-link" href="/parent/plan"><span>☷</span><span>Plan de la semaine</span></Link><Link className="side-link" href="#"><span>✦</span><span>Assistant IA</span></Link><div className="sidebar-bottom">Les contenus générés par l’IA nécessitent la validation du parent.</div></aside>
    <section className="courses-workspace detail-workspace">
      <Link href="/parent/cours" className="back-link">‹ &nbsp; Retour aux cours</Link>
      <div className="detail-hero">
        <div className={`course-visual large ${course.color}`}><span>{course.icon}</span></div>
        <div>
          <span className={`course-tag ${course.color}`}>{course.category} · {course.badge}</span>
          <h1>{course.title}</h1>
          <p className="detail-level">{course.level} · {course.duration}</p>
          <p className="detail-description">{course.description}</p>
          <label className="child-picker" style={{ minWidth: 0, padding: 0, margin: "14px 0" }}>
            <span>Enfant</span>
            <div>{children.map((item) => <button key={item.id} type="button" className={item.id === childId ? "selected" : ""} onClick={() => { setChildId(item.id); setAssigned(null); setPlanResult(null); }}><b>{item.avatar}</b><strong>{item.name}</strong></button>)}</div>
          </label>
          <div className="detail-actions">
            <button className="detail-primary" onClick={assign} disabled={assigning}>{assigning ? "Assignation…" : assigned === childId ? "✓ Assigné" : "Assigner à un enfant"}</button>
            <button className="detail-secondary" onClick={addToPlan} disabled={addingToPlan}>{addingToPlan ? "Ajout…" : "Ajouter au plan"}</button>
          </div>
          {assigned === childId && <p className="assigned-note">✓ Assigné à {child.name}</p>}
          {assignError && <p className="onboarding-error" role="alert">L’assignation a échoué. Réessayez.</p>}
          {planResult === "none" && <p className="onboarding-error" role="alert">Aucun créneau libre cette semaine pour {child.name}.</p>}
          {planError && <p className="onboarding-error" role="alert">L’ajout au plan a échoué. Réessayez.</p>}
          {planResult && planResult !== "none" && <p className="assigned-note">✓ Ajouté au plan de {child.name} · {planResult.date.slice(8)} sept. à {planResult.startTime} — <Link href="/parent/plan">Voir le plan ›</Link></p>}
        </div>
      </div>
      <div className="detail-grid">
        <section className="detail-panel">
          <div className="panel-kicker">Objectif pédagogique</div>
          <h2>{course.objective}</h2>
          <div className="detail-progress"><div><span>Progression actuelle de {child.name}</span><b>{course.progress} %</b></div><div className="bar"><i style={{ width: `${course.progress}%` }} /></div></div>
        </section>
        <section className="detail-panel">
          <div className="panel-kicker">Parcours de la leçon</div>
          <ol>{course.modules.map((module, index) => <li key={module}><span>{index + 1}</span><div><strong>{module}</strong><small>{index === 0 ? "Introduction · 5 min" : index === course.modules.length - 1 ? "Défi · 5 min" : "Activité guidée · 8 min"}</small></div></li>)}</ol>
        </section>
      </div>
      <section className="tutor-preview">
        <div className="tutor-avatar">✦</div>
        <div><span className="panel-kicker">Tuteur IA élève</span><h2>Il guidera le raisonnement, pas la réponse.</h2><p>Question de départ : « {course.studentPrompt} »</p></div>
        <Link href={`/student/cours/${course.id}?preview=parent`} target="_blank" rel="noopener noreferrer" className="course-open">Prévisualiser la leçon ›</Link>
      </section>
    </section>
  </main>;
}
