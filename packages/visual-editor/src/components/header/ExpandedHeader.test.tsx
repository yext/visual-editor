import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { act, render as reactRender, waitFor } from "@testing-library/react";
import {
  backgroundColors,
  BannerSection,
  ExpandedHeader,
  migrate,
  migrationRegistry,
  SlotsCategoryComponents,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config, resolveAllData } from "@measured/puck";
import { page } from "@vitest/browser/context";
import { defaultBannerProps } from "../pageSections/Banner.tsx";

const defaultMainLinkV0 = {
  linkType: "URL" as const,
  label: { en: "Main Header Link", hasLocalizedValue: "true" as const },
  link: "#",
};
const defaultSecondaryLinkV0 = {
  linkType: "URL" as const,
  label: { en: "Secondary Header Link", hasLocalizedValue: "true" as const },
  link: "#",
};

const tests: ComponentTest[] = [
  {
    name: "default props",
    document: {},
    props: { ...ExpandedHeader.defaultProps },
    version: migrationRegistry.length,
    interactions: async (page) => {
      const mobileMenuButton = page.getByLabelText("Open menu");
      await act(async () => {
        await mobileMenuButton.click();
      });
    },
  },
  {
    name: "version 10 props",
    document: {},
    props: {
      data: {
        primaryHeader: {
          logo: "https://placehold.co/100",
          links: [defaultMainLinkV0, defaultMainLinkV0, defaultMainLinkV0],
          primaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          secondaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          showPrimaryCTA: true,
          showSecondaryCTA: true,
        },
        secondaryHeader: {
          show: false,
          showLanguageDropdown: false,
          secondaryLinks: [
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
          ],
        },
      },
      styles: {
        primaryHeader: {
          logo: {
            width: undefined,
            aspectRatio: 2,
          },
          backgroundColor: backgroundColors.background1.value,
          primaryCtaVariant: "primary",
          secondaryCtaVariant: "secondary",
        },
        secondaryHeader: {
          backgroundColor: backgroundColors.background2.value,
        },
      },
      analytics: {
        scope: "expandedHeader",
      },
    },
    version: 10,
    interactions: async (page) => {
      const mobileMenuButton = page.getByLabelText("Open menu");
      await act(async () => {
        await mobileMenuButton.click();
      });
    },
  },
  {
    name: "version 10 props - narrow viewport",
    document: {},
    props: {
      data: {
        primaryHeader: {
          logo: "https://placehold.co/100",
          links: [defaultMainLinkV0, defaultMainLinkV0, defaultMainLinkV0],
          primaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          secondaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          showPrimaryCTA: true,
          showSecondaryCTA: true,
        },
        secondaryHeader: {
          show: false,
          showLanguageDropdown: false,
          secondaryLinks: [
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
          ],
        },
      },
      styles: {
        primaryHeader: {
          logo: {
            width: undefined,
            aspectRatio: 2,
          },
          backgroundColor: backgroundColors.background1.value,
          primaryCtaVariant: "primary",
          secondaryCtaVariant: "secondary",
        },
        secondaryHeader: {
          backgroundColor: backgroundColors.background2.value,
        },
      },
      analytics: {
        scope: "expandedHeader",
      },
    },
    version: 10,
    interactions: async (page) => {
      const mobileMenuButton = page.getByLabelText("Open menu");
      await act(async () => {
        await mobileMenuButton.click();
      });
    },
    viewport: {
      name: "narrow",
      width: 900,
      height: 900,
    },
  },
  {
    name: "version 10 props - no data",
    document: {},
    props: {
      data: {
        primaryHeader: {
          logo: "https://placehold.co/100",
          links: [],
          primaryCTA: {
            label: { en: "", hasLocalizedValue: "true" },
            link: "",
            linkType: "URL",
          },
          secondaryCTA: {
            label: { en: "", hasLocalizedValue: "true" },
            link: "",
            linkType: "URL",
          },
          showPrimaryCTA: true,
          showSecondaryCTA: true,
        },
        secondaryHeader: {
          show: false,
          showLanguageDropdown: false,
          secondaryLinks: [],
        },
      },
      styles: {
        primaryHeader: {
          logo: {
            width: undefined,
            aspectRatio: 2,
          },
          backgroundColor: backgroundColors.background7.value,
          primaryCtaVariant: "link",
          secondaryCtaVariant: "primary",
        },
        secondaryHeader: {
          backgroundColor: backgroundColors.background6.value,
        },
      },
      analytics: {
        scope: "expandedHeader",
      },
    },
    version: 10,
  },
  {
    name: "version 10 props - secondary header",
    document: {},
    props: {
      data: {
        primaryHeader: {
          logo: "https://placehold.co/100",
          links: [defaultMainLinkV0, defaultMainLinkV0, defaultMainLinkV0],
          primaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          secondaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          showPrimaryCTA: false,
          showSecondaryCTA: false,
        },
        secondaryHeader: {
          show: true,
          showLanguageDropdown: false,
          secondaryLinks: [
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
          ],
        },
      },
      styles: {
        primaryHeader: {
          logo: {
            width: 100,
            aspectRatio: 1,
          },
          backgroundColor: backgroundColors.background6.value,
          primaryCtaVariant: "primary",
          secondaryCtaVariant: "secondary",
        },
        secondaryHeader: {
          backgroundColor: backgroundColors.background7.value,
        },
      },
      analytics: {
        scope: "expandedHeader",
      },
    },
    version: 10,
    interactions: async (page) => {
      const mobileMenuButton = page.getByLabelText("Open menu");
      await act(async () => {
        await mobileMenuButton.click();
      });
    },
  },
  {
    name: "version 11 props - secondary header",
    document: {},
    props: {
      data: {
        primaryHeader: {
          logo: "https://placehold.co/100",
          links: [defaultMainLinkV0, defaultMainLinkV0, defaultMainLinkV0],
          primaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          secondaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          showPrimaryCTA: false,
          showSecondaryCTA: false,
        },
        secondaryHeader: {
          show: true,
          showLanguageDropdown: false,
          secondaryLinks: [
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
          ],
        },
      },
      styles: {
        primaryHeader: {
          logo: {
            width: 100,
            aspectRatio: 1,
          },
          backgroundColor: backgroundColors.background6.value,
          primaryCtaVariant: "primary",
          secondaryCtaVariant: "secondary",
        },
        secondaryHeader: {
          backgroundColor: backgroundColors.background7.value,
        },
        maxWidth: "full",
      },
      analytics: {
        scope: "expandedHeader",
      },
    },
    version: 11,
    interactions: async (page) => {
      const mobileMenuButton = page.getByLabelText("Open menu");
      await act(async () => {
        await mobileMenuButton.click();
      });
    },
  },
  {
    name: "version 15 props - sticky header",
    document: {},
    props: {
      data: {
        primaryHeader: {
          logo: "https://placehold.co/100",
          links: [defaultMainLinkV0, defaultMainLinkV0, defaultMainLinkV0],
          primaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          secondaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          showPrimaryCTA: false,
          showSecondaryCTA: false,
        },
        secondaryHeader: {
          show: true,
          showLanguageDropdown: false,
          secondaryLinks: [
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
          ],
        },
      },
      styles: {
        primaryHeader: {
          logo: {
            width: 100,
            aspectRatio: 1,
          },
          backgroundColor: backgroundColors.background6.value,
          primaryCtaVariant: "primary",
          secondaryCtaVariant: "secondary",
        },
        secondaryHeader: {
          backgroundColor: backgroundColors.background7.value,
        },
        maxWidth: "full",
        headerPosition: "sticky",
      },
      analytics: {
        scope: "expandedHeader",
      },
    },
    version: 15,
    interactions: async (page) => {
      const mobileMenuButton = page.getByLabelText("Open menu");
      await act(async () => {
        await mobileMenuButton.click();
      });
    },
  },
  {
    name: "version 15 props - fixed header",
    document: {},
    props: {
      data: {
        primaryHeader: {
          logo: "https://placehold.co/100",
          links: [defaultMainLinkV0, defaultMainLinkV0, defaultMainLinkV0],
          primaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          secondaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          showPrimaryCTA: false,
          showSecondaryCTA: false,
        },
        secondaryHeader: {
          show: true,
          showLanguageDropdown: false,
          secondaryLinks: [
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
          ],
        },
      },
      styles: {
        primaryHeader: {
          logo: {
            width: 100,
            aspectRatio: 1,
          },
          backgroundColor: backgroundColors.background6.value,
          primaryCtaVariant: "primary",
          secondaryCtaVariant: "secondary",
        },
        secondaryHeader: {
          backgroundColor: backgroundColors.background7.value,
        },
        maxWidth: "full",
        headerPosition: "fixed",
      },
      analytics: {
        scope: "expandedHeader",
      },
    },
    version: 15,
  },
  {
    name: "version 20 props",
    document: {},
    props: {
      data: {
        primaryHeader: {
          logo: {
            url: "https://placehold.co/100",
            alternateText: { en: "Logo", hasLocalizedValue: "true" },
            width: 100,
            height: 100,
          },
          links: [defaultMainLinkV0, defaultMainLinkV0, defaultMainLinkV0],
          primaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          secondaryCTA: {
            label: { en: "Call to Action", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
          },
          showPrimaryCTA: false,
          showSecondaryCTA: false,
        },
        secondaryHeader: {
          show: true,
          showLanguageDropdown: false,
          secondaryLinks: [
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
            defaultSecondaryLinkV0,
          ],
        },
      },
      styles: {
        primaryHeader: {
          logo: {
            width: 100,
            aspectRatio: 1,
          },
          backgroundColor: backgroundColors.background6.value,
          primaryCtaVariant: "primary",
          secondaryCtaVariant: "secondary",
        },
        secondaryHeader: {
          backgroundColor: backgroundColors.background7.value,
        },
        maxWidth: "full",
        headerPosition: "fixed",
      },
      analytics: {
        scope: "expandedHeader",
      },
    },
    version: 20,
  },
  {
    name: "version 41 props - no secondary header",
    document: {},
    props: {
      styles: {
        maxWidth: "theme",
        headerPosition: "scrollsWithPage",
      },
      slots: {
        PrimaryHeaderSlot: [
          {
            type: "PrimaryHeaderSlot",
            props: {
              styles: {
                backgroundColor: backgroundColors.background3.value,
              },
              slots: {
                LogoSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      data: {
                        image: {
                          field: "",
                          constantValue: {
                            url: "https://placehold.co/100",
                            height: 100,
                            width: 100,
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        aspectRatio: 1,
                        width: 100,
                      },
                    },
                  },
                ],
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Primary Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Primary Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                          },
                        ],
                      },
                      parentData: {
                        type: "Primary",
                      },
                    },
                  },
                ],
                PrimaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: { en: "CTA", hasLocalizedValue: "true" },
                            link: "#",
                            linkType: "URL",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        displayType: "textAndLink",
                        variant: "primary",
                      },
                    },
                  },
                ],
                SecondaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Secondary CTA",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            linkType: "URL",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        displayType: "textAndLink",
                        variant: "secondary",
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        SecondaryHeaderSlot: [
          {
            type: "SecondaryHeaderSlot",
            props: {
              data: {
                show: false,
                showLanguageDropdown: false,
              },
              styles: {
                backgroundColor: backgroundColors.background4.value,
              },
              slots: {
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Secondary Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                          },
                        ],
                      },
                      parentData: {
                        type: "Secondary",
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
        scope: "expandedHeader",
      },
    },
    version: 41,
  },
  {
    name: "version 41 props - with secondary header",
    document: {},
    props: {
      styles: {
        maxWidth: "theme",
        headerPosition: "scrollsWithPage",
      },
      slots: {
        PrimaryHeaderSlot: [
          {
            type: "PrimaryHeaderSlot",
            props: {
              styles: {
                backgroundColor: backgroundColors.background3.value,
              },
              slots: {
                LogoSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      data: {
                        image: {
                          field: "",
                          constantValue: {
                            url: "https://placehold.co/100",
                            height: 100,
                            width: 100,
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        aspectRatio: 1,
                        width: 100,
                      },
                    },
                  },
                ],
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Primary Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                          },
                          {
                            linkType: "URL",
                            label: {
                              en: "Primary Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                          },
                        ],
                      },
                      parentData: {
                        type: "Primary",
                      },
                    },
                  },
                ],
                PrimaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: { en: "CTA", hasLocalizedValue: "true" },
                            link: "#",
                            linkType: "URL",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        displayType: "textAndLink",
                        variant: "primary",
                      },
                    },
                  },
                ],
                SecondaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      data: {
                        show: true,
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Secondary CTA",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                            linkType: "URL",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: {
                        displayType: "textAndLink",
                        variant: "secondary",
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
        SecondaryHeaderSlot: [
          {
            type: "SecondaryHeaderSlot",
            props: {
              data: {
                show: true,
                showLanguageDropdown: false,
              },
              styles: {
                backgroundColor: backgroundColors.background4.value,
              },
              slots: {
                LinksSlot: [
                  {
                    type: "HeaderLinks",
                    props: {
                      data: {
                        links: [
                          {
                            linkType: "URL",
                            label: {
                              en: "Secondary Header Link",
                              hasLocalizedValue: "true",
                            },
                            link: "#",
                          },
                        ],
                      },
                      parentData: {
                        type: "Secondary",
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
        scope: "expandedHeader",
      },
    },
    version: 41,
  },
  {
    name: "version 48 props",
    document: {},
    props: {
      data: {
        primaryHeader: {
          field: "",
          constantValue: {},
          constantValueEnabled: true,
        },
      },
      slots: {
        PrimaryHeaderSlot: [
          {
            type: "PrimaryHeaderSlot",
            props: {
              id: "PrimaryHeaderSlot-v48",
              data: {
                primaryHeader: {
                  field: "",
                  constantValue: {},
                  constantValueEnabled: true,
                },
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-white",
                  textColor: "text-black",
                },
              },
              slots: {
                LogoSlot: [
                  {
                    type: "ImageSlot",
                    props: {
                      id: "LogoSlot-v48",
                      data: {
                        image: {
                          field: "",
                          constantValue: {
                            en: {
                              url: "https://placehold.co/100",
                              height: 100,
                              width: 100,
                              alternateText: "Alt Text",
                            },
                            hasLocalizedValue: "true",
                          },
                          constantValueEnabled: true,
                        },
                      },
                      styles: { aspectRatio: 1, width: 640 },
                    },
                  },
                ],
                PrimaryCTASlot: [
                  {
                    type: "CTASlot",
                    props: {
                      id: "PrimaryCTASlot-v48",
                      data: {
                        entityField: {
                          field: "",
                          constantValue: {
                            label: {
                              en: "Call to Action",
                              hasLocalizedValue: "true",
                            },
                            link: {
                              en: "#",
                              hasLocalizedValue: "true",
                            },
                            linkType: "URL",
                          },
                          constantValueEnabled: true,
                        },
                      },
                    },
                  },
                ],
                SecondaryCTASlot: [],
              },
            },
          },
        ],
        SecondaryHeaderSlot: [],
      },
      analytics: {
        scope: "expandedHeader",
      },
      styles: {
        headerPosition: "static",
      },
    },
    version: 48,
  },
];

describe("ExpandedHeader", async () => {
  const puckConfig: Config = {
    components: { ExpandedHeader, BannerSection, ...SlotsCategoryComponents },
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
      // if the header position is fixed, render another section beneath the header
      const fixedHeader = props.styles.headerPosition === "fixed";
      const content = fixedHeader
        ? [
            {
              type: "ExpandedHeader",
              props: props,
            },
            {
              type: "BannerSection",
              props: defaultBannerProps,
            },
          ]
        : [
            {
              type: "ExpandedHeader",
              props: props,
            },
          ];

      const data = migrate(
        {
          root: {
            props: {
              version,
            },
          },
          content: content,
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
      const images = Array.from(container.querySelectorAll("img"));
      await waitFor(() => {
        expect(images.every((i) => i.complete)).toBe(true);
      });

      await expect(
        `ExpandedHeader/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      // Currently, the header only has interactivity on mobile
      if (interactions && viewportName === "mobile") {
        await interactions(page);
        await expect(
          `ExpandedHeader/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
