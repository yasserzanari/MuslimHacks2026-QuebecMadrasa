"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WeekSession } from "@/src/domain/week-plan";
import { courses } from "@/src/domain/course-catalog";

const days = [
  ["Lun", "2026-09-07"], ["Mar", "2026-09-08"], ["Mer", "2026-09-09"], ["Jeu", "2026-09-10"], ["Ven", "2026-09-11"], ["Sam", "2026-09-12"], ["Dim", "2026-09-13"],
] as const;
const slots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const nav = [["⌂", "Accueil", "/parent"], ["☷", "Plan de la semaine", "/parent/plan"], ["▣", "Cours", "/parent/cours"], ["✦", "Assistant IA", "/parent/assistant"], ["◌", "Communauté", "/parent/communaute"], ["▤", "Portfolio", "/parent/portfolio"], ["◫", "Parcours Québec", "/parent/parcours-quebec"], ["$", "Budget", "/parent/budget"]];

function formatWeek() { return "7 – 13 septembre 2026"; }
function typeLabel(type: WeekSession["type"]) { return ({ lesson: "Leçon", review: "Révision", group: "Classe en groupe", islamic: "Études islamiques" })[type]; }

export default function ParentPlanPage() {
  const [childId, setChildId] = useState("adam");
  const [sessions, setSessions] = useState<WeekSession[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [selected, setSelected] = useState<WeekSession | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [blockingMode, setBlockingMode] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPlan(id = childId) {
    const response = await fetch(`/api/week-plan?childId=${id}`);
    const data = await response.json();
    setSessions(data.sessions ?? []);
    setBlockedSlots(data.blockedSlots ?? []);
  }
  useEffect(() => { loadPlan(); }, [childId]);

  const visibleSessions = useMemo(() => sessions.filter((session) => session.childId === childId), [sessions, childId]);
  const moveSession = async (sessionId: string, date: string, startTime: string) => {
    const previous = sessions;
    setSessions((items) => items.map((item) => item.id === sessionId ? { ...item, date, startTime } : item));
    const response = await fetch("/api/week-plan", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, date, startTime }) });
    if (!response.ok) { setSessions(previous); setMessage("Le déplacement n’a pas pu être enregistré."); return; }
    setMessage("Horaire enregistré");
    window.setTimeout(() => setMessage(""), 2200);
  };
  const toggleBlocked = async (date: string, startTime: string) => {
    const key = `${date}|${startTime}`;
    const blocked = !blockedSlots.includes(key);
    setBlockedSlots((items) => blocked ? [...items, key] : items.filter((item) => item !== key));
    const response = await fetch("/api/week-plan", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "block_slot", date, startTime, blocked }) });
    if (!response.ok) setBlockedSlots((items) => blocked ? items.filter((item) => item !== key) : [...items, key]);
  };
  const adjustWithAi = () => {
    setAdjusting(true);
    window.setTimeout(() => { setAdjusting(false); setMessage("Suggestion IA prête : 4 séances réparties sans créneau indisponible."); window.setTimeout(() => setMessage(""), 2800); }, 900);
  };

  return <main className="app-shell plan-shell">
    <aside className="sidebar"><Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><div className="side-label">Famille</div>{nav.map(([icon, label, href]) => <Link key={label} className={`side-link ${label === "Plan de la semaine" ? "active" : ""}`} href={href}><span>{icon}</span><span>{label}</span></Link>)}<div className="sidebar-bottom">Votre espace reste privé.<br />Les contenus générés par l’IA nécessitent votre validation.</div></aside>
    <section className="workspace plan-workspace">
      <div className="workspace-top"><div><div className="eyebrow">Espace parent · organisation familiale</div><h1>Plan de la semaine</h1></div><div className="profile"><span className="avatar">AG</span><span>Famille Ghorbel⌄</span></div></div>
      <div className="plan-toolbar"><div><p className="plan-kicker">Semaine actuelle</p><h2>{formatWeek()}</h2><p className="plan-muted">Glissez une séance sur un autre créneau pour réorganiser la semaine.</p></div><div className="plan-controls"><button className={`block-toggle ${blockingMode ? "selected" : ""}`} onClick={() => setBlockingMode((value) => !value)}>{blockingMode ? "✓ Sélection terminée" : "▦ Bloquer des créneaux"}</button><button className="ai-adjust" onClick={adjustWithAi} disabled={adjusting}><span>✦</span>{adjusting ? "Analyse en cours…" : "Ajuster avec l’IA"}</button><div className="week-arrows"><button aria-label="Semaine précédente">‹</button><button aria-label="Semaine suivante">›</button></div><label>Enfant<select value={childId} onChange={(event) => setChildId(event.target.value)}><option value="adam">Adam · 10 ans</option><option value="sara">Sara · 14 ans</option></select></label></div></div>
      {blockingMode && <div className="blocking-banner" role="status"><span>▦</span><div><strong>Mode disponibilités activé</strong><small>Cliquez sur les cases libres pour les rendre indisponibles. Cliquez à nouveau pour les libérer.</small></div></div>}
      <div className="plan-layout"><section className="calendar-card" aria-label="Calendrier hebdomadaire">
        <div className="calendar-head"><div className="time-head">Heure</div>{days.map(([label, date], index) => <div className={`day-head ${index === 0 ? "today" : ""}`} key={date}><b>{label}</b><strong>{date.slice(8)}</strong></div>)}</div>
        <div className="calendar-body">{slots.map((slot) => <div className="calendar-row" key={slot}><div className="time-label">{slot}</div>{days.map(([, date]) => { const item = visibleSessions.find((session) => session.date === date && session.startTime === slot); const blocked = blockedSlots.includes(`${date}|${slot}`); return <div className={`drop-slot ${blocked ? "blocked" : ""} ${blockingMode ? "blocking" : ""}`} key={`${date}-${slot}`} onDragOver={(event) => event.preventDefault()} onDrop={() => !blockingMode && !blocked && dragged && moveSession(dragged, date, slot)} onClick={() => blockingMode && !item && toggleBlocked(date, slot)}>{blocked && <span className="blocked-label">Indisponible</span>}{item && <button className={`session-card ${item.type}`} draggable={!blockingMode} onDragStart={() => setDragged(item.id)} onDragEnd={() => setDragged(null)} onClick={(event) => { event.stopPropagation(); !blockingMode && setSelected(item); }} aria-label={`${item.title}, ${slot}`}><span className="session-time">{item.startTime} · {item.duration} min</span><strong>{item.title}</strong><small>{item.type === "group" ? "● En direct" : item.location}</small></button>}</div>})}</div>)}</div>
        <div className="calendar-legend"><span><i className="legend-dot lesson" />Leçons</span><span><i className="legend-dot group" />Classes de groupe</span><span><i className="legend-dot islamic" />Études islamiques</span><span className="drag-hint">↕ Glisser-déposer activé</span></div>
      </section>
      <aside className="plan-side"><div className="plan-side-card week-courses"><div className="side-card-heading"><div className="plan-side-icon">✓</div><div><p className="plan-kicker">À ne pas oublier</p><h3>Cours à faire cette semaine</h3></div></div><p>Les séances restantes d’{childId === "adam" ? "Adam" : "Sara"}, selon sa progression.</p>{courses.filter((course) => course.progress < 100).slice(0, 4).map((course) => <Link className="week-course" href={`/parent/cours/${course.id}`} key={course.id}><span className={`course-mini-icon ${course.color}`}>{course.icon}</span><span><strong>{course.title}</strong><small>{Math.max(1, Math.ceil((100 - course.progress) / 25))} séance{course.progress < 75 ? "s" : ""} · {course.duration}</small></span><b>›</b></Link>)}<Link className="plan-secondary" href="/parent/cours">Voir tous les cours →</Link></div><div className="plan-side-card plan-help"><span>💡</span><div><strong>Besoin d’aide ?</strong><p>L’assistant peut proposer un horaire en respectant vos créneaux indisponibles.</p><Link href="/parent/assistant">Ouvrir l’assistant</Link></div></div></aside></div>
      {message && <div className="toast" role="status">✓ {message}</div>}
      {selected && <div className="session-detail-backdrop" onClick={() => setSelected(null)}><aside className="session-detail" onClick={(event) => event.stopPropagation()}><button className="detail-close" onClick={() => setSelected(null)} aria-label="Fermer">×</button><span className={`detail-type ${selected.type}`}>{typeLabel(selected.type)}</span><h2>{selected.title}</h2><p className="detail-date">{selected.date} · {selected.startTime} · {selected.duration} min</p><div className="detail-info"><strong>Objectif de la séance</strong><p>{selected.note}</p></div><div className="detail-info"><strong>Format</strong><p>{selected.location}</p></div><div className="detail-actions"><Link className="detail-primary" href={`/parent/cours/${selected.courseId}`}>Ouvrir le cours</Link><button className="detail-secondary" onClick={() => setSelected(null)}>Fermer</button></div></aside></div>}
    </section>
  </main>;
}
