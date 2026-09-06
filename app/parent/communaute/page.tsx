"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { activityLabels, communities, localizeCommunity, type LearningCommunity } from "@/src/domain/communities";
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

const copy = {
  fr: {
    family: "Famille", help: "Besoin d’aide ?", guide: "Consultez notre guide pour les parents",
    eyebrow: "Espace parent · réseau local", title: "Communauté / Groupes EXTRA",
    lead: "Trouvez ou créez un petit groupe d’apprentissage près de chez vous.",
    create: "Créer un groupe EXTRA", search: "Trouver un groupe local",
    area: "Arrondissement", age: "Âge", language: "Langue", schedule: "Horaire", budget: "Budget",
    all: "Tous", allF: "Toutes", morning: "Matin", afternoon: "Après-midi",
    near: "groupes près de vous", sortBy: "Trier par", recent: "Récents", spots: "Places disponibles",
    verified: "Profil vérifié", availableSpots: "Places disponibles", ages: "Âges", languages: "Langues",
    scheduleLabel: "Horaire", monthlyCost: "Coût mensuel estimé", mainActivities: "Activités principales",
    view: "Voir le groupe", ask: "Demander une place", sent: "Demande envoyée", checking: "Vérification en cours",
    notFound: "Vous ne trouvez pas ce que vous cherchez ?", rules: "Règles de sécurité",
    rulesLead: "Notre priorité : assurer un environnement sécuritaire, bienveillant et adapté aux familles.",
    ruleList: [
      "Tous les groupes EXTRA sont créés par des parents et vérifiés par notre équipe.",
      "Les profils sont examinés avant publication.",
      "Aucune adresse précise n’est partagée publiquement.",
      "Les coordonnées exactes ne sont partagées qu’après acceptation.",
      "Vous pouvez quitter un groupe en tout temps.",
    ],
    rulesNote: "Un groupe EXTRA est un petit groupe local organisé par des parents pour des activités éducatives, des projets et des sorties.",
    learnMore: "En savoir plus sur la sécurité",
    joinSent: "Demande envoyée · le responsable vérifiera votre profil avant de partager le lieu exact.",
    joinError: "Impossible d’envoyer la demande.", left: "Vous avez quitté ce groupe EXTRA.",
    newGroup: "Nouveau groupe EXTRA", createTitle: "Créer un groupe utile aux familles.",
    createLead: "Votre demande sera vérifiée avant publication. Ne partagez pas encore d’adresse précise.",
    groupName: "Nom du groupe", city: "Ville ou arrondissement", activities: "Activités principales",
    submit: "Envoyer pour vérification",
    created: "Groupe EXTRA envoyé · notre équipe vérifiera les informations avant publication.",
    empty: "Aucun groupe ne correspond à cette recherche.",
  },
  en: {
    family: "Family", help: "Need help?", guide: "Read our guide for parents",
    eyebrow: "Parent space · local network", title: "Community / EXTRA groups",
    lead: "Find or create a small learning group near you.",
    create: "Create an EXTRA group", search: "Find a local group",
    area: "Borough", age: "Age", language: "Language", schedule: "Schedule", budget: "Budget",
    all: "All", allF: "All", morning: "Morning", afternoon: "Afternoon",
    near: "groups near you", sortBy: "Sort by", recent: "Recent", spots: "Available places",
    verified: "Verified profile", availableSpots: "Available places", ages: "Ages", languages: "Languages",
    scheduleLabel: "Schedule", monthlyCost: "Estimated monthly cost", mainActivities: "Main activities",
    view: "View the group", ask: "Ask for a place", sent: "Request sent", checking: "Verification under way",
    notFound: "Cannot find what you are looking for?", rules: "Safety rules",
    rulesLead: "Our priority: a safe, caring environment suited to families.",
    ruleList: [
      "Every EXTRA group is created by parents and checked by our team.",
      "Profiles are reviewed before publication.",
      "No precise address is shared publicly.",
      "Exact details are only shared once a request is accepted.",
      "You can leave a group at any time.",
    ],
    rulesNote: "An EXTRA group is a small local group organised by parents for educational activities, projects and outings.",
    learnMore: "Read more about safety",
    joinSent: "Request sent · the host will check your profile before sharing the exact place.",
    joinError: "The request could not be sent.", left: "You have left this EXTRA group.",
    newGroup: "New EXTRA group", createTitle: "Create a group that helps families.",
    createLead: "Your request is checked before publication. Do not share a precise address yet.",
    groupName: "Group name", city: "City or borough", activities: "Main activities",
    submit: "Send for verification",
    created: "EXTRA group sent · our team will check the details before publishing.",
    empty: "No group matches this search.",
  },
} as const;

