import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  axe,
  ComponentTest,
  logSuppressedWcagViolations,
  transformTests,
} from "./testing/componentTests.setup.ts";
import {
  act,
  render as reactRender,
  screen,
  waitFor,
} from "@testing-library/react";
import { injectTranslations } from "../utils/i18n/components.ts";
import { migrate } from "../utils/migrate.ts";
import { migrationRegistry } from "./migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../utils/VisualEditorProvider.tsx";
import { LocatorComponent } from "./Locator.tsx";
import { Render, Config, resolveAllData } from "@puckeditor/core";
import { page } from "@vitest/browser/context";
import { backgroundColors } from "../utils/themeConfigOptions.ts";

vi.mock("@yext/search-ui-react", async () => {
  const actual = await vi.importActual<typeof import("@yext/search-ui-react")>(
    "@yext/search-ui-react"
  );

  return {
    ...actual,
    getUserLocation: vi.fn().mockRejectedValue(
      new Error("Locator screenshot tests use fixture search data.")
    ),
  };
});

const LOCATOR_TEST_IMAGE_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">
    <rect width="80" height="80" rx="16" fill="#0f172a"/>
    <circle cx="40" cy="28" r="16" fill="#fbbf24"/>
    <rect x="18" y="50" width="44" height="12" rx="6" fill="#f8fafc"/>
  </svg>`
)}`;

const LOCATOR_TEST_ENV = {
  YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "fixture-visual-editor-app-api-key",
  YEXT_CLOUD_CHOICE: "GLOBAL-MULTI",
  YEXT_CLOUD_REGION: "US",
  YEXT_ENVIRONMENT: "PROD",
  YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY: "fixture-mapbox-api-key",
  YEXT_MAPBOX_API_KEY: "fixture-mapbox-api-key",
  YEXT_SEARCH_API_KEY: "fixture-search-api-key",
};

const LOCATOR_TEST_HOURS = {
  sunday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  monday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  tuesday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  wednesday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  thursday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  friday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
  saturday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
};

const createLocatorApiResult = ({
  id,
  name,
  entityType,
  line1,
  city,
  region,
  postalCode,
  latitude,
  longitude,
  distance,
  distanceFromFilter,
  services,
}: {
  id: string;
  name: string;
  entityType: string;
  line1: string;
  city: string;
  region: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  distance: number;
  distanceFromFilter: number;
  services: string[];
}) => ({
  data: {
    id,
    slug: id,
    type: entityType,
    name,
    timezone: "America/New_York",
    address: {
      line1,
      city,
      region,
      postalCode,
      countryCode: "US",
    },
    additionalHoursText: "Holiday hours may vary",
    hours: LOCATOR_TEST_HOURS,
    mainPhone: "+12025550101",
    emails: [`${id}@example.com`],
    services,
    headshot: {
      url: LOCATOR_TEST_IMAGE_URL,
      height: 80,
      width: 80,
      alternateText: name,
    },
    website: `https://example.com/${id}`,
    yextDisplayCoordinate: {
      latitude,
      longitude,
    },
    meta: {
      locale: "en",
      isPrimaryLocale: true,
    },
  },
  distance,
  distanceFromFilter,
  highlightedFields: {},
});

const DEFAULT_LOCATOR_RESULTS = [
  createLocatorApiResult({
    id: "galaxy-grill",
    name: "Galaxy Grill",
    entityType: "location",
    line1: "1101 Wilson Blvd",
    city: "Arlington",
    region: "VA",
    postalCode: "22209",
    latitude: 38.895546,
    longitude: -77.069915,
    distance: 1609,
    distanceFromFilter: 804,
    services: ["Dine-in", "Delivery", "Takeout"],
  }),
  createLocatorApiResult({
    id: "nebula-bites",
    name: "Nebula Bites",
    entityType: "location",
    line1: "725 14th St NW",
    city: "Washington",
    region: "DC",
    postalCode: "20005",
    latitude: 38.90362,
    longitude: -77.03118,
    distance: 3218,
    distanceFromFilter: 1609,
    services: ["Pickup", "Curbside"],
  }),
  createLocatorApiResult({
    id: "comet-cafe",
    name: "Comet Cafe",
    entityType: "location",
    line1: "1500 Market St",
    city: "Philadelphia",
    region: "PA",
    postalCode: "19102",
    latitude: 39.95289,
    longitude: -75.16624,
    distance: 8046,
    distanceFromFilter: 4828,
    services: ["Coffee", "Breakfast"],
  }),
];

