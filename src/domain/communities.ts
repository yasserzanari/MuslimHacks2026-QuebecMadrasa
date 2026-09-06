export type CommunityActivity = "Français" | "Mathématiques" | "Anglais" | "Sciences" | "Lecture" | "Projets créatifs" | "Jeux éducatifs" | "Sorties éducatives" | "Projets STEM" | "Coran" | "Études islamiques" | "Adab et vie musulmane";

export type GroupEventType = "Cours" | "Sortie" | "Projet" | "Islam";
export interface GroupEvent { date: string; title: string; type: GroupEventType; description: string; }
export interface GroupBudgetLine { label: string; amount: number; }

export interface LearningCommunity {
  id: string;
  title: string;
  neighborhood: string;
  verified: boolean;
  availableSpots: number;
  capacity: number;
  ages: string;
  languages: string;
  schedule: string;
  budget: number;
  activities: CommunityActivity[];
  description: string;
  host: string;
  accent: "montreal" | "laval" | "science";
  events: GroupEvent[];
  budgetBreakdown: GroupBudgetLine[];
  /** Variante anglaise : le contenu suit la locale, pas seulement l'interface. */
  en: {
    title: string;
    neighborhood: string;
    ages: string;
    languages: string;
    schedule: string;
    description: string;
    host: string;
    events: { date: string; title: string; description: string }[];
    budgetBreakdown: { label: string }[];
  };
}

export const communities: LearningCommunity[] = [
  { id: "montreal-nord", title: "Groupe EXTRA Montréal-Nord", neighborhood: "Montréal-Nord", verified: true, availableSpots: 2, capacity: 6, ages: "6 à 11 ans", languages: "Français", schedule: "Mardi et jeudi, 9h00 à 12h00", budget: 120, activities: ["Français", "Mathématiques", "Projets créatifs", "Jeux éducatifs"], description: "Un groupe chaleureux pour avancer dans les matières de base avec des projets manuels.", host: "Famille et éducatrice partenaire", accent: "montreal", events: [{ date: "Mardi 8 sept.", title: "Lecture et mathématiques", type: "Cours", description: "Deux ateliers courts suivis d’un temps de jeux éducatifs." }, { date: "Jeudi 10 sept.", title: "Construire un pont", type: "Projet", description: "Défi créatif avec mesures, formes et travail en équipe." }, { date: "Samedi 19 sept.", title: "Sortie au parc", type: "Sortie", description: "Activité familiale, lieu exact communiqué aux membres confirmés." }], budgetBreakdown: [{ label: "Éducatrice et préparation", amount: 72 }, { label: "Matériel pédagogique", amount: 24 }, { label: "Collations et activités", amount: 14 }, { label: "Fonds de réserve du groupe", amount: 10 }], en: {"title": "EXTRA group, Montréal-Nord", "neighborhood": "Montréal-Nord", "ages": "ages 6 to 11", "languages": "French", "schedule": "Tuesday and Thursday, 9:00 am to 12:00 pm", "description": "A warm group to move forward in the core subjects through hands-on projects.", "host": "Family and partner educator", "events": [{"date": "Tuesday Sept. 8", "title": "Reading and mathematics", "description": "Two short workshops followed by educational games."}, {"date": "Thursday Sept. 10", "title": "Build a bridge", "description": "A creative challenge with measurement, shapes and teamwork."}, {"date": "Saturday Sept. 19", "title": "Park outing", "description": "A family activity; the exact place is shared with confirmed members."}], "budgetBreakdown": [{"label": "Educator and preparation"}, {"label": "Teaching material"}, {"label": "Snacks and activities"}, {"label": "Group reserve fund"}]} },
  { id: "laval-bilingue", title: "Groupe EXTRA Laval bilingue", neighborhood: "Laval", verified: true, availableSpots: 1, capacity: 5, ages: "7 à 12 ans", languages: "Français, Anglais", schedule: "Lundi, mercredi, vendredi, 13h30 à 16h30", budget: 150, activities: ["Anglais", "Sciences", "Lecture", "Sorties éducatives"], description: "Des après-midis bilingues avec lecture, expériences simples et sorties éducatives locales.", host: "Collectif Laval bilingue", accent: "laval", events: [{ date: "Lundi 7 sept.", title: "English conversation", type: "Cours", description: "Conversation guidée et vocabulaire du quotidien." }, { date: "Mercredi 9 sept.", title: "Petites expériences", type: "Cours", description: "Une expérience scientifique expliquée en français et en anglais." }, { date: "Vendredi 25 sept.", title: "Musée des enfants", type: "Sortie", description: "Sortie éducative; transport et détails partagés après confirmation." }], budgetBreakdown: [{ label: "Tuteur bilingue", amount: 92 }, { label: "Matériel et livres", amount: 28 }, { label: "Sorties et transport collectif", amount: 20 }, { label: "Administration du groupe", amount: 10 }], en: {"title": "EXTRA bilingual group, Laval", "neighborhood": "Laval", "ages": "ages 7 to 12", "languages": "French, English", "schedule": "Monday, Wednesday, Friday, 1:30 pm to 4:30 pm", "description": "Bilingual afternoons with reading, simple experiments and local educational outings.", "host": "Laval bilingual collective", "events": [{"date": "Monday Sept. 7", "title": "English conversation", "description": "Guided conversation and everyday vocabulary."}, {"date": "Wednesday Sept. 9", "title": "Small experiments", "description": "A science experiment explained in French and in English."}, {"date": "Friday Sept. 25", "title": "Children's museum", "description": "Educational outing; transport and details shared after confirmation."}], "budgetBreakdown": [{"label": "Bilingual tutor"}, {"label": "Material and books"}, {"label": "Outings and shared transport"}, {"label": "Group administration"}]} },
  { id: "etudes-islamiques", title: "Groupe EXTRA Coran & vie musulmane", neighborhood: "Saint-Laurent", verified: true, availableSpots: 2, capacity: 6, ages: "8 à 13 ans", languages: "Français, Arabe", schedule: "Samedi, 10h00 à 13h00", budget: 95, activities: ["Coran", "Études islamiques", "Adab et vie musulmane", "Jeux éducatifs"], description: "Un petit groupe pour apprendre le Coran, l’arabe et les bonnes habitudes avec une approche adaptée aux enfants.", host: "Enseignante et parent référent", accent: "montreal", events: [{ date: "Samedi 12 sept.", title: "Révision et tajwid", type: "Islam", description: "Mémorisation courte, écoute et correction bienveillante." }, { date: "Samedi 19 sept.", title: "Adab au quotidien", type: "Islam", description: "Discussion, jeu de rôles et activité pratique sur les bonnes manières." }, { date: "Samedi 26 sept.", title: "Atelier arabe et Coran", type: "Cours", description: "Lettres, vocabulaire et révision de la sourate de la semaine." }], budgetBreakdown: [{ label: "Enseignante et préparation", amount: 55 }, { label: "Livres et supports", amount: 18 }, { label: "Collation et activités", amount: 12 }, { label: "Aide aux familles", amount: 10 }], en: {"title": "EXTRA group, Quran and Muslim life", "neighborhood": "Saint-Laurent", "ages": "ages 8 to 13", "languages": "French, Arabic", "schedule": "Saturday, 10:00 am to 1:00 pm", "description": "A small group to learn the Quran, Arabic and good habits with an approach suited to children.", "host": "Teacher and lead parent", "events": [{"date": "Saturday Sept. 12", "title": "Review and tajwid", "description": "Short memorisation, listening and kind correction."}, {"date": "Saturday Sept. 19", "title": "Adab in daily life", "description": "Discussion, role play and a practical activity on good manners."}, {"date": "Saturday Sept. 26", "title": "Arabic and Quran workshop", "description": "Letters, vocabulary and review of the week's surah."}], "budgetBreakdown": [{"label": "Teacher and preparation"}, {"label": "Books and materials"}, {"label": "Snack and activities"}, {"label": "Support for families"}]} },
]; 

