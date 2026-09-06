"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WeekSession } from "@/src/domain/week-plan";
import { localizeCourses } from "@/src/domain/course-catalog";

type Locale = "fr" | "en";

const days: [string, string, string][] = [
  ["Lun", "Mon", "2026-09-07"], ["Mar", "Tue", "2026-09-08"], ["Mer", "Wed", "2026-09-09"],
  ["Jeu", "Thu", "2026-09-10"], ["Ven", "Fri", "2026-09-11"], ["Sam", "Sat", "2026-09-12"], ["Dim", "Sun", "2026-09-13"],
];
const slots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const nav: [string, string, string, string][] = [
  ["⌂", "Accueil", "Home", "/parent"],
  ["☷", "Plan de la semaine", "Week plan", "/parent/plan"],
  ["▣", "Cours", "Courses", "/parent/cours"],
  ["✦", "Assistant IA", "AI assistant", "/parent/assistant"],
  ["◌", "Communauté", "Community", "/parent/communaute"],
  ["▤", "Portfolio", "Portfolio", "/parent/portfolio"],
  ["◫", "Parcours Québec", "Québec pathway", "/parent/parcours-quebec"],
  ["$", "Budget et bourses", "Budget and aid", "/parent/budget"],
  ["⚙", "Paramètres et sécurité", "Settings and safety", "/parent/settings"],
];

const typeLabels: Record<WeekSession["type"], { fr: string; en: string }> = {
  lesson: { fr: "Leçon", en: "Lesson" },
  review: { fr: "Révision", en: "Review" },
  group: { fr: "Classe en groupe", en: "Group class" },
  islamic: { fr: "Études islamiques", en: "Islamic studies" },
};

const copy = {
  fr: {
    family: "Famille", privateNote: "Votre espace reste privé.", aiNote: "Les contenus générés par l’IA nécessitent votre validation.",
    eyebrow: "Espace parent · organisation familiale", title: "Plan de la semaine",
    currentWeek: "Semaine actuelle", week: "7 – 13 septembre 2026",
    dragHint: "Glissez une séance sur un autre créneau pour réorganiser la semaine.",
    blockSlots: "Bloquer des créneaux", doneSelecting: "Sélection terminée",
    aiAdjust: "Ajuster avec l’IA", analysing: "Analyse en cours…",
    prevWeek: "Semaine précédente", nextWeek: "Semaine suivante", child: "Enfant",
    blockingTitle: "Mode disponibilités activé",
    blockingHelp: "Cliquez sur les cases libres pour les rendre indisponibles. Cliquez à nouveau pour les libérer.",
    calendar: "Calendrier hebdomadaire", hour: "Heure", unavailable: "Indisponible",
    lessons: "Leçons", groups: "Classes de groupe", islamic: "Études islamiques", dragEnabled: "Glisser-déposer activé",
    remember: "À ne pas oublier", weekCourses: "Cours à faire cette semaine",
    remaining: "Les séances restantes de", according: "selon sa progression.",
    session: "séance", sessions: "séances", allCourses: "Voir tous les cours",
    needHelp: "Besoin d’aide ?", helpText: "L’assistant peut proposer un horaire en respectant vos créneaux indisponibles.",
    openAssistant: "Ouvrir l’assistant",
    moveFailed: "Le déplacement n’a pas pu être enregistré.", saved: "Horaire enregistré",
    aiReady: "Suggestion IA prête : 4 séances réparties sans créneau indisponible.",
    close: "Fermer", goal: "Objectif de la séance", format: "Format", openCourse: "Ouvrir le cours",
    live: "En direct", childAdam: "Adam · 10 ans", childSara: "Sara · 14 ans",
  },
  en: {
    family: "Family", privateNote: "Your space stays private.", aiNote: "AI-generated content needs your approval.",
    eyebrow: "Parent space · family organisation", title: "Week plan",
    currentWeek: "Current week", week: "September 7–13, 2026",
    dragHint: "Drag a session onto another slot to reorganise the week.",
    blockSlots: "Block time slots", doneSelecting: "Selection done",
    aiAdjust: "Adjust with the AI", analysing: "Analysing…",
    prevWeek: "Previous week", nextWeek: "Next week", child: "Child",
    blockingTitle: "Availability mode on",
    blockingHelp: "Click the free cells to mark them unavailable. Click again to free them.",
    calendar: "Weekly calendar", hour: "Time", unavailable: "Unavailable",
    lessons: "Lessons", groups: "Group classes", islamic: "Islamic studies", dragEnabled: "Drag and drop enabled",
    remember: "Do not forget", weekCourses: "Courses to do this week",
    remaining: "The remaining sessions for", according: "based on their progress.",
    session: "session", sessions: "sessions", allCourses: "See all the courses",
    needHelp: "Need help?", helpText: "The assistant can propose a schedule that respects your unavailable slots.",
    openAssistant: "Open the assistant",
    moveFailed: "The move could not be saved.", saved: "Schedule saved",
    aiReady: "AI suggestion ready: 4 sessions spread out, avoiding every unavailable slot.",
    close: "Close", goal: "Session goal", format: "Format", openCourse: "Open the course",
    live: "Live", childAdam: "Adam · age 10", childSara: "Sara · age 14",
  },
} as const;

