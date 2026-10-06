import { afterEach, describe, expect, it, vi } from "vitest";
import { getSchema } from "./getSchema.ts";
import { migrate } from "../migrate.ts";
import { migrationRegistry } from "../../components/migrations/migrationRegistry.ts";

describe("getSchema - entity pages", () => {
  it("returns resolved schema markup for a location and no directory/reviews", async () => {
    const testData = {
      relativePrefixToRoot: "../../",
      path: "/us/va/123-main-street",
      document: {
        name: "Test Name",
        uid: 123,
        services: [],
        __: {
          layout: JSON.stringify({
            root: {
              props: {
                schemaMarkup: `{
                "name": "[[name]]",
                "description": "",
                "brand": "[[brand]]",
                "services": "[[services]]",
                "address": "[[address]]"
              }`,
              },
            },
          }),
        },
        meta: {
          entityType: {
            id: "location",
          },
        },
        siteDomain: "example.com",
      },
    };
    const schema = getSchema(testData);

    expect(schema).toEqual({
      "@graph": [
        {
          name: "Test Name",
        },
      ],
    });
  });

  it("resolves resolved schema markup for a location with directory and reviews", async () => {
    const testData = {
      relativePrefixToRoot: "../../",
      path: "us/va/123-main-street",
      document: {
        name: "Test Name",
        uid: 123,
        siteDomain: "yext.com",
        __: {
          layout: JSON.stringify({
            root: {
              props: {
                schemaMarkup: `{
                "@type": "[[primaryCategory]]",
                "@id": "https://[[siteDomain]]/#[[uid]]-[[primaryCategory]]",
                "url": "https://[[siteDomain]]/[[path]]",
                "name": "[[name]]"
              }`,
              },
            },
          }),
        },
        meta: {
          entityType: {
            id: "location",
          },
        },
        ref_reviewsAgg: [
          {
            publisher: "FACEBOOK",
            reviewCount: 0,
          },
          {
            publisher: "EXTERNALFIRSTPARTY",
            reviewCount: 0,
          },
          {
            publisher: "GOOGLEMYBUSINESS",
            reviewCount: 0,
          },
          {
            averageRating: 3.7142856,
            publisher: "FIRSTPARTY",
            reviewCount: 7,
            topReviews: [
              {
                authorName: "Kyle G",
                content:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                rating: 4,
                reviewDate: "2025-06-27T03:38:17.297Z",
                reviewId: 1533706271,
              },
              {
                authorName: "Kyle D",
                content: "Wow what a terrible castle!",
                rating: 1,
                reviewDate: "2025-06-30T01:18:35.277Z",
                reviewId: 1534364595,
              },
              {
                authorName: "Kyle C",
                content: "This was an awesome castle!",
                rating: 5,
                reviewDate: "2025-06-30T01:18:12.715Z",
                reviewId: 1534364564,
              },
              {
                authorName: "Kyle A",
                content: "Pretty good castle",
                rating: 4,
                reviewDate: "2025-06-30T01:17:12.023Z",
                reviewId: 1534364511,
              },
              {
                authorName: "Kyle B",
                content: "Decent Castle",
                rating: 3,
                reviewDate: "2025-06-30T01:17:29.641Z",
                reviewId: 1534364531,
              },
            ],
          },
        ],
        dm_directoryParents_63590_locations: [
          { name: "Locations Directory", slug: "index.html" },
          {
            name: "US",
            slug: "us",
            dm_addressCountryDisplayName: "United States",
          },
          {
            name: "NY",
            slug: "us/ny",
            dm_addressCountryDisplayName: "United States",
            dm_addressRegionDisplayName: "New York",
          },
          {
            name: "Brooklyn",
            slug: "us/ny/brooklyn",
            dm_addressCountryDisplayName: "United States",
            dm_addressRegionDisplayName: "New York",
          },
        ],
      },
    };
    const schema = getSchema(testData);

    expect(schema).toEqual({
      "@graph": [
        {
          "@type": "LocalBusiness",
          "@id": "https://yext.com/#123-LocalBusiness",
          url: "https://yext.com/us/va/123-main-street",
          name: "Test Name",
        },
        {
          "@type": "BreadcrumbList",
          "@id": "https://yext.com/#123-breadcrumbs",
          "@context": "https://schema.org",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Locations Directory",
              item: "https://yext.com/index.html",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "US",
              item: "https://yext.com/us",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "NY",
              item: "https://yext.com/us/ny",
            },
            {
              "@type": "ListItem",
              position: 4,
              name: "Brooklyn",
              item: "https://yext.com/us/ny/brooklyn",
            },
            {
              "@type": "ListItem",
              position: 5,
              name: "Test Name",
              item: "https://yext.com/us/va/123-main-street",
            },
          ],
        },
        {
          "@type": "AggregateRating",
          "@id": "https://yext.com/#123-aggregaterating",
          ratingValue: "3.7142856",
          reviewCount: "7",
          itemReviewed: {
            "@id": "https://yext.com/#123-LocalBusiness",
          },
        },
      ],
    });
  });

  it("resolves resolved schema markup for a location with directory and reviews, no schema markup, and no site domain", async () => {
    const testData = {
      relativePrefixToRoot: "../../",
      path: "us/va/123-main-street",
      document: {
        name: "Test Name",
        uid: 123,
        __: {
          layout: JSON.stringify({
            root: {
              props: {},
            },
          }),
        },
        meta: {
          entityType: {
            id: "location",
          },
        },
        ref_reviewsAgg: [
          {
            publisher: "FACEBOOK",
            reviewCount: 0,
          },
          {
            publisher: "EXTERNALFIRSTPARTY",
            reviewCount: 0,
          },
          {
            publisher: "GOOGLEMYBUSINESS",
            reviewCount: 0,
          },
          {
            averageRating: 3.7142856,
            publisher: "FIRSTPARTY",
            reviewCount: 7,
            topReviews: [
              {
                authorName: "Kyle G",
                content:
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
                rating: 4,
                reviewDate: "2025-06-27T03:38:17.297Z",
                reviewId: 1533706271,
              },
              {
                authorName: "Kyle D",
                content: "Wow what a terrible castle!",
                rating: 1,
                reviewDate: "2025-06-30T01:18:35.277Z",
                reviewId: 1534364595,
              },
              {
                authorName: "Kyle C",
                content: "This was an awesome castle!",
                rating: 5,
                reviewDate: "2025-06-30T01:18:12.715Z",
                reviewId: 1534364564,
              },
              {
                authorName: "Kyle A",
                content: "Pretty good castle",
                rating: 4,
                reviewDate: "2025-06-30T01:17:12.023Z",
                reviewId: 1534364511,
              },
              {
                authorName: "Kyle B",
                content: "Decent Castle",
                rating: 3,
                reviewDate: "2025-06-30T01:17:29.641Z",
                reviewId: 1534364531,
              },
            ],
          },
        ],
        dm_directoryParents_63590_locations: [
          { name: "Locations Directory", slug: "index.html" },
          {
            name: "US",
            slug: "us",
            dm_addressCountryDisplayName: "United States",
          },
          {
            name: "NY",
            slug: "us/ny",
            dm_addressCountryDisplayName: "United States",
            dm_addressRegionDisplayName: "New York",
          },
          {
            name: "Brooklyn",
            slug: "us/ny/brooklyn",
            dm_addressCountryDisplayName: "United States",
            dm_addressRegionDisplayName: "New York",
          },
        ],
      },
    };
    const schema = getSchema(testData);

    expect(schema).toEqual({
      "@graph": [
        {
          "@context": "https://schema.org",
          "@id": "#123-LocalBusiness",
          "@type": "LocalBusiness",
          name: "Test Name",
          url: "/us/va/123-main-street",
        },
        {
          "@context": "https://schema.org",
          "@id": "#123-breadcrumbs",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              item: "/index.html",
              name: "Locations Directory",
              position: 1,
            },
            {
              "@type": "ListItem",
              item: "/us",
              name: "US",
              position: 2,
            },
            {
              "@type": "ListItem",
              item: "/us/ny",
              name: "NY",
              position: 3,
            },
            {
              "@type": "ListItem",
              item: "/us/ny/brooklyn",
              name: "Brooklyn",
              position: 4,
            },
            {
              "@type": "ListItem",
              item: "/us/va/123-main-street",
              name: "Test Name",
              position: 5,
            },
          ],
        },
        {
          "@id": "#123-aggregaterating",
          "@type": "AggregateRating",
          itemReviewed: {
            "@id": "#123-LocalBusiness",
          },
          ratingValue: "3.7142856",
          reviewCount: "7",
        },
      ],
    });
  });

  it("resolves resolved schema markup for a location with no schema markup and no directory/reviews", async () => {
    const testData = {
      relativePrefixToRoot: "../../",
      path: "us/va/123-main-street",
      document: {
        uid: 123,
        name: "Test Name",
        siteDomain: "yext.com",
        hours: {
          monday: { openIntervals: [{ end: "12:00", start: "9:00" }] },
          tuesday: {
            openIntervals: [
              { end: "18:00", start: "14:00" },
              { end: "12:00", start: "9:00" },
            ],
          },
          wednesday: { openIntervals: [{ end: "12:00", start: "9:00" }] },
          thursday: { openIntervals: [{ end: "17:00", start: "9:00" }] },
          friday: { isClosed: true },
          saturday: { isClosed: true },
          sunday: { isClosed: true },
        },
        address: {
          line1: "123 Test St",
          city: "Washington",
          region: "DC",
          postalCode: "20000",
          countryCode: "US",
        },
        ref_categories: [
          {
            fullDisplayName:
              "Automóviles y vehículos > Reparación de automóviles",
          },
        ],
        mainPhone: "123-456-7890",
        description: "test description",
        __: {
          categoryRootAncestorId: 370,
          layout: JSON.stringify({
            root: {
              props: {
                otherField: "test",
              },
            },
          }),
        },
        meta: {
          entityType: {
            id: "location",
          },
        },
      },
    };
    const schema = getSchema(testData);

    expect(schema).toEqual({
      "@graph": [
        {
          "@context": "https://schema.org",
          "@id": "https://yext.com/#123-AutomotiveBusiness",
          url: "https://yext.com/us/va/123-main-street",
          "@type": "AutomotiveBusiness",
          name: "Test Name",
          address: {
            "@type": "PostalAddress",
            streetAddress: "123 Test St",
            addressLocality: "Washington",
            addressRegion: "DC",
            postalCode: "20000",
            addressCountry: "US",
          },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              closes: "12:00",
              dayOfWeek: [
                "https://schema.org/Monday",
                "https://schema.org/Tuesday",
                "https://schema.org/Wednesday",
              ],
              opens: "9:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              closes: "18:00",
              dayOfWeek: "https://schema.org/Tuesday",
              opens: "14:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              closes: "17:00",
              dayOfWeek: "https://schema.org/Thursday",
              opens: "9:00",
            },
            {
              "@type": "OpeningHoursSpecification",
              closes: "00:00",
              dayOfWeek: [
                "https://schema.org/Friday",
                "https://schema.org/Saturday",
                "https://schema.org/Sunday",
              ],
              opens: "00:00",
            },
          ],
          description: "test description",
          telephone: "123-456-7890",
        },
      ],
    });
  });
});

