import { test } from "./fx.api.fixtures";
import { expect } from "@playwright/test";
import { schemaValidator } from "../../src/api/validators/schemaValidator";
import {
  FxErrorResponse,
  LatestRatesResponse,
} from "../../src/api/types/fx.types";

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
  });

  // Negative test
  test("should fail for invalid base currency", async ({ client }) => {
    const { body, status, ok } = await client.getLatestRates("INVALID");
    expect(status).toEqual(400);
    expect(ok).toBe(false);
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
  });
});
