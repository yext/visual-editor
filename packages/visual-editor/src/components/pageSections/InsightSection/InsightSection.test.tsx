import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  InsightSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
  SlotsCategoryComponents,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@measured/puck";
import { page } from "@vitest/browser/context";

const insightsData = {
  insights: [
    {
      category: "Blog",
      cta: {
        label: "Read Now",
        link: "https://yext.com",
        linkType: "URL",
      },
      description: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Discover how Galaxy Grill is redefining fast casual dining with its commitment to fresh, locally-sourced ingredients and innovative menu that caters to health-conscious diners. Learn about our unique concept.</span></p>',
      },
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
      name: "Fresh Flavors Fast",
      publishTime: "2025-01-01T12:00",
    },
    {
      category: "Menu",
      cta: {
        label: "Order Now",
        link: "https://yext.com",
        linkType: "URL",
      },
      description: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Galaxy Grill is more than just burgers. We offer a wide range of options, from salads and sandwiches to bowls and innovative sides. Explore the full menu and find your new favorite.</span></p>',
      },
      image: {
        height: 2048,
        thumbnails: [
          {
            height: 2048,
            url: "https://a.mktgcdn.com/p-dev/XjYQ-lBgPfQcqPPbXCDWyyt65raas-2yCQYeJOHisuA/2048x2048.jpg",
            width: 2048,
          },
          {
            height: 1900,
            url: "https://a.mktgcdn.com/p-dev/XjYQ-lBgPfQcqPPbXCDWyyt65raas-2yCQYeJOHisuA/1900x1900.jpg",
            width: 1900,
          },
          {
            height: 619,
            url: "https://a.mktgcdn.com/p-dev/XjYQ-lBgPfQcqPPbXCDWyyt65raas-2yCQYeJOHisuA/619x619.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/XjYQ-lBgPfQcqPPbXCDWyyt65raas-2yCQYeJOHisuA/450x450.jpg",
            width: 450,
          },
          {
            height: 196,
            url: "https://a.mktgcdn.com/p-dev/XjYQ-lBgPfQcqPPbXCDWyyt65raas-2yCQYeJOHisuA/196x196.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/XjYQ-lBgPfQcqPPbXCDWyyt65raas-2yCQYeJOHisuA/2048x2048.jpg",
        width: 2048,
      },
      name: "Beyond the Burger",
    },
    {
      category: "Impact",
      description: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>At Galaxy Grill, we believe in supporting our community. Discover our commitment to using locally-sourced ingredients, partnering with regional farmers, and giving back to the place we call home.</span></p>',
      },
      name: "Our Commitment to Community",
      publishTime: "2018-06-01T12:00",
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...InsightSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { c_insights: insightsData, name: "test name" },
    props: { ...InsightSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props with entity values",
    document: { c_insights: insightsData, name: "test name" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        cardBackgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        headingLevel: 1,
      },
      data: {
        heading: {
          field: "name",
          constantValue: "Insights",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        insights: {
          field: "c_insights",
          constantValue: { insights: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props with constant value",
    document: { c_insights: insightsData },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        headingLevel: 6,
      },
      data: {
        heading: {
          field: "name",
          constantValue: "Insights",
          constantValueEnabled: true,
        },
        insights: {
          field: "c_insights",
          constantValue: {
            insights: [
              {
                name: "Insight 1",
                category: "Category 1",
                publishTime: "2025-05-14",
                description: "Description",
                cta: { label: "CTA" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 7 props with entity values",
    document: { c_insights: insightsData, name: "test name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Insights",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        insights: {
          field: "c_insights",
          constantValue: { insights: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 7,
  },
  {
    name: "version 7 props with constant value",
    document: { c_insights: insightsData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Insights",
          constantValueEnabled: true,
        },
        insights: {
          field: "c_insights",
          constantValue: {
            insights: [
              {
                name: "Insight 1",
                category: "Category 1",
                publishTime: "2025-05-14",
                description: "Description",
                cta: { label: "CTA" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
          headingLevel: 4,
        },
      },
      liveVisibility: true,
    },
    version: 7,
  },
  {
    name: "version 7 props empty date and category handling",
    document: { c_insights: insightsData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Insights",
          constantValueEnabled: true,
        },
        insights: {
          field: "c_insights",
          constantValue: {
            insights: [
              {
                name: "Insight with empty date",
                category: "Category 1",
                publishTime: "",
                description: "Description",
                cta: { label: "CTA" },
              },
              {
                name: "Insight with empty category",
                category: "",
                publishTime: "2025-05-14",
                description: "Description",
                cta: { label: "CTA" },
              },
              {
                name: "Insight with both empty",
                category: "",
                publishTime: "",
                description: "Description",
                cta: { label: "CTA" },
              },
              {
                name: "Insight with both filled",
                category: "Category 2",
                publishTime: "2025-06-15",
                description: "Description",
                cta: { label: "CTA" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
          headingLevel: 4,
        },
      },
      liveVisibility: true,
    },
    version: 7,
  },
  {
    name: "version 16 props with missing ctaType",
    document: { c_insights: insightsData },
    props: {
      data: {
        insights: {
          field: "c_insights",
          constantValue: [
            {
              name: "Insight with missing CTA properties",
              category: "Category",
              publishTime: "2025-06-15",
              description: "Description",
              cta: {
                label: "CTA",
                // Missing link, linkType, and ctaType - should be added by migration
              },
            },
            {
              name: "Insight with partial CTA properties",
              category: "Category 2",
              publishTime: "2025-06-15",
              description: "Description",
              cta: {
                label: "CTA 2",
                link: "#",
                linkType: "URL",
                // Missing ctaType - should be added by migration
              },
            },
          ],
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
          headingLevel: 4,
        },
      },
      liveVisibility: true,
    },
    version: 16,
  },
  {
    name: "version 30 props with entity values",
    document: { c_insights: insightsData, name: "test name" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  field: "name",
                  constantValue: "Insights",
                  constantValueEnabled: false,
                },
              },
              styles: {
                level: 2,
                align: "left",
              },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "InsightCardsWrapper",
            props: {
              data: {
                field: "c_insights",
                constantValueEnabled: false,
                constantValue: [],
              },
              slots: {
                CardSlot: [],
              },
            },
          },
        ],
      },
      analytics: {
        scope: "insightsSection",
      },
      liveVisibility: true,
    },
    version: 30,
  },
  {
    name: "version 30 props with constant values",
    document: { c_insights: insightsData },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  field: "",
                  constantValue: "Featured Insights",
                  constantValueEnabled: true,
                },
              },
              styles: {
                level: 2,
                align: "left",
              },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "InsightCardsWrapper",
            props: {
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [
                  { id: "InsightCard-1" },
                  { id: "InsightCard-2" },
                  { id: "InsightCard-3" },
                ],
              },
              slots: {
                CardSlot: [
                  {
                    type: "InsightCard",
                    props: {
                      id: "InsightCard-1",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "InsightCard-1-image",
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
                              styles: {
                                aspectRatio: 1.78,
                                width: 640,
                              },
                              sizes: {
                                base: "calc(100vw - 32px)",
                                md: "calc((maxWidth - 32px) / 2)",
                                lg: "calc((maxWidth - 32px) / 3)",
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "InsightCard-1-title",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Insight Title 1",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 3,
                                align: "left",
                              },
                            },
                          },
                        ],
                        CategorySlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "InsightCard-1-category",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Category 1",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "InsightCard-1-description",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Description 1",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        PublishTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "InsightCard-1-timestamp",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2022-08-02T14:00:00",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                includeTime: false,
                                includeRange: false,
                              },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "InsightCard-1-cta",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Read More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "primary" },
                              eventName: "cta",
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    type: "InsightCard",
                    props: {
                      id: "InsightCard-2",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "InsightCard-2-image",
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
                              styles: {
                                aspectRatio: 1.78,
                                width: 640,
                              },
                              sizes: {
                                base: "calc(100vw - 32px)",
                                md: "calc((maxWidth - 32px) / 2)",
                                lg: "calc((maxWidth - 32px) / 3)",
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "InsightCard-2-title",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Insight Title 2",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 3,
                                align: "left",
                              },
                            },
                          },
                        ],
                        CategorySlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "InsightCard-2-category",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Category 2",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "InsightCard-2-description",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Description 2",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        PublishTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "InsightCard-2-timestamp",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2022-08-03T14:00:00",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                includeTime: false,
                                includeRange: false,
                              },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "InsightCard-2-cta",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Read More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "primary" },
                              eventName: "cta",
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    type: "InsightCard",
                    props: {
                      id: "InsightCard-3",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "InsightCard-3-image",
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
                              styles: {
                                aspectRatio: 1.78,
                                width: 640,
                              },
                              sizes: {
                                base: "calc(100vw - 32px)",
                                md: "calc((maxWidth - 32px) / 2)",
                                lg: "calc((maxWidth - 32px) / 3)",
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "InsightCard-3-title",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Insight Title 3",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 3,
                                align: "left",
                              },
                            },
                          },
                        ],
                        CategorySlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "InsightCard-3-category",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Category 3",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "InsightCard-3-description",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Description 3",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        PublishTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "InsightCard-3-timestamp",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2022-08-04T14:00:00",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                includeTime: false,
                                includeRange: false,
                              },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "InsightCard-3-cta",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Read More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "primary" },
                              eventName: "cta",
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      analytics: {
        scope: "insightsSection",
      },
      liveVisibility: true,
    },
    version: 30,
  },
];

describe("InsightSection", async () => {
  const puckConfig: Config = {
    components: { InsightSection, ...SlotsCategoryComponents },
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
      let data = migrate(
        {
          root: {
            props: {
              version,
            },
          },
          content: [
            {
              type: "InsightSection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      data = await resolveAllData(data, puckConfig, {
        document,
      });

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

      await expect(
        `InsightSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `InsightSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
