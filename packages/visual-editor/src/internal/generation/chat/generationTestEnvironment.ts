import type { Config } from "@puckeditor/core";
import type { GenerationEnvironment } from "../environment.ts";
import { createPuckGenerationCatalog } from "../../../utils/generationCatalog.ts";
import {
  reportChatDiagnostic,
  reportChatError,
} from "../../../local-editor/generationDiagnostics.ts";
import { getGenerationCatalog } from "../catalogRegistry.ts";

const environments = new Map<string, GenerationEnvironment>();
export const testGenerationEnvironment = (
  api = "/generate",
  config?: Config
) => {
  if (!environments.has(api))
    environments.set(
      api,
      Object.assign(
        {
          model: "test",
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
        },
        { api }
      )
    );
  const environment = environments.get(api)!;
  return config
    ? { ...environment, catalog: getGenerationCatalog(config) }
    : environment;
};
