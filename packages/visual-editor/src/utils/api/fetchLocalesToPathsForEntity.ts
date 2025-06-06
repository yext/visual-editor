import { normalizeSlug } from "../slugifier.ts";

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
      if (profile?.meta?.locale && getPath(profile)) {
        localeToPath[profile.meta.locale] = getPath(profile);
      }
    }
  } catch (e) {
    console.warn("failed to parse json", e);
  }

  return localeToPath;
};

// getPath assumes the user is using Visual Editor in-platform. This does not work with some hybrid cases.
const getPath = (document: Record<string, any>): string => {
  if (document.slug) {
    return document.slug;
  }

  const localePath =
    document.meta?.locale !== "en" ? `${document.meta?.locale}/` : "";
  const path = document.address
    ? `${localePath}${document.address.region}/${document.address.city}/${document.address.line1}-${document.id}`
    : `${localePath}${document.id}`;

  return normalizeSlug(path);
};
