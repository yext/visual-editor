import { describe, expect, it } from "vitest";
import { Migration, MigrationRegistry, migrate } from "./migrate.ts";
import { addIdToSchema } from "../components/migrations/0023_add_id_to_schema.ts";
import { updateSchemaIdAnchorFormat } from "../components/migrations/0069_update_schema_id_anchor_format.ts";
import { themeColorPropertyKeyMigration } from "../components/migrations/0071_theme_color_property_keys.ts";
import { threeZoneRootLayoutMigration } from "../components/migrations/0073_three_zone_root_layout.ts";
import {
  ROOT_FOOTER_ZONE_KEY,
  ROOT_HEADER_ZONE_KEY,
  ROOT_MAIN_ZONE_KEY,
} from "./rootZones.ts";

describe("migrate", () => {
  it("successfully applies a migration", async () => {
    const migratedData = migrate(
      exampleDataBefore,
      migrationRegistry,
      {
        components: {},
      },
      {}
    );
    expect(migratedData).toEqual(exampleDataAfter);
  });

  it("successfully applies root migration", async () => {
    const migratedData = migrate(
      exampleRootDataBefore,
      [addIdToSchema],
      {
        components: {},
      },
      {}
    );

    expect(migratedData).toEqual(exampleRootDataAfter);
  });

  it("successfully applies migration based on document data", async () => {
    const migratedData = migrate(
      exampleBasicDataBefore,
      [
        {
          BasicSection: {
            action: "updated",
            propTransformation: (props, document) => {
              return { ...props, text: document.fieldB };
            },
          },
        },
      ],
      {
        components: {},
      },
      exampleDocument
    );

    expect(migratedData).toEqual(exampleBasicDataAfter);
  });

  it("recursively migrates legacy ThemeColor keys while preserving non-legacy textColor values", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          {
            type: "ComponentA",
            props: {
              styles: {
                backgroundColor: {
                  bgColor: "bg-white",
                  textColor: "text-black",
                  isDarkBackground: false,
                },
              },
              cards: [
                {
                  answerColor: {
                    bgColor: "bg-palette-primary-dark",
                    textColor: "text-white",
                  },
                },
              ],
            },
          },
          {
            type: "ComponentB",
            props: {
              slotProps: {
                child: {
                  linkColor: {
                    bgColor: "bg-palette-secondary",
                    textColor: "text-palette-secondary-contrast",
                    isDarkBackground: true,
                  },
                },
              },
            },
          },
          {
            type: "Banner",
            props: {
              styles: {
                backgroundColor: {
                  bgColor: "bg-white",
                  textColor: "text-black",
                },
                textColor: {
                  bgColor: "bg-palette-primary",
                  textColor: "text-palette-primary-contrast",
                },
              },
            },
          },
          {
            type: "ComponentC",
            props: {
              styles: {
                cta: {
                  textColor: "palette-primary-contrast",
                },
              },
            },
          },
        ],
        zones: {},
      },
      [themeColorPropertyKeyMigration],
      {
        components: {},
      },
      {}
    );

    expect(migratedData).toEqual({
      root: {
        props: {
          version: 1,
        },
      },
      content: [
        {
          type: "ComponentA",
          props: {
            styles: {
              backgroundColor: {
                selectedColor: "white",
                contrastingColor: "black",
                isDarkColor: false,
              },
            },
            cards: [
              {
                answerColor: {
                  selectedColor: "palette-primary-dark",
                  contrastingColor: "white",
                },
              },
            ],
          },
        },
        {
          type: "ComponentB",
          props: {
            slotProps: {
              child: {
                linkColor: {
                  selectedColor: "palette-secondary",
                  contrastingColor: "palette-secondary-contrast",
                  isDarkColor: true,
                },
              },
            },
          },
        },
        {
          type: "Banner",
          props: {
            styles: {
              backgroundColor: {
                selectedColor: "white",
                contrastingColor: "black",
              },
              textColor: {
                selectedColor: "palette-primary",
                contrastingColor: "palette-primary-contrast",
              },
            },
          },
        },
        {
          type: "ComponentC",
          props: {
            styles: {
              cta: {
                textColor: "palette-primary-contrast",
              },
            },
          },
        },
      ],
      zones: {},
    });
  });

  it("updates top-level schemaMarkup @id to the new anchor format", async () => {
    const data = {
      root: {
        props: {
          version: 0,
          schemaMarkup: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Thing",
            "@id": "https://[[siteDomain]]/[[uid]]#customtag",
          }),
        },
      },
      content: [],
      zones: {},
    } as any;
    const migratedData = migrate(
      data,
      [updateSchemaIdAnchorFormat],
      {
        components: {},
      },
      {}
    );
    expect((migratedData.root.props as Record<string, any>)?.schemaMarkup).toBe(
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Thing",
        "@id": "https://[[siteDomain]]/#[[uid]]-customtag",
      })
    );
  });

  it("does not rewrite unrelated custom schemaMarkup @id values", async () => {
    const schemaMarkup = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Thing",
      "@id": "https://example.com/custom-id",
    });
    const data = {
      root: {
        props: {
          version: 0,
          schemaMarkup,
        },
      },
      content: [],
      zones: {},
    } as any;
    const migratedData = migrate(
      data,
      [updateSchemaIdAnchorFormat],
      {
        components: {},
      },
      {}
    );

    expect((migratedData.root.props as Record<string, any>)?.schemaMarkup).toBe(
      schemaMarkup
    );
  });

  it("migrates top-level content into root header, main, and footer zones", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          { type: "ExpandedHeader", props: { id: "ExpandedHeader-1" } },
          { type: "CustomCodeSection", props: { id: "CustomCodeSection-1" } },
          { type: "BannerSection", props: { id: "BannerSection-1" } },
          { type: "CustomCodeSection", props: { id: "CustomCodeSection-2" } },
          { type: "ExpandedFooter", props: { id: "ExpandedFooter-1" } },
        ],
        zones: {},
      } as any,
      [threeZoneRootLayoutMigration],
      {
        components: {
          ExpandedHeader: {} as any,
          ExpandedFooter: {} as any,
          CustomCodeSection: {} as any,
        },
      },
      {}
    );

    expect(migratedData.content).toEqual([]);
    expect(migratedData.zones).toEqual({
      [ROOT_HEADER_ZONE_KEY]: [
        { type: "ExpandedHeader", props: { id: "ExpandedHeader-1" } },
        { type: "CustomCodeSection", props: { id: "CustomCodeSection-1" } },
      ],
      [ROOT_MAIN_ZONE_KEY]: [
        { type: "BannerSection", props: { id: "BannerSection-1" } },
      ],
      [ROOT_FOOTER_ZONE_KEY]: [
        { type: "CustomCodeSection", props: { id: "CustomCodeSection-2" } },
        { type: "ExpandedFooter", props: { id: "ExpandedFooter-1" } },
      ],
    });
  });

  it("keeps middle custom code sections in the main zone", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [
          { type: "BannerSection", props: { id: "BannerSection-1" } },
          { type: "CustomCodeSection", props: { id: "CustomCodeSection-1" } },
          { type: "BannerSection", props: { id: "BannerSection-2" } },
        ],
        zones: {},
      } as any,
      [threeZoneRootLayoutMigration],
      {
        components: {
          ExpandedHeader: {} as any,
          ExpandedFooter: {} as any,
          CustomCodeSection: {} as any,
        },
      },
      {}
    );

    expect(migratedData.zones).toEqual({
      [ROOT_HEADER_ZONE_KEY]: [],
      [ROOT_MAIN_ZONE_KEY]: [
        { type: "BannerSection", props: { id: "BannerSection-1" } },
        { type: "CustomCodeSection", props: { id: "CustomCodeSection-1" } },
        { type: "BannerSection", props: { id: "BannerSection-2" } },
      ],
      [ROOT_FOOTER_ZONE_KEY]: [],
    });
  });

  it("skips root zone migration for component-only configs", async () => {
    const migratedData = migrate(
      {
        root: {
          props: {
            version: 0,
          },
        },
        content: [{ type: "BannerSection", props: { id: "BannerSection-1" } }],
        zones: {},
      } as any,
      [threeZoneRootLayoutMigration],
      {
        components: {
          BannerSection: {} as any,
        },
      },
      {}
    );

    expect(migratedData).toEqual({
      root: {
        props: {
          version: 1,
        },
      },
      content: [{ type: "BannerSection", props: { id: "BannerSection-1" } }],
      zones: {},
    });
  });
});

