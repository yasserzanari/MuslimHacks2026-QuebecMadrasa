import { localStore } from "./local-store";

export type LiveSessionStatus = "lobby" | "live" | "ended";
export type NotesStatus = "draft" | "validated" | "published";
export type ParticipantRole = "student" | "tutor";
export type AudioState = "muted" | "speaking" | "listening";
export type NoteSection = "said" | "skills" | "to_check" | "next_activity";
export type NoteSource = "session" | "ai";
export type NoteValidation = "draft" | "validated";

export interface LiveParticipant {
  id: string;
  sessionId: string;
  childId: string;
  displayName: string;
  role: ParticipantRole;
  audioState: AudioState;
  handRaised: boolean;
  handRaisedAt?: string;
  cameraOn: boolean;
  present: boolean;
  contributions: number;
}

export interface SpeakingTurn {
  id: string;
  sessionId: string;
  participantId: string;
  startedAt: string;
  endedAt?: string;
  grantedBy: string;
}

export interface SessionNote {
  id: string;
  sessionId: string;
  section: NoteSection;
  content: string;
  source: NoteSource;
  validationStatus: NoteValidation;
}

export interface ExitTicketQuestion {
  id: string;
  promptFr: string;
  promptEn: string;
  choices: { id: string; fr: string; en: string }[];
  correctChoiceId: string;
}

export interface ExitTicket {
  id: string;
  sessionId: string;
  questions: ExitTicketQuestion[];
  answers: Record<string, Record<string, string>>;
  status: "idle" | "open" | "closed";
}

export interface SharedIdea {
  id: string;
  participantId: string;
  displayName: string;
  text: string;
  createdAt: string;
}

export interface LiveSession {
  id: string;
  courseId: string;
  hostId: string;
  titleFr: string;
  titleEn: string;
  subjectFr: string;
  subjectEn: string;
  objectiveFr: string;
  objectiveEn: string;
  questionFr: string;
  questionEn: string;
  promptFr: string;
  promptEn: string;
  status: LiveSessionStatus;
  notesStatus: NotesStatus;
  startedAt?: string;
  participants: LiveParticipant[];
  turns: SpeakingTurn[];
  notes: SessionNote[];
  ideas: SharedIdea[];
  exitTicket: ExitTicket;
  capacity: number;
  rulesFr: string[];
  rulesEn: string[];
  recordingEnabled: boolean;
}

export const noteSectionLabels: Record<NoteSection, { fr: string; en: string }> = {
  said: { fr: "Dit pendant la session", en: "Said during the session" },
  skills: { fr: "Notions travaillées", en: "Skills covered" },
  to_check: { fr: "À vérifier", en: "To check" },
  next_activity: { fr: "Prochaine activité", en: "Next activity" },
};

export const noteSections: NoteSection[] = ["said", "skills", "to_check", "next_activity"];

function iso(offsetMinutes = 0): string {
  return new Date(Date.now() + offsetMinutes * 60000).toISOString();
}

function seed(): LiveSession {
  const sessionId = "ecosystemes";
  const student = (childId: string, displayName: string): LiveParticipant => ({
    id: `p-${childId}`, sessionId, childId, displayName, role: "student", audioState: "listening", handRaised: false, cameraOn: false, present: true, contributions: 0,
  });
  return {
    id: sessionId,
    courseId: "ecosystems",
    hostId: "tutor-nour",
    titleFr: "Classe collaborative",
    titleEn: "Collaborative class",
    subjectFr: "Sciences — l’eau et les écosystèmes",
    subjectEn: "Science — water and ecosystems",
    objectiveFr: "Expliquer comment un écosystème reste en équilibre",
    objectiveEn: "Explain how an ecosystem stays in balance",
    questionFr: "Que se passe-t-il si les abeilles disparaissent ?",
    questionEn: "What happens if the bees disappear?",
    promptFr: "Observe le schéma et explique les effets possibles sur l’écosystème.",
    promptEn: "Look at the diagram and explain the possible effects on the ecosystem.",
    status: "lobby",
    notesStatus: "draft",
    participants: [
      { ...student("yasmine", "Yasmine") },
      { ...student("adam", "Adam") },
      { ...student("sara", "Sara") },
      { ...student("omar", "Omar") },
      { id: "p-tutor", sessionId, childId: "tutor-nour", displayName: "Nour", role: "tutor", audioState: "listening", handRaised: false, cameraOn: false, present: true, contributions: 0 },
    ],
    turns: [],
    notes: [],
    ideas: [],
    exitTicket: {
      id: "ticket-ecosystemes",
      sessionId,
      status: "idle",
      answers: {},
      questions: [
        { id: "q1", promptFr: "Que font les abeilles pour les plantes à fleurs ?", promptEn: "What do bees do for flowering plants?", choices: [{ id: "a", fr: "Elles les pollinisent", en: "They pollinate them" }, { id: "b", fr: "Elles les arrosent", en: "They water them" }, { id: "c", fr: "Elles les coupent", en: "They cut them" }], correctChoiceId: "a" },
        { id: "q2", promptFr: "Sans abeilles, que devient la nourriture des oiseaux ?", promptEn: "Without bees, what happens to the birds’ food?", choices: [{ id: "a", fr: "Elle augmente", en: "It increases" }, { id: "b", fr: "Elle diminue", en: "It decreases" }, { id: "c", fr: "Elle ne change pas", en: "It stays the same" }], correctChoiceId: "b" },
        { id: "q3", promptFr: "Qu’est-ce qu’une chaîne alimentaire ?", promptEn: "What is a food chain?", choices: [{ id: "a", fr: "Une suite d’êtres vivants qui dépendent les uns des autres", en: "A sequence of living things that depend on each other" }, { id: "b", fr: "Une liste de recettes", en: "A list of recipes" }, { id: "c", fr: "Un type de plante", en: "A kind of plant" }], correctChoiceId: "a" },
      ],
    },
    capacity: 8,
    rulesFr: ["On écoute la personne qui a la parole.", "On peut passer son tour sans se justifier.", "La caméra n’est jamais obligatoire.", "Aucun message privé entre élèves.", "Un adulte est présent et identifié."],
    rulesEn: ["We listen to whoever has the floor.", "You may pass your turn without justifying it.", "The camera is never required.", "No private messages between students.", "An identified adult is present."],
    recordingEnabled: false,
  };
}

