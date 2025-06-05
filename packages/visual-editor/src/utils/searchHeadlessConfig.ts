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
 * @param experienceKeyEnvVar can be provided via withPropOverrides for a hybrid developer
 */
export const createSearchHeadlessConfig = (
  document: any,
  experienceKeyEnvVar?: string
) => {
  const warnings = [];
  const searchApiKey = document?._env?.YEXT_SEARCH_API_KEY;
  if (!searchApiKey) {
    warnings.push("Missing YEXT_SEARCH_API_KEY! Unable to set up locator.");
  }
  const mapboxApiKey = document?._env?.YEXT_MAPBOX_API_KEY;
  if (!mapboxApiKey) {
    warnings.push("Missing YEXT_MAPBOX_API_KEY! Unable to set up locator.");
  }
  const cloudRegion = document?._env?.YEXT_CLOUD_REGION?.toLowerCase();
  if (!isValidCloudRegion(cloudRegion)) {
    warnings.push(
      "Invalid or missing YEXT_CLOUD_REGION! Unable to set up locator."
    );
  }
  const cloudChoice = document?._env?.YEXT_CLOUD_CHOICE;
  if (!isValidCloudChoice(cloudChoice)) {
    warnings.push(
      "Invalid or missing YEXT_CLOUD_CHOICE! Unable to set up locator."
    );
  }
  const environment = document?._env?.YEXT_ENVIRONMENT?.toLowerCase();
  if (!isValidEnvironment(environment)) {
    warnings.push(
      "Invalid or missing YEXT_ENVIRONMENT! Unable to set up locator."
    );
  }
  const experienceKey = getExperienceKey(document, experienceKeyEnvVar);
  if (!experienceKey) {
    warnings.push("Missing experienceKey! Unable to set up locator.");
  }
  if (warnings.length > 0) {
    warnings.forEach((msg) => console.warn(msg));
    return;
  }

  // The iframe'd locator will need a non-URL-restricted Mapbox API key in order to display the map
  // properly. Without this key, we will fall back to the site-specific Mapbox API key, which is not
  // guaranteed to work in the iframe.
  const iframeMapboxApiKey =
    document?._env?.YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY;
  if (!iframeMapboxApiKey) {
    console.warn(
      "Missing YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY! Some map behavior may be unavailable in the layout editor."
    );
  }

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
 * @param experienceKeyEnvVar can be provided via withPropOverrides for a hybrid developer
 */
export const createSearchAnalyticsConfig = (
  document: any,
  experienceKeyEnvVar?: string
) => {
  const warnings = [];
  const businessId = document?.businessId;
  if (!businessId) {
    warnings.push("Missing businessId! Unable to set up locator analytics.");
  }
  const environment = document?._env?.YEXT_ENVIRONMENT?.toLowerCase();
  if (!isValidEnvironment(environment)) {
    warnings.push(
      "Invalid or missing YEXT_ENVIRONMENT! Unable to set up locator analytics."
    );
  }
  const cloudRegion = document?._env?.YEXT_CLOUD_REGION?.toLowerCase();
  if (!isValidCloudRegion(cloudRegion)) {
    warnings.push(
      "Invalid or missing YEXT_CLOUD_REGION! Unable to set up locator analytics."
    );
  }
  const experienceKey = getExperienceKey(document, experienceKeyEnvVar);
  if (!experienceKey) {
    warnings.push("Missing experienceKey! Unable to set up locator analytics.");
  }
  if (warnings.length > 0) {
    warnings.forEach((msg) => console.warn(msg));
    return;
  }

  // corresponds to @yext/analytics EnvironmentEnum
  const analyticsEnvironment =
    environment === Environment.SANDBOX ? "SANDBOX" : "PRODUCTION";
  // corresponds to @yext/analytics RegionEnum
  const analyticsRegion = cloudRegion.toUpperCase();
  const analyticsConfig = {
    businessId: businessId,
    experienceKey: experienceKey,
    experienceVersion: EXPERIENCE_VERSION,
    region: analyticsRegion,
    env: analyticsEnvironment,
  };
  return analyticsConfig;
};

/**
 * Extracts the experienceKey from the entity document if possible, otherwise returns undefined.
 * @param document the entity document
 * @param experienceKeyEnvVar can be provided via withPropOverrides for a hybrid developer
 */
const getExperienceKey = (document: any, experienceKeyEnvVar?: string) => {
  if (!document._pageset && experienceKeyEnvVar) {
    return document._env?.[experienceKeyEnvVar];
  }

  try {
    const experienceKey = JSON.parse(document._pageset).typeConfig.locatorConfig
      .experienceKey;
    return experienceKey;
  } catch {
    return;
  }
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