describe("getSchema - directory pages", () => {
  it("resolves resolved schema markup for a directory city with a site domain", async () => {
    const testData = {
      relativePrefixToRoot: "../../",
      path: "us/ny/nyc",
      document: {
        name: "New York City",
        uid: 999,
        siteDomain: "yext.com",
        __: {
          layout: JSON.stringify({
            root: {
              props: {},
            },
          }),
        },
        meta: {
          entityType: {
            id: "dm_city",
          },
        },
        dm_directoryChildren: [
          {
            __: {
              entityPageSetUrlTemplates:
                '{"primary":"[[address.region]]/[[address.city]]/[[address.line1]]"}',
            },
            address: {
              city: "Arlington",
              countryCode: "US",
              line1: "1101 Wilson Blvd",
              postalCode: "22209",
              region: "VA",
            },
            hours: {
              friday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              monday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              saturday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              sunday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              thursday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              tuesday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              wednesday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
            },
            mainPhone: "+12025551010",
            meta: {
              entityType: { id: "location", uid: 12345 },
              locale: "en",
            },
            name: "Galaxy Grill",
            timezone: "America/New_York",
            slug: "va/arlington/1101-wilson-blvd",
          },
          {
            __: {
              entityPageSetUrlTemplates:
                '{"primary":"[[address.region]]/[[address.city]]/[[address.line1]]"}',
            },
            address: {
              city: "Arlington",
              countryCode: "US",
              line1: "2101 Wilson Blvd",
              line2: "Suite 101",
              postalCode: "22209",
              region: "VA",
            },
            mainPhone: "+12025551010",
            hours: {
              friday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              monday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              saturday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              sunday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              thursday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              tuesday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              wednesday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
            },
            meta: {
              entityType: { id: "location", uid: 12346 },
              locale: "en",
            },
            name: "Galaxy Grill To Go",
            timezone: "America/New_York",
            slug: "va/arlington/2101-wilson-blvd",
          },
        ],
        dm_directoryParents_63590_locations: [
          { name: "Locations Directory", slug: "index.html" },
          {
            name: "US",
            slug: "us",
            dm_addressCountryDisplayName: "United States",
          },
          {
            name: "NY",
            slug: "us/ny",
            dm_addressCountryDisplayName: "United States",
            dm_addressRegionDisplayName: "New York",
          },
        ],
      },
    };
    const schema = getSchema(testData);

    expect(schema).toEqual({
      "@graph": [
        {
          "@context": "https://schema.org",
          "@id": "https://yext.com/#999-collectionpage",
          url: "https://yext.com/us/ny/nyc",
          "@type": "CollectionPage",
          name: "New York City",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: [
              {
                "@type": "ListItem",
                item: {
                  "@type": "Thing",
                  address: {
                    "@type": "PostalAddress",
                    addressCountry: "US",
                    addressLocality: "Arlington",
                    addressRegion: "VA",
                    postalCode: "22209",
                    streetAddress: "1101 Wilson Blvd",
                  },
                  name: "Galaxy Grill",
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: [
                        "https://schema.org/Monday",
                        "https://schema.org/Tuesday",
                        "https://schema.org/Wednesday",
                        "https://schema.org/Thursday",
                        "https://schema.org/Friday",
                        "https://schema.org/Saturday",
                        "https://schema.org/Sunday",
                      ],
                      opens: "10:00",
                      closes: "22:00",
                    },
                  ],
                  phone: "+12025551010",
                  url: "https://yext.com/va/arlington/1101-wilson-blvd",
                },
                position: 1,
              },
              {
                "@type": "ListItem",
                item: {
                  "@type": "Thing",
                  address: {
                    "@type": "PostalAddress",
                    addressCountry: "US",
                    addressLocality: "Arlington",
                    addressRegion: "VA",
                    postalCode: "22209",
                    streetAddress: "2101 Wilson Blvd",
                  },
                  name: "Galaxy Grill To Go",
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: [
                        "https://schema.org/Monday",
                        "https://schema.org/Tuesday",
                        "https://schema.org/Wednesday",
                        "https://schema.org/Thursday",
                        "https://schema.org/Friday",
                        "https://schema.org/Saturday",
                        "https://schema.org/Sunday",
                      ],
                      opens: "10:00",
                      closes: "22:00",
                    },
                  ],
                  phone: "+12025551010",
                  url: "https://yext.com/va/arlington/2101-wilson-blvd",
                },
                position: 2,
              },
            ],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@context": "https://schema.org",
          "@id": "https://yext.com/#999-breadcrumbs",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Locations Directory",
              item: "https://yext.com/index.html",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "US",
              item: "https://yext.com/us",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "NY",
              item: "https://yext.com/us/ny",
            },
            {
              "@type": "ListItem",
              position: 4,
              name: "New York City",
              item: "https://yext.com/us/ny/nyc",
            },
          ],
        },
      ],
    });
  });

  it("resolves resolved schema markup for a directory city with no site domain", async () => {
    const testData = {
      relativePrefixToRoot: "../../",
      path: "us/ny/nyc",
      document: {
        name: "New York City",
        uid: 999,
        __: {
          layout: JSON.stringify({
            root: {
              props: {},
            },
          }),
        },
        meta: {
          entityType: {
            id: "dm_city",
          },
        },
        dm_directoryChildren: [
          {
            __: {
              entityPageSetUrlTemplates:
                '{"primary":"[[address.region]]/[[address.city]]/[[address.line1]]"}',
            },
            address: {
              city: "Arlington",
              countryCode: "US",
              line1: "1101 Wilson Blvd",
              postalCode: "22209",
              region: "VA",
            },
            hours: {
              friday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              monday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              saturday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              sunday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              thursday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              tuesday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              wednesday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
            },
            mainPhone: "+12025551010",
            meta: {
              entityType: { id: "location", uid: 12345 },
              locale: "en",
            },
            name: "Galaxy Grill",
            timezone: "America/New_York",
            slug: "va/arlington/1101-wilson-blvd",
          },
          {
            __: {
              entityPageSetUrlTemplates:
                '{"primary":"[[address.region]]/[[address.city]]/[[address.line1]]"}',
            },
            address: {
              city: "Arlington",
              countryCode: "US",
              line1: "2101 Wilson Blvd",
              line2: "Suite 101",
              postalCode: "22209",
              region: "VA",
            },
            mainPhone: "+12025551010",
            hours: {
              friday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              monday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              saturday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              sunday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              thursday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              tuesday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
              wednesday: { openIntervals: [{ end: "22:00", start: "10:00" }] },
            },
            meta: {
              entityType: { id: "location", uid: 12346 },
              locale: "en",
            },
            name: "Galaxy Grill To Go",
            timezone: "America/New_York",
            slug: "va/arlington/2101-wilson-blvd",
          },
        ],
        dm_directoryParents_63590_locations: [
          { name: "Locations Directory", slug: "index.html" },
          {
            name: "US",
            slug: "us",
            dm_addressCountryDisplayName: "United States",
          },
          {
            name: "NY",
            slug: "us/ny",
            dm_addressCountryDisplayName: "United States",
            dm_addressRegionDisplayName: "New York",
          },
        ],
      },
    };
    const schema = getSchema(testData);

    expect(schema).toEqual({
      "@graph": [
        {
          "@context": "https://schema.org",
          "@id": "#999-collectionpage",
          url: "/us/ny/nyc",
          "@type": "CollectionPage",
          name: "New York City",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: [
              {
                "@type": "ListItem",
                item: {
                  "@type": "Thing",
                  address: {
                    "@type": "PostalAddress",
                    addressCountry: "US",
                    addressLocality: "Arlington",
                    addressRegion: "VA",
                    postalCode: "22209",
                    streetAddress: "1101 Wilson Blvd",
                  },
                  name: "Galaxy Grill",
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: [
                        "https://schema.org/Monday",
                        "https://schema.org/Tuesday",
                        "https://schema.org/Wednesday",
                        "https://schema.org/Thursday",
                        "https://schema.org/Friday",
                        "https://schema.org/Saturday",
                        "https://schema.org/Sunday",
                      ],
                      opens: "10:00",
                      closes: "22:00",
                    },
                  ],
                  phone: "+12025551010",
                  url: "/va/arlington/1101-wilson-blvd",
                },
                position: 1,
              },
              {
                "@type": "ListItem",
                item: {
                  "@type": "Thing",
                  address: {
                    "@type": "PostalAddress",
                    addressCountry: "US",
                    addressLocality: "Arlington",
                    addressRegion: "VA",
                    postalCode: "22209",
                    streetAddress: "2101 Wilson Blvd",
                  },
                  name: "Galaxy Grill To Go",
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: [
                        "https://schema.org/Monday",
                        "https://schema.org/Tuesday",
                        "https://schema.org/Wednesday",
                        "https://schema.org/Thursday",
                        "https://schema.org/Friday",
                        "https://schema.org/Saturday",
                        "https://schema.org/Sunday",
                      ],
                      opens: "10:00",
                      closes: "22:00",
                    },
                  ],
                  phone: "+12025551010",
                  url: "/va/arlington/2101-wilson-blvd",
                },
                position: 2,
              },
            ],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@context": "https://schema.org",
          "@id": "#999-breadcrumbs",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Locations Directory",
              item: "/index.html",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "US",
              item: "/us",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "NY",
              item: "/us/ny",
            },
            {
              "@type": "ListItem",
              position: 4,
              name: "New York City",
              item: "/us/ny/nyc",
            },
          ],
        },
      ],
    });
  });

  it("resolves resolved schema markup for a directory root with a site domain", async () => {
    const testData = {
      relativePrefixToRoot: "",
      path: "index.html",
      document: {
        name: "Test Root",
        uid: 1000,
        siteDomain: "yext.com",
        __: {
          layout: JSON.stringify({
            root: {
              props: {},
            },
          }),
        },
        meta: {
          entityType: {
            id: "dm_root",
          },
          locale: "es",
        },
        dm_directoryChildren: [
          {
            name: "US",
            slug: "us",
            dm_addressCountryDisplayName: "United States",
          },
          { name: "CA", slug: "ca", dm_addressCountryDisplayName: "Canada" },
        ],
      },
    };
    const schema = getSchema(testData);

    expect(schema).toEqual({
      "@graph": [
        {
          "@context": "https://schema.org",
          "@id": "https://yext.com/#1000-collectionpage",
          url: "https://yext.com/index.html",
          "@type": "CollectionPage",
          name: "Test Root",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: [
              {
                "@type": "ListItem",
                item: {
                  "@type": "Thing",
                  name: "US",
                  url: "https://yext.com/us",
                },
                position: 1,
              },
              {
                "@type": "ListItem",
                item: {
                  "@type": "Thing",
                  name: "CA",
                  url: "https://yext.com/ca",
                },
                position: 2,
              },
            ],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@context": "https://schema.org",
          "@id": "https://yext.com/#1000-breadcrumbs",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Test Root",
              item: "https://yext.com/index.html",
            },
          ],
        },
      ],
    });
  });

  it("resolves resolved schema markup for a directory root with no site domain", async () => {
    const testData = {
      relativePrefixToRoot: "",
      path: "index.html",
      document: {
        name: "Test Root",
        uid: 1000,
        __: {
          layout: JSON.stringify({
            root: {
              props: {},
            },
          }),
        },
        meta: {
          entityType: {
            id: "dm_root",
          },
          locale: "es",
        },
        dm_directoryChildren: [
          {
            name: "US",
            slug: "us",
            dm_addressCountryDisplayName: "United States",
          },
          { name: "CA", slug: "ca", dm_addressCountryDisplayName: "Canada" },
        ],
      },
    };
    const schema = getSchema(testData);

    expect(schema).toEqual({
      "@graph": [
        {
          "@context": "https://schema.org",
          "@id": "#1000-collectionpage",
          url: "/index.html",
          "@type": "CollectionPage",
          name: "Test Root",
          mainEntity: {
            "@type": "ItemList",
            itemListElement: [
              {
                "@type": "ListItem",
                item: {
                  "@type": "Thing",
                  name: "US",
                  url: "/us",
                },
                position: 1,
              },
              {
                "@type": "ListItem",
                item: {
                  "@type": "Thing",
                  name: "CA",
                  url: "/ca",
                },
                position: 2,
              },
            ],
          },
        },
        {
          "@type": "BreadcrumbList",
          "@context": "https://schema.org",
          "@id": "#1000-breadcrumbs",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Test Root",
              item: "/index.html",
            },
          ],
        },
      ],
    });
  });
});