const store = localStore("live-session", seed);

export function getSession(sessionId = "ecosystemes"): LiveSession {
  const session = store.get();
  if (sessionId !== session.id) throw new Error("session_not_found");
  return session;
}

function update(next: Partial<LiveSession>): LiveSession {
  const updated = { ...store.get(), ...next };
  store.set(updated);
  return updated;
}

function participant(participantId: string): LiveParticipant {
  const found = store.get().participants.find((item) => item.id === participantId);
  if (!found) throw new Error("participant_not_found");
  return found;
}

export function openRoom(): LiveSession {
  const session = store.get();
  if (session.status === "ended") throw new Error("session_ended");
  return update({ status: "live", startedAt: session.startedAt ?? iso() });
}

export function raiseHand(participantId: string, raised: boolean): LiveSession {
  const session = store.get();
  participant(participantId);
  return update({
    participants: session.participants.map((item) => (item.id === participantId ? { ...item, handRaised: raised, handRaisedAt: raised ? iso() : undefined } : item)),
  });
}

export function grantTurn(participantId: string, grantedBy = "p-tutor"): LiveSession {
  const session = store.get();
  if (session.status !== "live") throw new Error("session_not_live");
  participant(participantId);
  const now = iso();
  const closedTurns = session.turns.map((turn) => (turn.endedAt ? turn : { ...turn, endedAt: now }));
  const turn: SpeakingTurn = { id: `turn-${Date.now()}`, sessionId: session.id, participantId, startedAt: now, grantedBy };
  return update({
    turns: [...closedTurns, turn],
    participants: session.participants.map((item) => (item.id === participantId ? { ...item, audioState: "speaking", handRaised: false, handRaisedAt: undefined } : { ...item, audioState: item.role === "tutor" ? item.audioState : "listening" })),
  });
}

export function endTurn(): LiveSession {
  const session = store.get();
  const now = iso();
  return update({
    turns: session.turns.map((turn) => (turn.endedAt ? turn : { ...turn, endedAt: now })),
    participants: session.participants.map((item) => ({ ...item, audioState: item.audioState === "speaking" ? "listening" : item.audioState })),
  });
}

export function currentTurn(): SpeakingTurn | undefined {
  const session = store.get();
  return session.turns.find((turn) => !turn.endedAt);
}

export function shareIdea(participantId: string, text: string): LiveSession {
  const session = store.get();
  if (!text.trim()) throw new Error("idea_required");
  const person = participant(participantId);
  const idea: SharedIdea = { id: `idea-${Date.now()}`, participantId, displayName: person.displayName, text: text.trim().slice(0, 400), createdAt: iso() };
  return update({
    ideas: [...session.ideas, idea],
    participants: session.participants.map((item) => (item.id === participantId ? { ...item, contributions: item.contributions + 1 } : item)),
    notes: [...session.notes, { id: `note-${Date.now()}`, sessionId: session.id, section: "said", content: `${person.displayName} : ${idea.text}`, source: "session", validationStatus: "draft" }],
  });
}

