import { server } from "./server";
import { test } from "@playwright/test";

// Start server before all tests
test.beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset handlers after each test so tests are isolated
test.afterEach(() => server.resetHandlers());

// Stop server after all tests
test.afterAll(() => server.close());
