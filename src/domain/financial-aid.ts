export type FamilyProfile = {
  province: "QC";
  cssId: string;
  familyStatus: "couple" | "single";
  annualIncome: number;
  children: Array<{ age: number; disabilityTaxCredit: boolean }>;
  workingOrStudying: boolean;
  childcarePaid: boolean;
  homeschoolType: "home" | "private";
};

export type SchoolServiceCenter = { id: string; name: string; region: string; type: "francophone" | "anglophone"; url: string };
export type FreeSchoolService = { id: string; name: string; modality: string; condition: string; url: string };

export const schoolServiceCenters: SchoolServiceCenter[] = [
  { id: "montreal", name: "Centre de services scolaire de Montréal", region: "Montréal", type: "francophone", url: "https://www.cssdm.gouv.qc.ca" },
  { id: "pointe-ile", name: "Centre de services scolaire de la Pointe-de-l’Île", region: "Montréal-Est", type: "francophone", url: "https://www.csspi.ca" },
  { id: "marguerite-bourgeoys", name: "Centre de services scolaire Marguerite-Bourgeoys", region: "Montréal-Ouest", type: "francophone", url: "https://www.cssmb.gouv.qc.ca" },
  { id: "laval", name: "Centre de services scolaire de Laval", region: "Laval", type: "francophone", url: "https://www.csslaval.gouv.qc.ca" },
  { id: "marie-victorin", name: "Centre de services scolaire Marie-Victorin", region: "Longueuil / Rive-Sud", type: "francophone", url: "https://www.cssmv.gouv.qc.ca" },
  { id: "sir-wilfrid-laurier", name: "Commission scolaire Sir-Wilfrid-Laurier", region: "Laval / Laurentides", type: "anglophone", url: "https://www.swlauriersb.qc.ca" },
  { id: "english-montreal", name: "Commission scolaire English-Montréal", region: "Montréal", type: "anglophone", url: "https://www.emsb.qc.ca" },
  { id: "lester-b-pearson", name: "Commission scolaire Lester-B.-Pearson", region: "Montréal-Ouest", type: "anglophone", url: "https://www.lbpsb.qc.ca" },
  { id: "trois-lacs", name: "Centre de services scolaire des Trois-Lacs", region: "Vaudreuil-Soulanges", type: "francophone", url: "https://www.cssst.gouv.qc.ca" },
  { id: "des-grandes-seigneuries", name: "Centre de services scolaire des Grandes-Seigneuries", region: "Montérégie", type: "francophone", url: "https://www.cssdgs.gouv.qc.ca" },
];

export const freeSchoolServices: FreeSchoolService[] = [
  { id: "materials", name: "Manuels et matériel didactique", modality: "Sur demande, selon les modalités du CSS et la disponibilité.", condition: "Même matériel que celui fourni à l’école; disponibilité à confirmer.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien" },
  { id: "psychology", name: "Psychologie", modality: "Accès selon les besoins de l’enfant et les ressources disponibles.", condition: "Évaluation des besoins et modalités du CSS.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien" },
  { id: "psychoeducation", name: "Psychoéducation", modality: "Accès selon les besoins et la disponibilité du service.", condition: "Demande au CSS; aucune disponibilité garantie.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien" },
  { id: "special-education", name: "Éducation spécialisée", modality: "Soutien complémentaire selon les modalités locales.", condition: "Besoins de l’enfant évalués par le CSS.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien" },
  { id: "orthopedagogy", name: "Orthopédagogie", modality: "Service accessible selon les besoins et la capacité du CSS.", condition: "Coordination avec la personne-ressource du CSS.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien" },
  { id: "speech", name: "Orthophonie", modality: "Accès selon les besoins et les ressources disponibles.", condition: "Demande et analyse des besoins; aucune garantie de délai.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien" },
  { id: "guidance", name: "Information et orientation scolaire et professionnelle", modality: "Accompagnement du parcours scolaire et professionnel.", condition: "Modalités et prise de rendez-vous propres au CSS.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien" },
  { id: "library-support", name: "Soutien à l’utilisation de la bibliothèque", modality: "Accès aux ressources documentaires et à leur utilisation.", condition: "Selon les ressources et les règles du CSS.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien" },
  { id: "facilities", name: "Bibliothèque, laboratoires et installations", modality: "Accès possible aux bibliothèques, laboratoires, art, sport et informatique.", condition: "Sur demande, selon les modalités locales et la disponibilité.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien" },
  { id: "exams", name: "Préparation aux épreuves ministérielles", modality: "Séances préparatoires gratuites organisées par le CSS ou la CS.", condition: "S’inscrire auprès du CSS/CS pour les épreuves concernées.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/demarche-etapes" },
];

export type AidProgram = {
  id: string;
  name: string;
  provider: string;
  category: "family" | "tax" | "disability" | "education";
  amount: string;
  deadline: string;
  eligibility: string[];
  steps: string[];
  caveat: string;
  url: string;
};

