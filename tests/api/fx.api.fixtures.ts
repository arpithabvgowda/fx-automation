import { test as base } from "@playwright/test";
import { FxClient } from "../../src/api/client/fxClient";
import { server } from "../mocks/server";
import { SetupServer } from "msw/node";

// 1. Fixtures that reset for EVERY test, Extend Playwright test to include our client
type FxFixtures = {
  client: FxClient;
};

// 2. Fixtures that stay alive for the WHOLE WORKER process
type WorkerFixtures = {
  msw: SetupServer;
};

export const test = base.extend<FxFixtures, WorkerFixtures>({
  msw: [
    async ({}, use) => {
      await use(server);
      server.close();
    },
    { scope: "worker" },
  ],
  client: async ({ request }, use) => {
    const client = new FxClient(request); // automatically uses injected request
    await use(client); // provides client to tests
    // no need to dispose, request fixture handles cleanup
  },
});