const MULTI_PAGESET_LOCATOR_RESULTS = [
  createLocatorApiResult({
    id: "galaxy-grill",
    name: "Galaxy Grill",
    entityType: "location",
    line1: "1101 Wilson Blvd",
    city: "Arlington",
    region: "VA",
    postalCode: "22209",
    latitude: 38.895546,
    longitude: -77.069915,
    distance: 1609,
    distanceFromFilter: 804,
    services: ["Dine-in", "Delivery", "Takeout"],
  }),
  createLocatorApiResult({
    id: "nebula-noodles",
    name: "Nebula Noodles",
    entityType: "restaurant",
    line1: "19 W 44th St",
    city: "New York",
    region: "NY",
    postalCode: "10036",
    latitude: 40.75562,
    longitude: -73.98093,
    distance: 4023,
    distanceFromFilter: 2414,
    services: ["Lunch", "Dinner"],
  }),
  createLocatorApiResult({
    id: "orbit-atm",
    name: "Orbit ATM",
    entityType: "atm",
    line1: "401 7th St NW",
    city: "Washington",
    region: "DC",
    postalCode: "20004",
    latitude: 38.89341,
    longitude: -77.01714,
    distance: 6437,
    distanceFromFilter: 3218,
    services: ["24/7 Access"],
  }),
];

const createLocatorVerticalSearchResponse = (results: any[]) => ({
  meta: {
    uuid: "locator-fixture-uuid",
    errors: [],
  },
  response: {
    queryId: "locator-fixture-query-id",
    verticalConfigId: "locations",
    source: "KNOWLEDGE_MANAGER",
    resultsCount: results.length,
    results,
    facets: [],
  },
});

