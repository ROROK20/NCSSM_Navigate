import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against production builds of BOTH stages.
 *
 * Navigate ships as a proposal: it must refuse issue reports and must not
 * present itself as Student Government. But the official behaviour has to keep
 * working, because the day SG adopts it that switch gets flipped and nobody
 * wants to discover the submission path broke months earlier.
 *
 * So two servers, two builds, separate output directories:
 *   :3100  proposal  — what is live today
 *   :3101  official  — what the switch turns on
 */

const PASSWORD = "e2e-editor-password-1234";

const shared = {
  ADMIN_PASSWORD: PASSWORD,
  NAVIGATE_DATA_DIR: ".data-e2e",
};

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: { trace: "retain-on-failure" },

  projects: [
    {
      name: "desktop",
      testIgnore: "**/official/**",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3100" },
    },
    {
      name: "mobile",
      testIgnore: "**/official/**",
      use: { ...devices["Pixel 7"], baseURL: "http://127.0.0.1:3100" },
    },
    {
      name: "official",
      testMatch: "**/official/**",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3101" },
    },
  ],

  webServer: [
    {
      command: "npm run build && npm run start -- --port 3100",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        ...shared,
        NEXT_PUBLIC_NAVIGATE_STAGE: "proposal",
        NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100",
        NEXT_DIST_DIR: ".next-e2e-proposal",
      },
    },
    {
      command: "npm run build && npm run start -- --port 3101",
      url: "http://127.0.0.1:3101",
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        ...shared,
        NEXT_PUBLIC_NAVIGATE_STAGE: "official",
        NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3101",
        NEXT_DIST_DIR: ".next-e2e-official",
      },
    },
  ],
});
