import { describe, expect, it } from "vitest";
import { Migration, MigrationRegistry, migrate } from "./migrate.ts";

describe("migrate", () => {
  it("successfully applies a migration", async () => {
    const migratedData = migrate(exampleDataBefore, migrationRegistry);
    expect(migratedData).toMatchObject(exampleDataAfter);
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
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
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
          backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
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
          backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
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
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
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
          backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
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