export const activityLabels: Record<CommunityActivity, { fr: string; en: string }> = {
  "Français": { fr: "Français", en: "French" },
  "Mathématiques": { fr: "Mathématiques", en: "Mathematics" },
  "Anglais": { fr: "Anglais", en: "English" },
  "Sciences": { fr: "Sciences", en: "Science" },
  "Lecture": { fr: "Lecture", en: "Reading" },
  "Projets créatifs": { fr: "Projets créatifs", en: "Creative projects" },
  "Jeux éducatifs": { fr: "Jeux éducatifs", en: "Educational games" },
  "Sorties éducatives": { fr: "Sorties éducatives", en: "Educational outings" },
  "Projets STEM": { fr: "Projets STEM", en: "STEM projects" },
  "Coran": { fr: "Coran", en: "Quran" },
  "Études islamiques": { fr: "Études islamiques", en: "Islamic studies" },
  "Adab et vie musulmane": { fr: "Adab et vie musulmane", en: "Adab and Muslim life" },
};

export const eventTypeLabels: Record<GroupEventType, { fr: string; en: string }> = {
  Cours: { fr: "Cours", en: "Class" },
  Sortie: { fr: "Sortie", en: "Outing" },
  Projet: { fr: "Projet", en: "Project" },
  Islam: { fr: "Islam", en: "Islam" },
};

/** Même forme, autre langue : les pages continuent de lire community.title. */
export function localizeCommunity(community: LearningCommunity, locale: "fr" | "en"): LearningCommunity {
  if (locale === "fr") return community;
  return {
    ...community,
    ...community.en,
    events: community.events.map((event, index) => ({ ...event, ...community.en.events[index] })),
    budgetBreakdown: community.budgetBreakdown.map((line, index) => ({ ...line, ...community.en.budgetBreakdown[index] })),
  };
}

export function localizeCommunities(locale: "fr" | "en"): LearningCommunity[] {
  return communities.map((community) => localizeCommunity(community, locale));
}

export function getCommunity(id: string) { return communities.find((community) => community.id === id); }
