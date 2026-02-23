import { setupServer } from "msw/node";

// Create a singleton MSW server instance
// This server will intercept HTTP requests in your tests and allow you to mock responses
export const server = setupServer();

/*
  1. This server is meant to be used in your test fixtures.
  2. You can attach request handlers using `server.use(...)` in each test.
  3. Typically, you start listening with `server.listen()` before tests and close with `server.close()` after tests.
  4. Using a shared server instance avoids starting/stopping multiple servers for each test, improving test performance.
*/
