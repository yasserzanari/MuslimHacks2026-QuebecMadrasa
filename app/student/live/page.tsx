"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { LiveSession } from "@/src/domain/live-session";

type Locale = "fr" | "en";

const copy = {
  fr: {
    space: "Mon espace", today: "Aujourd’hui", courses: "Mes cours", play: "Jouer et apprendre", progress: "Ma progression", classes: "Mes classes",
    kicker: "Espace élève", title: "Classes collaboratives",
    lead: "Une classe se prépare avec d’autres élèves et un adulte. Relis les règles avant d’entrer.",
    rules: "Règles de la salle", join: "Entrer dans la salle", waiting: "La salle ouvre bientôt", open: "La salle est ouverte", ended: "Session terminée",
    objective: "Objectif", places: "places", host: "Adulte responsable", noRecording: "Aucun enregistrement",
    loading: "Chargement…", error: "La classe n’a pas pu être chargée.", retry: "Réessayer",
  },
  en: {
    space: "My space", today: "Today", courses: "My courses", play: "Play and learn", progress: "My progress", classes: "My classes",
    kicker: "Student space", title: "Collaborative classes",
    lead: "A class is prepared with other students and an adult. Read the rules before entering.",
    rules: "Room rules", join: "Enter the room", waiting: "The room opens soon", open: "The room is open", ended: "Session ended",
    objective: "Objective", places: "places", host: "Adult in charge", noRecording: "No recording",
    loading: "Loading…", error: "The class could not be loaded.", retry: "Try again",
  },
} as const;

export default function StudentLiveLobbyPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [session, setSession] = useState<LiveSession | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const t = copy[locale];

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/live?sessionId=ecosystemes");
      if (!response.ok) throw new Error("load_failed");
      const data = await response.json();
      setSession(data.session);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(); const timer = setInterval(load, 4000); return () => clearInterval(timer); }, [load]);

  return (
    <main className="student-v2-shell min-h-screen bg-[#f3faf5]">
      <aside className="student-v2-sidebar hidden lg:flex">
        <Link href="/" className="student-v2-logo"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <span className="student-v2-label">{t.space}</span>
        <Link className="student-v2-nav" href="/student">⌂ <span>{t.today}</span></Link>
        <Link className="student-v2-nav" href="/student/cours">▣ <span>{t.courses}</span></Link>
        <Link className="student-v2-nav active" href="/student/live">◍ <span>{t.classes}</span></Link>
        <Link className="student-v2-nav" href="/student/jouer">◈ <span>{t.play}</span></Link>
        <Link className="student-v2-nav" href="/student/progression">✦ <span>{t.progress}</span></Link>
      </aside>
      <section className="student-v2-main">
        <header className="student-v2-top">
          <div><p className="student-v2-kicker">{t.kicker}</p><h1>{t.title}</h1></div>
          <button className="student-v2-locale" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>{locale === "fr" ? "EN" : "FR"}</button>
        </header>
        <p className="assistant-lead">{t.lead}</p>

        {status === "loading" && <div className="panel-card queue-state">{t.loading}</div>}
        {status === "error" && <div className="panel-card queue-state" role="alert"><p>{t.error}</p><button className="button" onClick={load}>{t.retry}</button></div>}

        {session && (
          <article className="lobby-card">
            <div className="lobby-card-main">
              <span className={`lobby-state ${session.status}`}>{session.status === "live" ? `● ${t.open}` : session.status === "ended" ? t.ended : t.waiting}</span>
              <h2>{locale === "fr" ? session.subjectFr : session.subjectEn}</h2>
              <p><strong>{t.objective}</strong> — {locale === "fr" ? session.objectiveFr : session.objectiveEn}</p>
              <div className="lobby-facts">
                <span>👥 {session.participants.filter((item) => item.role === "student" && item.present).length}/{session.capacity} {t.places}</span>
                <span>🛡 {t.host} : Nour</span>
                <span>⦸ {t.noRecording}</span>
              </div>
            </div>
            <div className="lobby-card-side">
              <strong className="live-kicker">{t.rules}</strong>
              <ul className="live-rules">{(locale === "fr" ? session.rulesFr : session.rulesEn).map((rule) => <li key={rule}>{rule}</li>)}</ul>
              <Link className="live-primary" href={`/student/live/${session.id}`}>{t.join}</Link>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}
