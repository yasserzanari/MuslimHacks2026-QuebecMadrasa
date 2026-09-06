"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function ParentSettingsPage() {
  const [locale, setLocale] = useState<"fr" | "en">("fr");

  useEffect(() => {
    const saved = window.localStorage.getItem("madrasa-locale");
    if (saved === "en" || saved === "fr") setLocale(saved);
  }, []);

  function saveLocale(value: "fr" | "en") {
    setLocale(value);
    window.localStorage.setItem("madrasa-locale", value);
    document.documentElement.lang = value;
  }

  const fr = locale === "fr";
  return (
    <main className="app-shell settings-shell">
      <aside className="sidebar">
        <Link className="brand" href="/"><img className="sidebar-logo-image" src="/ui/logo-madrasa-quebec.png" alt="Madrasa Québec Network" /></Link>
        <div className="side-label">{fr ? "Famille" : "Family"}</div>
        <Link className="side-link" href="/parent"><span>⌂</span><span>{fr ? "Accueil" : "Home"}</span></Link>
        <Link className="side-link" href="/parent/plan"><span>☷</span><span>{fr ? "Plan de la semaine" : "Weekly plan"}</span></Link>
        <Link className="side-link" href="/parent/cours"><span>▣</span><span>{fr ? "Cours" : "Courses"}</span></Link>
        <Link className="side-link" href="/parent/assistant"><span>✦</span><span>{fr ? "Assistant IA" : "AI assistant"}</span></Link>
        <Link className="side-link" href="/parent/communaute"><span>◌</span><span>{fr ? "Communauté" : "Community"}</span></Link>
        <Link className="side-link" href="/parent/parcours-quebec"><span>◫</span><span>{fr ? "Parcours Québec" : "Québec path"}</span></Link>
        <Link className="side-link" href="/parent/budget"><span>$</span><span>{fr ? "Budget" : "Budget"}</span></Link>
        <div className="sidebar-bottom">{fr ? "Les préférences sont enregistrées sur cet appareil." : "Preferences are saved on this device."}</div>
      </aside>
      <section className="workspace settings-workspace">
        <div className="workspace-top"><div><div className="eyebrow">{fr ? "Espace parent" : "Parent space"}</div><h1>{fr ? "Paramètres" : "Settings"}</h1></div><Link className="button button-soft" href="/parent">← {fr ? "Retour au dashboard" : "Back to dashboard"}</Link></div>
        <section className="settings-card">
          <div><span className="settings-icon">文</span><div><div className="eyebrow">{fr ? "Préférence d’affichage" : "Display preference"}</div><h2>{fr ? "Langue de l’espace parent" : "Parent space language"}</h2><p>{fr ? "Choisissez la langue utilisée dans votre espace parent." : "Choose the language used in your parent space."}</p></div></div>
          <div className="settings-language"><button className={fr ? "active" : ""} onClick={() => saveLocale("fr")} aria-pressed={fr}>Français</button><button className={!fr ? "active" : ""} onClick={() => saveLocale("en")} aria-pressed={!fr}>English</button></div>
        </section>
        <section className="settings-card settings-info"><span className="settings-icon">✓</span><div><div className="eyebrow">{fr ? "Sécurité" : "Security"}</div><h2>{fr ? "Les données de la famille restent privées." : "Family data stays private."}</h2><p>{fr ? "Les contenus générés par l’IA doivent être vérifiés par un parent avant utilisation." : "AI-generated content must be reviewed by a parent before use."}</p></div></section>
      </section>
    </main>
  );
}
