import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  testHours,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  HeroSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const tests: ComponentTest[] = [
  {
    name: "default props with no data",
    document: {},
    props: { ...HeroSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with data",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
      ref_reviewsAgg: [
        {
          averageRating: 4.1,
          publisher: "FIRSTPARTY",
          reviewCount: 26,
        },
      ],
    },
    props: { ...HeroSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props using entity values",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
      c_hero: {
        image: { url: "https://placehold.co/100x100", height: 100, width: 100 },
        primaryCta: { label: "Get Directions", link: "#", linkType: "URL" },
        secondaryCta: {
          label: "Learn More",
          link: "#",
          linkType: "URL",
        },
      },
      ref_reviewsAgg: [
        {
          averageRating: 4.1,
          publisher: "FIRSTPARTY",
          reviewCount: 26,
        },
      ],
    },
    props: {
      data: {
        businessName: {
          field: "name",
          constantValue: "Constant Name",
        },
        localGeoModifier: {
          field: "address.city",
          constantValue: "Geomodifier Name",
        },
        hours: { field: "hours", constantValue: {} },
        hero: {
          field: "c_hero",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            primaryCta: { label: "Call To Action", link: "#", linkType: "URL" },
            secondaryCta: {
              label: "Call To Action",
              link: "#",
              linkType: "URL",
            },
          },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        imageOrientation: "left",
        businessNameLevel: 3,
        localGeoModifierLevel: 1,
        primaryCTA: "primary",
        secondaryCTA: "link",
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props using constant values",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
      c_hero: {
        image: { url: "https://placehold.co/100x100", height: 100, width: 100 },
        primaryCta: { label: "Get Directions", link: "#", linkType: "URL" },
        secondaryCta: {
          label: "Learn More",
          link: "#",
          linkType: "URL",
        },
      },
      ref_reviewsAgg: [
        {
          averageRating: 4.1,
          publisher: "FIRSTPARTY",
          reviewCount: 26,
        },
      ],
    },
    props: {
      data: {
        businessName: {
          field: "name",
          constantValue: "Constant Name",
          constantValueEnabled: true,
        },
        localGeoModifier: {
          field: "address.city",
          constantValue: "Geomodifier Name",
          constantValueEnabled: true,
        },
        hours: { field: "hours", constantValue: {} },
        hero: {
          constantValueOverride: {
            image: true,
            primaryCta: true,
            secondaryCta: true,
          },
          field: "c_hero",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            primaryCta: {
              label: "Call To Action 1",
              link: "#",
              linkType: "URL",
            },
            secondaryCta: {
              label: "Call To Action 2",
              link: "#",
              linkType: "URL",
            },
          },
        },
      },
      styles: {
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        imageOrientation: "right",
        businessNameLevel: 6,
        localGeoModifierLevel: 3,
        primaryCTA: "secondary",
        secondaryCTA: "primary",
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 9 props using constant values",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
      c_hero: {
        image: { url: "https://placehold.co/100x100", height: 100, width: 100 },
        primaryCta: { label: "Get Directions", link: "#", linkType: "URL" },
        secondaryCta: {
          label: "Learn More",
          link: "#",
          linkType: "URL",
        },
      },
      ref_reviewsAgg: [
        {
          averageRating: 4.1,
          publisher: "FIRSTPARTY",
          reviewCount: 26,
        },
      ],
    },
    props: {
      data: {
        businessName: {
          field: "name",
          constantValue: "Constant Name",
          constantValueEnabled: true,
        },
        localGeoModifier: {
          field: "address.city",
          constantValue: "Geomodifier Name",
          constantValueEnabled: true,
        },
        hours: { field: "hours", constantValue: {} },
        hero: {
          constantValueOverride: {
            image: true,
            primaryCta: true,
            secondaryCta: true,
          },
          field: "c_hero",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            primaryCta: {
              label: "Call To Action 1",
              link: "#",
              linkType: "URL",
            },
            secondaryCta: {
              label: "Call To Action 2",
              link: "#",
              linkType: "URL",
            },
          },
        },
        showAverageReview: true,
      },
      styles: {
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        imageOrientation: "right",
        businessNameLevel: 6,
        localGeoModifierLevel: 3,
        primaryCTA: "secondary",
        secondaryCTA: "primary",
        image: {
          width: 500,
          aspectRatio: 1.0,
        },
      },
      liveVisibility: true,
    },
    version: 9,
  },
  {
    name: "[classic] version 14 props using constant values",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
      c_hero: {
        image: { url: "https://placehold.co/100x100", height: 100, width: 100 },
        primaryCta: { label: "Get Directions", link: "#", linkType: "URL" },
        secondaryCta: {
          label: "Learn More",
          link: "#",
          linkType: "URL",
        },
      },
      ref_reviewsAgg: [
        {
          averageRating: 4.1,
          publisher: "FIRSTPARTY",
          reviewCount: 26,
        },
      ],
    },
    props: {
      data: {
        businessName: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            en: "Business Name",
            hasLocalizedValue: "true",
          },
        },
        localGeoModifier: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            en: "Geomodifier",
            hasLocalizedValue: "true",
          },
        },
        hours: { field: "hours", constantValue: {} },
        hero: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            primaryCta: {
              label: {
                en: "Call To Action",
                hasLocalizedValue: "true",
              },
              link: "#",
              linkType: "URL",
            },
            secondaryCta: {
              label: {
                en: "Call To Action",
                hasLocalizedValue: "true",
              },
              link: "#",
              linkType: "URL",
            },
            image: {
              url: "https://placehold.co/640x360",
              height: 360,
              width: 640,
            },
          },
          constantValueOverride: {
            image: true,
            primaryCta: true,
            secondaryCta: true,
          },
        },
        showAverageReview: true,
      },
      styles: {
        variant: "classic",
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        desktopImagePosition: "right",
        businessNameLevel: 3,
        localGeoModifierLevel: 1,
        primaryCTA: "primary",
        secondaryCTA: "secondary",
        image: { aspectRatio: 1.78 },
        desktopContainerPosition: "left",
        mobileContentAlignment: "left",
        showImage: true,
        mobileImagePosition: "bottom",
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
      id: "HeroSection-99c86e04-e8fc-441e-b14d-e165b787d6d5",
    },
    version: 14,
  },
  {
    name: "[classic] version 14 props using entity values",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
      c_hero: {
        image: { url: "https://placehold.co/100x100", height: 100, width: 100 },
        primaryCta: { label: "Get Directions", link: "#", linkType: "URL" },
        secondaryCta: {
          label: "Learn More",
          link: "#",
          linkType: "URL",
        },
      },
      ref_reviewsAgg: [
        {
          averageRating: 4.1,
          publisher: "FIRSTPARTY",
          reviewCount: 26,
        },
      ],
    },
    props: {
      data: {
        businessName: {
          field: "name",
          constantValue: {
            en: "Business Name",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: false,
        },
        localGeoModifier: {
          field: "address.line1",
          constantValue: {
            en: "Geomodifier",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: false,
        },
        hours: { field: "hours", constantValue: {} },
        hero: {
          field: "c_hero",
          constantValue: {
            primaryCta: {
              label: {
                en: "Call To Action",
                hasLocalizedValue: "true",
              },
              link: "#",
              linkType: "URL",
            },
            secondaryCta: {
              label: {
                en: "Call To Action",
                hasLocalizedValue: "true",
              },
              link: "#",
              linkType: "URL",
            },
            image: {
              url: "https://placehold.co/640x360",
              height: 360,
              width: 640,
            },
          },
          constantValueEnabled: false,
          constantValueOverride: {
            image: false,
            primaryCta: false,
            secondaryCta: false,
          },
        },
        showAverageReview: true,
      },
      styles: {
        variant: "classic",
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        desktopImagePosition: "right",
        businessNameLevel: 3,
        localGeoModifierLevel: 1,
        primaryCTA: "primary",
        secondaryCTA: "secondary",
        image: { aspectRatio: 1.78 },
        desktopContainerPosition: "left",
        mobileContentAlignment: "left",
        showImage: true,
        mobileImagePosition: "bottom",
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
    },
    version: 14,
  },
  {
    name: "[immersive] version 14 props using constant values",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
      c_hero: {
        image: { url: "https://placehold.co/100x100", height: 100, width: 100 },
        primaryCta: { label: "Get Directions", link: "#", linkType: "URL" },
        secondaryCta: {
          label: "Learn More",
          link: "#",
          linkType: "URL",
        },
      },
      ref_reviewsAgg: [
        {
          averageRating: 4.1,
          publisher: "FIRSTPARTY",
          reviewCount: 26,
        },
      ],
    },
    props: {
      data: {
        businessName: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            en: "Business Name",
            hasLocalizedValue: "true",
          },
        },
        localGeoModifier: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            en: "Geomodifier",
            hasLocalizedValue: "true",
          },
        },
        hours: { field: "hours", constantValue: {} },
        hero: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            primaryCta: {
              label: {
                en: "Call To Action",
                hasLocalizedValue: "true",
              },
              link: "#",
              linkType: "URL",
            },
            secondaryCta: {
              label: {
                en: "Call To Action",
                hasLocalizedValue: "true",
              },
              link: "#",
              linkType: "URL",
            },
            image: {
              url: "https://placehold.co/640x360",
              height: 360,
              width: 640,
            },
          },
          constantValueOverride: {
            image: true,
            primaryCta: true,
            secondaryCta: true,
          },
        },
        showAverageReview: true,
      },
      styles: {
        variant: "immersive",
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        desktopImagePosition: "right",
        businessNameLevel: 3,
        localGeoModifierLevel: 1,
        primaryCTA: "primary",
        secondaryCTA: "secondary",
        image: { aspectRatio: 1.78 },
        desktopContainerPosition: "left",
        mobileContentAlignment: "left",
        showImage: true,
        mobileImagePosition: "bottom",
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
    },

    version: 14,
  },
  {
    name: "[spotlight] version 14 props using constant values",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
      c_hero: {
        image: { url: "https://placehold.co/100x100", height: 100, width: 100 },
        primaryCta: { label: "Get Directions", link: "#", linkType: "URL" },
        secondaryCta: {
          label: "Learn More",
          link: "#",
          linkType: "URL",
        },
      },
      ref_reviewsAgg: [
        {
          averageRating: 4.1,
          publisher: "FIRSTPARTY",
          reviewCount: 26,
        },
      ],
    },
    props: {
      data: {
        businessName: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            en: "Business Name",
            hasLocalizedValue: "true",
          },
        },
        localGeoModifier: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            en: "Geomodifier",
            hasLocalizedValue: "true",
          },
        },
        hours: { field: "hours", constantValue: {} },
        hero: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            primaryCta: {
              label: {
                en: "Call To Action",
                hasLocalizedValue: "true",
              },
              link: "#",
              linkType: "URL",
            },
            secondaryCta: {
              label: {
                en: "Call To Action",
                hasLocalizedValue: "true",
              },
              link: "#",
              linkType: "URL",
            },
            image: {
              url: "https://placehold.co/640x360",
              height: 360,
              width: 640,
            },
          },
          constantValueOverride: {
            image: true,
            primaryCta: true,
            secondaryCta: true,
          },
        },
        showAverageReview: true,
      },
      styles: {
        variant: "spotlight",
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        desktopImagePosition: "right",
        businessNameLevel: 1,
        localGeoModifierLevel: 6,
        primaryCTA: "secondary",
        secondaryCTA: "link",
        image: { aspectRatio: 1.78 },
        desktopContainerPosition: "center",
        mobileContentAlignment: "center",
        showImage: true,
        mobileImagePosition: "bottom",
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
    },
    version: 14,
  },
  {
    name: "[compact] version 14 props using constant values",
    document: {
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
      c_hero: {
        image: { url: "https://placehold.co/100x100", height: 100, width: 100 },
        primaryCta: { label: "Get Directions", link: "#", linkType: "URL" },
        secondaryCta: {
          label: "Learn More",
          link: "#",
          linkType: "URL",
        },
      },
      ref_reviewsAgg: [
        {
          averageRating: 4.1,
          publisher: "FIRSTPARTY",
          reviewCount: 26,
        },
      ],
    },
    props: {
      data: {
        businessName: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            en: "Business Name",
            hasLocalizedValue: "true",
          },
        },
        localGeoModifier: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            en: "Geomodifier",
            hasLocalizedValue: "true",
          },
        },
        hours: { field: "hours", constantValue: {} },
        hero: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            primaryCta: {
              label: {
                en: "Call To Action",
                hasLocalizedValue: "true",
              },
              link: "#",
              linkType: "URL",
            },
            secondaryCta: {
              label: {
                en: "Call To Action",
                hasLocalizedValue: "true",
              },
              link: "#",
              linkType: "URL",
            },
            image: {
              url: "https://placehold.co/640x360",
              height: 360,
              width: 640,
            },
          },
          constantValueOverride: {
            image: true,
            primaryCta: true,
            secondaryCta: true,
          },
        },
        showAverageReview: true,
      },
      styles: {
        variant: "compact",
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        desktopImagePosition: "right",
        businessNameLevel: 3,
        localGeoModifierLevel: 1,
        primaryCTA: "primary",
        secondaryCTA: "secondary",
        image: { aspectRatio: 1.78 },
        desktopContainerPosition: "left",
        mobileContentAlignment: "left",
        showImage: true,
        mobileImagePosition: "bottom",
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
    },
    version: 14,
  },
];

describe("HeroSection", async () => {
  const puckConfig: Config = {
    components: { HeroSection },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({
      document,
      name,
      props,
      interactions,
      version,
      viewport: { width, height, name: viewportName },
    }) => {
      const data = migrate(
        {
          root: {
            props: {
              version,
            },
          },
          content: [
            {
              type: "HeroSection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig
      );

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      const images = Array.from(container.querySelectorAll("img"));
      await waitFor(() => {
        expect(images.every((i) => i.complete)).toBe(true);
      });

      await expect(`HeroSection/[${viewportName}] ${name}`).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `HeroSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