const createLocatorFilterSearchResponse = () => ({
  meta: {
    uuid: "locator-filter-fixture-uuid",
    errors: [],
  },
  response: {
    businessId: "4174974",
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
                  lat: 38.895546,
                  lng: -77.069915,
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

const getLocatorFixtureResults = (document: Record<string, any>) =>
  document.__?.locatorSourcePageSets
    ? MULTI_PAGESET_LOCATOR_RESULTS
    : DEFAULT_LOCATOR_RESULTS;

const createLocatorFetchMock = (document: Record<string, any>) => {
  const results = getLocatorFixtureResults(document);

  return vi.fn(async (input: string | URL | Request) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (url.includes("/search/vertical/query")) {
      return new Response(JSON.stringify(createLocatorVerticalSearchResponse(results)), {
        status: 200,
      });
    }

    if (url.includes("/search/filtersearch")) {
      return new Response(JSON.stringify(createLocatorFilterSearchResponse()), {
        status: 200,
      });
    }

    throw new Error(`Unexpected fetch in Locator test: ${url}`);
  });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

// Uses the content endpoint from
// https://www.yext.com/s/4174974/yextsites/155048/editor#pageSetId=locations
const tests: ComponentTest[] = [
  {
    name: "latest version default props with empty document",
    document: {},
    props: { ...LocatorComponent.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "latest version default props",
    document: {
      locale: "en",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        ...LOCATOR_TEST_ENV,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            source: "accounts/4174974/sites/155048/pagesets/locations",
            experienceKey: "locator-41",
            entityType: "location",
          },
        },
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    },
    props: { ...LocatorComponent.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "latest version multi-pageset default props",
    document: {
      locale: "en",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
        locatorSourcePageSets: JSON.stringify({
          "accounts/4174974/sites/163770/pagesets/locations": {
            pathInfo: {
              template:
                "locations/[[address.region]]/[[address.city]]/[[address.line1]]",
              primaryLocale: "en",
              includeLocalePrefixForPrimaryLocale: false,
            },
            entityType: "location",
            savedFilter: "1415752775",
            internalSavedSearchId: 262225,
          },
          "accounts/4174974/sites/163770/pagesets/restaurants": {
            pathInfo: {
              template:
                "restaurants/[[address.region]]/[[address.city]]/[[address.line1]]",
              primaryLocale: "en",
              includeLocalePrefixForPrimaryLocale: false,
            },
            entityType: "restaurant",
            savedFilter: "1491716705",
            internalSavedSearchId: 276295,
          },
          "accounts/4174974/sites/163770/pagesets/atms": {
            pathInfo: {
              template:
                "atms/[[address.region]]/[[address.city]]/[[address.line1]]",
              primaryLocale: "en",
              includeLocalePrefixForPrimaryLocale: false,
            },
            entityType: "atm",
          },
        }),
      },
      _env: {
        ...LOCATOR_TEST_ENV,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            experienceKey: "locator-41",
            sources: [
              "accounts/4174974/sites/163770/pagesets/locations",
              "accounts/4174974/sites/163770/pagesets/restaurants",
              "accounts/4174974/sites/163770/pagesets/atms",
            ],
            entityTypeScope: [
              {
                entityType: "financialProfessional",
                savedFilter: "1491722104",
              },
            ],
          },
        },
      }),
    },
    props: { ...LocatorComponent.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "latest version non-default props",
    document: {
      locale: "en",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        ...LOCATOR_TEST_ENV,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            source: "accounts/4174974/sites/155048/pagesets/locations",
            experienceKey: "locator-41",
            entityType: "location",
          },
        },
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    },
    props: {
      mapStyle: "mapbox://styles/mapbox/dark-v11",
      locationStyles: [
        {
          entityType: "location",
          pinIcon: {
            type: "none",
          },
          pinColor: backgroundColors.background6.value,
        },
      ],
      distanceDisplay: "distanceFromSearch",
      filters: {
        openNowButton: true,
        showDistanceOptions: true,
      },
      resultCard: [
        {
          props: {
            entityType: "location",
            primaryHeading: {
              field: "name",
              constantValue: { en: "", hasLocalizedValue: "true" },
              constantValueEnabled: false,
              headingLevel: 5,
            },
            secondaryHeading: {
              field: "name",
              constantValue: { en: "", hasLocalizedValue: "true" },
              constantValueEnabled: false,
              variant: "base",
              liveVisibility: false,
            },
            tertiaryHeading: {
              field: "name",
              constantValue: { en: "", hasLocalizedValue: "true" },
              constantValueEnabled: false,
              variant: "base",
              liveVisibility: false,
            },
            icons: true,
            hours: {
              table: {
                startOfWeek: "monday",
                collapseDays: true,
                showAdditionalHoursText: false,
              },
              liveVisibility: true,
            },
            address: {
              showGetDirectionsLink: true,
              liveVisibility: true,
            },
            phone: {
              field: "mainPhone",
              phoneFormat: "domestic",
              includePhoneHyperlink: true,
              liveVisibility: false,
            },
            email: {
              field: "emails",
              liveVisibility: false,
            },
            services: {
              field: "services",
              liveVisibility: false,
            },
            primaryCTA: {
              label: "Visit Page",
              variant: "primary",
              liveVisibility: true,
            },
            secondaryCTA: {
              label: "Call to Action",
              link: "https://www.yext.com",
              variant: "secondary",
              liveVisibility: true,
            },
            image: {
              field: "headshot",
              constantValue: {
                en: { url: "", height: 0, width: 0 },
                hasLocalizedValue: "true",
              },
              constantValueEnabled: false,
              liveVisibility: false,
            },
          },
        },
      ],
    },
    version: migrationRegistry.length,
  },
  {
    name: "version 24 with filters",
    document: {
      locale: "en",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        ...LOCATOR_TEST_ENV,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            source: "accounts/4174974/sites/155048/pagesets/locations",
            experienceKey: "locator-41",
            entityType: "location",
          },
        },
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    },
    props: {
      filters: {
        openNowButton: true,
        showDistanceOptions: true,
      },
      resultCard: {
        primaryHeading: {
          field: "name",
          headingLevel: 3,
        },
        secondaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        tertiaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        icons: true,
        hours: {
          table: {
            startOfWeek: "today",
            collapseDays: false,
            showAdditionalHoursText: false,
          },
          liveVisibility: true,
        },
        address: {
          showGetDirectionsLink: true,
          liveVisibility: true,
        },
        phone: {
          field: "mainPhone",
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          liveVisibility: true,
        },
        email: {
          field: "emails",
          liveVisibility: false,
        },
        services: {
          field: "services",
          liveVisibility: false,
        },
        primaryCTA: {
          variant: "primary",
          liveVisibility: true,
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "#",
          variant: "secondary",
          liveVisibility: false,
        },
        image: {
          field: "headshot",
          liveVisibility: false,
        },
      },
    },
    interactions: async (page) => {
      const filterButton = page.getByText("Filter");
      await act(async () => {
        await filterButton.click();
      });
    },
    version: 24,
  },
  {
    name: "version 60 custom heading",
    document: {
      locale: "en",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        ...LOCATOR_TEST_ENV,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            source: "accounts/4174974/sites/155048/pagesets/locations",
            experienceKey: "locator-41",
            entityType: "location",
          },
        },
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    },
    props: {
      filters: {
        openNowButton: false,
        showDistanceOptions: false,
      },
      pageHeading: {
        title: { en: "Custom Heading", hasLocalizedValue: "true" },
      },
      resultCard: {
        primaryHeading: {
          field: "name",
          headingLevel: 3,
        },
        secondaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        tertiaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        icons: true,
        hours: {
          table: {
            startOfWeek: "today",
            collapseDays: false,
            showAdditionalHoursText: false,
          },
          liveVisibility: true,
        },
        address: {
          showGetDirectionsLink: true,
          liveVisibility: true,
        },
        phone: {
          field: "mainPhone",
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          liveVisibility: true,
        },
        email: {
          field: "emails",
          liveVisibility: false,
        },
        services: {
          field: "services",
          liveVisibility: false,
        },
        primaryCTA: {
          variant: "primary",
          liveVisibility: true,
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "#",
          variant: "secondary",
          liveVisibility: false,
        },
        image: {
          field: "headshot",
          liveVisibility: false,
        },
      },
    },
    version: 60,
  },
  {
    name: "version 60 custom heading with site color 2",
    document: {
      locale: "en",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        ...LOCATOR_TEST_ENV,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            source: "accounts/4174974/sites/155048/pagesets/locations",
            experienceKey: "locator-41",
            entityType: "location",
          },
        },
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    },
    props: {
      filters: {
        openNowButton: false,
        showDistanceOptions: false,
      },
      pageHeading: {
        title: { en: "Custom Heading", hasLocalizedValue: "true" },
        color: backgroundColors.color2.value,
      },
      resultCard: {
        primaryHeading: {
          field: "name",
          headingLevel: 3,
        },
        secondaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        tertiaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        icons: true,
        hours: {
          table: {
            startOfWeek: "today",
            collapseDays: false,
            showAdditionalHoursText: false,
          },
          liveVisibility: true,
        },
        address: {
          showGetDirectionsLink: true,
          liveVisibility: true,
        },
        phone: {
          field: "mainPhone",
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          liveVisibility: true,
        },
        email: {
          field: "emails",
          liveVisibility: false,
        },
        services: {
          field: "services",
          liveVisibility: false,
        },
        primaryCTA: {
          variant: "primary",
          liveVisibility: true,
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "#",
          variant: "secondary",
          liveVisibility: false,
        },
        image: {
          field: "headshot",
          liveVisibility: false,
        },
      },
    },
    version: 60,
  },
  {
    name: "version 60 custom title and result cards with site color 3",
    document: {
      locale: "en",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        ...LOCATOR_TEST_ENV,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            source: "accounts/4174974/sites/155048/pagesets/locations",
            experienceKey: "locator-41",
            entityType: "location",
          },
        },
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    },
    props: {
      filters: {
        openNowButton: false,
        showDistanceOptions: false,
      },
      pageHeading: {
        title: { en: "Custom Heading", hasLocalizedValue: "true" },
      },
      resultCard: {
        primaryHeading: {
          field: "name",
          headingLevel: 3,
          color: backgroundColors.color3.value,
        },
        secondaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        tertiaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        icons: true,
        hours: {
          table: {
            startOfWeek: "today",
            collapseDays: false,
            showAdditionalHoursText: false,
          },
          liveVisibility: true,
        },
        address: {
          showGetDirectionsLink: true,
          liveVisibility: true,
        },
        phone: {
          field: "mainPhone",
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          liveVisibility: true,
        },
        email: {
          field: "emails",
          liveVisibility: false,
        },
        services: {
          field: "services",
          liveVisibility: false,
        },
        primaryCTA: {
          variant: "primary",
          liveVisibility: true,
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "#",
          variant: "secondary",
          liveVisibility: false,
        },
        image: {
          field: "headshot",
          liveVisibility: false,
        },
      },
    },
    version: 60,
  },
  {
    name: "version 64 static headings",
    document: {
      locale: "en",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        ...LOCATOR_TEST_ENV,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            source: "accounts/4174974/sites/155048/pagesets/locations",
            experienceKey: "locator-41",
            entityType: "location",
          },
        },
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    },
    props: {
      filters: {
        openNowButton: false,
        showDistanceOptions: false,
      },
      resultCard: {
        primaryHeading: {
          field: "name",
          constantValue: { en: "", hasLocalizedValue: "true" },
          constantValueEnabled: false,
          headingLevel: 3,
        },
        secondaryHeading: {
          field: "name",
          constantValue: {
            en: "Secondary Static",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
          variant: "base",
          liveVisibility: true,
        },
        tertiaryHeading: {
          field: "name",
          constantValue: { en: "Tertiary Static", hasLocalizedValue: "true" },
          constantValueEnabled: true,
          variant: "base",
          liveVisibility: true,
        },
        icons: true,
        hours: {
          table: {
            startOfWeek: "today",
            collapseDays: false,
            showAdditionalHoursText: false,
          },
          liveVisibility: true,
        },
        address: {
          showGetDirectionsLink: true,
          liveVisibility: true,
        },
        phone: {
          field: "mainPhone",
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          liveVisibility: true,
        },
        email: {
          field: "emails",
          liveVisibility: false,
        },
        services: {
          field: "services",
          liveVisibility: false,
        },
        primaryCTA: {
          variant: "primary",
          liveVisibility: true,
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "#",
          variant: "secondary",
          liveVisibility: false,
        },
        image: {
          field: "headshot",
          constantValue: {
            en: { url: "", height: 0, width: 0 },
            hasLocalizedValue: "true",
          },
          constantValueEnabled: false,
          liveVisibility: false,
        },
      },
    },
    interactions: async (page) => {
      await expect
        .element(page.getByText("Secondary Static").first())
        .toBeVisible();
    },
    version: 64,
  },
  {
    name: "version 64 static image",
    document: {
      locale: "en",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        ...LOCATOR_TEST_ENV,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            source: "accounts/4174974/sites/155048/pagesets/locations",
            experienceKey: "locator-41",
            entityType: "location",
          },
        },
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    },
    props: {
      filters: {
        openNowButton: false,
        showDistanceOptions: false,
      },
      resultCard: {
        primaryHeading: {
          field: "name",
          constantValue: { en: "", hasLocalizedValue: "true" },
          constantValueEnabled: false,
          headingLevel: 3,
        },
        secondaryHeading: {
          field: "name",
          constantValue: { en: "", hasLocalizedValue: "true" },
          constantValueEnabled: false,
          variant: "base",
          liveVisibility: false,
        },
        tertiaryHeading: {
          field: "name",
          constantValue: { en: "", hasLocalizedValue: "true" },
          constantValueEnabled: false,
          variant: "base",
          liveVisibility: false,
        },
        icons: true,
        hours: {
          table: {
            startOfWeek: "today",
            collapseDays: false,
            showAdditionalHoursText: false,
          },
          liveVisibility: true,
        },
        address: {
          showGetDirectionsLink: true,
          liveVisibility: true,
        },
        phone: {
          field: "mainPhone",
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          liveVisibility: true,
        },
        email: {
          field: "emails",
          liveVisibility: false,
        },
        services: {
          field: "services",
          liveVisibility: false,
        },
        primaryCTA: {
          variant: "primary",
          liveVisibility: true,
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "#",
          variant: "secondary",
          liveVisibility: false,
        },
        image: {
          field: "headshot",
          constantValue: {
            en: {
              url: LOCATOR_TEST_IMAGE_URL,
              height: 80,
              width: 80,
            },
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
          liveVisibility: true,
        },
      },
    },
    version: 64,
  },
];

