import * as React from "react";
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

const version10PlaceholderImage: string = "https://placehold.co/100";

const version10FooterLink = {
  linkType: "URL" as const,
  label: { en: "Footer Link", hasLocalizedValue: "true" as const },
  link: "#",
};

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
          logo: version10PlaceholderImage,
          footerLinks: [
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
          ],
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
              links: [
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
              ],
            },
            {
              label: "Footer Label",
              links: [
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
              ],
            },
            {
              label: "Footer Label",
              links: [
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
              ],
            },
            {
              label: "Footer Label",
              links: [
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
              ],
            },
          ],
        },
        secondaryFooter: {
          show: false,
          copyrightMessage: { en: "", hasLocalizedValue: "true" },
          secondaryFooterLinks: [
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
          ],
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
          logo: "https://placehold.co/100",
          footerLinks: [
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
          ],
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
              links: [version10FooterLink, version10FooterLink],
            },
            {
              label: "Footer Label",
              links: [
                version10FooterLink,
                {
                  linkType: "URL",
                  label: {
                    en: "Footer Link LONG LONG LONG LONG",
                    hasLocalizedValue: "true",
                  },
                  link: "#",
                },
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
              ],
            },
            {
              label: "Footer Label",
              links: [
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
              ],
            },
          ],
        },
        secondaryFooter: {
          show: true,
          copyrightMessage: { en: "Copyright 2025", hasLocalizedValue: "true" },
          secondaryFooterLinks: [
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
          ],
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
    name: "version 11 props - expanded",
    document: {},
    props: {
      data: {
        primaryFooter: {
          logo: "https://placehold.co/100",
          footerLinks: [
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
          ],
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
              links: [version10FooterLink, version10FooterLink],
            },
            {
              label: "Footer Label",
              links: [
                version10FooterLink,
                {
                  linkType: "URL",
                  label: {
                    en: "Footer Link LONG LONG LONG LONG",
                    hasLocalizedValue: "true",
                  },
                  link: "#",
                },
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
              ],
            },
            {
              label: "Footer Label",
              links: [
                version10FooterLink,
                version10FooterLink,
                version10FooterLink,
              ],
            },
          ],
        },
        secondaryFooter: {
          show: true,
          copyrightMessage: { en: "Copyright 2025", hasLocalizedValue: "true" },
          secondaryFooterLinks: [
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
            version10FooterLink,
          ],
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
        maxWidth: "full",
      },
      analytics: { scope: "expandedFooter" },
    },
    version: 10,
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
      render: ({ children }) => {
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
      ).toMatchScreenshot();
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
