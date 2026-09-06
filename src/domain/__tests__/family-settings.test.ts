import { beforeEach, describe, expect, it } from "vitest";
import { buildExport, getSettings, resetSettings, setConsent, setPermission, setRetention, setScreenLimit } from "../family-settings";

describe("paramètres et sécurité", () => {
  beforeEach(() => resetSettings());

  it("keeps the camera off for every child by default", () => {
    expect(getSettings().children.every((child) => child.permissions.camera === false)).toBe(true);
  });

  it("changes a permission for one child only", () => {
    setPermission("adam", "camera", true);
    const settings = getSettings();
    expect(settings.children.find((child) => child.childId === "adam")?.permissions.camera).toBe(true);
    expect(settings.children.find((child) => child.childId === "sara")?.permissions.camera).toBe(false);
  });

  it("refuses an unknown permission or child", () => {
    expect(() => setPermission("adam", "teleportation" as never, true)).toThrow("unknown_permission");
    expect(() => setPermission("inconnu", "camera", true)).toThrow("child_not_found");
  });

  it("keeps the screen limit inside a sane range", () => {
    expect(setScreenLimit("adam", 45).children[0].screenLimitMinutes).toBe(45);
    expect(() => setScreenLimit("adam", 5)).toThrow("invalid_limit");
    expect(() => setScreenLimit("adam", 600)).toThrow("invalid_limit");
  });

  it("cannot revoke a consent the tutor depends on", () => {
    expect(() => setConsent("consent-ai", false)).toThrow("consent_required");
    expect(getSettings().consents.find((consent) => consent.id === "consent-ai")?.granted).toBe(true);
  });

  it("follows the transcripts consent with the transcripts flag", () => {
    expect(getSettings().transcriptsEnabled).toBe(false);
    setConsent("consent-transcripts", true);
    expect(getSettings().transcriptsEnabled).toBe(true);
    setConsent("consent-transcripts", false);
    expect(getSettings().transcriptsEnabled).toBe(false);
  });

  it("only accepts an offered retention window", () => {
    expect(setRetention(180).retentionDays).toBe(180);
    expect(() => setRetention(7)).toThrow("invalid_retention");
  });

  it("exports the family settings without inventing a real child record", () => {
    const dump = buildExport();
    expect(dump.family).toBe("demo-family");
    expect(dump.children).toHaveLength(2);
    expect(JSON.stringify(dump)).not.toContain("@");
  });
});
