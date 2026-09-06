import { localStore } from "./local-store";

export type EvidenceType = "text" | "photo" | "audio" | "document" | "quiz";
export type EvidenceSource = "lesson" | "live_session" | "parent_upload" | "generated";
export type EvidenceVisibility = "private" | "family" | "shared_link";

/** Matches the shared Evidence contract in 07-plan-maitre-pages-et-qa.md. */
export interface Evidence {
  id: string;
  childId: string;
  skillId: string;
  type: EvidenceType;
  source: EvidenceSource;
  visibility: EvidenceVisibility;
  createdAt: string;
  titleFr: string;
  titleEn: string;
  noteFr: string;
  noteEn: string;
  comments: EvidenceComment[];
}

export interface EvidenceComment {
  id: string;
  author: "parent" | "child" | "tutor";
  text: string;
  createdAt: string;
}

export interface Skill {
  id: string;
  subjectFr: string;
  subjectEn: string;
  labelFr: string;
  labelEn: string;
}

export const skills: Skill[] = [
  { id: "math-fractions", subjectFr: "Mathématiques", subjectEn: "Mathematics", labelFr: "Comparer et additionner des fractions", labelEn: "Compare and add fractions" },
  { id: "fr-lecture", subjectFr: "Français", subjectEn: "French", labelFr: "Dégager l’idée principale d’un texte", labelEn: "Identify the main idea of a text" },
  { id: "sci-ecosystemes", subjectFr: "Sciences", subjectEn: "Science", labelFr: "Expliquer l’équilibre d’un écosystème", labelEn: "Explain the balance of an ecosystem" },
  { id: "ar-lettres", subjectFr: "Arabe", subjectEn: "Arabic", labelFr: "Reconnaître et tracer les lettres", labelEn: "Recognise and write the letters" },
  { id: "en-oral", subjectFr: "Anglais", subjectEn: "English", labelFr: "Participer à une conversation guidée", labelEn: "Take part in a guided conversation" },
];

export const evidenceTypeLabels: Record<EvidenceType, { fr: string; en: string }> = {
  text: { fr: "Texte", en: "Text" },
  photo: { fr: "Photo", en: "Photo" },
  audio: { fr: "Audio", en: "Audio" },
  document: { fr: "Document", en: "Document" },
  quiz: { fr: "Quiz", en: "Quiz" },
};

export const evidenceSourceLabels: Record<EvidenceSource, { fr: string; en: string }> = {
  lesson: { fr: "Leçon", en: "Lesson" },
  live_session: { fr: "Classe collaborative", en: "Collaborative class" },
  parent_upload: { fr: "Ajout du parent", en: "Parent upload" },
  generated: { fr: "Contenu approuvé", en: "Approved content" },
};

export const visibilityLabels: Record<EvidenceVisibility, { fr: string; en: string; helpFr: string; helpEn: string }> = {
  private: { fr: "Privé", en: "Private", helpFr: "Visible par le parent seulement.", helpEn: "Visible to the parent only." },
  family: { fr: "Famille", en: "Family", helpFr: "Visible par le parent et l’enfant.", helpEn: "Visible to the parent and the child." },
  shared_link: { fr: "Lien de partage", en: "Shared link", helpFr: "Accessible avec un lien révocable, sans nom de famille.", helpEn: "Reachable with a revocable link, without the family name." },
};

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

function seed(): Evidence[] {
  return [
    { id: "ev-1", childId: "adam", skillId: "math-fractions", type: "quiz", source: "lesson", visibility: "family", createdAt: isoMinutesAgo(120), titleFr: "Exercice de fractions terminé", titleEn: "Fractions exercise completed", noteFr: "3 bonnes réponses sur 4, deux indices utilisés.", noteEn: "3 correct answers out of 4, two hints used.", comments: [{ id: "c-1", author: "parent", text: "Bien expliqué à l’oral après coup.", createdAt: isoMinutesAgo(100) }] },
    { id: "ev-2", childId: "adam", skillId: "ar-lettres", type: "audio", source: "lesson", visibility: "private", createdAt: isoMinutesAgo(1500), titleFr: "Récitation des lettres", titleEn: "Letter recitation", noteFr: "Prononciation claire, rythme régulier.", noteEn: "Clear pronunciation, steady pace.", comments: [] },
    { id: "ev-3", childId: "sara", skillId: "sci-ecosystemes", type: "photo", source: "live_session", visibility: "family", createdAt: isoMinutesAgo(2600), titleFr: "Schéma de la chaîne alimentaire", titleEn: "Food chain diagram", noteFr: "Produit pendant la classe collaborative de sciences.", noteEn: "Produced during the collaborative science class.", comments: [{ id: "c-2", author: "tutor", text: "A bien relié les abeilles à la pollinisation.", createdAt: isoMinutesAgo(2500) }] },
    { id: "ev-4", childId: "sara", skillId: "fr-lecture", type: "text", source: "parent_upload", visibility: "shared_link", createdAt: isoMinutesAgo(4300), titleFr: "Fiche de lecture", titleEn: "Reading sheet", noteFr: "Résumé rédigé sans aide.", noteEn: "Summary written unaided.", comments: [] },
  ];
}

