import { test as base } from "@playwright/test";
import { FxClient } from "../../src/api/client/fxClient";

// Extend Playwright test to include our client
type FxFixtures = {
  client: FxClient;
};

export const test = base.extend<FxFixtures>({
  client: async ({ request }, use) => {
    const client = new FxClient(request); // automatically uses injected request
    await use(client); // provides client to tests
    // no need to dispose, request fixture handles cleanup
  },
});
