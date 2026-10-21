import type { PuckGenerationCatalog } from "../../utils/generationCatalog.ts";
import type { ModelTransport } from "./modelTransport.ts";

export type GenerationTokenUsage = {
  cachedInput: number;
  uncachedInput: number;
  output: number;
};

export type GenerationDiagnostics = {
  log: (message: string, details: object) => void;
  report: (kind: "diagnostics" | "error", details: object) => void;
};

export type GenerationEnvironment = {
  model: string;
  catalog: PuckGenerationCatalog;
  locales: string[];
  transport: ModelTransport;
  diagnostics: GenerationDiagnostics;
};

export const consoleGenerationDiagnostics: GenerationDiagnostics = {
  log: (message, details) => console.debug(message, details),
  report: (kind, details) =>
    kind === "error"
      ? console.error("[layout generation] Error", details)
      : console.debug("[layout generation] Diagnostics", details),
};
