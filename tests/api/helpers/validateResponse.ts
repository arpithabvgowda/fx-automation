import { schemaValidator } from "../../../src/api/validators/schemaValidator";
import {
  FxErrorResponse,
  LatestRatesResponse,
  ConvertResponse,
  SymbolsResponse,
  HistoricalRatesResponse,
} from "../../../src/api/types/fx.types";

/**
 * Generic schema validation wrapper.
 *
 * If the response contains an `error` field,
 * validate against ApiError schema.
 *
 * Otherwise, validate against the provided success schema.
 */
const validateResponse = (successSchema: string, body: unknown) => {
  const isError = (body as FxErrorResponse)?.error;

  if (isError) {
    schemaValidator.validate("ApiError", body);
  } else {
    schemaValidator.validate(successSchema, body);
  }
};

/**
 * Latest Rates Response Validator
 */
export const validateLatestResponse = (
  body: LatestRatesResponse | FxErrorResponse,
) => {
  validateResponse("LatestRatesResponse", body);
};

/**
 * Historical Rates Response Validator
 */
export const validateHistoricalRatesResponse = (
  body: HistoricalRatesResponse | FxErrorResponse,
) => {
  validateResponse("HistoricalRatesResponse", body);
};

/**
 * Convert Response Validator
 */
export const validateConvertResponse = (
  body: ConvertResponse | FxErrorResponse,
) => {
  validateResponse("ConvertResponse", body);
};

/**
 * Symbols Response Validator
 */
export const validateSymbolsResponse = (
  body: SymbolsResponse | FxErrorResponse,
) => {
  validateResponse("SymbolsResponse", body);
};
