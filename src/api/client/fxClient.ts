import { BaseClient } from "./baseClient";
import {
  ConvertQuery,
  ConvertResponse,
  HistoricalRatesResponse,
  LatestRatesResponse,
  SymbolsResponse,
} from "../types/fx.types";

export class FxClient extends BaseClient {
  async getSymbols() {
    return this.get<SymbolsResponse>("/v1/symbols");
  }

  async getLatestRates(base?: string, symbols?: string[]) {
    return this.get<LatestRatesResponse>("/v1/latest", {
      base,
      symbols: symbols?.join(","),
    });
  }

  async convert(convertInput: ConvertQuery) {
    return this.get<ConvertResponse>("/v1/convert", {
      ...convertInput,
    });
  }

  async getHistorical(date: string, base?: string, symbols?: string[]) {
    return this.get<HistoricalRatesResponse>(`/v1/${date}`, {
      base,
      symbols: symbols?.join(","),
    });
  }
}
