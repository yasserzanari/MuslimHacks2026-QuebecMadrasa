"use client";

import Link from "next/link";
import { useState } from "react";

type Locale = "fr" | "en";

type Child = {
  name: string;
  age: string;
};

const steps = [
  { fr: "Votre famille", en: "Your family", noteFr: "Le point de départ", noteEn: "Your starting point" },
  { fr: "Vos enfants", en: "Your children", noteFr: "Un espace pour chacun", noteEn: "A space for everyone" },
  { fr: "Votre rythme", en: "Your rhythm", noteFr: "Une semaine réaliste", noteEn: "A realistic week" },
  { fr: "Votre aperçu", en: "Your preview", noteFr: "Prêt à commencer", noteEn: "Ready to begin" },
];

const copy = {
  fr: {
    back: "Retour au tableau de bord",
    eyebrow: "Première étape · environ 4 minutes",
    title: "Construisons votre rythme familial.",
    intro: "Quelques réponses suffisent pour préparer un parcours qui respecte votre réalité, vos langues et le temps que vous avez vraiment.",
    trust: "Vos réponses restent privées et peuvent être modifiées plus tard.",
    next: "Continuer",
    previous: "Retour",
    finish: "Créer mon espace parent",
    familyTitle: "Parlez-nous de votre famille",
    familyText: "Ces informations servent à vous proposer un parcours québécois pertinent. Rien n’est envoyé automatiquement au ministère.",
    familyName: "Nom de la famille",
    familyPlaceholder: "Ex. Famille Ghorbel",
    region: "Votre région",
    regionPlaceholder: "Choisir une région",
    language: "Langue principale de l’espace parent",
    childrenTitle: "Qui va apprendre avec vous?",
    childrenText: "Vous pourrez ajouter ou modifier des enfants quand vous le souhaitez.",
    childName: "Prénom ou surnom",
    childNamePlaceholder: "Ex. Adam",
    age: "Âge",
    agePlaceholder: "Choisir",
    addChild: "+ Ajouter un enfant",
    rhythmTitle: "Quel rythme vous ressemble?",
    rhythmText: "Nous utiliserons ces préférences pour proposer un premier plan de semaine, jamais pour vous imposer un horaire.",
    days: "Jours disponibles",
    minutes: "Temps moyen par jour",
    focus: "Votre priorité de départ",
    focusOptions: ["Organiser la semaine", "Suivre le parcours Québec", "Trouver des leçons", "Créer une communauté locale"],
    previewTitle: "Voici le début de votre parcours",
    previewText: "Tout pourra être ajusté depuis votre tableau de bord. Commencez petit, puis adaptez au fil des semaines.",
    familyLabel: "Famille",
    childrenLabel: "Enfants",
    rhythmLabel: "Rythme",
    province: "Québec",
    daysValue: "Lun · Mer · Sam",
    minutesValue: "45 minutes",
    ready: "Votre espace est prêt à être personnalisé.",
    successTitle: "Votre famille est bien installée.",
    successText: "Votre tableau de bord peut maintenant vous guider vers le prochain geste utile.",
    goDashboard: "Voir mon tableau de bord",
  },
  en: {
    back: "Back to dashboard",
    eyebrow: "First step · about 4 minutes",
    title: "Let’s build your family rhythm.",
    intro: "A few answers help us prepare a path that respects your reality, languages and the time you truly have.",
    trust: "Your answers stay private and can be changed later.",
    next: "Continue",
    previous: "Back",
    finish: "Create my parent space",
    familyTitle: "Tell us about your family",
    familyText: "This helps us suggest a relevant Quebec path. Nothing is automatically sent to the ministry.",
    familyName: "Family name",
    familyPlaceholder: "e.g. Ghorbel family",
    region: "Your region",
    regionPlaceholder: "Choose a region",
    language: "Main language for the parent space",
    childrenTitle: "Who will learn with you?",
    childrenText: "You can add or edit children whenever you want.",
    childName: "First name or nickname",
    childNamePlaceholder: "e.g. Adam",
    age: "Age",
    agePlaceholder: "Choose",
    addChild: "+ Add a child",
    rhythmTitle: "What rhythm feels right?",
    rhythmText: "We use these preferences to suggest a first weekly plan, never to impose a schedule.",
    days: "Available days",
    minutes: "Average time per day",
    focus: "Your starting priority",
    focusOptions: ["Organize the week", "Follow the Quebec path", "Find lessons", "Build a local community"],
    previewTitle: "Here is the beginning of your path",
    previewText: "Everything can be adjusted from your dashboard. Start small, then adapt week by week.",
    familyLabel: "Family",
    childrenLabel: "Children",
    rhythmLabel: "Rhythm",
    province: "Quebec",
    daysValue: "Mon · Wed · Sat",
    minutesValue: "45 minutes",
    ready: "Your space is ready to be personalized.",
    successTitle: "Your family is all set.",
    successText: "Your dashboard can now guide you to the next useful step.",
    goDashboard: "View my dashboard",
  },
};

