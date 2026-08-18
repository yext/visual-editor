import { PagesHttpRequest, PagesHttpResponse } from "@yext/pages";
import { handlePuckAiRequest } from "../../../../../../packages/visual-editor/src/internal/ai/server.ts";

/**
 * Proxies starter-owned Puck AI requests so local starter dev can serve the
 * same `/api/puck/chat` contract expected by the AI plugin.
 */
export default async function puck(
  request: PagesHttpRequest,
): Promise<PagesHttpResponse> {
  const endpoint = request.pathParams.endpoint;
  if (endpoint !== "chat") {
    return jsonResponse({ error: "Not found" }, 404);
  }

  const response = await handlePuckAiRequest(toFetchRequest(request, endpoint));

  return {
    body: await response.text(),
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
  };
}

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
  endpoint: string,
): Request => {
  const url = new URL(`http://localhost/api/puck/${endpoint}`);

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
    if (!Array.isArray(headerValues)) {
      continue;
    }

    for (const value of headerValues) {
      headers.append(entry[0], value);
    }
  }

  return new Request(url, {
    method: request.method,
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : request.body,
  });
};
