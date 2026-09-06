import { detectParentAssistantIntent, mockParentAssistantResponse } from "@/src/domain/parent-ai-mocks";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return Response.json({ error: "Message required" }, { status: 400 });
  const childName = typeof body.childName === "string" && body.childName ? body.childName : "votre enfant";
  const intent = detectParentAssistantIntent(message);
  return Response.json({ intent, response: mockParentAssistantResponse(intent, childName), mode: "mock", requiresParentReview: true });
}


