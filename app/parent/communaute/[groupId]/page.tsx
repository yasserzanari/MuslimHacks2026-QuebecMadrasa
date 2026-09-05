"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { getCommunity } from "@/src/domain/communities";

export default function CommunityDetailPage() {
  const params = useParams<{ groupId: string }>();
  const group = getCommunity(params.groupId);
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  if (!group) return <main className="community-not-found"><Link href="/parent/communaute">← Retour aux groupes EXTRA</Link><h1>Groupe introuvable</h1><p>Ce groupe n’est plus disponible ou n’existe pas.</p></main>;
  const currentGroup = group;

  async function joinGroup() {
    const response = await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "join", communityId: currentGroup.id, parentId: "demo-parent", childId: "adam" }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error ?? "Impossible d’envoyer la demande."); return; }
    setJoined(true); setMessage("Demande envoyée. Le responsable vérifiera votre profil avant de partager le lieu exact.");
  }

  async function leaveGroup() { await fetch("/api/communities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "leave", communityId: currentGroup.id }) }); setJoined(false); setMessage("Vous avez quitté ce groupe EXTRA."); }

  return <main className="community-detail-shell"><header className="community-detail-header"><Link href="/parent/communaute">← Communauté / Groupes EXTRA</Link><span>Espace parent · fiche du groupe</span></header><section className="community-detail-hero"><div className={`community-art large ${group.accent}`}><span>{group.accent === "science" ? "⌕" : group.accent === "laval" ? "⌁" : "⌂"}</span><small>{group.neighborhood}</small></div><div className="community-detail-title"><div className="verified">✓ Profil vérifié</div><h1>{group.title}</h1><p>{group.description}</p><div className="community-detail-meta"><span>♧ {group.availableSpots} place{group.availableSpots > 1 ? "s" : ""} disponible{group.availableSpots > 1 ? "s" : ""}</span><span>♙ {group.ages}</span><span>◌ {group.languages}</span><span>◷ {group.schedule}</span></div></div><div className="community-detail-action"><strong>{group.budget} $ <small>/ enfant / mois</small></strong>{joined ? <><div className="joined-panel">✓ Demande en vérification<small>Le lieu exact sera partagé après acceptation.</small></div><button className="drawer-leave" onClick={leaveGroup}>Quitter le groupe</button></> : <button className="community-join" onClick={joinGroup}>Demander une place</button>}</div></section><div className="community-detail-grid"><section className="community-detail-main"><div className="detail-section-heading"><div><span className="eyebrow">Les prochaines rencontres</span><h2>Calendrier du groupe</h2></div><span className="calendar-caption">Septembre 2026</span></div><div className="group-calendar">{group.events.map((event) => <article key={`${event.date}-${event.title}`} className={`group-event ${event.type === "Islam" ? "islam-event" : ""}`}><div className="group-event-date">{event.date}</div><div><span className="event-type">{event.type}</span><h3>{event.title}</h3><p>{event.description}</p></div><span className="event-check">○</span></article>)}</div><div className="detail-section-heading activities-heading"><div><span className="eyebrow">Ce que les enfants vont pratiquer</span><h2>Activités principales</h2></div></div><div className="detail-activity-list">{group.activities.map((activity) => <span key={activity}>{activity}</span>)}</div><div className="detail-info-note"><strong>Comment ça se passe</strong><p>Un adulte référent accueille les familles, explique l’activité et partage un court résumé après chaque rencontre. Les enfants utilisent un prénom ou un pseudonyme; aucune adresse privée n’est publiée.</p></div></section><aside className="community-detail-side"><section className="detail-side-card"><span className="eyebrow">Prix simple et transparent</span><h2>Où va votre argent ?</h2><p>Le montant est estimatif et sert uniquement au fonctionnement du groupe.</p>{group.budgetBreakdown.map((line) => <div className="budget-line" key={line.label}><span>{line.label}</span><strong>{line.amount} $</strong></div>)}<div className="budget-total"><span>Total estimé</span><strong>{group.budget} $</strong></div><small className="budget-footnote">Aucun paiement n’est pris sur cette page. Les modalités sont confirmées par le responsable.</small></section><section className="detail-side-card safety-mini"><span className="rules-icon">✓</span><h2>Avant de rejoindre</h2><ul><li>Le profil du responsable est vérifié.</li><li>Le lieu exact est partagé seulement après acceptation.</li><li>Vous pouvez poser vos questions avant de confirmer.</li><li>Vous pouvez quitter le groupe à tout moment.</li></ul></section></aside></div>{message && <div className="toast community-toast" role="status">{message}<button onClick={() => setMessage("")}>×</button></div>}</main>;
}