export function setAudio(participantId: string, audioState: AudioState): LiveSession {
  const session = store.get();
  participant(participantId);
  return update({ participants: session.participants.map((item) => (item.id === participantId ? { ...item, audioState } : item)) });
}

export function setCamera(participantId: string, cameraOn: boolean): LiveSession {
  const session = store.get();
  participant(participantId);
  return update({ participants: session.participants.map((item) => (item.id === participantId ? { ...item, cameraOn } : item)) });
}

export function removeParticipant(participantId: string): LiveSession {
  const session = store.get();
  participant(participantId);
  return update({ participants: session.participants.map((item) => (item.id === participantId ? { ...item, present: false, handRaised: false, audioState: "muted" } : item)) });
}

export function addNote(section: NoteSection, content: string, source: NoteSource = "session"): LiveSession {
  const session = store.get();
  if (!content.trim()) throw new Error("note_required");
  if (session.notesStatus === "published") throw new Error("notes_published");
  const note: SessionNote = { id: `note-${Date.now()}`, sessionId: session.id, section, content: content.trim(), source, validationStatus: "draft" };
  return update({ notes: [...session.notes, note] });
}

export function editNote(noteId: string, content: string): LiveSession {
  const session = store.get();
  if (session.notesStatus === "published") throw new Error("notes_published");
  if (!session.notes.some((note) => note.id === noteId)) throw new Error("note_not_found");
  return update({ notes: session.notes.map((note) => (note.id === noteId ? { ...note, content: content.trim() } : note)) });
}

export function removeNote(noteId: string): LiveSession {
  const session = store.get();
  if (session.notesStatus === "published") throw new Error("notes_published");
  return update({ notes: session.notes.filter((note) => note.id !== noteId) });
}

/** AI assistant actions: proposals only, always marked as ai and never auto-published. */
export function aiAction(action: "relaunch" | "summarize" | "challenge"): LiveSession {
  const session = store.get();
  if (action === "summarize") {
    const said = session.notes.filter((note) => note.section === "said");
    const summary = said.length
      ? `Idées reprises : ${said.slice(-3).map((note) => note.content).join(" | ")}`
      : "Aucune idée partagée pour le moment.";
    return update({ notes: [...session.notes, { id: `note-${Date.now()}`, sessionId: session.id, section: "skills", content: summary, source: "ai", validationStatus: "draft" }] });
  }
  if (action === "challenge") {
    return update({ notes: [...session.notes, { id: `note-${Date.now()}`, sessionId: session.id, section: "next_activity", content: "Mini-jeu proposé : relier chaque être vivant à ce dont il dépend.", source: "ai", validationStatus: "draft" }] });
  }
  return update({ notes: [...session.notes, { id: `note-${Date.now()}`, sessionId: session.id, section: "to_check", content: "Question relancée : quelle preuve soutient cette idée ?", source: "ai", validationStatus: "draft" }] });
}

export function validateNotes(): LiveSession {
  const session = store.get();
  if (session.notes.length === 0) throw new Error("no_notes");
  return update({ notesStatus: "validated", notes: session.notes.map((note) => ({ ...note, validationStatus: "validated" })) });
}

export function publishSummary(): LiveSession {
  const session = store.get();
  if (session.notesStatus !== "validated") throw new Error("notes_not_validated");
  return update({ notesStatus: "published" });
}

export function startExitTicket(): LiveSession {
  const session = store.get();
  if (session.status !== "live") throw new Error("session_not_live");
  return update({ exitTicket: { ...session.exitTicket, status: "open" } });
}

export function answerExitTicket(participantId: string, questionId: string, choiceId: string): LiveSession {
  const session = store.get();
  if (session.exitTicket.status !== "open") throw new Error("ticket_not_open");
  const answers = { ...session.exitTicket.answers, [participantId]: { ...(session.exitTicket.answers[participantId] ?? {}), [questionId]: choiceId } };
  return update({ exitTicket: { ...session.exitTicket, answers } });
}

export function closeExitTicket(): LiveSession {
  const session = store.get();
  return update({ exitTicket: { ...session.exitTicket, status: "closed" } });
}

export function endSession(): LiveSession {
  const session = store.get();
  return update({ status: "ended", participants: session.participants.map((item) => ({ ...item, audioState: "muted", handRaised: false })) });
}

export function ticketScore(participantId: string): { answered: number; correct: number; total: number } {
  const session = store.get();
  const answers = session.exitTicket.answers[participantId] ?? {};
  const correct = session.exitTicket.questions.filter((question) => answers[question.id] === question.correctChoiceId).length;
  return { answered: Object.keys(answers).length, correct, total: session.exitTicket.questions.length };
}

export function resetSession(): void {
  store.reset();
}
