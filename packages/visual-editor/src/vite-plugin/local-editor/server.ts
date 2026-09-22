import type { IncomingMessage } from "node:http";
import { getLocalEditorDocument, getLocalEditorManifest } from "./data.ts";
import { MAX_LOCAL_EDITOR_DIRECTORY_CHILD_COUNT } from "./fixtureData.ts";
import { LOCAL_EDITOR_API_BASE_PATH } from "./generatedFiles.ts";
import type { SectionLibraryLayout } from "../../types/sectionLibrary.ts";
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
  response: JsonResponseWriter,
  layouts: SectionLibraryLayout[]
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
    await sendLocalEditorManifestResponse(response, layouts);
    return true;
  }

  if (isLocalEditorDocumentRequest(parsedRequestUrl)) {
    await sendLocalEditorDocumentResponse(response, parsedRequestUrl, layouts);
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

const isPuckAiRequest = (requestUrl: URL): boolean =>
  requestUrl.pathname === "/api/puck/chat" ||
  requestUrl.pathname === "/api/puck/chat/tool";

/** Streams the Puck AI response through the local editor API. */
const sendPuckAiResponse = async (
  request: IncomingMessage,
  response: JsonResponseWriter,
  requestUrl: URL
): Promise<void> => {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      value.forEach((headerValue) => headers.append(key, headerValue));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }

  const chunks: Buffer[] = [];
  if (request.method !== "GET" && request.method !== "HEAD") {
    for await (const chunk of request) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
  }

  const fetchResponse = await handlePuckAiRequest(
    new Request(requestUrl, {
      method: request.method ?? "GET",
      headers,
      body:
        chunks.length > 0 ? Buffer.concat(chunks).toString("utf8") : undefined,
    })
  );
  response.statusCode = fetchResponse.status;
  fetchResponse.headers.forEach((value, key) => response.setHeader(key, value));

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

const sendLocalEditorManifestResponse = async (
  response: JsonResponseWriter,
  layouts: SectionLibraryLayout[]
): Promise<void> => {
  const payload: LocalEditorManifestResponse = await getLocalEditorManifest(
    process.cwd(),
    layouts
  );
  sendJsonResponse(response, payload);
};

const sendLocalEditorDocumentResponse = async (
  response: JsonResponseWriter,
  requestUrl: URL,
  layouts: SectionLibraryLayout[]
): Promise<void> => {
  const payload: LocalEditorDocumentResponse = await getLocalEditorDocument(
    process.cwd(),
    layouts,
    requestUrl.searchParams.get("layoutId") ?? undefined,
    requestUrl.searchParams.get("entityId") ?? undefined,
    requestUrl.searchParams.get("locale") ?? undefined,
    parseDirectoryChildCount(requestUrl.searchParams.get("directoryChildCount"))
  );
  sendJsonResponse(response, payload);
};

const parseDirectoryChildCount = (value: string | null): number | undefined => {
  if (!value || !/^\d+$/.test(value)) {
    return undefined;
  }
  const count = Number(value);
  return Number.isSafeInteger(count) &&
    count <= MAX_LOCAL_EDITOR_DIRECTORY_CHILD_COUNT
    ? count
    : undefined;
};