const store = localStore("portfolio", () => ({ evidence: seed(), sequence: 0, accessLog: [] as AccessLogEntry[] }));

function read(): Evidence[] { return store.get().evidence; }
function write(evidence: Evidence[]): void { store.set({ ...store.get(), evidence }); }
function nextSequence(): number {
  const current = store.get();
  store.set({ ...current, sequence: current.sequence + 1 });
  return current.sequence + 1;
}

/** Access log required by 04-securite-et-donnees.md: every read or write on evidence is recorded. */
export type AccessLogEntry = { id: string; at: string; actor: string; action: string; evidenceId?: string };

function log(action: string, actor = "demo-parent", evidenceId?: string) {
  const current = store.get();
  const entry: AccessLogEntry = { id: `log-${Date.now()}-${current.accessLog.length}`, at: new Date().toISOString(), actor, action, evidenceId };
  store.set({ ...current, accessLog: [entry, ...current.accessLog].slice(0, 50) });
}

export function listEvidence(childId?: string): Evidence[] {
  log(childId ? `read_portfolio:${childId}` : "read_portfolio");
  const rows = childId ? read().filter((item) => item.childId === childId) : read();
  return [...rows].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function listAccessLog(): AccessLogEntry[] {
  return store.get().accessLog;
}

export function addEvidence(input: { childId: string; skillId: string; type: EvidenceType; titleFr: string; titleEn?: string; noteFr?: string; noteEn?: string; visibility?: EvidenceVisibility }): Evidence {
  if (!input.titleFr.trim()) throw new Error("title_required");
  if (!skills.some((skill) => skill.id === input.skillId)) throw new Error("unknown_skill");
  const sequence = nextSequence();
  const item: Evidence = {
    id: `ev-${Date.now()}-${sequence}`,
    childId: input.childId,
    skillId: input.skillId,
    type: input.type,
    source: "parent_upload",
    visibility: input.visibility ?? "family",
    createdAt: new Date().toISOString(),
    titleFr: input.titleFr.trim(),
    titleEn: (input.titleEn ?? input.titleFr).trim(),
    noteFr: input.noteFr?.trim() ?? "",
    noteEn: (input.noteEn ?? input.noteFr ?? "").trim(),
    comments: [],
  };
  write([item, ...read()]);
  log("add_evidence", "demo-parent", item.id);
  return item;
}

export function commentEvidence(evidenceId: string, text: string, author: EvidenceComment["author"] = "parent"): Evidence {
  if (!text.trim()) throw new Error("comment_required");
  const target = read().find((item) => item.id === evidenceId);
  if (!target) throw new Error("evidence_not_found");
  const comment: EvidenceComment = { id: `c-${Date.now()}`, author, text: text.trim(), createdAt: new Date().toISOString() };
  const updated = { ...target, comments: [...target.comments, comment] };
  write(read().map((item) => (item.id === evidenceId ? updated : item)));
  log("comment_evidence", "demo-parent", evidenceId);
  return updated;
}

export function setVisibility(evidenceId: string, visibility: EvidenceVisibility): Evidence {
  const target = read().find((item) => item.id === evidenceId);
  if (!target) throw new Error("evidence_not_found");
  const updated = { ...target, visibility };
  write(read().map((item) => (item.id === evidenceId ? updated : item)));
  log(`set_visibility:${visibility}`, "demo-parent", evidenceId);
  return updated;
}

export function removeEvidence(evidenceId: string): void {
  if (!read().some((item) => item.id === evidenceId)) throw new Error("evidence_not_found");
  write(read().filter((item) => item.id !== evidenceId));
  log("delete_evidence", "demo-parent", evidenceId);
}

export type SkillProgress = { skill: Skill; count: number; lastAt?: string };

export function skillProgress(childId: string): SkillProgress[] {
  return skills.map((skill) => {
    const rows = read().filter((item) => item.childId === childId && item.skillId === skill.id);
    return { skill, count: rows.length, lastAt: rows.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0]?.createdAt };
  });
}

/** Test seam. */
export function resetPortfolio(): void {
  store.reset();
}
