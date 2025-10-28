import { mergeMeta, StreamDocument } from "../index.ts";
import { normalizeLocale } from "../normalizeLocale.ts";
import { resolveUrlTemplate } from "../resolveUrlTemplate.ts";

const V_PARAM = "20250407";

export const fetchLocalesToPathsForEntity = async ({
  businessId,
  apiKey,
  contentEndpointId,
  contentDeliveryAPIDomain,
  entityId,
  streamDocument,
}: {
  businessId: string;
  apiKey: string;
  contentEndpointId: string;
  contentDeliveryAPIDomain: string;
  entityId: string;
  streamDocument: StreamDocument;
}): Promise<Record<string, string>> => {
  const url = new URL(
    `${contentDeliveryAPIDomain}/v2/accounts/${businessId}/content/${contentEndpointId}`
  );
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("v", V_PARAM);
  url.searchParams.append("id", entityId);

  console.log("content url:", url);

  const response = await fetch(url);

  const localeToPath: Record<string, string> = {};

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  try {
    const json = await response.json();
    console.log("json:", json);

    let primaryLocale: string = "";
    for (const profile of json.response.docs) {
      if (profile?.$key?.locale === "" && profile?.meta?.locale) {
        // If multiple locales appear to be the primary, throw a warning
        if (primaryLocale) {
          console.warn("Unable to determine primary locale");
          break;
        }
        primaryLocale = profile?.meta?.locale;
      }
    }
    // If no locale appears to be the primary, throw a warning
    if (!primaryLocale) {
      console.warn("Unable to determine primary locale");
    }
    const normalizedPrimaryLocale = primaryLocale
      ? normalizeLocale(primaryLocale)
      : "";

    for (const profile of json.response.docs) {
      if (profile?.meta?.locale) {
        try {
          console.log("profile:", profile);

          // Merge profile with streamDocument metadata, but preserve the profile's locale
          const mergedDocument = mergeMeta(profile, streamDocument);
          // Override with the profile's locale to ensure we resolve the URL for the correct language
          mergedDocument.locale = profile.meta.locale || profile.locale;
          mergedDocument.isPrimaryLocale =
            normalizeLocale(mergedDocument.locale) === normalizedPrimaryLocale;

          console.log("mergedDocument:", mergedDocument);

          // Use resolveUrlTemplate with useCurrentPageSetTemplate option
          // to get the URL based on the current page set template
          const resolvedUrl = resolveUrlTemplate(
            mergedDocument,
            "",
            undefined,
            {
              useCurrentPageSetTemplate: true,
            }
          );
          console.log("resolvedUrl:", resolvedUrl);
          localeToPath[normalizeLocale(profile.meta.locale)] = resolvedUrl;
        } catch (e) {
          console.warn(
            `Failed to resolve URL template for locale ${profile.meta.locale}`,
            e
          );
        }
      }
    }
  } catch (e) {
    console.warn("failed to parse json", e);
  }

  return localeToPath;
};
