import { schemaValidator } from "../../../src/api/validators/schemaValidator";
import {
  FxErrorResponse,
  LatestRatesResponse,
  ConvertResponse,
  SymbolsResponse,
  HistoricalRatesResponse,
} from "../../../src/api/types/fx.types";

export const validateLatestResponse = (
  body: LatestRatesResponse | FxErrorResponse,
) => {
  if ((body as FxErrorResponse).error) {
    schemaValidator.validate("ApiError", body);
  } else {
    schemaValidator.validate("LatestRatesResponse", body);
  }
};

export const validateHistoricalRatesResponse = (
  body: HistoricalRatesResponse | FxErrorResponse,
) => {
  if ((body as FxErrorResponse).error) {
    schemaValidator.validate("ApiError", body);
  } else {
    schemaValidator.validate("HistoricalRatesResponse", body);
  }
};

export const validateConvertResponse = (
  body: ConvertResponse | FxErrorResponse,
) => {
  if ((body as FxErrorResponse).error) {
    schemaValidator.validate("ApiError", body);
  } else {
    schemaValidator.validate("ConvertResponse", body);
  }
};

export const validateSymbolsResponse = (
  body: SymbolsResponse | FxErrorResponse,
) => {
  if ((body as FxErrorResponse).error) {
    schemaValidator.validate("ApiError", body);
  } else {
    schemaValidator.validate("SymbolsResponse", body);
  }
};
