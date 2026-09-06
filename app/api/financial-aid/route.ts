import { NextResponse } from "next/server";
import { financialAidPrograms, localizeProgram, matchFinancialAid, type FamilyProfile } from "@/src/domain/financial-aid";

const disclaimers = {
  fr: "Information générale, non personnalisée et non juridique ou fiscale. Vérifiez toujours l’admissibilité et les dates auprès du programme officiel.",
  en: "General information, not personalised and neither legal nor tax advice. Always confirm eligibility and dates with the official programme.",
};

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") === "en" ? "en" : "fr";
  return NextResponse.json({
    updatedAt: "2026-09-05",
    disclaimer: disclaimers[locale],
    programs: financialAidPrograms.map((program) => localizeProgram(program, locale)),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as FamilyProfile & { locale?: string };
    const locale = body.locale === "en" ? "en" : "fr";
    if (!body || body.province !== "QC" || !Array.isArray(body.children)) {
      return NextResponse.json({ error: locale === "en" ? "Incomplete profile." : "Profil incomplet." }, { status: 400 });
    }
    return NextResponse.json({ updatedAt: "2026-09-05", results: matchFinancialAid(body, locale) });
  } catch {
    return NextResponse.json({ error: "Profil invalide." }, { status: 400 });
  }
}
