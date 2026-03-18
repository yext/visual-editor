import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import { TeamSection } from "./TeamSection.tsx";
import { migrate } from "../../../utils/migrate.ts";
import { migrationRegistry } from "../../migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../../../utils/VisualEditorProvider.tsx";
import { SlotsCategoryComponents } from "../../categories/SlotsCategory.tsx";
import { Render, Config, resolveAllData } from "@puckeditor/core";
import { page } from "@vitest/browser/context";

const teamData = {
  people: [
    {
      cta: {
        label: "Email Me",
        link: "cosmo@galaxygrill.com",
        linkType: "EMAIL",
      },
      email: "cosmo@galaxygrill.com",
      headshot: {
        height: 2048,
        thumbnails: [
          {
            height: 2048,
            url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/2048x2048.jpg",
            width: 2048,
          },
          {
            height: 1900,
            url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/1900x1900.jpg",
            width: 1900,
          },
          {
            height: 619,
            url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/619x619.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/450x450.jpg",
            width: 450,
          },
          {
            height: 196,
            url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/196x196.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/oLt7FTuLqSqCm72i_7pDW5cABF2BD6TiJz56eKG_TY8/2048x2048.jpg",
        width: 2048,
      },
      name: "Captain Cosmo",
      phoneNumber: "+18005552020",
      title: "Founder \u0026 CEO",
    },
    {
      cta: {
        link: "nova@galaxygrill.com",
        label: "Email Me",
        linkType: "EMAIL",
      },
      name: "Chef Nova",
      phoneNumber: "+528005551010",
      title: "Culinary Director",
    },
    {
      headshot: {
        height: 2048,
        thumbnails: [
          {
            height: 2048,
            url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/2048x2048.jpg",
            width: 2048,
          },
          {
            height: 1900,
            url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/1900x1900.jpg",
            width: 1900,
          },
          {
            height: 619,
            url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/619x619.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/450x450.jpg",
            width: 450,
          },
          {
            height: 196,
            url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/196x196.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/L0MNT7skLmP_utpGEzNhI0BzglmzSAojiPGOvI6P32A/2048x2048.jpg",
        width: 2048,
      },
      name: "Admiral Aster",
      title: "Operations Manager",
    },
  ],
};

const version59Props = {
  styles: {
    backgroundColor: {
      bgColor: "bg-palette-secondary-light",
      textColor: "text-black",
    },
    showSectionHeading: true,
  },
  slots: {
    SectionHeadingSlot: [
      {
        type: "HeadingTextSlot",
        props: {
          id: "HeadingTextSlot-8daa816f-7dfb-40a8-a566-a389b75b20d5",
          data: {
            text: {
              constantValue: {
                en: "Meet Our Team",
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
        type: "TeamCardsWrapper",
        props: {
          id: "TeamCardsWrapper-74fb3b71-a900-4f75-ba53-95791faf4d26",
          data: {
            field: "",
            constantValueEnabled: true,
            constantValue: [
              {
                id: "TeamCard-79d21fd5-ac1b-4eb1-b42b-22a61921d773",
              },
              {
                id: "TeamCard-e95893de-27fc-4dd2-8427-af146daa3acc",
              },
              {
                id: "TeamCard-4068472c-225a-4743-8aa1-b4a3e099b27a",
              },
            ],
          },
          styles: {
            showImage: true,
            showTitle: true,
            showPhone: true,
            showEmail: true,
            showCTA: true,
          },
          slots: {
            CardSlot: [
              {
                type: "TeamCard",
                props: {
                  id: "TeamCard-79d21fd5-ac1b-4eb1-b42b-22a61921d773",
                  index: 0,
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
                          id: "ImageSlot-899584c1-f9c1-4dee-8854-8fdd56c5bcc2",
                          data: {
                            image: {
                              field: "",
                              constantValue: {
                                url: "https://a.mktgcdn.com/p/EQRaOZG5zFlcbEHYaH16EV6WmkzV8kd6vMd73Myg4AA/196x196.jpg",
                                height: 80,
                                width: 80,
                                alternateText: "Headshot Image",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            aspectRatio: 1,
                            width: 200,
                          },
                          hideWidthProp: true,
                          className: "max-w-full h-full object-cover",
                          sizes: {
                            base: "80px",
                          },
                        },
                      },
                    ],
                    NameSlot: [
                      {
                        type: "HeadingTextSlot",
                        props: {
                          id: "HeadingTextSlot-ee268d3e-6b51-491f-bc5d-97b5fc5b09d0",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "First Last",
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
                    TitleSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "BodyTextSlot-337960ae-f156-40ab-b6e3-38998c4ba2c4",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Associate Agent","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Associate Agent</span></p>',
                                },
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "base",
                            semanticLevelOverride: 3,
                          },
                        },
                      },
                    ],
                    PhoneSlot: [
                      {
                        type: "PhoneNumbersSlot",
                        props: {
                          id: "PhoneNumbersSlot-6b15b3f2-fe86-4279-a7fb-79ef829a283f",
                          data: {
                            phoneNumbers: [
                              {
                                number: {
                                  field: "",
                                  constantValue: "+12027706619",
                                  constantValueEnabled: true,
                                },
                                label: {
                                  en: "",
                                  hasLocalizedValue: "true",
                                },
                              },
                            ],
                          },
                          styles: {
                            phoneFormat: "domestic",
                            includePhoneHyperlink: true,
                          },
                          eventName: "card0-phone",
                        },
                      },
                    ],
                    EmailSlot: [
                      {
                        type: "EmailsSlot",
                        props: {
                          id: "EmailsSlot-b45cff56-6278-4ebb-8d43-d094b07c56f4",
                          data: {
                            list: {
                              field: "",
                              constantValue: ["jkelley@[company].com"],
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            listLength: 1,
                          },
                          eventName: "card0-email",
                        },
                      },
                    ],
                    CTASlot: [
                      {
                        type: "CTASlot",
                        props: {
                          id: "CTASlot-dd89dae9-bca7-4def-8d33-4bece6592105",
                          data: {
                            entityField: {
                              field: "",
                              constantValue: {
                                label: {
                                  en: "Visit Profile",
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
                          eventName: "card0-cta",
                        },
                      },
                    ],
                  },
                  conditionalRender: {
                    image: true,
                    name: true,
                    title: true,
                    phone: true,
                    email: true,
                    cta: true,
                  },
                  parentStyles: {
                    showImage: true,
                    showTitle: true,
                    showPhone: true,
                    showEmail: true,
                    showCTA: true,
                  },
                },
              },
              {
                type: "TeamCard",
                props: {
                  id: "TeamCard-e95893de-27fc-4dd2-8427-af146daa3acc",
                  index: 1,
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
                          id: "ImageSlot-ea5e9dcc-1aaf-4d83-9e61-5fcbeac37e08",
                          data: {
                            image: {
                              field: "",
                              constantValue: {
                                url: "https://a.mktgcdn.com/p/EQRaOZG5zFlcbEHYaH16EV6WmkzV8kd6vMd73Myg4AA/196x196.jpg",
                                height: 80,
                                width: 80,
                                alternateText: "Headshot Image",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            aspectRatio: 1,
                            width: 200,
                          },
                          hideWidthProp: true,
                          className: "max-w-full h-full object-cover",
                          sizes: {
                            base: "80px",
                          },
                        },
                      },
                    ],
                    NameSlot: [
                      {
                        type: "HeadingTextSlot",
                        props: {
                          id: "HeadingTextSlot-1cc13147-74b7-4938-89ec-fd043ead1f40",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "First Last",
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
                    TitleSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "BodyTextSlot-3a09212f-4ac9-4263-983d-3148d2dcf15d",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Associate Agent","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Associate Agent</span></p>',
                                },
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "base",
                            semanticLevelOverride: 3,
                          },
                        },
                      },
                    ],
                    PhoneSlot: [
                      {
                        type: "PhoneNumbersSlot",
                        props: {
                          id: "PhoneNumbersSlot-19de3b67-3ddc-434a-ae9d-3602208a8f50",
                          data: {
                            phoneNumbers: [
                              {
                                number: {
                                  field: "",
                                  constantValue: "+12027706619",
                                  constantValueEnabled: true,
                                },
                                label: {
                                  en: "",
                                  hasLocalizedValue: "true",
                                },
                              },
                            ],
                          },
                          styles: {
                            phoneFormat: "domestic",
                            includePhoneHyperlink: true,
                          },
                          eventName: "card1-phone",
                        },
                      },
                    ],
                    EmailSlot: [
                      {
                        type: "EmailsSlot",
                        props: {
                          id: "EmailsSlot-0abc31ae-2510-4188-89fa-6fa0d37f84a5",
                          data: {
                            list: {
                              field: "",
                              constantValue: ["jkelley@[company].com"],
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            listLength: 1,
                          },
                          eventName: "card1-email",
                        },
                      },
                    ],
                    CTASlot: [
                      {
                        type: "CTASlot",
                        props: {
                          id: "CTASlot-fe7ac197-3e22-4383-ba46-f3cdc9875750",
                          data: {
                            entityField: {
                              field: "",
                              constantValue: {
                                label: {
                                  en: "Visit Profile",
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
                          eventName: "card1-cta",
                        },
                      },
                    ],
                  },
                  conditionalRender: {
                    image: true,
                    name: true,
                    title: true,
                    phone: true,
                    email: true,
                    cta: true,
                  },
                  parentStyles: {
                    showImage: true,
                    showTitle: true,
                    showPhone: true,
                    showEmail: true,
                    showCTA: true,
                  },
                },
              },
              {
                type: "TeamCard",
                props: {
                  id: "TeamCard-4068472c-225a-4743-8aa1-b4a3e099b27a",
                  index: 2,
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
                          id: "ImageSlot-e266b320-fb93-4377-8392-16475eb860c8",
                          data: {
                            image: {
                              field: "",
                              constantValue: {
                                url: "https://a.mktgcdn.com/p/EQRaOZG5zFlcbEHYaH16EV6WmkzV8kd6vMd73Myg4AA/196x196.jpg",
                                height: 80,
                                width: 80,
                                alternateText: "Headshot Image",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            aspectRatio: 1,
                            width: 200,
                          },
                          hideWidthProp: true,
                          className: "max-w-full h-full object-cover",
                          sizes: {
                            base: "80px",
                          },
                        },
                      },
                    ],
                    NameSlot: [
                      {
                        type: "HeadingTextSlot",
                        props: {
                          id: "HeadingTextSlot-d00f5001-9efc-496c-9e90-7a06c23eb3ac",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: "First Last",
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
                    TitleSlot: [
                      {
                        type: "BodyTextSlot",
                        props: {
                          id: "BodyTextSlot-9e4d4656-41c1-4164-865c-37cc3670122b",
                          data: {
                            text: {
                              field: "",
                              constantValue: {
                                en: {
                                  json: '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Associate Agent","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
                                  html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Associate Agent</span></p>',
                                },
                                hasLocalizedValue: "true",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            variant: "base",
                            semanticLevelOverride: 3,
                          },
                        },
                      },
                    ],
                    PhoneSlot: [
                      {
                        type: "PhoneNumbersSlot",
                        props: {
                          id: "PhoneNumbersSlot-e71ec41f-1013-48f8-9a7d-b649cf05f71d",
                          data: {
                            phoneNumbers: [
                              {
                                number: {
                                  field: "",
                                  constantValue: "+12027706619",
                                  constantValueEnabled: true,
                                },
                                label: {
                                  en: "",
                                  hasLocalizedValue: "true",
                                },
                              },
                            ],
                          },
                          styles: {
                            phoneFormat: "domestic",
                            includePhoneHyperlink: true,
                          },
                          eventName: "card2-phone",
                        },
                      },
                    ],
                    EmailSlot: [
                      {
                        type: "EmailsSlot",
                        props: {
                          id: "EmailsSlot-3932ff63-fbe6-478e-a29a-b1f6011098c2",
                          data: {
                            list: {
                              field: "",
                              constantValue: ["jkelley@[company].com"],
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            listLength: 1,
                          },
                          eventName: "card2-email",
                        },
                      },
                    ],
                    CTASlot: [
                      {
                        type: "CTASlot",
                        props: {
                          id: "CTASlot-71d7170b-10fe-4235-92f1-d1bc2dec6101",
                          data: {
                            entityField: {
                              field: "",
                              constantValue: {
                                label: {
                                  en: "Visit Profile",
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
                          eventName: "card2-cta",
                        },
                      },
                    ],
                  },
                  conditionalRender: {
                    image: true,
                    name: true,
                    title: true,
                    phone: true,
                    email: true,
                    cta: true,
                  },
                  parentStyles: {
                    showImage: true,
                    showTitle: true,
                    showPhone: true,
                    showEmail: true,
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
    scope: "teamSection",
  },
  liveVisibility: true,
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...TeamSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with document data",
    document: { c_team: teamData },
    props: { ...TeamSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 34 props with entity values",
    document: { c_team: teamData, name: "Test Name" },
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
              data: {
                text: {
                  field: "name",
                  constantValue: "Meet Our Team",
                  constantValueEnabled: false,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "TeamCardsWrapper",
            props: {
              data: {
                field: "c_team",
                constantValueEnabled: false,
                constantValue: [],
              },
              slots: {
                CardSlot: [
                  {
                    type: "TeamCard",
                    props: {
                      id: "TeamCard-1",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-secondary-light",
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
                                    url: "https://placehold.co/80x80",
                                    height: 80,
                                    width: 80,
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                aspectRatio: 1,
                                width: 80,
                              },
                            },
                          },
                        ],
                        NameSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Captain Cosmo",
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
                        TitleSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Founder & CEO",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        PhoneSlot: [
                          {
                            type: "PhoneNumbersSlot",
                            props: {
                              data: {
                                phoneNumbers: [
                                  {
                                    number: {
                                      field: "",
                                      constantValue: "+18005551010",
                                      constantValueEnabled: true,
                                    },
                                    label: {
                                      en: "Phone",
                                      hasLocalizedValue: "true",
                                    },
                                  },
                                ],
                              },
                              styles: {
                                phoneFormat: "domestic",
                                includePhoneHyperlink: true,
                              },
                              eventName: "phone0",
                            },
                          },
                        ],
                        EmailSlot: [
                          {
                            type: "EmailsSlot",
                            props: {
                              data: {
                                list: {
                                  field: "",
                                  constantValue: [
                                    "constantValue@galaxygrill.com",
                                  ],
                                  constantValueEnabled: true,
                                },
                              },
                              eventName: "email0",
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
                                    label: "Email Me",
                                    link: "constantValue@galaxygrill.com",
                                    linkType: "EMAIL",
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
        scope: "teamSection",
      },
      liveVisibility: true,
    },
    version: 34,
  },
  {
    name: "version 34 props with constant values",
    document: { c_team: teamData },
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
              data: {
                text: {
                  field: "",
                  constantValue: "Our Amazing Team",
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "TeamCardsWrapper",
            props: {
              data: {
                field: "",
                constantValueEnabled: true,
                constantValue: [
                  { id: "TeamCard-1" },
                  { id: "TeamCard-2" },
                  { id: "TeamCard-3" },
                ],
              },
              slots: {
                CardSlot: [
                  {
                    type: "TeamCard",
                    props: {
                      id: "TeamCard-1",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-secondary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "TeamCard-1-image",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://placehold.co/80x80",
                                    height: 80,
                                    width: 80,
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                aspectRatio: 1,
                                width: 80,
                              },
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                            },
                          },
                        ],
                        NameSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "TeamCard-1-name",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Team Member 1",
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
                        TitleSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "TeamCard-1-title",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Position 1",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        PhoneSlot: [
                          {
                            type: "PhoneNumbersSlot",
                            props: {
                              id: "TeamCard-1-phone",
                              data: {
                                phoneNumbers: [
                                  {
                                    number: {
                                      field: "",
                                      constantValue: "+18005551111",
                                      constantValueEnabled: true,
                                    },
                                    label: {
                                      en: "Phone",
                                      hasLocalizedValue: "true",
                                    },
                                  },
                                ],
                              },
                              styles: {
                                phoneFormat: "domestic",
                                includePhoneHyperlink: true,
                              },
                              eventName: "phone",
                            },
                          },
                        ],
                        EmailSlot: [
                          {
                            type: "EmailsSlot",
                            props: {
                              id: "TeamCard-1-email",
                              data: {
                                list: {
                                  field: "",
                                  constantValue: ["team1@example.com"],
                                  constantValueEnabled: true,
                                },
                              },
                              eventName: "email",
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "TeamCard-1-cta",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "View Profile",
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
                    type: "TeamCard",
                    props: {
                      id: "TeamCard-2",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-secondary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "TeamCard-2-image",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://placehold.co/80x80",
                                    height: 80,
                                    width: 80,
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                aspectRatio: 1,
                                width: 80,
                              },
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                            },
                          },
                        ],
                        NameSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "TeamCard-2-name",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Team Member 2",
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
                        TitleSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "TeamCard-2-title",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Position 2",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        PhoneSlot: [
                          {
                            type: "PhoneNumbersSlot",
                            props: {
                              id: "TeamCard-2-phone",
                              data: {
                                phoneNumbers: [
                                  {
                                    number: {
                                      field: "",
                                      constantValue: "+18005552222",
                                      constantValueEnabled: true,
                                    },
                                    label: {
                                      en: "Phone",
                                      hasLocalizedValue: "true",
                                    },
                                  },
                                ],
                              },
                              styles: {
                                phoneFormat: "domestic",
                                includePhoneHyperlink: true,
                              },
                              eventName: "phone",
                            },
                          },
                        ],
                        EmailSlot: [
                          {
                            type: "EmailsSlot",
                            props: {
                              id: "TeamCard-2-email",
                              data: {
                                list: {
                                  field: "",
                                  constantValue: ["team2@example.com"],
                                  constantValueEnabled: true,
                                },
                              },
                              eventName: "email",
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "TeamCard-2-cta",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "View Profile",
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
                    type: "TeamCard",
                    props: {
                      id: "TeamCard-3",
                      styles: {
                        backgroundColor: {
                          bgColor: "bg-palette-secondary-light",
                          textColor: "text-black",
                        },
                      },
                      slots: {
                        ImageSlot: [
                          {
                            type: "ImageSlot",
                            props: {
                              id: "TeamCard-3-image",
                              data: {
                                image: {
                                  field: "",
                                  constantValue: {
                                    url: "https://placehold.co/80x80",
                                    height: 80,
                                    width: 80,
                                  },
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                aspectRatio: 1,
                                width: 80,
                              },
                              sizes: {
                                base: "calc(100vw - 32px)",
                                lg: "calc(maxWidth * 0.45)",
                              },
                            },
                          },
                        ],
                        NameSlot: [
                          {
                            type: "HeadingTextSlot",
                            props: {
                              id: "TeamCard-3-name",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Team Member 3",
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
                        TitleSlot: [
                          {
                            type: "BodyTextSlot",
                            props: {
                              id: "TeamCard-3-title",
                              data: {
                                text: {
                                  field: "",
                                  constantValue: "Position 3",
                                  constantValueEnabled: true,
                                },
                              },
                              styles: {
                                variant: "base",
                              },
                            },
                          },
                        ],
                        PhoneSlot: [
                          {
                            type: "PhoneNumbersSlot",
                            props: {
                              id: "TeamCard-3-phone",
                              data: {
                                phoneNumbers: [
                                  {
                                    number: {
                                      field: "",
                                      constantValue: "+18005553333",
                                      constantValueEnabled: true,
                                    },
                                    label: {
                                      en: "Phone",
                                      hasLocalizedValue: "true",
                                    },
                                  },
                                ],
                              },
                              styles: {
                                phoneFormat: "domestic",
                                includePhoneHyperlink: true,
                              },
                              eventName: "phone",
                            },
                          },
                        ],
                        EmailSlot: [
                          {
                            type: "EmailsSlot",
                            props: {
                              id: "TeamCard-3-email",
                              data: {
                                list: {
                                  field: "",
                                  constantValue: ["team3@example.com"],
                                  constantValueEnabled: true,
                                },
                              },
                              eventName: "email",
                            },
                          },
                        ],
                        CTASlot: [
                          {
                            type: "CTASlot",
                            props: {
                              id: "TeamCard-3-cta",
                              data: {
                                entityField: {
                                  field: "",
                                  constantValue: {
                                    label: "View Profile",
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
        scope: "teamSection",
      },
      liveVisibility: true,
    },
    version: 34,
  },
  {
    name: "version 59 with showSectionHeading, showImage, showCTA false",
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
            ...version59Props.slots.CardsWrapperSlot?.[0],
            props: {
              ...version59Props.slots.CardsWrapperSlot?.[0].props,
              styles: {
                ...version59Props.slots.CardsWrapperSlot?.[0].props.styles,
                showImage: false,
                showCTA: false,
              },
            },
          },
        ],
      },
    },
    version: 59,
  },
  {
    name: "version 59 with showTitle, showPhone, showEmail false",
    document: { locale: "en" },
    props: {
      ...version59Props,
      slots: {
        ...version59Props.slots,
        CardsWrapperSlot: [
          {
            ...version59Props.slots.CardsWrapperSlot?.[0],
            props: {
              ...version59Props.slots.CardsWrapperSlot?.[0].props,
              styles: {
                ...version59Props.slots.CardsWrapperSlot?.[0].props.styles,
                showTitle: false,
                showPhone: false,
                showEmail: false,
              },
            },
          },
        ],
      },
    },
    version: 59,
  },
];

describe("TeamSection", async () => {
  const puckConfig: Config = {
    components: { TeamSection, ...SlotsCategoryComponents },
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
              type: "TeamSection",
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

      await expect(`TeamSection/[${viewportName}] ${name}`).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `TeamSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
