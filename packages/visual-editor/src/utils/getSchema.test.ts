import { describe, expect, it } from "vitest";
import { getSchema } from "./getSchema";

describe("getSchema", () => {
  it("works with schemaMarkup ", async () => {
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
                name: "[[name]]",
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

    expect(schema).toMatchObject({
      name: "Test Name",
    });
  });

  it("works with default schema ", async () => {
    const testData = {
      relativePrefixToRoot: "../../",
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

    expect(schema).toMatchObject({
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
    });
  });
});
