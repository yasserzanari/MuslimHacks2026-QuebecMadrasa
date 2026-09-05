export type CommunityActivity = "Français" | "Mathématiques" | "Anglais" | "Sciences" | "Lecture" | "Projets créatifs" | "Jeux éducatifs" | "Sorties éducatives" | "Projets STEM";

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
}

export const communities: LearningCommunity[] = [
  { id: "montreal-nord", title: "Groupe EXTRA Montréal-Nord", neighborhood: "Montréal-Nord", verified: true, availableSpots: 2, capacity: 6, ages: "6 à 11 ans", languages: "Français", schedule: "Mardi et jeudi, 9h00 à 12h00", budget: 120, activities: ["Français", "Mathématiques", "Projets créatifs", "Jeux éducatifs"], description: "Un groupe chaleureux pour avancer dans les matières de base avec des projets manuels.", host: "Famille et éducatrice partenaire", accent: "montreal" },
  { id: "laval-bilingue", title: "Groupe EXTRA Laval bilingue", neighborhood: "Laval", verified: true, availableSpots: 1, capacity: 5, ages: "7 à 12 ans", languages: "Français, Anglais", schedule: "Lundi, mercredi, vendredi, 13h30 à 16h30", budget: 150, activities: ["Anglais", "Sciences", "Lecture", "Sorties éducatives"], description: "Des après-midis bilingues avec lecture, expériences simples et sorties éducatives locales.", host: "Collectif Laval bilingue", accent: "laval" },
  { id: "atelier-sciences", title: "Groupe EXTRA sciences et sorties", neighborhood: "Rosemont–La Petite-Patrie", verified: true, availableSpots: 3, capacity: 8, ages: "8 à 14 ans", languages: "Français", schedule: "Mercredi, 9h00 à 15h00", budget: 135, activities: ["Sciences", "Projets STEM", "Sorties éducatives", "Jeux éducatifs"], description: "Un groupe interâge pour observer, expérimenter et apprendre dehors avec un animateur.", host: "Atelier des familles", accent: "science" },
];

export function getCommunity(id: string) { return communities.find((community) => community.id === id); }
