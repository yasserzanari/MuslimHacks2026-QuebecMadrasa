export type CommunityActivity = "Français" | "Mathématiques" | "Anglais" | "Sciences" | "Lecture" | "Projets créatifs" | "Jeux éducatifs" | "Sorties éducatives" | "Projets STEM" | "Coran" | "Études islamiques" | "Adab et vie musulmane";

export interface GroupEvent { date: string; title: string; type: "Cours" | "Sortie" | "Projet" | "Islam"; description: string; }
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
}

export const communities: LearningCommunity[] = [
  { id: "montreal-nord", title: "Groupe EXTRA Montréal-Nord", neighborhood: "Montréal-Nord", verified: true, availableSpots: 2, capacity: 6, ages: "6 à 11 ans", languages: "Français", schedule: "Mardi et jeudi, 9h00 à 12h00", budget: 120, activities: ["Français", "Mathématiques", "Projets créatifs", "Jeux éducatifs"], description: "Un groupe chaleureux pour avancer dans les matières de base avec des projets manuels.", host: "Famille et éducatrice partenaire", accent: "montreal", events: [{ date: "Mardi 8 sept.", title: "Lecture et mathématiques", type: "Cours", description: "Deux ateliers courts suivis d’un temps de jeux éducatifs." }, { date: "Jeudi 10 sept.", title: "Construire un pont", type: "Projet", description: "Défi créatif avec mesures, formes et travail en équipe." }, { date: "Samedi 19 sept.", title: "Sortie au parc", type: "Sortie", description: "Activité familiale, lieu exact communiqué aux membres confirmés." }], budgetBreakdown: [{ label: "Éducatrice et préparation", amount: 72 }, { label: "Matériel pédagogique", amount: 24 }, { label: "Collations et activités", amount: 14 }, { label: "Fonds de réserve du groupe", amount: 10 }] },
  { id: "laval-bilingue", title: "Groupe EXTRA Laval bilingue", neighborhood: "Laval", verified: true, availableSpots: 1, capacity: 5, ages: "7 à 12 ans", languages: "Français, Anglais", schedule: "Lundi, mercredi, vendredi, 13h30 à 16h30", budget: 150, activities: ["Anglais", "Sciences", "Lecture", "Sorties éducatives"], description: "Des après-midis bilingues avec lecture, expériences simples et sorties éducatives locales.", host: "Collectif Laval bilingue", accent: "laval", events: [{ date: "Lundi 7 sept.", title: "English conversation", type: "Cours", description: "Conversation guidée et vocabulaire du quotidien." }, { date: "Mercredi 9 sept.", title: "Petites expériences", type: "Cours", description: "Une expérience scientifique expliquée en français et en anglais." }, { date: "Vendredi 25 sept.", title: "Musée des enfants", type: "Sortie", description: "Sortie éducative; transport et détails partagés après confirmation." }], budgetBreakdown: [{ label: "Tuteur bilingue", amount: 92 }, { label: "Matériel et livres", amount: 28 }, { label: "Sorties et transport collectif", amount: 20 }, { label: "Administration du groupe", amount: 10 }] },
  { id: "etudes-islamiques", title: "Groupe EXTRA Coran & vie musulmane", neighborhood: "Saint-Laurent", verified: true, availableSpots: 2, capacity: 6, ages: "8 à 13 ans", languages: "Français, Arabe", schedule: "Samedi, 10h00 à 13h00", budget: 95, activities: ["Coran", "Études islamiques", "Adab et vie musulmane", "Jeux éducatifs"], description: "Un petit groupe pour apprendre le Coran, l’arabe et les bonnes habitudes avec une approche adaptée aux enfants.", host: "Enseignante et parent référent", accent: "montreal", events: [{ date: "Samedi 12 sept.", title: "Révision et tajwid", type: "Islam", description: "Mémorisation courte, écoute et correction bienveillante." }, { date: "Samedi 19 sept.", title: "Adab au quotidien", type: "Islam", description: "Discussion, jeu de rôles et activité pratique sur les bonnes manières." }, { date: "Samedi 26 sept.", title: "Atelier arabe et Coran", type: "Cours", description: "Lettres, vocabulaire et révision de la sourate de la semaine." }], budgetBreakdown: [{ label: "Enseignante et préparation", amount: 55 }, { label: "Livres et supports", amount: 18 }, { label: "Collation et activités", amount: 12 }, { label: "Aide aux familles", amount: 10 }] },
]; 

export function getCommunity(id: string) { return communities.find((community) => community.id === id); }
