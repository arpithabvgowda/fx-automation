import { test } from "./fx.api.fixtures";
import { expect } from "@playwright/test";
import { schemaValidator } from "../../src/api/validators/schemaValidator";
import {
  FxErrorResponse,
  ConvertResponse,
  ConvertQuery,
} from "../../src/api/types/fx.types";

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
});
