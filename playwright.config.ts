import { defineConfig, devices } from "@playwright/test";

// Portal FFM browser checks. The app under test is an OWNED `next start` on
// :3001 (built from the current tree); Playwright never starts or stops any
// other server. System Chrome is used (channel "chrome"); no browser download.
// Traces/videos are OFF so no signed-in state or credential ever lands in output.
const baseURL = process.env.PORTAL_BASE_URL ?? "http://localhost:3001";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    channel: "chrome",
    trace: "off",
    video: "off",
    screenshot: "off",
  },
  projects: [
    { name: "public", testMatch: /public\..*\.spec\.ts/, use: { ...devices["Desktop Chrome"], channel: "chrome" } },
    { name: "gate-m-public", testMatch: /gate-m\.public\.spec\.ts/, use: { channel: "chrome" } },
    { name: "admin-setup", testMatch: /admin\.setup\.ts/, use: { channel: "chrome" } },
    {
      name: "account",
      testMatch: /account\..*\.spec\.ts/,
      dependencies: ["admin-setup"],
      use: { ...devices["Desktop Chrome"], channel: "chrome", storageState: ".auth/admin.json" },
    },
    {
      // Runs after everything else: the inherited logout ends every session of the account.
      name: "logout",
      testMatch: /logout\.final\.spec\.ts/,
      dependencies: ["account"],
      use: { channel: "chrome", storageState: ".auth/admin.json" },
    },
  ],
});
