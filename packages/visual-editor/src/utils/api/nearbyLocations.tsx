const V_PARAM = "20250407";

export const fetchNearbyLocations = async ({
  businessId,
  apiKey,
  contentEndpointId,
  contentDeliveryAPIDomain,
  latitude,
  longitude,
  radiusMi,
  limit,
}: {
  businessId: string;
  apiKey: string;
  contentEndpointId: string;
  contentDeliveryAPIDomain: string;
  longitude: number;
  latitude: number;
  radiusMi: number;
  limit: number;
}): Promise<Record<string, any>> => {
  const url = new URL(
    `${contentDeliveryAPIDomain}/v2/accounts/${businessId}/content/${contentEndpointId}`
  );
  url.searchParams.append("api_key", apiKey);
  url.searchParams.append("v", V_PARAM);
  url.searchParams.append(
    "geocodedCoordinate__geo",
    `(lat:${latitude},lon:${longitude},radius:${radiusMi},unit:mi)`
  );
  if (limit) {
    url.searchParams.append("limit", limit.toString());
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};
