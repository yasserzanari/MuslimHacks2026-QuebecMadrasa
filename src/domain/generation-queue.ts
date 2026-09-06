import {
  createGenerationJob,
  transitionJob,
  type GenerationJob,
  type GenerationJobStatus,
  type GenerationJobType,
} from "./ai-generation-job";

export type Locale = "fr" | "en";

export type DraftBlock = { type: string; title: string; prompt: string };

export type GenerationDraft = {
  title: string;
  subject: string;
  objective: string;
  instructions: string;
  blocks: DraftBlock[];
  sources: string[];
  warnings: string[];
  modelVersion: string;
  requiresParentReview: boolean;
};

export type QueuedJob = GenerationJob & {
  subject: string;
  locale: Locale;
  draft?: GenerationDraft;
  addedToPlan?: boolean;
};

/** A learning snapshot or a piece of evidence the parent can attach to a request. */
export type ContextSource = {
  id: string;
  kind: "snapshot" | "evidence" | "requirement";
  childId: string;
  labelFr: string;
  labelEn: string;
  detailFr: string;
  detailEn: string;
};

export const contextSources: ContextSource[] = [
  { id: "snap-adam-week", kind: "snapshot", childId: "adam", labelFr: "Instantané · Adam, semaine du 7 sept.", labelEn: "Snapshot · Adam, week of Sept. 7", detailFr: "4 séances terminées, fractions à revoir.", detailEn: "4 sessions completed, fractions to review." },
  { id: "snap-sara-week", kind: "snapshot", childId: "sara", labelFr: "Instantané · Sara, semaine du 7 sept.", labelEn: "Snapshot · Sara, week of Sept. 7", detailFr: "Projet de sciences en cours, lecture régulière.", detailEn: "Science project under way, steady reading." },
  { id: "ev-adam-fractions", kind: "evidence", childId: "adam", labelFr: "Preuve · Exercice de fractions", labelEn: "Evidence · Fractions exercise", detailFr: "Tentative du 5 septembre, 2 indices utilisés.", detailEn: "Attempt from September 5, 2 hints used." },
  { id: "ev-sara-lecture", kind: "evidence", childId: "sara", labelFr: "Preuve · Fiche de lecture", labelEn: "Evidence · Reading sheet", detailFr: "Résumé rédigé sans aide le 3 septembre.", detailEn: "Summary written unaided on September 3." },
  { id: "req-projet", kind: "requirement", childId: "adam", labelFr: "Exigence · Projet d’apprentissage", labelEn: "Requirement · Learning project", detailFr: "À transmettre avant le 30 septembre.", detailEn: "To be submitted before September 30." },
];

export const jobTypeLabels: Record<GenerationJobType, { fr: string; en: string }> = {
  lesson: { fr: "Leçon", en: "Lesson" },
  exercises: { fr: "Exercices", en: "Exercises" },
  weekly_report: { fr: "Rapport hebdomadaire", en: "Weekly report" },
  explanation: { fr: "Explication", en: "Explanation" },
};

export const jobStatusLabels: Record<GenerationJobStatus, { fr: string; en: string }> = {
  queued: { fr: "En file", en: "Queued" },
  running: { fr: "En cours", en: "Running" },
  review_required: { fr: "À valider", en: "Needs review" },
  approved: { fr: "Approuvé", en: "Approved" },
  rejected: { fr: "Rejeté", en: "Rejected" },
  failed: { fr: "Échec", en: "Failed" },
  cancelled: { fr: "Annulé", en: "Cancelled" },
};

