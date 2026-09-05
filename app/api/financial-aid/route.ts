import { NextResponse } from "next/server";
import { financialAidPrograms, matchFinancialAid, type FamilyProfile } from "@/src/domain/financial-aid";

export async function GET() {
  return NextResponse.json({ updatedAt: "2026-09-05", disclaimer: "Information générale, non personnalisée et non juridique ou fiscale. Vérifiez toujours l’admissibilité et les dates auprès du programme officiel.", programs: financialAidPrograms });
}

export async function POST(request: Request) {
  try {
    const profile = (await request.json()) as FamilyProfile;
    if (!profile || profile.province !== "QC" || !Array.isArray(profile.children)) return NextResponse.json({ error: "Profil incomplet." }, { status: 400 });
    return NextResponse.json({ updatedAt: "2026-09-05", results: matchFinancialAid(profile) });
  } catch {
    return NextResponse.json({ error: "Profil invalide." }, { status: 400 });
  }
}
