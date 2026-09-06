"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { noteSectionLabels, noteSections, type LiveSession, type NoteSection, type SpeakingTurn } from "@/src/domain/live-session";

type Locale = "fr" | "en";

const copy = {
  fr: {
    room: "Classe collaborative", tagline: "Apprendre ensemble, grandir dans la foi et les sciences",
    course: "Cours", objective: "Objectif", timer: "Temps de session", students: "élèves",
    open: "Ouvrir la salle", opening: "Ouverture…", lobby: "Salle non ouverte", lobbyHelp: "Les élèves attendent dans le lobby. Ouvrez la salle quand vous êtes prêt.",
    ended: "Session terminée", endedHelp: "Le résumé est disponible pour le parent et l’élève.",
    activity: "Activité partagée", turnOf: "Au tour de", noTurn: "Personne n’a la parole", give: "Donner la parole", endTurn: "Reprendre la parole",
    raised: "Main levée", waiting: "en attente", ideas: "Idées partagées", noIdeas: "Aucune idée partagée pour l’instant.",
    ai: "Assistant de classe IA", aiHelp: "Je propose, vous décidez. Rien n’est publié sans votre validation.",
    aiRelaunch: "Relancer la discussion", aiRelaunchHelp: "Proposer une nouvelle question pour faire avancer la réflexion.",
    aiChallenge: "Créer un défi", aiChallengeHelp: "Recevoir un défi lié au sujet pour aller plus loin.",
    aiSummarize: "Résumer", aiSummarizeHelp: "Obtenir un résumé des idées clés de la discussion.",
    notes: "Notes automatiques", notesLive: "En direct", notesHelp: "Vérifiez avant publication. Les propositions de l’IA sont marquées.",
    addNote: "Ajouter une note", noteText: "Note", save: "Ajouter", empty: "Aucune note dans cette section.",
    validate: "Valider les notes", publish: "Publier le résumé", validated: "Notes validées", published: "Résumé publié",
    ticket: "Défi éclair — 3 questions", ticketHelp: "Répondez ensemble et vérifiez la compréhension.", startTicket: "Lancer le défi", closeTicket: "Clore le défi",
    answers: "réponses", correct: "correctes",
    controls: "Espace respectueux et bienveillant", controlRules: "Écoute • Respect • Collaboration",
    mic: "Micro", camera: "Caméra", chat: "Chat", leave: "Terminer", help: "Aide",
    remove: "Retirer", removed: "Retiré", presence: "Présence", contributions: "prises de parole",
    loading: "Chargement de la salle…", error: "La salle n’a pas pu être chargée.", retry: "Réessayer",
    aiSource: "IA", sessionSource: "Session", reset: "Réinitialiser la démo",
    noNotesYet: "Ajoutez ou générez une note avant de valider.",
  },
  en: {
    room: "Collaborative class", tagline: "Learning together, growing in faith and science",
    course: "Course", objective: "Objective", timer: "Session time", students: "students",
    open: "Open the room", opening: "Opening…", lobby: "Room not open", lobbyHelp: "Students are waiting in the lobby. Open the room when you are ready.",
    ended: "Session ended", endedHelp: "The summary is available to the parent and the student.",
    activity: "Shared activity", turnOf: "Speaking now:", noTurn: "Nobody has the floor", give: "Give the floor", endTurn: "Take back the floor",
    raised: "Hand raised", waiting: "waiting", ideas: "Shared ideas", noIdeas: "No idea shared yet.",
    ai: "Class AI assistant", aiHelp: "I propose, you decide. Nothing is published without your approval.",
    aiRelaunch: "Restart the discussion", aiRelaunchHelp: "Propose a new question to move the thinking forward.",
    aiChallenge: "Create a challenge", aiChallengeHelp: "Get a challenge tied to the topic to go further.",
    aiSummarize: "Summarise", aiSummarizeHelp: "Get a summary of the key ideas from the discussion.",
    notes: "Automatic notes", notesLive: "Live", notesHelp: "Check before publishing. AI proposals are marked.",
    addNote: "Add a note", noteText: "Note", save: "Add", empty: "No note in this section.",
    validate: "Validate the notes", publish: "Publish the summary", validated: "Notes validated", published: "Summary published",
    ticket: "Quick challenge — 3 questions", ticketHelp: "Answer together and check understanding.", startTicket: "Start the challenge", closeTicket: "Close the challenge",
    answers: "answers", correct: "correct",
    controls: "A respectful and caring space", controlRules: "Listening • Respect • Collaboration",
    mic: "Mic", camera: "Camera", chat: "Chat", leave: "End", help: "Help",
    remove: "Remove", removed: "Removed", presence: "Presence", contributions: "turns taken",
    loading: "Loading the room…", error: "The room could not be loaded.", retry: "Try again",
    aiSource: "AI", sessionSource: "Session", reset: "Reset the demo",
    noNotesYet: "Add or generate a note before validating.",
  },
} as const;

