import { test } from "./fx.api.fixtures";
import { expect } from "@playwright/test";
import { validateLatestResponse } from "./helpers/validateResponse";
import {
  FxErrorResponse,
  LatestRatesResponse,
} from "../../src/api/types/fx.types";
import { http, HttpResponse } from "msw";

test.describe("Latest FX Rates API", () => {
  // Positive test
  test("should return latest rates for EUR", async ({ client }) => {
    const { body, status, ok } = await client.getLatestRates("EUR", [
      "USD",
      "GBP",
    ]);
    expect(status).toBe(200);
    expect(ok).toBe(true);

    const responseBody = body as LatestRatesResponse;
    expect(responseBody.success).toBe(true);
    expect(responseBody.base).toBe("EUR");
    expect(responseBody.rates.USD).toBeDefined();
    expect(responseBody.rates.GBP).toBeDefined();
    validateLatestResponse(body); //Schema validation
  });

  // Negative test
  test("should fail for invalid base currency", async ({ client }) => {
    const { body, status, ok } = await client.getLatestRates("XYZ");
    expect(status).toEqual(400);
    expect(ok).toBe(false);
  });

  // Negative test
  test("should fail for invalid symbol", async ({ client }) => {
    const { body, status, ok } = await client.getLatestRates("EUR", ["XYZ"]);
    expect(status).toEqual(400);
    expect(ok).toBe(false);
    const responseBody = body as FxErrorResponse;
    expect(responseBody.error.message).toContain("invalid Currency");
  });

  // Edge test
  test("should handle many symbols", async ({ client }) => {
    const symbols = ["USD", "GBP", "INR", "JPY", "AUD", "CAD", "CHF", "NZD"];
    const { body, status, ok } = await client.getLatestRates("EUR", symbols);
    expect(status).toBe(200);
    expect(ok).toBe(true);

    const responseBody = body as LatestRatesResponse;
    expect(responseBody.success).toBe(true);
    for (const s of symbols) {
      expect(responseBody.rates[s]).toBeDefined();
    }
    validateLatestResponse(body); //Schema validation
  });

  test("should retry on 429 and eventually succeed", async ({
    client,
    msw,
  }) => {
    // 1. Start MSW ONLY for this test
    msw.listen({ onUnhandledRequest: "bypass" });
    let callCount = 0;

    msw.use(
      http.get("*/v1/latest*", () => {
        callCount++;

        if (callCount === 1) {
          // First call returns 429
          return new HttpResponse(
            JSON.stringify({ error: "Too Many Requests" }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": "1",
              },
            },
          );
        }

        // Second call succeeds
        return HttpResponse.json({
          success: true,
          timestamp: 123456,
          base: "EUR",
          date: "2026-02-22",
          rates: { USD: 1.1, GBP: 0.9 },
        });
      }),
    );

    try {
      // Call API (Ensure your client actually implements retry logic!)
      const { status, ok, body } = await client.getLatestRates("EUR", [
        "USD",
        "GBP",
      ]);

      // Assertions
      expect(status).toBe(200);
      expect(ok).toBe(true);
      const responseBody = body as LatestRatesResponse;
      expect(responseBody.rates.USD).toBe(1.1);
      expect(callCount).toBe(2); // Confirms the retry actually happened
    } finally {
      // 2. Shut it down immediately so other tests use the real network
      msw.resetHandlers();
      msw.close();
    }
  });
});