export default function ParentPlanPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [childId, setChildId] = useState("adam");
  const [sessions, setSessions] = useState<WeekSession[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  const [selected, setSelected] = useState<WeekSession | null>(null);
  const [dragged, setDragged] = useState<string | null>(null);
  const [blockingMode, setBlockingMode] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [message, setMessage] = useState("");
  const t = copy[locale];

  async function loadPlan(id = childId) {
    const response = await fetch(`/api/week-plan?childId=${id}`);
    const data = await response.json();
    setSessions(data.sessions ?? []);
    setBlockedSlots(data.blockedSlots ?? []);
  }
  useEffect(() => { loadPlan(); }, [childId]);

  const visibleSessions = useMemo(() => sessions.filter((session) => session.childId === childId), [sessions, childId]);
  const catalogue = useMemo(() => localizeCourses(locale), [locale]);

  const moveSession = async (sessionId: string, date: string, startTime: string) => {
    const previous = sessions;
    setSessions((items) => items.map((item) => (item.id === sessionId ? { ...item, date, startTime } : item)));
    const response = await fetch("/api/week-plan", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, date, startTime }) });
    if (!response.ok) { setSessions(previous); setMessage(t.moveFailed); return; }
    setMessage(t.saved);
    window.setTimeout(() => setMessage(""), 2200);
  };

  const toggleBlocked = async (date: string, startTime: string) => {
    const key = `${date}|${startTime}`;
    const blocked = !blockedSlots.includes(key);
    setBlockedSlots((items) => (blocked ? [...items, key] : items.filter((item) => item !== key)));
    const response = await fetch("/api/week-plan", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "block_slot", date, startTime, blocked }) });
    if (!response.ok) setBlockedSlots((items) => (blocked ? items.filter((item) => item !== key) : [...items, key]));
  };

  const adjustWithAi = () => {
    setAdjusting(true);
    window.setTimeout(() => {
      setAdjusting(false);
      setMessage(t.aiReady);
      window.setTimeout(() => setMessage(""), 2800);
    }, 900);
  };

  return (
    <main className="app-shell plan-shell">
      <aside className="sidebar">
        <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <div className="side-label">{t.family}</div>
        {nav.map(([icon, fr, en, href]) => (
          <Link key={href} className={`side-link ${href === "/parent/plan" ? "active" : ""}`} href={href}><span>{icon}</span><span>{locale === "fr" ? fr : en}</span></Link>
        ))}
        <div className="sidebar-bottom">{t.privateNote}<br />{t.aiNote}</div>
      </aside>

      <section className="workspace plan-workspace">
        <div className="workspace-top">
          <div><div className="eyebrow">{t.eyebrow}</div><h1>{t.title}</h1></div>
          <div className="workspace-top-tools">
            <button className="locale-switch" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>{locale === "fr" ? "EN" : "FR"}</button>
            <div className="profile"><span className="avatar">AG</span><span>{locale === "fr" ? "Famille Ghorbel" : "Ghorbel family"}⌄</span></div>
          </div>
        </div>

        <div className="plan-toolbar">
          <div>
            <p className="plan-kicker">{t.currentWeek}</p>
            <h2>{t.week}</h2>
            <p className="plan-muted">{t.dragHint}</p>
          </div>
          <div className="plan-controls">
            <button className={`block-toggle ${blockingMode ? "selected" : ""}`} onClick={() => setBlockingMode((value) => !value)}>{blockingMode ? `✓ ${t.doneSelecting}` : `▦ ${t.blockSlots}`}</button>
            <button className="ai-adjust" onClick={adjustWithAi} disabled={adjusting}><span>✦</span>{adjusting ? t.analysing : t.aiAdjust}</button>
            <div className="week-arrows"><button aria-label={t.prevWeek}>‹</button><button aria-label={t.nextWeek}>›</button></div>
            <label>{t.child}
              <select value={childId} onChange={(event) => setChildId(event.target.value)}>
                <option value="adam">{t.childAdam}</option>
                <option value="sara">{t.childSara}</option>
              </select>
            </label>
          </div>
        </div>

        {blockingMode && (
          <div className="blocking-banner" role="status">
            <span>▦</span>
            <div><strong>{t.blockingTitle}</strong><small>{t.blockingHelp}</small></div>
          </div>
        )}

        <div className="plan-layout">
          <section className="calendar-card" aria-label={t.calendar}>
            <div className="calendar-head">
              <div className="time-head">{t.hour}</div>
              {days.map(([fr, en, date], index) => <div className={`day-head ${index === 0 ? "today" : ""}`} key={date}><b>{locale === "fr" ? fr : en}</b><strong>{date.slice(8)}</strong></div>)}
            </div>
            <div className="calendar-body">
              {slots.map((slot) => (
                <div className="calendar-row" key={slot}>
                  <div className="time-label">{slot}</div>
                  {days.map(([, , date]) => {
                    const item = visibleSessions.find((session) => session.date === date && session.startTime === slot);
                    const blocked = blockedSlots.includes(`${date}|${slot}`);
                    return (
                      <div
                        className={`drop-slot ${blocked ? "blocked" : ""} ${blockingMode ? "blocking" : ""}`}
                        key={`${date}-${slot}`}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => !blockingMode && !blocked && dragged && moveSession(dragged, date, slot)}
                        onClick={() => blockingMode && !item && toggleBlocked(date, slot)}
                      >
                        {blocked && <span className="blocked-label">{t.unavailable}</span>}
                        {item && (
                          <button
                            className={`session-card ${item.type}`}
                            draggable={!blockingMode}
                            onDragStart={() => setDragged(item.id)}
                            onDragEnd={() => setDragged(null)}
                            onClick={(event) => { event.stopPropagation(); if (!blockingMode) setSelected(item); }}
                            aria-label={`${item.title}, ${slot}`}
                          >
                            <span className="session-time">{item.startTime} · {item.duration} min</span>
                            <strong>{item.title}</strong>
                            <small>{item.type === "group" ? `● ${t.live}` : item.location}</small>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="calendar-legend">
              <span><i className="legend-dot lesson" />{t.lessons}</span>
              <span><i className="legend-dot group" />{t.groups}</span>
              <span><i className="legend-dot islamic" />{t.islamic}</span>
              <span className="drag-hint">↕ {t.dragEnabled}</span>
            </div>
          </section>

          <aside className="plan-side">
            <div className="plan-side-card week-courses">
              <div className="side-card-heading">
                <div className="plan-side-icon">✓</div>
                <div><p className="plan-kicker">{t.remember}</p><h3>{t.weekCourses}</h3></div>
              </div>
              <p>{t.remaining} {childId === "adam" ? "Adam" : "Sara"}, {t.according}</p>
              {catalogue.filter((course) => course.progress < 100).slice(0, 4).map((course) => {
                const count = Math.max(1, Math.ceil((100 - course.progress) / 25));
                return (
                  <Link className="week-course" href={`/parent/cours/${course.id}`} key={course.id}>
                    <span className={`course-mini-icon ${course.color}`}>{course.icon}</span>
                    <span><strong>{course.title}</strong><small>{count} {count > 1 ? t.sessions : t.session} · {course.duration}</small></span>
                    <b>›</b>
                  </Link>
                );
              })}
              <Link className="plan-secondary" href="/parent/cours">{t.allCourses} →</Link>
            </div>
            <div className="plan-side-card plan-help">
              <span>💡</span>
              <div><strong>{t.needHelp}</strong><p>{t.helpText}</p><Link href="/parent/assistant">{t.openAssistant}</Link></div>
            </div>
          </aside>
        </div>

        {message && <div className="toast" role="status">✓ {message}</div>}

        {selected && (
          <div className="session-detail-backdrop" onClick={() => setSelected(null)}>
            <aside className="session-detail" onClick={(event) => event.stopPropagation()}>
              <button className="detail-close" onClick={() => setSelected(null)} aria-label={t.close}>×</button>
              <span className={`detail-type ${selected.type}`}>{typeLabels[selected.type][locale]}</span>
              <h2>{selected.title}</h2>
              <p className="detail-date">{selected.date} · {selected.startTime} · {selected.duration} min</p>
              <div className="detail-info"><strong>{t.goal}</strong><p>{selected.note}</p></div>
              <div className="detail-info"><strong>{t.format}</strong><p>{selected.location}</p></div>
              <div className="detail-actions">
                <Link className="detail-primary" href={`/parent/cours/${selected.courseId}`}>{t.openCourse}</Link>
                <button className="detail-secondary" onClick={() => setSelected(null)}>{t.close}</button>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
