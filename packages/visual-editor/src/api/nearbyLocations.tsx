import { getCurrentDateYYYYMMDD } from "../utils/dateUtils.ts";

export const fetchNearbyLocations = async ({
  businessId,
  apiKey,
  latitude,
  longitude,
  radiusMi,
  entityType,
}: {
  businessId: number;
  apiKey: string;
  longitude: number;
  latitude: number;
  radiusMi: number;
  entityType?: string;
}): Promise<any> => {
  const base = `https://streams-dev.yext.com/v2/accounts/${businessId}/content/visualEditorLocations`;
  const queryParams: any = {
    api_key: apiKey,
    v: getCurrentDateYYYYMMDD(),
    geocodedCoordinate__geo: `(lat:${latitude},lon:${longitude},radius:${radiusMi},unit:mi)`,
  };
  if (entityType) {
    queryParams["meta.entityType.id"] = entityType;
  }

  const route = addQueryParams(base, queryParams, false);

  const response = await fetch(route);

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};

export const addQueryParams = (
  route: string,
  queryParams: any,
  isJsonEncoded: boolean
) => {
  if (queryParams && Object.keys(queryParams).length) {
    const queryString = Object.keys(queryParams)
      .filter((key) => !!queryParams[key])
      .map((key) => {
        const paramsStr = isJsonEncoded
          ? JSON.stringify(queryParams[key])
          : queryParams[key];
        return encodeURIComponent(key) + "=" + encodeURIComponent(paramsStr);
      })
      .join("&");
    return route + "?" + queryString;
  }
  return route;
};
