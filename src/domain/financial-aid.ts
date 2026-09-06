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
export type FreeSchoolService = { id: string; name: string; modality: string; condition: string; url: string; en: { name: string; modality: string; condition: string } };

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
  { id: "materials", name: "Manuels et matériel didactique", modality: "Sur demande, selon les modalités du CSS et la disponibilité.", condition: "Même matériel que celui fourni à l’école; disponibilité à confirmer.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien", en: {"name": "Textbooks and teaching material", "modality": "On request, following the school service centre's terms and availability.", "condition": "The same material provided at school; availability to be confirmed."} },
  { id: "psychology", name: "Psychologie", modality: "Accès selon les besoins de l’enfant et les ressources disponibles.", condition: "Évaluation des besoins et modalités du CSS.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien", en: {"name": "Psychology", "modality": "Access depends on the child's needs and the resources available.", "condition": "Needs assessment and the service centre's terms."} },
  { id: "psychoeducation", name: "Psychoéducation", modality: "Accès selon les besoins et la disponibilité du service.", condition: "Demande au CSS; aucune disponibilité garantie.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien", en: {"name": "Psychoeducation", "modality": "Access depends on needs and on the availability of the service.", "condition": "Request to the service centre; availability is not guaranteed."} },
  { id: "special-education", name: "Éducation spécialisée", modality: "Soutien complémentaire selon les modalités locales.", condition: "Besoins de l’enfant évalués par le CSS.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien", en: {"name": "Special education", "modality": "Additional support following local terms.", "condition": "The child's needs are assessed by the service centre."} },
  { id: "orthopedagogy", name: "Orthopédagogie", modality: "Service accessible selon les besoins et la capacité du CSS.", condition: "Coordination avec la personne-ressource du CSS.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien", en: {"name": "Remedial teaching", "modality": "Available depending on needs and the service centre's capacity.", "condition": "Coordinated with the service centre's contact person."} },
  { id: "speech", name: "Orthophonie", modality: "Accès selon les besoins et les ressources disponibles.", condition: "Demande et analyse des besoins; aucune garantie de délai.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien", en: {"name": "Speech therapy", "modality": "Access depends on needs and the resources available.", "condition": "Request and needs analysis; no guaranteed timeline."} },
  { id: "guidance", name: "Information et orientation scolaire et professionnelle", modality: "Accompagnement du parcours scolaire et professionnel.", condition: "Modalités et prise de rendez-vous propres au CSS.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien", en: {"name": "School and career guidance", "modality": "Support for the school and career pathway.", "condition": "Terms and appointments are specific to each service centre."} },
  { id: "library-support", name: "Soutien à l’utilisation de la bibliothèque", modality: "Accès aux ressources documentaires et à leur utilisation.", condition: "Selon les ressources et les règles du CSS.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien", en: {"name": "Support in using the library", "modality": "Access to documentary resources and help using them.", "condition": "Depends on the resources and rules of the service centre."} },
  { id: "facilities", name: "Bibliothèque, laboratoires et installations", modality: "Accès possible aux bibliothèques, laboratoires, art, sport et informatique.", condition: "Sur demande, selon les modalités locales et la disponibilité.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien", en: {"name": "Library, laboratories and facilities", "modality": "Possible access to libraries, laboratories, art, sport and computing.", "condition": "On request, following local terms and availability."} },
  { id: "exams", name: "Préparation aux épreuves ministérielles", modality: "Séances préparatoires gratuites organisées par le CSS ou la CS.", condition: "S’inscrire auprès du CSS/CS pour les épreuves concernées.", url: "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/demarche-etapes", en: {"name": "Preparation for the ministerial examinations", "modality": "Free preparation sessions organised by the service centre or school board.", "condition": "Register with the service centre or board for the examinations concerned."} },
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
  /**
   * Variante anglaise. Les noms officiels sont ceux publiés par l'ARC, Retraite
   * Québec et Revenu Québec; les résumés sont traduits, la source officielle
   * (`url`) reste la référence.
   */
  en: {
    name: string;
    provider: string;
    amount: string;
    deadline: string;
    eligibility: string[];
    steps: string[];
    caveat: string;
  };
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
    en: {
          "name": "Canada Child Benefit (CCB)",
          "provider": "Canada Revenue Agency",
          "amount": "Up to $8,157/year (under 6) or $6,883/year (6–17), per child",
          "deadline": "No fixed annual date; file your returns every year and apply as soon as possible.",
          "eligibility": [
                "A dependent child under 18",
                "Live with the child and be primarily responsible for their care",
                "Be a resident of Canada for CCB purposes",
                "You and your spouse must file your returns"
          ],
          "steps": [
                "Check that the 2025 returns are filed",
                "Apply through CRA My Account or with form RC66",
                "Read the CRA notice and the payment schedule",
                "Report a birth, shared custody or separation promptly"
          ],
          "caveat": "The amount is calculated from adjusted family net income, age and number of children. The CCB is not a homeschooling-specific benefit."
    },
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
    en: {
          "name": "Québec Family Allowance",
          "provider": "Retraite Québec",
          "amount": "2026: $1,221 to $3,068/year per child; single-parent supplement up to $1,077",
          "deadline": "Income tax return every year; payments normally in January, April, July and October.",
          "eligibility": [
                "Have a dependent child under 18",
                "Reside in Québec under the programme rules",
                "Both spouses file a return, even with no income"
          ],
          "steps": [
                "File the federal and Québec returns",
                "Apply to Retraite Québec if it is not automatic",
                "Choose monthly or quarterly payments",
                "Check the annual notice in My Account"
          ],
          "caveat": "Family income, shared custody and marital situation change the amount. The figure shown here is the official 2026 range."
    },
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
    en: {
          "name": "Supplement for the Purchase of School Supplies",
          "provider": "Retraite Québec",
          "amount": "$127 per child for the 2026–2027 school year",
          "deadline": "No separate application; automatic payment expected on 2 July 2026.",
          "eligibility": [
                "Receive the Family Allowance",
                "Child aged 4 to 16 on 30 September",
                "Eligibility depends on age, not on school attendance"
          ],
          "steps": [
                "Confirm the Family Allowance is active",
                "Check the July payment",
                "Keep the notice with the family's financial documents"
          ],
          "caveat": "The programme asks for no proof of school attendance; it does not reimburse your purchases directly."
    },
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
    en: {
          "name": "Child Disability Benefit",
          "provider": "Canada Revenue Agency",
          "amount": "Up to $3,480/year ($290/month) per eligible child, July 2026–June 2027",
          "deadline": "The disability tax credit can be applied for at any time; returns must stay up to date.",
          "eligibility": [
                "Child under 18 eligible for the DTC",
                "Medical form T2201 approved by the CRA",
                "Be eligible for the CCB",
                "Family income below the reduction thresholds"
          ],
          "steps": [
                "Have the health professional complete form T2201",
                "Send the form to the CRA",
                "Wait for the DTC decision",
                "Check that it is added to the CCB automatically"
          ],
          "caveat": "This programme targets disability, not the choice to homeschool. The amount depends on income and the number of eligible children."
    },
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
    en: {
          "name": "Allowance for Special Needs — Youth",
          "provider": "Government of Québec",
          "amount": "Eligible material resources; the amount varies with the recognised need",
          "deadline": "Depends on the school year and on processing; check the current year's form.",
          "eligibility": [
                "Reside in Québec and hold the required status",
                "Have a significant, persistent impairment confirmed by a physician",
                "Be enrolled in a recognised non-subsidised private institution",
                "Study full time or at least 20 hours of classes a month"
          ],
          "steps": [
                "Confirm the institution's recognised status",
                "Obtain a health professional's recommendations",
                "Complete the annual application",
                "Attach the documents and keep the decision"
          ],
          "caveat": "This programme does not automatically cover a family teaching at home; the recognised-institution condition is decisive."
    },
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
    en: {
          "name": "Québec Tax Credit for Childcare Expenses",
          "provider": "Revenu Québec",
          "amount": "The amount varies with income, the child and the eligible expenses",
          "deadline": "Claim it with the income tax return; advance payments may be requested under the rules in force.",
          "eligibility": [
                "Eligible childcare expenses actually paid",
                "Parent working, studying, job-hunting or in an eligible situation",
                "Child living with the parent when the expenses were incurred",
                "Compliant provider and receipts"
          ],
          "steps": [
                "Ask the provider for a compliant receipt",
                "Check that the care meets the conditions",
                "Calculate with schedule C",
                "Claim on line 455 or request advance payments"
          ],
          "caveat": "A learning activity at home does not automatically make childcare expenses eligible. The parent's reason and the provider both matter."
    },
  },
];

