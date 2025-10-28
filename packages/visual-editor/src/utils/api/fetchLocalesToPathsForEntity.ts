import { normalizeLocale } from "../normalizeLocale.ts";
import { resolveUrlTemplate } from "../resolveUrlTemplate.ts";

const V_PARAM = "20250407";

export const fetchLocalesToPathsForEntity = async ({
  businessId,
  apiKey,
  contentEndpointId,
  contentDeliveryAPIDomain,
  entityId,
}: {
  businessId: string;
  apiKey: string;
  contentEndpointId: string;
  contentDeliveryAPIDomain: string;
  entityId: string;
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
          // Use resolveUrlTemplate with useCurrentPageSetTemplate option
          // to get the URL based on the current page set template
          const path = resolveUrlTemplate(profile, "", undefined, {
            useCurrentPageSetTemplate: true,
          });
          localeToPath[normalizeLocale(profile.meta.locale)] = path;
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
