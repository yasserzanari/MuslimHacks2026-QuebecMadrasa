"use client";

import { useCallback, useEffect, useState } from "react";
import ParentShell, { type ParentLocale } from "@/components/parent/ParentShell";
import { permissionLabels, retentionOptions, type FamilySettings, type PermissionKey } from "@/src/domain/family-settings";
import { colon } from "@/src/i18n";

const permissionKeys = Object.keys(permissionLabels) as PermissionKey[];

const copy = {
  fr: {
    eyebrow: "Espace parent · sécurité de la famille",
    title: "Paramètres et sécurité",
    lead: "Vous décidez de ce que chaque enfant peut utiliser, de ce qui est conservé et de ce qui peut être partagé.",
    permissions: "Permissions par enfant",
    permissionsHelp: "Caméra, micro et partage restent désactivés tant que vous ne les activez pas.",
    screenLimit: "Limite d’écran par jour",
    minutes: "minutes",
    consents: "Consentements",
    consentsHelp: "Chaque consentement indique ce qui est réellement transmis.",
    required: "Requis",
    updated: "Mis à jour",
    retention: "Conservation des données",
    retentionHelp: "Durée au-delà de laquelle les transcriptions et brouillons sont supprimés.",
    days: "jours",
    dataTitle: "Vos données",
    exportLabel: "Exporter les données de la famille",
    exportHelp: "Un fichier JSON lisible, sans donnée réelle d’enfant dans cette démo.",
    exportDone: "Export préparé.",
    deleteLabel: "Supprimer l’espace famille",
    deleteHelp: "Supprime les enfants, les preuves et l’historique. Action définitive.",
    deleteConfirm: "Tapez SUPPRIMER pour confirmer.",
    deleteWord: "SUPPRIMER",
    deleteBlocked: "La suppression n’est pas branchée dans cette démo locale : aucune vraie donnée n’existe encore.",
    cancel: "Annuler",
    loading: "Chargement des paramètres…",
    error: "Les paramètres n’ont pas pu être chargés.",
    retry: "Réessayer",
    saved: "Paramètre enregistré.",
    consentRequired: "Ce consentement est nécessaire au fonctionnement du tuteur.",
    ageBand: { under_13: "12 ans et moins", "13_plus": "13 ans et plus" },
    principles: "Règles appliquées",
    principlesList: [
      "Données d’enfant privées par défaut.",
      "Aucune localisation précise, aucune publicité ciblée.",
      "Permissions vérifiées côté serveur, jamais dans le navigateur.",
      "Séparation stricte entre les familles.",
      "Aucun enregistrement audio ou vidéo par défaut.",
    ],
  },
  en: {
    eyebrow: "Parent space · family safety",
    title: "Settings and safety",
    lead: "You decide what each child can use, what is kept and what may be shared.",
    permissions: "Permissions per child",
    permissionsHelp: "Camera, microphone and sharing stay off until you turn them on.",
    screenLimit: "Daily screen limit",
    minutes: "minutes",
    consents: "Consents",
    consentsHelp: "Each consent states what is actually transmitted.",
    required: "Required",
    updated: "Updated",
    retention: "Data retention",
    retentionHelp: "How long transcripts and drafts are kept before deletion.",
    days: "days",
    dataTitle: "Your data",
    exportLabel: "Export the family data",
    exportHelp: "A readable JSON file, with no real child data in this demo.",
    exportDone: "Export prepared.",
    deleteLabel: "Delete the family space",
    deleteHelp: "Removes children, evidence and history. This cannot be undone.",
    deleteConfirm: "Type DELETE to confirm.",
    deleteWord: "DELETE",
    deleteBlocked: "Deletion is not wired in this local demo: no real data exists yet.",
    cancel: "Cancel",
    loading: "Loading settings…",
    error: "Settings could not be loaded.",
    retry: "Try again",
    saved: "Setting saved.",
    consentRequired: "This consent is required for the tutor to work.",
    ageBand: { under_13: "12 and under", "13_plus": "13 and over" },
    principles: "Rules in force",
    principlesList: [
      "Child data is private by default.",
      "No precise location, no targeted advertising.",
      "Permissions checked on the server, never in the browser.",
      "Strict separation between families.",
      "No audio or video recording by default.",
    ],
  },
} as const;

