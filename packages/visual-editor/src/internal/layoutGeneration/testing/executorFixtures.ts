import { testPrompts, testGenerationSettings } from "./promptFixtures.ts";
import type { Config } from "@puckeditor/core";
import { vi } from "vitest";
import {
  reportChatDiagnostic,
  reportChatError,
} from "../../../local-editor/generationDiagnostics.ts";
import { createPuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { getGenerationCatalog } from "../shared/catalogRegistry.ts";
import type {
  GenerationEnvironment,
  GenerationResult,
  LayoutGenerationRequest,
} from "../shared/contracts.ts";
import { GenerationError } from "../shared/generationErrors.ts";
import { executeGeneration } from "../transport/executeGeneration.ts";

export type ExecutorReply = GenerationResult | GenerationError;

/** UI tests supply results at the executor boundary; transport tests own byte parsing. */
export const stubGenerationExecutor = (
  respond: (
    request: LayoutGenerationRequest,
    signal: AbortSignal
  ) => Promise<ExecutorReply>,
  { skipPreparation = false }: { skipPreparation?: boolean } = {}
) => {
  vi.mocked(executeGeneration).mockImplementation(
    async (request, _environment, signal) => {
      if (skipPreparation && request.mode === "prepare") {
        return {
          type: "prepared",
          preparation: {
            question: null,
            translationMode: "defaultOnly",
            cardCounts: [],
          },
        };
      }
      const result = await respond(request, signal);
      signal.throwIfAborted();
      if (result instanceof GenerationError) {
        throw result;
      }
      return result;
    }
  );
};

export const deferredGeneration = () => {
  let resolve!: (result: GenerationResult) => void;
  const promise = new Promise<GenerationResult>((done) => {
    resolve = done;
  });
  return { promise, resolve };
};

const environments = new Map<string, GenerationEnvironment>();
export const testGenerationEnvironment = (
  api = "/generate",
  config?: Config
) => {
  if (!environments.has(api)) {
    environments.set(api, {
      model: "test",
      prompts: testPrompts,
      generationSettings: testGenerationSettings,
      locales: ["en"],
      catalog: createPuckGenerationCatalog({}),
      transport: async () => {
        throw new Error("Use a raw transport fixture for engine tests");
      },
      diagnostics: {
        log: () => {},
        report: (kind: "diagnostics" | "error", details: object) =>
          kind === "diagnostics"
            ? reportChatDiagnostic(api, details)
            : reportChatError(api, details),
      },
    });
  }
  const environment = environments.get(api)!;
  return config
    ? { ...environment, catalog: getGenerationCatalog(config) }
    : environment;
};
