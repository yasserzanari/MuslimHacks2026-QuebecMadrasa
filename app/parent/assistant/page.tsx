import type { Metadata } from "next";

import { childrenOfFamily, DEMO_FAMILY } from "@/src/server/demo-data";
import { getCredits } from "@/src/server/store";
import { configuredProviderId } from "@/src/server/ai";
import { HomeworkStudio } from "@/app/parent/assistant/homework-studio";

/**
 * P06 — Assistant IA parent / Homework Studio.
 *
 * The server page reads the family through the local adapter and hands the client
 * component plain data. No provider key, no tool definition and no other family's data
 * ever crosses this boundary.
 */

export const metadata: Metadata = {
  title: "Assistant IA — Madrasa Québec",
};

export const dynamic = "force-dynamic";

export default function ParentAssistantPage() {
  const children = childrenOfFamily(DEMO_FAMILY.id).map((child) => ({
    id: child.id,
    displayName: child.displayName,
    level: child.level,
  }));

  return (
    <HomeworkStudio
      childProfiles={children}
      familyName={DEMO_FAMILY.name}
      creditsAvailable={getCredits(DEMO_FAMILY.id)}
      providerId={configuredProviderId()}
    />
  );
}
