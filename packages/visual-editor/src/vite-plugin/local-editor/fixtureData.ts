import type { ResolvedLocalEditorLayoutConfig } from "./types.ts";

type FixtureDocument = Record<string, unknown>;

const locale = "en";
const directoryManagerId = "local-editor-locations";

const directoryParent = (name: string, slug: string): FixtureDocument => ({
  name,
  slug,
});

const directoryChild = (
  id: string,
  name: string,
  slug: string,
  entityType: string,
  extra: FixtureDocument = {}
): FixtureDocument => ({
  id,
  name,
  slug,
  meta: { entityType: { id: entityType }, locale },
  ...extra,
});

const directoryDocument = (
  id: string,
  name: string,
  slug: string,
  entityType: string,
  children: FixtureDocument[],
  parents: FixtureDocument[] = [],
  extra: FixtureDocument = {}
): FixtureDocument => ({
  __: { entityPageSet: {}, isPrimaryLocale: true, name: "local-editor" },
  _pageset: JSON.stringify({
    config: {
      urlTemplate: {
        primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
      },
    },
  }),
  businessId: 1,
  dm_childEntityIds: children.map((child) => child.id),
  dm_directoryChildren: children,
  dm_directoryManagerId: directoryManagerId,
  ...(parents.length > 0
    ? {
        [`dm_directoryParents_${directoryManagerId.replaceAll("-", "_")}`]:
          parents,
      }
    : {}),
  id,
  locale,
  meta: { entityType: { id: entityType }, locale },
  name,
  siteDomain: "",
  siteId: 1,
  siteInternalHostName: "",
  slug,
  ...extra,
});

/**
 * Builds local-only Directory and Locator documents for layouts that cannot
 * get documents from `yext pages generate-test-data`.
 */
export const createLocalEditorFixtureDocuments = (
  layouts: ResolvedLocalEditorLayoutConfig[]
): Array<{ layoutId: string; document: FixtureDocument }> => {
  return layouts.flatMap((layout) => {
    if (layout.dataSource !== "fixture") {
      return [];
    }
    return layout.pageSetType === "DIRECTORY"
      ? createDirectoryFixtures(layout.layoutId)
      : [
          {
            layoutId: layout.layoutId,
            document: createLocatorFixture(layout.layoutId),
          },
        ];
  });
};

const createDirectoryFixtures = (
  layoutId: string
): Array<{ layoutId: string; document: FixtureDocument }> => {
  const country = directoryChild(
    "fixture-directory-country",
    "United States",
    "us",
    "dm_country",
    { dm_addressCountryDisplayName: "United States" }
  );
  const region = directoryChild(
    "fixture-directory-region",
    "Virginia",
    "us/va",
    "dm_region",
    {
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
    }
  );
  const city = directoryChild(
    "fixture-directory-city",
    "Arlington",
    "us/va/arlington",
    "dm_city",
    {
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
    }
  );
  const location = directoryChild(
    "fixture-directory-location",
    "Example Location",
    "us/va/arlington/example-location",
    "location",
    {
      address: {
        line1: "1101 Wilson Blvd",
        city: "Arlington",
        region: "VA",
        postalCode: "22209",
        countryCode: "US",
      },
      hours: {
        monday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
      },
      mainPhone: "+12025550101",
      timezone: "America/New_York",
    }
  );
  const root = directoryDocument(
    "fixture-directory-root",
    "Locations Directory",
    "index.html",
    "dm_root",
    [country]
  );
  const countryDocument = directoryDocument(
    String(country.id),
    "US",
    "us",
    "dm_country",
    [region],
    [directoryParent("Locations Directory", "index.html")],
    { dm_addressCountryDisplayName: "United States" }
  );
  const regionDocument = directoryDocument(
    String(region.id),
    "VA",
    "us/va",
    "dm_region",
    [city],
    [
      directoryParent("Locations Directory", "index.html"),
      directoryParent("US", "us"),
    ],
    {
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
    }
  );
  const cityDocument = directoryDocument(
    String(city.id),
    "Arlington",
    "us/va/arlington",
    "dm_city",
    [location],
    [
      directoryParent("Locations Directory", "index.html"),
      directoryParent("US", "us"),
      directoryParent("VA", "us/va"),
    ],
    {
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
    }
  );
  return [root, countryDocument, regionDocument, cityDocument].map(
    (document) => ({ layoutId, document })
  );
};

const createLocatorFixture = (layoutId: string): FixtureDocument => ({
  __: { entityPageSet: {}, isPrimaryLocale: true, name: "local-editor" },
  _env: {
    YEXT_CLOUD_CHOICE: "GLOBAL-MULTI",
    YEXT_CLOUD_REGION: "US",
    YEXT_ENVIRONMENT: "PROD",
    YEXT_EDIT_LAYOUT_MODE_MAPBOX_API_KEY: "",
    YEXT_MAPBOX_API_KEY: "",
    YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "local-editor-fixture-key",
    YEXT_SEARCH_API_KEY: "local-editor-fixture-key",
  },
  _pageset: JSON.stringify({
    type: "LOCATOR",
    typeConfig: {
      locatorConfig: { entityType: "location", experienceKey: "local-editor" },
    },
  }),
  businessId: 1,
  id: `fixture-locator-${layoutId}`,
  locale,
  meta: { entityType: { id: "locator" }, locale },
  name: "Local Editor Locator",
  siteDomain: "",
  siteId: 1,
  siteInternalHostName: "",
  slug: "local-editor-locator",
  yextDisplayCoordinate: { latitude: 38.895546, longitude: -77.069915 },
});
