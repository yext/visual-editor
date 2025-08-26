import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";
import { ExpandedFooter, validPatterns } from "./ExpandedFooter.tsx";

const testLogoUrl: string = "https://placehold.co/100";

const testFooterLink = {
  linkType: "URL" as const,
  label: { en: "Footer Link", hasLocalizedValue: "true" as const },
  link: "#",
};

const testFooterLinks = [
  testFooterLink,
  testFooterLink,
  testFooterLink,
  testFooterLink,
];

const tests: ComponentTest[] = [
  {
    name: "default props",
    document: {},
    props: { ...ExpandedFooter.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 10 props",
    document: {},
    props: {
      data: {
        primaryFooter: {
          logo: testLogoUrl,
          footerLinks: testFooterLinks,
          xLink: "",
          facebookLink: "",
          instagramLink: "",
          pinterestLink: "",
          linkedInLink: "",
          youtubeLink: "",
          tiktokLink: "",
          utilityImages: [],
          expandedFooter: false,
          expandedFooterLinks: [
            {
              label: "Footer Label",
              links: testFooterLinks,
            },
            {
              label: "Footer Label",
              links: testFooterLinks,
            },
            {
              label: "Footer Label",
              links: testFooterLinks,
            },
            {
              label: "Footer Label",
              links: testFooterLinks,
            },
          ],
        },
        secondaryFooter: {
          show: false,
          copyrightMessage: { en: "", hasLocalizedValue: "true" },
          secondaryFooterLinks: testFooterLinks,
        },
      },
      styles: {
        primaryFooter: {
          logo: {
            width: 0,
            aspectRatio: 1.78,
          },
          utilityImages: {
            width: 0,
            aspectRatio: 1,
          },
          backgroundColor: {
            bgColor: "bg-palette-primary-dark",
            textColor: "text-white",
          },
          linksAlignment: "right",
        },
        secondaryFooter: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          linksAlignment: "left",
        },
      },
      analytics: {
        scope: "expandedFooter",
      },
    },
    version: 10,
  },
  {
    name: "version 10 props - expanded",
    document: {},
    props: {
      data: {
        primaryFooter: {
          logo: testLogoUrl,
          footerLinks: testFooterLinks,
          xLink: "https://x.com/yext",
          facebookLink: "https://facebook.com/yext",
          instagramLink: "https://instagram.com/yext",
          pinterestLink: "https://pinterest.com/yext",
          linkedInLink: "https://linkedin.com/in/yext",
          youtubeLink: "https://youtube.com/c/yext",
          tiktokLink: "https://tiktok.com/@yext",
          utilityImages: [
            { url: "https://placehold.co/20", linkTarget: "https://yext.com" },
            { url: "https://placehold.co/50x20" },
          ],
          expandedFooter: true,
          expandedFooterLinks: [
            {
              label: "Footer Label LONG LONG LONG",
              links: testFooterLinks,
            },
            {
              label: "Footer Label",
              links: [
                testFooterLink,
                {
                  linkType: "URL",
                  label: {
                    en: "Footer Link LONG LONG LONG LONG",
                    hasLocalizedValue: "true",
                  },
                  link: "#",
                },
                ...testFooterLinks,
              ],
            },
            {
              label: "Footer Label",
              links: testFooterLinks,
            },
          ],
        },
        secondaryFooter: {
          show: true,
          copyrightMessage: { en: "Copyright 2025", hasLocalizedValue: "true" },
          secondaryFooterLinks: testFooterLinks,
        },
      },
      styles: {
        primaryFooter: {
          logo: { width: 200, aspectRatio: 4 },
          utilityImages: { width: 50, aspectRatio: 1.78 },
          backgroundColor: {
            bgColor: "bg-palette-primary-dark",
            textColor: "text-white",
          },
          linksAlignment: "right",
        },
        secondaryFooter: {
          backgroundColor: {
            bgColor: "bg-palette-tertiary-light",
            textColor: "text-black",
          },
          linksAlignment: "right",
        },
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 10,
  },
  {
    name: "version 10 props - no data",
    document: {},
    props: {
      data: {
        primaryFooter: {
          logo: "",
          footerLinks: [],
          xLink: "",
          facebookLink: "",
          instagramLink: "",
          pinterestLink: "",
          linkedInLink: "",
          youtubeLink: "",
          tiktokLink: "",
          utilityImages: [],
          expandedFooter: false,
          expandedFooterLinks: [],
        },
        secondaryFooter: {
          show: true,
          copyrightMessage: { en: "", hasLocalizedValue: "true" },
          secondaryFooterLinks: [],
        },
      },
      styles: {
        primaryFooter: {
          logo: { width: undefined, aspectRatio: 1 },
          utilityImages: { width: undefined, aspectRatio: 1 },
          backgroundColor: {
            bgColor: "bg-white",
            textColor: "text-black",
          },
          linksAlignment: "right",
        },
        secondaryFooter: {
          backgroundColor: {
            bgColor: "bg-white",
            textColor: "text-black",
          },
          linksAlignment: "right",
        },
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 10,
  },
  {
    name: "version 19 props - expanded",
    document: {},
    props: {
      data: {
        primaryFooter: {
          logo: testLogoUrl,
          footerLinks: testFooterLinks,
          xLink: "https://x.com/yext",
          facebookLink: "https://facebook.com/yext",
          instagramLink: "",
          pinterestLink: "",
          linkedInLink: "",
          youtubeLink: "",
          tiktokLink: "",
          utilityImages: [
            {
              url: "https://placehold.co/20",
              linkTarget: "https://yext.com",
            },
          ],
          expandedFooter: true,
          expandedFooterLinks: [
            {
              label: {
                en: "Footer Label",
                hasLocalizedValue: "true",
              },
              links: testFooterLinks,
            },
            {
              label: {
                en: "Footer Label",
                hasLocalizedValue: "true",
              },
              links: testFooterLinks,
            },
            {
              label: {
                en: "Footer Label",
                hasLocalizedValue: "true",
              },
              links: testFooterLinks,
            },
            {
              label: {
                en: "Footer Label",
                hasLocalizedValue: "true",
              },
              links: testFooterLinks,
            },
          ],
        },
        secondaryFooter: {
          show: true,
          copyrightMessage: {
            en: "",
            hasLocalizedValue: "true",
          },
          secondaryFooterLinks: testFooterLinks,
        },
      },
      styles: {
        primaryFooter: {
          logo: {
            width: 0,
            aspectRatio: 1.78,
          },
          utilityImages: {
            width: 0,
            aspectRatio: 1,
          },
          backgroundColor: {
            bgColor: "bg-palette-primary-dark",
            textColor: "text-white",
          },
          linksAlignment: "right",
        },
        secondaryFooter: {
          backgroundColor: {
            bgColor: "bg-palette-primary-light",
            textColor: "text-black",
          },
          linksAlignment: "left",
        },
        maxWidth: "theme",
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 19,
  },
  {
    name: "version 20 props - expanded",
    document: {},
    props: {
      data: {
        primaryFooter: {
          logo: {
            url: "https://placehold.co/100",
            width: 100,
            height: 100,
            alternateText: { en: "Logo", hasLocalizedValue: "true" },
          },
          footerLinks: [
            testFooterLink,
            testFooterLink,
            testFooterLink,
            testFooterLink,
            testFooterLink,
          ],
          xLink: "https://x.com/yext",
          facebookLink: "https://facebook.com/yext",
          instagramLink: "https://instagram.com/yext",
          pinterestLink: "https://pinterest.com/yext",
          linkedInLink: "https://linkedin.com/in/yext",
          youtubeLink: "https://youtube.com/c/yext",
          tiktokLink: "https://tiktok.com/@yext",
          utilityImages: [
            {
              image: {
                url: "https://placehold.co/20",
                width: 20,
                height: 20,
                alternateText: {
                  en: "Placeholder 1",
                  hasLocalizedValue: "true",
                },
              },
              linkTarget: "https://yext.com",
            },
            {
              image: {
                url: "https://placehold.co/50x20",
                width: 50,
                height: 20,
                alternateText: {
                  hasLocalizedValue: "true",
                },
              },
            },
          ],
          expandedFooter: true,
          expandedFooterLinks: [
            {
              label: "Footer Label LONG LONG LONG",
              links: [testFooterLink, testFooterLink],
            },
            {
              label: "Footer Label",
              links: [
                testFooterLink,
                {
                  linkType: "URL",
                  label: {
                    en: "Footer Link LONG LONG LONG LONG",
                    hasLocalizedValue: "true",
                  },
                  link: "#",
                },
                testFooterLink,
                testFooterLink,
                testFooterLink,
              ],
            },
            {
              label: "Footer Label",
              links: [testFooterLink, testFooterLink, testFooterLink],
            },
          ],
        },
        secondaryFooter: {
          show: true,
          copyrightMessage: { en: "Copyright 2025", hasLocalizedValue: "true" },
          secondaryFooterLinks: [
            testFooterLink,
            testFooterLink,
            testFooterLink,
            testFooterLink,
          ],
        },
      },
      styles: {
        primaryFooter: {
          logo: { width: 200, aspectRatio: 4 },
          utilityImages: { width: 50, aspectRatio: 1.78 },
          backgroundColor: {
            bgColor: "bg-palette-secondary-light",
            textColor: "text-black",
          },
          linksAlignment: "right",
        },
        secondaryFooter: {
          backgroundColor: {
            bgColor: "bg-white",
            textColor: "text-black",
          },
          linksAlignment: "right",
        },
        maxWidth: "full",
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 20,
  },
];

const socialLinkTestCases = [
  {
    name: "valid social links",
    links: {
      xLink: "https://x.com/yext",
      facebookLink: "https://facebook.com/yext",
      instagramLink: "https://instagram.com/yext",
      pinterestLink: "https://pinterest.com/yext",
      linkedInLink: "https://linkedin.com/in/yext",
      youtubeLink: "https://youtube.com/c/yext",
      tiktokLink: "https://tiktok.com/@yext",
    },
    expected: true,
  },
  {
    name: "invalid social links",
    links: {
      xLink: "http://x.com/",
      facebookLink: "facebook.com/",
      instagramLink: "not-a-link",
      pinterestLink: "pinterest.com/yext",
      linkedInLink: "linkedin.com/yext",
      youtubeLink: "https://youtube.com/",
      tiktokLink: "https://tiktok.com/",
    },
    expected: false,
  },
];

describe("ExpandedFooter", async () => {
  const puckConfig: Config = {
    components: { ExpandedFooter },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      },
    },
  };

  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({
      name,
      document,
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
              type: "ExpandedFooter",
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
        `ExpandedFooter/[${viewportName}] ${name}`
      ).toMatchScreenshot({ useFullPage: true });
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `ExpandedFooter/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
  it.each(socialLinkTestCases)(
    "should validate $name",
    ({ links, expected }) => {
      for (const [key, regex] of Object.entries(validPatterns)) {
        const result = regex.test(links[key as keyof typeof links] || "");
        expect(result).toBe(expected);
      }
    }
  );
});