const migration: Migration = {
  CoreInfoSection: {
    action: "removed",
  },
  BannerSection: { action: "renamed", newName: "ThinBannerSection" },
  HeroSection: {
    action: "updated",
    propTransformation: ({
      data: { businessName, ...otherData },
      ...props
    }) => ({
      ...props,
      data: otherData,
      businessName: businessName,
    }),
  },
};

const alreadyAppliedMigration: Migration = {
  HeroSection: {
    action: "renamed",
    newName: "RenamedSection",
  },
};

export const migrationRegistry: MigrationRegistry = [
  alreadyAppliedMigration,
  migration,
];

const exampleDataBefore = {
  root: {
    props: {
      version: 1,
    },
  },
  content: [
    {
      type: "BannerSection",
      props: {
        text: {
          field: "",
          constantValue: "Banner Text",
          constantValueEnabled: true,
        },
        textAlignment: "center",
        backgroundColor: {
          selectedColor: "palette-primary-dark",
          contrastingColor: "white",
        },
        liveVisibility: true,
        id: "BannerSection-4e3cf9a3-d987-4cae-a0cb-db48d270414f",
      },
    },
    {
      type: "CoreInfoSection",
      props: {
        styles: {
          headingLevel: 3,
          backgroundColor: {
            selectedColor: "white",
            contrastingColor: "black",
          },
        },
        address: {
          headingText: {
            field: "",
            constantValue: "Information",
            constantValueEnabled: true,
          },
          address: {
            field: "address",
            constantValue: {
              line1: "",
              city: "",
              postalCode: "",
              countryCode: "",
            },
          },
          showGetDirectionsLink: true,
        },
        phoneNumbers: {
          phoneNumber: [
            {
              number: { field: "mainPhone", constantValue: "" },
              label: "Phone",
            },
          ],
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
        },
        emails: {
          emails: { field: "emails", constantValue: [] },
          listLength: 1,
        },
        hours: {
          headingText: {
            field: "",
            constantValue: "Hours",
            constantValueEnabled: true,
          },
          hours: { field: "hours", constantValue: {} },
          startOfWeek: "today",
          collapseDays: false,
          showAdditionalHoursText: true,
        },
        services: {
          headingText: {
            field: "",
            constantValue: "Services",
            constantValueEnabled: true,
          },
          servicesList: { field: "services", constantValue: [] },
        },
        liveVisibility: true,
        id: "CoreInfoSection-490a5a66-5674-4fe1-9215-cdf2bfb9d3b0",
      },
    },
    {
      type: "HeroSection",
      props: {
        data: {
          businessName: { field: "name", constantValue: "Business Name" },
          localGeoModifier: {
            field: "address.city",
            constantValue: "Geomodifier Name",
          },
          hours: { field: "hours", constantValue: {} },
          hero: {
            field: "",
            constantValue: {
              image: {
                height: 360,
                width: 640,
                url: "https://placehold.co/640x360",
              },
              primaryCta: {
                label: "Call To Action",
                link: "#",
                linkType: "URL",
              },
              secondaryCta: {
                label: "Call To Action",
                link: "#",
                linkType: "URL",
              },
            },
            constantValueOverride: {
              image: false,
              primaryCta: false,
              secondaryCta: false,
            },
          },
        },
        styles: {
          backgroundColor: {
            selectedColor: "white",
            contrastingColor: "black",
          },
          imageOrientation: "right",
          businessNameLevel: 3,
          localGeoModifierLevel: 1,
          primaryCTA: "primary",
          secondaryCTA: "secondary",
        },
        liveVisibility: true,
        id: "HeroSection-d92bd0a9-4c1f-4c59-ba97-c2a1ec77860f",
      },
    },
  ],
  zones: {},
};

