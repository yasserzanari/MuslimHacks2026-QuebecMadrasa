export type CourseCategory = "Mathematiques" | "Francais" | "Anglais" | "Sciences" | "Arabe" | "Coran";

export type Course = {
  id: string;
  title: string;
  category: CourseCategory;
  level: string;
  language: string;
  duration: string;
  objective: string;
  progress: number;
  badge: string;
  icon: string;
  color: "blue" | "purple" | "green" | "gold";
  aligned: string;
  description: string;
  modules: string[];
  studentPrompt: string;
};

export const courses: Course[] = [
  { id: "fractions", title: "Fractions", category: "Mathematiques", level: "3e cycle du primaire (5e–6e année)", language: "Français", duration: "30–40 min", objective: "Comprendre la valeur des fractions et les additionner avec des dénominateurs communs.", progress: 60, badge: "Aligné au MEQ", icon: "¾", color: "blue", aligned: "Mathématiques", description: "Une leçon guidée pour comparer, représenter et additionner des fractions dans des situations concrètes.", modules: ["Représenter une fraction", "Comparer deux fractions", "Additionner avec le même dénominateur", "Défi de transfert"], studentPrompt: "Comment sais-tu que 3/4 est plus grand que 2/3 ?" },
  { id: "lecture-francaise", title: "Lecture française", category: "Francais", level: "2e cycle du primaire (3e–4e année)", language: "Français", duration: "25–35 min", objective: "Améliorer la compréhension de textes et identifier les idées principales.", progress: 45, badge: "Aligné au MEQ", icon: "ABC", color: "purple", aligned: "Français", description: "Une lecture courte accompagnée de questions pour trouver l'idée principale et justifier sa réponse avec le texte.", modules: ["Lire le texte", "Repérer les indices", "Formuler l'idée principale", "Répondre avec une preuve"], studentPrompt: "Quelle phrase du texte t'aide à défendre ton idée ?" },
  { id: "lettres-arabes", title: "Arabe : les lettres", category: "Arabe", level: "Débutant", language: "Arabe / Français", duration: "15–20 min", objective: "Reconnaître et prononcer les lettres de l’alphabet arabe.", progress: 70, badge: "Langue arabe", icon: "ا ب", color: "green", aligned: "Arabe", description: "Reconnaître les formes des lettres, les entendre et les tracer avec un exercice de rappel actif.", modules: ["Écouter les sons", "Associer lettre et son", "Tracer les formes", "Lire une syllabe"], studentPrompt: "Quel son entends-tu au début de cette syllabe ?" },
  { id: "memorisation-coran", title: "Mémorisation du Coran", category: "Coran", level: "Débutant", language: "Arabe", duration: "15–25 min", objective: "Mémoriser de courtes sourates avec une récitation correcte.", progress: 30, badge: "Études islamiques", icon: "☽", color: "gold", aligned: "Coran", description: "Une séance courte de mémorisation avec écoute, répétition par segments et auto-vérification.", modules: ["Écouter le segment", "Répéter avec le modèle", "Réciter sans support", "Révision espacée"], studentPrompt: "Peux-tu réciter le prochain segment lentement ?" },
  { id: "english-speaking", title: "English speaking", category: "Anglais", level: "Beginner · ages 11–14", language: "English / Français", duration: "20–30 min", objective: "Build confidence by introducing yourself and asking simple questions in English.", progress: 25, badge: "Language practice", icon: "Hi", color: "blue", aligned: "English as a second language", description: "A guided conversation with vocabulary cards, listening practice and a short speaking challenge.", modules: ["Warm-up vocabulary", "Listen and repeat", "Build a question", "Speak with confidence"], studentPrompt: "What would you like to tell a new classmate about yourself?" },
  { id: "ecosystems", title: "Les écosystèmes", category: "Sciences", level: "1er cycle du secondaire", language: "Français", duration: "30–40 min", objective: "Expliquer comment les êtres vivants interagissent dans un écosystème.", progress: 10, badge: "Projet science", icon: "⌁", color: "green", aligned: "Science et technologie", description: "Une activité interactive pour observer les relations alimentaires et prévoir l'effet d'un changement dans un milieu.", modules: ["Observer un milieu", "Construire une chaîne", "Tester un changement", "Défi de transfert"], studentPrompt: "Que pourrait-il arriver si les abeilles disparaissaient ?" },
];

export function getCourse(id: string) {
  return courses.find((course) => course.id === id);
}
