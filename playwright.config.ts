/* -----------------------------------------
   Playwright Test Configuration
------------------------------------------*/

import { defineConfig } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config(); // Initialize environment variables

export default defineConfig({
  // Directory where all test files are located
  testDir: "./tests",

  // Run tests in parallel across files
  fullyParallel: true,

  // Maximum time a single test can run (30 seconds)
  timeout: 30_000,

  // Retry failing tests: 2 retries in CI, 0 locally
  retries: process.env.CI ? 2 : 0,

  // Number of parallel workers in CI, undefined locally (defaults to number of CPU cores)
  workers: process.env.CI ? 2 : undefined,

  // Test reporters
  reporter: [
    ["html"], // HTML report for local viewing
    ["json", { outputFile: "test-results/results.json" }], // JSON output for CI/other tools
  ],

  // Shared settings for all projects
  use: {
    baseURL: process.env.BASE_URL, // Base URL for API or UI tests
    trace: "on-first-retry", // Capture trace only for first retry to debug failures
  },

  // Define separate projects to organize different types of tests
  projects: [
    {
      name: "api", // API tests
      testDir: "./tests/api",
    },
    {
      name: "integration", // Integration tests
      testDir: "./tests/integration",
    },
    {
      name: "ui", // UI/browser tests
      testDir: "./tests/ui",
      use: { browserName: "chromium" }, // Use Chromium for UI tests
    },
  ],
});
