import { describe, expect, it } from "vitest";
import { getSchema } from "./getSchema";

describe("getSchema", () => {
  it("resolves schemaMarkup for a location with no directory/reviews", async () => {
    const testData = {
      relativePrefixToRoot: "./",
      path: "/us/va/123-main-street",
      document: {
        name: "Test Name",
        __: {
          layout: JSON.stringify({
            root: {
              props: {
                schemaMarkup: `{
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
      path: "/us/va/123-main-street",
      document: {
        name: "Test Name",
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
          "@type": "LocalBusiness",
          name: "Test Name",
          address: {
            "@type": "PostalAddress",
            streetAddress: "[[address.line1]]",
            addressLocality: "[[address.city]]",
            addressRegion: "[[address.region]]",
            postalCode: "[[address.postalCode]]",
            addressCountry: "[[address.countryCode]]",
          },
          openingHours: "[[hours]]",
          image: "[[photoGallery]]",
          description: "[[description]]",
          telephone: "[[mainPhone]]",
          paymentAccepted: "[[paymentOptions]]",
          hasOfferCatalog: "[[services]]",
        },
      ],
    });
  });

  it("resolves schemaMarkup for a location with directory and reviews", async () => {
    const testData = {
      relativePrefixToRoot: "../../",
      path: "/us/va/123-main-street",
      document: {
        name: "Test Name",
        __: {
          layout: JSON.stringify({
            root: {
              props: {
                schemaMarkup: `{
                "@type": "LocalBusiness",
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
          name: "Test Name",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "3.7142856",
            reviewCount: "7",
          },
        },
        {
          "@type": "BreadcrumbList",
          "@context": "https://schema.org",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Locations Directory",
              item: {
                "@id": "../../index.html",
                "@type": "Thing",
              },
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "US",
              item: {
                "@id": "../../us",
                "@type": "Thing",
              },
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "NY",
              item: {
                "@id": "../../us/ny",
                "@type": "Thing",
              },
            },
            {
              "@type": "ListItem",
              position: 4,
              name: "Brooklyn",
              item: {
                "@id": "../../us/ny/brooklyn",
                "@type": "Thing",
              },
            },
          ],
        },
      ],
    });
  });

  it("returns schema for a directory city with no schemaMarkup", async () => {
    const testData = {
      relativePrefixToRoot: "../../",
      path: "/us/va",
      document: {
        name: "Test City",
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
          "@type": "ListItem",
          position: "4",
          item: {
            "@type": "Place",
            name: "Test City",
            address: {
              "@type": "PostalAddress",
              streetAddress: "[[address.line1]]",
              addressLocality: "[[address.city]]",
              addressRegion: "[[address.region]]",
              postalCode: "[[address.postalCode]]",
              addressCountry: "[[address.countryCode]]",
            },
          },
        },
        {
          "@type": "BreadcrumbList",
          "@context": "https://schema.org",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Locations Directory",
              item: {
                "@id": "../../index.html",
                "@type": "Thing",
              },
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "US",
              item: {
                "@id": "../../us",
                "@type": "Thing",
              },
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "NY",
              item: {
                "@id": "../../us/ny",
                "@type": "Thing",
              },
            },
          ],
        },
      ],
    });
  });

  it("returns schema for a directory root with no schemaMarkup", async () => {
    const testData = {
      relativePrefixToRoot: "../../",
      path: "/index.html",
      document: {
        name: "Test Root",
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
          "@type": "ListItem",
          position: "1",
          item: {
            "@type": "Place",
            name: "Test Root",
            address: {
              "@type": "PostalAddress",
              streetAddress: "[[address.line1]]",
              addressLocality: "[[address.city]]",
              addressRegion: "[[address.region]]",
              postalCode: "[[address.postalCode]]",
              addressCountry: "[[address.countryCode]]",
            },
          },
        },
        {
          "@type": "BreadcrumbList",
          "@context": "https://schema.org",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Locations Directory",
              item: {
                "@id": "../../index.html",
                "@type": "Thing",
              },
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "US",
              item: {
                "@id": "../../us",
                "@type": "Thing",
              },
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "NY",
              item: {
                "@id": "../../us/ny",
                "@type": "Thing",
              },
            },
          ],
        },
      ],
    });
  });
});
