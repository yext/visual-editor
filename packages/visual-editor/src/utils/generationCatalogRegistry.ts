import type { Config } from "@puckeditor/core";
import type { PuckGenerationCatalog } from "./generationCatalog.ts";

export const generationCatalogs = new WeakMap<object, PuckGenerationCatalog>();
/** Associate generated contracts with a config without adding saved layout data. */
export const withGenerationCatalog = <T extends Config>(
  config: T,
  catalog: PuckGenerationCatalog
): T => {
  generationCatalogs.set(config, catalog);
  // Puck may copy Config while preserving its component map.
  generationCatalogs.set(config.components, catalog);
  return config;
};