export default function ParentSettingsPage() {
  const [locale, setLocale] = useState<ParentLocale>("fr");
  const [settings, setSettings] = useState<FamilySettings | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [toast, setToast] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteWord, setDeleteWord] = useState("");
  const t = copy[locale];

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/family-settings");
      if (!response.ok) throw new Error("load_failed");
      const data = await response.json();
      setSettings(data.settings);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(""), 2400); }

  /* Optimistic like the week plan: apply locally, reconcile with the server, restore on refusal. */
  async function patch(body: Record<string, unknown>, optimistic: (current: FamilySettings) => FamilySettings, message = t.saved) {
    const previous = settings;
    setSettings((current) => (current ? optimistic(current) : current));
    const response = await fetch("/api/family-settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setSettings(previous);
      flash(data.error === "consent_required" ? t.consentRequired : t.error);
      return;
    }
    setSettings(data.settings);
    flash(message);
  }

  async function exportData() {
    const response = await fetch("/api/family-settings?export=1");
    const data = await response.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "madrasa-quebec-export.json";
    link.click();
    URL.revokeObjectURL(url);
    flash(t.exportDone);
  }

  return (
    <ParentShell active="settings" locale={locale} onLocaleChange={setLocale} eyebrow={t.eyebrow} title={t.title}>
      <p className="assistant-lead">{t.lead}</p>
      {status === "loading" && <section className="panel-card queue-state">{t.loading}</section>}
      {status === "error" && <section className="panel-card queue-state" role="alert"><p>{t.error}</p><button className="button" onClick={load}>{t.retry}</button></section>}

      {settings && (
        <div className="settings-layout">
          <div className="settings-main">
            <section className="panel-card">
              <span className="panel-kicker">{t.permissions}</span>
              <p className="portfolio-help">{t.permissionsHelp}</p>
              {settings.children.map((child) => (
                <div className="settings-child" key={child.childId}>
                  <div className="settings-child-head"><strong>{child.displayName}</strong><span>{t.ageBand[child.ageBand]}</span></div>
                  <div className="settings-permissions">
                    {permissionKeys.map((key) => (
                      <label className={`settings-toggle ${child.permissions[key] ? "on" : ""}`} key={key}>
                        <input type="checkbox" checked={child.permissions[key]} onChange={(event) => patch({ action: "permission", childId: child.childId, key, value: event.target.checked }, (current) => ({ ...current, children: current.children.map((item) => (item.childId === child.childId ? { ...item, permissions: { ...item.permissions, [key]: event.target.checked } } : item)) }))} />
                        <span><strong>{permissionLabels[key][locale]}</strong><small>{permissionLabels[key][locale === "fr" ? "helpFr" : "helpEn"]}</small></span>
                      </label>
                    ))}
                  </div>
                  <label className="settings-limit">{t.screenLimit}
                    <input type="range" min={15} max={240} step={15} value={child.screenLimitMinutes} onChange={(event) => { const minutes = event.target.value; patch({ action: "screen_limit", childId: child.childId, minutes: Number(minutes) }, (current) => ({ ...current, children: current.children.map((item) => (item.childId === child.childId ? { ...item, screenLimitMinutes: Number(minutes) } : item)) })); }} />
                    <b>{child.screenLimitMinutes} {t.minutes}</b>
                  </label>
                </div>
              ))}
            </section>

            <section className="panel-card">
              <span className="panel-kicker">{t.consents}</span>
              <p className="portfolio-help">{t.consentsHelp}</p>
              {settings.consents.map((consent) => (
                <label className={`settings-consent ${consent.granted ? "on" : ""} ${consent.required ? "locked" : ""}`} key={consent.id} title={consent.required ? t.consentRequired : undefined}>
                  <input type="checkbox" checked={consent.granted} disabled={consent.required} onChange={(event) => patch({ action: "consent", consentId: consent.id, granted: event.target.checked }, (current) => ({ ...current, consents: current.consents.map((item) => (item.id === consent.id ? { ...item, granted: event.target.checked } : item)) }))} />
                  <span>
                    <strong>{locale === "fr" ? consent.labelFr : consent.labelEn}{consent.required && <em className="settings-required">{t.required}</em>}</strong>
                    <small>{locale === "fr" ? consent.detailFr : consent.detailEn}</small>
                    <small className="settings-updated">{t.updated}{colon(locale)}{new Date(consent.updatedAt).toLocaleDateString(locale === "fr" ? "fr-CA" : "en-CA")}</small>
                  </span>
                </label>
              ))}
            </section>
          </div>

          <aside className="settings-side">
            <section className="panel-card">
              <span className="panel-kicker">{t.retention}</span>
              <p className="portfolio-help">{t.retentionHelp}</p>
              <div className="settings-retention">
                {retentionOptions.map((days) => (
                  <button key={days} className={settings.retentionDays === days ? "active" : ""} onClick={() => patch({ action: "retention", days }, (current) => ({ ...current, retentionDays: days }))}>{days} {t.days}</button>
                ))}
              </div>
            </section>

            <section className="panel-card">
              <span className="panel-kicker">{t.dataTitle}</span>
              <button className="button" onClick={exportData}>{t.exportLabel}</button>
              <p className="portfolio-help">{t.exportHelp}</p>
              <hr className="settings-rule" />
              {deleteOpen ? (
                <div className="settings-delete">
                  <p>{t.deleteConfirm}</p>
                  <input value={deleteWord} onChange={(event) => setDeleteWord(event.target.value)} aria-label={t.deleteConfirm} />
                  <div>
                    <button className="button-soft danger" disabled={deleteWord !== t.deleteWord} onClick={() => { flash(t.deleteBlocked); setDeleteOpen(false); setDeleteWord(""); }}>{t.deleteLabel}</button>
                    <button className="button-soft" onClick={() => { setDeleteOpen(false); setDeleteWord(""); }}>{t.cancel}</button>
                  </div>
                </div>
              ) : (
                <>
                  <button className="button-soft danger" onClick={() => setDeleteOpen(true)}>{t.deleteLabel}</button>
                  <p className="portfolio-help">{t.deleteHelp}</p>
                </>
              )}
            </section>

            <section className="panel-card settings-principles">
              <span className="panel-kicker">{t.principles}</span>
              <ul>{t.principlesList.map((rule) => <li key={rule}>{rule}</li>)}</ul>
            </section>
          </aside>
        </div>
      )}
      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </ParentShell>
  );
}
