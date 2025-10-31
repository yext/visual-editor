import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  delay,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender, act } from "@testing-library/react";
import {
  FAQSection,
  getDefaultRTF,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";
import { SlotsCategoryComponents } from "../../categories/SlotsCategory";

const interactionsDelay = 200;

const faqData = {
  faqs: [
    {
      answer: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>We offer Delivery, Catering, Take Out, and Dine In.</span></p>',
      },
      question: "What services do you offer?",
    },
    {
      answer: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Yes. There are a limited number of spots in front and we validate parking at </span><a href="https://" rel="noopener" style="color: rgb(33, 111, 219); text-decoration: none;"><span>these garages</span></a><span>.</span></p>',
      },
      question: "Do you have parking available?",
    },
  ],
};

const version10DefaultFAQ = {
  question: {
    en: getDefaultRTF("Question Lorem ipsum dolor sit amet?"),
    hasLocalizedValue: "true",
  },
  answer: {
    en: getDefaultRTF(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    ),
    hasLocalizedValue: "true",
  },
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {
      locale: "en",
    },
    props: { ...FAQSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { locale: "en", c_faq: faqData },
    props: { ...FAQSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 10 props with entity values",
    document: { locale: "en", c_faq: faqData, name: "test name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: {},
        },
        faqs: {
          field: "c_faq",
          constantValue: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
      },
      liveVisibility: true,
      analytics: {
        scope: "faqsSection",
      },
    },
    version: 10,
    interactions: async (page) => {
      const q1 = page.getByText("What services do you offer?");
      const q2 = page.getByText("Do you have parking available?");
      await act(async () => {
        await q1.click();
        await q2.click();
        await delay(interactionsDelay);
      });
    },
  },
  {
    name: "version 10 props with constant value",
    document: { locale: "en", c_faq: faqData },
    props: {
      data: {
        heading: {
          field: "",
          constantValue: {
            en: "Frequently Asked Questions",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        faqs: {
          field: "",
          constantValue: {
            faqs: [
              version10DefaultFAQ,
              version10DefaultFAQ,
              version10DefaultFAQ,
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
          level: 4,
          align: "right",
        },
      },
      liveVisibility: true,
      analytics: {
        scope: "faqsSection",
      },
    },
    version: 10,
    interactions: async (page) => {
      const q1 = page.getByText("Question Lorem ipsum dolor sit amet?").nth(0);
      const q2 = page.getByText("Question Lorem ipsum dolor sit amet?").nth(1);
      await act(async () => {
        await q1.click();
        await q2.click();
        await delay(interactionsDelay);
      });
    },
  },
  {
    name: "version 10 props with no data",
    document: { locale: "en" },
    props: {
      data: {
        heading: {
          field: "",
          constantValue: {
            en: "",
            hasLocalizedValue: "true",
          },
          constantValueEnabled: true,
        },
        faqs: {
          field: "",
          constantValue: {
            faqs: [],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
      },
      liveVisibility: true,
      analytics: {
        scope: "faqsSection",
      },
    },
    version: 10,
  },
  {
    name: "version 34 with constant values",
    document: { locale: "en" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-tertiary-light",
          textColor: "text-black",
        },
      },
      slots: {
        HeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  constantValue: {
                    en: "FAQs Heading Slot",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        FAQsWrapperSlot: [
          {
            type: "FAQsWrapperSlot",
            props: {
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [{ id: "faq-1" }],
              },
              slots: {
                CardSlot: [
                  {
                    type: "FAQSlot",
                    props: {
                      id: "faq-1",
                      slots: {
                        QuestionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "faq-1-question",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: getDefaultRTF(
                                      "What is your return policy?"
                                    ),
                                    hasLocalizedValue: "true",
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
                        AnswerSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "faq-1-answer",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: getDefaultRTF(
                                      "You can return any item within 30 days of purchase."
                                    ),
                                    hasLocalizedValue: "true",
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
    interactions: async (page) => {
      const q1 = page.getByText("What is your return policy?");
      await act(async () => {
        await q1.click();
        await delay(interactionsDelay);
      });
    },
    version: 34,
  },
];

const screenshotThreshold = 10;
// ignore differences in default browser link styling
const ignoredScreenshotDifferences = [420, 422];

describe("FAQSection", async () => {
  const puckConfig: Config = {
    components: { FAQSection, ...SlotsCategoryComponents },
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
              type: "FAQSection",
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
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);

      await expect(`FAQsSection/[${viewportName}] ${name}`).toMatchScreenshot({
        ignoreExact: ignoredScreenshotDifferences,
        customThreshold: screenshotThreshold,
      });
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `FAQsSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot({
          ignoreExact: ignoredScreenshotDifferences,
          customThreshold: screenshotThreshold,
        });
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