/** Même forme, autre langue, pour l'aide financière et les services gratuits. */
export function localizeProgram(program: AidProgram, locale: "fr" | "en"): AidProgram {
  return locale === "fr" ? program : { ...program, ...program.en };
}

export function localizeService(service: FreeSchoolService, locale: "fr" | "en"): FreeSchoolService {
  return locale === "fr" ? service : { ...service, ...service.en };
}

const reasons = {
  fr: {
    match: "Votre profil correspond aux critères de base publiés.",
    under18: "Le programme vise un enfant de moins de 18 ans.",
    "child-disability": "Aucun enfant avec un CIPH/DTC approuvé n’a été indiqué.",
    "quebec-special-needs": "Cette aide exige un établissement privé non subventionné reconnu et un besoin particulier confirmé.",
    "childcare-credit": "Indiquez des frais de garde admissibles et une activité de travail, d’études ou de recherche d’emploi.",
  },
  en: {
    match: "Your profile matches the published basic criteria.",
    under18: "The programme targets a child under 18.",
    "child-disability": "No child with an approved DTC was indicated.",
    "quebec-special-needs": "This support requires a recognised non-subsidised private institution and a confirmed special need.",
    "childcare-credit": "Indicate eligible childcare expenses and work, study or job-search activity.",
  },
} as const;

