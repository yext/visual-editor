import type { GenerationResponse } from "../internal/layoutGeneration/transport/messageTransport.ts";
import {
  isTransportStatus,
  ModelTransportError,
  type ModelRequestBody,
} from "../internal/layoutGeneration/transport/modelTransport.ts";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Validate the prepared envelope without rewriting prompts or provider schemas. */
const isRequestBody = (value: unknown): value is ModelRequestBody => {
  if (!isRecord(value)) {
    return false;
  }
  const format = isRecord(value.text) ? value.text.format : undefined;
  return (
    typeof value.model === "string" &&
    value.model.trim().length > 0 &&
    value.stream === true &&
    Number.isInteger(value.max_output_tokens) &&
    (value.max_output_tokens as number) > 0 &&
    typeof value.instructions === "string" &&
    Array.isArray(value.input) &&
    value.input.every(
      (message) =>
        isRecord(message) &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string"
    ) &&
    isRecord(format) &&
    format.type === "json_schema" &&
    typeof format.name === "string" &&
    format.name.length > 0 &&
    format.strict === true &&
    isRecord(format.schema)
  );
};

type ActiveRequest = {
  controller: AbortController;
  reader?: ReadableStreamDefaultReader<Uint8Array>;
};

/** Same-window counterpart to the platform host; HTTP forwarding lives here only. */
export const installLocalGenerationHost = (endpoint: string): (() => void) => {
  const origin = window.location.origin;
  const active = new Map<string, ActiveRequest>();
  const send = (payload: GenerationResponse["payload"]) =>
    window.postMessage({ type: "aiPageGenerationResponse", payload }, origin);
  const cancel = (requestId: string) => {
    const request = active.get(requestId);
    if (!request) {
      return;
    }
    active.delete(requestId);
    request.controller.abort();
    void request.reader?.cancel().catch(() => {});
  };
  const forward = async (requestId: string, body: ModelRequestBody) => {
    const request: ActiveRequest = { controller: new AbortController() };
    active.set(requestId, request);
    const respond = (payload: GenerationResponse["payload"]) => {
      if (!request.controller.signal.aborted) {
        send(payload);
      }
    };
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Visual-Editor-Correlation-Id": requestId,
        },
        body: JSON.stringify(body),
        signal: request.controller.signal,
      });
      if (request.controller.signal.aborted) {
        await response.body?.cancel();
        return;
      }
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new ModelTransportError(
          typeof result?.error === "string"
            ? result.error
            : `AI gateway HTTP ${response.status}.`,
          isTransportStatus(response.status),
          response.status
        );
      }
      if (!response.body) {
        throw new ModelTransportError(
          "The gateway returned no response body.",
          true
        );
      }
      request.reader = response.body.getReader();
      respond({
        requestId,
        event: "start",
        contentType: response.headers.get("Content-Type") || "application/json",
      });
      while (!request.controller.signal.aborted) {
        const { done, value } = await request.reader.read();
        if (done) {
          break;
        }
        respond({ requestId, event: "chunk", chunk: value });
      }
      respond({ requestId, event: "end" });
    } catch (error) {
      respond({
        requestId,
        event: "error",
        message: error instanceof Error ? error.message : String(error),
        transport:
          error instanceof ModelTransportError ? error.transport : true,
        ...(error instanceof ModelTransportError && error.status !== undefined
          ? { status: error.status }
          : {}),
      });
    } finally {
      request.reader?.releaseLock();
      if (active.get(requestId) === request) {
        active.delete(requestId);
      }
    }
  };
  const receive = ({ source, origin: sourceOrigin, data }: MessageEvent) => {
    if (source !== window || sourceOrigin !== origin) {
      return;
    }
    if (
      data?.type !== "aiPageGenerationRequest" &&
      data?.type !== "aiPageGenerationCancel"
    ) {
      return;
    }
    const requestId = data.payload?.requestId;
    if (typeof requestId !== "string" || !requestId.trim()) {
      return;
    }
    if (data.type === "aiPageGenerationCancel") {
      return cancel(requestId);
    }
    if (active.has(requestId)) {
      return;
    }
    if (!isRequestBody(data.payload.body)) {
      send({
        requestId,
        event: "error",
        message: "Invalid generation request body.",
        transport: false,
      });
      return;
    }
    void forward(requestId, data.payload.body);
  };
  window.addEventListener("message", receive);
  return () => {
    window.removeEventListener("message", receive);
    for (const requestId of active.keys()) cancel(requestId);
  };
};
