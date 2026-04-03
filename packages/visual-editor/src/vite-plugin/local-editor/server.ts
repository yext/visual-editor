import { getLocalEditorDocument, getLocalEditorManifest } from "./data.ts";
import { resolveLocalEditorStreamConfigPath } from "./config.ts";
import { LOCAL_EDITOR_API_BASE_PATH } from "./generatedFiles.ts";
import type {
  LocalEditorDocumentResponse,
  LocalEditorManifestResponse,
  LocalEditorOptions,
} from "./types.ts";

export type JsonResponseWriter = {
  setHeader: (name: string, value: string) => void;
  end: (chunk?: string) => void;
  statusCode: number;
};

type LocalEditorRequestContext = {
  requestUrl: URL;
  streamConfigPath: string;
};

export const createLocalEditorRequestHandler = (
  localEditorOptions?: LocalEditorOptions
) => {
  return async (
    requestUrl: string,
    response: JsonResponseWriter
  ): Promise<boolean> => {
    // Return whether this request belonged to the local-editor API so the Vite
    // plugin can fall through to the rest of the middleware stack when needed.
    const context = await buildLocalEditorRequestContext(
      requestUrl,
      localEditorOptions
    );

    if (isLocalEditorManifestRequest(context.requestUrl)) {
      await sendLocalEditorManifestResponse(response, context);
      return true;
    }

    if (isLocalEditorDocumentRequest(context.requestUrl)) {
      await sendLocalEditorDocumentResponse(response, context);
      return true;
    }

    return false;
  };
};

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

const buildLocalEditorRequestContext = async (
  requestUrl: string,
  localEditorOptions?: LocalEditorOptions
): Promise<LocalEditorRequestContext> => {
  return {
    requestUrl: new URL(requestUrl, "http://localhost"),
    streamConfigPath: await resolveLocalEditorStreamConfigPath(
      process.cwd(),
      localEditorOptions?.streamConfigPath
    ),
  };
};

const isLocalEditorManifestRequest = (requestUrl: URL): boolean => {
  return requestUrl.pathname === `${LOCAL_EDITOR_API_BASE_PATH}/manifest`;
};

const isLocalEditorDocumentRequest = (requestUrl: URL): boolean => {
  return requestUrl.pathname === `${LOCAL_EDITOR_API_BASE_PATH}/document`;
};

const sendLocalEditorManifestResponse = async (
  response: JsonResponseWriter,
  context: LocalEditorRequestContext
): Promise<void> => {
  const payload: LocalEditorManifestResponse = await getLocalEditorManifest(
    process.cwd(),
    context.streamConfigPath
  );
  sendJsonResponse(response, payload);
};

const sendLocalEditorDocumentResponse = async (
  response: JsonResponseWriter,
  context: LocalEditorRequestContext
): Promise<void> => {
  const payload: LocalEditorDocumentResponse = await getLocalEditorDocument(
    process.cwd(),
    context.streamConfigPath,
    context.requestUrl.searchParams.get("templateId") ?? undefined,
    context.requestUrl.searchParams.get("entityId") ?? undefined,
    context.requestUrl.searchParams.get("locale") ?? undefined
  );
  sendJsonResponse(response, payload);
};
