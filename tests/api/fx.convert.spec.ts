import { test } from "./fx.api.fixtures";
import { expect } from "@playwright/test";
import { ConvertResponse, FxErrorResponse } from "../../src/api/types/fx.types";
import { http, HttpResponse } from "msw";

test.describe("FX Convert API", () => {
  // -----------------------------
  // Positive Tests
  // -----------------------------

  // Test a normal conversion between two different currencies
  test("Convert currency successfully", async ({ client }) => {
    const { body, status, ok } = await client.convert({
      from: "GBP",
      to: "INR",
      amount: 100,
    });

    expect(status).toBe(200); // HTTP status code OK
    expect(ok).toBe(true); // Playwright response flag

    const responseBody = body as ConvertResponse;
    expect(responseBody.success).toBeTruthy(); // API-level success flag
    expect(responseBody.result).toBeGreaterThan(0); // Ensure conversion returned a positive value
  });

  // Test decimal conversion values
  test("Convert decimal currency successfully", async ({ client }) => {
    const { body, status, ok } = await client.convert({
      from: "GBP",
      to: "USD",
      amount: 100.23,
    });

    expect(status).toBe(200);
    expect(ok).toBe(true);

    const responseBody = body as ConvertResponse;
    expect(responseBody.success).toBeTruthy();
    expect(responseBody.result).toBeGreaterThan(100); // Decimal should convert correctly
  });

  // Test same-currency conversion (should return the same amount)
  test("Same currency conversion", async ({ client }) => {
    const { body, status, ok } = await client.convert({
      from: "GBP",
      to: "GBP",
      amount: 10,
    });

    expect(status).toBe(200);
    expect(ok).toBe(true);

    const responseBody = body as ConvertResponse;
    expect(responseBody.success).toBeTruthy();
    expect(responseBody.result).toEqual(10); // Identity conversion
  });

  // -----------------------------
  // Negative Tests
  // -----------------------------

  // Test negative amount (invalid)
  test("Should fail with negative amount", async ({ client }) => {
    const { body, status, ok } = await client.convert({
      from: "GBP",
      to: "INR",
      amount: -100,
    });

    expect(status).toEqual(400); // API should reject bad input
    expect(ok).toBe(false);
  });

  // Invalid base currency
  test("Should fail for invalid base currency", async ({ client }) => {
    const { body, status, ok } = await client.convert({
      from: "XYZ",
      to: "INR",
      amount: 14,
    });

    expect(status).toEqual(400);
    expect(ok).toBe(false);

    const responseBody = body as FxErrorResponse;
    expect(responseBody.error.message).toContain("invalid"); // Error message validation
  });

  // Invalid target currency
  test("Should fail for invalid target currency", async ({ client }) => {
    const { body, status, ok } = await client.convert({
      from: "GBP",
      to: "QQQ",
      amount: 45,
    });

    expect(status).toEqual(400);
    expect(ok).toBe(false);

    const responseBody = body as FxErrorResponse;
    expect(responseBody.error.message).toContain("invalid");
  });

  // Test very large amount conversion
  test("Large amount conversion", async ({ client }) => {
    const { body, status, ok } = await client.convert({
      from: "GBP",
      to: "INR",
      amount: 1_000_000_000,
    });

    expect(status).toBe(200);
    expect(ok).toBe(true);

    const responseBody = body as ConvertResponse;
    expect(responseBody.success).toBeTruthy();
  });

  // -----------------------------
  // Retry / Rate-Limit Handling
  // -----------------------------

  test("should retry on 429 and eventually succeed", async ({
    client,
    msw,
  }) => {
    // Start MSW server for this test only
    msw.listen({ onUnhandledRequest: "bypass" });
    let callCount = 0;

    // Mock endpoint with 429 first, then success
    msw.use(
      http.get("*/v1/convert*", () => {
        callCount++;

        if (callCount === 1 || callCount === 2) {
          // Simulate rate limit
          return new HttpResponse(
            JSON.stringify({ error: "Too Many Requests" }),
            {
              status: 429,
              headers: {
                "Content-Type": "application/json",
                "Retry-After": "1", // instruct client how long to wait
              },
            },
          );
        }

        // Success on retry
        return HttpResponse.json({
          success: true,
          query: {
            from: "GBP",
            to: "INR",
            amount: 1000000000,
          },
          info: {
            timestamp: 1771797907,
            rate: 122.422618,
          },
          date: "2026-02-22",
          result: 12,
        });
      }),
    );

    try {
      const { status, ok, body } = await client.convert({
        from: "GBP",
        to: "INR",
        amount: 10234,
      });

      expect(status).toBe(200);
      expect(ok).toBe(true);

      const responseBody = body as ConvertResponse;
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.result).toEqual(12);

      expect(callCount).toBe(3); // Ensure retry actually happened
    } finally {
      // Reset handlers so other tests use real API
      msw.resetHandlers();
      msw.close();
    }
  });

  // Test maximum retry exhaustion
  test("should throw after max retries exceeded", async ({ client, msw }) => {
    msw.listen({ onUnhandledRequest: "bypass" });

    try {
      msw.use(
        http.get(
          "*/v1/convert*",
          () =>
            new HttpResponse(JSON.stringify({ error: "Too Many Requests" }), {
              status: 429,
              headers: { "Retry-After": "0" },
            }),
        ),
      );

      // Should reject after hitting max retry attempts
      await expect(
        client.convert({ from: "GBP", to: "INR", amount: 100 }),
      ).rejects.toThrow("Max retries exceeded");
    } finally {
      msw.resetHandlers();
      msw.close();
    }
  });
});