describe("getSchema - locator pages", () => {
  it("resolves resolved schema markup for a locator with a siteDomain", async () => {
    const testData = {
      relativePrefixToRoot: "",
      path: "locator",
      document: {
        name: "Test Locator",
        uid: 2000,
        siteDomain: "yext.com",
        __: {
          layout: JSON.stringify({
            root: {
              props: {},
            },
          }),
        },
        meta: {
          entityType: {
            id: "locator",
          },
        },
      },
    };
    const schema = getSchema(testData);

    expect(schema).toEqual({
      "@graph": [
        {
          "@context": "https://schema.org",
          "@id": "https://yext.com/#2000-webpage",
          url: "https://yext.com/locator",
          "@type": "WebPage",
          name: "Test Locator",
        },
      ],
    });
  });

  it("resolves resolved schema markup for a locator with no siteDomain", async () => {
    const testData = {
      relativePrefixToRoot: "../",
      path: "en/locator",
      document: {
        name: "Test Locator",
        uid: 2000,
        __: {
          layout: JSON.stringify({
            root: {
              props: {},
            },
          }),
        },
        meta: {
          entityType: {
            id: "locator",
          },
        },
      },
    };
    const schema = getSchema(testData);

    expect(schema).toEqual({
      "@graph": [
        {
          "@context": "https://schema.org",
          "@id": "#2000-webpage",
          url: "/en/locator",
          "@type": "WebPage",
          name: "Test Locator",
        },
      ],
    });
  });
});

