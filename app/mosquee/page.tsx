"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./mosquee.module.css";

const bars = [62, 75, 69, 82, 77, 91, 86, 74, 88, 94, 83, 96];
const students = [
  { initials: "NA", name: "Nour A.", detail: "2 devoirs en retard", badge: "À relancer", tone: "red" },
  { initials: "YA", name: "Youssef A.", detail: "Demande un accompagnement", badge: "Aide", tone: "" },
  { initials: "SA", name: "Sara B.", detail: "Progression en baisse", badge: "À suivre", tone: "" },
  { initials: "IM", name: "Ilyas M.", detail: "Objectif atteint", badge: "Stable", tone: "green" },
];

export default function MosqueDashboardPage() {
  const [period, setPeriod] = useState("30 jours");
  const [group, setGroup] = useState("Tous les groupes");
  const [hourlyRate, setHourlyRate] = useState(22);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const estimate = useMemo(() => 50 * hourlyRate, [hourlyRate]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2800); };
  const student = students.find((item) => item.name === selectedStudent);

  return <div className={styles.shell}>
    <aside className={styles.sidebar}>
      <Link href="/" className={styles.brand}><Image src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec" width={180} height={50} priority /></Link>
      <p className={styles.navLabel}>Pilotage</p>
      <nav className={styles.nav} aria-label="Navigation mosquée">
        <a className={styles.active} href="#overview"><span className={styles.navIcon}>⌂</span>Vue d’ensemble</a>
        <a href="#students"><span className={styles.navIcon}>♧</span>Élèves</a>
        <a href="#groups"><span className={styles.navIcon}>▦</span>Groupes & activités</a>
        <a href="#people"><span className={styles.navIcon}>◌</span>Tuteurs & bénévoles</a>
        <a href="#impact"><span className={styles.navIcon}>✦</span>Impact</a>
        <button type="button" onClick={() => notify("Les réglages seront disponibles dans le pilote.")}><span className={styles.navIcon}>⚙</span>Réglages du pilote</button>
      </nav>
      <p className={styles.navLabel}>Espace démo</p>
      <div className={styles.sidebarFoot}><strong>Mosquée An-Nour</strong><span>Prototype de démonstration · données fictives</span></div>
    </aside>

    <main className={styles.main} id="overview">
      <header className={styles.topbar}><div className={styles.crumb}>Madrasa Québec <span>→</span> <strong>Tableau de bord mosquée</strong><span className={styles.live}><i /> Pilote actif</span></div><div className={styles.topActions}><button className={styles.iconButton} aria-label="Notifications" onClick={() => notify("Aucune nouvelle notification")}>♢</button><div className={styles.profile}><span>Samira · coordination</span><span className={styles.avatar}>SD</span></div></div></header>

      <section className={styles.hero}><div><p className={styles.eyebrow}>Bonjour Samira · samedi 6 septembre 2026</p><h1>La communauté, en mouvement.</h1><p>Un aperçu simple des élèves qui avancent, des personnes à soutenir et de la capacité libérée pour votre équipe.</p></div><div className={styles.heroActions}><button className={styles.secondary} onClick={() => notify("Rapport préparé pour la période sélectionnée")}>↗ Exporter le rapport</button><button className={styles.primary} onClick={() => notify("Invitation prête à être envoyée")}>+ Inviter un tuteur</button></div></section>

      <section className={styles.filters} aria-label="Filtres du tableau de bord"><span className={styles.filterLabel}>Voir</span><select className={styles.select} aria-label="Groupe" value={group} onChange={(event) => setGroup(event.target.value)}><option>Tous les groupes</option><option>Montreal-Nord · 8-10 ans</option><option>Laval bilingue · 11-13 ans</option><option>Études islamiques · adultes</option></select><select className={styles.select} aria-label="Responsable"><option>Tous les responsables</option><option>Équipe tuteurs</option><option>Bénévoles</option></select><div className={styles.periods}>{["7 jours", "30 jours", "Trimestre"].map((item) => <button key={item} className={period === item ? styles.selected : ""} onClick={() => setPeriod(item)} type="button">{item}</button>)}</div></section>

      <section className={styles.kpis} aria-label="Indicateurs clés">
        {[ ["Élèves inscrits", "128", "↗ 8% vs mois dernier", "♧", ""], ["Élèves actifs", "112", "87% de participation", "◉", ""], ["Progression moyenne", "76%", "+4 pts ce mois-ci", "↗", ""], ["Notes à traiter", "14", "6 prioritaires", "!", "neutral"] ].map(([label, value, meta, icon, tone]) => <article className={styles.kpi} key={label}><div className={styles.kpiTop}><span>{label}</span><span className={styles.kpiIcon}>{icon}</span></div><strong className={styles.kpiValue}>{value}</strong><span className={`${styles.kpiMeta} ${tone === "neutral" ? styles.neutral : ""}`}>{meta}</span></article>)}
      </section>

      <div className={styles.contentGrid} id="students"><section className={styles.card}><div className={styles.cardHeader}><div><h2>Élan d’apprentissage</h2><p>Progression moyenne · {group} · {period}</p></div><button className={styles.textButton} onClick={() => notify("Détail de progression affiché")}>Voir le détail →</button></div><div className={styles.chart} aria-label="Graphique de progression"><div className={styles.axis}><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className={styles.bars}>{bars.map((height, index) => <div className={styles.barGroup} key={index}><span className={`${styles.bar} ${index > 7 ? styles.strong : index % 3 === 0 ? styles.alt : ""}`} style={{ height: `${height}%` }} /><span className={styles.barLabel}>{["L", "M", "M", "J", "V", "S"][index % 6]}</span></div>)}</div></div><div className={styles.chartLegend}><span><i className={styles.dot} />Progression moyenne</span><span><i className={`${styles.dot} ${styles.gold}`} />Objectif du groupe</span></div></section><section className={styles.card}><div className={styles.cardHeader}><div><h2>À accompagner</h2><p>Les prochains gestes utiles</p></div><button className={styles.textButton} onClick={() => notify("Liste complète des suivis ouverte")}>Tout voir</button></div><div className={styles.attention}>{students.map((item) => <button className={styles.attentionItem} key={item.name} onClick={() => setSelectedStudent(item.name)}><span className={styles.person}><span className={styles.miniAvatar}>{item.initials}</span><span><b>{item.name}</b><small>{item.detail}</small></span></span><span className={`${styles.badge} ${item.tone === "red" ? styles.red : item.tone === "green" ? styles.green : ""}`}>{item.badge}</span></button>)}</div></section></div>

      <div className={styles.bottomGrid} id="groups"><section className={styles.card}><div className={styles.cardHeader}><div><h2>Matières à risque</h2><p>Groupes avec le plus grand besoin de soutien</p></div><button className={styles.textButton} onClick={() => notify("Recommandations de soutien ouvertes")}>Planifier un soutien →</button></div><div className={styles.riskList}>{[["⌁", "Mathématiques", "Laval bilingue · 5 élèves", 68], ["▣", "Lecture arabe", "Montreal-Nord · 4 élèves", 54], ["◈", "Mémorisation", "Études islamiques · 3 élèves", 42]].map(([icon, title, detail, score]) => <div className={styles.riskRow} key={String(title)}><span className={styles.riskIcon}>{icon}</span><div><strong>{title}</strong><small>{detail}</small><div className={styles.riskBar}><span style={{ width: `${score}%` }} /></div></div><span className={styles.riskScore}>{score}%</span></div>)}</div></section><section className={styles.card}><div className={styles.cardHeader}><div><h2>Groupes & activités</h2><p>Cette semaine · 9 séances prévues</p></div><button className={styles.textButton} onClick={() => notify("Calendrier des activités ouvert")}>Calendrier →</button></div><div className={styles.groupGrid}>{[["Montreal-Nord", "8-10 ans", "8 / 10", 80], ["Laval bilingue", "11-13 ans", "12 / 14", 86], ["Études islamiques", "Adultes", "18 / 20", 90], ["Cercle parents", "Communauté", "24 inscrits", 72]].map(([title, detail, count, width]) => <div className={styles.group} key={String(title)}><strong>{title}</strong><span>{detail} · {count}</span><div className={styles.groupProgress}><i style={{ width: `${width}%` }} /></div></div>)}</div></section></div>

      <section className={styles.card} id="people" style={{ marginTop: 15 }}><div className={styles.cardHeader}><div><h2>Les personnes derrière le parcours</h2><p>Une petite équipe, un grand effet de levier.</p></div><button className={styles.textButton} onClick={() => notify("Répertoire de l'équipe ouvert")}>Gérer les rôles →</button></div><div className={styles.groupGrid}><div className={styles.group}><strong>8 tuteurs</strong><span>6 actifs cette semaine · 2 disponibilités à confirmer</span></div><div className={styles.group}><strong>14 bénévoles</strong><span>42 h données ce mois-ci · accueil, devoirs, activités</span></div><div className={styles.group}><strong>3 coordinatrices</strong><span>Notes et suivis en attente : 14</span></div><div className={styles.group}><strong>9 activités</strong><span>Prochaine : atelier de lecture · dimanche 10 h</span></div></div></section>

      <section className={styles.impact} id="impact"><div><p className={styles.eyebrow}>Impact du pilote</p><h2>Rendre le temps disponible là où il compte.</h2><p>Ces chiffres sont des estimations de démonstration basées sur des hypothèses éditables. Ils ne représentent ni un revenu garanti ni une promesse de résultat.</p><div className={styles.impactGrid}><div className={styles.impactStat}><strong>50 h</strong><span>économisées par l’IA et les modèles</span></div><div className={styles.impactStat}><strong>42 h</strong><span>de bénévolat coordonné</span></div><div className={styles.impactStat}><strong>112</strong><span>élèves aidés ce mois-ci</span></div></div></div><div className={styles.impactEstimate}><label htmlFor="hourly-rate">Valeur horaire choisie</label><div className={styles.inputRow}><span>$</span><input id="hourly-rate" type="number" min="0" max="200" value={hourlyRate} onChange={(event) => setHourlyRate(Number(event.target.value) || 0)} /><span>/ h</span></div><span className={styles.estimateValue}>${estimate.toLocaleString("fr-CA")}</span><span className={styles.estimateNote}>Estimation de temps libéré · 50 h × taux choisi. À interpréter avec votre équipe.</span></div></section>
      <p className={styles.footerNote}>Prototype Madrasa Québec · données fictives · aucune action administrative réelle</p>
    </main>

    {student && <><button className={styles.drawerBackdrop} aria-label="Fermer le détail élève" onClick={() => setSelectedStudent(null)} /><aside className={styles.drawer} aria-label={`Détail de ${student.name}`}><div className={styles.drawerHeader}><div><p className={styles.eyebrow}>Fiche de suivi</p><h2>{student.name}</h2></div><button className={styles.drawerClose} aria-label="Fermer" onClick={() => setSelectedStudent(null)}>×</button></div><div className={styles.drawerSection}><strong>Signal actuel</strong><p>{student.detail}. Cette vue est un aperçu de démonstration pour préparer une conversation humaine avec la famille ou le tuteur.</p></div><div className={styles.drawerSection}><strong>Prochaine action suggérée</strong><p>Vérifier le dernier travail, écrire une note courte et proposer un créneau de soutien.</p><button className={styles.primary} onClick={() => { setSelectedStudent(null); notify("Note de suivi enregistrée dans la démo"); }}>Ajouter une note</button></div></aside></>}
    {toast && <div className={styles.toast} role="status">{toast}</div>}
  </div>;
}