const regions = ["Grand Montréal", "Québec", "Laval", "Longueuil", "Autre région du Québec"];
const ages = ["6–8", "9–12", "13–15", "16+"];

export default function FamilyOnboardingPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [step, setStep] = useState(0);
  const [familyName, setFamilyName] = useState("");
  const [region, setRegion] = useState("");
  const [parentLanguage, setParentLanguage] = useState("fr");
  const [children, setChildren] = useState<Child[]>([{ name: "", age: "" }]);
  const [days, setDays] = useState<string[]>(["Lun", "Mer", "Sam"]);
  const [minutes, setMinutes] = useState("45");
  const [focus, setFocus] = useState("");
  const [completed, setCompleted] = useState(false);
  const t = copy[locale];

  function updateChild(index: number, key: keyof Child, value: string) {
    setChildren((current) => current.map((child, childIndex) => childIndex === index ? { ...child, [key]: value } : child));
  }

  function toggleDay(day: string) {
    setDays((current) => current.includes(day) ? current.filter((item) => item !== day) : [...current, day]);
  }

  function nextStep() {
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  return (
    <main className="onboarding-shell">
      <aside className="onboarding-sidebar">
        <Link className="onboarding-brand" href="/"><img src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <div className="onboarding-sidebar-intro">
          <span className="onboarding-kicker">MADRASA QUÉBEC</span>
          <h2>{locale === "fr" ? "Un parcours à votre mesure." : "A path made for you."}</h2>
          <p>{locale === "fr" ? "On commence par écouter votre famille." : "We begin by listening to your family."}</p>
        </div>
        <div className="family-constellation" aria-hidden="true">
          <span className="constellation-line line-one" />
          <span className="constellation-line line-two" />
          <span className="constellation-line line-three" />
          <span className="constellation-node node-parent">P</span>
          <span className="constellation-node node-child-one">A</span>
          <span className="constellation-node node-child-two">S</span>
          <span className="constellation-node node-quebec">✦</span>
          <span className="constellation-caption">{locale === "fr" ? "Votre constellation familiale" : "Your family constellation"}</span>
        </div>
        <div className="onboarding-sidebar-note"><span>✦</span><p>{t.trust}</p></div>
      </aside>

      <section className="onboarding-main">
        <header className="onboarding-header">
          <Link href="/parent" className="onboarding-back">← {t.back}</Link>
          <div className="onboarding-language" aria-label={locale === "fr" ? "Choisir la langue" : "Choose language"}>
            <button className={locale === "fr" ? "active" : ""} onClick={() => setLocale("fr")} aria-pressed={locale === "fr"}>FR</button>
            <button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")} aria-pressed={locale === "en"}>EN</button>
          </div>
        </header>

        <div className="onboarding-content">
          <div className="onboarding-title-block">
            <span className="onboarding-eyebrow">{t.eyebrow}</span>
            <h1>{t.title}</h1>
            <p>{t.intro}</p>
          </div>

          <nav className="onboarding-progress" aria-label={locale === "fr" ? "Progression de l'inscription" : "Onboarding progress"}>
            {steps.map((item, index) => (
              <button key={item.fr} className={`progress-step ${index === step ? "current" : ""} ${index < step ? "done" : ""}`} onClick={() => index <= step && setStep(index)} aria-current={index === step ? "step" : undefined}>
                <span className="progress-dot">{index < step ? "✓" : String(index + 1).padStart(2, "0")}</span>
                <span><strong>{locale === "fr" ? item.fr : item.en}</strong><small>{locale === "fr" ? item.noteFr : item.noteEn}</small></span>
              </button>
            ))}
          </nav>

          <div className="onboarding-card">
            {completed ? (
              <div className="onboarding-success">
                <div className="success-mark">✓</div>
                <span className="onboarding-eyebrow">{t.ready}</span>
                <h2>{t.successTitle}</h2>
                <p>{t.successText}</p>
                <Link className="onboarding-primary" href="/parent">{t.goDashboard} <span>→</span></Link>
              </div>
            ) : (
              <>
                {step === 0 && <section className="onboarding-step-content"><div className="step-heading"><span className="step-symbol">⌂</span><div><h2>{t.familyTitle}</h2><p>{t.familyText}</p></div></div><div className="form-grid"><label className="field full"><span>{t.familyName}</span><input value={familyName} onChange={(event) => setFamilyName(event.target.value)} placeholder={t.familyPlaceholder} /></label><label className="field"><span>{t.region}</span><select value={region} onChange={(event) => setRegion(event.target.value)}><option value="">{t.regionPlaceholder}</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label><div className="field"><span>{t.language}</span><div className="language-choice" role="group" aria-label={t.language}><button type="button" className={parentLanguage === "fr" ? "selected" : ""} onClick={() => setParentLanguage("fr")} aria-pressed={parentLanguage === "fr"}>Français</button><button type="button" className={parentLanguage === "en" ? "selected" : ""} onClick={() => setParentLanguage("en")} aria-pressed={parentLanguage === "en"}>English</button><button type="button" className={parentLanguage === "ar" ? "selected" : ""} onClick={() => setParentLanguage("ar")} aria-pressed={parentLanguage === "ar"}>العربية</button></div></div></div></section>}

                {step === 1 && <section className="onboarding-step-content"><div className="step-heading"><span className="step-symbol">◌</span><div><h2>{t.childrenTitle}</h2><p>{t.childrenText}</p></div></div><div className="children-form">{children.map((child, index) => <div className="child-form-row" key={index}><span className="child-index">{String(index + 1).padStart(2, "0")}</span><label className="field"><span>{t.childName}</span><input value={child.name} onChange={(event) => updateChild(index, "name", event.target.value)} placeholder={t.childNamePlaceholder} /></label><label className="field age-field"><span>{t.age}</span><select value={child.age} onChange={(event) => updateChild(index, "age", event.target.value)}><option value="">{t.agePlaceholder}</option>{ages.map((item) => <option key={item}>{item}</option>)}</select></label></div>)}</div><button className="add-child" onClick={() => setChildren((current) => [...current, { name: "", age: "" }])}>{t.addChild}</button></section>}

                {step === 2 && <section className="onboarding-step-content"><div className="step-heading"><span className="step-symbol">◒</span><div><h2>{t.rhythmTitle}</h2><p>{t.rhythmText}</p></div></div><div className="rhythm-block"><span className="field-label">{t.days}</span><div className="day-picker">{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => <button key={day} className={days.includes(day) ? "selected" : ""} onClick={() => toggleDay(day)}>{day}</button>)}</div></div><div className="rhythm-block"><span className="field-label">{t.minutes}</span><div className="choice-grid compact">{["30", "45", "60", "90"].map((value) => <button key={value} className={minutes === value ? "selected" : ""} onClick={() => setMinutes(value)}><strong>{value}</strong><small>min</small></button>)}</div></div><div className="rhythm-block"><span className="field-label">{t.focus}</span><div className="choice-grid">{t.focusOptions.map((option) => <button key={option} className={focus === option ? "selected" : ""} onClick={() => setFocus(option)}>{option}<span>→</span></button>)}</div></div></section>}

                {step === 3 && <section className="onboarding-step-content"><div className="step-heading"><span className="step-symbol">✦</span><div><h2>{t.previewTitle}</h2><p>{t.previewText}</p></div></div><div className="preview-grid"><div className="preview-summary"><span className="summary-label">{t.familyLabel}</span><strong>{familyName || (locale === "fr" ? "Votre famille" : "Your family")}</strong><small>{region || t.province} · {parentLanguage === "fr" ? "Français" : parentLanguage === "en" ? "English" : "العربية"}</small></div><div className="preview-summary"><span className="summary-label">{t.childrenLabel}</span><strong>{children.filter((child) => child.name || child.age).length || 1}</strong><small>{locale === "fr" ? "profil(s) à accompagner" : "profile(s) to support"}</small></div><div className="preview-summary"><span className="summary-label">{t.rhythmLabel}</span><strong>{minutes} min</strong><small>{days.length} {locale === "fr" ? "jours choisis" : "days selected"}</small></div></div><div className="preview-path"><span>01</span><div><strong>{locale === "fr" ? "Votre tableau de bord familial" : "Your family dashboard"}</strong><p>{locale === "fr" ? "Un prochain geste clair, une semaine à la fois." : "One clear next step, one week at a time."}</p></div><b>→</b></div><div className="preview-path"><span>02</span><div><strong>{locale === "fr" ? "Votre parcours Québec" : "Your Quebec path"}</strong><p>{locale === "fr" ? "Des sources visibles et des étapes à vérifier." : "Visible sources and steps to verify."}</p></div><b>→</b></div></section>}

                <div className="onboarding-actions"><button className="onboarding-secondary" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>{t.previous}</button>{step < steps.length - 1 ? <button className="onboarding-primary" onClick={nextStep}>{t.next} <span>→</span></button> : <button className="onboarding-primary" onClick={() => setCompleted(true)}>{t.finish} <span>→</span></button>}</div>
              </>
            )}
          </div>
          <p className="onboarding-footnote"><span>⌁</span>{t.trust}</p>
        </div>
      </section>
    </main>
  );
}
