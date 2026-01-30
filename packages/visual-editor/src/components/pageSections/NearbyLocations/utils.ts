import { StreamDocument } from "../../../utils/types/StreamDocument";

/** parseDocument parses the streamDocument to get the businessId, apiKey, contentEndpointId, and contentDeliveryAPIDomain */
export const parseDocument = (
  streamDocument: StreamDocument,
  contentEndpointIdEnvVar?: string
): {
  businessId: string;
  entityId: string;
  apiKey: string;
  contentEndpointId: string;
  contentDeliveryAPIDomain: string;
} => {
  const businessId: string = streamDocument?.businessId;
  if (!businessId) {
    console.warn("Missing businessId! Unable to fetch nearby locations.");
  }

  const entityId: string = streamDocument?.id;
  if (!entityId) {
    console.warn("Missing entityId! Unable to fetch nearby locations.");
  }

  const apiKey: string =
    streamDocument?._env?.YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY;
  if (!apiKey) {
    console.warn(
      "Missing YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY! Unable to fetch nearby locations."
    );
  }

  let contentEndpointId: string = "";
  if (streamDocument?._pageset) {
    try {
      const pagesetJson = JSON.parse(streamDocument?._pageset);
      contentEndpointId = pagesetJson?.config?.contentEndpointId;
    } catch (e) {
      console.error("Failed to parse pageset from stream document. err=", e);
    }
  } else if (contentEndpointIdEnvVar) {
    contentEndpointId = streamDocument?._env?.[contentEndpointIdEnvVar];
  }
  if (!contentEndpointId) {
    console.warn(
      "Missing contentEndpointId! Unable to fetch nearby locations."
    );
  }

  const contentDeliveryAPIDomain =
    streamDocument?._yext?.contentDeliveryAPIDomain;
  if (!contentDeliveryAPIDomain) {
    console.warn(
      "Missing contentDeliveryAPIDomain! Unable to fetch nearby locations."
    );
  }

  return {
    businessId: businessId,
    entityId: entityId,
    apiKey: apiKey,
    contentEndpointId: contentEndpointId,
    contentDeliveryAPIDomain: contentDeliveryAPIDomain,
  };
};

/** The version of the content endpoint api */
const V_PARAM = "20250407";

/**
 * fetchNearbyLocations constructs a nearby locations query based on the provided
 * parameters and fetches from the content endpoint.
 */
export const fetchNearbyLocations = async ({
  businessId,
  entityId,
  apiKey,
  contentEndpointId,
  contentDeliveryAPIDomain,
  latitude,
  longitude,
  radiusMi,
  limit,
  locale,
}: {
  businessId: string;
  entityId: string;
  apiKey: string;
  contentEndpointId: string;
  contentDeliveryAPIDomain: string;
  longitude: number;
  latitude: number;
  radiusMi: number;
  limit: number;
  locale: string;
}): Promise<Record<string, any>> => {
  const url = new URL(
    `${contentDeliveryAPIDomain}/v2/accounts/${businessId}/content/${contentEndpointId}`
  );
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("v", V_PARAM);
  url.searchParams.append(
    "yextDisplayCoordinate__geo",
    `(lat:${latitude},lon:${longitude},radius:${radiusMi},unit:mi)`
  );
  url.searchParams.append("meta.locale", locale);
  url.searchParams.append("id__neq", entityId);
  if (limit) {
    url.searchParams.append("limit", limit.toString());
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};
