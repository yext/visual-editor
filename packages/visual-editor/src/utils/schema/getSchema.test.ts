import { describe, expect, it } from "vitest";
import { getSchema } from "./getSchema";

describe("getSchema", () => {
  it("resolves schemaMarkup for a location with no directory/reviews", async () => {
    const testData = {
      relativePrefixToRoot: "./",
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

  it("returns the default schema for a location with no schema markup and no directory/reviews", async () => {
    const testData = {
      relativePrefixToRoot: "./",
      path: "us/va/123-main-street",
      document: {
        uid: 123,
        name: "Test Name",
        siteDomain: "yext.com",
        address: {
          line1: "123 Test St",
          city: "Washington",
          region: "DC",
          postalCode: "20000",
          countryCode: "US",
        },
        ref_categories: [
          {
            fullDisplayName: "Automotive & Vehicles > Auto Repair",
          },
        ],
        mainPhone: "123-456-7890",
        description: "test description",
        __: {
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
          "@id": "https://yext.com/123#automotivebusiness",
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
          description: "test description",
          telephone: "123-456-7890",
        },
      ],
    });
  });

  it("resolves schemaMarkup for a location with directory and reviews", async () => {
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
                "@type": "LocalBusiness",
                "@id": "https://[[siteDomain]]/[[uid]]#localbusiness",
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
          "@id": "https://yext.com/123#localbusiness",
          url: "https://yext.com/us/va/123-main-street",
          name: "Test Name",
        },
        {
          "@type": "BreadcrumbList",
          "@id": "https://yext.com/123#breadcrumbs",
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
          "@id": "https://yext.com/123#aggregaterating",
          ratingValue: "3.7142856",
          reviewCount: "7",
          itemReviewed: {
            "@id": "https://yext.com/123#localbusiness",
          },
        },
      ],
    });
  });

  it("returns schema for a directory city with no schemaMarkup", async () => {
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
          "@id": "https://yext.com/999#collectionpage",
          url: "https://yext.com/us/ny/nyc",
          "@type": "CollectionPage",
          name: "New York City",
        },
        {
          "@type": "BreadcrumbList",
          "@context": "https://schema.org",
          "@id": "https://yext.com/999#breadcrumbs",
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

  it("returns schema for a directory root with no schemaMarkup", async () => {
    const testData = {
      relativePrefixToRoot: "../../",
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
        },
      },
    };
    const schema = getSchema(testData);

    expect(schema).toEqual({
      "@graph": [
        {
          "@context": "https://schema.org",
          "@id": "https://yext.com/1000#collectionpage",
          url: "https://yext.com/index.html",
          "@type": "CollectionPage",
          name: "Test Root",
        },
        {
          "@type": "BreadcrumbList",
          "@context": "https://schema.org",
          "@id": "https://yext.com/1000#breadcrumbs",
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

  it("returns schema for a locator with no schemaMarkup", async () => {
    const testData = {
      relativePrefixToRoot: "../",
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
          "@id": "https://yext.com/2000#webpage",
          url: "https://yext.com/locator",
          "@type": "WebPage",
          name: "Test Locator",
        },
      ],
    });
  });
});
