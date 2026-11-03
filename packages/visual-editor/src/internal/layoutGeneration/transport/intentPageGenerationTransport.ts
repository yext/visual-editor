import {
  getOriginsForSending,
  isOriginAllowed,
  TARGET_ORIGINS,
} from "../../hooks/useMessage.ts";
import type { IntentPageGeneration } from "../../types/templateMetadata.ts";

export type IntentReply = {
  status: "success" | "error";
  payload?: {
    attemptId?: string;
    generation?: IntentPageGeneration;
    layoutSaved?: boolean;
    message?: string;
  };
};

/** Lifecycle calls must be serialized: the parent correlates only by attemptId. */
export const sendIntentRequest = (
  type: "updateIntentPageGeneration" | "saveLayoutSaveState",
  payload: Record<string, unknown>,
  attemptId: string,
  signal: AbortSignal
): Promise<IntentReply> =>
  new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      window.removeEventListener("message", receive);
    };
    const abort = () => {
      cleanup();
      reject(signal.reason);
    };
    const receive = ({ source, origin, data }: MessageEvent) => {
      if (
        source !== window.parent ||
        !isOriginAllowed(origin) ||
        data?.type !== type ||
        !["success", "error"].includes(data.status)
      )
        return;
      // Invalid-default-layout errors intentionally have no attempt identity.
      const invalidLayout =
        type === "saveLayoutSaveState" &&
        data.status === "error" &&
        !data.payload?.attemptId &&
        typeof data.payload?.message === "string";
      if (data.payload?.attemptId !== attemptId && !invalidLayout) return;
      if (data.status === "success" && type === "updateIntentPageGeneration") {
        const generation = data.payload?.generation;
        const expected =
          payload.action === "start"
            ? "RUNNING"
            : payload.action === "fail"
              ? "FAILED"
              : "COMPLETED";
        // Ignore late acknowledgements from an earlier operation on this attempt.
        // A repeated start can also report an already terminal attempt.
        if (
          generation?.attemptId !== attemptId ||
          (generation.status !== expected &&
            !(
              payload.action === "start" &&
              ["FAILED", "COMPLETED"].includes(generation.status)
            ))
        )
          return;
      }
      cleanup();
      resolve(data);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(
        new Error(
          "The parent did not acknowledge intent page generation. Retry to recover."
        )
      );
    }, 15000);
    signal.addEventListener("abort", abort, { once: true });
    window.addEventListener("message", receive);
    try {
      for (const origin of getOriginsForSending(TARGET_ORIGINS)) {
        window.parent.postMessage({ type, payload }, origin);
      }
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
