import {
  CloudRegion,
  Environment,
  SearchConfig,
} from "@yext/search-headless-react";

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
