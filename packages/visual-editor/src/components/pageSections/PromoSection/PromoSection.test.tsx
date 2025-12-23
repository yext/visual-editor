import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  delay,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  PromoSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
  SlotsCategoryComponents,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@measured/puck";
import { page } from "@vitest/browser/context";

const promoData = {
  cta: {
    label: "Call to Order",
    link: "+18005551010",
    linkType: "PHONE",
  },
  description: {
    html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Our out-of-this-world </span><b><strong style="font-weight: bold;">burgers</strong></b><span> and</span><b><strong style="font-weight: bold;"> fresh salads</strong></b><span> are a flavor journey you won&#39;t forget. Explore a galaxy of taste, where every ingredient composes a symphony of flavors. Come visit us for a stellar dining experience!</span></p>',
  },
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
  title: "Taste the universe!",
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...PromoSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { c_promo: promoData },
    props: { ...PromoSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props with entity values",
    document: { c_promo: promoData },
    props: {
      data: {
        promo: {
          field: "c_promo",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            title: "Title",
            description: "Description",
            cta: { label: "Call To Action", link: "#", linkType: "URL" },
          },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        orientation: "right",
        ctaVariant: "secondary",
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props with constant value",
    document: { c_promo: promoData },
    props: {
      data: {
        promo: {
          constantValueOverride: {
            image: true,
            title: true,
            description: true,
            cta: true,
          },
          field: "c_promo",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            title: "Title",
            description: "Description",
            cta: { label: "Call To Action", link: "#", linkType: "URL" },
          },
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        orientation: "right",
        ctaVariant: "secondary",
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 5 props with constant value",
    document: { c_promo: promoData },
    props: {
      data: {
        promo: {
          field: "c_promo",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            title: { en: "Featured Promotion", hasLocalizedValue: "true" },
            description: {
              en: "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters",
              hasLocalizedValue: "true",
            },
            cta: {
              label: { en: "Learn More", hasLocalizedValue: "true" },
              link: "#",
              linkType: "URL",
            },
          },
          constantValueEnabled: true,
          constantValueOverride: {
            image: true,
            title: true,
            description: true,
            cta: true,
          },
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        orientation: "right",
        ctaVariant: "secondary",
        heading: {
          level: 2,
          align: "left",
        },
      },
      liveVisibility: true,
    },
    version: 5,
  },
  {
    name: "version 16 props with old CTA structure",
    document: { c_promo: promoData },
    props: {
      data: {
        promo: {
          field: "c_promo",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            title: "Title",
            description: "Description",
            cta: { label: "Call To Action", link: "#", linkType: "URL" },
          },
          constantValueEnabled: true,
          constantValueOverride: {
            image: true,
            title: true,
            description: true,
            cta: true,
          },
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        orientation: "left",
        ctaVariant: "primary",
        heading: {
          level: 1,
          align: "left",
        },
        image: {
          aspectRatio: 1.78,
        },
      },
      liveVisibility: true,
    },
    version: 16,
  },
  {
    name: "version 16 props using entity values with old CTA structure",
    document: { c_promo: promoData },
    props: {
      data: {
        promo: {
          field: "c_promo",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            title: "Title",
            description: "Description",
            cta: { label: "Call To Action", link: "#", linkType: "URL" },
          },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        orientation: "left",
        ctaVariant: "primary",
        heading: {
          level: 1,
          align: "left",
        },
        image: {
          aspectRatio: 1.78,
        },
      },
      liveVisibility: true,
    },
    version: 16,
  },
  {
    name: "version 16 props with missing ctaType",
    document: { c_promo: promoData },
    props: {
      data: {
        promo: {
          field: "c_promo",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            title: "Title",
            description: "Description",
            cta: {
              label: "Call To Action",
              link: "#",
              linkType: "URL",
              // Missing ctaType - should be added by migration
            },
          },
          constantValueEnabled: true,
          constantValueOverride: {
            image: true,
            title: true,
            description: true,
            cta: true,
          },
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        orientation: "left",
        ctaVariant: "primary",
        heading: {
          level: 1,
          align: "left",
        },
        image: {
          aspectRatio: 1.78,
        },
      },
      liveVisibility: true,
    },
    version: 16,
  },
  {
    name: "version 24 with constant values",
    document: {},
    props: {
      data: {
        promo: {
          field: "c_locationPages_locationPages_promoSection",
          constantValue: {
            cta: {
              link: "#",
              label: {
                en: "LEARN MORE",
                hasLocalizedValue: "true",
              },
              ctaType: "textAndLink",
              linkType: "URL",
            },
            image: {
              url: "https://placehold.co/640x360",
              width: 640,
              height: 360,
              assetImage: {
                id: "22241106",
                name: "menu decoverte",
                sourceUrl: "",
                childImages: [
                  {
                    url: "https://placehold.co/640x360",
                    dimension: {
                      width: 640,
                      height: 360,
                    },
                  },
                ],
                originalImage: {
                  url: "https://placehold.co/640x360",
                  dimension: {
                    width: 640,
                    height: 360,
                  },
                  exifMetadata: {
                    rotate: 0,
                  },
                },
                transformations: {},
                transformedImage: {
                  url: "https://placehold.co/640x360",
                  dimension: {
                    width: 640,
                    height: 360,
                  },
                },
              },
              alternateText: "",
            },
            title: {
              en: "Discovery Menu",
              hasLocalizedValue: "true",
            },
            description: {
              en: {
                html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Express yourself every day of the week with our brand-new Discovery Menu!</span></p>',
                json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Express yourself every day of the week with our brand-new Discovery Menu!","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
              },
              hasLocalizedValue: "true",
            },
          },
          constantValueEnabled: true,
          constantValueOverride: {
            cta: true,
            image: true,
            title: true,
            description: true,
          },
        },
      },
      styles: {
        image: {
          aspectRatio: 1.78,
        },
        heading: {
          align: "left",
          level: 2,
        },
        ctaVariant: "primary",
        orientation: "left",
        backgroundColor: {
          bgColor: "bg-palette-tertiary",
          textColor: "text-palette-tertiary-contrast",
        },
      },
      analytics: {
        scope: "promoSection",
      },
      liveVisibility: true,
    },
    version: 24,
  },
  {
    name: "version 30 props with entity values",
    document: { c_examplePromo: promoData },
    props: {
      data: {
        promo: {
          field: "c_examplePromo",
          constantValue: {},
          constantValueEnabled: false,
        },
        media: "image",
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-quaternary-light",
          textColor: "text-black",
        },
        orientation: "right",
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-1731d25a-56df-4b1c-8881-8f195eb56776",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Promotion",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 4, align: "left" },
              parentData: {
                text: "Taste the universe!",
                field: "c_examplePromo",
              },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-e9fc1d7b-dacd-4f23-92fa-28ac1bde92c0",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "base" },
              parentData: {
                richText: {
                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Our out-of-this-world </span><b><strong style="font-weight: bold;">burgers</strong></b><span> and</span><b><strong style="font-weight: bold;"> fresh salads</strong></b><span> are a flavor journey you won&#39;t forget. Explore a galaxy of taste, where every ingredient composes a symphony of flavors. Come visit us for a stellar dining experience!</span></p>',
                },
                field: "c_examplePromo",
              },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-fe7b127e-c136-4bde-8082-613e890cccf4",
              data: {},
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-3caab504-556e-4420-987e-5ed793890c2c",
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
              className:
                "max-w-full sm:max-w-initial md:max-w-[450px] lg:max-w-none rounded-image-borderRadius w-full",
              parentData: {
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
                field: "c_examplePromo",
              },
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-177d77c3-3b73-4285-ba66-fb2776520062",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: "Learn More",
                    link: "#",
                    linkType: "URL",
                  },
                },
              },
              styles: {
                variant: "secondary",
                presetImage: undefined,
              },
              parentData: {
                cta: {
                  label: "Call to Order",
                  link: "+18005551010",
                  linkType: "PHONE",
                },
                field: "c_examplePromo",
              },
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
    },
    version: 30,
  },
  {
    name: "version 30 props with mixed values",
    document: { c_examplePromo: promoData },
    props: {
      data: {
        promo: { field: "", constantValue: {}, constantValueEnabled: true },
        media: "video",
      },
      styles: {
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        orientation: "left",
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-31c0ae9a-81a5-416d-b7a8-f8a585baa805",
              data: {
                text: {
                  field: "c_examplePromo.title",
                  constantValue: {
                    en: "Featured Promotion at [[name]]",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: false,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-cb709395-2072-491f-ad9d-52897daa50f9",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "base" },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-e7dd3569-6bf9-4a61-8bee-ff9e31adddfa",
              data: {
                assetVideo: {
                  name: "Local asset",
                  id: "0",
                  video: {
                    url: "https://youtube.com/test",
                    thumbnail: "https://img.youtube.com/vi//hqdefault.jpg",
                    id: "",
                    title: "Local Video",
                    duration: "0:00",
                    embeddedUrl: "https://www.youtube.com/embed/",
                  },
                },
              },
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-82720cc0-77af-4284-bbe9-f28bd4d135fb",
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
              className:
                "max-w-full sm:max-w-initial md:max-w-[450px] lg:max-w-none rounded-image-borderRadius w-full",
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-9d1cf16a-1858-4cb6-8c1f-a31ea633d609",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "presetImage",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                variant: "link",
                presetImage: "app-store",
              },
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
    },
    version: 30,
  },
  {
    name: "version 48 props with translatable image and CTA",
    document: { c_examplePromo: promoData },
    props: {
      data: {
        promo: { field: "", constantValue: {}, constantValueEnabled: true },
        media: "image",
      },
      styles: {
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        orientation: "left",
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
                      url: "https://placehold.co/640x360",
                      height: 360,
                      width: 640,
                      alternateText: "Image",
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
            },
          },
        ],
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingSlot-v48",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Promo Title",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "DescriptionSlot-v48",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Promo Description",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "base" },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-v48",
              data: {},
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-v48",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: {
                      en: "Learn More",
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
              styles: {
                variant: "primary",
              },
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
    },
    version: 48,
  },
  {
    name: "[classic] version 50 props with constant values and image",
    document: {},
    props: {
      data: {
        promo: { field: "", constantValue: {}, constantValueEnabled: true },
        media: "image",
        backgroundImage: {
          field: ".image",
          constantValue: {
            url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
            width: 640,
            height: 360,
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        variant: "classic",
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        desktopImagePosition: "left",
        mobileImagePosition: "top",
        containerAlignment: "center",
        imageHeight: 500,
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-0152ed7a-53e9-405f-b733-cf045e7acc48",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Promotion",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "center" },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-85de20ab-6f63-4576-b017-4c7cd1d2e82c",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: {
                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters</span></p>',
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "base" },
              parentStyles: { className: "text-center" },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-27b06de4-8d3f-4fcc-ab31-110754ea2aaa",
              data: {},
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-efee8504-6c1a-4481-b521-32800bf21845",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=310&width=550&fit=max",
                      width: 550,
                      height: 310,
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 550 },
              sizes: {
                base: "calc(100vw - 32px)",
                md: "min(width, 450px)",
                lg: "width",
              },
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-eb10b039-9dde-49d8-a45b-dba04a62b2fb",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: "Learn More",
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  selectedType: "textAndLink",
                },
              },
              styles: { variant: "primary", presetImage: "app-store" },
              eventName: "cta",
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
      id: "PromoSection-562d56de-f919-45b8-abbc-64fc7de0e75a",
    },
    version: 50,
  },
  {
    name: "[classic] version 50 with constant values and video",
    document: {},
    props: {
      data: {
        promo: { field: "", constantValue: {}, constantValueEnabled: true },
        media: "video",
        backgroundImage: {
          field: ".image",
          constantValue: {
            url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
            width: 640,
            height: 360,
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        variant: "classic",
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        desktopImagePosition: "right",
        mobileImagePosition: "bottom",
        containerAlignment: "left",
        imageHeight: 500,
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-0152ed7a-53e9-405f-b733-cf045e7acc48",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Promotion",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "center" },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-85de20ab-6f63-4576-b017-4c7cd1d2e82c",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: {
                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters</span></p>',
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "base" },
              parentStyles: { className: "text-left" },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-27b06de4-8d3f-4fcc-ab31-110754ea2aaa",
              data: {
                assetVideo: {
                  name: "Local asset",
                  id: "0",
                  video: {
                    url: "https://www.youtube.com/watch?v=U3UPQH5rTp4",
                    thumbnail:
                      "https://img.youtube.com/vi/U3UPQH5rTp4/hqdefault.jpg",
                    id: "U3UPQH5rTp4",
                    title: "Local Video",
                    duration: "0:00",
                    embeddedUrl: "https://www.youtube.com/embed/U3UPQH5rTp4",
                  },
                },
              },
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-efee8504-6c1a-4481-b521-32800bf21845",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                      width: 640,
                      height: 360,
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              sizes: {
                base: "calc(100vw - 32px)",
                md: "min(width, 450px)",
                lg: "width",
              },
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-eb10b039-9dde-49d8-a45b-dba04a62b2fb",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: "Learn More",
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  selectedType: "textAndLink",
                },
              },
              styles: { variant: "primary", presetImage: "app-store" },
              eventName: "cta",
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
      id: "PromoSection-562d56de-f919-45b8-abbc-64fc7de0e75a",
    },
    version: 50,
  },
  {
    name: "[classic] version 50 with entity values",
    document: { c_examplePromo: promoData },
    props: {
      data: {
        promo: {
          field: "c_examplePromo",
          constantValue: {},
          constantValueEnabled: false,
        },
        media: "image",
        backgroundImage: {
          field: "c_examplePromo.image",
          constantValue: {
            url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
            width: 640,
            height: 360,
          },
          constantValueEnabled: false,
        },
      },
      styles: {
        variant: "classic",
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        desktopImagePosition: "left",
        mobileImagePosition: "bottom",
        containerAlignment: "left",
        imageHeight: 500,
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-416a952b-23da-48db-a03d-020f44b13937",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Promotion",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 1, align: "left" },
              parentData: {
                text: "Taste the universe!",
                field: "c_examplePromo",
              },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-ed913c97-a573-4125-a074-19234d2b58d9",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: {
                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters</span></p>',
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "sm" },
              parentStyles: { className: "text-left" },
              parentData: {
                richText: {
                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Our out-of-this-world </span><b><strong style="font-weight: bold;">burgers</strong></b><span> and</span><b><strong style="font-weight: bold;"> fresh salads</strong></b><span> are a flavor journey you won&#39;t forget. Explore a galaxy of taste, where every ingredient composes a symphony of flavors. Come visit us for a stellar dining experience!</span></p>',
                },
                field: "c_examplePromo",
              },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-178fd136-01f1-476b-9d91-cf76c9938457",
              data: {},
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-5e99983b-5050-416d-b286-5e6116ee231e",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=310&width=550&fit=max",
                      width: 550,
                      height: 310,
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1, width: 550 },
              sizes: {
                base: "calc(100vw - 32px)",
                md: "min(width, 450px)",
                lg: "width",
              },
              parentData: {
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
                field: "c_examplePromo",
              },
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-cb3bcc8d-f08b-4c70-b77a-f73e5fcc7e20",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: "Learn More",
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  selectedType: "textAndLink",
                },
              },
              styles: { variant: "secondary", presetImage: "app-store" },
              eventName: "cta",
              parentData: {
                cta: {
                  label: "Call to Order",
                  link: "+18005551010",
                  linkType: "PHONE",
                },
                field: "c_examplePromo",
              },
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
      id: "PromoSection-25075125-341e-44eb-9037-8eb65042a29a",
    },
    version: 50,
  },
  {
    name: "[immersive] version 50 with entity values",
    document: { c_examplePromo: promoData },
    version: 50,
    props: {
      data: {
        promo: {
          field: "c_examplePromo",
          constantValue: {},
          constantValueEnabled: false,
        },
        media: "image",
        backgroundImage: {
          field: "c_examplePromo.image",
          constantValue: {
            url: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
            width: 640,
            height: 360,
          },
          constantValueEnabled: false,
        },
      },
      styles: {
        variant: "immersive",
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        desktopImagePosition: "left",
        mobileImagePosition: "top",
        containerAlignment: "left",
        imageHeight: 200,
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-63489350-7281-407f-b342-26db1844a4fe",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Promotion",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "left" },
              parentData: {
                text: "Taste the universe!",
                field: "c_examplePromo",
              },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-9d841810-2300-4b7e-9d68-f978f4332a43",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: {
                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters</span></p>',
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "base" },
              parentStyles: { className: "text-left" },
              parentData: {
                richText: {
                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Our out-of-this-world </span><b><strong style="font-weight: bold;">burgers</strong></b><span> and</span><b><strong style="font-weight: bold;"> fresh salads</strong></b><span> are a flavor journey you won&#39;t forget. Explore a galaxy of taste, where every ingredient composes a symphony of flavors. Come visit us for a stellar dining experience!</span></p>',
                },
                field: "c_examplePromo",
              },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-35e57669-c21b-4849-ab9a-af39348c84cd",
              data: {},
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-98197597-c075-4c9a-ae90-185e4bca6f0b",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://images.unsplash.com/photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                      width: 640,
                      height: 360,
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              sizes: {
                base: "calc(100vw - 32px)",
                md: "min(width, 450px)",
                lg: "width",
              },
              parentData: {
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
                field: "c_examplePromo",
              },
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-48b2fcae-6810-4ec8-805f-312b7f299e17",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: "Learn More",
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  selectedType: "textAndLink",
                },
              },
              styles: { variant: "link", presetImage: "app-store" },
              eventName: "cta",
              parentData: {
                cta: {
                  label: "Call to Order",
                  link: "+18005551010",
                  linkType: "PHONE",
                },
                field: "c_examplePromo",
              },
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
      id: "PromoSection-8dba6990-38a9-4f9b-ba10-7a6bfd0c5a21",
    },
  },
  {
    name: "[immersive] version 50 with constant values",
    document: {},
    version: 50,
    props: {
      data: {
        promo: {
          field: "c_examplePromo",
          constantValue: {},
          constantValueEnabled: true,
        },
        media: "image",
        backgroundImage: {
          field: "c_examplePromo.image",
          constantValue: {
            url: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
            width: 640,
            height: 360,
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        variant: "immersive",
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        desktopImagePosition: "left",
        mobileImagePosition: "top",
        containerAlignment: "center",
        imageHeight: 500,
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-63489350-7281-407f-b342-26db1844a4fe",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Promotion",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "center" },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-9d841810-2300-4b7e-9d68-f978f4332a43",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: {
                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters</span></p>',
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "base" },
              parentStyles: { className: "text-center" },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-35e57669-c21b-4849-ab9a-af39348c84cd",
              data: {},
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-98197597-c075-4c9a-ae90-185e4bca6f0b",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://images.unsplash.com/photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                      width: 640,
                      height: 360,
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              sizes: {
                base: "calc(100vw - 32px)",
                md: "min(width, 450px)",
                lg: "width",
              },
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-48b2fcae-6810-4ec8-805f-312b7f299e17",
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
              eventName: "cta",
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
      id: "PromoSection-8dba6990-38a9-4f9b-ba10-7a6bfd0c5a21",
    },
  },
  {
    name: "[spotlight] version 50 with constant values",
    document: {},
    version: 50,
    props: {
      data: {
        promo: {
          field: "c_examplePromo",
          constantValue: {},
          constantValueEnabled: true,
        },
        media: "image",
        backgroundImage: {
          field: "c_examplePromo.image",
          constantValue: {
            url: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
            width: 640,
            height: 360,
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        variant: "spotlight",
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        desktopImagePosition: "left",
        mobileImagePosition: "top",
        containerAlignment: "right",
        imageHeight: 400,
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-63489350-7281-407f-b342-26db1844a4fe",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Promotion",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 6, align: "right" },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-9d841810-2300-4b7e-9d68-f978f4332a43",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: {
                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters</span></p>',
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "base" },
              parentStyles: { className: "text-right" },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-35e57669-c21b-4849-ab9a-af39348c84cd",
              data: {},
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-98197597-c075-4c9a-ae90-185e4bca6f0b",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://images.unsplash.com/photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                      width: 640,
                      height: 360,
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              sizes: {
                base: "calc(100vw - 32px)",
                md: "min(width, 450px)",
                lg: "width",
              },
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-48b2fcae-6810-4ec8-805f-312b7f299e17",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "Click Here", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  selectedType: "presetImage",
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "primary", presetImage: "app-store" },
              eventName: "cta",
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
      id: "PromoSection-8dba6990-38a9-4f9b-ba10-7a6bfd0c5a21",
    },
  },
  {
    name: "[spotlight] version 50 with entity values",
    document: { c_examplePromo: promoData },
    version: 50,
    props: {
      data: {
        promo: {
          field: "c_examplePromo",
          constantValue: {},
          constantValueEnabled: false,
        },
        media: "image",
        backgroundImage: {
          field: "c_examplePromo.image",
          constantValue: {
            url: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
            width: 640,
            height: 360,
          },
          constantValueEnabled: false,
        },
      },
      styles: {
        variant: "spotlight",
        backgroundColor: {
          bgColor: "bg-palette-tertiary-light",
          textColor: "text-black",
        },
        desktopImagePosition: "left",
        mobileImagePosition: "top",
        containerAlignment: "left",
        imageHeight: 400,
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-63489350-7281-407f-b342-26db1844a4fe",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Promotion",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 3, align: "left" },
              parentData: {
                text: "Taste the universe!",
                field: "c_examplePromo",
              },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-9d841810-2300-4b7e-9d68-f978f4332a43",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: {
                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters</span></p>',
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "lg" },
              parentStyles: { className: "text-left" },
              parentData: {
                richText: {
                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Our out-of-this-world </span><b><strong style="font-weight: bold;">burgers</strong></b><span> and</span><b><strong style="font-weight: bold;"> fresh salads</strong></b><span> are a flavor journey you won&#39;t forget. Explore a galaxy of taste, where every ingredient composes a symphony of flavors. Come visit us for a stellar dining experience!</span></p>',
                },
                field: "c_examplePromo",
              },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-35e57669-c21b-4849-ab9a-af39348c84cd",
              data: {},
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-98197597-c075-4c9a-ae90-185e4bca6f0b",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://images.unsplash.com/photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                      width: 640,
                      height: 360,
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              sizes: {
                base: "calc(100vw - 32px)",
                md: "min(width, 450px)",
                lg: "width",
              },
              parentData: {
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
                field: "c_examplePromo",
              },
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-48b2fcae-6810-4ec8-805f-312b7f299e17",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "Click Here", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  selectedType: "presetImage",
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "secondary", presetImage: "app-store" },
              eventName: "cta",
              parentData: {
                cta: {
                  label: "Call to Order",
                  link: "+18005551010",
                  linkType: "PHONE",
                },
                field: "c_examplePromo",
              },
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
      id: "PromoSection-8dba6990-38a9-4f9b-ba10-7a6bfd0c5a21",
    },
  },
  {
    name: "[compact] version 50 with entity values",
    document: { c_examplePromo: promoData },
    version: 50,
    includeXLViewport: true,
    props: {
      data: {
        promo: {
          field: "c_examplePromo",
          constantValue: {},
          constantValueEnabled: false,
        },
        media: "image",
        backgroundImage: {
          field: "c_examplePromo.image",
          constantValue: {
            url: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
            width: 640,
            height: 360,
          },
          constantValueEnabled: false,
        },
      },
      styles: {
        variant: "compact",
        backgroundColor: {
          bgColor: "bg-palette-tertiary",
          textColor: "text-palette-tertiary-contrast",
        },
        desktopImagePosition: "left",
        mobileImagePosition: "top",
        containerAlignment: "left",
        imageHeight: 400,
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-63489350-7281-407f-b342-26db1844a4fe",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Promotion",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 3, align: "left" },
              parentData: {
                text: "Taste the universe!",
                field: "c_examplePromo",
              },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-9d841810-2300-4b7e-9d68-f978f4332a43",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: {
                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters</span></p>',
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "lg" },
              parentStyles: { className: "text-left" },
              parentData: {
                richText: {
                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Our out-of-this-world </span><b><strong style="font-weight: bold;">burgers</strong></b><span> and</span><b><strong style="font-weight: bold;"> fresh salads</strong></b><span> are a flavor journey you won&#39;t forget. Explore a galaxy of taste, where every ingredient composes a symphony of flavors. Come visit us for a stellar dining experience!</span></p>',
                },
                field: "c_examplePromo",
              },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-35e57669-c21b-4849-ab9a-af39348c84cd",
              data: {},
              className: "h-full",
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-98197597-c075-4c9a-ae90-185e4bca6f0b",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      url: "https://images.unsplash.com/photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=310&width=550&fit=max",
                      width: 550,
                      height: 310,
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 550 },
              sizes: {
                base: "calc(100vw - 32px)",
                md: "min(width, 450px)",
                lg: "width",
              },
              className: "w-full h-full mr-auto",
              parentData: {
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
                field: "c_examplePromo",
              },
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-48b2fcae-6810-4ec8-805f-312b7f299e17",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "Click Here", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  selectedType: "presetImage",
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "secondary", presetImage: "app-store" },
              eventName: "cta",
              parentData: {
                cta: {
                  label: "Call to Order",
                  link: "+18005551010",
                  linkType: "PHONE",
                },
                field: "c_examplePromo",
              },
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
      id: "PromoSection-8dba6990-38a9-4f9b-ba10-7a6bfd0c5a21",
    },
  },
  {
    name: "[compact] version 50 with constant values and image",
    document: {},
    version: 50,
    props: {
      data: {
        promo: {
          field: "c_examplePromo",
          constantValue: {},
          constantValueEnabled: true,
        },
        media: "image",
        backgroundImage: {
          field: "c_examplePromo.image",
          constantValue: {
            url: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
            width: 640,
            height: 360,
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        variant: "compact",
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        desktopImagePosition: "right",
        mobileImagePosition: "top",
        containerAlignment: "center",
        imageHeight: 400,
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-63489350-7281-407f-b342-26db1844a4fe",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Promotion",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 3, align: "left" },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-9d841810-2300-4b7e-9d68-f978f4332a43",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: {
                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters</span></p>',
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "base" },
              parentStyles: { className: "text-center" },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-35e57669-c21b-4849-ab9a-af39348c84cd",
              data: {},
              className: "h-full",
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-98197597-c075-4c9a-ae90-185e4bca6f0b",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      alternateText: "",
                      url: "https://images.unsplash.com/photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=310&width=550&fit=max",
                      width: 550,
                      height: 310,
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 550 },
              sizes: {
                base: "calc(100vw - 32px)",
                md: "min(width, 450px)",
                lg: "width",
              },
              className: "w-full h-full ml-auto",
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-48b2fcae-6810-4ec8-805f-312b7f299e17",
              data: {
                entityField: {
                  field: "",
                  constantValue: {
                    label: { en: "Click Here", hasLocalizedValue: "true" },
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  selectedType: "presetImage",
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "primary", presetImage: "app-store" },
              eventName: "cta",
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
      id: "PromoSection-8dba6990-38a9-4f9b-ba10-7a6bfd0c5a21",
    },
  },
  {
    name: "[compact] version 50 with constant values and video",
    document: {},
    version: 50,
    props: {
      data: {
        promo: {
          field: "c_examplePromo",
          constantValue: {},
          constantValueEnabled: true,
        },
        media: "video",
        backgroundImage: {
          field: "c_examplePromo.image",
          constantValue: {
            url: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
            width: 640,
            height: 360,
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        variant: "compact",
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        desktopImagePosition: "left",
        mobileImagePosition: "bottom",
        containerAlignment: "left",
        imageHeight: 400,
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-63489350-7281-407f-b342-26db1844a4fe",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Featured Promotion",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 3, align: "left" },
            },
          },
        ],
        DescriptionSlot: [
          {
            type: "BodyTextSlot",
            props: {
              id: "BodyTextSlot-9d841810-2300-4b7e-9d68-f978f4332a43",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: {
                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters</span></p>',
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "base" },
              parentStyles: { className: "text-left" },
            },
          },
        ],
        VideoSlot: [
          {
            type: "VideoSlot",
            props: {
              id: "VideoSlot-35e57669-c21b-4849-ab9a-af39348c84cd",
              data: {
                assetVideo: {
                  name: "Local asset",
                  id: "0",
                  video: {
                    url: "https://www.youtube.com/watch?v=U3UPQH5rTp4",
                    thumbnail:
                      "https://img.youtube.com/vi/U3UPQH5rTp4/hqdefault.jpg",
                    id: "U3UPQH5rTp4",
                    title: "Local Video",
                    duration: "0:00",
                    embeddedUrl: "https://www.youtube.com/embed/U3UPQH5rTp4",
                  },
                },
              },
              className: "h-full",
            },
          },
        ],
        ImageSlot: [
          {
            type: "ImageSlot",
            props: {
              id: "ImageSlot-98197597-c075-4c9a-ae90-185e4bca6f0b",
              data: {
                image: {
                  field: "",
                  constantValue: {
                    en: {
                      alternateText: "",
                      url: "",
                      height: 1,
                      width: 1,
                    },
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { aspectRatio: 1.78, width: 640 },
              sizes: {
                base: "calc(100vw - 32px)",
                md: "min(width, 450px)",
                lg: "width",
              },
              className: "w-full h-full mr-auto",
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              id: "CTASlot-48b2fcae-6810-4ec8-805f-312b7f299e17",
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
              styles: { variant: "primary", presetImage: "doordash" },
              eventName: "cta",
            },
          },
        ],
      },
      analytics: { scope: "promoSection" },
      liveVisibility: true,
      id: "PromoSection-8dba6990-38a9-4f9b-ba10-7a6bfd0c5a21",
    },
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

describe("PromoSection", async () => {
  const puckConfig: Config = {
    components: { PromoSection, ...SlotsCategoryComponents },
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
              type: "PromoSection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      const resolvedData = await resolveAllData(data, puckConfig, {
        streamDocument: document,
      });

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render
            config={puckConfig}
            data={resolvedData}
            metadata={{ streamDocument: document }}
          />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      const images = Array.from(container.querySelectorAll("img"));
      await waitFor(() => {
        expect(images.every((i) => i.complete)).toBe(true);
      });
      if (props?.data?.media === "video") {
        await delay(1000);
      }

      await expect(`PromoSection/[${viewportName}] ${name}`).toMatchScreenshot({
        customThreshold: 10,
      });
      const results = await axe(container);
      if (isBrandColorTest(props) && results.violations.length) {
        console.warn(
          `IGNORING axe violations for brand color test: ${name}`,
          results.violations
        );
      } else {
        expect(results).toHaveNoViolations();
      }

      if (interactions) {
        await interactions(page);
        await expect(
          `PromoSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot({ customThreshold: 10 });
        const results = await axe(container);
        if (isBrandColorTest(props) && results.violations.length) {
          console.warn(
            `IGNORING axe violations for brand color test: ${name}`,
            results.violations
          );
        } else {
          expect(results).toHaveNoViolations();
        }
      }
    }
  );
});
