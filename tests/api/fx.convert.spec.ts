import { test } from "./fx.api.fixtures";
import { expect } from "@playwright/test";
import { ConvertResponse, FxErrorResponse } from "../../src/api/types/fx.types";
import { http, HttpResponse } from "msw";

test.describe("FX Convert API", () => {
  //Positive
  test("Convert currency successfully", async ({ client }) => {
    const { body, status, ok } = await client.convert({
      from: "GBP",
      to: "INR",
      amount: 100,
    });
    expect(status).toBe(200);
    expect(ok).toBe(true);

    const responseBody = body as ConvertResponse;
    expect(responseBody.success).toBeTruthy();
    expect(responseBody.result).toBeGreaterThan(0);
  });

  //Positive
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
    expect(responseBody.result).toBeGreaterThan(100);
  });

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
    expect(responseBody.result).toEqual(10);
  });

  //Negative
  test("Should fail with negative amount", async ({ client }) => {
    const { body, status, ok } = await client.convert({
      from: "GBP",
      to: "INR",
      amount: -100,
    });
    expect(status).toEqual(400);
    expect(ok).toBe(false);
  });

  test("Should fail for invalid base currency", async ({ client }) => {
    const { body, status, ok } = await client.convert({
      from: "XYZ",
      to: "INR",
      amount: 14,
    });
    expect(status).toEqual(400);
    expect(ok).toBe(false);
    const responseBody = body as FxErrorResponse;
    expect(responseBody.error.message).toContain("invalid");
  });

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

  test("should retry on 429 and eventually succeed", async ({
    client,
    msw,
  }) => {
    // 1. Start MSW ONLY for this test
    msw.listen({ onUnhandledRequest: "bypass" });
    let callCount = 0;

    msw.use(
      http.get("*/v1/convert*", () => {
        callCount++;

        if (callCount === 1 || callCount === 2) {
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
      // Call API (Ensure your client actually implements retry logic!)
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
      expect(callCount).toBe(3); // Confirms the retry actually happened
    } finally {
      // 2. Shut it down immediately so other tests use the real network
      msw.resetHandlers();
      msw.close();
    }
  });
});
