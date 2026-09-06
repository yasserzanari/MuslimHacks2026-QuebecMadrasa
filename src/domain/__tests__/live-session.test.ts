import { beforeEach, describe, expect, it } from "vitest";
import {
  addNote, aiAction, answerExitTicket, closeExitTicket, currentTurn, endTurn, getSession, grantTurn,
  openRoom, publishSummary, raiseHand, removeParticipant, resetSession, shareIdea, startExitTicket,
  ticketScore, validateNotes,
} from "../live-session";

const yasmine = "p-yasmine";
const adam = "p-adam";

describe("classe collaborative", () => {
  beforeEach(() => resetSession());

  it("starts in the lobby with recording off", () => {
    const session = getSession();
    expect(session.status).toBe("lobby");
    expect(session.recordingEnabled).toBe(false);
    expect(session.rulesFr.length).toBeGreaterThan(0);
  });

  it("refuses to give the floor before the room is open", () => {
    expect(() => grantTurn(yasmine)).toThrow("session_not_live");
  });

  it("gives the floor to one student at a time", () => {
    openRoom();
    grantTurn(yasmine);
    expect(currentTurn()?.participantId).toBe(yasmine);

    grantTurn(adam);
    const turns = getSession().turns;
    expect(turns.filter((turn) => !turn.endedAt)).toHaveLength(1);
    expect(currentTurn()?.participantId).toBe(adam);
    expect(getSession().participants.find((item) => item.id === yasmine)?.audioState).toBe("listening");
  });

  it("clears the raised hand when the floor is granted", () => {
    openRoom();
    raiseHand(yasmine, true);
    expect(getSession().participants.find((item) => item.id === yasmine)?.handRaised).toBe(true);
    grantTurn(yasmine);
    expect(getSession().participants.find((item) => item.id === yasmine)?.handRaised).toBe(false);
  });

  it("turns a shared idea into a session note, not an AI note", () => {
    openRoom();
    shareIdea(yasmine, "Sans abeilles, moins de fruits.");
    const notes = getSession().notes.filter((note) => note.section === "said");
    expect(notes).toHaveLength(1);
    expect(notes[0].source).toBe("session");
    expect(notes[0].content).toContain("Yasmine");
    expect(getSession().participants.find((item) => item.id === yasmine)?.contributions).toBe(1);
  });

  it("marks every note the AI writes as coming from the AI", () => {
    openRoom();
    aiAction("summarize");
    aiAction("relaunch");
    aiAction("challenge");
    const aiNotes = getSession().notes.filter((note) => note.source === "ai");
    expect(aiNotes).toHaveLength(3);
    expect(aiNotes.every((note) => note.validationStatus === "draft")).toBe(true);
  });

  it("never publishes a summary that the tutor has not validated", () => {
    openRoom();
    addNote("skills", "Chaîne alimentaire");
    expect(() => publishSummary()).toThrow("notes_not_validated");

    validateNotes();
    expect(getSession().notesStatus).toBe("validated");
    publishSummary();
    expect(getSession().notesStatus).toBe("published");
  });

  it("refuses to validate an empty set of notes", () => {
    openRoom();
    expect(() => validateNotes()).toThrow("no_notes");
  });

  it("freezes the notes once the summary is published", () => {
    openRoom();
    addNote("skills", "Pollinisation");
    validateNotes();
    publishSummary();
    expect(() => addNote("to_check", "Une note tardive")).toThrow("notes_published");
  });

  it("scores the exit ticket per student without ranking them", () => {
    openRoom();
    startExitTicket();
    const questions = getSession().exitTicket.questions;
    answerExitTicket(yasmine, questions[0].id, questions[0].correctChoiceId);
    answerExitTicket(yasmine, questions[1].id, "c");

    expect(ticketScore(yasmine)).toEqual({ answered: 2, correct: 1, total: 3 });
    expect(ticketScore(adam)).toEqual({ answered: 0, correct: 0, total: 3 });
  });

  it("refuses answers while the ticket is not open", () => {
    openRoom();
    const question = getSession().exitTicket.questions[0];
    expect(() => answerExitTicket(yasmine, question.id, "a")).toThrow("ticket_not_open");
    startExitTicket();
    closeExitTicket();
    expect(() => answerExitTicket(yasmine, question.id, "a")).toThrow("ticket_not_open");
  });

  it("mutes and stands down a participant the tutor removes", () => {
    openRoom();
    raiseHand(adam, true);
    removeParticipant(adam);
    const removed = getSession().participants.find((item) => item.id === adam)!;
    expect(removed.present).toBe(false);
    expect(removed.handRaised).toBe(false);
    expect(removed.audioState).toBe("muted");
  });

  it("ends the open turn when the tutor takes the floor back", () => {
    openRoom();
    grantTurn(yasmine);
    endTurn();
    expect(currentTurn()).toBeUndefined();
  });

  it("reports an unknown participant or session", () => {
    expect(() => raiseHand("p-inconnu", true)).toThrow("participant_not_found");
    expect(() => getSession("autre-classe")).toThrow("session_not_found");
  });
});
