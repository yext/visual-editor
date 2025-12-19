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
  SlotsCategoryComponents,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@measured/puck";
import { page } from "@vitest/browser/context";

const testDocument = {
  locale: "en",
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
  c_cta: {
    label: "Click Here",
    link: "tel:+18005551010",
    linkType: "PHONE",
  },
  ref_reviewsAgg: [
    {
      averageRating: 4.1,
      publisher: "FIRSTPARTY",
      reviewCount: 26,
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with no data",
    document: {
      locale: "en",
    },
    props: { ...HeroSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with data",
    document: {
      locale: "en",
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
      locale: "en",
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
      locale: "en",
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
      locale: "en",
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
    name: "version 16 props with old CTA structure",
    document: {
      locale: "en",
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
    version: 16,
  },
  {
    name: "version 16 props using entity values with old CTA structure",
    document: {
      locale: "en",
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
            primaryCta: {
              label: "Get Directions",
              link: "#",
              linkType: "URL",
            },
            secondaryCta: {
              label: "Learn More",
              link: "#",
              linkType: "URL",
            },
          },
          constantValueEnabled: false,
          constantValueOverride: {},
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
    version: 16,
  },
  {
    name: "version 16 props with missing ctaType",
    document: {
      locale: "en",
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
              // Missing ctaType - should be added by migration
            },
            secondaryCta: {
              label: "Call To Action 2",
              link: "#",
              linkType: "URL",
              // Missing ctaType - should be added by migration
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
    version: 16,
  },
  {
    name: "[classic] version 17 props using constant values",
    document: testDocument,
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
                en: "",
                hasLocalizedValue: "true",
              },
              ctaType: "presetImage",
              presetImageType: "google-play",
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
    version: 17,
  },
  {
    name: "[classic] version 17 props using entity values",
    document: testDocument,
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
    version: 17,
  },
  {
    name: "[immersive] version 17 props using constant values",
    document: testDocument,
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
                en: "Get Directions",
                hasLocalizedValue: "true",
              },
              ctaType: "getDirections",
              coordinates: {
                latitude: 38.894,
                longitude: -77.0752,
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

    version: 17,
  },
  {
    name: "[spotlight] version 17 props using constant values",
    document: testDocument,
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
    version: 17,
  },
  {
    name: "[compact] version 17 props using constant values",
    document: testDocument,
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
    version: 17,
  },
  {
    name: "[classic] version 31 props with entity values",
    document: testDocument,
    props: {
      data: {
        backgroundImage: {
          field: "logo",
          constantValue: {
            url: "https://placehold.co/640x360",
            height: 360,
            width: 640,
          },
          constantValueEnabled: false,
        },
      },
      styles: {
        variant: "classic",
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        showAverageReview: true,
        showImage: true,
        imageHeight: 500,
        desktopImagePosition: "right",
        desktopContainerPosition: "center",
        mobileContentAlignment: "center",
        mobileImagePosition: "bottom",
      },
      slots: {
        BusinessNameSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-6ecbe797-3521-4429-b6cc-c66b3ce71fd8",
              data: {
                text: {
                  constantValue: {
                    en: "Welcome to [[name]] ",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: false,
                  field: "name",
                },
              },
              styles: { level: 4, align: "center", semanticLevelOverride: 3 },
            },
          },
        ],
        GeomodifierSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-810a913f-60f0-435a-892a-5222c51656ac",
              data: {
                text: {
                  constantValue: {
                    en: "Geomodifier",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: false,
                  field: "address.city",
                },
              },
              styles: { level: 2, align: "center" },
            },
          },
        ],
        HoursStatusSlot: [
          {
            type: "HoursStatusSlot",
            props: {
              id: "HoursStatusSlot-1abddaae-e619-4693-9762-71b5731761d0",
              data: { hours: { field: "hours", constantValue: {} } },
              styles: {
                dayOfWeekFormat: "short",
                showDayNames: false,
                showCurrentStatus: true,
              },
            },
          },
        ],
        ImageSlot: [
          {
            type: "HeroImageSlot",
            props: {
              id: "HeroImageSlot-91467e5b-84ed-4497-8eaa-9699d8926f51",
              data: {
                image: {
                  field: "c_hero.image",
                  constantValue: {
                    url: "https://placehold.co/640x360",
                    height: 360,
                    width: 640,
                  },
                  constantValueEnabled: false,
                },
              },
              styles: { aspectRatio: 1, width: 100 },
              variant: "classic",
              className:
                "mx-auto max-w-full md:max-w-[350px] lg:max-w-[calc(min(calc(100vw-1.5rem),var(--maxWidth-pageSection-contentWidth))-350px)] rounded-image-borderRadius",
            },
          },
        ],
        PrimaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-f45f99e3-0c03-4471-aa48-56e833dc79e0",
              data: {
                entityField: {
                  field: "c_hero.primaryCta",
                  constantValue: {
                    label: { en: "Learn More", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  constantValueEnabled: false,
                },
              },
              eventName: "primaryCta",
              styles: { variant: "link", presetImage: "app-store" },
              parentStyles: {},
            },
          },
        ],
        SecondaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-648b48d4-27b7-4910-89e9-62f570c17bb2",
              data: {
                entityField: {
                  field: "c_hero.secondaryCta",
                  constantValue: {
                    label: { en: "", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "presetImage",
                  },
                  selectedType: "textAndLink",
                  constantValueEnabled: false,
                },
              },
              styles: { variant: "secondary", presetImage: "app-store" },
              eventName: "secondaryCta",
              parentStyles: {},
            },
          },
        ],
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
      conditionalRender: { hours: true },
    },
    version: 31,
  },
  {
    name: "[classic] version 31 props with constant values",
    document: testDocument,
    props: {
      data: {
        backgroundImage: {
          field: "",
          constantValue: {
            url: "https://placehold.co/640x360",
            height: 360,
            width: 640,
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        variant: "classic",
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        showAverageReview: true,
        showImage: true,
        imageHeight: 500,
        desktopImagePosition: "left",
        desktopContainerPosition: "left",
        mobileContentAlignment: "left",
        mobileImagePosition: "bottom",
      },
      slots: {
        BusinessNameSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-6ecbe797-3521-4429-b6cc-c66b3ce71fd8",
              data: {
                text: {
                  constantValue: {
                    en: "Welcome to [[name]] ",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "left", semanticLevelOverride: 2 },
            },
          },
        ],
        GeomodifierSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-810a913f-60f0-435a-892a-5222c51656ac",
              data: {
                text: {
                  constantValue: {
                    en: "Geomodifier",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 1, align: "left" },
            },
          },
        ],
        HoursStatusSlot: [
          {
            type: "HoursStatusSlot",
            props: {
              id: "HoursStatusSlot-1abddaae-e619-4693-9762-71b5731761d0",
              data: { hours: { field: "hours", constantValue: {} } },
              styles: {
                dayOfWeekFormat: "long",
                showDayNames: true,
                showCurrentStatus: true,
              },
            },
          },
        ],
        ImageSlot: [
          {
            type: "HeroImageSlot",
            props: {
              id: "HeroImageSlot-91467e5b-84ed-4497-8eaa-9699d8926f51",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    url: "https://placehold.co/640x360",
                    height: 360,
                    width: 640,
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 490 },
              variant: "classic",
              className:
                "mx-auto max-w-full md:max-w-[350px] lg:max-w-[calc(min(calc(100vw-1.5rem),var(--maxWidth-pageSection-contentWidth))-350px)] rounded-image-borderRadius",
            },
          },
        ],
        PrimaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-f45f99e3-0c03-4471-aa48-56e833dc79e0",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "Learn More", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  constantValueEnabled: true,
                },
              },
              eventName: "primaryCta",
              styles: { variant: "primary", presetImage: "app-store" },
              parentStyles: {},
            },
          },
        ],
        SecondaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-648b48d4-27b7-4910-89e9-62f570c17bb2",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "presetImage",
                  },
                  selectedType: "presetImage",
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "secondary", presetImage: "app-store" },
              eventName: "secondaryCta",
              parentStyles: {},
            },
          },
        ],
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
      conditionalRender: { hours: true },
    },
    version: 31,
  },
  {
    name: "[immersive] version 31 props using entity values",
    document: testDocument,
    props: {
      data: {
        backgroundImage: {
          field: "c_hero.image",
          constantValue: {
            url: "https://placehold.co/640x360",
            height: 360,
            width: 640,
          },
          constantValueEnabled: false,
        },
      },
      styles: {
        variant: "immersive",
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        showAverageReview: true,
        showImage: true,
        imageHeight: 500,
        desktopImagePosition: "right",
        desktopContainerPosition: "center",
        mobileContentAlignment: "center",
        mobileImagePosition: "bottom",
      },
      slots: {
        BusinessNameSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-6ecbe797-3521-4429-b6cc-c66b3ce71fd8",
              data: {
                text: {
                  constantValue: {
                    en: "Welcome to [[name]] ",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: false,
                  field: "name",
                },
              },
              styles: { level: 4, align: "center", semanticLevelOverride: 5 },
            },
          },
        ],
        GeomodifierSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-810a913f-60f0-435a-892a-5222c51656ac",
              data: {
                text: {
                  constantValue: {
                    en: "Geomodifier",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: false,
                  field: "address.city",
                },
              },
              styles: { level: 2, align: "center" },
            },
          },
        ],
        HoursStatusSlot: [
          {
            type: "HoursStatusSlot",
            props: {
              id: "HoursStatusSlot-1abddaae-e619-4693-9762-71b5731761d0",
              data: { hours: { field: "hours", constantValue: {} } },
              styles: {
                dayOfWeekFormat: "short",
                showDayNames: true,
                showCurrentStatus: false,
              },
            },
          },
        ],
        ImageSlot: [
          {
            type: "HeroImageSlot",
            props: {
              id: "HeroImageSlot-91467e5b-84ed-4497-8eaa-9699d8926f51",
              data: {
                image: {
                  field: "logo",
                  constantValue: {
                    url: "https://placehold.co/640x360",
                    height: 360,
                    width: 640,
                  },
                  constantValueEnabled: false,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              variant: "immersive",
              className: "w-full sm:w-fit h-full ml-auto",
            },
          },
        ],
        PrimaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-f45f99e3-0c03-4471-aa48-56e833dc79e0",
              data: {
                entityField: {
                  field: "c_cta1",
                  constantValue: {
                    label: { en: "Learn More", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  constantValueEnabled: false,
                },
              },
              eventName: "primaryCta",
              styles: { variant: "link", presetImage: "app-store" },
              parentStyles: {},
            },
          },
        ],
        SecondaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-648b48d4-27b7-4910-89e9-62f570c17bb2",
              data: {
                entityField: {
                  field: "c_hero.secondaryCta",
                  constantValue: {
                    label: { en: "", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "presetImage",
                  },
                  selectedType: "textAndLink",
                  constantValueEnabled: false,
                },
              },
              styles: { variant: "secondary", presetImage: "app-store" },
              eventName: "secondaryCta",
              parentStyles: {},
            },
          },
        ],
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
      id: "HeroSection-1d9fd3d4-5d88-49ac-913e-28921acfc378",
      conditionalRender: { hours: true },
    },
    version: 31,
  },
  {
    name: "[immersive] version 31 props using constant values",
    document: testDocument,
    props: {
      data: {
        backgroundImage: {
          field: "",
          constantValue: {
            url: "https://placehold.co/640x360",
            height: 360,
            width: 640,
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        variant: "immersive",
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        showAverageReview: true,
        showImage: true,
        imageHeight: 500,
        desktopImagePosition: "left",
        desktopContainerPosition: "left",
        mobileContentAlignment: "left",
        mobileImagePosition: "bottom",
      },
      slots: {
        BusinessNameSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-6ecbe797-3521-4429-b6cc-c66b3ce71fd8",
              data: {
                text: {
                  constantValue: {
                    en: "Welcome to [[name]] ",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "left", semanticLevelOverride: 2 },
            },
          },
        ],
        GeomodifierSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-810a913f-60f0-435a-892a-5222c51656ac",
              data: {
                text: {
                  constantValue: {
                    en: "Geomodifier",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 1, align: "left" },
            },
          },
        ],
        HoursStatusSlot: [
          {
            type: "HoursStatusSlot",
            props: {
              id: "HoursStatusSlot-1abddaae-e619-4693-9762-71b5731761d0",
              data: { hours: { field: "hours", constantValue: {} } },
              styles: {
                dayOfWeekFormat: "long",
                showDayNames: true,
                showCurrentStatus: true,
              },
            },
          },
        ],
        ImageSlot: [
          {
            type: "HeroImageSlot",
            props: {
              id: "HeroImageSlot-91467e5b-84ed-4497-8eaa-9699d8926f51",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    url: "https://placehold.co/640x360",
                    height: 360,
                    width: 640,
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              variant: "immersive",
              className:
                "max-w-full sm:max-w-initial md:max-w-[350px] lg:max-w-none rounded-image-borderRadius",
            },
          },
        ],
        PrimaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-f45f99e3-0c03-4471-aa48-56e833dc79e0",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "Learn More", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  constantValueEnabled: true,
                },
              },
              eventName: "primaryCta",
              styles: { variant: "primary", presetImage: "app-store" },
              parentStyles: {},
            },
          },
        ],
        SecondaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-648b48d4-27b7-4910-89e9-62f570c17bb2",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "presetImage",
                  },
                  selectedType: "presetImage",
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "secondary", presetImage: "app-store" },
              eventName: "secondaryCta",
              parentStyles: {},
            },
          },
        ],
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
      conditionalRender: { hours: true },
    },
    version: 31,
  },
  {
    name: "[spotlight] version 31 props with entity values",
    document: testDocument,
    props: {
      data: {
        backgroundImage: {
          field: "c_hero.image",
          constantValue: {
            url: "https://placehold.co/640x360",
            height: 360,
            width: 640,
          },
          constantValueEnabled: false,
        },
      },
      styles: {
        variant: "spotlight",
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        showAverageReview: true,
        showImage: true,
        imageHeight: 500,
        desktopImagePosition: "right",
        desktopContainerPosition: "left",
        mobileContentAlignment: "center",
        mobileImagePosition: "bottom",
      },
      slots: {
        BusinessNameSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-6ecbe797-3521-4429-b6cc-c66b3ce71fd8",
              data: {
                text: {
                  constantValue: {
                    en: "Welcome to [[name]] ",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: false,
                  field: "name",
                },
              },
              styles: { level: 3, align: "center", semanticLevelOverride: 5 },
            },
          },
        ],
        GeomodifierSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-810a913f-60f0-435a-892a-5222c51656ac",
              data: {
                text: {
                  constantValue: {
                    en: "Geomodifier",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: false,
                  field: "address.city",
                },
              },
              styles: { level: 4, align: "center" },
            },
          },
        ],
        HoursStatusSlot: [
          {
            type: "HoursStatusSlot",
            props: {
              id: "HoursStatusSlot-1abddaae-e619-4693-9762-71b5731761d0",
              data: { hours: { field: "hours", constantValue: {} } },
              styles: {
                dayOfWeekFormat: "long",
                showDayNames: true,
                showCurrentStatus: true,
              },
            },
          },
        ],
        ImageSlot: [
          {
            type: "HeroImageSlot",
            props: {
              id: "HeroImageSlot-91467e5b-84ed-4497-8eaa-9699d8926f51",
              data: {
                image: {
                  field: "logo",
                  constantValue: {
                    url: "https://placehold.co/640x360",
                    height: 360,
                    width: 640,
                  },
                  constantValueEnabled: false,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              variant: "spotlight",
              className: "w-full sm:w-fit h-full ml-auto",
            },
          },
        ],
        PrimaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-f45f99e3-0c03-4471-aa48-56e833dc79e0",
              data: {
                entityField: {
                  field: "c_hero.primaryCta",
                  constantValue: {
                    label: { en: "Learn More", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  constantValueEnabled: false,
                },
              },
              eventName: "primaryCta",
              styles: { variant: "secondary", presetImage: "app-store" },
              parentStyles: {},
            },
          },
        ],
        SecondaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-648b48d4-27b7-4910-89e9-62f570c17bb2",
              data: {
                entityField: {
                  field: "c_cta",
                  constantValue: {
                    label: { en: "", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "presetImage",
                  },
                  selectedType: "presetImage",
                  constantValueEnabled: false,
                },
              },
              styles: { variant: "secondary", presetImage: "app-store" },
              eventName: "secondaryCta",
              parentStyles: {},
            },
          },
        ],
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
      id: "HeroSection-1d9fd3d4-5d88-49ac-913e-28921acfc378",
      conditionalRender: { hours: true },
    },
    version: 31,
  },
  {
    name: "[spotlight] version 31 props with constant values",
    document: testDocument,
    props: {
      data: {
        backgroundImage: {
          field: "",
          constantValue: {
            url: "https://placehold.co/640x360",
            height: 360,
            width: 640,
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        variant: "spotlight",
        backgroundColor: {
          bgColor: "bg-palette-quaternary",
          textColor: "text-palette-quaternary-contrast",
        },
        showAverageReview: false,
        showImage: true,
        imageHeight: 500,
        desktopImagePosition: "left",
        desktopContainerPosition: "center",
        mobileContentAlignment: "left",
        mobileImagePosition: "bottom",
      },
      slots: {
        BusinessNameSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-6ecbe797-3521-4429-b6cc-c66b3ce71fd8",
              data: {
                text: {
                  constantValue: {
                    en: "Welcome to [[name]] ",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "center", semanticLevelOverride: 2 },
            },
          },
        ],
        GeomodifierSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-810a913f-60f0-435a-892a-5222c51656ac",
              data: {
                text: {
                  constantValue: {
                    en: "Geomodifier",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 4, align: "center" },
            },
          },
        ],
        HoursStatusSlot: [
          {
            type: "HoursStatusSlot",
            props: {
              id: "HoursStatusSlot-1abddaae-e619-4693-9762-71b5731761d0",
              data: { hours: { field: "hours", constantValue: {} } },
              styles: {
                dayOfWeekFormat: "long",
                showDayNames: true,
                showCurrentStatus: true,
              },
            },
          },
        ],
        ImageSlot: [
          {
            type: "HeroImageSlot",
            props: {
              id: "HeroImageSlot-91467e5b-84ed-4497-8eaa-9699d8926f51",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    url: "https://placehold.co/640x360",
                    height: 360,
                    width: 640,
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              variant: "spotlight",
              className:
                "max-w-full sm:max-w-initial md:max-w-[350px] lg:max-w-none rounded-image-borderRadius",
            },
          },
        ],
        PrimaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-f45f99e3-0c03-4471-aa48-56e833dc79e0",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "Learn More", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  constantValueEnabled: true,
                },
              },
              eventName: "primaryCta",
              styles: { variant: "link", presetImage: "app-store" },
              parentStyles: {},
            },
          },
        ],
        SecondaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-648b48d4-27b7-4910-89e9-62f570c17bb2",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "presetImage",
                  },
                  selectedType: "presetImage",
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "secondary", presetImage: "app-store" },
              eventName: "secondaryCta",
              parentStyles: {},
            },
          },
        ],
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
      conditionalRender: { hours: true },
    },
    version: 31,
  },
  {
    name: "[compact] version 31 props with entity values",
    document: testDocument,
    props: {
      data: {
        backgroundImage: {
          field: "c_hero.image",
          constantValue: {
            url: "https://placehold.co/640x360",
            height: 360,
            width: 640,
          },
          constantValueEnabled: false,
        },
      },
      styles: {
        variant: "compact",
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        showAverageReview: true,
        showImage: true,
        imageHeight: 500,
        desktopImagePosition: "right",
        desktopContainerPosition: "center",
        mobileContentAlignment: "center",
        mobileImagePosition: "bottom",
      },
      slots: {
        BusinessNameSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-6ecbe797-3521-4429-b6cc-c66b3ce71fd8",
              data: {
                text: {
                  constantValue: {
                    en: "Welcome to [[name]] ",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: false,
                  field: "name",
                },
              },
              styles: { level: 3, align: "center", semanticLevelOverride: 5 },
            },
          },
        ],
        GeomodifierSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-810a913f-60f0-435a-892a-5222c51656ac",
              data: {
                text: {
                  constantValue: {
                    en: "Geomodifier",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: false,
                  field: "address.city",
                },
              },
              styles: { level: 4, align: "center" },
            },
          },
        ],
        HoursStatusSlot: [
          {
            type: "HoursStatusSlot",
            props: {
              id: "HoursStatusSlot-1abddaae-e619-4693-9762-71b5731761d0",
              data: { hours: { field: "hours", constantValue: {} } },
              styles: {
                dayOfWeekFormat: "long",
                showDayNames: true,
                showCurrentStatus: true,
              },
            },
          },
        ],
        ImageSlot: [
          {
            type: "HeroImageSlot",
            props: {
              id: "HeroImageSlot-91467e5b-84ed-4497-8eaa-9699d8926f51",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    url: "https://placehold.co/640x360",
                    height: 360,
                    width: 640,
                  },
                  constantValueEnabled: false,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              variant: "compact",
              className: "w-full sm:w-fit h-full ml-auto",
            },
          },
        ],
        PrimaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-f45f99e3-0c03-4471-aa48-56e833dc79e0",
              data: {
                entityField: {
                  field: "c_cta",
                  constantValue: {
                    label: { en: "Learn More", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  constantValueEnabled: false,
                },
              },
              eventName: "primaryCta",
              styles: { variant: "secondary", presetImage: "app-store" },
              parentStyles: {},
            },
          },
        ],
        SecondaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-648b48d4-27b7-4910-89e9-62f570c17bb2",
              data: {
                entityField: {
                  field: "c_hero.secondaryCta",
                  constantValue: {
                    label: { en: "", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "presetImage",
                  },
                  selectedType: "presetImage",
                  constantValueEnabled: false,
                },
              },
              styles: { variant: "secondary", presetImage: "app-store" },
              eventName: "secondaryCta",
              parentStyles: {},
            },
          },
        ],
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
      id: "HeroSection-1d9fd3d4-5d88-49ac-913e-28921acfc378",
      conditionalRender: { hours: true },
    },
    version: 31,
  },
  {
    name: "[compact] version 31 props with constant values",
    document: testDocument,
    props: {
      data: {
        backgroundImage: {
          field: "",
          constantValue: {
            url: "https://placehold.co/640x360",
            height: 360,
            width: 640,
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        variant: "compact",
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        showAverageReview: true,
        showImage: true,
        imageHeight: 500,
        desktopImagePosition: "right",
        desktopContainerPosition: "center",
        mobileContentAlignment: "left",
        mobileImagePosition: "bottom",
      },
      slots: {
        BusinessNameSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-6ecbe797-3521-4429-b6cc-c66b3ce71fd8",
              data: {
                text: {
                  constantValue: {
                    en: "Welcome to [[name]] ",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "center", semanticLevelOverride: 5 },
            },
          },
        ],
        GeomodifierSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-810a913f-60f0-435a-892a-5222c51656ac",
              data: {
                text: {
                  constantValue: {
                    en: "Geomodifier",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 4, align: "center" },
            },
          },
        ],
        HoursStatusSlot: [
          {
            type: "HoursStatusSlot",
            props: {
              id: "HoursStatusSlot-1abddaae-e619-4693-9762-71b5731761d0",
              data: { hours: { field: "hours", constantValue: {} } },
              styles: {
                dayOfWeekFormat: "long",
                showDayNames: true,
                showCurrentStatus: true,
              },
            },
          },
        ],
        ImageSlot: [
          {
            type: "HeroImageSlot",
            props: {
              id: "HeroImageSlot-91467e5b-84ed-4497-8eaa-9699d8926f51",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    url: "https://placehold.co/640x360",
                    height: 360,
                    width: 640,
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              variant: "compact",
              className: "w-full sm:w-fit h-full ml-auto",
            },
          },
        ],
        PrimaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-f45f99e3-0c03-4471-aa48-56e833dc79e0",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "Learn More", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  constantValueEnabled: true,
                },
              },
              eventName: "primaryCta",
              styles: { variant: "link", presetImage: "app-store" },
              parentStyles: {},
            },
          },
        ],
        SecondaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-648b48d4-27b7-4910-89e9-62f570c17bb2",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "presetImage",
                  },
                  selectedType: "presetImage",
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "secondary", presetImage: "app-store" },
              eventName: "secondaryCta",
              parentStyles: {},
            },
          },
        ],
      },
      analytics: { scope: "heroSection" },
      liveVisibility: true,
      conditionalRender: { hours: true },
    },
    version: 31,
  },
  {
    name: "version 48 props",
    document: {
      locale: "en",
      name: "name",
      address: {
        city: "city",
      },
      hours: testHours,
    },
    props: {
      data: {
        hero: { field: "", constantValue: {}, constantValueEnabled: true },
      },
      styles: {
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
      },
      slots: {
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-v48",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://placehold.co/100x100",
                      height: 100,
                      width: 100,
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
            },
          },
        ],
        PrimaryCTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "PrimaryCTASlot-v48",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: {
                      en: "Get Directions",
                      hasLocalizedValue: "true",
                    },
                    link: {
                      en: "#",
                      hasLocalizedValue: "true",
                    },
                    linkType: "URL",
                  },
                  constantValueEnabled: true,
                },
              },
            },
          },
        ],
        SecondaryCTASlot: [],
        GeomodifierSlot: [],
        HoursStatusSlot: [],
      },
    },
    version: 48,
  },
];

