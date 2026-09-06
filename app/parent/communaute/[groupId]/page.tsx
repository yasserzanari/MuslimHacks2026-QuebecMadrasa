"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { activityLabels, eventTypeLabels, getCommunity, localizeCommunity } from "@/src/domain/communities";

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
const groupImages: Record<string, string> = {
  "montreal-nord": "/ui/groups/montreal-nord.png",
  "laval-bilingue": "/ui/groups/laval-bilingue.png",
  "etudes-islamiques": "/ui/groups/etudes-islamiques.png",
};

const copy = {
  fr: {
    family: "Famille", help: "Besoin d’aide ?", guide: "Consultez notre guide pour les parents",
    back: "Communauté / Groupes EXTRA", eyebrow: "Espace parent · fiche du groupe",
    notFound: "Groupe introuvable", notFoundLead: "Ce groupe n’est plus disponible ou n’existe pas.", backToGroups: "Retour aux groupes EXTRA",
    verified: "Profil vérifié", spot: "place disponible", spots: "places disponibles",
    perChild: "/ enfant / mois", ask: "Demander une place", pending: "Demande en vérification",
    pendingNote: "Le lieu exact sera partagé après acceptation.", leave: "Quitter le groupe",
    nextMeetings: "Les prochaines rencontres", calendar: "Calendrier du groupe", month: "Septembre 2026",
    practise: "Ce que les enfants vont pratiquer", activities: "Activités principales",
    howTitle: "Comment ça se passe",
    how: "Un adulte référent accueille les familles, explique l’activité et partage un court résumé après chaque rencontre. Les enfants utilisent un prénom ou un pseudonyme; aucune adresse privée n’est publiée.",
    priceEyebrow: "Prix simple et transparent", priceTitle: "Où va votre argent ?",
    priceLead: "Le montant est estimatif et sert uniquement au fonctionnement du groupe.",
    total: "Total estimé",
    priceNote: "Aucun paiement n’est pris sur cette page. Les modalités sont confirmées par le responsable.",
    beforeTitle: "Avant de rejoindre",
    before: ["Le profil du responsable est vérifié.", "Le lieu exact est partagé seulement après acceptation.", "Vous pouvez poser vos questions avant de confirmer.", "Vous pouvez quitter le groupe à tout moment."],
    joinSent: "Demande envoyée. Le responsable vérifiera votre profil avant de partager le lieu exact.",
    joinError: "Impossible d’envoyer la demande.", left: "Vous avez quitté ce groupe EXTRA.",
  },
  en: {
    family: "Family", help: "Need help?", guide: "Read our guide for parents",
    back: "Community / EXTRA groups", eyebrow: "Parent space · group profile",
    notFound: "Group not found", notFoundLead: "This group is no longer available or does not exist.", backToGroups: "Back to the EXTRA groups",
    verified: "Verified profile", spot: "place available", spots: "places available",
    perChild: "/ child / month", ask: "Ask for a place", pending: "Request under review",
    pendingNote: "The exact place is shared once the request is accepted.", leave: "Leave the group",
    nextMeetings: "The next meetings", calendar: "Group calendar", month: "September 2026",
    practise: "What the children will practise", activities: "Main activities",
    howTitle: "How it works",
    how: "A lead adult welcomes the families, explains the activity and shares a short summary after each meeting. Children use a first name or a pseudonym; no private address is published.",
    priceEyebrow: "Simple, transparent pricing", priceTitle: "Where does your money go?",
    priceLead: "The amount is an estimate and only covers running the group.",
    total: "Estimated total",
    priceNote: "No payment is taken on this page. The host confirms the arrangements.",
    beforeTitle: "Before you join",
    before: ["The host's profile is verified.", "The exact place is shared only after acceptance.", "You can ask your questions before confirming.", "You can leave the group at any time."],
    joinSent: "Request sent. The host will check your profile before sharing the exact place.",
    joinError: "The request could not be sent.", left: "You have left this EXTRA group.",
  },
} as const;

