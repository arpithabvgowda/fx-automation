import { test } from "./fx.api.fixtures";
import { expect } from "@playwright/test";
import { schemaValidator } from "../../src/api/validators/schemaValidator";
import { FxErrorResponse, SymbolsResponse } from "../../src/api/types/fx.types";

test.describe("Get FX Symbols API", () => {
  //positive
  test("Should return symbols successfully", async ({ client }) => {
    const { body, status, ok } = await client.getSymbols();
    expect(status).toBe(200);

    const responseBody = body as SymbolsResponse;
    expect(responseBody.success).toBeTruthy();
    expect(responseBody.symbols).toHaveProperty("INR");
  });

  //negative
  test("Should fail with invalid API key", async ({ client }) => {
    process.env.API_KEY = "INVALID";
    const { body, status, ok } = await client.getSymbols();
    expect(status).toBe(401);
  });
});
