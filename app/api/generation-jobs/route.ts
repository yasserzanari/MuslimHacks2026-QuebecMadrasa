import { createGenerationJob } from "@/src/domain/ai-generation-job";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = body.locale === "en" ? "en" : "fr";
  const subject = body.subject ?? "Mathématiques";
  const objective = body.objective ?? (locale === "en" ? "Practice the week’s objective" : "Réviser l’objectif de la semaine");
  const job = createGenerationJob({
    id: crypto.randomUUID(),
    requestId: body.requestId ?? crypto.randomUUID(),
    parentId: body.parentId ?? "demo-parent",
    childId: body.childId ?? "demo-child",
    type: body.type ?? "lesson",
    requestText: body.requestText ?? "Créer une activité de révision",
    creditsReserved: 1,
  });
  const draft = {
    title: locale === "en" ? `Practice · ${subject}` : `Révision · ${subject}`,
    subject,
    objective,
    instructions: locale === "en" ? "Try each step and explain your reasoning." : "Essaie chaque étape et explique ton raisonnement.",
    blocks: [
      { type: "warmup", title: locale === "en" ? "Warm-up" : "Mise en route", prompt: locale === "en" ? `What do you already know about ${subject.toLowerCase()}?` : `Que sais-tu déjà sur ${subject.toLowerCase()} ?` },
      { type: "guided-practice", title: locale === "en" ? "Guided practice" : "Pratique guidée", prompt: objective },
      { type: "reflection", title: locale === "en" ? "Reflection" : "Réflexion", prompt: locale === "en" ? "What would you try differently next time?" : "Que ferais-tu autrement la prochaine fois ?" },
    ],
    requiresParentReview: true,
  };
  return Response.json({ ...job, draft }, { status: 201 });
}
