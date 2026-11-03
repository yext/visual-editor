import { testPrompts, testGenerationSettings } from "./promptFixtures.ts";
import { vi } from "vitest";
import type {
  GenerationEnvironment,
  GenerationResult,
  LayoutGenerationRequest,
} from "../shared/contracts.ts";
import type { GenerationError } from "../shared/generationErrors.ts";
import { executeGeneration } from "../transport/executeGeneration.ts";
import {
  ModelTransportError,
  isTransportStatus,
  type ModelRequestBody,
} from "../transport/modelTransport.ts";

export const modelResponder =
  vi.fn<(body: ModelRequestBody, signal: AbortSignal) => Promise<Response>>();

/** Adapt synthetic provider responses at the model boundary used by the engine. */
export const responseModelTransport =
  (respond: typeof modelResponder): GenerationEnvironment["transport"] =>
  async (body, signal) => {
    const response = await respond(body, signal);
    if (!response.ok) {
      throw new ModelTransportError(
        `AI gateway HTTP ${response.status}`,
        isTransportStatus(response.status)
      );
    }
    return {
      contentType: response.headers.get("Content-Type") ?? "application/json",
      body: response.body!,
    };
  };

/** Complete a gateway request with synthetic model output. */
export const completed = (output: unknown) =>
  new Response(
    JSON.stringify({
      status: "completed",
      output_text: JSON.stringify(output),
    }),
    { headers: { "Content-Type": "application/json" } }
  );

/** Run the real executor while observing results, diagnostics, and cancellation. */
export const executionHarness = (
  payload: object,
  catalog: GenerationEnvironment["catalog"],
  locales = ["en"],
  generationSettings = testGenerationSettings
) => {
  const controller = new AbortController();
  const observations: GenerationResult[] = [];
  const log = vi.fn();
  let error: GenerationError | undefined;
  return {
    log,
    get error() {
      return error;
    },
    cancel: () => controller.abort(new Error("Generation cancelled.")),
    events: () => observations,
    run: async () => {
      try {
        const result = await executeGeneration(
          payload as LayoutGenerationRequest,
          {
            model: "test",
            prompts: testPrompts,
            generationSettings,
            catalog,
            locales,
            transport: responseModelTransport(modelResponder),
            diagnostics: { log, report: () => {} },
          },
          controller.signal,
          crypto.randomUUID()
        );
        observations.push(result);
      } catch (cause) {
        error = cause as GenerationError;
      }
    },
  };
};
