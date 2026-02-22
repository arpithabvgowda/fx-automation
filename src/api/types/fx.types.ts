// -----------------------------------------
// Common
// -----------------------------------------

export interface FxBaseResponse {
  success: boolean;
  timestamp?: number;
  base?: string;
  date?: string;
}

export interface FxError {
  code: number;
  message: string;
}

export interface FxErrorResponse {
  error: FxError;
}

// -----------------------------------------
// /symbols
// -----------------------------------------

export interface SymbolsResponse extends FxBaseResponse {
  symbols: Record<string, string>;
}

// -----------------------------------------
// /latest
// -----------------------------------------

export interface LatestRatesResponse extends FxBaseResponse {
  success: true;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

// -----------------------------------------
// /{date}
// -----------------------------------------

export interface HistoricalRatesResponse extends LatestRatesResponse {}

// -----------------------------------------
// /convert
// -----------------------------------------

export interface ConvertQuery {
  from: string;
  to: string;
  amount: number;
}

export interface ConvertInfo {
  timestamp: number;
  rate: number;
}

export interface ConvertResponse extends FxBaseResponse {
  success: true;
  query: ConvertQuery;
  info: ConvertInfo;
  result: number;
}