export const financialAidPrograms: AidProgram[] = [
  {
    id: "ccb",
    name: "Allocation canadienne pour enfants (ACE)",
    provider: "Agence du revenu du Canada",
    category: "family",
    amount: "Jusqu’à 8 157 $/an (< 6 ans) ou 6 883 $/an (6–17 ans), par enfant",
    deadline: "Pas de date annuelle fixe; produire les déclarations chaque année et demander dès que possible.",
    eligibility: ["Enfant de moins de 18 ans à charge", "Résider avec l’enfant et être principalement responsable de ses soins", "Résider au Canada aux fins de l’ACE", "Vous et votre conjoint devez produire vos déclarations"],
    steps: ["Vérifier que les déclarations 2025 sont produites", "Faire une demande dans Mon dossier ARC ou avec le formulaire RC66", "Consulter l’avis de l’ARC et le calendrier de versement", "Signaler rapidement une naissance, garde partagée ou séparation"],
    caveat: "Montant calculé selon le revenu familial net rajusté, l’âge et le nombre d’enfants. L’ACE n’est pas une aide spécifique à l’école à la maison.",
    url: "https://www.canada.ca/fr/agence-revenu/services/prestations-enfants-familles/allocation-canadienne-enfants.html",
  },
  {
    id: "family-allowance",
    name: "Allocation famille du Québec",
    provider: "Retraite Québec",
    category: "family",
    amount: "2026 : 1 221 $ à 3 068 $/an par enfant; supplément monoparental jusqu’à 1 077 $",
    deadline: "Déclaration de revenus chaque année; versements normalement en janvier, avril, juillet et octobre.",
    eligibility: ["Avoir un enfant de moins de 18 ans à charge", "Résider au Québec selon les règles du programme", "Les deux conjoints produisent leur déclaration, même sans revenu"],
    steps: ["Produire les déclarations fédérale et québécoise", "Faire la demande à Retraite Québec si elle n’est pas automatique", "Choisir des versements mensuels ou trimestriels", "Vérifier l’avis annuel dans Mon dossier"],
    caveat: "Le revenu familial, la garde partagée et la situation conjugale changent le montant. Le montant affiché ici est une fourchette officielle 2026.",
    url: "https://www.retraitequebec.gouv.qc.ca/fr/citoyens/enfants/allocation-famille",
  },
  {
    id: "school-supplies",
    name: "Supplément pour l’achat de fournitures scolaires",
    provider: "Retraite Québec",
    category: "education",
    amount: "127 $ par enfant pour l’année scolaire 2026–2027",
    deadline: "Aucune demande séparée; versement automatique prévu le 2 juillet 2026.",
    eligibility: ["Recevoir l’Allocation famille", "Enfant âgé de 4 à 16 ans au 30 septembre", "L’admissibilité dépend de l’âge, pas de la fréquentation scolaire"],
    steps: ["Confirmer que l’Allocation famille est active", "Vérifier le versement de juillet", "Conserver l’avis dans les documents financiers de la famille"],
    caveat: "Le programme ne demande pas de preuve de fréquentation scolaire; il ne rembourse pas directement vos achats.",
    url: "https://www.retraitequebec.gouv.qc.ca/fr/citoyens/enfants/supplement-achat-fournitures-scolaires",
  },
  {
    id: "child-disability",
    name: "Prestation pour enfants handicapés",
    provider: "Agence du revenu du Canada",
    category: "disability",
    amount: "Jusqu’à 3 480 $/an (290 $/mois) par enfant admissible, juillet 2026–juin 2027",
    deadline: "Demande de crédit d’impôt pour personnes handicapées possible en tout temps; les déclarations doivent rester à jour.",
    eligibility: ["Enfant de moins de 18 ans admissible au CIPH/DTC", "Certificat médical T2201 approuvé par l’ARC", "Être admissible à l’ACE", "Revenu familial sous les seuils de réduction"],
    steps: ["Faire remplir le formulaire T2201 par le professionnel de santé", "Envoyer le formulaire à l’ARC", "Attendre la décision du CIPH", "Vérifier l’ajout automatique à l’ACE"],
    caveat: "Ce programme vise le handicap, pas le choix de homeschooling. Le montant dépend du revenu et du nombre d’enfants admissibles.",
    url: "https://www.canada.ca/fr/agence-revenu/services/prestations-enfants-familles/prestation-enfants-handicapes.html",
  },
  {
    id: "quebec-special-needs",
    name: "Allocation pour des besoins particuliers — Jeunes",
    provider: "Gouvernement du Québec",
    category: "disability",
    amount: "Ressources matérielles admissibles; montant variable selon le besoin reconnu",
    deadline: "Selon l’année scolaire et le traitement de la demande; vérifier le formulaire de l’année en cours.",
    eligibility: ["Résider au Québec et avoir le statut requis", "Présenter une incapacité significative et persistante confirmée par un médecin", "Être inscrit dans un établissement privé non subventionné reconnu", "Étudier à temps plein ou au moins 20 h de cours par mois"],
    steps: ["Confirmer le statut reconnu de l’établissement", "Obtenir les recommandations d’un professionnel de santé", "Remplir la demande annuelle", "Joindre les pièces et conserver la décision"],
    caveat: "Ce programme ne couvre pas automatiquement une famille en instruction à domicile; la condition d’établissement reconnu est déterminante.",
    url: "https://www.quebec.ca/education/aide-financiere-aux-etudes/allocation-besoins-particuliers-jeunes/conditions-admissibilite",
  },
  {
    id: "childcare-credit",
    name: "Crédit d’impôt du Québec pour frais de garde",
    provider: "Revenu Québec",
    category: "tax",
    amount: "Montant variable selon le revenu, l’enfant et les frais admissibles",
    deadline: "Réclamer avec la déclaration de revenus; des versements anticipés peuvent être demandés selon les règles en vigueur.",
    eligibility: ["Frais de garde admissibles réellement payés", "Parent au travail, aux études, en recherche d’emploi ou dans une situation admissible", "Enfant vivant avec le parent au moment des frais", "Fournisseur et reçus conformes"],
    steps: ["Demander un reçu conforme au fournisseur", "Vérifier que la garde répond aux conditions", "Calculer avec l’annexe C", "Réclamer à la ligne 455 ou demander des versements anticipés"],
    caveat: "Une activité d’apprentissage à la maison ne rend pas automatiquement les frais de garde admissibles. Le motif du parent et le fournisseur comptent.",
    url: "https://www.revenuquebec.ca/fr/citoyens/impots-et-taxes/impot-sur-le-revenu/production-de-la-declaration-de-revenus/ligne-par-ligne/451-a-480-remboursement-ou-solde-a-payer/ligne-455/",
  },
];

