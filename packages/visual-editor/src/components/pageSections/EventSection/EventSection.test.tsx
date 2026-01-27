import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  EventSection,
  migrate,
  migrationRegistry,
  SlotsCategoryComponents,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@puckeditor/core";
import { page } from "@vitest/browser/context";

const eventsData = {
  events: [
    {
      cta: {
        label: "Learn More",
        link: "https://yext.com",
        linkType: "URL",
      },
      dateTime: "2025-06-01T10:00",
      description: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Join our hands-on </span><b><strong style="font-weight: bold;">cooking class</strong></b><span> to learn delicious recipes and </span><i><em style="font-style: italic;">unleash</em></i><span> your inner chef. </span><u><span style="text-decoration: underline; background-color: #ffc107;">Perfect for all levels!</span></u></p>',
      },
      image: {
        alternateText: "cooking class",
        height: 1554,
        thumbnails: [
          {
            height: 1554,
            url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/2048x1554.jpg",
            width: 2048,
          },
          {
            height: 1442,
            url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/1900x1442.jpg",
            width: 1900,
          },
          {
            height: 470,
            url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/619x470.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/593x450.jpg",
            width: 593,
          },
          {
            height: 149,
            url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/196x149.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/2048x1554.jpg",
        width: 2048,
      },
      title: "Cooking Class",
    },
    {
      cta: {
        label: "Sign Up",
        link: "sumo@yext.com",
        linkType: "EMAIL",
      },
      dateTime: "2026-06-30T08:00",
      description: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Join our group for a refreshing hike on local trails! Enjoy:</span></p><ul style="padding: 0; margin: 0; margin-left: 16px; list-style-type: disc; list-style-position: inside;"><li value="1" style="margin: 0 32px;"><span>nature</span></li><li value="2" style="margin: 0 32px;"><span>good company</span></li><li value="3" style="margin: 0 32px;"><span>fresh air together</span></li></ul>',
      },
      image: {
        height: 2048,
        thumbnails: [
          {
            height: 2048,
            url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/2048x2048.jpg",
            width: 2048,
          },
          {
            height: 1900,
            url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/1900x1900.jpg",
            width: 1900,
          },
          {
            height: 619,
            url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/619x619.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/450x450.jpg",
            width: 450,
          },
          {
            height: 196,
            url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/196x196.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/2048x2048.jpg",
        width: 2048,
      },
      title: "Hike",
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...EventSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { c_events: eventsData },
    props: { ...EventSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 26 props with constant values",
    document: { c_events: eventsData, name: "Galaxy Grill" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-tertiary-light",
          textColor: "text-black",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-11b6be75-4fa6-43d1-be46-99ee09b2fddb",
              data: {
                text: {
                  constantValue: {
                    en: "[[name]] Events",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 2, align: "center" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "EventCardsWrapper",
            props: {
              id: "EventCardsWrapper-cbbe94a2-0d2a-47fe-8dca-6f20513e6878",
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [
                  { id: "EventCard-45dcc2a5-d063-42a0-a7f6-047f25a6663f" },
                  { id: "EventCard-2d585b11-ff85-47f2-b8a0-45db7620fe5d" },
                  { id: "EventCard-63dd3b75-6868-40f0-a608-d1bf2e0f56bf" },
                ],
              },
              slots: {
                CardSlot: [
                  {
                    type: "EventCard",
                    props: {
                      id: "EventCard-45dcc2a5-d063-42a0-a7f6-047f25a6663f",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                        truncateDescription: true,
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "ImageSlot-3e5f2a22-d3d4-4b19-9111-fe9891b0deef",
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
                              styles: { aspectRatio: 1, width: 640 },
                              hideWidthProp: true,
                              className: "max-w-full h-full object-cover",
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "HeadingTextSlot-e10b7595-ddd9-4746-be72-5870181138bc",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Event A",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 3,
                                align: "left",
                                semanticLevelOverride: 3,
                              },
                            },
                          },
                        ],
                        DateTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "Timestamp-fc151b13-8b69-4cb0-a575-f463d3c5a351",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2022-12-12T14:00:00",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "2022-12-12T15:00:00",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                includeTime: true,
                                includeRange: true,
                              },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-547941ef-1bc8-4e88-96e6-81b3b65a4f54",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                              parentStyles: {
                                className: "md:line-clamp-2",
                              },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "CTASlot-ba200aa1-02db-4204-ab1e-1991ec472183",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Learn More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "secondary" },
                              eventName: "cta0",
                            },
                          },
                        ],
                      },
                      index: 0,
                      conditionalRender: {
                        image: true,
                        title: false,
                        dateTime: true,
                        description: false,
                        cta: true,
                      },
                    },
                  },
                  {
                    type: "EventCard",
                    props: {
                      id: "EventCard-2d585b11-ff85-47f2-b8a0-45db7620fe5d",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                        truncateDescription: true,
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "ImageSlot-1c33f48e-2c2b-46df-b43b-a5a7ae2215ba",
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
                              styles: { aspectRatio: 1, width: 640 },
                              hideWidthProp: true,
                              className: "max-w-full h-full object-cover",
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "HeadingTextSlot-510c5d7c-0523-41b9-b991-84e05dbcac47",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Event B",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 3,
                                align: "left",
                                semanticLevelOverride: 3,
                              },
                            },
                          },
                        ],
                        DateTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "Timestamp-742c4e50-59f3-4ac0-8cbf-ecfa64e262a7",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2022-12-12T14:00:00",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "2022-12-12T15:00:00",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                includeTime: true,
                                includeRange: true,
                              },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-4290b3cb-16fa-4f02-bb8a-b12b50886250",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                              parentStyles: {
                                className: "md:line-clamp-2",
                              },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "CTASlot-26ec966a-12d3-4068-9cae-a08c31ea3cb8",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Learn More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "secondary" },
                              eventName: "cta1",
                            },
                          },
                        ],
                      },
                      index: 1,
                      conditionalRender: {
                        image: true,
                        title: false,
                        dateTime: true,
                        description: false,
                        cta: true,
                      },
                    },
                  },
                  {
                    type: "EventCard",
                    props: {
                      id: "EventCard-63dd3b75-6868-40f0-a608-d1bf2e0f56bf",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                        truncateDescription: true,
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "ImageSlot-0642d9b9-b6a1-40da-873a-5562a16e2a3e",
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
                              styles: { aspectRatio: 1, width: 640 },
                              hideWidthProp: true,
                              className: "max-w-full h-full object-cover",
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "HeadingTextSlot-8a9285a6-5594-4c96-89d2-cc55fe4ba01f",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Event C",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 3,
                                align: "left",
                                semanticLevelOverride: 3,
                              },
                            },
                          },
                        ],
                        DateTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "Timestamp-07eeb4e6-9fb4-443b-bafd-7d45d1b4c1eb",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2022-12-12T14:00:00",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "2022-12-12T15:00:00",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                includeTime: true,
                                includeRange: true,
                              },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-0bfba3a3-3bae-4148-945d-0362cc861121",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                              parentStyles: {
                                className: "md:line-clamp-2",
                              },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "CTASlot-0a138c41-608d-4266-8591-815d4458d193",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Learn More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "secondary" },
                              eventName: "cta2",
                            },
                          },
                        ],
                      },
                      index: 2,
                      conditionalRender: {
                        image: true,
                        title: false,
                        dateTime: true,
                        description: false,
                        cta: true,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      analytics: { scope: "eventsSection" },
      liveVisibility: true,
    },
    version: 26,
  },
  {
    name: "version 26 props with entity values",
    document: { c_events: eventsData, name: "Galaxy Grill" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-tertiary-light",
          textColor: "text-black",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-11b6be75-4fa6-43d1-be46-99ee09b2fddb",
              data: {
                text: {
                  constantValue: {
                    en: "Upcoming Events",
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
        CardsWrapperSlot: [
          {
            type: "EventCardsWrapper",
            props: {
              id: "EventCardsWrapper-cbbe94a2-0d2a-47fe-8dca-6f20513e6878",
              data: {
                field: "c_events",
                constantValueEnabled: false,
                constantValue: [
                  { id: "EventCard-45dcc2a5-d063-42a0-a7f6-047f25a6663f" },
                  { id: "EventCard-2d585b11-ff85-47f2-b8a0-45db7620fe5d" },
                  { id: "EventCard-63dd3b75-6868-40f0-a608-d1bf2e0f56bf" },
                ],
              },
              slots: {
                CardSlot: [
                  {
                    type: "EventCard",
                    props: {
                      id: "EventCard-45dcc2a5-d063-42a0-a7f6-047f25a6663f",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                        truncateDescription: false,
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "ImageSlot-3e5f2a22-d3d4-4b19-9111-fe9891b0deef",
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
                              hideWidthProp: true,
                              className: "max-w-full h-full object-cover",
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "HeadingTextSlot-e10b7595-ddd9-4746-be72-5870181138bc",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Event A",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 5,
                                align: "center",
                                semanticLevelOverride: 2,
                              },
                            },
                          },
                        ],
                        DateTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "Timestamp-fc151b13-8b69-4cb0-a575-f463d3c5a351",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2022-12-12T14:00:00",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "2022-12-12T15:00:00",
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
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-547941ef-1bc8-4e88-96e6-81b3b65a4f54",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                              parentStyles: {},
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "CTASlot-ba200aa1-02db-4204-ab1e-1991ec472183",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Learn More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "link" },
                              eventName: "cta0",
                            },
                          },
                        ],
                      },
                      index: 0,
                      conditionalRender: {
                        image: true,
                        title: true,
                        dateTime: true,
                        description: true,
                        cta: true,
                      },
                    },
                  },
                  {
                    type: "EventCard",
                    props: {
                      id: "EventCard-2d585b11-ff85-47f2-b8a0-45db7620fe5d",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                        truncateDescription: false,
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "ImageSlot-1c33f48e-2c2b-46df-b43b-a5a7ae2215ba",
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
                              hideWidthProp: true,
                              className: "max-w-full h-full object-cover",
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "HeadingTextSlot-510c5d7c-0523-41b9-b991-84e05dbcac47",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Event B",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 5,
                                align: "center",
                                semanticLevelOverride: 2,
                              },
                            },
                          },
                        ],
                        DateTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "Timestamp-742c4e50-59f3-4ac0-8cbf-ecfa64e262a7",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2022-12-12T14:00:00",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "2022-12-12T15:00:00",
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
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "BodyTextSlot-4290b3cb-16fa-4f02-bb8a-b12b50886250",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "base" },
                              parentStyles: {},
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "CTASlot-26ec966a-12d3-4068-9cae-a08c31ea3cb8",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "Learn More",
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "textAndLink",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: { variant: "link" },
                              eventName: "cta1",
                            },
                          },
                        ],
                      },
                      index: 1,
                      conditionalRender: {
                        image: true,
                        title: true,
                        dateTime: true,
                        description: true,
                        cta: true,
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
      analytics: { scope: "eventsSection" },
      liveVisibility: true,
    },
    version: 26,
  },
  {
    name: "version 51 props with constant values",
    version: 51,
    document: {},
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-78b2b421-b527-44f2-88ac-3bbfc386a312",
              data: {
                text: {
                  constantValue: {
                    en: "Upcoming Events",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
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
            type: "EventCardsWrapper",
            props: {
              id: "EventCardsWrapper-6814ff91-e468-48ae-be8b-2dc117bea46f",
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [
                  {
                    id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1",
                  },
                  {
                    id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732",
                  },
                ],
              },
              slots: {
                CardSlot: [
                  {
                    type: "EventCard",
                    props: {
                      id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1",
                      index: 0,
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                        truncateDescription: true,
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1-image",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                                    width: 640,
                                    height: 360,
                                    alternateText: "Event Image",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                aspectRatio: 1.78,
                                width: 640,
                              },
                              hideWidthProp: true,
                              className: "max-w-full h-full object-cover",
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1-title",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Event 1",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 3,
                                align: "left",
                                semanticLevelOverride: 3,
                              },
                            },
                          },
                        ],
                        DateTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1-timestamp",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                includeTime: true,
                                includeRange: false,
                              },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1-description",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: "",
                                      html: "",
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                              parentStyles: {
                                className: "md:line-clamp-2",
                              },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1-cta",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: {
                                      en: "",
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
                      conditionalRender: {
                        image: true,
                        title: true,
                        dateTime: true,
                        description: true,
                        cta: true,
                      },
                    },
                  },
                  {
                    type: "EventCard",
                    props: {
                      id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732",
                      index: 1,
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                        truncateDescription: true,
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732-image",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://images.unsplash.com/photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                                    width: 640,
                                    height: 360,
                                    alternateText: "Event Image",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                aspectRatio: 1.78,
                                width: 640,
                              },
                              hideWidthProp: true,
                              className: "max-w-full h-full object-cover",
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732-title",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Event 2",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 3,
                                align: "left",
                                semanticLevelOverride: 3,
                              },
                            },
                          },
                        ],
                        DateTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732-timestamp",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2022-12-12T14:00:00",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                includeTime: true,
                                includeRange: false,
                              },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732-description",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                              parentStyles: {
                                className: "md:line-clamp-2",
                              },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732-cta",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: {
                                      en: "",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "presetImage",
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
                      conditionalRender: {
                        image: true,
                        title: true,
                        dateTime: true,
                        description: true,
                        cta: true,
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
        scope: "eventsSection",
      },
      liveVisibility: true,
      id: "EventSection-2fb8d8fc-66d5-442b-8d4f-8b50f3a9d8aa",
    },
  },
  {
    name: "version 51 props with entity values",
    version: 51,
    document: { c_exampleEvents: eventsData, name: "Galaxy Grill" },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-quaternary",
          textColor: "text-palette-quaternary-contrast",
        },
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-78b2b421-b527-44f2-88ac-3bbfc386a312",
              data: {
                text: {
                  constantValue: {
                    en: "Events at [[name]]",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "name",
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
            type: "EventCardsWrapper",
            props: {
              id: "EventCardsWrapper-6814ff91-e468-48ae-be8b-2dc117bea46f",
              data: {
                field: "c_exampleEvents",
                constantValueEnabled: false,
                constantValue: [
                  {
                    id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1",
                  },
                  {
                    id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732",
                  },
                ],
              },
              slots: {
                CardSlot: [
                  {
                    type: "EventCard",
                    props: {
                      id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                        truncateDescription: true,
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1-image",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://images.unsplash.com/photo-1502252430442-aac78f397426?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                                    width: 640,
                                    height: 360,
                                    alternateText: "Event Image",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                aspectRatio: 1,
                                width: 640,
                              },
                              hideWidthProp: true,
                              className: "max-w-full h-full object-cover",
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                              parentData: {
                                field: "c_exampleEvents",
                                image: {
                                  alternateText: "cooking class",
                                  height: 1554,
                                  thumbnails: [
                                    {
                                      height: 1554,
                                      url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/2048x1554.jpg",
                                      width: 2048,
                                    },
                                    {
                                      height: 1442,
                                      url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/1900x1442.jpg",
                                      width: 1900,
                                    },
                                    {
                                      height: 470,
                                      url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/619x470.jpg",
                                      width: 619,
                                    },
                                    {
                                      height: 450,
                                      url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/593x450.jpg",
                                      width: 593,
                                    },
                                    {
                                      height: 149,
                                      url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/196x149.jpg",
                                      width: 196,
                                    },
                                  ],
                                  url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/2048x1554.jpg",
                                  width: 2048,
                                },
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1-title",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Event 1",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 3,
                                align: "left",
                                semanticLevelOverride: 3,
                              },
                              parentData: {
                                field: "c_exampleEvents",
                                text: "Cooking Class",
                              },
                            },
                          },
                        ],
                        DateTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1-timestamp",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                includeTime: true,
                                includeRange: false,
                              },
                              parentData: {
                                field: "c_exampleEvents",
                                date: "2025-06-01T10:00",
                              },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1-description",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: "",
                                      html: "",
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                              parentStyles: {
                                className: "md:line-clamp-2",
                              },
                              parentData: {
                                field: "c_exampleEvents",
                                richText: {
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Join our hands-on </span><b><strong style="font-weight: bold;">cooking class</strong></b><span> to learn delicious recipes and </span><i><em style="font-style: italic;">unleash</em></i><span> your inner chef. </span><u><span style="text-decoration: underline; background-color: #ffc107;">Perfect for all levels!</span></u></p>',
                                },
                              },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "EventCard-697ac4e1-b489-45f2-b502-440afe8c23e1-cta",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: {
                                      en: "",
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
                              parentData: {
                                field: "c_exampleEvents",
                                cta: {
                                  label: "Learn More",
                                  link: "https://yext.com",
                                  linkType: "URL",
                                },
                              },
                            },
                          },
                        ],
                      },
                      index: 0,
                      conditionalRender: {
                        image: true,
                        title: true,
                        dateTime: true,
                        description: true,
                        cta: true,
                      },
                      parentData: {
                        field: "c_exampleEvents",
                        event: {
                          cta: {
                            label: "Learn More",
                            link: "https://yext.com",
                            linkType: "URL",
                          },
                          dateTime: "2025-06-01T10:00",
                          description: {
                            html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Join our hands-on </span><b><strong style="font-weight: bold;">cooking class</strong></b><span> to learn delicious recipes and </span><i><em style="font-style: italic;">unleash</em></i><span> your inner chef. </span><u><span style="text-decoration: underline; background-color: #ffc107;">Perfect for all levels!</span></u></p>',
                          },
                          image: {
                            alternateText: "cooking class",
                            height: 1554,
                            thumbnails: [
                              {
                                height: 1554,
                                url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/2048x1554.jpg",
                                width: 2048,
                              },
                              {
                                height: 1442,
                                url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/1900x1442.jpg",
                                width: 1900,
                              },
                              {
                                height: 470,
                                url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/619x470.jpg",
                                width: 619,
                              },
                              {
                                height: 450,
                                url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/593x450.jpg",
                                width: 593,
                              },
                              {
                                height: 149,
                                url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/196x149.jpg",
                                width: 196,
                              },
                            ],
                            url: "https://a.mktgcdn.com/p-dev/dORmX57RPQoHMVzY6eP8hBvzQit-XuqHI4LWatzrQLM/2048x1554.jpg",
                            width: 2048,
                          },
                          title: "Cooking Class",
                        },
                      },
                    },
                  },
                  {
                    type: "EventCard",
                    props: {
                      id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732",
                      index: 1,
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-white",
                          textColor: "text-black",
                        },
                        truncateDescription: true,
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732-image",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://images.unsplash.com/photo-1755745360285-0633c972b0fd?ixlib=rb-4.1.0&q=85&fm=jpg&crop=entropy&cs=srgb&height=360&width=640&fit=max",
                                    width: 640,
                                    height: 360,
                                    alternateText: "Event Image",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                aspectRatio: 1,
                                width: 640,
                              },
                              hideWidthProp: true,
                              className: "max-w-full h-full object-cover",
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                              parentData: {
                                field: "c_exampleEvents",
                                image: {
                                  height: 2048,
                                  thumbnails: [
                                    {
                                      height: 2048,
                                      url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/2048x2048.jpg",
                                      width: 2048,
                                    },
                                    {
                                      height: 1900,
                                      url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/1900x1900.jpg",
                                      width: 1900,
                                    },
                                    {
                                      height: 619,
                                      url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/619x619.jpg",
                                      width: 619,
                                    },
                                    {
                                      height: 450,
                                      url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/450x450.jpg",
                                      width: 450,
                                    },
                                    {
                                      height: 196,
                                      url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/196x196.jpg",
                                      width: 196,
                                    },
                                  ],
                                  url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/2048x2048.jpg",
                                  width: 2048,
                                },
                              },
                            },
                          },
                        ],
                        TitleSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732-title",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: "Event 2",
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                level: 3,
                                align: "left",
                                semanticLevelOverride: 3,
                              },
                              parentData: {
                                field: "c_exampleEvents",
                                text: "Hike",
                              },
                            },
                          },
                        ],
                        DateTimeSlot: [
                          {
                            type: "Timestamp",
                            props: {
                              id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732-timestamp",
                              data: {
                                date: {
                                  field: "",
                                  constantValue: "2022-12-12T14:00:00",
                                  constantValueEnabled: true,
                                },
                                endDate: {
                                  field: "",
                                  constantValue: "",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                includeTime: true,
                                includeRange: false,
                              },
                              parentData: {
                                field: "c_exampleEvents",
                                date: "2026-06-30T08:00",
                              },
                            },
                          },
                        ],
                        DescriptionSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732-description",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: {
                                    en: {
                                      json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                      html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</span></p>',
                                    },
                                    hasLocalizedValue: "true",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                              parentStyles: {
                                className: "md:line-clamp-2",
                              },
                              parentData: {
                                field: "c_exampleEvents",
                                richText: {
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Join our group for a refreshing hike on local trails! Enjoy:</span></p><ul style="padding: 0; margin: 0; margin-left: 16px; list-style-type: disc; list-style-position: inside;"><li value="1" style="margin: 0 32px;"><span>nature</span></li><li value="2" style="margin: 0 32px;"><span>good company</span></li><li value="3" style="margin: 0 32px;"><span>fresh air together</span></li></ul>',
                                },
                              },
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "EventCard-e8f62460-d459-43c9-8c88-3a2afefa1732-cta",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: {
                                      en: "",
                                      hasLocalizedValue: "true",
                                    },
                                    link: "#",
                                    linkType: "URL",
                                    ctaType: "presetImage",
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "primary",
                                presetImage: "app-store",
                              },
                              eventName: "cta1",
                              parentData: {
                                field: "c_exampleEvents",
                                cta: {
                                  label: "Sign Up",
                                  link: "sumo@yext.com",
                                  linkType: "EMAIL",
                                },
                              },
                            },
                          },
                        ],
                      },
                      conditionalRender: {
                        image: true,
                        title: true,
                        dateTime: true,
                        description: true,
                        cta: true,
                      },
                      parentData: {
                        field: "c_exampleEvents",
                        event: {
                          cta: {
                            label: "Sign Up",
                            link: "sumo@yext.com",
                            linkType: "EMAIL",
                          },
                          dateTime: "2026-06-30T08:00",
                          description: {
                            html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Join our group for a refreshing hike on local trails! Enjoy:</span></p><ul style="padding: 0; margin: 0; margin-left: 16px; list-style-type: disc; list-style-position: inside;"><li value="1" style="margin: 0 32px;"><span>nature</span></li><li value="2" style="margin: 0 32px;"><span>good company</span></li><li value="3" style="margin: 0 32px;"><span>fresh air together</span></li></ul>',
                          },
                          image: {
                            height: 2048,
                            thumbnails: [
                              {
                                height: 2048,
                                url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/2048x2048.jpg",
                                width: 2048,
                              },
                              {
                                height: 1900,
                                url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/1900x1900.jpg",
                                width: 1900,
                              },
                              {
                                height: 619,
                                url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/619x619.jpg",
                                width: 619,
                              },
                              {
                                height: 450,
                                url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/450x450.jpg",
                                width: 450,
                              },
                              {
                                height: 196,
                                url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/196x196.jpg",
                                width: 196,
                              },
                            ],
                            url: "https://a.mktgcdn.com/p-dev/IBubx9o_JTORQF4dzMm51g2VlMAn4_dGfUXrVkUdNXo/2048x2048.jpg",
                            width: 2048,
                          },
                          title: "Hike",
                        },
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
        scope: "eventsSection",
      },
      liveVisibility: true,
      id: "EventSection-2fb8d8fc-66d5-442b-8d4f-8b50f3a9d8aa",
    },
  },
];

describe("EventSection", async () => {
  const puckConfig: Config = {
    components: { EventSection, ...SlotsCategoryComponents },
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
              type: "EventSection",
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
        `EventSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `EventSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
