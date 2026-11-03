import type { IncomingMessage } from "node:http";
import { getLocalEditorDocument, getLocalEditorManifest } from "./data.ts";
import { MAX_LOCAL_EDITOR_DIRECTORY_CHILD_COUNT } from "./fixtureData.ts";
import { LOCAL_EDITOR_API_BASE_PATH } from "./generatedFiles.ts";
import type { SectionLibraryLayout } from "../../types/sectionLibrary.ts";
import type {
  LocalEditorDocumentResponse,
  LocalEditorManifestResponse,
} from "./types.ts";

export type JsonResponseWriter = {
  setHeader: (name: string, value: string) => void;
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
  requestUrl: string,
  response: JsonResponseWriter,
  layouts: SectionLibraryLayout[]
): Promise<boolean> => {
  // Return whether this request belonged to the local-editor API so the Vite
  // plugin can fall through to the rest of the middleware stack when needed.
  const parsedRequestUrl = new URL(requestUrl, "http://localhost");

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

type JsonRequestBody =
  | { ok: true; payload: unknown; bodyBytes: number }
  | { ok: false; status: 400 | 413; bodyBytes: number; parseError?: string };

/** Read parsed middleware bodies or bounded UTF-8 streams using the same limits. */
export const readJsonRequestBody = async (
  request: IncomingMessage & { body?: unknown },
  maxBytes: number
): Promise<JsonRequestBody> => {
  let body: string;
  let bodyBytes = 0;
  if (request.body !== undefined) {
    body = Buffer.isBuffer(request.body)
      ? request.body.toString("utf8")
      : typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body);
    bodyBytes = Buffer.byteLength(body, "utf8");
  } else {
    const chunks: Buffer[] = [];
    for await (const chunk of request) {
      const buffer = Buffer.from(chunk);
      bodyBytes += buffer.length;
      if (bodyBytes > maxBytes) return { ok: false, status: 413, bodyBytes };
      chunks.push(buffer);
    }
    body = Buffer.concat(chunks).toString("utf8");
  }
  if (bodyBytes > maxBytes) return { ok: false, status: 413, bodyBytes };
  try {
    return { ok: true, payload: JSON.parse(body), bodyBytes };
  } catch (error) {
    return {
      ok: false,
      status: 400,
      bodyBytes,
      parseError: error instanceof Error ? error.message : String(error),
    };
  }
};

const isLocalEditorManifestRequest = (requestUrl: URL): boolean => {
  return requestUrl.pathname === `${LOCAL_EDITOR_API_BASE_PATH}/manifest`;
};

const isLocalEditorDocumentRequest = (requestUrl: URL): boolean => {
  return requestUrl.pathname === `${LOCAL_EDITOR_API_BASE_PATH}/document`;
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
