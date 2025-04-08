const V_PARAM = "20250407";

export const fetchNearbyLocations = async ({
  contentEndpoint,
  latitude,
  longitude,
  radiusMi,
  coordinateField,
  limit,
  entityType,
}: {
  contentEndpoint: string;
  longitude: number;
  latitude: number;
  radiusMi: number;
  coordinateField: string;
  limit: number;
  entityType: string;
}): Promise<Record<string, any>> => {
  const url = new URL(contentEndpoint);
  url.searchParams.append("v", V_PARAM);
  url.searchParams.append(
    `${coordinateField}__geo`,
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
