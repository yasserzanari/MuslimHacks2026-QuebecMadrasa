import type { CourseCategory } from "@/src/domain/course-catalog";

export type EvidenceType = "photo" | "document" | "reflection" | "achievement";
export type Visibility = "private" | "family" | "shared";

export type PortfolioComment = { id: string; author: "parent" | "student"; authorName: string; text: string; createdAt: string };

export type Evidence = {
  id: string;
  childId: string;
  childName: string;
  skill: CourseCategory;
  type: EvidenceType;
  title: string;
  description: string;
  source: string;
  visibility: Visibility;
  createdAt: string;
  comments: PortfolioComment[];
};

const typeIcon: Record<EvidenceType, string> = { photo: "📷", document: "📄", reflection: "💬", achievement: "★" };
export function evidenceIcon(type: EvidenceType) { return typeIcon[type]; }

let sequence = 0;
function nextId() { sequence += 1; return `evidence-${sequence}`; }

const evidence: Evidence[] = [
  { id: nextId(), childId: "adam", childName: "Adam", skill: "Mathematiques", type: "achievement", title: "Additionner des fractions", description: "Adam a réussi tous les exercices de la leçon sur les fractions sans indice.", source: "Cours · Fractions", visibility: "family", createdAt: "2026-09-03T15:20:00.000Z", comments: [
    { id: "c1", author: "parent", authorName: "Amine", text: "Bravo Adam, continue comme ça !", createdAt: "2026-09-03T18:00:00.000Z" },
  ] },
  { id: nextId(), childId: "adam", childName: "Adam", skill: "Coran", type: "reflection", title: "Réflexion après la mémorisation", description: "J’ai trouvé plus facile de répéter par petits segments.", source: "Ajouté par l’élève", visibility: "private", createdAt: "2026-09-05T10:05:00.000Z", comments: [] },
  { id: nextId(), childId: "sara", childName: "Sara", skill: "Sciences", type: "document", title: "Projet écosystèmes", description: "Rapport écrit sur la chaîne alimentaire d’un étang.", source: "Cours · Les écosystèmes", visibility: "shared", createdAt: "2026-09-02T09:00:00.000Z", comments: [
    { id: "c2", author: "parent", authorName: "Amine", text: "Bien documenté, merci Sara.", createdAt: "2026-09-02T20:00:00.000Z" },
  ] },
  { id: nextId(), childId: "sara", childName: "Sara", skill: "Anglais", type: "photo", title: "Présentation orale", description: "Photo prise pendant l’exercice de présentation en anglais.", source: "Ajouté manuellement", visibility: "private", createdAt: "2026-08-30T13:00:00.000Z", comments: [] },
  { id: nextId(), childId: "yasmine", childName: "Yasmine", skill: "Francais", type: "achievement", title: "Première dictée réussie", description: "Yasmine a terminé sa première dictée avec seulement 2 erreurs.", source: "Ajouté manuellement", visibility: "family", createdAt: "2026-09-04T11:00:00.000Z", comments: [] },
];

export function listEvidence(childId?: string) {
  return evidence.filter((item) => !childId || item.childId === childId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getEvidence(id: string) {
  return evidence.find((item) => item.id === id);
}

export function addEvidence(input: { childId: string; childName: string; skill: CourseCategory; type: EvidenceType; title: string; description: string; source?: string; visibility?: Visibility }) {
  const item: Evidence = {
    id: nextId(),
    childId: input.childId,
    childName: input.childName,
    skill: input.skill,
    type: input.type,
    title: input.title.trim(),
    description: input.description.trim(),
    source: input.source ?? "Ajouté manuellement",
    visibility: input.visibility ?? "private",
    createdAt: new Date().toISOString(),
    comments: [],
  };
  evidence.unshift(item);
  return item;
}

export function addComment(evidenceId: string, author: "parent" | "student", authorName: string, text: string) {
  const item = getEvidence(evidenceId);
  if (!item || !text.trim()) return undefined;
  const comment: PortfolioComment = { id: `c-${Date.now()}`, author, authorName, text: text.trim(), createdAt: new Date().toISOString() };
  item.comments.push(comment);
  return item;
}

export function setVisibility(evidenceId: string, visibility: Visibility) {
  const item = getEvidence(evidenceId);
  if (!item) return undefined;
  item.visibility = visibility;
  return item;
}

export function deleteEvidence(id: string) {
  const index = evidence.findIndex((item) => item.id === id);
  if (index === -1) return false;
  evidence.splice(index, 1);
  return true;
}
