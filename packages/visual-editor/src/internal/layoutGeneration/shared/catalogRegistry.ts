import type { ThemeData } from "../../../types/themeData.ts";
import type { Config } from "@puckeditor/core";
import {
  createPuckGenerationCatalog,
  generationCatalogs as catalogs,
  type PuckGenerationCatalog,
} from "../../../utils/createPuckGenerationCatalog.ts";

export const getGenerationCatalog = (
  config: Config,
  themeData?: ThemeData
): PuckGenerationCatalog => {
  const catalog = catalogs.get(config) ?? catalogs.get(config.components);
  if (themeData) {
    return createPuckGenerationCatalog(
      catalog?.sourceComponents ?? config.components,
      { ...catalog?.puckOptions, themeData }
    );
  }
  if (catalog) {
    return catalog;
  }
  const fallback = createPuckGenerationCatalog(config.components);
  catalogs.set(config, fallback);
  catalogs.set(config.components, fallback);
  return fallback;
};
