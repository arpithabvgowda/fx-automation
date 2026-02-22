import { APIRequestContext } from "@playwright/test";
import { Logger } from "../../utils/logger";
import { FxErrorResponse } from "../types/fx.types";
import { config } from "../../config/env";

type ApiResult<T> = {
  status: number;
  body: T | FxErrorResponse;
  ok: boolean;
};

export class BaseClient {
  constructor(protected request: APIRequestContext) {}

  protected async get<T>(
    url: string,
    params: Record<string, any> = {}
  ): Promise<ApiResult<T>> {
    let attempt = 0;

    while (attempt <= config.maxAPIRetries) {
      try {
        // Append API key if available
        if (process.env.API_KEY) params["access_key"] = process.env.API_KEY;

        Logger.info(`GET ${url}`, params);
        const start = Date.now();
        const response = await this.request.get(url, { params });
        const body = await response.json().catch(() => ({})); // handle empty body
        const status = response.status();
        Logger.info(`Request took ${Date.now() - start}ms`);
        Logger.info(`Response ${status} from ${url}`, body);

        if (status === 429 && attempt < config.maxAPIRetries) {
          const retryAfterHeader = response.headers()["retry-after"];
          const retryAfterSeconds = retryAfterHeader
            ? parseInt(retryAfterHeader)
            : null;

          const delay = retryAfterSeconds
            ? retryAfterSeconds * 1000
            : config.retryDelayMs * Math.pow(2, attempt);

          Logger.info(
            `429 received. Retrying in ${delay}ms (attempt ${attempt + 1})`
          );
          await new Promise((res) => setTimeout(res, delay));
          attempt++;
          continue;
        }
        return {
          status,
          ok: response.ok(),
          body,
        };
      } catch (error) {
        Logger.error(`Network error calling GET: ${url}`, error);
        throw error;
      }
    }
    throw new Error(`Max retries exceeded for ${url}`);
  }

  protected async post(
    url: string,
    body: unknown,
    params: Record<string, any> = {}
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
