import {
  CloudRegion,
  Environment,
  provideHeadless,
  SearchConfig,
} from "@yext/search-headless-react";
import React from "react";

export const buildSearchConfigFromDocument = (document: any): SearchConfig => {
  return {
    apiKey: document?._env?.YEXT_PUBLIC_ADV_SEARCH_API_KEY ?? "",
    experienceKey: document?._env?.YEXT_PUBLIC_ADV_SEARCH_EXP_KEY ?? "",
    locale: document?.locale ?? "en",
    experienceVersion: "PRODUCTION",
    cloudRegion: CloudRegion.US,
    environment: Environment.PROD,
  };
};

export const useEntityPreviewSearcher = (document: any) => {
  return React.useMemo(() => {
    const config = buildSearchConfigFromDocument(document);

    if (!config.apiKey || !config.experienceKey) {
      return undefined;
    }

    return provideHeadless({
      ...config,
      headlessId: "entity-preview-searcher",
    });
  }, [document]);
};
