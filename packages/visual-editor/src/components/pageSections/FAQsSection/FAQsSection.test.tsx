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
import { Render, Config, resolveAllData } from "@measured/puck";
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

const version35FaqData = {
  faqs: [
    {
      answer: {
        en: getDefaultRTF("It slotifies the FAQs Section."),
        hasLocalizedValue: "true",
      },
      question: {
        en: getDefaultRTF("How does version 35 work?"),
        hasLocalizedValue: "true",
      },
    },
    {
      answer: {
        en: getDefaultRTF("Yes."),
        hasLocalizedValue: "true",
      },
      question: {
        en: getDefaultRTF("Does it need tests?"),
        hasLocalizedValue: "true",
      },
    },
  ],
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
    name: "version 35 with entity value for FAQs and Heading",
    document: {
      locale: "en",
      c_faq: version35FaqData,
      headingText: "FAQs Entity Heading",
    },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
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
                  constantValueEnabled: false,
                  field: "headingText",
                },
              },
              styles: { level: 1, align: "center" },
            },
          },
        ],
        FAQsWrapperSlot: [
          {
            type: "FAQsWrapperSlot",
            props: {
              data: {
                field: "c_faq",
                constantValueEnabled: false,
                constantValue: [{ id: "faq-1" }, { id: "faq-2" }],
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
                              parentData: {
                                field: "c_faq",
                                richText: version35FaqData.faqs[0].question,
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
                              parentData: {
                                field: "c_faq",
                                richText: version35FaqData.faqs[0].answer,
                              },
                            },
                          },
                        ],
                      },
                      parentData: {
                        field: "c_faq",
                        faq: version35FaqData.faqs[0],
                      },
                    },
                  },
                  {
                    type: "FAQSlot",
                    props: {
                      id: "faq-2",
                      slots: {
                        QuestionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "faq-2-question",
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
                              parentData: {
                                field: "c_faq",
                                richText: version35FaqData.faqs[1].question,
                              },
                            },
                          },
                        ],
                        AnswerSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "faq-2-answer",
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
                              parentData: {
                                field: "c_faq",
                                richText: version35FaqData.faqs[1].answer,
                              },
                            },
                          },
                        ],
                      },
                      parentData: {
                        field: "c_faq",
                        faq: version35FaqData.faqs[1],
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
      const q1 = page.getByText("How does version 35 work?");
      await act(async () => {
        await q1.click();
        await delay(interactionsDelay);
      });
    },
    version: 35,
  },
  {
    name: "version 35 with constant values and entity values",
    document: {
      locale: "en",
      question: getDefaultRTF("What is your return policy?"),
    },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
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
                                  field: "question",
                                  constantValue: {
                                    en: getDefaultRTF(
                                      "Lorem ipsum dolor sit amet?"
                                    ),
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: false,
                                },
                              },
                              styles: {
                                variant: "lg",
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
    version: 35,
  },
  {
    name: "version 49 with constant values",
    document: { locale: "en" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-tertiary-light",
          textColor: "text-black",
        },
      },
      data: {
        field: "",
        constantValueEnabled: true,
        constantValue: [{ id: "faq-1" }],
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
        CardSlot: [
          {
            type: "FAQCard",
            props: {
              id: "faq-1",
              data: {
                question: {
                  field: "",
                  constantValueEnabled: true,
                  constantValue: getDefaultRTF("How do I reset my password?"),
                },
                answer: {
                  field: "",
                  constantValueEnabled: true,
                  constantValue: getDefaultRTF(
                    "To reset your password, click on 'Forgot Password' at the login screen."
                  ),
                },
              },
              styles: {
                questionVariant: "lg",
                answerVariant: "base",
              },
            },
          },
        ],
      },
    },
    interactions: async (page) => {
      const q1 = page.getByText("How do I reset my password?");
      await act(async () => {
        await q1.click();
        await delay(interactionsDelay);
      });
    },
    version: 49,
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
