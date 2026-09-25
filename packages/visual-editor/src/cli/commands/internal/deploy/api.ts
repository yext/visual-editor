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
      errors: responseJson.meta.errors.map((error) => ({
        ...error,
        message: error.message.replaceAll(config.apiKey, "[REDACTED]"),
      })),
    };

    finishLog(
      verbose && result.response
        ? {
            ...result,
            response: JSON.parse(
              JSON.stringify(result.response).replaceAll(
                config.apiKey,
                "[REDACTED]"
              )
            ) as object,
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