const exampleDataAfter = {
  root: {
    props: {
      version: 2,
    },
  },
  content: [
    {
      type: "ThinBannerSection",
      props: {
        text: {
          field: "",
          constantValue: "Banner Text",
          constantValueEnabled: true,
        },
        textAlignment: "center",
        backgroundColor: {
          selectedColor: "palette-primary-dark",
          contrastingColor: "white",
        },
        liveVisibility: true,
        id: "BannerSection-4e3cf9a3-d987-4cae-a0cb-db48d270414f",
      },
    },
    {
      type: "HeroSection",
      props: {
        businessName: { field: "name", constantValue: "Business Name" },
        data: {
          localGeoModifier: {
            field: "address.city",
            constantValue: "Geomodifier Name",
          },
          hours: { field: "hours", constantValue: {} },
          hero: {
            field: "",
            constantValue: {
              image: {
                height: 360,
                width: 640,
                url: "https://placehold.co/640x360",
              },
              primaryCta: {
                label: "Call To Action",
                link: "#",
                linkType: "URL",
              },
              secondaryCta: {
                label: "Call To Action",
                link: "#",
                linkType: "URL",
              },
            },
            constantValueOverride: {
              image: false,
              primaryCta: false,
              secondaryCta: false,
            },
          },
        },
        styles: {
          backgroundColor: {
            selectedColor: "white",
            contrastingColor: "black",
          },
          imageOrientation: "right",
          businessNameLevel: 3,
          localGeoModifierLevel: 1,
          primaryCTA: "primary",
          secondaryCTA: "secondary",
        },
        liveVisibility: true,
        id: "HeroSection-d92bd0a9-4c1f-4c59-ba97-c2a1ec77860f",
      },
    },
  ],
  zones: {},
};

