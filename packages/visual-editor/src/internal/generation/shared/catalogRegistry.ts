import type { Config } from "@puckeditor/core";
import {
  createPuckGenerationCatalog,
  type PuckGenerationCatalog,
} from "../../../utils/generationCatalog.ts";
import { generationCatalogs as catalogs } from "../../../utils/generationCatalogRegistry.ts";

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