const screenshotThreshold = 30;

describe("Locator", async () => {
  const puckConfig: Config = {
    components: { Locator: LocatorComponent },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({
      name,
      document,
      props,
      interactions,
      version,
      viewport: { width, height, name: viewportName },
    }) => {
      let data = migrate(
        {
          root: {
            props: {
              version,
            },
          },
          content: [
            {
              type: "Locator",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      data = await resolveAllData(data, puckConfig, {
        streamDocument: document,
      });

      const translations = await injectTranslations(document);
      vi.stubGlobal("fetch", createLocatorFetchMock(document));

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document, translations }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);

      // Unless testing empty state, wait for search to load
      if (!name.includes("empty document")) {
        await waitFor(() => {
          screen.getAllByText("Galaxy Grill");
          const opacityContainer = container.querySelector("#innerDiv div");
          if (opacityContainer) {
            expect(getComputedStyle(opacityContainer).opacity).toBe("1");
          }
        });
      }

      const hideDistance = async () => {
        await act(async () => {
          // Mask distance badges so screenshots focus on layout instead of label text.
          const allDivs = container.querySelectorAll("div");
          allDivs.forEach((div) => {
            if (div.textContent?.includes("mi") && !div.children.length) {
              div.style.backgroundColor = "black";
              div.style.width = "8em";
            }
          });
        });
      };

      await hideDistance();

      await expect(`Locator/[${viewportName}] ${name}`).toMatchScreenshot({
        customThreshold: screenshotThreshold,
      });
      const results = await axe(container);
      logSuppressedWcagViolations(results);
      // TODO: Re-enable WCAG test
      // expect(results).toHaveNoViolations()

      if (interactions) {
        await interactions(page);
        await hideDistance();
        await expect(
          `Locator/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot({ customThreshold: screenshotThreshold });
        const results = await axe(container);
        logSuppressedWcagViolations(results);
      }
    }
  );
});
