import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html"], ["json", { outputFile: "test-results/results.json" }]],
  use: {
    baseURL: process.env.BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "api",
      testDir: "./tests/api",
    },
    {
      name: "integration",
      testDir: "./tests/integration",
    },
    {
      name: "ui",
      testDir: "./tests/ui",
      use: { browserName: "chromium" },
    },
  ],
});
