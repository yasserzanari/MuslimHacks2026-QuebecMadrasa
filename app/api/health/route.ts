import { configuredProviderId } from "@/src/server/ai";
import { DEMO_FAMILY } from "@/src/server/demo-data";
import { getCredits } from "@/src/server/store";

/** Local status: which adapters are wired, without exposing any key or family data. */
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    mode: "local",
    aiProvider: configuredProviderId(),
    /** True only when a key is present; the key itself never leaves the server. */
    aiKeyConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    liveProvider: process.env.LIVE_PROVIDER ?? "mock",
    storage: process.env.STORAGE_PROVIDER ?? "local",
    database: "not-configured",
    demoCreditsAvailable: getCredits(DEMO_FAMILY.id),
  });
}
