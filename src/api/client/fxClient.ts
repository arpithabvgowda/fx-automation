/**
 * FxClient: API client for interacting with FX endpoints.
 * Extends BaseClient to inherit HTTP request methods with retry & logging.
 */
import { BaseClient } from "./baseClient";
import {
  ConvertQuery,
  ConvertResponse,
  HistoricalRatesResponse,
  LatestRatesResponse,
  SymbolsResponse,
} from "../types/fx.types";

export class FxClient extends BaseClient {
  /**
   * Fetch all available currency symbols.
   * @returns SymbolsResponse wrapped in ApiResult from BaseClient.get
   */
  async getSymbols() {
    return this.get<SymbolsResponse>("/v1/symbols");
  }

  /**
   * Fetch latest FX rates for a given base currency and optional symbols.
   * @param base - Base currency (e.g., "EUR"). Optional; defaults to API default.
   * @param symbols - Array of target currencies (e.g., ["USD","GBP"]). Optional.
   * @returns LatestRatesResponse wrapped in ApiResult
   */
  async getLatestRates(base?: string, symbols?: string[]) {
    return this.get<LatestRatesResponse>("/v1/latest", {
      base,
      symbols: symbols?.join(","),
    });
  }

  /**
   * Convert an amount from one currency to another.
   * @param convertInput - Object containing { from, to, amount }
   * @returns ConvertResponse wrapped in ApiResult
   */
  async convert(convertInput: ConvertQuery) {
    return this.get<ConvertResponse>("/v1/convert", {
      ...convertInput,
    });
  }

  /**
   * Fetch historical FX rates for a specific date.
   * @param date - Date string (YYYY-MM-DD)
   * @param base - Base currency (optional)
   * @param symbols - Array of target currencies (optional)
   * @returns HistoricalRatesResponse wrapped in ApiResult
   */
  async getHistorical(date: string, base?: string, symbols?: string[]) {
    return this.get<HistoricalRatesResponse>(`/v1/${date}`, {
      base,
      symbols: symbols?.join(","),
    });
  }
}