export function buildDraft(input: {
  type: GenerationJobType;
  subject: string;
  objective: string;
  locale: Locale;
  sources: string[];
}): GenerationDraft {
  const { subject, objective, locale, sources } = input;
  const en = locale === "en";
  const blocks: DraftBlock[] = input.type === "weekly_report"
    ? [
        { type: "summary", title: en ? "What was covered" : "Ce qui a été travaillé", prompt: objective },
        { type: "progress", title: en ? "Observable progress" : "Progrès observables", prompt: en ? "Facts drawn from completed activities only." : "Faits tirés uniquement des activités terminées." },
        { type: "next", title: en ? "Next step" : "Prochaine étape", prompt: en ? "One activity to propose next week." : "Une activité à proposer la semaine prochaine." },
      ]
    : [
        { type: "warmup", title: en ? "Warm-up" : "Mise en route", prompt: en ? `What do you already know about ${subject.toLowerCase()}?` : `Que sais-tu déjà sur ${subject.toLowerCase()} ?` },
        { type: "guided-practice", title: en ? "Guided practice" : "Pratique guidée", prompt: objective },
        { type: "reflection", title: en ? "Reflection" : "Réflexion", prompt: en ? "What would you try differently next time?" : "Que ferais-tu autrement la prochaine fois ?" },
      ];

  return {
    title: en ? `${jobTypeLabels[input.type].en} · ${subject}` : `${jobTypeLabels[input.type].fr} · ${subject}`,
    subject,
    objective,
    instructions: en ? "Try each step and explain your reasoning." : "Essaie chaque étape et explique ton raisonnement.",
    blocks,
    sources,
    warnings: [
      en ? "Draft generated locally; no external provider was called." : "Brouillon généré localement; aucun fournisseur externe n’a été appelé.",
      en ? "Check the objective against the course before adding it to the plan." : "Vérifiez l’objectif avec le cours avant de l’ajouter au plan.",
    ],
    modelVersion: "mock-generator-0.1",
    requiresParentReview: true,
  };
}

const runningAfterMs = 1200;
const reviewAfterMs = 3400;

function seed(): QueuedJob[] {
  /* Relative to now so freshly created jobs always sort above the demo history. */
  const base = Date.now() - 45 * 60000;
  const minutes = (value: number) => new Date(base + value * 60000).toISOString();
  return [
    {
      ...createGenerationJob({ id: "job-seed-1", requestId: "req-seed-1", parentId: "demo-parent", childId: "adam", type: "lesson", requestText: "Créer une leçon de fractions avec un exercice de transfert", creditsReserved: 1, sourceSnapshotIds: ["snap-adam-week", "ev-adam-fractions"], now: minutes(0) }),
      status: "review_required",
      startedAt: minutes(1),
      subject: "Mathématiques",
      locale: "fr",
      draft: buildDraft({ type: "lesson", subject: "Mathématiques", objective: "Additionner deux fractions avec le même dénominateur.", locale: "fr", sources: ["snap-adam-week", "ev-adam-fractions"] }),
    },
    {
      ...createGenerationJob({ id: "job-seed-2", requestId: "req-seed-2", parentId: "demo-parent", childId: "sara", type: "weekly_report", requestText: "Résumer la semaine de Sara pour le portfolio", creditsReserved: 1, sourceSnapshotIds: ["snap-sara-week"], now: minutes(5) }),
      status: "review_required",
      startedAt: minutes(6),
      subject: "Sciences",
      locale: "fr",
      draft: buildDraft({ type: "weekly_report", subject: "Sciences", objective: "Décrire le projet de sciences et la prochaine étape.", locale: "fr", sources: ["snap-sara-week"] }),
    },
    {
      ...createGenerationJob({ id: "job-seed-3", requestId: "req-seed-3", parentId: "demo-parent", childId: "adam", type: "exercises", requestText: "Trois exercices de révision en lecture", creditsReserved: 1, sourceSnapshotIds: ["ev-sara-lecture"], now: minutes(9) }),
      status: "approved",
      startedAt: minutes(10),
      completedAt: minutes(12),
      approvedBy: "demo-parent",
      subject: "Français",
      locale: "fr",
      addedToPlan: true,
      draft: buildDraft({ type: "exercises", subject: "Français", objective: "Trouver l’idée principale et la justifier avec le texte.", locale: "fr", sources: ["ev-sara-lecture"] }),
    },
  ];
}

let jobs: QueuedJob[] = seed();
let sequence = 0;

export const creditsPerJob = 1;
export const monthlyCredits = 20;

