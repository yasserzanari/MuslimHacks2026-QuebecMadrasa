export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const level = body.helpLevel ?? "question";
  const courseId = body.courseId ?? "fractions";
  const locale = body.locale ?? "fr";
  const hintSets: Record<string, Record<string, string>> = {
    fractions: { question: "Avant de calculer, qu’est-ce que la question te demande exactement ? Montre-moi ton idée.", hint_1: "Commence par représenter chaque fraction avec le même nombre de parts.", hint_2: "Pour comparer 3/4 et 2/3, cherche un dénominateur commun puis compare les numérateurs.", example: "Exemple différent : pour comparer 1/2 et 2/4, transforme-les en parts équivalentes." },
    "english-speaking": { question: "What do you already know about introducing yourself? Try one short sentence first.", hint_1: "Start with: ‘Hi, my name is…’ Then add one thing you like.", hint_2: "Use ‘I am’ for who you are and ‘I like’ for an activity you enjoy.", example: "Example: ‘Hi, my name is Adam. I like drawing.’ Now make your own version." },
    ecosystems: { question: "Which living thing and which non-living element can you spot in the ecosystem?", hint_1: "Think about plants, animals, water, light and soil.", hint_2: "Explain the relationship with an arrow: ‘A needs B because…’.", example: "Example: the bee visits a flower to collect nectar, and the flower is pollinated." },
    "lecture-francaise": { question: "Quel est le sujet du texte en une phrase, sans encore donner tous les détails ?", hint_1: "Cherche les mots ou idées qui reviennent plusieurs fois.", hint_2: "Sépare ce que le texte dit directement de ce que tu déduis.", example: "Exemple : transforme le titre en question, puis cherche la phrase qui y répond." },
    "lettres-arabes": { question: "Quelle forme et quel son reconnais-tu dans cette lettre ?", hint_1: "Regarde d’abord les points : leur nombre et leur position sont importants.", hint_2: "Prononce le son lentement, puis compare-le à une lettre que tu connais déjà.", example: "Exemple : écris la lettre au début, au milieu et à la fin d’un mot." },
    "memorisation-coran": { question: "Peux-tu réciter le premier petit passage sans regarder ?", hint_1: "Écoute une seule phrase, répète-la trois fois, puis cache le texte.", hint_2: "Accroche chaque verset au mot-clé qui vient juste avant.", example: "Exemple : récite deux versets, puis vérifie seulement la fin de chacun." },
  };
  const responses = hintSets[courseId] ?? hintSets.fractions;
  const englishFallback: Record<string, string> = { question: "Before answering, explain what you notice.", hint_1: "Try one small step and tell me why you chose it.", hint_2: "Connect your observation to the course objective.", example: "Here is a different example. Now create your own version." };
  const message = locale === "en" ? englishFallback[level] ?? englishFallback.question : responses[level] ?? responses.question;
  return Response.json({ message, helpLevel: level, nextAction: locale === "en" ? "Write your reasoning in one sentence." : "Écris ton raisonnement en une phrase." });
}
