const resultCount = 24;
const defaultLimit = 20;
const latitude = 38.895546;
const longitude = -77.069915;

const hours = {
  monday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  tuesday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  wednesday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  thursday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  friday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
};

const results = Array.from({ length: resultCount }, (_, index) => {
  const number = String(index + 1).padStart(2, "0");
  return {
    data: {
      id: `local-editor-location-${number}`,
      slug: `local-editor-location-${number}`,
      type: "location",
      name: `Example Location ${number}`,
      address: {
        line1: `${100 + index} Wilson Blvd`,
        city: "Arlington",
        region: "VA",
        postalCode: `222${String(index).padStart(2, "0")}`,
        countryCode: "US",
      },
      hours,
      mainPhone: "+12025550101",
      services: ["Delivery", "Pickup"],
      timezone: "America/New_York",
      yextDisplayCoordinate: {
        latitude: latitude + index * 0.01,
        longitude: longitude + index * 0.01,
      },
    },
    distance: 1609 * (index + 1),
    distanceFromFilter: 804 * (index + 1),
    highlightedFields: {},
  };
});

const getRequestUrl = (input: string | URL | Request): string => {
  if (typeof input === "string") {
    return input;
  }
  return input instanceof URL ? input.toString() : input.url;
};

const getPagination = async (
  input: string | URL | Request,
  init?: RequestInit
): Promise<{ offset: number; limit: number }> => {
  const body =
    typeof init?.body === "string"
      ? init.body
      : input instanceof Request
        ? await input.clone().text()
        : "";
  try {
    const value = JSON.parse(body) as { offset?: number; limit?: number };
    return { offset: value.offset ?? 0, limit: value.limit ?? defaultLimit };
  } catch {
    return { offset: 0, limit: defaultLimit };
  }
};

/**
 * Installs local-only Locator API replacements and returns a function that
 * restores the browser APIs. The replacements only run in Local Editor.
 */
export const installLocalEditorLocatorMocks = (): (() => void) => {
  const originalFetch = globalThis.fetch;
  const geolocation = navigator.geolocation;
  const ownDescriptor = geolocation
    ? Object.getOwnPropertyDescriptor(geolocation, "getCurrentPosition")
    : undefined;
  const prototypeDescriptor = geolocation
    ? Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(geolocation),
        "getCurrentPosition"
      )
    : undefined;

  globalThis.fetch = async (
    input: string | URL | Request,
    init?: RequestInit
  ) => {
    const url = getRequestUrl(input);
    if (url.includes("/search/vertical/query")) {
      const { offset, limit } = await getPagination(input, init);
      return new Response(
        JSON.stringify({
          meta: { uuid: "local-editor-locator", errors: [] },
          response: {
            queryId: `local-editor-locator-${offset}`,
            verticalConfigId: "locations",
            source: "KNOWLEDGE_MANAGER",
            resultsCount: resultCount,
            results: results.slice(offset, offset + limit),
            facets: [],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    if (url.includes("/search/filtersearch")) {
      return new Response(
        JSON.stringify({
          meta: { uuid: "local-editor-filter", errors: [] },
          response: {
            businessId: "1",
            queryId: "local-editor-filter",
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
                        NEAR: { lat: latitude, lng: longitude, radius: 40233 },
                      },
                    },
                  },
                ],
              },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    if (url.includes("api.mapbox.com/geocoding/v5/mapbox.places/")) {
      return new Response(
        JSON.stringify({ features: [{ place_name: "Arlington, VA" }] }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    if (url.includes("yextevents.com/accounts/me/events")) {
      return new Response(null, { status: 204 });
    }
    return originalFetch(input, init);
  };

  if (geolocation) {
    Object.defineProperty(geolocation, "getCurrentPosition", {
      configurable:
        ownDescriptor?.configurable ??
        prototypeDescriptor?.configurable ??
        true,
      enumerable:
        ownDescriptor?.enumerable ?? prototypeDescriptor?.enumerable ?? false,
      value: (success: PositionCallback): void => {
        success({
          coords: {
            latitude,
            longitude,
            accuracy: 1,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        } as GeolocationPosition);
      },
    });
  }

  return (): void => {
    globalThis.fetch = originalFetch;
    if (!geolocation) {
      return;
    }
    if (ownDescriptor) {
      Object.defineProperty(geolocation, "getCurrentPosition", ownDescriptor);
    } else {
      delete (
        geolocation as {
          getCurrentPosition?: Geolocation["getCurrentPosition"];
        }
      ).getCurrentPosition;
    }
  };
};
