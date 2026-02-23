import { APIRequestContext } from "@playwright/test";
import { Logger } from "../../utils/logger";
import { FxErrorResponse } from "../types/fx.types";
import { config } from "../../config/env";

/**
 * Standardized API result wrapper.
 * Ensures all client methods return a consistent structure
 * regardless of endpoint implementation.
 */
type ApiResult<T> = {
  status: number;
  body: T | FxErrorResponse;
  ok: boolean;
};

/**
 * BaseClient centralizes:
 * - HTTP execution
 * - Logging
 * - Retry handling (429 rate limiting)
 * - Error normalization
 *
 * This prevents duplication across API modules and ensures
 * consistent reliability behaviour across all requests.
 */
export class BaseClient {
  constructor(protected request: APIRequestContext) {}

  /**
   * Generic GET method with built-in resilience.
   *
   * Features:
   * - Automatic API key injection
   * - Structured logging (request + response + timing)
   * - 429 retry handling with exponential backoff
   * - Graceful empty-body handling
   *
   * Retries are capped by config.maxAPIRetries.
   */
  protected async get<T>(
    url: string,
    params: Record<string, any> = {},
  ): Promise<ApiResult<T>> {
    let attempt = 0;

    while (true) {
      try {
        if (process.env.API_KEY) params["access_key"] = process.env.API_KEY;
        Logger.info(`GET ${url}`, params);
        const start = Date.now();
        const response = await this.request.get(url, { params });
        const body = await response.json().catch(() => ({}));
        const status = response.status();
        Logger.info(`Request took ${Date.now() - start}ms`);
        Logger.info(`Response ${status} from ${url}`, body);

        /**
         * Retry strategy for HTTP 429 (Rate Limiting):
         *
         * 1. Prefer server-provided "Retry-After" header if present
         * 2. Otherwise fallback to exponential backoff
         *
         * This makes tests resilient while respecting API rate limits.
         */
        if (status === 429 && attempt < config.maxAPIRetries) {
          const retryAfterHeader = response.headers()["retry-after"];
          const delay = retryAfterHeader
            ? parseInt(retryAfterHeader) * 1000
            : config.retryDelayMs * Math.pow(2, attempt);

          Logger.info(
            `429 received. Retrying in ${delay}ms (attempt ${attempt + 1})`,
          );
          await new Promise((res) => setTimeout(res, delay));
          attempt++;
          continue;
        }

        /**
         * If execution reaches here, all retry attempts failed.
         * Explicit failure prevents silent instability.
         */
        if (status === 429 && attempt >= config.maxAPIRetries) {
          throw new Error(`Max retries exceeded for ${url}`);
        }

        return { status, ok: response.ok(), body };
      } catch (error) {
        Logger.error(`Network error calling GET: ${url}`, error);
        throw error;
      }
    }
  }

  /**
   * Generic POST wrapper.
   *
   * Keeps behavior consistent with GET:
   * - API key injection
   * - Timing metrics
   * - Structured logging
   *
   * Note: Retry logic is intentionally not applied here,
   * as POST requests may not be idempotent.
   */
  protected async post(
    url: string,
    body: unknown,
    params: Record<string, any> = {},
  ) {
    try {
      const start = Date.now();
      if (process.env.API_KEY) params["access_key"] = process.env.API_KEY;
      Logger.info(`Post ${url}`, { params, body });
      const response = await this.request.post(url, {
        data: body,
        params,
      });
      const res = await response.json().catch(() => ({})); // handle empty body
      Logger.info(`Request took ${Date.now() - start}ms`);
      Logger.info(`Response ${res.status()} from ${url}`, res);
      return response;
    } catch (error) {
      Logger.error(`Network error calling POST: ${url}`, error);
      throw error;
    }
  }
}
