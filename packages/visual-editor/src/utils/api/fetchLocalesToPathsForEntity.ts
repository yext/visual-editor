import { normalizeSlug } from "../slugifier.ts";
import { normalizeLocale } from "../normalizeLocale.ts";
import { StreamDocument } from "../applyTheme.ts";

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
        localeToPath[normalizeLocale(profile.meta.locale)] = getPath(profile);
      }
    }
  } catch (e) {
    console.warn("failed to parse json", e);
  }

  return localeToPath;
};

// getPath assumes the user is using Visual Editor in-platform. This does not work with some hybrid cases.
// This should use the exact same logic as getPath in packages/visual-editor/src/vite-plugin/templates/main.tsx
// as that is the code all in-platform developers are using.
const getPath = (streamDocument: StreamDocument): string => {
  if (streamDocument.slug) {
    return streamDocument.slug;
  }

  const localePath =
    streamDocument.meta?.locale !== "en"
      ? `${streamDocument.meta?.locale}/`
      : "";
  const path = streamDocument.address
    ? `${localePath}${streamDocument.address.region}/${streamDocument.address.city}/${streamDocument.address.line1}-${streamDocument.id}`
    : `${localePath}${streamDocument.id}`;

  return normalizeSlug(path);
};
