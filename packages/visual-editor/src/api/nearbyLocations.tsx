const V_PARAM = "20250407";

export const fetchNearbyLocations = async ({
  contentEndpoint,
  latitude,
  longitude,
  radiusMi,
  limit,
  entityType,
}: {
  contentEndpoint: string;
  longitude: number;
  latitude: number;
  radiusMi: number;
  limit: number;
  entityType: string;
}): Promise<any> => {
  const url = new URL(contentEndpoint);
  url.searchParams.append("v", V_PARAM);
  url.searchParams.append(
    "geocodedCoordinate__geo",
    `(lat:${latitude},lon:${longitude},radius:${radiusMi},unit:mi)`
  );
  if (limit) {
    url.searchParams.append("limit", limit.toString());
  }
  if (entityType) {
    url.searchParams.append("meta.entityType.id", entityType);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};
