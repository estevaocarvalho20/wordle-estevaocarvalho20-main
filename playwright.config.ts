import { defineConfig, devices } from "@playwright/test";

const appRoot =
  process.env.WORDLE_TEST_SOLUTION === "1" ? "../wordle-solution-fixture" : ".";

export default defineConfig({
  globalTimeout: 60000,
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npx vite ${appRoot} --host 127.0.0.1 --port 4174`,
    url: "http://127.0.0.1:4174",
    reuseExistingServer: false,
  },
});
