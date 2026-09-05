"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Locale = "fr" | "en";

const copy = {
  fr: {
    nav: ["Pour les familles", "Comment ça marche", "Pods", "Sécurité", "Tarifs"],
    login: "Se connecter", start: "Commencer gratuitement", eyebrow: "Apprendre à la maison, avec confiance",
    title: <>Le parcours complet<br />pour apprendre à la maison</>,
    lead: "Conforme au contexte québécois. Adapté aux familles musulmanes. Pensé pour les enfants.",
    trust: ["Conforme au contexte québécois", "Académique et islamique", "Sécurisé et privé", "Communauté locale"],
    create: "Créer mon parcours gratuitement", how: "Voir comment ça marche", student: "Je suis un élève",
    features: [
      ["⚜", "Parcours Québec", "Un parcours structuré qui aide la famille à suivre les attentes et les échéances québécoises."],
      ["▤", "Apprendre", "Des cours académiques, des projets et des apprentissages islamiques réunis dans une même semaine."],
      ["✦", "Tuteur IA sécurisé", "Un accompagnement qui explique, questionne et aide l’enfant à raisonner sans faire le travail à sa place."],
      ["♟", "Pods locaux", "Des petits groupes de familles pour discuter, apprendre ensemble et se retrouver près de chez vous."],
    ],
    bullets: ["Progression claire", "Activités adaptées", "Contrôle par le parent"],
    weekEyebrow: "Une semaine qui a du sens", weekTitle: "Un système qui relie le parent, l’élève et la communauté.",
    steps: [["Planifier", "Choisir les objectifs et les activités de la semaine."], ["Apprendre", "Suivre des leçons, jouer, pratiquer et demander de l’aide."], ["Partager", "Rejoindre une classe collaborative ou un pod local."]],
    safeEyebrow: "Pensé pour protéger l’apprentissage", safeTitle: "Une plateforme utile sans exposer inutilement la famille.",
    safeText: "Les parents gardent le contrôle des permissions. Les contenus générés par l’IA sont vérifiés avant d’être ajoutés au parcours. Les enfants ont un espace simple, adapté à leur âge.",
    safeLink: "Voir le tableau de bord parent →", privateTitle: "Privé par défaut", privateText: "Pas de publicité ciblée. Pas de données publiques sur les enfants. Pas de publication automatique.", humanTitle: "Humain dans la boucle", humanText: "Le parent ou le tuteur valide les contenus importants.",
    priceEyebrow: "Commencer simplement", priceTitle: "Un premier mois pour découvrir votre rythme.", priceText: "Le prototype local est gratuit. Les plans réels seront décidés après validation des besoins des familles.", createShort: "Créer mon parcours", footerTag: "Apprendre en famille. Grandir en communauté.",
  },
  en: {
    nav: ["For families", "How it works", "Pods", "Safety", "Pricing"],
    login: "Sign in", start: "Start for free", eyebrow: "Homeschool with confidence",
    title: <>The complete path<br />to learning at home</>,
    lead: "Built for Quebec. Adapted for Muslim families. Designed around children.",
    trust: ["Quebec-aligned", "Academic and Islamic", "Private and safe", "Local community"],
    create: "Create my free learning path", how: "See how it works", student: "I'm a student",
    features: [
      ["⚜", "Quebec pathway", "A structured path that helps families follow Quebec expectations and important dates."],
      ["▤", "Learn", "Academic courses, projects and Islamic learning brought together in one clear week."],
      ["✦", "Safe AI tutor", "Support that explains, asks questions and helps children reason without doing the work for them."],
      ["♟", "Local pods", "Small family groups to discuss, learn together and reconnect close to home."],
    ],
    bullets: ["Clear progress", "Age-appropriate activities", "Parent-controlled"],
    weekEyebrow: "A week with purpose", weekTitle: "One system connecting parents, students and community.",
    steps: [["Plan", "Choose the goals and activities for the week."], ["Learn", "Take lessons, play, practise and ask for help."], ["Share", "Join a collaborative class or a local pod."]],
    safeEyebrow: "Designed to protect learning", safeTitle: "Useful without exposing your family unnecessarily.",
    safeText: "Parents control permissions. AI-generated content is reviewed before it enters the learning path. Children get a simple space designed for their age.",
    safeLink: "View the parent dashboard →", privateTitle: "Private by default", privateText: "No targeted advertising. No public child data. No automatic publishing.", humanTitle: "Human in the loop", humanText: "A parent or tutor validates important content.",
    priceEyebrow: "Start simply", priceTitle: "Take one month to find your family’s rhythm.", priceText: "The local prototype is free. Real plans will be decided after validating family needs.", createShort: "Create my learning path", footerTag: "Learn as a family. Grow in community.",
  },
} as const;

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const t = copy[locale];
  useEffect(() => { document.documentElement.lang = locale; document.title = locale === "fr" ? "Madrasa Québec — apprendre en famille" : "Madrasa Québec — learn as a family"; }, [locale]);

  return <main className="real-landing">
    <header className="real-nav-wrap"><nav className="real-nav" aria-label="Main navigation"><Link href="/" className="real-brand"><img className="site-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><div className="real-nav-links">{t.nav.map((label, index) => <a key={label} href={["#familles", "#fonctionnement", "#pods", "#securite", "#tarifs"][index]}>{label}</a>)}</div><div className="real-nav-actions"><Link href="/parent" className="real-button real-button-outline">{t.login}</Link><Link href="/parent" className="real-button real-button-dark">{t.start}</Link></div></nav></header>
    <section className="real-hero" id="familles"><div className="real-hero-copy"><p className="real-eyebrow">{t.eyebrow}</p><h1>{t.title}</h1><p className="real-lead">{t.lead}</p><div className="real-trust-row">{t.trust.map((label, index) => <span key={label}><b>{["⚜", "▤", "♙", "♟"][index]}</b><strong>{label}</strong></span>)}</div><div className="real-hero-actions"><Link href="/parent" className="real-button real-button-dark real-button-large">✦ &nbsp; {t.create}</Link><a href="#fonctionnement" className="real-button real-button-outline real-button-large">▷ &nbsp; {t.how}</a><Link href="/student" className="real-button real-button-outline real-button-large">◆ &nbsp; {t.student}</Link></div></div><div className="real-hero-art"><img src="/ui/family-hero.png" alt={locale === "fr" ? "Une famille apprend ensemble à la maison au Québec" : "A family learning together at home in Quebec"} /></div></section>
    <section className="real-feature-grid" id="fonctionnement" aria-label={locale === "fr" ? "Fonctionnalités principales" : "Main features"}>{t.features.map(([icon, title, text], index) => <article className="real-feature-card" key={title}><div className="real-feature-icon">{icon}</div><h2>{title}</h2><p>{text}</p><ul>{t.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></article>)}</section>
    <section className="real-how section-light" id="pods"><div><p className="real-eyebrow">{t.weekEyebrow}</p><h2>{t.weekTitle}</h2></div><div className="real-step-list">{t.steps.map(([title, text], index) => <div key={title}><span>0{index + 1}</span><p><strong>{title}</strong><br />{text}</p></div>)}</div></section>
    <section className="real-safety" id="securite"><div><p className="real-eyebrow">{t.safeEyebrow}</p><h2>{t.safeTitle}</h2><p>{t.safeText}</p><Link href="/parent" className="real-text-link">{t.safeLink}</Link></div><div className="real-safety-card"><div>✓</div><h3>{t.privateTitle}</h3><p>{t.privateText}</p><hr /><div>✓</div><h3>{t.humanTitle}</h3><p>{t.humanText}</p></div></section>
    <section className="real-pricing" id="tarifs"><p className="real-eyebrow">{t.priceEyebrow}</p><h2>{t.priceTitle}</h2><p>{t.priceText}</p><Link href="/parent" className="real-button real-button-dark">{t.createShort}</Link></section>
    <footer className="real-footer"><div><Link href="/" className="real-brand"><img className="site-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link><p>{t.footerTag}</p></div><div className="real-footer-links"><div><strong>{locale === "fr" ? "Produit" : "Product"}</strong><a href="#fonctionnement">{t.nav[1]}</a><Link href="/parent">{locale === "fr" ? "Espace parent" : "Parent space"}</Link><Link href="/student">{locale === "fr" ? "Espace élève" : "Student space"}</Link></div><div><strong>{locale === "fr" ? "Confiance" : "Trust"}</strong><a href="#securite">{t.nav[3]}</a><a href="#familles">{t.nav[0]}</a><a href="#tarifs">{t.nav[4]}</a></div><div><strong>{locale === "fr" ? "Projet" : "Project"}</strong><a href="#pods">{t.nav[2]}</a><a href="#fonctionnement">{t.nav[1]}</a></div></div><div className="real-footer-bottom"><span>© 2026 Madrasa Québec</span><span>{t.footerTag}</span><div className="real-language-switch" aria-label={locale === "fr" ? "Choisir la langue" : "Choose language"}><button className={locale === "fr" ? "active" : ""} onClick={() => setLocale("fr")} aria-pressed={locale === "fr"}>Français</button><button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")} aria-pressed={locale === "en"}>English</button></div></div></footer>
  </main>;
}
