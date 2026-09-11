import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests run against a production build, because that is what gets
 * deployed and because dev-only behaviour (double effects, overlays) hides real
 * problems. `reuseExistingServer` keeps local runs fast.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run build && npm run start -- --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ADMIN_PASSWORD: "e2e-editor-password-1234",
      NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100",
      NAVIGATE_DATA_DIR: ".data-e2e",
    },
  },
});
