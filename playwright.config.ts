import { defineConfig, devices } from "@playwright/test";

/**
 * Tests navigateur.
 *
 * Les fichiers sont nommés `*.e2e.ts` et non `*.spec.ts` : Vitest ramasse
 * `**\/*.spec.ts` par défaut, et les deux runners se marcheraient dessus.
 */
const PORT = 3210;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  outputDir: "./e2e/.results",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        /*
         * Environnements où le navigateur est déjà installé à une autre version
         * que celle épinglée par @playwright/test (conteneurs, CI préchargée) :
         * PLAYWRIGHT_CHROMIUM_PATH pointe vers le binaire à utiliser.
         */
        ...(process.env.PLAYWRIGHT_CHROMIUM_PATH
          ? { launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH } }
          : {}),
      },
    },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