const exampleRootDataBefore = {
  root: {
    props: {
      version: 0,
      schemaMarkup:
        '{"@context":"https://schema.org","@type":"LocalBusiness","name":"[[name]]","address":{"@type":"PostalAddress","streetAddress":"[[address.line1]]","addressLocality":"[[address.city]]","addressRegion":"[[address.region]]","postalCode":"[[address.postalCode]]","addressCountry":"[[address.countryCode]]"},"openingHours":"[[hours]]","image":"[[photoGallery]]","description":"[[description]]","telephone":"[[mainPhone]]","paymentAccepted":"[[paymentOptions]]","hasOfferCatalog":"[[services]]"}',
    },
  },
  content: [],
  zones: {},
};

const exampleRootDataAfter = {
  root: {
    props: {
      version: 1,
      schemaMarkup:
        '{"@context":"https://schema.org","@type":"LocalBusiness","name":"[[name]]","address":{"@type":"PostalAddress","streetAddress":"[[address.line1]]","addressLocality":"[[address.city]]","addressRegion":"[[address.region]]","postalCode":"[[address.postalCode]]","addressCountry":"[[address.countryCode]]"},"openingHours":"[[hours]]","image":"[[photoGallery]]","description":"[[description]]","telephone":"[[mainPhone]]","paymentAccepted":"[[paymentOptions]]","hasOfferCatalog":"[[services]]","@id":"[[siteDomain]]/[[path]]"}',
    },
  },
  content: [],
  zones: {},
};

const exampleBasicDataBefore = {
  root: {},
  zones: {},
  content: [
    {
      type: "BasicSection",
      props: {
        text: "Some text",
      },
    },
  ],
};

const exampleDocument = {
  fieldA: "Value A",
  fieldB: "Value B",
};

const exampleBasicDataAfter = {
  root: {
    props: {
      version: 1,
    },
  },
  zones: {},
  content: [
    {
      type: "BasicSection",
      props: {
        text: "Value B",
      },
    },
  ],
};
