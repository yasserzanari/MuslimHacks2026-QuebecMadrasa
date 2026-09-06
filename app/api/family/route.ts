import { AGE_BANDS, currentSchoolYear, defaultPermissions, type AgeBand, type Jurisdiction, type Locale } from "@/src/domain/family";

type CreateFamilyBody = {
  name?: string;
  locale?: Locale;
  jurisdiction?: Jurisdiction;
  children?: { displayName?: string; ageBand?: AgeBand }[];
};

function levelForAgeBand(ageBand?: AgeBand) {
  return (AGE_BANDS.find((band) => band.id === ageBand) ?? AGE_BANDS[0]).level;
}

export async function POST(request: Request) {
  const body: CreateFamilyBody = await request.json().catch(() => ({}));
  if (!body.name || !body.name.trim()) return Response.json({ error: "Family name is required" }, { status: 400 });
  if (!body.children || body.children.length === 0) return Response.json({ error: "At least one child is required" }, { status: 400 });

  const familyId = `family-${Date.now()}`;
  const family = { id: familyId, name: body.name.trim(), locale: body.locale ?? "fr", jurisdiction: body.jurisdiction ?? "quebec", schoolYear: currentSchoolYear() };
  const children = body.children.map((child, index) => ({
    id: `${familyId}-child-${index}`,
    familyId,
    displayName: (child.displayName ?? "").trim(),
    ageBand: child.ageBand ?? "6-8",
    level: levelForAgeBand(child.ageBand),
    permissions: defaultPermissions(),
  }));

  return Response.json({ ok: true, action: "family_created", family, children }, { status: 201 });
}
