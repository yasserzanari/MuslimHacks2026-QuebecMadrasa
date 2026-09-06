export type Locale = "fr" | "en";

export type Jurisdiction = "quebec" | "other";

export type AgeBand = "6-8" | "9-11" | "12-14" | "15-17";

export type Level = "primaire" | "secondaire";

export type ChildPermissions = {
  aiTutor: boolean;
  communityPods: boolean;
  portfolioSharing: boolean;
};

export type Family = {
  id: string;
  name: string;
  locale: Locale;
  jurisdiction: Jurisdiction;
  schoolYear: string;
};

export type Child = {
  id: string;
  familyId: string;
  displayName: string;
  ageBand: AgeBand;
  level: Level;
  permissions: ChildPermissions;
};

export const AGE_BANDS: { id: AgeBand; labelFr: string; labelEn: string; levelFr: string; levelEn: string; level: Level }[] = [
  { id: "6-8", labelFr: "6 à 8 ans", labelEn: "6 to 8 years old", levelFr: "Primaire · 1er cycle", levelEn: "Elementary · early cycle", level: "primaire" },
  { id: "9-11", labelFr: "9 à 11 ans", labelEn: "9 to 11 years old", levelFr: "Primaire · 2e-3e cycle", levelEn: "Elementary · upper cycle", level: "primaire" },
  { id: "12-14", labelFr: "12 à 14 ans", labelEn: "12 to 14 years old", levelFr: "Secondaire · 1er cycle", levelEn: "Secondary · early cycle", level: "secondaire" },
  { id: "15-17", labelFr: "15 à 17 ans", labelEn: "15 to 17 years old", levelFr: "Secondaire · 2e cycle", levelEn: "Secondary · upper cycle", level: "secondaire" },
];

export function currentSchoolYear(today = new Date()): string {
  const year = today.getUTCFullYear();
  const startsNewYear = today.getUTCMonth() >= 6;
  const start = startsNewYear ? year : year - 1;
  return `${start}-${start + 1}`;
}

export function defaultPermissions(): ChildPermissions {
  return { aiTutor: true, communityPods: false, portfolioSharing: false };
}
