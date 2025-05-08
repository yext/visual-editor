import {
  CloudChoice,
  CloudRegion,
  Environment,
  HeadlessConfig,
} from "@yext/search-headless-react";

const EXPERIENCE_VERSION = "PRODUCTION";

/**
 * Builds the search headless config for the template. Returns undefined if the config is not valid.
 * @param document the entity document
 */
export const createSearchHeadlessConfig = (document: any) => {
  const warnings = [];
  const searchApiKey = document?._env?.YEXT_SEARCH_API_KEY;
  if (!searchApiKey) {
    warnings.push("Missing YEXT_SEARCH_API_KEY! Unable to set up locator.");
  }
  const mapboxApiKey = document?._env?.YEXT_MAPBOX_API_KEY;
  if (!mapboxApiKey) {
    warnings.push("Missing YEXT_MAPBOX_API_KEY! Unable to set up locator.");
  }
  const cloudRegion = document?._env?.YEXT_CLOUD_REGION;
  if (!cloudRegion || !isValidCloudRegion(cloudRegion)) {
    warnings.push(
      "Invalid or missing YEXT_CLOUD_REGION! Unable to set up locator."
    );
  }
  const cloudChoice = document?._env?.YEXT_CLOUD_CHOICE;
  if (!cloudChoice || !isValidCloudChoice(cloudChoice)) {
    warnings.push(
      "Invalid or missing YEXT_CLOUD_CHOICE! Unable to set up locator."
    );
  }
  const environment = document?._env?.YEXT_ENVIRONMENT;
  if (!environment || !isValidEnvironment(environment)) {
    warnings.push(
      "Invalid or missing YEXT_ENVIRONMENT! Unable to set up locator."
    );
  }
  if (warnings.length > 0) {
    warnings.forEach((msg) => console.warn(msg));
    return;
  }

  // experienceKey will eventually be on the entity document, waiting on Spruce
  // https://yext.slack.com/archives/C06A06BCUUF/p1745963801890889
  const experienceKey = "jacob-test";
  const headlessConfig: HeadlessConfig = {
    apiKey: searchApiKey,
    experienceKey: experienceKey,
    locale: document.locale,
    experienceVersion: EXPERIENCE_VERSION,
    verticalKey: "locations",
    cloudRegion: cloudRegion,
    cloudChoice: cloudChoice,
    environment: environment,
  };
  return headlessConfig;
};

/**
 * Builds the search analytics config for the template. Returns undefined if the config is not valid.
 * @param document the entity document
 */
export const createSearchAnalyticsConfig = (document: any) => {
  const warnings = [];
  const businessId = document?.businessId;
  if (!businessId) {
    warnings.push("Missing businessId! Unable to set up locator analytics.");
  }
  const environment = document?._env?.YEXT_ENVIRONMENT;
  if (!environment || !isValidEnvironment(environment)) {
    warnings.push(
      "Invalid or missing YEXT_ENVIRONMENT! Unable to set up locator analytics."
    );
  }
  const cloudRegion = document?._env?.YEXT_CLOUD_REGION;
  if (!cloudRegion || !isValidCloudRegion(cloudRegion)) {
    warnings.push(
      "Invalid or missing YEXT_CLOUD_REGION! Unable to set up locator analytics."
    );
  }
  if (warnings.length > 0) {
    warnings.forEach((msg) => console.warn(msg));
    return;
  }

  // from @yext/analytics EnvironmentEnum
  const analyticsEnvironment =
    environment === Environment.SANDBOX ? "SANDBOX" : "PRODUCTION";
  // from @yext/analytics RegionEnum
  const analyticsRegion = cloudRegion.toUpperCase();
  // experienceKey will eventually be on the entity document, waiting on Spruce
  // https://yext.slack.com/archives/C06A06BCUUF/p1745963801890889
  const experienceKey = "jacob-test";
  // from @yext/analytics SearchAnalyticsConfig
  const analyticsConfig = {
    businessId: businessId,
    experienceKey: experienceKey,
    experienceVersion: EXPERIENCE_VERSION,
    region: analyticsRegion,
    env: analyticsEnvironment,
  };
  return analyticsConfig;
};

const isValidCloudRegion = (value: any): value is CloudRegion => {
  return Object.values(CloudRegion).includes(value);
};

const isValidCloudChoice = (value: any): value is CloudChoice => {
  return Object.values(CloudChoice).includes(value);
};

const isValidEnvironment = (value: any): value is Environment => {
  return Object.values(Environment).includes(value);
};
