import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  TestimonialSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
  SlotsCategoryComponents,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@measured/puck";
import { page } from "@vitest/browser/context";

const testimonialData = {
  testimonials: [
    {
      contributionDate: "2024-04-02",
      contributorName: "Jane",
      description: {
        html: `<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>This burger is a flavor explosion! The juicy patty, nestled in a soft bun, boasts a perfect sear. Crisp lettuce, ripe tomatoes, and a tangy sauce complete this culinary masterpiece. A must-try for any burger enthusiast!</span></p>`,
      },
    },
    {
      contributionDate: "2010-02-02",
      contributorName: "Sam",
      description: {
        html: `<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>The Galaxy Grill burger is out of this world! It's savory, satisfying, and simply delicious. From the first bite to the last, this burger delivers a taste experience that's truly unforgettable. Don't miss out on this cosmic culinary adventure!</span></p>`,
      },
    },
    {
      contributionDate: "2024-11-11",
      contributorName: "John",
      description: {
        html: `<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Absolutely incredible! This burger is pure perfection. Juicy, flavorful, and everything just works together. The bun is soft, the toppings are fresh, and the overall taste is out of this world. A definite must-get!</span></p>`,
      },
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...TestimonialSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { c_testimonials: testimonialData },
    props: { ...TestimonialSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 0 props with entity values",
    document: { c_testimonials: testimonialData, name: "Test Name" },
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
          constantValue: "Featured Testimonials",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        testimonials: {
          field: "c_testimonials",
          constantValue: { testimonials: [] },
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
    document: { c_testimonials: testimonialData },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        headingLevel: 2,
      },
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Testimonials",
          constantValueEnabled: true,
        },
        testimonials: {
          field: "c_testimonials",
          constantValue: {
            testimonials: [
              {
                description: "Description",
                contributorName: "Name",
                contributionDate: "2025-01-01",
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
    name: "version 1 props with constant value",
    document: { c_testimonials: testimonialData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Testimonials",
          constantValueEnabled: true,
        },
        testimonials: {
          field: "c_testimonials",
          constantValue: {
            testimonials: [
              {
                description: "Description",
                contributorName: "Name",
                contributionDate: "2025-01-01",
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
      },
      liveVisibility: true,
    },
    version: 1,
  },
  {
    name: "version 7 props with constant value",
    document: { c_testimonials: testimonialData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Testimonials",
          constantValueEnabled: true,
        },
        testimonials: {
          field: "c_testimonials",
          constantValue: {
            testimonials: [
              {
                description: "Description",
                contributorName: "Name",
                contributionDate: "2025-01-01",
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 7,
  },
  {
    name: "version 7 props with entity values",
    document: { c_testimonials: testimonialData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Testimonials",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        testimonials: {
          field: "c_testimonials",
          constantValue: { testimonials: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          headingLevel: 4,
        },
      },
      liveVisibility: true,
    },
    version: 7,
  },
  {
    name: "version 32 props with entity values",
    document: { c_testimonials: testimonialData, name: "Test Name" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
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
                  constantValue: "Featured Testimonials",
                  constantValueEnabled: false,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "TestimonialCardsWrapper",
            props: {
              data: {
                field: "c_testimonials",
                constantValueEnabled: false,
                constantValue: [],
              },
              slots: {
                CardSlot: [
                  {
                    type: "TestimonialCard",
                    props: {
                      id: "TestimonialCard-1",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-primary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    html: `<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>This burger is a flavor explosion!</span></p>`,
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        ContributorNameSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Jane",
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
                        ContributionDateSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2024-04-02",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                option: "DATE",
                                hideTimeZone: true,
                              },
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
        scope: "testimonialSection",
      },
      liveVisibility: true,
    },
    version: 32,
  },
  {
    name: "version 32 props with constant values",
    document: { c_testimonials: testimonialData },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
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
                  constantValue: "Our Amazing Testimonials",
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "TestimonialCardsWrapper",
            props: {
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [
                  { id: "TestimonialCard-1" },
                  { id: "TestimonialCard-2" },
                  { id: "TestimonialCard-3" },
                ],
              },
              slots: {
                CardSlot: [
                  {
                    type: "TestimonialCard",
                    props: {
                      id: "TestimonialCard-1",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-primary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "TestimonialCard-1-description",
                              data: {
                                text: {
                                  field: "",
                                  constantValue:
                                    "Great service and amazing quality!",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        ContributorNameSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "TestimonialCard-1-contributorName",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Customer 1",
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
                        ContributionDateSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "TestimonialCard-1-contributionDate",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2024-01-15",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                option: "DATE",
                                hideTimeZone: true,
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    type: "TestimonialCard",
                    props: {
                      id: "TestimonialCard-2",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-primary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "TestimonialCard-2-description",
                              data: {
                                text: {
                                  field: "",
                                  constantValue:
                                    "Highly recommend to everyone!",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        ContributorNameSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "TestimonialCard-2-contributorName",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Customer 2",
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
                        ContributionDateSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "TestimonialCard-2-contributionDate",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2024-02-20",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                option: "DATE",
                                hideTimeZone: true,
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                  {
                    type: "TestimonialCard",
                    props: {
                      id: "TestimonialCard-3",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-primary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "TestimonialCard-3-description",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Best experience ever!",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        ContributorNameSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "TestimonialCard-3-contributorName",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Customer 3",
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
                        ContributionDateSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "TestimonialCard-3-contributionDate",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2024-03-10",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                option: "DATE",
                                hideTimeZone: true,
                              },
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
        scope: "testimonialSection",
      },
      liveVisibility: true,
    },
    version: 32,
  },
];

describe("TestimonialSection", async () => {
  const puckConfig: Config = {
    components: { TestimonialSection, ...SlotsCategoryComponents },
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
              type: "TestimonialSection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      data = await resolveAllData(data, puckConfig, {
        streamDocument: document,
      });

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);

      await expect(
        `TestimonialSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `TestimonialSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
