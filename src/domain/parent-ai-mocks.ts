export type ParentAssistantIntent = "progress" | "week" | "lesson" | "general";

export const parentAssistantTools = [
  { id: "snapshot", name: "Progression de l’enfant", source: "Activités des 14 derniers jours" },
  { id: "evidence", name: "Preuves d’apprentissage", source: "Portfolio autorisé" },
  { id: "week-plan", name: "Plan de la semaine", source: "Sessions et temps disponible" },
  { id: "quebec", name: "Parcours Québec", source: "Exigences versionnées" },
  { id: "approved-lessons", name: "Cours approuvés", source: "Catalogue Madrasa" },
] as const;

export const parentAssistantPrompts = {
  progress: "Tu es l’assistant pédagogique du parent. Résume uniquement les données autorisées de l’enfant sélectionné. Cite les sources utilisées. Sépare les faits, les points à revoir et les limites. Ne pose aucun diagnostic.",
  week: "À partir de la progression, des preuves et du plan actuel, propose au maximum trois actions réalisables cette semaine. Respecte le temps disponible. Chaque action doit avoir un objectif, une durée et une prochaine étape.",
  lesson: "Crée un brouillon de révision de 20 à 30 minutes pour l’objectif sélectionné. Inclus une mise en route, une pratique guidée, une question de réflexion et une clé de vérification. Le parent doit valider avant publication.",
} as const;

export function detectParentAssistantIntent(message: string): ParentAssistantIntent {
  const value = message.toLowerCase();
  if (value.includes("devoir") || value.includes("cours") || value.includes("révision") || value.includes("revision")) return "lesson";
  if (value.includes("semaine") || value.includes("plan") || value.includes("travailler")) return "week";
  if (value.includes("progression") || value.includes("progrès") || value.includes("difficile")) return "progress";
  return "general";
}

export function mockParentAssistantResponse(intent: ParentAssistantIntent, childName: string) {
  if (intent === "lesson") return { title: "Je peux préparer une révision ciblée", body: `${childName} a déjà une base sur les fractions. Je préparerais une activité courte pour comparer deux fractions, avec une question guidée avant la réponse. Le brouillon restera en attente de votre validation.`, sources: ["Progression récente", "Cours Fractions"], action: "Créer une révision" };
  if (intent === "week") return { title: `Voici la priorité pour ${childName}`, body: "Le meilleur prochain pas est de terminer Fractions, puis de réserver une classe de sciences. Le plan actuel laisse environ 45 minutes disponibles pour une révision guidée.", sources: ["Progression récente", "Plan de la semaine"], action: "Créer une révision" };
  if (intent === "progress") return { title: `Résumé de la progression de ${childName}`, body: "La progression est régulière. Les fractions restent le point à consolider et la participation aux activités de groupe est un bon levier. Ces observations décrivent des activités, pas un diagnostic.", sources: ["Activités des 14 derniers jours", "Preuves d’apprentissage"], action: "Voir les preuves" };
  return { title: "Je peux vous aider à planifier", body: "Je peux résumer la progression, proposer les prochaines actions ou préparer un brouillon de devoir. Choisissez une action ci-dessous pour garder le contrôle sur ce qui est créé.", sources: ["Contexte familial autorisé"], action: "Proposer la semaine" };
}
