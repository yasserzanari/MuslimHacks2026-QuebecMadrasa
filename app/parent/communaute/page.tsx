"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { communities, type LearningCommunity } from "@/src/domain/communities";
import { ParentSidebar } from "@/app/parent/parent-sidebar";

const nav = [["⌂", "Accueil", "/parent"], ["☷", "Plan de la semaine", "/parent/plan"], ["▣", "Cours", "/parent/cours"], ["✦", "Assistant IA", "#"], ["◌", "Communauté", "/parent/communaute"], ["▤", "Portfolio", "#"], ["◫", "Parcours Québec", "/parent/parcours-quebec"], ["$", "Budget", "/parent/budget"]];

export default function CommunityPage() {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("Tous");
  const [age, setAge] = useState("Tous");
  const [selected, setSelected] = useState<LearningCommunity | null>(null);
  const [joinedId, setJoinedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const visible = useMemo(() => communities.filter((community) => {
    const haystack = `${community.title} ${community.neighborhood} ${community.languages} ${community.activities.join(" ")}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (area === "Tous" || community.neighborhood === area) && (age === "Tous" || community.ages.startsWith(age));
  }), [query, area, age]);
  useEffect(() => { if (selected) window.location.href = `/parent/communaute/${selected.id}`; }, [selected]);

  async function join(community: LearningCommunity) {
    const response = await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "join", communityId: community.id, parentId: "demo-parent", childId: "adam" }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error ?? "Impossible d’envoyer la demande."); return; }
    setJoinedId(community.id); setMessage("Demande envoyée · le responsable vérifiera votre profil avant de partager le lieu exact."); setSelected(community);
  }

  async function leave(community: LearningCommunity) {
    await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "leave", communityId: community.id }) });
    setJoinedId(null); setMessage("Vous avez quitté ce groupe EXTRA.");
  }

  return (
    <main className="app-shell community-shell">
      <ParentSidebar active="community" />
      <section className="community-workspace">
        <header className="community-header"><div><div className="eyebrow">Espace parent · réseau local</div><h1>Communauté / Groupes EXTRA</h1><p>Trouvez ou créez un petit groupe d’apprentissage près de chez vous.</p></div><button className="community-create-button" onClick={() => setShowCreate(true)}>＋&nbsp; Créer un groupe EXTRA</button></header>
        <div className="community-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Trouver un groupe local" aria-label="Trouver un groupe local" /></div>
        <div className="community-filters"><label>Arrondissement<select value={area} onChange={(event) => setArea(event.target.value)}><option>Tous</option><option>Montréal-Nord</option><option>Laval</option><option>Rosemont–La Petite-Patrie</option></select></label><label>Âge<select value={age} onChange={(event) => setAge(event.target.value)}><option>Tous</option><option>6</option><option>7</option><option>8</option></select></label><label>Langue<select><option>Toutes</option><option>Français</option><option>Français, Anglais</option></select></label><label>Horaire<select><option>Tous</option><option>Matin</option><option>Après-midi</option></select></label><label>Budget<select><option>Tous</option><option>100–150 $</option><option>150 $+</option></select></label></div>
        <div className="community-content">
          <section className="community-list"><div className="community-list-top"><span>{visible.length} groupes près de vous</span><label>Trier par <select><option>Récents</option><option>Places disponibles</option><option>Budget</option></select></label></div>
            {visible.map((community) => <article className="community-card" key={community.id}><div className={`community-art ${community.accent}`}><span>{community.accent === "science" ? "⌕" : community.accent === "laval" ? "⌁" : "⌂"}</span><small>{community.neighborhood}</small></div><div className="community-card-main"><div className="community-title-row"><h2>{community.title}</h2>{community.verified && <span className="verified">✓ Profil vérifié</span>}</div><div className="community-facts"><span>♧ Places disponibles : {community.availableSpots} / {community.capacity}</span><span>♙ Âges : {community.ages}</span><span>◌ Langues : {community.languages}</span><span>◷ Horaire : {community.schedule}</span><span>◉ Coût mensuel estimé : {community.budget} $</span></div></div><div className="community-activities"><span>Activités principales</span><div>{community.activities.map((activity) => <b key={activity}>{activity}</b>)}</div></div><div className="community-card-actions"><button className="community-outline" onClick={() => setSelected(community)}>Voir le groupe</button><button className="community-join" onClick={() => join(community)} disabled={joinedId === community.id}>{joinedId === community.id ? "Demande envoyée ✓" : "Demander une place"}</button><span className={joinedId === community.id ? "join-status pending" : "join-status"}>{joinedId === community.id ? "⌛ Vérification en cours" : "✓ Profil vérifié"}</span></div></article>)}
            <button className="community-empty-cta" onClick={() => setShowCreate(true)}>Vous ne trouvez pas ce que vous cherchez ? <strong>Créer un groupe EXTRA&nbsp;›</strong></button>
          </section>
          <aside className="community-rules"><div className="rules-icon">♢</div><h2>Règles de sécurité</h2><p>Notre priorité : assurer un environnement sécuritaire, bienveillant et adapté aux familles.</p>{["Tous les groupes EXTRA sont créés par des parents et vérifiés par notre équipe.", "Les profils sont examinés avant publication.", "Aucune adresse précise n’est partagée publiquement.", "Les coordonnées exactes ne sont partagées qu’après acceptation.", "Vous pouvez quitter un groupe en tout temps."].map((rule) => <div className="rule" key={rule}><b>✓</b><span>{rule}</span></div>)}<div className="rules-note"><b>ⓘ</b><span>Un groupe EXTRA est un petit groupe local organisé par des parents pour des activités éducatives, des projets et des sorties.</span></div><a href="#securite">En savoir plus sur la sécurité&nbsp; ›</a></aside>
        </div>
      </section>
      {message && <div className="toast community-toast" role="status">{message}<button onClick={() => setMessage("")}>×</button></div>}
      {selected && <div className="community-drawer-backdrop" onClick={() => setSelected(null)}><aside className="community-drawer" onClick={(event) => event.stopPropagation()}><button className="drawer-close" onClick={() => setSelected(null)}>×</button><div className={`community-art large ${selected.accent}`}><span>{selected.accent === "science" ? "⌕" : selected.accent === "laval" ? "⌁" : "⌂"}</span><small>{selected.neighborhood}</small></div><span className="verified drawer-verified">✓ Profil vérifié</span><h2>{selected.title}</h2><p className="drawer-description">{selected.description}</p><div className="drawer-details"><b>Pour qui</b><span>{selected.ages} · {selected.languages}</span><b>Horaire</b><span>{selected.schedule}</span><b>Budget indicatif</b><span>{selected.budget} $ / mois</span><b>Responsable</b><span>{selected.host}</span></div>{joinedId === selected.id ? <><div className="joined-panel">✓ Votre demande est en cours de vérification.<small>Le lieu exact sera partagé seulement après acceptation.</small></div><button className="drawer-leave" onClick={() => leave(selected)}>Quitter ce groupe</button></> : <button className="community-join drawer-join" onClick={() => join(selected)}>Demander une place</button>}</aside></div>}
      {showCreate && <div className="community-drawer-backdrop" onClick={() => setShowCreate(false)}><aside className="create-pod" onClick={(event) => event.stopPropagation()}><button className="drawer-close" onClick={() => setShowCreate(false)}>×</button><div className="eyebrow">Nouveau groupe EXTRA</div><h2>Créer un groupe utile aux familles.</h2><p>Votre demande sera vérifiée avant publication. Ne partagez pas encore d’adresse précise.</p><label>Nom du groupe<input placeholder="Ex. Groupe EXTRA Laval sciences" /></label><label>Ville ou arrondissement<input placeholder="Ex. Laval" /></label><label>Activités principales<input placeholder="Ex. sciences, lecture, sorties" /></label><button className="community-join" onClick={async () => { await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "create" }) }); setShowCreate(false); setMessage("Groupe EXTRA envoyé · notre équipe vérifiera les informations avant publication."); }}>Envoyer pour vérification</button></aside></div>}
    </main>
  );
}