describe("getSchema - custom markup", () => {
  afterEach(() => vi.restoreAllMocks());
  const renderCustom = (template: string, document: Record<string, any> = {}) =>
    getSchema({
      path: "us/store",
      relativePrefixToRoot: "../",
      document: {
        ...document,
        __: {
          ...document.__,
          layout: JSON.stringify({
            root: {
              props: {
                schemaMode: "custom",
                schemaMarkup: '{"name":"Recommended"}',
                customSchemaMarkup: template,
              },
            },
          }),
        },
      },
    });

  it("renders the Custom default for a business with escaped fields and structured hours, photos, and services", () => {
    const output = getSchema({
      path: "us/store",
      relativePrefixToRoot: "../",
      document: {
        meta: { entityType: { id: "location" } },
        __: {
          categoryRootAncestorId: 389,
          layout: JSON.stringify({ root: { props: { schemaMode: "custom" } } }),
        },
        siteDomain: "example.com",
        uid: 123,
        name: 'Shop "One"',
        address: { line1: "1 Main St", city: "NY", countryCode: "US" },
        hours: {
          monday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
        },
        photoGallery: [{ image: { url: "https://example.com/photo" } }],
        description: "A shop",
        mainPhone: "+12025550123",
        paymentOptions: ["Cash", "Visa"],
        services: ["Repairs", 'Custom "work"'],
      },
    });
    expect(typeof output).toBe("string");
    expect(
      JSON.parse(
        (output as string)
          .split('<script type="application/ld+json">')[1]
          .split("</script>")[0]
      )
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "Store",
      "@id": "https://example.com/#123-Store",
      url: "https://example.com/us/store",
      name: 'Shop "One"',
      address: {
        "@type": "PostalAddress",
        streetAddress: "1 Main St",
        addressLocality: "NY",
        addressCountry: "US",
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "https://schema.org/Monday",
          opens: "09:00",
          closes: "17:00",
        },
      ],
      image: ["https://example.com/photo"],
      description: "A shop",
      telephone: "+12025550123",
      paymentAccepted: ["Cash", "Visa"],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: "Repairs" },
          },
          {
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: 'Custom "work"' },
          },
        ],
      },
    });
  });

  it.each([
    ["location", "LocalBusiness", "LocalBusiness"],
    ["dm_root", "CollectionPage", "collectionpage"],
    ["locator", "WebPage", "webpage"],
    ["other", "Thing", "thing"],
  ])(
    "renders a sparse Custom default for %s with relative URLs",
    (entityTypeId, type, anchor) => {
      const output = getSchema({
        path: "page",
        relativePrefixToRoot: "../",
        document: {
          uid: 0,
          meta: { entityType: { id: entityTypeId } },
          __: {
            layout: JSON.stringify({
              root: { props: { schemaMode: "custom" } },
            }),
          },
        },
      }) as string;
      expect(
        JSON.parse(
          output
            .split('<script type="application/ld+json">')[1]
            .split("</script>")[0]
        )
      ).toEqual({
        "@context": "https://schema.org",
        "@type": type,
        "@id": `#0-${anchor}`,
        url: "/page",
      });
    }
  );

  it("omits null optional fields in the Custom default", () => {
    const output = getSchema({
      path: "page",
      relativePrefixToRoot: "",
      document: {
        meta: { entityType: { id: "location" } },
        __: {
          layout: JSON.stringify({ root: { props: { schemaMode: "custom" } } }),
        },
        address: null,
        hours: null,
        photoGallery: null,
      },
    }) as string;
    expect(output).toContain('<script type="application/ld+json">');
    expect(
      JSON.parse(
        output
          .split('<script type="application/ld+json">')[1]
          .split("</script>")[0]
      )
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      url: "/page",
    });
  });

  it("renders directory children in the Custom default without losing parent URL context", () => {
    const output = getSchema({
      path: "us",
      relativePrefixToRoot: "../",
      document: {
        meta: { entityType: { id: "dm_country" } },
        __: {
          layout: JSON.stringify({ root: { props: { schemaMode: "custom" } } }),
        },
        uid: 12,
        siteDomain: "example.com",
        name: "US",
        dm_directoryChildren: [
          { name: 'Shop "One"', slug: "us/store", mainPhone: "+12025550123" },
          { name: "Region", slug: "us/ny" },
        ],
      },
    }) as string;
    expect(
      JSON.parse(
        output
          .split('<script type="application/ld+json">')[1]
          .split("</script>")[0]
      )
    ).toEqual({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "https://example.com/#12-collectionpage",
      url: "https://example.com/us",
      name: "US",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          {
            "@type": "Thing",
            name: 'Shop "One"',
            url: "https://example.com/us/store",
            phone: "+12025550123",
          },
          {
            "@type": "Thing",
            name: "Region",
            url: "https://example.com/us/ny",
          },
        ],
      },
    });
  });

  it.each([
    ["en", false, ""],
    ["en", true, "en/"],
    ["fr", false, "fr/"],
    ["fr", true, "fr/"],
  ] as const)(
    "matches Recommended directory URLs for locale %s with primary prefix %s",
    (locale, includeLocalePrefixForPrimaryLocale, prefix) => {
      for (const siteDomain of [undefined, "example.com"]) {
        const document = {
          locale,
          siteDomain,
          name: "Directory",
          meta: { entityType: { id: "dm_city" } },
          __: {
            pathInfo: {
              template: "directory/ny",
              sourceEntityPageSetTemplate: "stores/[[id]]",
              primaryLocale: "en",
              includeLocalePrefixForPrimaryLocale,
            },
          },
          dm_directoryChildren: [
            {
              name: "Shop",
              id: "shop",
              slug: "old-path",
              address: { city: "NY" },
            },
            { name: "No slug", id: "no-slug", address: { city: "NY" } },
            {
              name: "Region",
              id: "region",
              slug: "old-region",
              __: {
                pathInfo: {
                  template: "regions/[[id]]",
                  primaryLocale: "en",
                  includeLocalePrefixForPrimaryLocale,
                },
              },
            },
          ],
        };
        const renderMode = (schemaMode: string) =>
          getSchema({
            path: `${prefix}directory/ny`,
            relativePrefixToRoot: "../",
            document: {
              ...document,
              __: {
                ...document.__,
                layout: JSON.stringify({ root: { props: { schemaMode } } }),
              },
            },
          });
        const recommended = renderMode("recommended") as Record<string, any>;
        const customMarkup = renderMode("custom") as string;
        const container = globalThis.document.createElement("div");
        container.innerHTML = customMarkup;
        const custom = JSON.parse(
          container.querySelector("script")!.textContent!
        );
        const baseUrl = siteDomain ? `https://${siteDomain}/` : "/";
        const expectedUrls = [
          "stores/shop",
          "stores/no-slug",
          "regions/region",
        ].map((path) => `${baseUrl}${prefix}${path}`);

        expect(custom.url).toBe(`${baseUrl}${prefix}directory/ny`);
        expect(custom.url).toBe(recommended["@graph"][0].url);
        expect(
          custom.mainEntity.itemListElement.map((child: any) => child.url)
        ).toEqual(expectedUrls);
        expect(
          recommended["@graph"][0].mainEntity.itemListElement.map(
            (child: any) => child.item.url
          )
        ).toEqual(expectedUrls);
      }
    }
  );

  it("renders complete markup verbatim with nested loops, conditionals, and page context", () => {
    expect(
      renderCustom(
        '  <script type="application/ld+json">\n{{#each groups}}{{#if enabled}}{{#each members}}{{name}};{{/each}}{{/if}}{{/each}}|{{path}}|{{relativePrefixToRoot}}\n</script>\n<script>invalid JSON & raw</script>  ',
        {
          path: "stale",
          relativePrefixToRoot: "stale",
          groups: [
            { enabled: true, members: [{ name: "A & <B>" }, { name: "C" }] },
            { enabled: false, members: [{ name: "Hidden" }] },
          ],
        }
      )
    ).toBe(
      '  <script type="application/ld+json">\nA & <B>;C;|us/store|../\n</script>\n<script>invalid JSON & raw</script>  '
    );
  });
  it("serializes nested JSON and missing values without HTML escaping", () => {
    expect(
      renderCustom("{{json name}}|{{json nested}}|{{json missing}}|{{json}}", {
        name: 'A "quote" & <tag>\nnext',
        nested: { values: [false, 0, null, ""] },
      })
    ).toBe(
      String.raw`"A \"quote\" & \u003ctag>\nnext"|{"values":[false,0,null,""]}|null|null`
    );
  });

  it("keeps serialized entity values inside multiple authored JSON-LD scripts", () => {
    const name = '</script><script>alert("injected")</script><!--';
    const nested = { values: [name, "<script>", "A & B"] };
    const output = renderCustom(
      '<script type="application/ld+json">\n{{json name}}\n</script>\n<script type="application/ld+json">\n{{json nested}}\n</script>',
      { name, nested }
    );
    const container = document.createElement("div");
    expect(typeof output).toBe("string");
    container.innerHTML = output as string;
    const scripts = container.querySelectorAll("script");

    expect(scripts).toHaveLength(2);
    expect(Array.from(scripts, (script) => script.type)).toEqual([
      "application/ld+json",
      "application/ld+json",
    ]);
    expect(
      Array.from(scripts, (script) => JSON.parse(script.textContent!))
    ).toEqual([name, nested]);
    expect(output).toContain(String.raw`\u003c/script>`);
  });

  it.each([
    '</script><script>alert("injected")</script>',
    '</ScRiPt><script>alert("injected")</script>',
    "<!--<script>script data",
  ])("keeps SchemaWrapper data inside its script for %s", (name) => {
    const output = renderCustom(
      '{{SchemaWrapper (LocalBusiness this)}}\n<script type="application/ld+json">\n{{json nested}}\n</script>',
      { name, nested: { names: [name] } }
    );
    const container = document.createElement("div");
    expect(typeof output).toBe("string");
    container.innerHTML = output as string;
    const scripts = container.querySelectorAll("script");

    expect(scripts).toHaveLength(2);
    expect(Array.from(scripts, (script) => script.type)).toEqual([
      "application/ld+json",
      "application/ld+json",
    ]);
    expect(
      Array.from(scripts, (script) => JSON.parse(script.textContent!))
    ).toEqual([
      {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name,
      },
      { names: [name] },
    ]);
  });

  it("supports strict equality, JavaScript ordering and truthiness, and slug composition", () => {
    expect(
      renderCustom(
        '{{eq 1 "1"}}|{{ne 1 "1"}}|{{gt 3 2}}|{{gte 2 2}}|{{lt "a" "b"}}|{{lte 2 2}}|{{and name 1}}|{{or 0 name}}|{{not 0}}|{{and empty name}}|{{#if (and (eq kind "Store") (not hidden))}}{{slugify name "-" city}}{{/if}}',
        {
          kind: "Store",
          name: "A & B",
          city: "New York",
          hidden: false,
          empty: [],
        }
      )
    ).toBe("false|true|true|true|true|true|true|true|true|true|a-&-b-new-york");
  });

  it("resolves businessType from the current or an explicit document", () => {
    expect(
      renderCustom(
        "{{businessType}}|{{json (businessType this)}}|{{#each children}}{{businessType}}/{{businessType @root}};{{/each}}|{{businessType missing}}",
        {
          __: { categoryRootAncestorId: 389 },
          children: [
            { __: { categoryRootAncestorId: 378 } },
            { __: { categoryRootAncestorId: 999 } },
          ],
        }
      )
    ).toBe(
      'Store|"Store"|FinancialService/Store;LocalBusiness/Store;|LocalBusiness'
    );
  });

  it("composes Pages wrappers without forwarding Handlebars options or changing return values", () => {
    expect(
      renderCustom(
        '{{json (BaseSchema this "Store")}}|{{json (LocalBusiness this)}}|{{json (AddressSchema address)}}|{{json (OpeningHoursSchema)}}|{{SchemaWrapper (BaseSchema this "Thing")}}',
        {
          name: "Shop",
          address: { line1: "1 Main St", city: "NY", countryCode: "US" },
        }
      )
    ).toBe(
      '{"@context":"https://schema.org","@type":"Store","name":"Shop"}|{"@context":"https://schema.org","@type":"LocalBusiness","name":"Shop","address":{"@type":"PostalAddress","streetAddress":"1 Main St","addressLocality":"NY","addressCountry":"US"}}|{"address":{"@type":"PostalAddress","streetAddress":"1 Main St","addressLocality":"NY","addressCountry":"US"}}|{}|<script type="application/ld+json">\n  {"@context":"https://schema.org","@type":"Thing","name":"Shop"}\n  </script>'
    );
  });

  it("does not modify entity fields or leak custom escaping into Custom Code", async () => {
    const { processHandlebarsTemplate } =
      await import("../../components/sections/customCode/customCodeHandlebars.ts");
    const document = {
      name: "<Shop>",
      path: "original",
      primaryCategory: "Original",
    };
    renderCustom("{{name}}", document);
    expect({
      document,
      customCode: processHandlebarsTemplate("{{name}}", document),
    }).toEqual({
      document: {
        name: "<Shop>",
        path: "original",
        primaryCategory: "Original",
      },
      customCode: "&lt;Shop&gt;",
    });
  });

  it.each([
    "",
    "{{#if name}}",
    "{{missingHelper name}}",
    "{{json (AddressSchema invalid)}}",
  ])("emits no markup for blank or failing Custom %s", (template) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(renderCustom(template, { name: "Shop", invalid: null })).toBe("");
    if (template) {
      expect(warn).toHaveBeenCalledWith(
        "Error resolving custom schema:",
        expect.any(String)
      );
    } else {
      expect(warn).not.toHaveBeenCalled();
    }
  });

  it("preserves whitespace around standalone Handlebars blocks", () => {
    expect(
      renderCustom(" \n{{#if name}}\n  <script>{{name}}</script>\n{{/if}}\n ", {
        name: "Shop",
      })
    ).toBe(" \n\n  <script>Shop</script>\n\n ");
  });

  it.each([
    [
      'Event this "MusicEvent"',
      '{"@context":"https://schema.org","@type":"MusicEvent","name":"Shop","performer":{"@type":"PerformingGroup","name":"A and B"}}',
    ],
    [
      'Product this "IndividualProduct"',
      '{"@context":"https://schema.org","@type":"IndividualProduct","name":"Shop"}',
    ],
    [
      "FAQPage faqs",
      '{"@context":"http://www.schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Open?","acceptedAnswer":{"@type":"Answer","text":"Yes"}}]}',
    ],
    ["LocationSchema place", '{"@type":"Place","name":"Venue"}'],
    ["OpeningHoursSchema hours", '{"openingHours":["Mo 09:00-17:00"]}'],
    [
      "OpeningHoursSpecificationSchema hours",
      '{"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":"https://schema.org/Monday","opens":"09:00","closes":"17:00"}]}',
    ],
    [
      "OfferSchema offer",
      '{"offers":{"@type":"Offer","priceCurrency":"USD","price":"10","availability":"InStock"}}',
    ],
    [
      "PerformerSchema performers",
      '{"performer":{"@type":"PerformingGroup","name":"A and B"}}',
    ],
    [
      "OrganizationSchema organization",
      '{"organizer":{"@type":"Organization","name":"Org","url":"https://example.test"}}',
    ],
    ["PhotoGallerySchema gallery", '{"image":["https://example.test/photo"]}'],
    ["PhotoSchema photo", '{"image":"https://example.test/photo"}'],
    [
      "ReviewSchema review",
      '{"review":{"@type":"Review","reviewRating":{"@type":"Rating","ratingValue":"5","bestRating":"5"},"author":{"@type":"Person","name":"Ada"}}}',
    ],
    [
      "AggregateRatingSchema rating",
      '{"aggregateRating":{"@type":"AggregateRating","ratingValue":"4.5","reviewCount":"2"}}',
    ],
    ["AddressSchema missing", "false"],
    ["AggregateRatingSchema missing", "null"],
  ])("preserves the Pages wrapper result for %s", (expression, expected) => {
    expect(
      renderCustom(`{{json (${expression})}}`, {
        name: "Shop",
        faqs: [{ question: "Open?", answer: "Yes" }],
        place: { name: "Venue" },
        hours: {
          monday: { openIntervals: [{ start: "09:00", end: "17:00" }] },
        },
        offer: { priceCurrency: "USD", price: "10", availability: "InStock" },
        performers: ["A", "B"],
        organization: { name: "Org", url: "https://example.test" },
        gallery: [{ image: { url: "https://example.test/photo" } }],
        photo: { image: { url: "https://example.test/photo" } },
        review: { ratingValue: "5", bestRating: "5", author: "Ada" },
        rating: { ratingValue: "4.5", reviewCount: "2" },
      })
    ).toBe(expected);
  });

  it("retains Custom markup through existing layout migrations", () => {
    const template = "  <script>{{json name}}</script>\n";
    const document = { name: "Shop", meta: { entityType: { id: "location" } } };
    const layout = {
      root: {
        props: {
          version: 0,
          schemaMode: "custom",
          customSchemaMarkup: template,
          schemaMarkup: '{"name":"[[name]]"}',
        },
      },
      content: [],
    };
    const migrated = migrate(
      { components: {} },
      layout,
      document,
      migrationRegistry
    );

    expect(
      getSchema({
        path: "store",
        relativePrefixToRoot: "",
        document: { ...document, __: { layout: JSON.stringify(migrated) } },
      })
    ).toBe('  <script>"Shop"</script>\n');
  });
});
