import { communities, getCommunity } from "@/src/domain/communities";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = params.get("id");
  if (id) {
    const community = getCommunity(id);
    return community ? Response.json({ community, mode: "local" }) : Response.json({ error: "Communauté introuvable" }, { status: 404 });
  }
  const query = params.get("q")?.toLowerCase().trim();
  const result = query ? communities.filter((community) => `${community.title} ${community.neighborhood} ${community.languages} ${community.activities.join(" ")}`.toLowerCase().includes(query)) : communities;
  return Response.json({ communities: result, total: result.length, mode: "local" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body.action === "join") {
    const community = getCommunity(body.communityId);
    if (!community) return Response.json({ error: "Communauté introuvable" }, { status: 404 });
    if (community.availableSpots < 1) return Response.json({ error: "Ce groupe est complet" }, { status: 409 });
    return Response.json({ ok: true, action: "join_request_created", communityId: community.id, parentId: body.parentId ?? "demo-parent", childId: body.childId ?? "adam", status: "pending_review", message: "Votre demande a été envoyée. Le responsable du groupe doit vérifier le profil avant de partager le lieu exact." }, { status: 201 });
  }
  if (body.action === "leave") return Response.json({ ok: true, action: "membership_cancelled", communityId: body.communityId, status: "left" });
  if (body.action === "create") return Response.json({ ok: true, action: "group_submitted", status: "pending_review", message: "Votre groupe EXTRA sera vérifié avant publication." }, { status: 201 });
  return Response.json({ error: "Action inconnue" }, { status: 400 });
}