export default function CommunityPage() {
  const [locale, setLocale] = useState<Locale>("fr");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("all");
  const [age, setAge] = useState("all");
  const [selected, setSelected] = useState<LearningCommunity | null>(null);
  const [joinedId, setJoinedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const t = copy[locale];

  /* Le filtrage lit les données de référence : les libellés traduits ne changent pas le résultat. */
  const visible = useMemo(() => {
    const matches = communities.filter((community) => {
      const haystack = `${community.title} ${community.en.title} ${community.neighborhood} ${community.languages} ${community.activities.join(" ")}`.toLowerCase();
      return haystack.includes(query.toLowerCase()) && (area === "all" || community.neighborhood === area) && (age === "all" || community.ages.startsWith(age));
    });
    return matches.map((community) => localizeCommunity(community, locale));
  }, [query, area, age, locale]);

  useEffect(() => { if (selected) window.location.href = `/parent/communaute/${selected.id}`; }, [selected]);

  async function join(community: LearningCommunity) {
    const response = await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "join", communityId: community.id, parentId: "demo-parent", childId: "adam" }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error ?? t.joinError); return; }
    setJoinedId(community.id);
    setMessage(t.joinSent);
    setSelected(community);
  }

  async function leave(community: LearningCommunity) {
    await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "leave", communityId: community.id }) });
    setJoinedId(null);
    setMessage(t.left);
  }

  return (
    <main className="app-shell community-shell">
      <aside className="sidebar">
        <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <div className="side-label">{t.family}</div>
        {nav.map(([icon, fr, en, href]) => (
          <Link key={href} className={`side-link ${href === "/parent/communaute" ? "active" : ""}`} href={href}><span>{icon}</span><span>{locale === "fr" ? fr : en}</span></Link>
        ))}
        <div className="sidebar-bottom">🛡️<br /><strong>{t.help}</strong><br />{t.guide}&nbsp;›</div>
      </aside>

      <section className="community-workspace">
        <header className="community-header">
          <div><div className="eyebrow">{t.eyebrow}</div><h1>{t.title}</h1><p>{t.lead}</p></div>
          <div className="community-header-actions">
            <button className="locale-switch" onClick={() => setLocale(locale === "fr" ? "en" : "fr")}>{locale === "fr" ? "EN" : "FR"}</button>
            <button className="community-create-button" onClick={() => setShowCreate(true)}>＋&nbsp; {t.create}</button>
          </div>
        </header>

        <div className="community-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} aria-label={t.search} /></div>

        <div className="community-filters">
          <label>{t.area}<select value={area} onChange={(event) => setArea(event.target.value)}><option value="all">{t.all}</option><option>Montréal-Nord</option><option>Laval</option><option>Saint-Laurent</option></select></label>
          <label>{t.age}<select value={age} onChange={(event) => setAge(event.target.value)}><option value="all">{t.all}</option><option>6</option><option>7</option><option>8</option></select></label>
          <label>{t.language}<select><option>{t.allF}</option><option>{locale === "fr" ? "Français" : "French"}</option><option>{locale === "fr" ? "Français, Anglais" : "French, English"}</option></select></label>
          <label>{t.schedule}<select><option>{t.all}</option><option>{t.morning}</option><option>{t.afternoon}</option></select></label>
          <label>{t.budget}<select><option>{t.all}</option><option>100–150 $</option><option>150 $+</option></select></label>
        </div>

        <div className="community-content">
          <section className="community-list">
            <div className="community-list-top">
              <span>{visible.length} {t.near}</span>
              <label>{t.sortBy} <select><option>{t.recent}</option><option>{t.spots}</option><option>{t.budget}</option></select></label>
            </div>
            {visible.length === 0 && <p className="assistant-empty">{t.empty}</p>}
            {visible.map((community) => (
              <article className="community-card" key={community.id}>
                <div className={`community-art ${community.accent}`}><span>{community.accent === "science" ? "⌕" : community.accent === "laval" ? "⌁" : "⌂"}</span><small>{community.neighborhood}</small></div>
                <div className="community-card-main">
                  <div className="community-title-row"><h2>{community.title}</h2>{community.verified && <span className="verified">✓ {t.verified}</span>}</div>
                  <div className="community-facts">
                    <span>♧ {t.availableSpots}{colon(locale)}{community.availableSpots} / {community.capacity}</span>
                    <span>♙ {t.ages}{colon(locale)}{community.ages}</span>
                    <span>◌ {t.languages}{colon(locale)}{community.languages}</span>
                    <span>◷ {t.scheduleLabel}{colon(locale)}{community.schedule}</span>
                    <span>◉ {t.monthlyCost}{colon(locale)}{community.budget} $</span>
                  </div>
                </div>
                <div className="community-activities">
                  <span>{t.mainActivities}</span>
                  <div>{community.activities.map((activity) => <b key={activity}>{activityLabels[activity][locale]}</b>)}</div>
                </div>
                <div className="community-card-actions">
                  <button className="community-outline" onClick={() => setSelected(community)}>{t.view}</button>
                  <button className="community-join" onClick={() => join(community)} disabled={joinedId === community.id}>{joinedId === community.id ? `${t.sent} ✓` : t.ask}</button>
                  <span className={joinedId === community.id ? "join-status pending" : "join-status"}>{joinedId === community.id ? `⌛ ${t.checking}` : `✓ ${t.verified}`}</span>
                </div>
              </article>
            ))}
            <button className="community-empty-cta" onClick={() => setShowCreate(true)}>{t.notFound} <strong>{t.create}&nbsp;›</strong></button>
          </section>

          <aside className="community-rules">
            <div className="rules-icon">♢</div>
            <h2>{t.rules}</h2>
            <p>{t.rulesLead}</p>
            {t.ruleList.map((rule) => <div className="rule" key={rule}><b>✓</b><span>{rule}</span></div>)}
            <div className="rules-note"><b>ⓘ</b><span>{t.rulesNote}</span></div>
            <a href="#securite">{t.learnMore}&nbsp; ›</a>
          </aside>
        </div>
      </section>

      {message && <div className="toast community-toast" role="status">{message}<button onClick={() => setMessage("")}>×</button></div>}

      {showCreate && (
        <div className="community-drawer-backdrop" onClick={() => setShowCreate(false)}>
          <aside className="create-pod" onClick={(event) => event.stopPropagation()}>
            <button className="drawer-close" onClick={() => setShowCreate(false)}>×</button>
            <div className="eyebrow">{t.newGroup}</div>
            <h2>{t.createTitle}</h2>
            <p>{t.createLead}</p>
            <label>{t.groupName}<input placeholder={locale === "fr" ? "Ex. Groupe EXTRA Laval sciences" : "E.g. EXTRA Laval science group"} /></label>
            <label>{t.city}<input placeholder={locale === "fr" ? "Ex. Laval" : "E.g. Laval"} /></label>
            <label>{t.activities}<input placeholder={locale === "fr" ? "Ex. sciences, lecture, sorties" : "E.g. science, reading, outings"} /></label>
            <button className="community-join" onClick={async () => {
              await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create" }) });
              setShowCreate(false);
              setMessage(t.created);
            }}>{t.submit}</button>
          </aside>
        </div>
      )}
    </main>
  );
}
