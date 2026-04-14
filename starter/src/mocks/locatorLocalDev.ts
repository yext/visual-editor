const LOCATOR_TEST_IMAGE_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <rect width="80" height="80" rx="16" fill="#0f172a"/>
    <circle cx="40" cy="28" r="16" fill="#fbbf24"/>
    <rect x="18" y="50" width="44" height="12" rx="6" fill="#f8fafc"/>
  </svg>`
)}`;

const LOCATOR_TEST_HOURS = {
  sunday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  monday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  tuesday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  wednesday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  thursday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  friday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  saturday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
};

const TOTAL_RESULTS = 24;
const DEFAULT_LIMIT = 20;
const BASE_LATITUDE = 38.895546;
const BASE_LONGITUDE = -77.069915;

type LocatorVerticalResult = {
  data: Record<string, unknown>;
  distance: number;
  distanceFromFilter: number;
  highlightedFields: Record<string, unknown>;
};

const createLocatorApiResult = (index: number): LocatorVerticalResult => {
  const paddedIndex = String(index + 1).padStart(2, "0");
  const latitude = BASE_LATITUDE + index * 0.01;
  const longitude = BASE_LONGITUDE + index * 0.01;

  return {
    data: {
      id: `mock-location-${paddedIndex}`,
      slug: `mock-location-${paddedIndex}`,
      type: "location",
      name: `Mock Location ${paddedIndex}`,
      timezone: "America/New_York",
      address: {
        line1: `${100 + index} Wilson Blvd`,
        city: "Arlington",
        region: "VA",
        postalCode: `222${String(index).padStart(2, "0")}`,
        countryCode: "US",
      },
      additionalHoursText: "Holiday hours may vary",
      hours: LOCATOR_TEST_HOURS,
      mainPhone: "+12025550101",
      emails: [`mock-location-${paddedIndex}@example.com`],
      services: ["Dine-in", "Delivery", "Takeout"],
      ref_listings: [
        {
          publisher: "GOOGLEMYBUSINESS",
          listingUrl: `https://maps.google.com/maps/search/?api=1&query=${encodeURIComponent(
            `Mock Location ${paddedIndex}`
          )}`,
        },
      ],
      headshot: {
        url: LOCATOR_TEST_IMAGE_URL,
        height: 80,
        width: 80,
        alternateText: `Mock Location ${paddedIndex}`,
      },
      website: `https://example.com/mock-location-${paddedIndex}`,
      yextDisplayCoordinate: {
        latitude,
        longitude,
      },
      meta: {
        locale: "en",
        isPrimaryLocale: true,
      },
    },
    distance: 1609 * (index + 1),
    distanceFromFilter: 804 * (index + 1),
    highlightedFields: {},
  };
};

const locatorResults = Array.from({ length: TOTAL_RESULTS }, (_, index) =>
  createLocatorApiResult(index)
);

const createLocatorVerticalSearchResponse = (offset: number, limit: number) => {
  const results = locatorResults.slice(offset, offset + limit);

  return {
    meta: {
      uuid: "locator-fixture-uuid",
      errors: [],
    },
    response: {
      queryId: `locator-fixture-query-id-${offset}`,
      verticalConfigId: "locations",
      source: "KNOWLEDGE_MANAGER",
      resultsCount: locatorResults.length,
      results,
      facets: [],
    },
  };
};

const createLocatorFilterSearchResponse = () => ({
  meta: {
    uuid: "locator-filter-fixture-uuid",
    errors: [],
  },
  response: {
    businessId: "2095538",
    queryId: "locator-filter-query-id",
    sections: [
      {
        label: "Locations",
        results: [
          {
            value: "Arlington, VA",
            key: "arlington-va",
            matchedSubstrings: [],
            filter: {
              "builtin.location": {
                NEAR: {
                  lat: BASE_LATITUDE,
                  lng: BASE_LONGITUDE,
                  radius: 40233,
                },
              },
            },
          },
        ],
      },
    ],
  },
});

const getRequestUrl = (input: string | URL | Request) => {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
};

const getRequestBody = async (
  input: string | URL | Request,
  init?: RequestInit
) => {
  const body = init?.body;
  if (typeof body === "string") {
    return body;
  }

  if (body instanceof URLSearchParams) {
    return body.toString();
  }

  if (input instanceof Request) {
    try {
      return await input.clone().text();
    } catch {
      return "";
    }
  }

  return "";
};

const getPagination = async (
  input: string | URL | Request,
  init?: RequestInit
) => {
  const requestBody = await getRequestBody(input, init);
  if (!requestBody) {
    return { offset: 0, limit: DEFAULT_LIMIT };
  }

  try {
    const parsedBody = JSON.parse(requestBody) as {
      offset?: number;
      limit?: number;
    };

    return {
      offset: parsedBody.offset ?? 0,
      limit: parsedBody.limit ?? DEFAULT_LIMIT,
    };
  } catch {
    return { offset: 0, limit: DEFAULT_LIMIT };
  }
};

type MockGlobal = typeof globalThis & {
  __VISUAL_EDITOR_TEST__?: boolean;
};

export const installLocatorLocalDevMocks = () => {
  const originalFetch = globalThis.fetch.bind(globalThis);
  const mockGlobal = globalThis as MockGlobal;
  const previousVisualEditorTestFlag = mockGlobal.__VISUAL_EDITOR_TEST__;
  const geolocation = navigator.geolocation;
  const originalGetCurrentPosition = geolocation?.getCurrentPosition;

  mockGlobal.__VISUAL_EDITOR_TEST__ = true;

  globalThis.fetch = async (
    input: string | URL | Request,
    init?: RequestInit
  ) => {
    const url = getRequestUrl(input);

    if (url.includes("/search/vertical/query")) {
      const { offset, limit } = await getPagination(input, init);
      return new Response(
        JSON.stringify(createLocatorVerticalSearchResponse(offset, limit)),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (url.includes("/search/filtersearch")) {
      return new Response(JSON.stringify(createLocatorFilterSearchResponse()), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("api.mapbox.com/geocoding/v5/mapbox.places/")) {
      return new Response(
        JSON.stringify({
          features: [
            {
              place_name: "Arlington, VA",
            },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (url.includes("yextevents.com/accounts/me/events")) {
      return new Response(null, { status: 204 });
    }

    return originalFetch(input, init);
  };

  if (geolocation && originalGetCurrentPosition) {
    Object.defineProperty(geolocation, "getCurrentPosition", {
      configurable: true,
      value: (
        successCallback: PositionCallback,
        errorCallback?: PositionErrorCallback
      ) => {
        successCallback({
          coords: {
            latitude: BASE_LATITUDE,
            longitude: BASE_LONGITUDE,
            accuracy: 1,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);

        return undefined;
      },
    });
  }

  return () => {
    globalThis.fetch = originalFetch;

    if (geolocation && originalGetCurrentPosition) {
      Object.defineProperty(geolocation, "getCurrentPosition", {
        configurable: true,
        value: originalGetCurrentPosition,
      });
    }

    if (previousVisualEditorTestFlag === undefined) {
      delete mockGlobal.__VISUAL_EDITOR_TEST__;
      return;
    }

    mockGlobal.__VISUAL_EDITOR_TEST__ = previousVisualEditorTestFlag;
  };
};
