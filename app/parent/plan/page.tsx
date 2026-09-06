"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ScheduleSuggestion, WeekSession } from "@/src/domain/week-plan";
import { courses } from "@/src/domain/course-catalog";

const days = [
  ["Lun", "2026-09-07"], ["Mar", "2026-09-08"], ["Mer", "2026-09-09"], ["Jeu", "2026-09-10"], ["Ven", "2026-09-11"], ["Sam", "2026-09-12"], ["Dim", "2026-09-13"],
] as const;
const slots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const nav = [["⌂", "Accueil", "/parent"], ["☷", "Plan de la semaine", "/parent/plan"], ["▣", "Cours", "/parent/cours"], ["✦", "Assistant IA", "#"], ["◌", "Communauté", "#"], ["▤", "Portfolio", "#"], ["◫", "Parcours Québec", "/parent/parcours-quebec"], ["$", "Budget", "#"]];
const typeOptions: WeekSession["type"][] = ["lesson", "review", "group", "islamic"];

function formatWeek() { return "7 – 13 septembre 2026"; }
function typeLabel(type: WeekSession["type"]) { return ({ lesson: "Leçon", review: "Révision", group: "Classe en groupe", islamic: "Études islamiques" })[type]; }

type DraftActivity = { courseId: string; date: string; startTime: string; duration: number; type: WeekSession["type"] };

function emptyDraft(): DraftActivity { return { courseId: courses[0]?.id ?? "", date: days[0][1], startTime: slots[0], duration: 30, type: "lesson" }; }

