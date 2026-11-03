import {
  getOriginsForSending,
  isOriginAllowed,
  TARGET_ORIGINS,
} from "../../hooks/useMessage.ts";
import {
  ModelTransportError,
  type ModelRequestBody,
  type ModelTransport,
} from "./modelTransport.ts";

export type GenerationRequest = {
  type: "aiPageGenerationRequest";
  payload: { requestId: string; body: ModelRequestBody };
};

type GenerationCancel = {
  type: "aiPageGenerationCancel";
  payload: { requestId: string };
};

export type GenerationResponse = {
  type: "aiPageGenerationResponse";
  payload:
    | { requestId: string; event: "start"; contentType: string }
    | { requestId: string; event: "chunk"; chunk: Uint8Array }
    | { requestId: string; event: "end" }
    | {
        requestId: string;
        event: "error";
        message: string;
        transport: boolean;
        status?: number;
      };
};

/** One listener per active call; concurrent calls are isolated by requestId. */
const createMessageModelTransport =
  (options: {
    target: Window;
    outgoingOrigins: () => string[];
    isResponseOriginAllowed: (origin: string) => boolean;
  }): ModelTransport =>
  (body, signal, diagnosticId) => {
    signal.throwIfAborted();
    const requestId = crypto.randomUUID();
    console.debug("[layout generation] Message model request", {
      requestId,
      diagnosticId,
      model: body.model,
    });
    return new Promise((resolve, reject) => {
      let started = false;
      let settled = false;
      let responseOrigin: string | undefined;
      let controller: ReadableStreamDefaultController<Uint8Array>;
      const stream = new ReadableStream<Uint8Array>({
        start: (value) => {
          controller = value;
        },
        cancel: () => {
          cancel();
        },
      });
      const send = (message: GenerationRequest | GenerationCancel) => {
        for (const origin of responseOrigin
          ? [responseOrigin]
          : options.outgoingOrigins()) {
          options.target.postMessage(message, origin);
        }
      };
      const cleanup = () => {
        settled = true;
        window.removeEventListener("message", receive);
        signal.removeEventListener("abort", cancel);
      };
      const fail = (error: unknown, notifyHost = false) => {
        if (settled) {
          return;
        }
        cleanup();
        if (notifyHost) {
          send({ type: "aiPageGenerationCancel", payload: { requestId } });
        }
        if (started) {
          controller.error(error);
        } else {
          controller.close();
          reject(error);
        }
      };
      const cancel = () =>
        fail(
          signal.reason ??
            new DOMException("Generation cancelled", "AbortError"),
          true
        );
      const invalid = () =>
        fail(
          new ModelTransportError(
            "Invalid generation response sequence or payload.",
            true
          ),
          true
        );
      const receive = ({ source, origin, data }: MessageEvent) => {
        if (
          source !== options.target ||
          !options.isResponseOriginAllowed(origin) ||
          (responseOrigin && origin !== responseOrigin)
        ) {
          return;
        }
        if (
          data?.type !== "aiPageGenerationResponse" ||
          data.payload?.requestId !== requestId ||
          settled
        ) {
          return;
        }
        responseOrigin = origin;
        const payload = data.payload;
        switch (payload.event) {
          case "start":
            if (
              started ||
              typeof payload.contentType !== "string" ||
              !payload.contentType
            ) {
              return invalid();
            }
            started = true;
            resolve({ contentType: payload.contentType, body: stream });
            break;
          case "chunk":
            if (
              !started ||
              !(
                ArrayBuffer.isView(payload.chunk) &&
                Object.prototype.toString.call(payload.chunk) ===
                  "[object Uint8Array]"
              )
            ) {
              return invalid();
            }
            controller.enqueue(payload.chunk);
            break;
          case "end":
            if (!started) {
              return invalid();
            }
            cleanup();
            controller.close();
            break;
          case "error":
            if (
              typeof payload.message !== "string" ||
              typeof payload.transport !== "boolean" ||
              (payload.status !== undefined &&
                (!Number.isInteger(payload.status) ||
                  payload.status < 100 ||
                  payload.status > 599))
            ) {
              return invalid();
            }
            fail(
              new ModelTransportError(
                payload.message,
                payload.transport,
                payload.status
              )
            );
            break;
          default:
            invalid();
        }
      };
      window.addEventListener("message", receive);
      signal.addEventListener("abort", cancel, { once: true });
      if (signal.aborted) {
        return cancel();
      }
      try {
        send({ type: "aiPageGenerationRequest", payload: { requestId, body } });
      } catch (error) {
        fail(new ModelTransportError(String(error), true));
      }
    });
  };

export const iframeModelTransport: ModelTransport = (...args) =>
  createMessageModelTransport({
    target: window.parent,
    outgoingOrigins: () => getOriginsForSending(TARGET_ORIGINS),
    isResponseOriginAllowed: isOriginAllowed,
  })(...args);

export const createLocalMessageTransport = () => {
  const origin = window.location.origin;
  return createMessageModelTransport({
    target: window,
    outgoingOrigins: () => [origin],
    isResponseOriginAllowed: (value) => value === origin,
  });
};
