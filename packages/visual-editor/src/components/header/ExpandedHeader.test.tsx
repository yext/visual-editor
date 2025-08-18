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
  ExpandedHeader,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

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
          logo: "",
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
];

describe("ExpandedHeader", async () => {
  const puckConfig: Config = {
    components: { ExpandedHeader },
    root: {
      render: ({ children }) => {
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
              type: "ExpandedHeader",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig
      );

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
