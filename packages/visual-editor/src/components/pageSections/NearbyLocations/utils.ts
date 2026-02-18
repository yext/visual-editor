import { StreamDocument } from "../../../utils/types/StreamDocument.ts";
import { getDistance } from "geolib";

const V_PARAM = "20250407";
const PAGE_SIZE = 50;
const MAX_PAGES = 100;

type Coordinate = {
  latitude?: number;
  longitude?: number;
};

type NearbyLocationDoc = {
  yextDisplayCoordinate?: Coordinate;
  geocodedCoordinate?: Coordinate;
};

type NearbyLocationsResponse = {
  meta?: {
    uuid?: string;
    errors?: unknown[];
  };
  response?: {
    docs?: NearbyLocationDoc[];
    count?: number;
    nextPageToken?: string;
  };
};

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

/**
 * fetchNearbyLocations constructs a nearby locations query based on the provided
 * parameters and fetches from the content endpoint.
 *
 * Due to the lack of geo sorting, it fetches all nearby locations in range,
 * sorts them by distance, and returns the closest ones up to the specified limit.
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
  const allDocs: NearbyLocationDoc[] = [];
  let firstPageMeta: NearbyLocationsResponse["meta"];

  const url = new URL(
    `${contentDeliveryAPIDomain}/v2/accounts/${businessId}/content/${contentEndpointId}`
  );
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("v", V_PARAM);
  url.searchParams.set(
    "yextDisplayCoordinate__geo",
    `(lat:${latitude},lon:${longitude},radius:${radiusMi},unit:mi)`
  );
  url.searchParams.set("meta.locale", locale);
  url.searchParams.set("id__neq", entityId);
  url.searchParams.set("limit", PAGE_SIZE.toString());

  let nextPageToken: string | undefined;
  let pageCount = 0;
  while (pageCount < MAX_PAGES) {
    if (nextPageToken) {
      url.searchParams.set("pageToken", nextPageToken);
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    pageCount++;

    const pageData = (await response.json()) as NearbyLocationsResponse;
    if (!firstPageMeta) {
      firstPageMeta = pageData.meta;
    }

    allDocs.push(...(pageData.response?.docs ?? []));
    nextPageToken = pageData.response?.nextPageToken;

    if (!nextPageToken) {
      break;
    }
  }

  // sort allDocs by distance and trim to nearest `limit` locations
  const origin = { latitude, longitude };
  const nearestDocs = allDocs
    .map((doc) => {
      const coordinate = getDocCoordinate(doc);
      return {
        doc,
        distance: coordinate ? getDistance(origin, coordinate) : Infinity,
      };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ doc }) => doc);

  return {
    meta: firstPageMeta ?? { errors: [] },
    response: {
      docs: nearestDocs,
      count: allDocs.length,
    },
  };
};

const getDocCoordinate = (
  doc: NearbyLocationDoc
): { latitude: number; longitude: number } | null => {
  const coord = doc.yextDisplayCoordinate ?? doc.geocodedCoordinate;
  const latitude = coord?.latitude;
  const longitude = coord?.longitude;

  if (latitude === undefined || longitude === undefined) {
    return null;
  }

  return { latitude, longitude };
};