export default function ParentPlanPage() {
  const [childId, setChildId] = useState("adam");
  const [sessions, setSessions] = useState<WeekSession[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [selected, setSelected] = useState<WeekSession | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [blockingMode, setBlockingMode] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState<DraftActivity>(emptyDraft());
  const [createError, setCreateError] = useState("");
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[] | null>(null);
  const [applying, setApplying] = useState(false);

  async function loadPlan(id = childId) {
    const response = await fetch(`/api/week-plan?childId=${id}`);
    const data = await response.json();
    setSessions(data.sessions ?? []);
    setBlockedSlots(data.blockedSlots ?? []);
  }
  useEffect(() => { loadPlan(); setSuggestions(null); }, [childId]);

  const visibleSessions = useMemo(() => sessions.filter((session) => session.childId === childId), [sessions, childId]);

  const moveSession = async (sessionId: string, date: string, startTime: string) => {
    const previous = sessions;
    setSessions((items) => items.map((item) => item.id === sessionId ? { ...item, date, startTime } : item));
    const response = await fetch("/api/week-plan", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, date, startTime }) });
    if (!response.ok) { setSessions(previous); setMessage("Le déplacement n’a pas pu être enregistré."); return false; }
    return true;
  };

  const toggleBlocked = async (date: string, startTime: string) => {
    const key = `${date}|${startTime}`;
    const blocked = !blockedSlots.includes(key);
    setBlockedSlots((items) => blocked ? [...items, key] : items.filter((item) => item !== key));
    const response = await fetch("/api/week-plan", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "block_slot", date, startTime, blocked }) });
    if (!response.ok) setBlockedSlots((items) => blocked ? items.filter((item) => item !== key) : [...items, key]);
  };

  const completeSession = async (session: WeekSession) => {
    const response = await fetch("/api/week-plan", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "complete_session", sessionId: session.id }) });
    if (!response.ok) { setMessage("Impossible de marquer la séance comme terminée."); return; }
    setSessions((items) => items.map((item) => item.id === session.id ? { ...item, status: "done" } : item));
    setSelected((current) => current && current.id === session.id ? { ...current, status: "done" } : current);
    setMessage("Séance marquée terminée ✓");
    window.setTimeout(() => setMessage(""), 2200);
  };

  function openCreate() { setDraft(emptyDraft()); setCreateError(""); setShowCreate(true); }

  async function submitCreate() {
    const course = courses.find((item) => item.id === draft.courseId);
    if (!course) { setCreateError("Choisissez un cours."); return; }
    const key = `${draft.date}|${draft.startTime}`;
    if (blockedSlots.includes(key)) { setCreateError("Ce créneau est marqué indisponible."); return; }
    if (visibleSessions.some((session) => session.date === draft.date && session.startTime === draft.startTime)) { setCreateError("Une séance existe déjà sur ce créneau."); return; }
    const response = await fetch("/api/week-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ childId, courseId: course.id, title: course.title, date: draft.date, startTime: draft.startTime, duration: draft.duration, type: draft.type, note: course.objective }),
    });
    if (!response.ok) { setCreateError("La séance n’a pas pu être créée."); return; }
    const data = await response.json();
    setSessions((items) => [...items, data.session]);
    setShowCreate(false);
    setMessage("Activité ajoutée ✓");
    window.setTimeout(() => setMessage(""), 2200);
  }

  const adjustWithAi = async () => {
    setAdjusting(true);
    setSuggestions(null);
    const response = await fetch(`/api/week-plan?childId=${childId}&suggest=1`);
    const data = await response.json();
    setAdjusting(false);
    if (!data.suggestions || data.suggestions.length === 0) { setMessage("Aucun ajustement nécessaire pour l’instant."); window.setTimeout(() => setMessage(""), 2500); return; }
    setSuggestions(data.suggestions);
  };

  const validateSuggestions = async () => {
    if (!suggestions) return;
    setApplying(true);
    for (const suggestion of suggestions) await moveSession(suggestion.sessionId, suggestion.toDate, suggestion.toTime);
    setApplying(false);
    setSuggestions(null);
    setMessage("Horaire mis à jour ✓");
    window.setTimeout(() => setMessage(""), 2500);
  };

  return <main className="app-shell plan-shell">
    <aside className="sidebar"><Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><div className="side-label">Famille</div>{nav.map(([icon, label, href]) => <Link key={label} className={`side-link ${label === "Plan de la semaine" ? "active" : ""}`} href={href}><span>{icon}</span><span>{label}</span></Link>)}<div className="sidebar-bottom">Votre espace reste privé.<br />Les contenus générés par l’IA nécessitent votre validation.</div></aside>
    <section className="workspace plan-workspace">
      <div className="workspace-top"><div><div className="eyebrow">Espace parent · organisation familiale</div><h1>Plan de la semaine</h1></div><div className="profile"><span className="avatar">AG</span><span>Famille Ghorbel⌄</span></div></div>
      <div className="plan-toolbar"><div><p className="plan-kicker">Semaine actuelle</p><h2>{formatWeek()}</h2><p className="plan-muted">Glissez une séance sur un autre créneau pour réorganiser la semaine.</p></div><div className="plan-controls"><button className="block-toggle" onClick={openCreate}>＋ Ajouter une activité</button><button className={`block-toggle ${blockingMode ? "selected" : ""}`} onClick={() => setBlockingMode((value) => !value)}>{blockingMode ? "✓ Sélection terminée" : "▦ Bloquer des créneaux"}</button><button className="ai-adjust" onClick={adjustWithAi} disabled={adjusting}><span>✦</span>{adjusting ? "Analyse en cours…" : "Ajuster avec l’IA"}</button><div className="week-arrows"><button aria-label="Semaine précédente">‹</button><button aria-label="Semaine suivante">›</button></div><label>Enfant<select value={childId} onChange={(event) => setChildId(event.target.value)}><option value="adam">Adam · 10 ans</option><option value="sara">Sara · 14 ans</option></select></label></div></div>
      {blockingMode && <div className="blocking-banner" role="status"><span>▦</span><div><strong>Mode disponibilités activé</strong><small>Cliquez sur les cases libres pour les rendre indisponibles. Cliquez à nouveau pour les libérer.</small></div></div>}
      {suggestions && <div className="ai-suggestion-banner" role="status">
        <div className="ai-suggestion-head"><span>✦</span><div><strong>Ajustement proposé par l’IA</strong><small>Ces séances tombent sur un créneau indisponible. Voici une nouvelle proposition à valider.</small></div></div>
        <ul>{suggestions.map((suggestion) => <li key={suggestion.sessionId}><strong>{suggestion.title}</strong><span>{suggestion.fromDate.slice(8)} · {suggestion.fromTime} → {suggestion.toDate.slice(8)} · {suggestion.toTime}</span></li>)}</ul>
        <div className="ai-suggestion-actions"><button className="detail-secondary" onClick={() => setSuggestions(null)} disabled={applying}>Ignorer</button><button className="detail-primary" onClick={validateSuggestions} disabled={applying}>{applying ? "Application…" : "Valider les changements"}</button></div>
      </div>}
      <div className="plan-layout"><section className="calendar-card" aria-label="Calendrier hebdomadaire">
        <div className="calendar-head"><div className="time-head">Heure</div>{days.map(([label, date], index) => <div className={`day-head ${index === 0 ? "today" : ""}`} key={date}><b>{label}</b><strong>{date.slice(8)}</strong></div>)}</div>
        <div className="calendar-body">{slots.map((slot) => <div className="calendar-row" key={slot}><div className="time-label">{slot}</div>{days.map(([, date]) => { const item = visibleSessions.find((session) => session.date === date && session.startTime === slot); const blocked = blockedSlots.includes(`${date}|${slot}`); return <div className={`drop-slot ${blocked ? "blocked" : ""} ${blockingMode ? "blocking" : ""}`} key={`${date}-${slot}`} onDragOver={(event) => event.preventDefault()} onDrop={() => !blockingMode && dragged && moveSession(dragged, date, slot)} onClick={() => blockingMode && !item && toggleBlocked(date, slot)}>{blocked && !item && <span className="blocked-label">Indisponible</span>}{item && <button className={`session-card ${item.type} ${item.status === "done" ? "is-done" : ""}`} draggable={!blockingMode && item.status !== "done"} onDragStart={() => setDragged(item.id)} onDragEnd={() => setDragged(null)} onClick={(event) => { event.stopPropagation(); !blockingMode && setSelected(item); }} aria-label={`${item.title}, ${slot}`}><span className="session-time">{item.startTime} · {item.duration} min</span><strong>{item.status === "done" && "✓ "}{item.title}</strong><small>{item.type === "group" ? "● En direct" : item.location}</small></button>}</div>})}</div>)}</div>
        <div className="calendar-legend"><span><i className="legend-dot lesson" />Leçons</span><span><i className="legend-dot group" />Classes de groupe</span><span><i className="legend-dot islamic" />Études islamiques</span><span className="drag-hint">↕ Glisser-déposer activé</span></div>
      </section>
      <aside className="plan-side"><div className="plan-side-card week-courses"><div className="side-card-heading"><div className="plan-side-icon">✓</div><div><p className="plan-kicker">À ne pas oublier</p><h3>Cours à faire cette semaine</h3></div></div><p>Les séances restantes d’{childId === "adam" ? "Adam" : "Sara"}, selon sa progression.</p>{courses.filter((course) => course.progress < 100).slice(0, 4).map((course) => <Link className="week-course" href={`/parent/cours/${course.id}`} key={course.id}><span className={`course-mini-icon ${course.color}`}>{course.icon}</span><span><strong>{course.title}</strong><small>{Math.max(1, Math.ceil((100 - course.progress) / 25))} séance{course.progress < 75 ? "s" : ""} · {course.duration}</small></span><b>›</b></Link>)}<Link className="plan-secondary" href="/parent/cours">Voir tous les cours →</Link></div><div className="plan-side-card plan-help"><span>💡</span><div><strong>Besoin d’aide ?</strong><p>L’assistant peut proposer un horaire en respectant vos créneaux indisponibles.</p><Link href="#">Ouvrir l’assistant</Link></div></div></aside></div>
      {message && <div className="toast" role="status">✓ {message}</div>}
      {selected && <div className="session-detail-backdrop" onClick={() => setSelected(null)}><aside className="session-detail" onClick={(event) => event.stopPropagation()}><button className="detail-close" onClick={() => setSelected(null)} aria-label="Fermer">×</button><span className={`detail-type ${selected.type}`}>{typeLabel(selected.type)}</span>{selected.status === "done" && <span className="detail-type done">✓ Terminé</span>}<h2>{selected.title}</h2><p className="detail-date">{selected.date} · {selected.startTime} · {selected.duration} min</p><div className="detail-info"><strong>Objectif de la séance</strong><p>{selected.note}</p></div><div className="detail-info"><strong>Format</strong><p>{selected.location}</p></div><div className="detail-actions"><Link className="detail-primary" href={`/parent/cours/${selected.courseId}`}>Ouvrir le cours</Link>{selected.status !== "done" && <button className="detail-secondary" onClick={() => completeSession(selected)}>Marquer terminé</button>}<button className="detail-secondary" onClick={() => setSelected(null)}>Fermer</button></div></aside></div>}
      {showCreate && <div className="session-detail-backdrop" onClick={() => setShowCreate(false)}><aside className="session-detail" onClick={(event) => event.stopPropagation()}><button className="detail-close" onClick={() => setShowCreate(false)} aria-label="Fermer">×</button><span className="detail-type lesson">Nouvelle activité</span><h2>Ajouter une activité</h2><div className="detail-info"><strong>Cours</strong><select value={draft.courseId} onChange={(event) => setDraft((current) => ({ ...current, courseId: event.target.value }))}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></div><div className="detail-info"><strong>Jour</strong><select value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))}>{days.map(([label, date]) => <option key={date} value={date}>{label} {date.slice(8)}</option>)}</select></div><div className="detail-info"><strong>Heure</strong><select value={draft.startTime} onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))}>{slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}</select></div><div className="detail-info"><strong>Durée (minutes)</strong><input type="number" min={10} step={5} value={draft.duration} onChange={(event) => setDraft((current) => ({ ...current, duration: Number(event.target.value) }))} /></div><div className="detail-info"><strong>Type</strong><select value={draft.type} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as WeekSession["type"] }))}>{typeOptions.map((type) => <option key={type} value={type}>{typeLabel(type)}</option>)}</select></div>{createError && <p className="onboarding-error" role="alert">{createError}</p>}<div className="detail-actions"><button className="detail-primary" onClick={submitCreate}>Ajouter à la semaine</button><button className="detail-secondary" onClick={() => setShowCreate(false)}>Annuler</button></div></aside></div>}
    </section>
  </main>;
}
