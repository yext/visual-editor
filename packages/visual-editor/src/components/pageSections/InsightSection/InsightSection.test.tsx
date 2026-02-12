import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import { InsightSection } from "./InsightSection.tsx";
import { migrate } from "../../../utils/migrate.ts";
import { migrationRegistry } from "../../migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../../../utils/VisualEditorProvider.tsx";
import { SlotsCategoryComponents } from "../../categories/SlotsCategory.tsx";
import { Render, Config, resolveAllData } from "@puckeditor/core";
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

const version59Props = {
  styles: {
    backgroundColor: {
      bgColor: "bg-palette-primary-light",
      textColor: "text-black",
    },
    showSectionHeading: true,
  },
  slots: {
    SectionHeadingSlot: [
      {
        type: "HeadingTextSlot",
        props: {
          id: "HeadingTextSlot-68e62e9e-3fd4-452e-a168-6d422481c723",
          data: {
            text: {
              field: "",
              constantValue: {
                en: "Insights",
                hasLocalizedValue: "true",
              },
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
    CardsWrapperSlot: [
      {
        type: "InsightCardsWrapper",
        props: {
          id: "InsightCardsWrapper-682e60cb-daed-4312-82ed-e375a5db0ea8",
          data: {
            field: "",
            constantValueEnabled: true,
            constantValue: [
              {
                id: "InsightCard-e3e717ed-793a-46da-98d1-6a6abecd1776",
              },
              {
                id: "InsightCard-82660844-42e5-474f-b750-ec6dfea5a2ec",
              },
              {
                id: "InsightCard-fdbcb0c4-b721-4afb-a26d-fa0bec666b07",
              },
            ],
          },
          styles: {
            showImage: true,
            showCategory: true,
            showPublishTime: true,
            showDescription: true,
            showCTA: true,
          },
          slots: {
            CardSlot: [
              {
                type: "InsightCard",
                props: {
                  id: "InsightCard-e3e717ed-793a-46da-98d1-6a6abecd1776",
                  styles: {
                    backgroundColor: {
                      bgColor: "bg-white",
                      textColor: "text-black",
                    },
                  },
                  conditionalRender: {
                    hasCategory: true,
                    hasPublishTime: true,
                  },
                  slots: {
                    ImageSlot: [
                      {
                        type: "ImageSlot",
                        props: {
                          id: "InsightCard-e3e717ed-793a-46da-98d1-6a6abecd1776-image",
                          data: {
                            image: {
                              field: "",
                              constantValue: {
                                url: "https://images.unsplash.com/photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                                width: 640,
                                height: 360,
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
                          id: "HeadingTextSlot-cc8e0bdf-0930-49c9-8599-91339356144a",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "Article Name",
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            level: 4,
                            align: "left",
                            semanticLevelOverride: 4,
                          },
                        },
                      },
                    ],
                    CategorySlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "InsightCard-e3e717ed-793a-46da-98d1-6a6abecd1776-category",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Category","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Category</span></p>',
                                },
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
                    DescriptionSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "InsightCard-e3e717ed-793a-46da-98d1-6a6abecd1776-description",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters</span></p>',
                                },
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
                    PublishTimeSlot: [
                      {
                        type: "Timestamp",
                        props: {
                          id: "InsightCard-e3e717ed-793a-46da-98d1-6a6abecd1776-timestamp",
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
                          id: "InsightCard-e3e717ed-793a-46da-98d1-6a6abecd1776-cta",
                          data: {
                            entityField: {
                              field: "",
                              constantValue: {
                                label: {
                                  en: "Read More",
                                  hasLocalizedValue: "true",
                                },
                                link: "#",
                                linkType: "URL",
                                ctaType: "textAndLink",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "primary",
                            presetImage: "app-store",
                          },
                          eventName: "cta0",
                        },
                      },
                    ],
                  },
                  parentStyles: {
                    showImage: true,
                    showCategory: true,
                    showPublishTime: true,
                    showDescription: true,
                    showCTA: true,
                  },
                },
              },
              {
                type: "InsightCard",
                props: {
                  id: "InsightCard-82660844-42e5-474f-b750-ec6dfea5a2ec",
                  styles: {
                    backgroundColor: {
                      bgColor: "bg-white",
                      textColor: "text-black",
                    },
                  },
                  conditionalRender: {
                    hasCategory: true,
                    hasPublishTime: true,
                  },
                  slots: {
                    ImageSlot: [
                      {
                        type: "ImageSlot",
                        props: {
                          id: "InsightCard-82660844-42e5-474f-b750-ec6dfea5a2ec-image",
                          data: {
                            image: {
                              field: "",
                              constantValue: {
                                url: "https://images.unsplash.com/photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                                width: 640,
                                height: 360,
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
                          id: "HeadingTextSlot-1aa0e42d-03b7-4e47-bd0c-e1f85f80c8cd",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "Article Name",
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            level: 4,
                            align: "left",
                            semanticLevelOverride: 4,
                          },
                        },
                      },
                    ],
                    CategorySlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "InsightCard-82660844-42e5-474f-b750-ec6dfea5a2ec-category",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Category","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Category</span></p>',
                                },
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
                    DescriptionSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "InsightCard-82660844-42e5-474f-b750-ec6dfea5a2ec-description",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters</span></p>',
                                },
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
                    PublishTimeSlot: [
                      {
                        type: "Timestamp",
                        props: {
                          id: "InsightCard-82660844-42e5-474f-b750-ec6dfea5a2ec-timestamp",
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
                          id: "InsightCard-82660844-42e5-474f-b750-ec6dfea5a2ec-cta",
                          data: {
                            entityField: {
                              field: "",
                              constantValue: {
                                label: {
                                  en: "Read More",
                                  hasLocalizedValue: "true",
                                },
                                link: "#",
                                linkType: "URL",
                                ctaType: "textAndLink",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "primary",
                            presetImage: "app-store",
                          },
                          eventName: "cta1",
                        },
                      },
                    ],
                  },
                  parentStyles: {
                    showImage: true,
                    showCategory: true,
                    showPublishTime: true,
                    showDescription: true,
                    showCTA: true,
                  },
                },
              },
              {
                type: "InsightCard",
                props: {
                  id: "InsightCard-fdbcb0c4-b721-4afb-a26d-fa0bec666b07",
                  styles: {
                    backgroundColor: {
                      bgColor: "bg-white",
                      textColor: "text-black",
                    },
                  },
                  conditionalRender: {
                    hasCategory: true,
                    hasPublishTime: true,
                  },
                  slots: {
                    ImageSlot: [
                      {
                        type: "ImageSlot",
                        props: {
                          id: "InsightCard-fdbcb0c4-b721-4afb-a26d-fa0bec666b07-image",
                          data: {
                            image: {
                              field: "",
                              constantValue: {
                                url: "https://images.unsplash.com/photo-1504548840739-580b10ae7715?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                                width: 640,
                                height: 360,
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
                          id: "HeadingTextSlot-c61d9103-1423-4d3d-9e64-b0b233808ce0",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "Article Name",
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            level: 4,
                            align: "left",
                            semanticLevelOverride: 4,
                          },
                        },
                      },
                    ],
                    CategorySlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "InsightCard-fdbcb0c4-b721-4afb-a26d-fa0bec666b07-category",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Category","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Category</span></p>',
                                },
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
                    DescriptionSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "InsightCard-fdbcb0c4-b721-4afb-a26d-fa0bec666b07-description",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters</span></p>',
                                },
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
                    PublishTimeSlot: [
                      {
                        type: "Timestamp",
                        props: {
                          id: "InsightCard-fdbcb0c4-b721-4afb-a26d-fa0bec666b07-timestamp",
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
                          id: "InsightCard-fdbcb0c4-b721-4afb-a26d-fa0bec666b07-cta",
                          data: {
                            entityField: {
                              field: "",
                              constantValue: {
                                label: {
                                  en: "Read More",
                                  hasLocalizedValue: "true",
                                },
                                link: "#",
                                linkType: "URL",
                                ctaType: "textAndLink",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "primary",
                            presetImage: "app-store",
                          },
                          eventName: "cta2",
                        },
                      },
                    ],
                  },
                  parentStyles: {
                    showImage: true,
                    showCategory: true,
                    showPublishTime: true,
                    showDescription: true,
                    showCTA: true,
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
    name: "version 33 props with entity values",
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
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Fresh Flavors Fast",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 4,
                                align: "left",
                                semanticLevelOverride: 3,
                              },
                            },
                          },
                        ],
                        CategorySlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Blog",
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
                              data: {
                                text: {
                                  field: "",
                                  constantValue:
                                    "Discover how Galaxy Grill is redefining fast casual dining.",
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
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2025-01-01T12:00",
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
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Read Now",
                                    link: "https://yext.com",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "primary" },
                              eventName: "cta0",
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
    version: 33,
  },
  {
    name: "version 33 props with constant values",
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
    version: 33,
  },
  {
    name: "version 59 with showSectionHeading, showImage, showCategory false",
    document: { locale: "en" },
    props: {
      ...version59Props,
      styles: {
        ...version59Props.styles,
        showSectionHeading: false,
      },
      slots: {
        ...version59Props.slots,
        CardsWrapperSlot: [
          {
            ...version59Props.slots.CardsWrapperSlot[0],
            props: {
              ...version59Props.slots.CardsWrapperSlot[0].props,
              styles: {
                ...version59Props.slots.CardsWrapperSlot[0].props.styles,
                showImage: false,
                showCategory: false,
              },
            },
          },
        ],
      },
    },
    version: 59,
  },
  {
    name: "version 59 with showPublishTime, showDescription, showCTA false",
    document: { locale: "en" },
    props: {
      ...version59Props,
      slots: {
        ...version59Props.slots,
        CardsWrapperSlot: [
          {
            ...version59Props.slots.CardsWrapperSlot[0],
            props: {
              ...version59Props.slots.CardsWrapperSlot[0].props,
              styles: {
                ...version59Props.slots.CardsWrapperSlot[0].props.styles,
                showPublishTime: false,
                showDescription: false,
                showCTA: false,
              },
            },
          },
        ],
      },
    },
    version: 59,
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
        streamDocument: document,
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
