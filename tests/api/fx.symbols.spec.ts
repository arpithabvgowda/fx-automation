import { test } from "./fx.api.fixtures";
import { expect } from "@playwright/test";
import { validateSymbolsResponse } from "./helpers/validateResponse";
import { SymbolsResponse } from "../../src/api/types/fx.types";

/**
 * Test suite for FX Symbols endpoint.
 *
 * Covers:
 * - Successful symbol retrieval
 * - Authentication failure scenario
 * - Contract validation
 */
test.describe("Get FX Symbols API", () => {
  /**
   * Positive test:
   * Verifies that symbols are returned correctly
   * and response complies with schema contract.
   */
  test("Should return symbols successfully", async ({ client }) => {
    const { body, status, ok } = await client.getSymbols();
    expect(status).toBe(200);

    const responseBody = body as SymbolsResponse;
    expect(responseBody.success).toBeTruthy();
    expect(responseBody.symbols).toHaveProperty("INR");
    validateSymbolsResponse(body);
  });

  /**
   * Negative test:
   * Invalid API key should result in 401 Unauthorized.
   *
   * This ensures authentication is properly enforced
   * and the client does not silently succeed with bad credentials.
   */
  test("Should fail with invalid API key", async ({ client }) => {
    process.env.API_KEY = "INVALID";
    const { body, status, ok } = await client.getSymbols();
    expect(status).toBe(401);
  });
});
