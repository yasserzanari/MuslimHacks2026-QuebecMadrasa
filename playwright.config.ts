import { defineConfig, devices } from "@playwright/test";

/**
 * Browser QA for the two critical journeys in
 * docs/architecture/07-plan-maitre-pages-et-qa.md.
 *
 * The runner starts the app itself on `AI_PROVIDER=mock`, so the suite needs no key, no
 * network and no real child data — the same generator output every run.
 */

/** Some environments ship Chromium outside Playwright's cache; point at it when they do. */
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  // The journeys share one in-memory queue, so they must not race each other.
  workers: 1,
  fullyParallel: false,
  // CI also writes an HTML report so a failed run can be downloaded and replayed.
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: process.env.APP_BASE_URL ?? "http://localhost:3000",
    ...devices["Desktop Chrome"],
    launchOptions: executablePath ? { executablePath } : {},
    trace: "retain-on-failure",
  },
  webServer: {
    // CI builds in its own step so a build failure is reported as a build failure.
    // Locally the runner builds for you, so `npm run test:e2e` works from a clean checkout.
    command: process.env.CI ? "npm run start" : "npm run build && npm run start",
    url: "http://localhost:3000/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { AI_PROVIDER: "mock" },
  },
});
