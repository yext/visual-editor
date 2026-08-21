import { getLocalEditorDocument, getLocalEditorManifest } from "./data.ts";
import { LOCAL_EDITOR_API_BASE_PATH } from "./generatedFiles.ts";
import type { SectionLibraryLayout } from "../../sectionLibrary.ts";
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
    requestUrl.searchParams.get("locale") ?? undefined
  );
  sendJsonResponse(response, payload);
};
