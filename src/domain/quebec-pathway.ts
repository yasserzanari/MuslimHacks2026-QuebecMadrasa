export type StepId = "profile" | "declaration" | "learning-project" | "progress-log" | "final-report";

export type FieldType = "text" | "textarea" | "date";

export type FieldSchema = { id: string; label: string; type: FieldType; placeholder?: string };

export type QuebecStep = {
  id: StepId;
  order: number;
  icon: string;
  title: string;
  description: string;
  dueDate: string | null;
  ongoing?: boolean;
  fields: FieldSchema[];
};

export function schoolYearStartYear(today = new Date()): number {
  return today.getUTCMonth() >= 6 ? today.getUTCFullYear() : today.getUTCFullYear() - 1;
}

export function currentSchoolYearLabel(today = new Date()): string {
  const start = schoolYearStartYear(today);
  return `${start}-${start + 1}`;
}

export function buildQuebecSteps(today = new Date()): QuebecStep[] {
  const start = schoolYearStartYear(today);
  return [
    { id: "profile", order: 1, icon: "◐", title: "Profil familial", description: "Renseignements sur votre enfant et votre contexte d’instruction en famille.", dueDate: null, fields: [] },
    { id: "declaration", order: 2, icon: "✉", title: "Avis de déclaration", description: "Déclarez votre intention d’instruire votre enfant à la maison au ministère.", dueDate: `${start}-07-01`, fields: [
      { id: "childName", label: "Nom de l’enfant", type: "text", placeholder: "Ex. Adam" },
      { id: "intendedStartDate", label: "Date prévue du début de l’instruction en famille", type: "date" },
      { id: "notes", label: "Précisions supplémentaires", type: "textarea", placeholder: "Contexte, situation particulière, etc." },
    ] },
    { id: "learning-project", order: 3, icon: "▤", title: "Projet d’apprentissage", description: "Planifiez les apprentissages pour l’année scolaire en cours.", dueDate: `${start}-09-30`, fields: [
      { id: "approcheEducative", label: "Approche éducative", type: "textarea", placeholder: "Ex. Apprentissage structuré à la maison, complété par des cours en ligne." },
      { id: "programmesVises", label: "Programmes visés", type: "textarea", placeholder: "Ex. Programme de formation de l’école québécoise, 5e année." },
      { id: "activites", label: "Activités prévues", type: "textarea" },
      { id: "autresCompetences", label: "Autres compétences développées", type: "textarea" },
      { id: "ressources", label: "Ressources utilisées", type: "textarea", placeholder: "Manuels, plateformes, matériel." },
      { id: "tempsApproximatif", label: "Temps approximatif consacré", type: "text", placeholder: "Ex. 25 heures par semaine" },
      { id: "organisationsContributrices", label: "Organisations contributrices", type: "text", placeholder: "Ex. aucune, ou nom d’un pod / organisme." },
      { id: "modalitesEvaluation", label: "Modalités d’évaluation", type: "textarea" },
      { id: "dernierNiveauServices", label: "Dernier niveau de services éducatifs reçus", type: "text", placeholder: "Ex. 4e année, école primaire X" },
    ] },
    { id: "progress-log", order: 4, icon: "☑", title: "Suivi de mise en œuvre", description: "Consignez les apprentissages et les activités réalisées tout au long de l’année.", dueDate: null, ongoing: true, fields: [
      { id: "journalEntry", label: "Notes de suivi", type: "textarea", placeholder: "Ce que votre enfant a appris récemment." },
      { id: "datesRencontres", label: "Dates de rencontre ou d’échange", type: "text" },
    ] },
    { id: "final-report", order: 5, icon: "◫", title: "Bilan de progression", description: "Faites le bilan des apprentissages et conservez vos traces.", dueDate: `${start + 1}-06-15`, fields: [
      { id: "apprentissagesRealises", label: "Apprentissages réalisés", type: "textarea" },
      { id: "preuvesConservees", label: "Preuves conservées", type: "textarea", placeholder: "Portfolio, travaux, évaluations." },
      { id: "prochaineEtape", label: "Prochaine étape", type: "textarea" },
    ] },
  ];
}

export const OFFICIAL_SOURCES = [
  { title: "Démarche et étapes — instruction en famille", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/demarche-etapes" },
  { title: "Échéancier de l’enseignement à la maison (PDF)", url: "https://cdn-contenu.quebec.ca/cdn-contenu/education/enseignement-maison/Echeancier-enseignement-maison.pdf" },
  { title: "Règlement sur l’enseignement à la maison", url: "https://www.legisquebec.gouv.qc.ca/fr/document/rc/I-13.3%2C%20r.%206.01" },
] as const;