export default function CommunityDetailPage() {
  const params = useParams<{ groupId: string }>();
  const [locale, setLocale] = useState<Locale>("fr");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const base = getCommunity(params.groupId);
  const t = copy[locale];

  if (!base) {
    return (
      <main className="community-not-found">
        <Link href="/parent/communaute">← {t.backToGroups}</Link>
        <h1>{t.notFound}</h1>
        <p>{t.notFoundLead}</p>
      </main>
    );
  }

  const group = localizeCommunity(base, locale);

  async function joinGroup() {
    const response = await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "join", communityId: group.id, parentId: "demo-parent", childId: "adam" }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error ?? t.joinError); return; }
    setJoined(true);
    setMessage(t.joinSent);
  }

  async function leaveGroup() {
    await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "leave", communityId: group.id }) });
    setJoined(false);
    setMessage(t.left);
  }

  return (
    <main className="app-shell community-detail-shell">
      <aside className="sidebar">
        <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <div className="side-label">{t.family}</div>
        {nav.map(([icon, fr, en, href]) => (
          <Link key={href} className={`side-link ${href === "/parent/communaute" ? "active" : ""}`} href={href}><span>{icon}</span><span>{locale === "fr" ? fr : en}</span></Link>
        ))}
        <div className="sidebar-bottom">🛡️<br /><strong>{t.help}</strong><br />{t.guide}&nbsp;›</div>
      </aside>

      <section className="community-detail-area">
        <header className="community-detail-header">
          <Link href="/parent/communaute">← {t.back}</Link>
          <span>{t.eyebrow}<button className="locale-switch" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>{locale === "fr" ? "EN" : "FR"}</button></span>
        </header>

        <section className="community-detail-hero">
          <div className={`community-art large ${group.accent}`}><img src={groupImages[group.id]} alt="" /><small>{group.neighborhood}</small></div>
          <div className="community-detail-title">
            <div className="verified">✓ {t.verified}</div>
            <h1>{group.title}</h1>
            <p>{group.description}</p>
            <div className="community-detail-meta">
              <span>♧ {group.availableSpots} {group.availableSpots > 1 ? t.spots : t.spot}</span>
              <span>♙ {group.ages}</span>
              <span>◌ {group.languages}</span>
              <span>◷ {group.schedule}</span>
            </div>
          </div>
          <div className="community-detail-action">
            <strong>{group.budget} $ <small>{t.perChild}</small></strong>
            {joined ? (
              <>
                <div className="joined-panel">✓ {t.pending}<small>{t.pendingNote}</small></div>
                <button className="drawer-leave" onClick={leaveGroup}>{t.leave}</button>
              </>
            ) : (
              <button className="community-join" onClick={joinGroup}>{t.ask}</button>
            )}
          </div>
        </section>

        <div className="community-detail-grid">
          <section className="community-detail-main">
            <div className="detail-section-heading">
              <div><span className="eyebrow">{t.nextMeetings}</span><h2>{t.calendar}</h2></div>
              <span className="calendar-caption">{t.month}</span>
            </div>
            <div className="group-calendar">
              {group.events.map((event) => (
                <article key={`${event.date}-${event.title}`} className={`group-event ${event.type === "Islam" ? "islam-event" : ""}`}>
                  <div className="group-event-date">{event.date}</div>
                  <div><span className="event-type">{eventTypeLabels[event.type][locale]}</span><h3>{event.title}</h3><p>{event.description}</p></div>
                  <span className="event-check">○</span>
                </article>
              ))}
            </div>
            <div className="detail-section-heading activities-heading">
              <div><span className="eyebrow">{t.practise}</span><h2>{t.activities}</h2></div>
            </div>
            <div className="detail-activity-list">{group.activities.map((activity) => <span key={activity}>{activityLabels[activity][locale]}</span>)}</div>
            <div className="detail-info-note"><strong>{t.howTitle}</strong><p>{t.how}</p></div>
          </section>

          <aside className="community-detail-side">
            <section className="detail-side-card">
              <span className="eyebrow">{t.priceEyebrow}</span>
              <h2>{t.priceTitle}</h2>
              <p>{t.priceLead}</p>
              {group.budgetBreakdown.map((line) => <div className="budget-line" key={line.label}><span>{line.label}</span><strong>{line.amount} $</strong></div>)}
              <div className="budget-total"><span>{t.total}</span><strong>{group.budget} $</strong></div>
              <small className="budget-footnote">{t.priceNote}</small>
            </section>
            <section className="detail-side-card safety-mini">
              <span className="rules-icon">✓</span>
              <h2>{t.beforeTitle}</h2>
              <ul>{t.before.map((rule) => <li key={rule}>{rule}</li>)}</ul>
            </section>
          </aside>
        </div>

        {message && <div className="toast community-toast" role="status">{message}<button onClick={() => setMessage("")}>×</button></div>}
      </section>
    </main>
  );
}
