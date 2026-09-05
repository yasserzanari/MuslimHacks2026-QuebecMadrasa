import "server-only";

import type { AiProvider } from "@/src/server/ai/provider";
import { configuredProviderId } from "@/src/server/ai/provider";
import { mockProvider } from "@/src/server/ai/mock-provider";

/**
 * Provider selection.
 *
 * The real client is imported lazily so a deployment running on the mock never loads the
 * SDK, and a missing `ANTHROPIC_API_KEY` degrades to the mock instead of crashing a route.
 */
export async function getAiProvider(): Promise<AiProvider> {
  if (configuredProviderId() === "anthropic") {
    const { anthropicProvider } = await import("@/src/server/ai/anthropic-provider");
    return anthropicProvider;
  }
  return mockProvider;
}

export { configuredProviderId };
