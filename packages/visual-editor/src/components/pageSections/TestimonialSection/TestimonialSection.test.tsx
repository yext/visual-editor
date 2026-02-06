import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { TestimonialSection } from "./TestimonialSection.tsx";
import { migrate } from "../../../utils/migrate.ts";
import { migrationRegistry } from "../../migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../../../utils/VisualEditorProvider.tsx";
import { SlotsCategoryComponents } from "../../categories/SlotsCategory.tsx";
import { Render, Config, resolveAllData } from "@puckeditor/core";
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
          id: "HeadingTextSlot-a8b1f1ff-b27d-4a47-8ef6-34a54ddfc4f8",
          data: {
            text: {
              constantValue: {
                en: "Featured Testimonials",
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
        type: "TestimonialCardsWrapper",
        props: {
          id: "TestimonialCardsWrapper-79e1b938-d706-4906-89df-63c1398590a3",
          styles: {
            showName: true,
            showDate: true,
          },
          data: {
            field: "",
            constantValueEnabled: true,
            constantValue: [
              {
                id: "TestimonialCard-f863252b-38af-4a3d-aa8d-a51c3460250b",
              },
              {
                id: "TestimonialCard-44f76f21-e229-4e5c-88c3-025db3200e95",
              },
              {
                id: "TestimonialCard-8c2bb59a-2ab8-4496-9862-36be74ebacb6",
              },
            ],
          },
          slots: {
            CardSlot: [
              {
                type: "TestimonialCard",
                props: {
                  id: "TestimonialCard-f863252b-38af-4a3d-aa8d-a51c3460250b",
                  index: 0,
                  styles: {
                    backgroundColor: {
                      bgColor: "bg-palette-primary-dark",
                      textColor: "text-white",
                    },
                  },
                  slots: {
                    DescriptionSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "BodyTextSlot-2e4be66a-6946-4bc6-b8dd-199139851b5b",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</span></p>',
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
                    ContributorNameSlot: [
                      {
                        type: "HeadingTextSlot",
                        props: {
                          id: "HeadingTextSlot-b46113e3-0411-48ac-b9aa-c2cdeb7dae71",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "Name",
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
                    ContributionDateSlot: [
                      {
                        type: "Timestamp",
                        props: {
                          id: "Timestamp-1e7c3d00-2e28-4a3d-9be1-83a58cd6a383",
                          data: {
                            date: {
                              field: "",
                              constantValue: "2022-08-02T14:00:00",
                              constantValueEnabled: true,
                            },
                            endDate: {
                              field: "",
                              constantValueEnabled: true,
                              constantValue: "",
                            },
                          },
                          styles: {
                            includeTime: false,
                            includeRange: false,
                          },
                        },
                      },
                    ],
                  },
                  conditionalRender: {
                    description: false,
                    contributorName: false,
                    contributionDate: true,
                  },
                },
              },
              {
                type: "TestimonialCard",
                props: {
                  id: "TestimonialCard-44f76f21-e229-4e5c-88c3-025db3200e95",
                  index: 1,
                  styles: {
                    backgroundColor: {
                      bgColor: "bg-palette-primary-dark",
                      textColor: "text-white",
                    },
                  },
                  slots: {
                    DescriptionSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "BodyTextSlot-422a4624-f314-4c5a-87f6-c6e40ba5a26a",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</span></p>',
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
                    ContributorNameSlot: [
                      {
                        type: "HeadingTextSlot",
                        props: {
                          id: "HeadingTextSlot-94545387-7a1f-4695-9566-872833dacd5d",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "Name",
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
                    ContributionDateSlot: [
                      {
                        type: "Timestamp",
                        props: {
                          id: "Timestamp-b03aba4c-616a-4c31-92d0-e303d00b52cd",
                          data: {
                            date: {
                              field: "",
                              constantValue: "2022-08-02T14:00:00",
                              constantValueEnabled: true,
                            },
                            endDate: {
                              field: "",
                              constantValueEnabled: true,
                              constantValue: "",
                            },
                          },
                          styles: {
                            includeTime: false,
                            includeRange: false,
                          },
                        },
                      },
                    ],
                  },
                  conditionalRender: {
                    description: false,
                    contributorName: false,
                    contributionDate: true,
                  },
                },
              },
              {
                type: "TestimonialCard",
                props: {
                  id: "TestimonialCard-8c2bb59a-2ab8-4496-9862-36be74ebacb6",
                  index: 2,
                  styles: {
                    backgroundColor: {
                      bgColor: "bg-palette-primary-dark",
                      textColor: "text-white",
                    },
                  },
                  slots: {
                    DescriptionSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "BodyTextSlot-d401493c-684f-40ba-9b1d-4536854d542e",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</span></p>',
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
                    ContributorNameSlot: [
                      {
                        type: "HeadingTextSlot",
                        props: {
                          id: "HeadingTextSlot-75588d41-a83f-4948-a6d3-7d617c13c6bd",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "Name",
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
                    ContributionDateSlot: [
                      {
                        type: "Timestamp",
                        props: {
                          id: "Timestamp-8e4b538f-c45f-497d-a9e7-24d1445ca4b4",
                          data: {
                            date: {
                              field: "",
                              constantValue: "2022-08-02T14:00:00",
                              constantValueEnabled: true,
                            },
                            endDate: {
                              field: "",
                              constantValueEnabled: true,
                              constantValue: "",
                            },
                          },
                          styles: {
                            includeTime: false,
                            includeRange: false,
                          },
                        },
                      },
                    ],
                  },
                  conditionalRender: {
                    description: false,
                    contributorName: false,
                    contributionDate: true,
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
  id: "TestimonialSection-d6b21cf4-64fa-4c0c-b043-7a9e6e35227a",
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
    name: "version 37 props with entity values",
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
    version: 37,
  },
  {
    name: "version 37 props with constant values",
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
    version: 37,
  },
  {
    name: "version 59 with showSectionHeading false",
    document: { c_testimonials: testimonialData },
    props: {
      ...version59Props,
      styles: {
        ...version59Props.styles,
        showSectionHeading: false,
      },
    },
    version: 59,
  },
  {
    name: "version 59 with showName, showDate false",
    document: { c_testimonials: testimonialData },
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
                showName: false,
                showDate: false,
              },
            },
          },
        ],
      },
    },
    version: 59,
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
