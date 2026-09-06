"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveSession, SpeakingTurn } from "@/src/domain/live-session";

type Locale = "fr" | "en";

const me = "p-yasmine";

const copy = {
  fr: {
    room: "Classe collaborative", course: "Cours", objective: "Objectif", live: "En direct", students: "élèves",
    waitingTitle: "La salle n’est pas encore ouverte", waitingHelp: "Ton tuteur va ouvrir la salle. En attendant, relis les règles.",
    rules: "Règles de la classe",
    yourTurn: "Tu as la parole", yourTurnHelp: "Explique ton idée avec tes mots.",
    nextTurn: "Tu es le prochain à parler", nextTurnHelp: "Prépare ton idée.", ready: "Je suis prêt",
    listening: "Écoute la personne qui parle", listeningHelp: "Tu pourras répondre à ton tour.",
    speakingNow: "parle en ce moment",
    writeIdea: "Écris ton idée ici…", share: "Partager mon idée", shared: "Idée partagée !", hint: "Demander un indice",
    aiTitle: "Aide IA", aiIntro: "Je peux t’aider à préparer ton idée.", aiQuestion: "Quelle preuve peux-tu utiliser ?",
    aiHint: "Indice", aiRephrase: "Reformuler", aiDisclaimer: "IA pour t’aider à réfléchir, pas pour remplacer tes idées.",
    aiPlaceholder: "Écris ou parle…",
    notes: "Notes de la session", notesHelp: "Tes notes sont privées et visibles seulement par toi.", notesPlaceholder: "J’écris mes idées, des mots-clés ou des exemples ici…",
    ticket: "Défi de fin — 3 questions", ticketHelp: "Réponds pour vérifier ce que tu as compris.", ticketWait: "Le défi n’est pas encore ouvert.",
    ticketDone: "Défi terminé", yourScore: "Ton résultat",
    mic: "Micro", camera: "Caméra", raise: "Lever la main", lower: "Baisser la main", chat: "Chat", leave: "Quitter",
    loading: "Chargement de la classe…", error: "La classe n’a pas pu être chargée.", retry: "Réessayer",
    ended: "La session est terminée.", endedHelp: "Ton résumé sera partagé avec ton parent.", back: "Retour à mon espace",
    micDenied: "Le micro n’est pas autorisé. Tu peux écrire ton idée.", handRaised: "Ta main est levée.",
    removed: "Tu n’es plus dans la salle.",
  },
  en: {
    room: "Collaborative class", course: "Course", objective: "Objective", live: "Live", students: "students",
    waitingTitle: "The room is not open yet", waitingHelp: "Your tutor will open the room. Meanwhile, read the rules again.",
    rules: "Class rules",
    yourTurn: "You have the floor", yourTurnHelp: "Explain your idea in your own words.",
    nextTurn: "You are next to speak", nextTurnHelp: "Get your idea ready.", ready: "I am ready",
    listening: "Listen to whoever is speaking", listeningHelp: "You will answer on your turn.",
    speakingNow: "is speaking now",
    writeIdea: "Write your idea here…", share: "Share my idea", shared: "Idea shared!", hint: "Ask for a hint",
    aiTitle: "AI help", aiIntro: "I can help you prepare your idea.", aiQuestion: "What evidence can you use?",
    aiHint: "Hint", aiRephrase: "Rephrase", aiDisclaimer: "AI to help you think, not to replace your ideas.",
    aiPlaceholder: "Write or speak…",
    notes: "Session notes", notesHelp: "Your notes are private and visible only to you.", notesPlaceholder: "I write my ideas, keywords or examples here…",
    ticket: "Final challenge — 3 questions", ticketHelp: "Answer to check what you understood.", ticketWait: "The challenge is not open yet.",
    ticketDone: "Challenge finished", yourScore: "Your result",
    mic: "Mic", camera: "Camera", raise: "Raise my hand", lower: "Lower my hand", chat: "Chat", leave: "Leave",
    loading: "Loading the class…", error: "The class could not be loaded.", retry: "Try again",
    ended: "The session has ended.", endedHelp: "Your summary will be shared with your parent.", back: "Back to my space",
    micDenied: "The microphone is not allowed. You can write your idea.", handRaised: "Your hand is raised.",
    removed: "You are no longer in the room.",
  },
} as const;