export function matchFinancialAid(profile: FamilyProfile) {
  return financialAidPrograms.map((program) => {
    let eligible = true;
    let reason = "Votre profil correspond aux critères de base publiés.";
    if (program.id === "child-disability") eligible = profile.children.some((child) => child.disabilityTaxCredit);
    if (program.id === "quebec-special-needs") eligible = profile.homeschoolType === "private" && profile.children.some((child) => child.disabilityTaxCredit);
    if (program.id === "childcare-credit") eligible = profile.childcarePaid && profile.workingOrStudying;
    if (!profile.children.some((child) => child.age < 18)) { eligible = false; reason = "Le programme vise un enfant de moins de 18 ans."; }
    if (!eligible && program.id === "child-disability") reason = "Aucun enfant avec un CIPH/DTC approuvé n’a été indiqué.";
    if (!eligible && program.id === "quebec-special-needs") reason = "Cette aide exige un établissement privé non subventionné reconnu et un besoin particulier confirmé.";
    if (!eligible && program.id === "childcare-credit") reason = "Indiquez des frais de garde admissibles et une activité de travail, d’études ou de recherche d’emploi.";
    return { ...program, eligible, reason, estimatedAmount: estimateAmount(program.id, profile) };
  });
}

export function servicesForCss(cssId: string) {
  return { css: schoolServiceCenters.find((center) => center.id === cssId) ?? null, services: freeSchoolServices };
}

function estimateAmount(programId: string, profile: FamilyProfile) {
  const childCount = profile.children.length;
  if (programId === "ccb") {
    const maximum = profile.children.reduce((sum, child) => sum + (child.age < 6 ? 8157 : 6883), 0);
    const incomeOver = Math.max(0, profile.annualIncome - 38237);
    const reduction = incomeOver <= 44610 ? incomeOver * 0.07 : 3123 + Math.max(0, profile.annualIncome - 82847) * 0.032;
    return `environ ${Math.max(0, Math.round(maximum - reduction)).toLocaleString("fr-CA")} $/an selon les réponses`;
  }
  if (programId === "family-allowance") {
    const low = profile.familyStatus === "single" ? 4145 : 3068;
    const high = profile.familyStatus === "single" ? 1651 : 1221;
    const threshold = profile.familyStatus === "single" ? 44000 : 60000;
    const perChild = profile.annualIncome <= threshold ? low : profile.annualIncome >= 107000 ? high : low - ((profile.annualIncome - threshold) / (107000 - threshold)) * (low - high);
    return `environ ${Math.max(0, Math.round(perChild * childCount)).toLocaleString("fr-CA")} $/an avant ajustements`;
  }
  if (programId === "school-supplies") return `${(127 * childCount).toLocaleString("fr-CA")} $/an si les âges sont admissibles`;
  if (programId === "child-disability") {
    const eligibleChildren = profile.children.filter((child) => child.disabilityTaxCredit).length;
    const reduction = Math.max(0, profile.annualIncome - 82847) * (eligibleChildren > 1 ? 0.057 : 0.032);
    return eligibleChildren ? `environ ${Math.max(0, Math.round(3480 * eligibleChildren - reduction)).toLocaleString("fr-CA")} $/an selon le CIPH/DTC` : "0 $ selon les réponses";
  }
  if (programId === "childcare-credit") return profile.childcarePaid && profile.workingOrStudying ? "montant variable; frais et fournisseur requis" : "0 $ selon les réponses";
  return "montant variable; décision officielle requise";
}