const BRAND_COLOR_BG_ALLOWLIST = new Set([
  "bg-palette-primary",
  "bg-palette-primary-dark",
  "bg-palette-secondary",
  "bg-palette-secondary-dark",
  "bg-palette-tertiary",
  "bg-palette-tertiary-dark",
  "bg-palette-quaternary",
  "bg-palette-quaternary-dark",
]);

const isBrandColorTest = (props: any) => {
  const bg = props?.styles?.backgroundColor?.bgColor;
  return typeof bg === "string" && BRAND_COLOR_BG_ALLOWLIST.has(bg);
};

describe("HeroSection", async () => {
  const puckConfig: Config = {
    components: {
      HeroSection,
      ...SlotsCategoryComponents,
    },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
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
        puckConfig,
        document
      );

      const updatedData = await resolveAllData(data, puckConfig, {
        streamDocument: document,
      });

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render
            config={puckConfig}
            data={updatedData}
            metadata={{ streamDocument: document }}
          />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      const images = Array.from(container.querySelectorAll("img"));
      await waitFor(() => {
        expect(images.every((i) => i.complete)).toBe(true);
      });

      await expect(`HeroSection/[${viewportName}] ${name}`).toMatchScreenshot();
      const results = await axe(container);
      if (isBrandColorTest(props)) {
        console.warn(
          `IGNORING axe violations for brand color test: ${name}`,
          results
        );
      } else {
        expect(results).toHaveNoViolations();
      }

      if (interactions) {
        await interactions(page);
        await expect(
          `HeroSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        if (isBrandColorTest(props)) {
          console.warn(
            `IGNORING axe violations for brand color test: ${name}`,
            results
          );
        } else {
          expect(results).toHaveNoViolations();
        }
      }
    }
  );
});
