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
  if (value.includes("progression") || value.includes("progrès") || value.includes("difficile") || value.includes("bloque") || value.includes("preuve")) return "progress";
  if (value.includes("semaine") || value.includes("plan") || value.includes("travailler")) return "week";
  return "general";
}

export function mockParentAssistantResponse(intent: ParentAssistantIntent, childName: string) {
  if (intent === "lesson") return {
    title: `Je peux construire le bon cours pour ${childName}`,
    body: `${childName} n’a pas besoin d’un cours générique. Je vais créer une courte mission de sciences basée sur son niveau actuel, son énergie et sa façon préférée d’apprendre. Répondez à ces deux questions : vos choix seront intégrés au brouillon avant son ajout dans la file de génération.`,
    sources: ["Cours approuvés", "Progression récente"], action: "Créer une révision",
    followUps: [
      { label: "Objectif : comprendre", prompt: `Pour ${childName}, objectif : comprendre le concept avec un exemple concret.` },
      { label: "Format : jeu-défi", prompt: `Pour ${childName}, format : jeu-défi interactif avec indices.` },
      { label: "Format : expérience", prompt: `Pour ${childName}, format : expérience guidée à faire à la maison.` },
      { label: "Durée : 15 minutes", prompt: `Créer un cours de sciences de 15 minutes pour ${childName}.` },
    ],
  };

  if (intent === "week") return {
    title: `Voici quoi faire cette semaine pour ${childName}`,
    body: `Je recommande d’abord 20 minutes de fractions mardi, puis une activité de sciences jeudi. Le plan laisse environ 45 minutes libres; cela respecte le rythme actuel sans ajouter une séance inutile.`,
    sources: ["Progression récente", "Plan de la semaine"], action: "Créer une révision",
    followUps: [{ label: "Voir le plan détaillé", prompt: "Montre-moi le plan détaillé de cette semaine" }, { label: "Réserver mardi 20 min", prompt: "Planifie 20 minutes de révision mardi" }, { label: "Préparer la séance", prompt: "Créer une révision pour cette semaine" }],
  };

  if (intent === "progress" && childName === "Sara") return {
    title: "Sara ne manque pas de capacité — elle manque de méthode au bon moment",
    body: "Cette semaine, Sara a réussi 8 activités sur 10. Elle comprend les fractions simples, mais perd confiance quand il faut comparer des dénominateurs différents. Les traces montrent qu’elle demande de l’aide après la première étape; une démonstration visuelle puis une question guidée devraient débloquer le raisonnement.",
    sources: ["Activités des 14 derniers jours", "Preuves d’apprentissage"], action: "Voir les preuves",
    followUps: [{ label: "Voir les 4 erreurs", prompt: "Montre les 4 erreurs de Sara en fractions" }, { label: "Écouter sa séance", prompt: "Analyse la dernière séance de Sara" }, { label: "Créer une séance guidée", prompt: "Créer une révision de fractions guidée pour Sara" }],
  };

  if (intent === "progress") return {
    title: `La semaine d’apprentissage de ${childName} en un coup d’œil`,
    body: `Très bon rythme cette semaine : ${childName} a complété 9 activités sur 11 et progresse particulièrement en sciences. Le seul point qui ralentit encore son raisonnement est la comparaison de fractions lorsque les dénominateurs sont différents. Voici les faits observés et la priorité que je recommande pour la prochaine séance.`,
    sources: ["Activités des 14 derniers jours", "Preuves d’apprentissage"],
    progressReport: { metrics: [{ label: "Activités terminées", value: "9 / 11", detail: "+2 vs semaine passée", tone: "green" }, { label: "Temps actif", value: "2 h 45", detail: "16 min / jour en moyenne", tone: "blue" }, { label: "Réussite moyenne", value: "86 %", detail: "+8 points cette semaine", tone: "gold" }, { label: "Aide demandée", value: "3 fois", detail: "surtout en fractions", tone: "purple" }], rows: [{ subject: "Mathématiques", completed: "4 / 5", score: "78 %", trend: "↗ +5 %", status: "À consolider", tone: "gold" }, { subject: "Sciences", completed: "3 / 3", score: "94 %", trend: "↗ +12 %", status: "Très solide", tone: "green" }, { subject: "Français", completed: "2 / 2", score: "88 %", trend: "→ Stable", status: "En bonne voie", tone: "blue" }, { subject: "Lecture", completed: "1 / 1", score: "91 %", trend: "↗ +4 %", status: "Très solide", tone: "purple" }], strengths: ["Explique bien son raisonnement à l’oral", "Commence ses activités sans rappel", "Réussit les exercices courts de sciences"], focus: { title: "Fractions : comparer des dénominateurs différents", detail: "3 hésitations observées sur 5 exercices; l’erreur arrive après la lecture de la question, pas dans le calcul final.", priority: "Priorité 1" } },
    action: "Voir les preuves",
    followUps: [{ label: "Voir les preuves détaillées", prompt: `Montre les preuves d’apprentissage de ${childName}` }, { label: "Comparer la semaine passée", prompt: `Compare la progression de ${childName} avec la semaine passée` }, { label: "Planifier 20 min de fractions", prompt: `Planifie une courte révision de fractions pour ${childName}` }],
  };

  return { title: "Oui, je peux vous guider", body: "Dites-moi ce que vous voulez comprendre : une progression, une séance, une échéance ou un nouveau devoir. Je répondrai avec les faits disponibles, puis je vous proposerai une prochaine action concrète.", sources: ["Contexte familial autorisé"], action: "Proposer la semaine", followUps: [{ label: "Analyser la progression", prompt: `Résume la progression de ${childName}` }, { label: "Analyser une séance", prompt: `Analyse la dernière séance de ${childName}` }, { label: "Planifier la semaine", prompt: "Que travailler cette semaine ?" }] };
}
