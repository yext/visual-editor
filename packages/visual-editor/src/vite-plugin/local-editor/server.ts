import type { IncomingMessage } from "node:http";
import { getLocalEditorDocument, getLocalEditorManifest } from "./data.ts";
import { LOCAL_EDITOR_API_BASE_PATH } from "./generatedFiles.ts";
import { handlePuckAiRequest } from "../../internal/ai/server.ts";
import type {
  LocalEditorDocumentResponse,
  LocalEditorManifestResponse,
} from "./types.ts";

export type JsonResponseWriter = {
  setHeader: (name: string, value: string) => void;
  write: (chunk: string | Uint8Array) => void;
  end: (chunk?: string) => void;
  statusCode: number;
};

/**
 * Handles requests for the local-editor JSON API endpoints.
 *
 * Returns whether the request was handled so the Vite middleware stack can
 * fall through for non-local-editor routes.
 */
export const handleLocalEditorRequest = async (
  request: IncomingMessage,
  response: JsonResponseWriter
): Promise<boolean> => {
  const requestUrl = request.url;
  if (!requestUrl) {
    return false;
  }

  // Return whether this request belonged to the local-editor API so the Vite
  // plugin can fall through to the rest of the middleware stack when needed.
  const parsedRequestUrl = new URL(requestUrl, "http://localhost");

  if (isPuckAiRequest(parsedRequestUrl)) {
    await sendPuckAiResponse(request, response, parsedRequestUrl);
    return true;
  }

  if (isLocalEditorManifestRequest(parsedRequestUrl)) {
    await sendLocalEditorManifestResponse(response);
    return true;
  }

  if (isLocalEditorDocumentRequest(parsedRequestUrl)) {
    await sendLocalEditorDocumentResponse(response, parsedRequestUrl);
    return true;
  }

  return false;
};

/**
 * Writes a JSON response using the minimal response interface needed by the
 * local-editor server hooks.
 */
export const sendJsonResponse = (
  response: JsonResponseWriter,
  payload: unknown,
  statusCode = 200
) => {
  // The local-editor API is intentionally tiny and JSON-only.
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
};

const isLocalEditorManifestRequest = (requestUrl: URL): boolean => {
  return requestUrl.pathname === `${LOCAL_EDITOR_API_BASE_PATH}/manifest`;
};

const isLocalEditorDocumentRequest = (requestUrl: URL): boolean => {
  return requestUrl.pathname === `${LOCAL_EDITOR_API_BASE_PATH}/document`;
};

const isPuckAiRequest = (requestUrl: URL): boolean => {
  return (
    requestUrl.pathname === "/api/puck/chat" ||
    requestUrl.pathname === "/api/puck/chat/tool"
  );
};

const sendLocalEditorManifestResponse = async (
  response: JsonResponseWriter
): Promise<void> => {
  const payload: LocalEditorManifestResponse = await getLocalEditorManifest(
    process.cwd()
  );
  sendJsonResponse(response, payload);
};

const sendLocalEditorDocumentResponse = async (
  response: JsonResponseWriter,
  requestUrl: URL
): Promise<void> => {
  const payload: LocalEditorDocumentResponse = await getLocalEditorDocument(
    process.cwd(),
    requestUrl.searchParams.get("templateId") ?? undefined,
    requestUrl.searchParams.get("entityId") ?? undefined,
    requestUrl.searchParams.get("locale") ?? undefined
  );
  sendJsonResponse(response, payload);
};

const sendPuckAiResponse = async (
  request: IncomingMessage,
  response: JsonResponseWriter,
  requestUrl: URL
): Promise<void> => {
  const fetchRequest = await createFetchRequest(request, requestUrl);
  const fetchResponse = await handlePuckAiRequest(fetchRequest);

  response.statusCode = fetchResponse.status;
  fetchResponse.headers.forEach((value, key) => {
    response.setHeader(key, value);
  });

  if (!fetchResponse.body) {
    response.end();
    return;
  }

  const reader = fetchResponse.body.getReader();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      response.write(value);
    }
  } finally {
    response.end();
  }
};

const createFetchRequest = async (
  request: IncomingMessage,
  requestUrl: URL
): Promise<Request> => {
  const headers = new Headers();

  Object.entries(request.headers).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((headerValue) => headers.append(key, headerValue));
      return;
    }

    if (value !== undefined) {
      headers.set(key, value);
    }
  });

  return new Request(requestUrl, {
    method: request.method ?? "GET",
    headers,
    body:
      request.method === "GET" || request.method === "HEAD"
        ? undefined
        : "body" in request && request.body
          ? JSON.stringify(request.body)
          : await readRequestBody(request),
  });
};

const readRequestBody = async (
  request: IncomingMessage
): Promise<string | undefined> => {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return chunks.length > 0 ? Buffer.concat(chunks).toString("utf8") : undefined;
};
