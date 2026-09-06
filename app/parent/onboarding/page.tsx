"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AGE_BANDS, currentSchoolYear, type AgeBand, type Jurisdiction, type Locale } from "@/src/domain/family";

type Step = 1 | 2 | 3;

type DraftChild = { key: string; displayName: string; ageBand: AgeBand };

const copy = {
  fr: {
    back: "← Retour à l’accueil",
    stepLabel: (step: Step) => `Étape ${step} sur 3`,
    steps: ["Famille", "Enfants", "Consentement"],
    step1: {
      eyebrow: "Créer votre famille",
      title: "Commençons par votre famille.",
      lead: "Ces informations nous aident à adapter le parcours à votre contexte.",
      nameLabel: "Nom de famille",
      namePlaceholder: "Ex. Famille Ghorbel",
      nameError: "Le nom de famille est requis.",
      jurisdictionLabel: "Juridiction",
      jurisdictionQc: "Québec",
      jurisdictionOther: "Autre juridiction (bientôt disponible)",
      localeLabel: "Langue de la famille",
      schoolYear: (year: string) => `Année scolaire ${year} (1er juillet – 30 juin)`,
    },
    step2: {
      eyebrow: "Ajouter un enfant",
      title: "Qui apprend avec vous ?",
      lead: "Ajoutez au moins un enfant pour continuer. Vous pourrez en ajouter d’autres plus tard.",
      nameLabel: "Prénom de l’enfant",
      namePlaceholder: "Ex. Adam",
      ageLabel: "Tranche d’âge",
      add: "Ajouter cet enfant",
      empty: "Aucun enfant ajouté pour l’instant.",
      remove: "Retirer",
      needOne: "Ajoutez au moins un enfant avant de continuer.",
      nameNeeded: "Le prénom de l’enfant est requis.",
    },
    step3: {
      eyebrow: "Consentement",
      title: "Avant de terminer.",
      lead: "Deux engagements sont nécessaires pour continuer ; le troisième est optionnel.",
      consentLimit: "Je comprends que cette plateforme est un outil de préparation et de suivi : elle ne remplace pas une évaluation officielle du ministère de l’Éducation ni un conseiller juridique.",
      consentAi: "J’accepte que tout contenu généré par l’IA soit vérifié par un parent avant d’être ajouté au parcours d’un enfant.",
      consentCommunity: "Je souhaite recevoir des nouvelles de la communauté locale (pods) — optionnel.",
      requiredError: "Les deux premiers engagements sont requis pour continuer.",
      submit: "Créer ma famille",
      submitting: "Création en cours…",
      submitError: "Une erreur est survenue. Veuillez réessayer.",
    },
    nav: { next: "Continuer", prev: "Précédent" },
    success: {
      eyebrow: "Bienvenue",
      title: (name: string) => `Bienvenue, ${name} !`,
      lead: "Votre famille est prête. Voici un résumé avant de continuer vers votre tableau de bord.",
      jurisdiction: "Juridiction",
      schoolYear: "Année scolaire",
      children: "Enfants",
      cta: "Aller à mon tableau de bord",
    },
  },
  en: {
    back: "← Back to home",
    stepLabel: (step: Step) => `Step ${step} of 3`,
    steps: ["Family", "Children", "Consent"],
    step1: {
      eyebrow: "Create your family",
      title: "Let's start with your family.",
      lead: "This helps us adapt the learning path to your context.",
      nameLabel: "Family name",
      namePlaceholder: "E.g. The Ghorbel family",
      nameError: "Family name is required.",
      jurisdictionLabel: "Jurisdiction",
      jurisdictionQc: "Quebec",
      jurisdictionOther: "Other jurisdiction (coming soon)",
      localeLabel: "Family language",
      schoolYear: (year: string) => `School year ${year} (July 1 – June 30)`,
    },
    step2: {
      eyebrow: "Add a child",
      title: "Who is learning with you?",
      lead: "Add at least one child to continue. You can add more later.",
      nameLabel: "Child's first name",
      namePlaceholder: "E.g. Adam",
      ageLabel: "Age band",
      add: "Add this child",
      empty: "No child added yet.",
      remove: "Remove",
      needOne: "Add at least one child before continuing.",
      nameNeeded: "The child's first name is required.",
    },
    step3: {
      eyebrow: "Consent",
      title: "Before you finish.",
      lead: "Two commitments are required to continue; the third is optional.",
      consentLimit: "I understand this platform is a preparation and tracking tool: it does not replace an official Ministry of Education evaluation or legal advice.",
      consentAi: "I agree that any AI-generated content will be reviewed by a parent before being added to a child's learning path.",
      consentCommunity: "I would like to receive news from the local community (pods) — optional.",
      requiredError: "The first two commitments are required to continue.",
      submit: "Create my family",
      submitting: "Creating…",
      submitError: "Something went wrong. Please try again.",
    },
    nav: { next: "Continue", prev: "Previous" },
    success: {
      eyebrow: "Welcome",
      title: (name: string) => `Welcome, ${name}!`,
      lead: "Your family is ready. Here is a summary before heading to your dashboard.",
      jurisdiction: "Jurisdiction",
      schoolYear: "School year",
      children: "Children",
      cta: "Go to my dashboard",
    },
  },
} as const;