export default function StudentLivePage({ params }: { params: { sessionId: string } }) {
  const [locale, setLocale] = useState<Locale>("fr");
  const [session, setSession] = useState<LiveSession | null>(null);
  const [turn, setTurn] = useState<SpeakingTurn | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [idea, setIdea] = useState("");
  const [personalNotes, setPersonalNotes] = useState("");
  const [aiMessages, setAiMessages] = useState<string[]>([]);
  const [micAllowed, setMicAllowed] = useState(false);
  const [toast, setToast] = useState("");
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
  useEffect(() => { setAiMessages([t.aiIntro, t.aiQuestion]); }, [t.aiIntro, t.aiQuestion]);

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2400); }

  async function act(body: Record<string, unknown>, message?: string) {
    const response = await fetch("/api/live", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) { flash(t.error); return; }
    setSession(data.session);
    setTurn(data.currentTurn);
    if (message) flash(message);
  }

  if (status === "loading") return <main className="live-shell student-live live-centered">{t.loading}</main>;
  if (status === "error" || !session) return <main className="live-shell student-live live-centered"><p>{t.error}</p><button className="button" onClick={load}>{t.retry}</button></main>;

  const students = session.participants.filter((item) => item.role === "student");
  const self = session.participants.find((item) => item.id === me);
  const speaking = turn ? session.participants.find((item) => item.id === turn.participantId) : undefined;
  const isMyTurn = speaking?.id === me;
  const answers = session.exitTicket.answers[me] ?? {};
  const correct = session.exitTicket.questions.filter((question) => answers[question.id] === question.correctChoiceId).length;

  return (
    <main className="live-shell student-live">
      <header className="live-header">
        <div className="live-brand"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /><div><strong>{t.room}</strong></div></div>
        <div className="live-header-field"><span>{t.course}</span><strong>{locale === "fr" ? session.subjectFr : session.subjectEn}</strong></div>
        <div className="live-header-field"><span>{t.objective}</span><strong>{locale === "fr" ? session.objectiveFr : session.objectiveEn}</strong></div>
        {session.status === "live" && <span className="live-onair">● {t.live}</span>}
        <div className="live-presence">👥 {students.filter((item) => item.present).length} {t.students}</div>
        <button className="live-locale" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>{locale === "fr" ? "EN" : "FR"}</button>
      </header>

      {session.status === "lobby" && (
        <section className="live-lobby">
          <div><h2>{t.waitingTitle}</h2><p>{t.waitingHelp}</p>
            <strong className="live-kicker">{t.rules}</strong>
            <ul className="live-rules">{(locale === "fr" ? session.rulesFr : session.rulesEn).map((rule) => <li key={rule}>{rule}</li>)}</ul>
          </div>
        </section>
      )}

      {self && !self.present && <section className="live-lobby"><div><h2>{t.removed}</h2><Link className="live-primary" href="/student">{t.back}</Link></div></section>}

      <div className="student-live-tiles">
        {students.map((student) => (
          <article className={`live-tile ${student.id === me ? "self" : ""} ${speaking?.id === student.id ? "speaking" : ""}`} key={student.id}>
            <div className="live-avatar">{student.displayName.slice(0, 1)}</div>
            <strong>{student.displayName}</strong>
            {student.handRaised && <span className="live-hand">✋</span>}
            {speaking?.id === student.id && <small>{t.speakingNow}</small>}
          </article>
        ))}
      </div>

      <div className="student-live-layout">
        <section className="student-live-activity">
          <h1>{locale === "fr" ? session.questionFr : session.questionEn}</h1>
          <p className="live-prompt">💡 {locale === "fr" ? session.promptFr : session.promptEn}</p>
          <textarea value={idea} onChange={(event) => setIdea(event.target.value)} placeholder={t.writeIdea} aria-label={t.writeIdea} maxLength={400} disabled={session.status !== "live"} />
          <div className="student-live-actions">
            <button className="live-primary" disabled={!idea.trim() || session.status !== "live"} onClick={() => { act({ action: "share_idea", participantId: me, text: idea }, t.shared); setIdea(""); }}>⬆ {t.share}</button>
            <button className="live-hintbutton" onClick={() => setAiMessages((current) => [...current, locale === "fr" ? "Indice : commence par ce que les abeilles apportent aux plantes." : "Hint: start from what bees bring to the plants."])}>? {t.hint}</button>
          </div>
          {session.ideas.filter((item) => item.participantId === me).map((item) => <div className="live-idea mine" key={item.id}><strong>{item.displayName}</strong><p>{item.text}</p></div>)}
        </section>

        <section className={`student-live-turn ${isMyTurn ? "mine" : ""}`}>
          <div className="student-live-turn-icon">{isMyTurn ? "🎙" : "⏳"}</div>
          <strong>{isMyTurn ? t.yourTurn : self?.handRaised ? t.nextTurn : t.listening}</strong>
          <small>{isMyTurn ? t.yourTurnHelp : self?.handRaised ? t.nextTurnHelp : t.listeningHelp}</small>
          {speaking && !isMyTurn && <p className="student-live-speaker">{speaking.displayName} {t.speakingNow}</p>}
          {session.status === "live" && self?.present && !isMyTurn && (
            self.handRaised
              ? <button className="live-ghost" onClick={() => act({ action: "raise_hand", participantId: me, value: false })}>{t.lower}</button>
              : <button className="live-primary" onClick={() => act({ action: "raise_hand", participantId: me, value: true }, t.handRaised)}>✋ {t.ready}</button>
          )}
        </section>

        <aside className="student-live-ai">
          <div className="student-live-ai-head">✦ {t.aiTitle}</div>
          <div className="student-live-ai-thread">{aiMessages.map((message, index) => <p key={`${message}-${index}`}>{message}</p>)}</div>
          <div className="student-live-ai-actions">
            <button onClick={() => setAiMessages((current) => [...current, locale === "fr" ? "Indice : quelle plante dépend le plus des abeilles ?" : "Hint: which plant depends most on bees?"])}>💡 {t.aiHint}</button>
            <button onClick={() => setAiMessages((current) => [...current, locale === "fr" ? "Autrement dit : que perdrait la forêt sans pollinisation ?" : "Put differently: what would the forest lose without pollination?"])}>↻ {t.aiRephrase}</button>
          </div>
          <div className="student-live-ai-compose">
            <button className={`student-live-mic ${micAllowed ? "on" : ""}`} onClick={() => { setMicAllowed((value) => !value); if (micAllowed) flash(t.micDenied); }} aria-label={t.mic}>🎙</button>
            <input placeholder={t.aiPlaceholder} aria-label={t.aiPlaceholder} onKeyDown={(event) => { if (event.key === "Enter" && event.currentTarget.value.trim()) { setAiMessages((current) => [...current, event.currentTarget.value.trim()]); event.currentTarget.value = ""; } }} />
          </div>
          <small className="student-live-ai-note">🛡 {t.aiDisclaimer}</small>
        </aside>

        <section className="student-live-notes">
          <div><strong>▤ {t.notes}</strong><small>{t.notesHelp}</small></div>
          <textarea value={personalNotes} onChange={(event) => setPersonalNotes(event.target.value.slice(0, 1000))} placeholder={t.notesPlaceholder} aria-label={t.notes} />
          <em>{personalNotes.length}/1000</em>
        </section>

        <section className="student-live-ticket">
          <div className="student-live-ticket-head"><strong>🏆 {t.ticket}</strong><small>{t.ticketHelp}</small></div>
          {session.exitTicket.status === "idle" && <p className="live-empty">{t.ticketWait}</p>}
          {session.exitTicket.status !== "idle" && session.exitTicket.questions.map((question) => (
            <div className="student-live-question" key={question.id}>
              <p>{locale === "fr" ? question.promptFr : question.promptEn}</p>
              <div>
                {question.choices.map((choice) => (
                  <button
                    key={choice.id}
                    className={answers[question.id] === choice.id ? "chosen" : ""}
                    disabled={session.exitTicket.status !== "open"}
                    onClick={() => act({ action: "answer_ticket", participantId: me, questionId: question.id, choiceId: choice.id })}
                  >
                    {locale === "fr" ? choice.fr : choice.en}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {session.exitTicket.status === "closed" && <p className="student-live-score">{t.yourScore} : {correct}/{session.exitTicket.questions.length}</p>}
        </section>
      </div>

      <footer className="live-controls">
        <div className="live-controls-buttons student">
          <button className={micAllowed ? "on" : ""} onClick={() => setMicAllowed((value) => !value)}>🎙 {t.mic}</button>
          <button onClick={() => act({ action: "set_camera", participantId: me, value: !self?.cameraOn })}>🎥 {t.camera}</button>
          <button className={self?.handRaised ? "on" : ""} onClick={() => act({ action: "raise_hand", participantId: me, value: !self?.handRaised })}>✋ {self?.handRaised ? t.lower : t.raise}</button>
          <button>💬 {t.chat}</button>
          <Link className="live-leave" href="/student">{t.leave}</Link>
        </div>
      </footer>
      {session.status === "ended" && <div className="live-ended" role="status"><strong>{t.ended}</strong><small>{t.endedHelp}</small><Link href="/student">{t.back}</Link></div>}
      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </main>
  );
}
