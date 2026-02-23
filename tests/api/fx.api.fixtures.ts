import { test as base } from "@playwright/test";
import { FxClient } from "../../src/api/client/fxClient";
import { server } from "../mocks/server";
import { SetupServer } from "msw/node";

/**
 * Test Fixtures Architecture
 *
 * We extend Playwright's base test to inject:
 * - A typed FxClient for API interaction
 * - An MSW mock server for network control
 *
 * This ensures:
 * - Clean dependency injection
 * - Reusable client setup
 * - Controlled mocking per test suite
 */

// Fixtures that reset for EVERY test
// Provides an isolated API client instance
type FxFixtures = {
  client: FxClient;
};

// Fixtures that live for the entire worker lifecycle
// Used for expensive or shared resources (like MSW server)
type WorkerFixtures = {
  msw: SetupServer;
};

export const test = base.extend<FxFixtures, WorkerFixtures>({
  /**
   * MSW Server Fixture (Worker Scope)
   *
   * - Shared across all tests in the worker
   * - Avoids repeated server initialization
   * - Explicitly closed after worker completes
   *
   * Tests can opt-in to mocking by calling:
   *   msw.listen()
   */
  msw: [
    async ({}, use) => {
      await use(server);
      server.close();
    },
    { scope: "worker" },
  ],

  /**
   * API Client Fixture (Test Scope)
   *
   * - Fresh FxClient instance per test
   * - Uses Playwright's built-in APIRequestContext
   * - Ensures isolation between tests
   *
   * Cleanup is automatically handled by Playwright.
   */
  client: async ({ request }, use) => {
    const client = new FxClient(request); // automatically uses injected request
    await use(client); // provides client to tests
    // no need to dispose, request fixture handles cleanup
  },
});
