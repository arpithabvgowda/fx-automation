/* -----------------------------------------
   Common response structures
------------------------------------------*/

/**
 * Base structure for all FX API responses.
 * Includes common fields like success, timestamp, base currency, and date.
 */
export interface FxBaseResponse {
  success: boolean;
  timestamp?: number; // Unix timestamp of the response (optional)
  base?: string; // Base currency (optional)
  date?: string; // Date of rates (optional)
}

/**
 * Represents a standard FX API error.
 */
export interface FxError {
  code: number; // Error code (e.g., 400, 429)
  message: string; // Human-readable error message
}

/**
 * Response object when an API request fails.
 */
export interface FxErrorResponse {
  error: FxError; // Error payload
}

/* -----------------------------------------
   /symbols endpoint
------------------------------------------*/

/**
 * Response for the /symbols endpoint.
 * Contains a map of currency code => currency name.
 */
export interface SymbolsResponse extends FxBaseResponse {
  symbols: Record<string, string>; // e.g., { USD: "United States Dollar", EUR: "Euro" }
}

/* -----------------------------------------
   /latest endpoint
------------------------------------------*/

/**
 * Response for the /latest endpoint.
 * Includes latest FX rates for a given base currency.
 */
export interface LatestRatesResponse extends FxBaseResponse {
  success: true; // Always true on success
  timestamp: number; // Timestamp of the rates
  base: string; // Base currency
  date: string; // Date of the rates
  rates: Record<string, number>; // Map of currency => rate
}

/* -----------------------------------------
   /{date} historical rates endpoint
------------------------------------------*/

/**
 * Response for the historical FX rates endpoint.
 * Same structure as LatestRatesResponse.
 */
export interface HistoricalRatesResponse extends LatestRatesResponse {}

/* -----------------------------------------
   /convert endpoint
------------------------------------------*/

/**
 * Query parameters for the /convert endpoint.
 */
export interface ConvertQuery {
  from: string; // Source currency
  to: string; // Target currency
  amount: number; // Amount to convert
}

/**
 * Metadata returned for a conversion.
 */
export interface ConvertInfo {
  timestamp: number; // Timestamp of the conversion rate used
  rate: number; // Conversion rate applied
}

/**
 * Response for the /convert endpoint.
 */
export interface ConvertResponse extends FxBaseResponse {
  success: true; // Always true on successful conversion
  query: ConvertQuery; // Original query
  info: ConvertInfo; // Conversion metadata
  result: number; // Conversion result
}
