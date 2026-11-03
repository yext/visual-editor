import type { Config } from "@puckeditor/core";
import {
  createPuckGenerationCatalog,
  generationCatalogs as catalogs,
  type PuckGenerationCatalog,
} from "../../../utils/createPuckGenerationCatalog.ts";

export const getGenerationCatalog = (config: Config): PuckGenerationCatalog => {
  const catalog = catalogs.get(config) ?? catalogs.get(config.components);
  if (catalog) {
    return catalog;
  }
  const fallback = createPuckGenerationCatalog(config.components);
  catalogs.set(config, fallback);
  catalogs.set(config.components, fallback);
  return fallback;
};
