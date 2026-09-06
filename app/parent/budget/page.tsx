"use client";

import Link from "next/link";
import { useState } from "react";
import { matchFinancialAid, schoolServiceCenters, servicesForCss, type FamilyProfile } from "@/src/domain/financial-aid";
import { colon } from "@/src/i18n";

type Locale = "fr" | "en";

const nav: [string, string, string, string][] = [
  ["⌂", "Accueil", "Home", "/parent"],
  ["☷", "Plan de la semaine", "Week plan", "/parent/plan"],
  ["▣", "Cours", "Courses", "/parent/cours"],
  ["✦", "Assistant IA", "AI assistant", "/parent/assistant"],
  ["◌", "Communauté", "Community", "/parent/communaute"],
  ["▤", "Portfolio", "Portfolio", "/parent/portfolio"],
  ["◫", "Parcours Québec", "Québec pathway", "/parent/parcours-quebec"],
  ["$", "Budget et bourses", "Budget and aid", "/parent/budget"],
  ["⚙", "Paramètres et sécurité", "Settings and safety", "/parent/settings"],
];
const initial: FamilyProfile = { province: "QC", cssId: "montreal", familyStatus: "couple", annualIncome: 60000, children: [{ age: 10, disabilityTaxCredit: false }], workingOrStudying: true, childcarePaid: false, homeschoolType: "home" };
const officialUrl = "https://www.quebec.ca/education/prescolaire-primaire-et-secondaire/programmes-formations-evaluation/enseignement-maison/services-soutien";

const copy = {
  fr: {
    family: "Famille", private: "Votre espace reste privé.", estimates: "Les résultats sont des estimations à vérifier.",
    eyebrow: "Espace parent · soutien local", title: "Budget / Services gratuits",
    lead: "Identifiez les aides et les services gratuits que votre CSS peut rendre accessibles.",
    updated: "Mis à jour · 5 sept. 2026",
    readFirst: "À lire avant de commencer",
    disclaimer: "Cette page donne une orientation générale, pas une confirmation d’admissibilité. Les services du CSS dépendent de vos besoins, de ses modalités et de ses ressources disponibles. Nous ne transmettons aucune demande à votre place : vérifiez toujours avec votre CSS.",
    step1: "1 · Mon CSS", step2: "2 · Famille", step3: "3 · Résultats",
    onboarding: "Onboarding en 2 minutes", pickCss: "Choisissez votre centre scolaire", tellUs: "Parlez-nous de votre famille",
    cssHelper: "Le CSS ou la commission scolaire de votre territoire est votre premier contact pour demander les services gratuits liés à l’enseignement à la maison.",
    myCss: "Mon centre de services scolaire", network: "réseau", frenchNet: "français", englishNet: "anglais", openCss: "Ouvrir le site du CSS",
    continue: "Continuer", income: "Revenu familial annuel approximatif",
    incomes: ["Moins de 40 000 $", "40 000 à 80 000 $", "80 000 à 120 000 $", "Plus de 120 000 $"],
    status: "Situation familiale", couple: "Couple", single: "Famille monoparentale",
    childAge: "Âge de votre enfant principal", ages: ["4 à 5 ans", "6 à 11 ans", "12 à 17 ans"],
    working: "Je travaille, j’étudie ou je cherche un emploi", childcare: "J’ai payé des frais de garde admissibles",
    back: "Retour", seeResults: "Voir mes résultats", analysing: "Analyse…",
    roadmap: "Votre feuille de route", resultsTitle: "Services gratuits et aides à vérifier",
    confirmed: "les modalités exactes sont confirmées par votre CSS.", editProfile: "Modifier mon profil",
    perQuebec: "Selon le gouvernement du Québec", servicesTitle: "Services professionnels accessibles",
    servicesLead: "Ces services peuvent être gratuits selon les besoins de l’enfant, la disponibilité et les modalités de",
    officialTerms: "Voir les modalités officielles",
    toCheck: "À vérifier", unlikely: "Peu probable", perProfile: "Selon votre profil",
    conditionsToggle: "Voir les conditions et les étapes", mainConditions: "Conditions principales", proposedSteps: "Étapes proposées",
    officialSource: "Ouvrir la source officielle",
    references: "Références", officialQuebec: "modalités officielles du Québec", lastCheck: "Dernière vérification : 5 septembre 2026.",
    error: "Impossible d’analyser le profil.",
  },
  en: {
    family: "Family", private: "Your space stays private.", estimates: "Results are estimates to be verified.",
    eyebrow: "Parent space · local support", title: "Budget / Free services",
    lead: "Find the benefits and free services your school service centre can make available.",
    updated: "Updated · Sept. 5, 2026",
    readFirst: "Read this before you start",
    disclaimer: "This page gives general guidance, not a confirmation of eligibility. The service centre's services depend on your needs, its terms and the resources available. We send no application on your behalf: always check with your service centre.",
    step1: "1 · My centre", step2: "2 · Family", step3: "3 · Results",
    onboarding: "A two-minute start", pickCss: "Choose your school service centre", tellUs: "Tell us about your family",
    cssHelper: "Your local school service centre or school board is your first contact for the free services tied to teaching at home.",
    myCss: "My school service centre", network: "network", frenchNet: "French", englishNet: "English", openCss: "Open the centre's site",
    continue: "Continue", income: "Approximate annual family income",
    incomes: ["Under $40,000", "$40,000 to $80,000", "$80,000 to $120,000", "Over $120,000"],
    status: "Family situation", couple: "Couple", single: "Single-parent family",
    childAge: "Age of your main child", ages: ["4 to 5 years", "6 to 11 years", "12 to 17 years"],
    working: "I work, study or am looking for a job", childcare: "I paid eligible childcare expenses",
    back: "Back", seeResults: "See my results", analysing: "Analysing…",
    roadmap: "Your roadmap", resultsTitle: "Free services and benefits to check",
    confirmed: "the exact terms are confirmed by your service centre.", editProfile: "Edit my profile",
    perQuebec: "According to the Government of Québec", servicesTitle: "Professional services available",
    servicesLead: "These services can be free depending on the child's needs, availability and the terms of",
    officialTerms: "See the official terms",
    toCheck: "To check", unlikely: "Unlikely", perProfile: "Based on your profile",
    conditionsToggle: "See the conditions and the steps", mainConditions: "Main conditions", proposedSteps: "Suggested steps",
    officialSource: "Open the official source",
    references: "References", officialQuebec: "official Québec terms", lastCheck: "Last checked: September 5, 2026.",
    error: "The profile could not be analysed.",
  },
} as const;

