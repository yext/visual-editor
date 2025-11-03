import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  TeamSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
  SlotsCategoryComponents,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@measured/puck";
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
      phoneNumber: "+18005551010",
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
    name: "version 0 props with entity values",
    document: { c_team: teamData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Meet Our Team",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        people: {
          field: "c_team",
          constantValue: { people: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-quaternary-light",
          textColor: "text-black",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        headingLevel: 2,
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 0 props with constant value",
    document: { c_team: teamData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Meet Our Team",
          constantValueEnabled: true,
          constantValueOverride: {},
        },
        people: {
          field: "c_team",
          constantValue: {
            people: [
              {
                name: "Name",
                title: "Title",
                phoneNumber: "8888888888",
                email: "email",
                cta: { label: "CTA" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        headingLevel: 2,
      },
      liveVisibility: true,
    },
    version: 0,
  },
  {
    name: "version 7 props with entity values",
    document: { c_team: teamData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Meet Our Team",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        people: {
          field: "c_team",
          constantValue: { people: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-secondary-light",
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
    name: "version 7 props with constant value",
    document: { c_team: teamData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Meet Our Team",
          constantValueEnabled: true,
          constantValueOverride: {},
        },
        people: {
          field: "c_team",
          constantValue: {
            people: [
              {
                name: "Name",
                title: "Title",
                phoneNumber: "8888888888",
                email: "email",
                cta: { label: "CTA" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-secondary-light",
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
    name: "version 15 props with missing ctaType",
    document: { c_team: teamData },
    props: {
      data: {
        people: {
          field: "c_team",
          constantValue: [
            {
              name: "Name",
              title: "Title",
              phoneNumber: "8888888888",
              email: "email",
              cta: {
                label: "CTA",
                // Missing link, linkType, and ctaType - should be added by migration
              },
            },
            {
              name: "Name 2",
              title: "Title 2",
              phoneNumber: "9999999999",
              email: "email2",
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
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-secondary-light",
            textColor: "text-black",
          },
          headingLevel: 3,
        },
      },
      liveVisibility: true,
    },
    version: 15,
  },
  {
    name: "version 33 props with entity values",
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
                                  constantValue: ["cosmo@galaxygrill.com"],
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
                                    link: "cosmo@galaxygrill.com",
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
    version: 33,
  },
  {
    name: "version 33 props with constant values",
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
    version: 33,
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
