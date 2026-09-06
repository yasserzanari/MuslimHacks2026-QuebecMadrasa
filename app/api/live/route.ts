import * as live from "@/src/domain/live-session";
import type { NoteSection } from "@/src/domain/live-session";

const sections: NoteSection[] = ["said", "skills", "to_check", "next_activity"];

function fail(error: string) {
  const status = error.endsWith("not_found") ? 404 : error === "invalid_action" ? 400 : 409;
  return Response.json({ error }, { status });
}

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get("sessionId") ?? "ecosystemes";
  try {
    return Response.json({ session: live.getSession(sessionId), currentTurn: live.currentTurn() ?? null });
  } catch {
    return fail("session_not_found");
  }
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { action, participantId, text, section, noteId, questionId, choiceId, value } = body;
  try {
    let session: live.LiveSession;
    switch (action) {
      case "open_room": session = live.openRoom(); break;
      case "raise_hand": session = live.raiseHand(participantId, Boolean(value)); break;
      case "grant_turn": session = live.grantTurn(participantId); break;
      case "end_turn": session = live.endTurn(); break;
      case "share_idea": session = live.shareIdea(participantId, text ?? ""); break;
      case "set_audio": session = live.setAudio(participantId, value === "speaking" ? "speaking" : value === "muted" ? "muted" : "listening"); break;
      case "set_camera": session = live.setCamera(participantId, Boolean(value)); break;
      case "remove_participant": session = live.removeParticipant(participantId); break;
      case "add_note":
        if (!sections.includes(section)) return fail("invalid_action");
        session = live.addNote(section, text ?? "");
        break;
      case "edit_note": session = live.editNote(noteId, text ?? ""); break;
      case "remove_note": session = live.removeNote(noteId); break;
      case "ai_relaunch": session = live.aiAction("relaunch"); break;
      case "ai_summarize": session = live.aiAction("summarize"); break;
      case "ai_challenge": session = live.aiAction("challenge"); break;
      case "validate_notes": session = live.validateNotes(); break;
      case "publish_summary": session = live.publishSummary(); break;
      case "start_ticket": session = live.startExitTicket(); break;
      case "answer_ticket": session = live.answerExitTicket(participantId, questionId, choiceId); break;
      case "close_ticket": session = live.closeExitTicket(); break;
      case "end_session": session = live.endSession(); break;
      case "reset": live.resetSession(); session = live.getSession(); break;
      default: return fail("invalid_action");
    }
    return Response.json({ session, currentTurn: live.currentTurn() ?? null });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "live_error");
  }
}