export function matchFinancialAid(profile: FamilyProfile, locale: "fr" | "en" = "fr") {
  const words = reasons[locale];
  return financialAidPrograms.map((base) => {
    const program = localizeProgram(base, locale);
    let eligible = true;
    let reason: string = words.match;
    if (program.id === "child-disability") eligible = profile.children.some((child) => child.disabilityTaxCredit);
    if (program.id === "quebec-special-needs") eligible = profile.homeschoolType === "private" && profile.children.some((child) => child.disabilityTaxCredit);
    if (program.id === "childcare-credit") eligible = profile.childcarePaid && profile.workingOrStudying;
    if (!profile.children.some((child) => child.age < 18)) { eligible = false; reason = words.under18; }
    if (!eligible && program.id === "child-disability") reason = words["child-disability"];
    if (!eligible && program.id === "quebec-special-needs") reason = words["quebec-special-needs"];
    if (!eligible && program.id === "childcare-credit") reason = words["childcare-credit"];
    return { ...program, eligible, reason, estimatedAmount: estimateAmount(program.id, profile, locale) };
  });
}

export function servicesForCss(cssId: string, locale: "fr" | "en" = "fr") {
  return {
    css: schoolServiceCenters.find((center) => center.id === cssId) ?? null,
    services: freeSchoolServices.map((service) => localizeService(service, locale)),
  };
}

function estimateAmount(programId: string, profile: FamilyProfile, locale: "fr" | "en" = "fr") {
  const childCount = profile.children.length;
  const money = (value: number) => Math.max(0, Math.round(value)).toLocaleString(locale === "fr" ? "fr-CA" : "en-CA");
  const en = locale === "en";
  if (programId === "ccb") {
    const maximum = profile.children.reduce((sum, child) => sum + (child.age < 6 ? 8157 : 6883), 0);
    const incomeOver = Math.max(0, profile.annualIncome - 38237);
    const reduction = incomeOver <= 44610 ? incomeOver * 0.07 : 3123 + Math.max(0, profile.annualIncome - 82847) * 0.032;
    return en ? `about $${money(maximum - reduction)}/year based on your answers` : `environ ${money(maximum - reduction)} $/an selon les réponses`;
  }
  if (programId === "family-allowance") {
    const low = profile.familyStatus === "single" ? 4145 : 3068;
    const high = profile.familyStatus === "single" ? 1651 : 1221;
    const threshold = profile.familyStatus === "single" ? 44000 : 60000;
    const perChild = profile.annualIncome <= threshold ? low : profile.annualIncome >= 107000 ? high : low - ((profile.annualIncome - threshold) / (107000 - threshold)) * (low - high);
    return en ? `about $${money(perChild * childCount)}/year before adjustments` : `environ ${money(perChild * childCount)} $/an avant ajustements`;
  }
  if (programId === "school-supplies") return en ? `$${money(127 * childCount)}/year if the ages qualify` : `${money(127 * childCount)} $/an si les âges sont admissibles`;
  if (programId === "child-disability") {
    const eligibleChildren = profile.children.filter((child) => child.disabilityTaxCredit).length;
    const reduction = Math.max(0, profile.annualIncome - 82847) * (eligibleChildren > 1 ? 0.057 : 0.032);
    return eligibleChildren
      ? (en ? `about $${money(3480 * eligibleChildren - reduction)}/year depending on the DTC` : `environ ${money(3480 * eligibleChildren - reduction)} $/an selon le CIPH/DTC`)
      : (en ? "$0 based on your answers" : "0 $ selon les réponses");
  }
  if (programId === "childcare-credit") return profile.childcarePaid && profile.workingOrStudying
    ? (en ? "variable amount; expenses and provider required" : "montant variable; frais et fournisseur requis")
    : (en ? "$0 based on your answers" : "0 $ selon les réponses");
  return en ? "variable amount; an official decision is required" : "montant variable; décision officielle requise";
}
