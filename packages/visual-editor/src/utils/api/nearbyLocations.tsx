const V_PARAM = "20250507";

export const fetchNearbyLocations = async ({
  businessId,
  apiKey,
  contentEndpointId,
  universe,
  partition,
  latitude,
  longitude,
  radiusMi,
  limit,
}: {
  businessId: number;
  apiKey: string;
  contentEndpointId: string;
  universe: string;
  partition: string;
  longitude: number;
  latitude: number;
  radiusMi: number;
  limit: number;
}): Promise<Record<string, any>> => {
  const url = new URL(
    getContentEndpointUrl(businessId, contentEndpointId, universe, partition)
  );
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append(
    "yextDisplayCoordinate__geo",
    `(lat:${latitude},lon:${longitude},radius:${radiusMi},unit:mi)`
  );
  if (limit) {
    url.searchParams.append("limit", limit.toString());
  }
  url.searchParams.append("v", V_PARAM);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};

function getContentEndpointUrl(
  businessId: number,
  contentEndpointId: string,
  universe: string,
  partition: string
): string {
  switch (universe) {
    case "production":
      switch (partition) {
        case "eu":
          return `https://cdn.eu.yextapis.com/v2/accounts/${businessId}/content/${contentEndpointId}`;
        default:
          return `https://cdn.yextapis.com/v2/accounts/${businessId}/content/${contentEndpointId}`;
      }
    case "sandbox":
      return `https://sbx-cdn.yextapis.com/v2/accounts/${businessId}/content/${contentEndpointId}`;
    case "qa":
      switch (partition) {
        case "eu":
          return `https://qa-cdn.eu.yextapis.com/v2/accounts/${businessId}/content/${contentEndpointId}`;
        default:
          return `https://qa-cdn.yextapis.com/v2/accounts/${businessId}/content/${contentEndpointId}`;
      }
    case "development":
      return `https://streams-dev.yext.com/v2/accounts/${businessId}/content/${contentEndpointId}`;
    default:
      return `https://cdn.yextapis.com/v2/accounts/${businessId}/content/${contentEndpointId}`;
  }
}
