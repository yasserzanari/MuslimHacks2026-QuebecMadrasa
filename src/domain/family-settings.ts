import { localStore } from "./local-store";

export type PermissionKey = "microphone" | "camera" | "live_classes" | "ai_tutor" | "portfolio_sharing" | "community_profile";

export interface ChildPermissions {
  childId: string;
  displayName: string;
  ageBand: "under_13" | "13_plus";
  permissions: Record<PermissionKey, boolean>;
  screenLimitMinutes: number;
}

export interface ConsentRecord {
  id: string;
  labelFr: string;
  labelEn: string;
  detailFr: string;
  detailEn: string;
  granted: boolean;
  updatedAt: string;
  required: boolean;
}

export interface FamilySettings {
  locale: "fr" | "en";
  children: ChildPermissions[];
  consents: ConsentRecord[];
  retentionDays: number;
  transcriptsEnabled: boolean;
}

export const permissionLabels: Record<PermissionKey, { fr: string; en: string; helpFr: string; helpEn: string }> = {
  microphone: { fr: "Microphone", en: "Microphone", helpFr: "Nécessaire pour parler au tuteur. Désactivé par défaut.", helpEn: "Needed to speak to the tutor. Off by default." },
  camera: { fr: "Caméra", en: "Camera", helpFr: "Jamais requise pour participer à une classe.", helpEn: "Never required to take part in a class." },
  live_classes: { fr: "Classes collaboratives", en: "Collaborative classes", helpFr: "Autorise l’entrée dans une salle encadrée par un adulte.", helpEn: "Allows entry into a room hosted by an adult." },
  ai_tutor: { fr: "Tuteur IA", en: "AI tutor", helpFr: "Aide au raisonnement pendant les leçons.", helpEn: "Reasoning help during lessons." },
  portfolio_sharing: { fr: "Partage du portfolio", en: "Portfolio sharing", helpFr: "Autorise les liens de partage révocables.", helpEn: "Allows revocable share links." },
  community_profile: { fr: "Profil communauté", en: "Community profile", helpFr: "Prénom ou pseudonyme seulement, jamais d’adresse.", helpEn: "First name or pseudonym only, never an address." },
};

export const retentionOptions = [30, 90, 180, 365];

function nowIso() { return new Date().toISOString(); }

function seed(): FamilySettings {
  return {
    locale: "fr",
    children: [
      { childId: "adam", displayName: "Adam", ageBand: "under_13", permissions: { microphone: true, camera: false, live_classes: true, ai_tutor: true, portfolio_sharing: false, community_profile: true }, screenLimitMinutes: 60 },
      { childId: "sara", displayName: "Sara", ageBand: "13_plus", permissions: { microphone: true, camera: false, live_classes: true, ai_tutor: true, portfolio_sharing: true, community_profile: true }, screenLimitMinutes: 90 },
    ],
    consents: [
      { id: "consent-ai", labelFr: "Utilisation du tuteur IA", labelEn: "Use of the AI tutor", detailFr: "Le tuteur reçoit l’objectif de la leçon et la tentative de l’enfant, rien d’autre.", detailEn: "The tutor receives the lesson goal and the child’s attempt, nothing else.", granted: true, updatedAt: nowIso(), required: true },
      { id: "consent-live", labelFr: "Participation aux classes collaboratives", labelEn: "Taking part in collaborative classes", detailFr: "Prénom affiché, aucun enregistrement par défaut.", detailEn: "First name shown, no recording by default.", granted: true, updatedAt: nowIso(), required: false },
      { id: "consent-transcripts", labelFr: "Conservation des transcriptions", labelEn: "Keeping transcripts", detailFr: "Les transcriptions de classe restent supprimables à tout moment.", detailEn: "Class transcripts remain deletable at any time.", granted: false, updatedAt: nowIso(), required: false },
      { id: "consent-research", labelFr: "Amélioration du service", labelEn: "Service improvement", detailFr: "Aucune donnée d’enfant n’est utilisée pour entraîner un modèle.", detailEn: "No child data is used to train a model.", granted: false, updatedAt: nowIso(), required: false },
    ],
    retentionDays: 90,
    transcriptsEnabled: false,
  };
}

const store = localStore("family-settings", seed);

export function getSettings(): FamilySettings {
  return store.get();
}

function save(next: FamilySettings): FamilySettings {
  store.set(next);
  return next;
}

export function setPermission(childId: string, key: PermissionKey, value: boolean): FamilySettings {
  if (!(key in permissionLabels)) throw new Error("unknown_permission");
  const settings = store.get();
  if (!settings.children.some((item) => item.childId === childId)) throw new Error("child_not_found");
  return save({
    ...settings,
    children: settings.children.map((item) => (item.childId === childId ? { ...item, permissions: { ...item.permissions, [key]: value } } : item)),
  });
}

export function setScreenLimit(childId: string, minutes: number): FamilySettings {
  if (!Number.isFinite(minutes) || minutes < 15 || minutes > 240) throw new Error("invalid_limit");
  const settings = store.get();
  if (!settings.children.some((item) => item.childId === childId)) throw new Error("child_not_found");
  return save({
    ...settings,
    children: settings.children.map((item) => (item.childId === childId ? { ...item, screenLimitMinutes: Math.round(minutes) } : item)),
  });
}

export function setConsent(consentId: string, granted: boolean): FamilySettings {
  const settings = store.get();
  const consent = settings.consents.find((item) => item.id === consentId);
  if (!consent) throw new Error("consent_not_found");
  if (consent.required && !granted) throw new Error("consent_required");
  const next: FamilySettings = {
    ...settings,
    consents: settings.consents.map((item) => (item.id === consentId ? { ...item, granted, updatedAt: nowIso() } : item)),
  };
  return save(consentId === "consent-transcripts" ? { ...next, transcriptsEnabled: granted } : next);
}

export function setRetention(days: number): FamilySettings {
  if (!retentionOptions.includes(days)) throw new Error("invalid_retention");
  return save({ ...store.get(), retentionDays: days });
}

/** Family export: demo data only, never a real child record. */
export function buildExport(): { generatedAt: string; family: string; children: unknown[]; consents: unknown[]; retentionDays: number } {
  const settings = store.get();
  return {
    generatedAt: nowIso(),
    family: "demo-family",
    children: settings.children.map((child) => ({ displayName: child.displayName, ageBand: child.ageBand, permissions: child.permissions, screenLimitMinutes: child.screenLimitMinutes })),
    consents: settings.consents.map((consent) => ({ id: consent.id, granted: consent.granted, updatedAt: consent.updatedAt })),
    retentionDays: settings.retentionDays,
  };
}

export function resetSettings(): void {
  store.reset();
}
