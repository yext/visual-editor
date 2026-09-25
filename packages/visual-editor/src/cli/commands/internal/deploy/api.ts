import { logApiCall } from "./logging.ts";
import type { DeployConfig } from "./config.ts";

export interface YextApiError {
  code: number;
  type: string;
  message: string;
  name: string;
}

interface YextApiResponseJSON {
  response: object;
  meta: {
    errors: YextApiError[];
  };
}

export interface YextApiResponse {
  ok: boolean;
  status: number;
  response: object;
  errors: YextApiError[];
}

const API_PATH_PREFIX = "/v2/";

export async function yextApiRequest(
  logAction: string,
  method: string,
  path: string,
  config: DeployConfig,
  verbose: boolean = false,
  data?: object
): Promise<YextApiResponse> {
  const url = new URL(`${API_PATH_PREFIX}${path}`, config.apiHost);
  url.searchParams.set("v", "20260819");
  url.searchParams.set("api_key", config.apiKey);

  let requestInit: RequestInit = { method: method };
  if (data !== undefined) {
    requestInit.headers = new Headers({
      "content-type": "application/json",
    });
    requestInit.body = JSON.stringify(data);
  }

  const finishLog = logApiCall(logAction, method, url, verbose);

  try {
    const response = await fetch(url, new Request(url, requestInit));
    const responseJson = JSON.parse(
      await response.text()
    ) as YextApiResponseJSON;

    const result: YextApiResponse = {
      ok: response.ok,
      status: response.status,
      response: responseJson.response,
      errors: responseJson.meta.errors.map((error) =>
        redactApiKey(error, config.apiKey)
      ),
    };

    finishLog(
      verbose && result.response
        ? {
            ...result,
            response: redactApiKey(result.response, config.apiKey),
          }
        : result
    );

    return result;
  } catch (error) {
    finishLog();
    if (error instanceof Error) {
      throw new Error(error.message.replaceAll(config.apiKey, "[REDACTED]"));
    }
    throw error;
  }
}

function redactApiKey<T>(value: T, apiKey: string): T {
  if (typeof value === "string") {
    return value.replaceAll(apiKey, "[REDACTED]") as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => redactApiKey(item, apiKey)) as T;
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key.replaceAll(apiKey, "[REDACTED]"),
        redactApiKey(item, apiKey),
      ])
    ) as T;
  }
  return value;
}
