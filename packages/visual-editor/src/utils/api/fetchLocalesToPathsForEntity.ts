import { mergeMeta } from "../mergeMeta.ts";
import { StreamDocument } from "../applyTheme.ts";
import { normalizeLocale } from "../normalizeLocale.ts";
import { resolvePageSetUrlTemplate } from "../resolveUrlTemplate.ts";

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

  const response = await fetch(url);

  const localeToPath: Record<string, string> = {};

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  try {
    const json = await response.json();

    for (const profile of json.response.docs) {
      if (profile?.meta?.locale) {
        try {
          const locale: string = profile.meta.locale;

          let isPrimaryLocale: boolean;
          if (profile?.meta?.isPrimaryLocale === true) {
            isPrimaryLocale = true;
          } else if (profile?.meta?.isPrimaryLocale === false) {
            isPrimaryLocale = false;
          } else {
            isPrimaryLocale = locale === "en";
          }

          // Merge profile with streamDocument metadata
          const mergedDocument = mergeMeta(profile, streamDocument);
          // Override with the profile's locale to ensure we resolve the URL for the correct language
          mergedDocument.locale = locale;
          mergedDocument.__.isPrimaryLocale = isPrimaryLocale;

          // Use resolvePageSetUrlTemplate to get the URL based on the current page set template
          const resolvedUrl = resolvePageSetUrlTemplate(mergedDocument, "");
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