export default function BudgetPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [profile, setProfile] = useState(initial);
  const [results, setResults] = useState<ReturnType<typeof matchFinancialAid> | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const t = copy[locale];
  const selectedCss = schoolServiceCenters.find((center) => center.id === profile.cssId);

  async function runMatch(nextLocale: Locale = locale) {
    setLoading(true);
    setError("");
    const response = await fetch("/api/financial-aid", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...profile, locale: nextLocale }) });
    const data = await response.json();
    if (!response.ok) setError(data.error ?? t.error);
    else { setResults(data.results); setStep(4); }
    setLoading(false);
  }

  /* Changer de langue re-demande les résultats : ils sont calculés côté serveur. */
  function switchLocale() {
    const next: Locale = locale === "fr" ? "en" : "fr";
    setLocale(next);
    if (step === 4) runMatch(next);
  }

  return (
    <main className="app-shell financial-shell">
      <aside className="sidebar">
        <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <div className="side-label">{t.family}</div>
        {nav.map(([icon, fr, en, href]) => (
          <Link key={href} className={`side-link ${href === "/parent/budget" ? "active" : ""}`} href={href}><span>{icon}</span><span>{locale === "fr" ? fr : en}</span></Link>
        ))}
        <div className="sidebar-bottom">{t.private}<br />{t.estimates}</div>
      </aside>

      <section className="financial-workspace">
        <header className="financial-header">
          <div><div className="eyebrow">{t.eyebrow}</div><h1>{t.title}</h1><p>{t.lead}</p></div>
          <span className="financial-year">{t.updated}<button className="locale-switch" onClick={switchLocale}>{locale === "fr" ? "EN" : "FR"}</button></span>
        </header>

        <div className="financial-disclaimer"><strong>{t.readFirst}</strong><p>{t.disclaimer}</p></div>

        <div className="financial-progress">
          <span className="current">{t.step1}</span><i />
          <span className={step >= 2 ? "current" : ""}>{t.step2}</span><i />
          <span className={step >= 4 ? "current" : ""}>{t.step3}</span>
        </div>

        {step < 4 ? (
          <section className="financial-card">
            <div className="financial-card-top">
              <span className="financial-icon">⌂</span>
              <div><span className="eyebrow">{t.onboarding}</span><h2>{step === 1 ? t.pickCss : t.tellUs}</h2></div>
            </div>
            {step === 1 ? (
              <div className="financial-form">
                <p className="financial-helper">{t.cssHelper}</p>
                <label>{t.myCss}
                  <select value={profile.cssId} onChange={(event) => setProfile({ ...profile, cssId: event.target.value })}>
                    {schoolServiceCenters.map((center) => <option key={center.id} value={center.id}>{center.name} · {center.region}</option>)}
                  </select>
                </label>
                <div className="css-selected-card">
                  <strong>{selectedCss?.name}</strong>
                  <span>{selectedCss?.region} · {t.network} {selectedCss?.type === "anglophone" ? t.englishNet : t.frenchNet}</span>
                  <a href={selectedCss?.url} target="_blank" rel="noreferrer">{t.openCss} ↗</a>
                </div>
                <button className="button financial-button" onClick={() => setStep(2)}>{t.continue} →</button>
              </div>
            ) : (
              <div className="financial-form">
                <label>{t.income}
                  <select value={profile.annualIncome} onChange={(event) => setProfile({ ...profile, annualIncome: Number(event.target.value) })}>
                    <option value="30000">{t.incomes[0]}</option>
                    <option value="60000">{t.incomes[1]}</option>
                    <option value="100000">{t.incomes[2]}</option>
                    <option value="150000">{t.incomes[3]}</option>
                  </select>
                </label>
                <label>{t.status}
                  <select value={profile.familyStatus} onChange={(event) => setProfile({ ...profile, familyStatus: event.target.value as FamilyProfile["familyStatus"] })}>
                    <option value="couple">{t.couple}</option>
                    <option value="single">{t.single}</option>
                  </select>
                </label>
                <label>{t.childAge}
                  <select value={profile.children[0].age} onChange={(event) => setProfile({ ...profile, children: [{ ...profile.children[0], age: Number(event.target.value) }] })}>
                    <option value="4">{t.ages[0]}</option>
                    <option value="10">{t.ages[1]}</option>
                    <option value="14">{t.ages[2]}</option>
                  </select>
                </label>
                <label className="financial-check"><input type="checkbox" checked={profile.workingOrStudying} onChange={(event) => setProfile({ ...profile, workingOrStudying: event.target.checked })} /> {t.working}</label>
                <label className="financial-check"><input type="checkbox" checked={profile.childcarePaid} onChange={(event) => setProfile({ ...profile, childcarePaid: event.target.checked })} /> {t.childcare}</label>
                <div className="financial-actions">
                  <button className="ghost-button" onClick={() => setStep(1)}>← {t.back}</button>
                  <button className="button financial-button" onClick={() => runMatch()}>{loading ? t.analysing : `${t.seeResults} →`}</button>
                </div>
              </div>
            )}
            {error && <p className="financial-error">{error}</p>}
          </section>
        ) : (
          <section className="financial-results">
            <div className="results-heading">
              <div><div className="eyebrow">{t.roadmap}</div><h2>{t.resultsTitle}</h2><p>{selectedCss?.name} · {t.confirmed}</p></div>
              <button className="ghost-button" onClick={() => setStep(1)}>{t.editProfile}</button>
            </div>

            <section className="free-services-card">
              <div><span className="financial-icon">✓</span><div><span className="eyebrow">{t.perQuebec}</span><h2>{t.servicesTitle}</h2></div></div>
              <p>{t.servicesLead} {selectedCss?.name}.</p>
              <div className="service-grid">
                {servicesForCss(profile.cssId, locale).services.map((service) => (
                  <article key={service.id}><span>✓</span><div><strong>{service.name}</strong><p>{service.modality}</p><small>{service.condition}</small></div></article>
                ))}
              </div>
              <a className="official-link" href={officialUrl} target="_blank" rel="noreferrer">{t.officialTerms} ↗</a>
            </section>

            {results?.map((program) => (
              <article className={`aid-card ${program.eligible ? "eligible" : "not-eligible"}`} key={program.id}>
                <div className="aid-card-heading">
                  <span className="aid-dot">{program.eligible ? "✓" : "–"}</span>
                  <div><h3>{program.name}</h3><small>{program.provider} · {program.category}</small></div>
                  <strong>{program.eligible ? t.toCheck : t.unlikely}</strong>
                </div>
                <p className="aid-amount">{program.amount}</p>
                <p className="aid-estimate">{t.perProfile}{colon(locale)}{program.estimatedAmount}</p>
                <p>{program.reason}</p>
                <details>
                  <summary>{t.conditionsToggle}</summary>
                  <div className="aid-details">
                    <div><b>{t.mainConditions}</b><ul>{program.eligibility.map((item) => <li key={item}>{item}</li>)}</ul></div>
                    <div><b>{t.proposedSteps}</b><ol>{program.steps.map((item) => <li key={item}>{item}</li>)}</ol></div>
                  </div>
                  <p className="aid-caveat">{program.caveat}</p>
                  <a href={program.url} target="_blank" rel="noreferrer">{t.officialSource} ↗</a>
                </details>
              </article>
            ))}
          </section>
        )}

        <footer className="financial-footer">
          {t.references} : <a href={officialUrl} target="_blank" rel="noreferrer">{t.officialQuebec}</a>. {t.lastCheck}
        </footer>
      </section>
    </main>
  );
}
