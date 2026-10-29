import { z } from "zod";
import {
  sectionEditPlanSchema,
  sectionEditResultSchema,
} from "../workflows/edits/sectionEditTaskSchema.ts";
import { generationPreparationSchema } from "../workflows/fullPageGeneration/preparationContracts.ts";
import type {
  GenerationEnvironment,
  LayoutGenerationRequest,
} from "../shared/contracts.ts";
import { GenerationError as ChatGenerationError } from "../shared/generationErrors.ts";

const acceptedSchema = z.strictObject({
  type: z.literal("accepted"),
  text: z.string(),
  spec: z.strictObject({ content: z.array(z.any()) }).nullable(),
});
const preparedSchema = z.strictObject({
  type: z.literal("prepared"),
  preparation: generationPreparationSchema,
});
const planSchema = z.strictObject({
  type: z.literal("planned"),
  plan: sectionEditPlanSchema,
});
const resultSchema = z.strictObject({
  type: z.literal("section-result"),
  result: sectionEditResultSchema,
});

/** Consume a complete response before allowing its result to reach the canvas. */
export const mockGenerationRequest = async (
  request: LayoutGenerationRequest,
  environment: GenerationEnvironment,
  signal: AbortSignal,
  correlationId: string
) => {
  const api =
    (environment as GenerationEnvironment & { api?: string }).api ??
    "/generate";
  let response: Response;
  try {
    response = await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Visual-Editor-Correlation-Id": correlationId,
      },
      body: JSON.stringify(request),
      signal,
    });
  } catch (cause) {
    throw new ChatGenerationError(String(cause), false, true);
  }
  if (signal.aborted) {
    void response.body?.cancel().catch(() => {});
    signal.throwIfAborted();
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ChatGenerationError(
      body?.error ?? `HTTP error: ${response.status}`,
      false,
      response.status >= 500 ||
        response.status === 408 ||
        response.status === 429
    );
  }
  const expectedHeader =
    request.mode === "create" ? "strict-puck-overrides-v2" : "section-edits-v1";
  if (response.headers.get("X-Visual-Editor-Generation") !== expectedHeader) {
    void response.body?.cancel().catch(() => {});
    throw new ChatGenerationError(
      "Generation endpoint does not support validated Puck output",
      false,
      true
    );
  }
  const reader = response.body?.getReader();
  if (!reader) {
    throw new ChatGenerationError("No response body", false, true);
  }
  let accepted:
    | z.infer<typeof preparedSchema>
    | z.infer<typeof acceptedSchema>
    | z.infer<typeof planSchema>
    | z.infer<typeof resultSchema>
    | undefined;
  let failure: ChatGenerationError | undefined;
  const process = (line: string) => {
    signal.throwIfAborted();
    if (!line.trim()) {
      return;
    }
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      throw new ChatGenerationError("Invalid generation event", false, true);
    }
    if (!event || typeof event !== "object" || Array.isArray(event)) {
      throw new ChatGenerationError("Invalid generation event", false, true);
    }
    if (event.type === "error") {
      if (failure || accepted || typeof event.error !== "string") {
        throw new ChatGenerationError(
          "Invalid generation event sequence",
          false,
          true
        );
      }
      failure = new ChatGenerationError(
        event.error,
        event.retryable === true && event.transport !== true,
        event.transport === true,
        typeof event.validationFeedback === "string"
          ? event.validationFeedback.slice(0, 4000)
          : event.error.slice(0, 4000)
      );
    } else {
      if (accepted || failure) {
        throw new ChatGenerationError(
          "Duplicate generation result",
          false,
          true
        );
      }
      const expectedType =
        request.mode === "prepare"
          ? "prepared"
          : request.mode === "create"
            ? "accepted"
            : request.mode === "plan"
              ? "planned"
              : "section-result";
      if (event.type !== expectedType) {
        throw new ChatGenerationError(
          "Unexpected generation event",
          false,
          true
        );
      }
      try {
        accepted =
          request.mode === "prepare"
            ? preparedSchema.parse(event)
            : request.mode === "create"
              ? acceptedSchema.parse(event)
              : request.mode === "plan"
                ? planSchema.parse(event)
                : resultSchema.parse(event);
      } catch (cause) {
        failure = new ChatGenerationError(
          "Invalid generation result",
          true,
          false,
          String(cause).slice(0, 4000)
        );
      }
    }
  };
  const abort = () => {
    void reader.cancel().catch(() => {});
  };
  signal.addEventListener("abort", abort, { once: true });
  try {
    const decoder = new TextDecoder();
    let pending = "";
    while (true) {
      let chunk;
      try {
        chunk = await reader.read();
      } catch (cause) {
        throw new ChatGenerationError(String(cause), false, true);
      }
      signal.throwIfAborted();
      pending += decoder.decode(chunk.value, { stream: !chunk.done });
      const lines = pending.split("\n");
      pending = lines.pop()!;
      lines.forEach(process);
      if (chunk.done) {
        break;
      }
    }
    if (pending) {
      process(pending);
    }
    if (failure) {
      throw failure;
    }
    if (!accepted) {
      throw new ChatGenerationError(
        "Generation ended before spec acceptance",
        false,
        true
      );
    }
    return accepted;
  } finally {
    signal.removeEventListener("abort", abort);
    void reader.cancel().catch(() => {});
    reader.releaseLock();
  }
};
