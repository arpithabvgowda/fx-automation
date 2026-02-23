// Import the singleton MSW server instance
import { server } from "./server";
import { test } from "@playwright/test";

/*
  ------------------------------
  MSW Test Server Lifecycle Hooks
  ------------------------------
  These hooks control the MSW server for all tests.
  Ensures consistent, isolated mocks and avoids interference between tests.
*/

// 1. Start the server before running any tests
// `onUnhandledRequest: "warn"` logs a warning if a request is made that has no mock handler
test.beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// 2. Reset any request handlers after each test
// This isolates tests so a handler added in one test doesn't affect others
test.afterEach(() => server.resetHandlers());

// 3. Stop the server after all tests finish
// Proper cleanup avoids leaving background processes running
test.afterAll(() => server.close());
