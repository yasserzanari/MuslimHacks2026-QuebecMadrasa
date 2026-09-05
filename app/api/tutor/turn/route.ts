import { z } from "zod";

import { LOCALES } from "@/src/i18n/locale";
import { resolveStudentSession } from "@/src/server/session";
import { runTutorTurn } from "@/src/server/tutor-agent";
import { errorResponse, jsonError, readJson } from "@/src/server/http";

/**
 * One turn of the student tutor.
 *
 * The browser sends what the student wrote or said and which help button they pressed.
 * It does not send a help level, a prompt or a model name: those are decided here, so a
 * student cannot unlock the solution by editing a request.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const turnSchema = z.object({
  lessonId: z.string().trim().min(1),
  questionId: z.string().trim().min(1),
  message: z.string().max(1000).default(""),
  interactionMode: z.enum(["text", "voice"]).default("text"),
  requestedHelp: z.enum(["hint", "question", "explain_differently"]).optional(),
  locale: z.enum(LOCALES),
});

export async function POST(request: Request) {
  try {
    const session = resolveStudentSession(request);
    const parsed = turnSchema.safeParse(await readJson(request));
    if (!parsed.success) return jsonError("invalid_request", 422);

    const result = await runTutorTurn({
      studentId: session.studentId,
      lessonId: parsed.data.lessonId,
      questionId: parsed.data.questionId,
      message: parsed.data.message,
      interactionMode: parsed.data.interactionMode,
      requestedHelp: parsed.data.requestedHelp,
      locale: parsed.data.locale,
    });

    return Response.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