function elapsed(startedAt?: string): string {
  if (!startedAt) return "00:00";
  const seconds = Math.max(0, Math.floor((Date.now() - Date.parse(startedAt)) / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function TutorLivePage({ params }: { params: { sessionId: string } }) {
  const [locale, setLocale] = useState<Locale>("fr");
  const [session, setSession] = useState<LiveSession | null>(null);
  const [turn, setTurn] = useState<SpeakingTurn | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [noteSection, setNoteSection] = useState<NoteSection>("skills");
  const [noteText, setNoteText] = useState("");
  const [toast, setToast] = useState("");
  const [clock, setClock] = useState("00:00");
  const pollRef = useRef<ReturnType<typeof setInterval>>();
  const t = copy[locale];

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/live?sessionId=${params.sessionId}`);
      if (!response.ok) throw new Error("load_failed");
      const data = await response.json();
      setSession(data.session);
      setTurn(data.currentTurn);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [params.sessionId]);

  useEffect(() => { load(); pollRef.current = setInterval(load, 2000); return () => clearInterval(pollRef.current); }, [load]);
  useEffect(() => {
    const timer = setInterval(() => setClock(elapsed(session?.startedAt)), 1000);
    setClock(elapsed(session?.startedAt));
    return () => clearInterval(timer);
  }, [session?.startedAt]);

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2400); }

  async function act(body: Record<string, unknown>, message?: string) {
    const response = await fetch("/api/live", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { flash(data.error === "no_notes" ? t.noNotesYet : t.error); return; }
    setSession(data.session);
    setTurn(data.currentTurn);
    if (message) flash(message);
  }

  if (status === "loading") return <main className="live-shell live-centered">{t.loading}</main>;
  if (status === "error" || !session) return <main className="live-shell live-centered"><p>{t.error}</p><button className="button" onClick={load}>{t.retry}</button></main>;

  const students = session.participants.filter((item) => item.role === "student");
  const present = students.filter((item) => item.present);
  const speaking = turn ? session.participants.find((item) => item.id === turn.participantId) : undefined;
  const raisedHands = present.filter((item) => item.handRaised).sort((a, b) => Date.parse(a.handRaisedAt ?? "") - Date.parse(b.handRaisedAt ?? ""));

  return (
    <main className="live-shell">
      <header className="live-header">
        <div className="live-brand"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /><div><strong>{t.room}</strong><small>{t.tagline}</small></div></div>
        <div className="live-header-field"><span>{t.course}</span><strong>{locale === "fr" ? session.subjectFr : session.subjectEn}</strong></div>
        <div className="live-header-field"><span>{t.objective}</span><strong>{locale === "fr" ? session.objectiveFr : session.objectiveEn}</strong></div>
        <div className="live-timer"><b>{clock}</b><small>{t.timer}</small></div>
        <div className="live-presence">👥 {present.length} {t.students} <i className={session.status === "live" ? "on" : ""} /></div>
        <button className="live-locale" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>{locale === "fr" ? "EN" : "FR"}</button>
      </header>

      {session.status === "lobby" && (
        <section className="live-lobby">
          <div><h2>{t.lobby}</h2><p>{t.lobbyHelp}</p>
            <ul className="live-rules">{(locale === "fr" ? session.rulesFr : session.rulesEn).map((rule) => <li key={rule}>{rule}</li>)}</ul>
          </div>
          <button className="live-primary" onClick={() => act({ action: "open_room" })}>{t.open}</button>
        </section>
      )}

      <div className="live-layout">
        <section className="live-participants" aria-label={t.presence}>
          {students.map((student) => (
            <article className={`live-tile ${speaking?.id === student.id ? "speaking" : ""} ${student.present ? "" : "absent"}`} key={student.id}>
              <div className="live-avatar">{student.displayName.slice(0, 1)}</div>
              <div className="live-tile-body">
                <strong>{student.displayName}</strong>
                <small>{student.contributions} {locale === "fr" ? (student.contributions > 1 ? "prises de parole" : "prise de parole") : student.contributions === 1 ? "turn taken" : "turns taken"}</small>
              </div>
              {student.handRaised && <span className="live-hand" title={t.raised}>✋</span>}
              <div className="live-tile-actions">
                {session.status === "live" && student.present && speaking?.id !== student.id && <button onClick={() => act({ action: "grant_turn", participantId: student.id })}>{t.give}</button>}
                {student.present ? <button className="danger" onClick={() => act({ action: "remove_participant", participantId: student.id }, t.removed)}>{t.remove}</button> : <em>{t.removed}</em>}
              </div>
            </article>
          ))}
        </section>

        <section className="live-activity">
          <span className="live-kicker">{t.activity}</span>
          <h1>{locale === "fr" ? session.questionFr : session.questionEn}</h1>
          <p className="live-prompt">{locale === "fr" ? session.promptFr : session.promptEn}</p>
          <div className="live-ideas">
            <span className="live-kicker">{t.ideas}</span>
            {session.ideas.length === 0 && <p className="live-empty">{t.noIdeas}</p>}
            {session.ideas.map((idea) => <div className="live-idea" key={idea.id}><strong>{idea.displayName}</strong><p>{idea.text}</p></div>)}
          </div>
          <div className="live-turnbar">
            <div>
              <span className="live-kicker">{speaking ? t.turnOf : ""}</span>
              <strong>{speaking ? speaking.displayName : t.noTurn}</strong>
              {raisedHands.length > 0 && <small>✋ {raisedHands.map((item) => item.displayName).join(", ")} — {t.waiting}</small>}
            </div>
            <div className="live-turnbar-actions">
              {raisedHands[0] && <button className="live-primary" onClick={() => act({ action: "grant_turn", participantId: raisedHands[0].id })}>{t.give} · {raisedHands[0].displayName}</button>}
              {speaking && <button className="live-ghost" onClick={() => act({ action: "end_turn" })}>{t.endTurn}</button>}
            </div>
          </div>
        </section>

        <aside className="live-ai">
          <div className="live-ai-head"><span>✦ {t.ai}</span></div>
          <p>{t.aiHelp}</p>
          <button onClick={() => act({ action: "ai_relaunch" })}><strong>{t.aiRelaunch}</strong><small>{t.aiRelaunchHelp}</small></button>
          <button onClick={() => act({ action: "ai_challenge" })}><strong>{t.aiChallenge}</strong><small>{t.aiChallengeHelp}</small></button>
          <button onClick={() => act({ action: "ai_summarize" })}><strong>{t.aiSummarize}</strong><small>{t.aiSummarizeHelp}</small></button>
        </aside>

        <section className="live-notes">
          <div className="live-notes-head">
            <div><span className="live-kicker">{t.notes}</span><p>{t.notesHelp}</p></div>
            <span className={`live-badge ${session.notesStatus}`}>{session.notesStatus === "published" ? t.published : session.notesStatus === "validated" ? t.validated : `● ${t.notesLive}`}</span>
          </div>
          <div className="live-notes-grid">
            {noteSections.map((section) => (
              <div className={`live-note-column ${section}`} key={section}>
                <strong>{noteSectionLabels[section][locale]}</strong>
                {session.notes.filter((note) => note.section === section).length === 0 && <small className="live-empty">{t.empty}</small>}
                {session.notes.filter((note) => note.section === section).map((note) => (
                  <div className="live-note" key={note.id}>
                    <span className={`live-note-source ${note.source}`}>{note.source === "ai" ? t.aiSource : t.sessionSource}</span>
                    <p>{note.content}</p>
                    {session.notesStatus === "draft" && <button aria-label={t.remove} onClick={() => act({ action: "remove_note", noteId: note.id })}>×</button>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {session.notesStatus === "draft" && (
            <form className="live-note-form" onSubmit={(event) => { event.preventDefault(); if (!noteText.trim()) return; act({ action: "add_note", section: noteSection, text: noteText }); setNoteText(""); }}>
              <select value={noteSection} onChange={(event) => setNoteSection(event.target.value as NoteSection)} aria-label={t.addNote}>
                {noteSections.map((section) => <option key={section} value={section}>{noteSectionLabels[section][locale]}</option>)}
              </select>
              <input value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder={t.addNote} aria-label={t.noteText} />
              <button className="live-primary" type="submit">{t.save}</button>
            </form>
          )}
          <div className="live-notes-actions">
            {session.notesStatus === "draft" && <button className="live-primary" onClick={() => act({ action: "validate_notes" }, t.validated)}>{t.validate}</button>}
            {session.notesStatus === "validated" && <button className="live-primary" onClick={() => act({ action: "publish_summary" }, t.published)}>{t.publish}</button>}
          </div>
        </section>

        <section className="live-ticket">
          <div className="live-ticket-head"><span>🏆 {t.ticket}</span><small>{t.ticketHelp}</small></div>
          <div className="live-ticket-scores">
            {present.map((student) => {
              const answers = session.exitTicket.answers[student.id] ?? {};
              const correct = session.exitTicket.questions.filter((question) => answers[question.id] === question.correctChoiceId).length;
              return <div key={student.id}><strong>{student.displayName}</strong><small>{Object.keys(answers).length}/{session.exitTicket.questions.length} {t.answers} · {correct} {t.correct}</small></div>;
            })}
          </div>
          {session.exitTicket.status !== "open"
            ? <button className="live-primary" onClick={() => act({ action: "start_ticket" })} disabled={session.status !== "live"}>{t.startTicket}</button>
            : <button className="live-ghost" onClick={() => act({ action: "close_ticket" })}>{t.closeTicket}</button>}
        </section>
      </div>

      <footer className="live-controls">
        <div className="live-controls-rules"><span>🛡</span><div><strong>{t.controls}</strong><small>{t.controlRules}</small></div></div>
        <div className="live-controls-buttons">
          <button onClick={() => act({ action: "set_audio", participantId: "p-tutor", value: "speaking" })}>🎙 {t.mic}</button>
          <button onClick={() => act({ action: "set_camera", participantId: "p-tutor", value: true })}>🎥 {t.camera}</button>
          <button>💬 {t.chat}</button>
          <button className="live-leave" onClick={() => act({ action: "end_session" })}>{t.leave}</button>
        </div>
        <div className="live-controls-side">
          <button className="live-ghost" onClick={() => act({ action: "reset" })}>{t.reset}</button>
          <Link className="live-ghost" href={`/student/live/${session.id}`}>{t.help}</Link>
        </div>
      </footer>
      {session.status === "ended" && <div className="live-ended" role="status"><strong>{t.ended}</strong><small>{t.endedHelp}</small></div>}
      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </main>
  );
}
