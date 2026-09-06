# Banque de réponses aux questions des juges

## Technical Implementation

**1. Mobile, web ou CLI?** Une application web responsive. Le navigateur permet de servir les familles sur ordinateur et mobile sans installer un logiciel.

**2. Quelles technologies?** Next.js, React, TypeScript, CSS/Tailwind, API routes, Vitest et Playwright.

**3. Comment le système fonctionne-t-il?** Le parent planifie; l'enfant suit une activité adaptée; le tuteur IA donne des indices; la progression est affichée au parent. Les données montrées dans le prototype sont locales ou simulées.

**4. Avez-vous construit cela pendant le hackathon?** Nous avons assemblé et enrichi le vertical slice pendant le projet, en réutilisant des composants et une base existante de démonstration. Nous ne prétendons pas avoir produit un service cloud complet en un week-end.

**5. Quels compromis?** Priorité au parcours critique et à la fiabilité de la démo; auth, base cloud, visio, modération et correction officielle restent des étapes de production.

## Impact et utilisateurs

**1. Utilisateur cible?** Familles musulmanes québécoises qui instruisent à la maison, puis tuteurs, mosquées et familles internationales.

**2. Découverte?** Pilotes avec mosquées/associations, recommandations de parents et partenaires éducatifs.

**3. Combien de personnes?** Le marché exact doit être mesuré. Le produit commence par une communauté locale et peut s'étendre par langue et juridiction; nous ne donnons pas une taille inventée.

**4. Impact potentiel?** Réduire la planification, rendre les devoirs plus accessibles, aider les enfants à rester engagés et connecter les familles à une communauté sûre.

**5. Mesure du succès?** Temps économisé, devoirs terminés, progression, rétention, satisfaction, participation communautaire et incidents de sécurité.

## Démo et fonctionnalités

**1. Tout est-il fonctionnel?** Le parcours local et les interactions principales sont fonctionnels; les intégrations cloud, certaines fonctions IA et la communauté sont mockées ou prévues.

**2. Fonctionnalité la plus importante?** La boucle parent-enfant : le parent organise, l'élève apprend avec un indice, puis le parent voit l'état de progression.

**3. Partie la plus difficile?** Garder une expérience simple tout en séparant les âges, les besoins éducatifs, les exigences québécoises et les limites de l'IA.

**4. Qu'avez-vous réellement terminé?** Les routes, interfaces, séances, interactions et tests listés dans le README de présentation. Les éléments marqués « mock » ou « prévu » ne sont pas présentés comme livrés.

## Business et scalabilité

**1. Modèle?** Abonnement familial, licence pilote pour organisme et places sponsorisées; prix à valider.

**2. Comment scaler?** Séparer contenu, moteur de progression et règles juridictionnelles; ajouter langues, partenaires et stockage sécurisé.

**3. Que faut-il pour un vrai produit?** Auth, base de données, consentement, conformité, contenu validé, tuteurs, support, sécurité mineurs et pilotes mesurés.

**4. Qui paie?** D'abord les familles et organismes partenaires; les mosquées peuvent financer des places ou un pilote, sans obligation de devenir opérateur scolaire.

## Équipe et processus

**1. Répartition?** Produit et besoins; architecture et backend; UX/UI; contenu et pédagogie; tests et présentation. Adapter cette réponse aux contributions réelles de chaque membre.

**2. Apprentissage?** Prioriser un vertical slice, vérifier les parcours avec le navigateur et distinguer une démo d'un produit certifié.

**3. Que feriez-vous différemment?** Établir plus tôt un contrat de données, une matrice de rôles et une métrique de succès.

**4. Comment prioriser?** Par impact sur le parcours parent-enfant, risque, faisabilité pendant le hackathon et valeur démontrable.

## Data, privacy et futur

**Données utilisées?** Données de démonstration : profils, matières, activités, progression, groupes et horaires configurables.

**Sécurité?** Minimisation, validation parentale et séparation des rôles sont les principes; la version production doit ajouter auth, chiffrement, contrôle d'accès et rétention.

**Risques éthiques?** Biais de l'IA, erreurs pédagogiques ou religieuses, surveillance d'enfants et faux sentiment de conformité. La réponse est l'humain dans la boucle, la transparence et le contrôle parent.

**L'IA est-elle indispensable?** Non. Le curriculum et le suivi doivent fonctionner sans LLM; l'IA accélère les indices, la préparation et le tri, mais ne remplace pas l'enseignant.

**Prochaine étape?** Pilote de 90 jours avec une mosquée et quelques familles, mesure des résultats, puis auth/persistance et validation du modèle économique.

**Différence?** L'intégration locale : parent, élève, apprentissage flexible, communauté musulmane et repères québécois dans un même parcours, avec une séparation explicite entre aide et autorité.

**Pourquoi gagner?** Parce que le projet relie une difficulté quotidienne à une expérience démontrable, inclusive et extensible, sans cacher ses limites.

