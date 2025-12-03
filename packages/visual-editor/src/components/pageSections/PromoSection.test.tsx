import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  delay,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  PromoSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
  SlotsCategoryComponents,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const promoData = {
  cta: {
    label: "Call to Order",
    link: "+18005551010",
    linkType: "PHONE",
  },
  description: {
    html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span style="color: #59359a;">Our out-of-this-world </span><b><strong style="font-weight: bold; color: #59359a;">burgers</strong></b><span style="color: #59359a;"> and</span><b><strong style="font-weight: bold; color: #59359a;"> fresh salads</strong></b><span style="color: #59359a;"> are a flavor journey you won&#39;t forget. Explore a galaxy of taste, where every ingredient composes a symphony of flavors. Come visit us for a stellar dining experience!</span></p>',
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
                  hasLocalizedValue: "true"
                },
                ctaType: "textAndLink",
                linkType: "URL"
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
                        height: 360
                      }
                    }
                  ],
                  originalImage: {
                    url: "https://placehold.co/640x360",
                    dimension: {
                      width: 640,
                      height: 360
                    },
                    exifMetadata: {
                      rotate: 0
                    }
                  },
                  transformations: {},
                  transformedImage: {
                    url: "https://placehold.co/640x360",
                    dimension: {
                      width: 640,
                      height: 360
                    }
                  }
                },
                alternateText: ""
              },
              title: {
                en: "Discovery Menu",
                hasLocalizedValue: "true"
              },
              description: {
                en: {
                  html: "<p dir=\"ltr\" style=\"font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;\"><span>Express yourself every day of the week with our brand-new Discovery Menu!</span></p>",
                  json: "{\"root\":{\"children\":[{\"children\":[{\"detail\":0,\"format\":0,\"mode\":\"normal\",\"style\":\"\",\"text\":\"Express yourself every day of the week with our brand-new Discovery Menu!\",\"type\":\"text\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"paragraph\",\"version\":1}],\"direction\":\"ltr\",\"format\":\"\",\"indent\":0,\"type\":\"root\",\"version\":1}}"
                },
                hasLocalizedValue: "true"
              }
            },
            constantValueEnabled: true,
            constantValueOverride: {
              cta: true,
              image: true,
              title: true,
              description: true
            }
          }
        },
        styles: {
          image: {
            aspectRatio: 1.78
          },
          heading: {
            align: "left",
            level: 2
          },
          ctaVariant: "primary",
          orientation: "left",
          backgroundColor: {
            bgColor: "bg-palette-tertiary",
            textColor: "text-palette-tertiary-contrast"
          }
        },
        analytics: {
          scope: "promoSection"
        },
        liveVisibility: true
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
                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span style="color: #59359a;">Our out-of-this-world </span><b><strong style="font-weight: bold; color: #59359a;">burgers</strong></b><span style="color: #59359a;"> and</span><b><strong style="font-weight: bold; color: #59359a;"> fresh salads</strong></b><span style="color: #59359a;"> are a flavor journey you won&#39;t forget. Explore a galaxy of taste, where every ingredient composes a symphony of flavors. Come visit us for a stellar dining experience!</span></p>',
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
];

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

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render
            config={puckConfig}
            data={data}
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
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `PromoSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot({ customThreshold: 10 });
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
