import { PagesHttpRequest, PagesHttpResponse } from "@yext/pages";
import { handlePuckAiRequest } from "../../../packages/visual-editor/src/internal/ai/server.ts";

const jsonResponse = (
  body: unknown,
  statusCode: number,
): PagesHttpResponse => ({
  body: JSON.stringify(body),
  statusCode,
  headers: {
    "content-type": "application/json",
  },
});

const toFetchRequest = (
  request: PagesHttpRequest,
  endpointPath: string,
): Request => {
  const url = new URL(`http://localhost/api/puck/${endpointPath}`);

  for (const entry of Object.entries(request.queryParams)) {
    const value = entry[1];
    url.searchParams.set(
      entry[0],
      Array.isArray(value) ? (value[0] ?? "") : value,
    );
  }

  const headers = new Headers();
  for (const entry of Object.entries(request.headers)) {
    const headerValues = entry[1];
    if (typeof headerValues === "string") {
      headers.set(entry[0], headerValues);
      continue;
    }

    if (Array.isArray(headerValues)) {
      for (const value of headerValues) {
        headers.append(entry[0], value);
      }
    }
  }
  headers.delete("content-length");

  return new Request(url, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : request.body,
  });
};

/**
 * Proxies starter-owned Puck AI requests so local starter dev can serve the
 * same `/api/puck/*` contract expected by the AI plugin.
 */
export const forwardPuckAiRequest = async (
  request: PagesHttpRequest,
  endpointPath: string,
): Promise<PagesHttpResponse> => {
  const response = await handlePuckAiRequest(
    toFetchRequest(request, endpointPath),
  );

  return {
    body: await response.text(),
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  };
};

export const notFoundResponse = (): PagesHttpResponse => {
  return jsonResponse({ error: "Not found" }, 404);
};
