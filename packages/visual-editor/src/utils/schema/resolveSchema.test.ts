import { assert, describe, it } from "vitest";
import { resolveSchemaJson, resolveSchemaString } from "./resolveSchema";

describe("resolveSchemaString", () => {
  const document = {
    name: "Yext",
    id: "123",
    address: {
      city: "New York",
      country: "USA",
    },
    items: ["item1", "item2"],
  };

  it("resolves embedded string fields in a string", () => {
    assert.deepEqual(resolveSchemaString(document, `[[name]]`), `Yext`);
  });

  it("resolves complex fields", () => {
    assert.deepEqual(resolveSchemaString(document, `[[items]]`), "item1,item2");

    assert.deepEqual(
      resolveSchemaString(document, `[[address]]`),
      '{\\"city\\":\\"New York\\",\\"country\\":\\"USA\\"}'
    );
  });

  it("resolves embedded complex fields in a schema string", () => {
    assert.deepEqual(
      resolveSchemaString(document, `items:"[[items]]"`),
      `items:"item1,item2"`
    );
    assert.deepEqual(
      resolveSchemaString(document, `address:"[[address]]"`),
      `address:"{\\"city\\":\\"New York\\",\\"country\\":\\"USA\\"}"`
    );
  });
});

describe("resolveSchemaJson", () => {
  const document = {
    name: "Yext",
    id: 123,
    description: "All about Yext",
    services: ["service1", "service2"],
    paymentOptions: ["Cash", "Visa", "MasterCard"],
    brand: {
      name: "Yext Brand",
    },
    c_certification: {
      name: "Example Certification",
    },
    hours: {
      friday: {
        isClosed: true,
      },
      monday: {
        openIntervals: [
          {
            end: "22:00",
            start: "10:00",
          },
        ],
      },
      saturday: {
        openIntervals: [
          {
            end: "22:00",
            start: "10:00",
          },
        ],
      },
      sunday: {
        openIntervals: [
          {
            end: "22:00",
            start: "10:00",
          },
        ],
      },
      thursday: {
        openIntervals: [
          {
            end: "22:00",
            start: "10:00",
          },
        ],
      },
      tuesday: {
        openIntervals: [
          {
            end: "22:00",
            start: "10:00",
          },
        ],
      },
      wednesday: {
        openIntervals: [
          {
            end: "22:00",
            start: "10:00",
          },
        ],
      },
    },
    mainPhone: "+12222222222",
    photoGallery: [
      {
        image: {
          height: 2048,
          thumbnails: [
            {
              height: 2048,
              url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/2048x2048.jpg",
              width: 2048,
            },
            {
              height: 1900,
              url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/1900x1900.jpg",
              width: 1900,
            },
            {
              height: 619,
              url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/619x619.jpg",
              width: 619,
            },
            {
              height: 450,
              url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/450x450.jpg",
              width: 450,
            },
            {
              height: 196,
              url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/196x196.jpg",
              width: 196,
            },
          ],
          url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/2048x2048.jpg",
          width: 2048,
        },
      },
      {
        image: {
          height: 2048,
          thumbnails: [
            {
              height: 2048,
              url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
              width: 2048,
            },
            {
              height: 1900,
              url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/1900x1900.jpg",
              width: 1900,
            },
            {
              height: 619,
              url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/619x619.jpg",
              width: 619,
            },
            {
              height: 450,
              url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/450x450.jpg",
              width: 450,
            },
            {
              height: 196,
              url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/196x196.jpg",
              width: 196,
            },
          ],
          url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
          width: 2048,
        },
      },
      {
        image: {
          height: 2048,
          thumbnails: [
            {
              height: 2048,
              url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/2048x2048.jpg",
              width: 2048,
            },
            {
              height: 1900,
              url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/1900x1900.jpg",
              width: 1900,
            },
            {
              height: 619,
              url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/619x619.jpg",
              width: 619,
            },
            {
              height: 450,
              url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/450x450.jpg",
              width: 450,
            },
            {
              height: 196,
              url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/196x196.jpg",
              width: 196,
            },
          ],
          url: "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/2048x2048.jpg",
          width: 2048,
        },
      },
      {
        image: {
          height: 2048,
          thumbnails: [
            {
              height: 2048,
              url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/2048x2048.jpg",
              width: 2048,
            },
            {
              height: 1900,
              url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/1900x1900.jpg",
              width: 1900,
            },
            {
              height: 619,
              url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/619x619.jpg",
              width: 619,
            },
            {
              height: 450,
              url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/450x450.jpg",
              width: 450,
            },
            {
              height: 196,
              url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/196x196.jpg",
              width: 196,
            },
          ],
          url: "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/2048x2048.jpg",
          width: 2048,
        },
      },
    ],
  };

  it("resolves 1-level schema JSON", () => {
    const schema = {
      name: "[[name]]",
      id: "test-id",
      services: "[[services]]",
      brand: "[[brand]]",
    };

    const resolved = resolveSchemaJson(document, schema);

    assert.deepEqual(resolved, {
      name: "Yext",
      id: "test-id",
      services: "service1,service2",
      brand: '{\\"name\\":\\"Yext Brand\\"}',
    });
  });

  it("resolves multi-level schema JSON", () => {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "LocalBusiness",
      description: "[[description]]",
      paymentAccepted: "[[paymentOptions]]",
      brand: "[[brand]]",
      certification: {
        "@context": "https://schema.org",
        "@type": "Certification",
        name: "[[c_certification.name]]",
      },
    };

    const resolved = resolveSchemaJson(document, schema);

    assert.deepEqual(resolved, {
      "@context": "https://schema.org/",
      "@type": "LocalBusiness",
      description: "All about Yext",
      paymentAccepted: "Cash,Visa,MasterCard",
      brand: '{\\"name\\":\\"Yext Brand\\"}',
      certification: {
        "@context": "https://schema.org",
        "@type": "Certification",
        name: "Example Certification",
      },
    });
  });

  it("resolves schema with special cases", () => {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "LocalBusiness",
      openingHours: "[[hours]]",
      image: "[[photoGallery]]",
      description: "[[description]]",
      telephone: "[[mainPhone]]",
      paymentAccepted: "[[paymentOptions]]",
      hasOfferCatalog: "[[services]]",
    };

    const resolved = resolveSchemaJson(document, schema);

    assert.deepEqual(resolved, {
      "@context": "https://schema.org/",
      "@type": "LocalBusiness",
      description: "All about Yext",
      openingHours: ["Mo,Tu,We,Th,Sa,Su 10:00-22:00", "Fr 00:00-00:00"],
      telephone: "+12222222222",
      paymentAccepted: "Cash,Visa,MasterCard",
      image: [
        "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/2048x2048.jpg",
        "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
        "https://a.mktgcdn.com/p-dev/KuK2XRaNDf-LF97Jt_ZMASRdUxtPiJP2MCwU6Ccmh9Q/2048x2048.jpg",
        "https://a.mktgcdn.com/p-dev/9sn-xdC6lJIbOEIj0bZBZhaM5EM963H1Rv044oszkgs/2048x2048.jpg",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        itemListElement: [
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "service1",
            },
          },
          {
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: "service2",
            },
          },
        ],
      },
    });
  });

  it("resolves schema with special cases but invalid data shapes", () => {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "LocalBusiness",
      openingHours: "[[description]]",
      image: "[[mainPhone]]",
      description: "[[c_does_not_exist]]",
      telephone: "[[mainPhone]]",
      paymentAccepted: "[[name]]",
      hasOfferCatalog: "[[name]]",
    };

    const resolved = resolveSchemaJson(document, schema);

    assert.deepEqual(resolved, {
      "@context": "https://schema.org/",
      "@type": "LocalBusiness",
      image: "+12222222222",
      openingHours: "All about Yext",
      paymentAccepted: "Yext",
      telephone: "+12222222222",
      hasOfferCatalog: "Yext",
    });
  });

  it("resolves Directory Children for country level directory", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "[[siteDomain]]/[[path]]",
      name: "[[name]]",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: "[[dm_directoryChildren]]",
      },
    };

    const document = {
      name: "Directory Country",
      siteDomain: "yext.com",
      path: "en/ca",
      locale: "en",
      dm_directoryChildren: [
        {
          dm_addressCountryDisplayName: "Canada",
          dm_addressRegionDisplayName: "Ontario",
          id: "66151-5748-locations_ca_on",
          name: "ON",
          slug: "en/ca/on",
        },
        {
          dm_addressCountryDisplayName: "Canada",
          dm_addressRegionDisplayName: "British Columbia",
          id: "66151-5748-locations_ca_bc",
          name: "BC",
          slug: "en/ca/bc",
        },
      ],
    };

    const resolvedSchema = resolveSchemaJson(document, schema);

    assert.deepEqual(resolvedSchema, {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "yext.com/en/ca",
      name: "Directory Country",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          {
            "@type": "ListItem",
            item: {
              "@type": "Thing",
              name: "ON",
              url: "yext.com/en/ca/on",
            },
            position: 1,
          },
          {
            "@type": "ListItem",
            item: {
              "@type": "Thing",
              name: "BC",
              url: "yext.com/en/ca/bc",
            },
            position: 2,
          },
        ],
      },
    });
  });

  it("resolves Directory Children for city level directory", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "[[siteDomain]]/[[path]]",
      name: "[[name]]",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: "[[dm_directoryChildren]]",
      },
    };

    const document = {
      name: "Directory City",
      siteDomain: "yext.com",
      path: "en/us/va/arlington",
      locale: "en",
      dm_directoryChildren: [
        {
          address: {
            city: "Arlington",
            countryCode: "US",
            line1: "1101 Wilson Blvd",
            postalCode: "22209",
            region: "VA",
          },
          hours: {
            friday: {
              openIntervals: [
                {
                  end: "22:00",
                  start: "10:00",
                },
              ],
            },
            monday: {
              openIntervals: [
                {
                  end: "22:00",
                  start: "10:00",
                },
              ],
            },
            saturday: {
              openIntervals: [
                {
                  end: "22:00",
                  start: "10:00",
                },
              ],
            },
            sunday: {
              openIntervals: [
                {
                  end: "22:00",
                  start: "10:00",
                },
              ],
            },
            thursday: {
              openIntervals: [
                {
                  end: "22:00",
                  start: "10:00",
                },
              ],
            },
            tuesday: {
              openIntervals: [
                {
                  end: "22:00",
                  start: "10:00",
                },
              ],
            },
            wednesday: {
              openIntervals: [
                {
                  end: "22:00",
                  start: "10:00",
                },
              ],
            },
          },
          id: "1101-wilson-blvd",
          mainPhone: "+17577017560",
          name: "Galaxy Grill",
          timezone: "America/New_York",
        },
      ],
    };

    const resolvedSchema = resolveSchemaJson(document, schema);

    assert.deepEqual(resolvedSchema, {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "yext.com/en/us/va/arlington",
      name: "Directory City",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: [
          {
            "@type": "ListItem",
            item: {
              "@type": "Thing",
              name: "Galaxy Grill",
              url: "yext.com/va/arlington/1101-wilson-blvd",
              address: {
                "@type": "PostalAddress",
                addressCountry: "US",
                addressLocality: "Arlington",
                addressRegion: "VA",
                postalCode: "22209",
                streetAddress: "1101 Wilson Blvd",
              },
              openingHours: ["Mo,Tu,We,Th,Fr,Sa,Su 10:00-22:00"],
              phone: "+17577017560",
            },
            position: 1,
          },
        ],
      },
    });
  });
});
