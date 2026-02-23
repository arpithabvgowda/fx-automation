import { test } from "./fx.api.fixtures";
import { expect } from "@playwright/test";
import { validateHistoricalRatesResponse } from "./helpers/validateResponse";
import {
  FxErrorResponse,
  HistoricalRatesResponse,
} from "../../src/api/types/fx.types";

test.describe("Fetch historical FX rates API", () => {
  // -----------------------------
  // Positive test: Fetch historical rates for a valid past date
  // -----------------------------
  test("Fetch historical rate", async ({ client }) => {
    const { body, status, ok } = await client.getHistorical(
      "2023-01-01",
      "EUR",
    );
    expect(status).toEqual(200);

    const responseBody = body as HistoricalRatesResponse;
    expect(responseBody.success).toBe(true);
    expect(responseBody.base).toBe("EUR");
    expect(responseBody.rates.USD).toBeDefined();
    expect(responseBody.rates.GBP).toBeDefined();
    validateHistoricalRatesResponse(body); //Schema validation
  });

  // -----------------------------
  // Negative test: Handle invalid input (future date)
  // -----------------------------
  test("Should fail for future date", async ({ client }) => {
    const { body, status, ok } = await client.getHistorical(
      "2035-01-01",
      "EUR",
    );
    const responseBody = body as FxErrorResponse;
    expect(ok).toBe(false);
    expect(status).toEqual(400);
    expect(responseBody.error.code).toEqual("invalid_date");
  });
});