export default function OnboardingPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const t = copy[locale];
  const schoolYear = useMemo(() => currentSchoolYear(), []);

  const [step, setStep] = useState<Step>(1);
  const [familyName, setFamilyName] = useState("");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("quebec");
  const [nameError, setNameError] = useState(false);

  const [children, setChildren] = useState<DraftChild[]>([]);
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState<AgeBand>("6-8");
  const [childListError, setChildListError] = useState("");

  const [consentLimit, setConsentLimit] = useState(false);
  const [consentAi, setConsentAi] = useState(false);
  const [consentCommunity, setConsentCommunity] = useState(false);
  const [consentError, setConsentError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [createdFamily, setCreatedFamily] = useState<{ name: string; jurisdiction: Jurisdiction; schoolYear: string; children: DraftChild[] } | null>(null);

  function goNext() {
    if (step === 1) {
      if (!familyName.trim()) { setNameError(true); return; }
      setNameError(false);
      setStep(2);
      return;
    }
    if (step === 2) {
      if (children.length === 0) { setChildListError(t.step2.needOne); return; }
      setChildListError("");
      setStep(3);
    }
  }

  function goPrev() { if (step > 1) setStep((current) => (current - 1) as Step); }

  function addChild() {
    if (!childName.trim()) { setChildListError(t.step2.nameNeeded); return; }
    setChildren((current) => [...current, { key: `${Date.now()}-${current.length}`, displayName: childName.trim(), ageBand: childAge }]);
    setChildName("");
    setChildListError("");
  }

  function removeChild(key: string) { setChildren((current) => current.filter((child) => child.key !== key)); }

  async function submit() {
    if (!consentLimit || !consentAi) { setConsentError(true); return; }
    setConsentError(false);
    setSubmitting(true);
    setSubmitError(false);
    try {
      const response = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: familyName.trim(), locale, jurisdiction, children: children.map((child) => ({ displayName: child.displayName, ageBand: child.ageBand })) }),
      });
      if (!response.ok) throw new Error("request_failed");
      setCreatedFamily({ name: familyName.trim(), jurisdiction, schoolYear, children });
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitting(false);
    }
  }

  function ageLabel(ageBand: AgeBand) { const band = AGE_BANDS.find((item) => item.id === ageBand)!; return locale === "fr" ? band.labelFr : band.labelEn; }

  if (createdFamily) {
    const s = t.success;
    return <main className="onboarding-shell"><div className="onboarding-card onboarding-success"><p className="onboarding-eyebrow">{s.eyebrow}</p><h1>{s.title(createdFamily.name)}</h1><p className="onboarding-lead">{s.lead}</p><dl className="onboarding-summary"><div><dt>{s.jurisdiction}</dt><dd>{createdFamily.jurisdiction === "quebec" ? t.step1.jurisdictionQc : t.step1.jurisdictionOther}</dd></div><div><dt>{s.schoolYear}</dt><dd>{createdFamily.schoolYear}</dd></div><div><dt>{s.children}</dt><dd>{createdFamily.children.map((child) => `${child.displayName} (${ageLabel(child.ageBand)})`).join(", ")}</dd></div></dl><Link href="/parent" className="onboarding-primary">{s.cta}</Link></div></main>;
  }

  return <main className="onboarding-shell">
    <header className="onboarding-topbar">
      <Link href="/" className="onboarding-brand"><img className="site-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
      <div className="real-language-switch" aria-label={locale === "fr" ? "Choisir la langue" : "Choose language"}>
        <button className={locale === "fr" ? "active" : ""} onClick={() => setLocale("fr")} aria-pressed={locale === "fr"}>Français</button>
        <button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")} aria-pressed={locale === "en"}>English</button>
      </div>
    </header>

    <div className="onboarding-card">
      <div className="onboarding-steps" role="list" aria-label={t.stepLabel(step)}>
        {t.steps.map((label, index) => <div key={label} role="listitem" className={`onboarding-step-dot ${index + 1 === step ? "active" : ""} ${index + 1 < step ? "done" : ""}`}><span>{index + 1 < step ? "✓" : index + 1}</span>{label}</div>)}
      </div>

      {step === 1 && <section>
        <p className="onboarding-eyebrow">{t.step1.eyebrow}</p>
        <h1>{t.step1.title}</h1>
        <p className="onboarding-lead">{t.step1.lead}</p>
        <label className="onboarding-field">{t.step1.nameLabel}<input value={familyName} onChange={(event) => { setFamilyName(event.target.value); setNameError(false); }} placeholder={t.step1.namePlaceholder} aria-invalid={nameError} /></label>
        {nameError && <p className="onboarding-error" role="alert">{t.step1.nameError}</p>}
        <label className="onboarding-field">{t.step1.jurisdictionLabel}<select value={jurisdiction} onChange={(event) => setJurisdiction(event.target.value as Jurisdiction)}><option value="quebec">{t.step1.jurisdictionQc}</option><option value="other" disabled>{t.step1.jurisdictionOther}</option></select></label>
        <p className="onboarding-hint">{t.step1.schoolYear(schoolYear)}</p>
        <div className="onboarding-actions"><span /><button className="onboarding-primary" onClick={goNext}>{t.nav.next} →</button></div>
      </section>}

      {step === 2 && <section>
        <p className="onboarding-eyebrow">{t.step2.eyebrow}</p>
        <h1>{t.step2.title}</h1>
        <p className="onboarding-lead">{t.step2.lead}</p>
        {children.length === 0 ? <p className="onboarding-empty">{t.step2.empty}</p> : <ul className="onboarding-child-list">{children.map((child) => <li key={child.key} className="onboarding-child-chip"><span>{child.displayName}</span><small>{ageLabel(child.ageBand)}</small><button onClick={() => removeChild(child.key)} aria-label={`${t.step2.remove} ${child.displayName}`}>✕</button></li>)}</ul>}
        <div className="onboarding-child-form">
          <label className="onboarding-field">{t.step2.nameLabel}<input value={childName} onChange={(event) => setChildName(event.target.value)} placeholder={t.step2.namePlaceholder} /></label>
          <label className="onboarding-field">{t.step2.ageLabel}<select value={childAge} onChange={(event) => setChildAge(event.target.value as AgeBand)}>{AGE_BANDS.map((band) => <option key={band.id} value={band.id}>{locale === "fr" ? band.labelFr : band.labelEn}</option>)}</select></label>
          <button className="onboarding-secondary" onClick={addChild} type="button">＋ {t.step2.add}</button>
        </div>
        {childListError && <p className="onboarding-error" role="alert">{childListError}</p>}
        <div className="onboarding-actions"><button className="onboarding-ghost" onClick={goPrev}>← {t.nav.prev}</button><button className="onboarding-primary" onClick={goNext}>{t.nav.next} →</button></div>
      </section>}

      {step === 3 && <section>
        <p className="onboarding-eyebrow">{t.step3.eyebrow}</p>
        <h1>{t.step3.title}</h1>
        <p className="onboarding-lead">{t.step3.lead}</p>
        <label className="onboarding-consent"><input type="checkbox" checked={consentLimit} onChange={(event) => { setConsentLimit(event.target.checked); setConsentError(false); }} /><span>{t.step3.consentLimit}</span></label>
        <label className="onboarding-consent"><input type="checkbox" checked={consentAi} onChange={(event) => { setConsentAi(event.target.checked); setConsentError(false); }} /><span>{t.step3.consentAi}</span></label>
        <label className="onboarding-consent optional"><input type="checkbox" checked={consentCommunity} onChange={(event) => setConsentCommunity(event.target.checked)} /><span>{t.step3.consentCommunity}</span></label>
        {consentError && <p className="onboarding-error" role="alert">{t.step3.requiredError}</p>}
        {submitError && <p className="onboarding-error" role="alert">{t.step3.submitError}</p>}
        <div className="onboarding-actions"><button className="onboarding-ghost" onClick={goPrev} disabled={submitting}>← {t.nav.prev}</button><button className="onboarding-primary" onClick={submit} disabled={submitting}>{submitting ? t.step3.submitting : t.step3.submit}</button></div>
      </section>}
    </div>
  </main>;
}
