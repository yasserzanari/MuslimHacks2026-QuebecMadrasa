import Image from "next/image";
import Link from "next/link";

const services = [
  ["▦", "Dashboard mosquée", "Une vue d’ensemble des classes, familles, places disponibles et prochaines actions."],
  ["♧", "Familles et élèves", "Invitez les familles, organisez les profils élèves et gardez les permissions sous contrôle."],
  ["▤", "Classes et groupes", "Planifiez des classes, pods et groupes d’étude avec horaires, niveaux et responsables."],
  ["✦", "Outils pour tuteurs", "Donnez aux tuteurs des plans de séance, notes de suivi et espaces de classe adaptés."],
  ["↗", "Suivi et devoirs assistés par IA", "Repérez les progrès et préparez des brouillons de devoirs. Toute suggestion IA reste soumise à validation humaine."],
  ["◇", "Activités extrascolaires", "Gérez ateliers, sorties, clubs et activités communautaires en dehors des cours réguliers."],
  ["☽", "Calendrier islamique et prières", "Ajoutez des repères de calendrier, blocs de prière et temps de préparation configurables selon la ville et la date."],
  ["$", "Bourses et places sponsorisées", "Suivez les besoins, aides et places soutenues avec des informations claires pour les familles."],
  ["🛡", "Sécurité des mineurs", "Permissions parentales, visibilité limitée et supervision adulte pour les espaces destinés aux enfants."],
];

const steps = [
  ["01", "Cadrer le besoin", "Nous identifions vos groupes, vos rôles, vos horaires et vos règles de supervision."],
  ["02", "Configurer un petit périmètre", "Un groupe pilote commence avec un parcours réaliste, des responsables identifiés et des retours simples."],
  ["03", "Observer et ajuster", "La mosquée décide ce qui doit évoluer avant toute extension à d’autres familles ou classes."],
];

export default function MosqueServicesPage() {
  return <main className="mosque-services-page">
    <header className="mosque-services-nav"><Link href="/" className="real-brand"><img className="site-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><div className="mosque-services-nav-actions"><Link href="/" className="real-text-link">← Retour à l’accueil</Link><Link href="#contact" className="real-button real-button-dark">Demander une démo</Link></div></header>
    <section className="mosque-services-hero"><div className="mosque-services-hero-copy"><p className="real-eyebrow">Services pour les mosquées · Québec</p><h1>Accompagner les élèves, soutenir les familles, renforcer la communauté.</h1><p>Une base opérationnelle pour les mosquées qui veulent organiser leurs services éducatifs avec clarté, sécurité et supervision humaine.</p><div className="mosque-services-actions"><Link href="#contact" className="real-button real-button-dark real-button-large">Demander une démo →</Link><Link href="#pilote" className="real-button real-button-outline real-button-large">Lancer un pilote</Link></div><small className="mosque-services-note">Les services et le périmètre sont définis avec chaque mosquée. Aucun résultat financier ni certification automatique n’est garanti.</small></div><div className="mosque-services-hero-art"><Image src="/ui/family-hero.png" alt="Une famille apprend ensemble avec Madrasa Québec" width={760} height={520} priority /></div></section>
    <section className="mosque-trust-row"><span>✓ Supervision adulte</span><span>✓ Permissions parentales</span><span>✓ Données limitées au besoin</span><span>✓ Déploiement progressif</span></section>
    <section className="mosque-services-section" aria-labelledby="mosque-services-title"><div className="mosque-section-heading"><p className="real-eyebrow">Une boîte à outils concrète</p><h2 id="mosque-services-title">Tout ce qu’il faut pour coordonner un programme éducatif local.</h2><p>Choisissez les briques utiles à votre contexte, puis commencez avec un groupe pilote.</p></div><div className="mosque-service-grid">{services.map(([icon, title, text]) => <article className="mosque-service-card" key={title}><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="mosque-people-section"><div><p className="real-eyebrow">Pour chaque rôle</p><h2>Une même base, des vues adaptées.</h2><p>Les responsables voient l’organisation générale. Les tuteurs se concentrent sur leurs groupes. Les parents gardent la visibilité sur les activités de leurs enfants.</p><Link href="#contact" className="real-text-link">Parler de votre organisation →</Link></div><div className="mosque-role-list"><div><b>Responsables</b><span>pilotage, groupes, places et calendrier</span></div><div><b>Tuteurs</b><span>séances, devoirs, suivi et notes</span></div><div><b>Parents</b><span>permissions, progrès et accompagnement</span></div></div></section>
    <section className="mosque-pilot-section" id="pilote"><div className="mosque-section-heading"><p className="real-eyebrow">Un modèle pilote prudent</p><h2>Commencer petit, apprendre vite, décider ensemble.</h2><p>Le pilote sert à valider l’usage avec de vraies familles avant de définir la suite.</p></div><div className="mosque-pilot-steps">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section>
    <section className="mosque-contact-section" id="contact"><div><p className="real-eyebrow">Parlons de votre contexte</p><h2>Prêt à explorer un pilote pour votre mosquée ?</h2><p>Décrivez-nous votre communauté, vos groupes et le premier service que vous souhaitez tester.</p></div><div className="mosque-contact-actions"><a href="mailto:bonjour@madrasa.quebec?subject=Demande%20de%20d%C3%A9mo%20mosqu%C3%A9e" className="real-button real-button-dark real-button-large">Demander une démo</a><Link href="/parent" className="real-button real-button-outline real-button-large">Voir l’espace parent</Link></div></section>
    <footer className="real-footer mosque-services-footer"><div><Link href="/" className="real-brand"><img className="site-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><p>Apprendre en famille. Grandir en communauté.</p></div><span>© 2026 Madrasa Québec</span></footer>
  </main>;
}