/** Mock worker: moves jobs forward on read so the queue is visibly alive without a real background process. */
export function advanceQueue(now = Date.now()): void {
  jobs = jobs.map((job) => {
    const age = now - Date.parse(job.createdAt);
    if (job.status === "queued" && age > runningAfterMs) {
      return { ...transitionJob(job, "running", new Date(now).toISOString()), subject: job.subject, locale: job.locale, draft: job.draft, addedToPlan: job.addedToPlan };
    }
    if (job.status === "running" && age > reviewAfterMs) {
      const advanced = transitionJob(job, "review_required", new Date(now).toISOString());
      return { ...advanced, subject: job.subject, locale: job.locale, addedToPlan: job.addedToPlan, draft: job.draft ?? buildDraft({ type: job.type, subject: job.subject, objective: job.requestText, locale: job.locale, sources: job.sourceSnapshotIds }) };
    }
    return job;
  });
}

export function listJobs(): QueuedJob[] {
  advanceQueue();
  return [...jobs].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function creditsUsed(): number {
  return jobs.filter((job) => job.status !== "cancelled" && job.status !== "failed").reduce((total, job) => total + job.creditsReserved, 0);
}

export function enqueueJob(input: {
  type: GenerationJobType;
  requestText: string;
  subject: string;
  objective?: string;
  childId?: string;
  parentId?: string;
  locale?: Locale;
  sourceSnapshotIds?: string[];
}): QueuedJob {
  const locale: Locale = input.locale === "en" ? "en" : "fr";
  if (creditsUsed() + creditsPerJob > monthlyCredits) {
    throw new Error("credit_limit_reached");
  }
  sequence += 1;
  const job: QueuedJob = {
    ...createGenerationJob({
      id: `job-${Date.now()}-${sequence}`,
      requestId: `req-${Date.now()}-${sequence}`,
      parentId: input.parentId ?? "demo-parent",
      childId: input.childId ?? "adam",
      type: input.type,
      requestText: input.requestText,
      creditsReserved: creditsPerJob,
      sourceSnapshotIds: input.sourceSnapshotIds ?? [],
    }),
    subject: input.subject,
    locale,
  };
  jobs = [job, ...jobs];
  return job;
}

export type QueueAction = "cancel" | "approve" | "reject" | "retry" | "add_to_plan";

export function applyAction(jobId: string, action: QueueAction): QueuedJob {
  const current = jobs.find((job) => job.id === jobId);
  if (!current) throw new Error("job_not_found");

  if (action === "add_to_plan") {
    if (current.status !== "approved") throw new Error("job_not_approved");
    const updated = { ...current, addedToPlan: true };
    jobs = jobs.map((job) => (job.id === jobId ? updated : job));
    return updated;
  }

  if (action === "retry") {
    if (current.status !== "failed" && current.status !== "rejected") throw new Error("job_not_retryable");
    sequence += 1;
    const retried: QueuedJob = {
      ...current,
      id: `job-${Date.now()}-${sequence}`,
      requestId: `req-${Date.now()}-${sequence}`,
      status: "queued",
      attemptCount: current.attemptCount + 1,
      createdAt: new Date().toISOString(),
      startedAt: undefined,
      completedAt: undefined,
      approvedBy: undefined,
      draft: undefined,
      addedToPlan: false,
    };
    jobs = [retried, ...jobs];
    return retried;
  }

  const nextStatus: GenerationJobStatus = action === "cancel" ? "cancelled" : action === "approve" ? "approved" : "rejected";
  const updated: QueuedJob = {
    ...transitionJob(current, nextStatus),
    subject: current.subject,
    locale: current.locale,
    draft: current.draft,
    addedToPlan: current.addedToPlan,
    approvedBy: nextStatus === "approved" ? current.parentId : current.approvedBy,
  };
  jobs = jobs.map((job) => (job.id === jobId ? updated : job));
  return updated;
}

/** Test seam: restore the demo queue. */
export function resetQueue(): void {
  jobs = seed();
  sequence = 0;
}
