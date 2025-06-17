import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  viewports,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  PromoSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const promoData = {
  cta: {
    label: "Call to Order",
    link: "+18005551010",
    linkType: "PHONE",
  },
  description: {
    html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span style="color: #59359a;">Our out-of-this-world </span><b><strong style="font-weight: bold; color: #59359a;">burgers</strong></b><span style="color: #59359a;"> and</span><b><strong style="font-weight: bold; color: #59359a;"> fresh salads</strong></b><span style="color: #59359a;"> are a flavor journey you won&#39;t forget. Explore a galaxy of taste, where every ingredient composes a symphony of flavors. Come visit us for a stellar dining experience!</span></p>',
  },
  image: {
    height: 2048,
    thumbnails: [
      {
        height: 2048,
        url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/2048x2048.jpg",
        width: 2048,
      },
      {
        height: 1900,
        url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/1900x1900.jpg",
        width: 1900,
      },
      {
        height: 619,
        url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/619x619.jpg",
        width: 619,
      },
      {
        height: 450,
        url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/450x450.jpg",
        width: 450,
      },
      {
        height: 196,
        url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/196x196.jpg",
        width: 196,
      },
    ],
    url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/2048x2048.jpg",
    width: 2048,
  },
  title: "Taste the universe!",
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...PromoSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Featured Promotion")).toBeVisible();
      expect(
        page.getByText(
          "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters"
        )
      ).toBeVisible();
      expect(page.getByText("Learn More")).toBeVisible();
    },
  },
  {
    name: "default props with document data",
    document: { c_promo: promoData },
    props: { ...PromoSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Featured Promotion")).toBeVisible();
      expect(
        page.getByText(
          "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters"
        )
      ).toBeVisible();
      expect(page.getByText("Learn More")).toBeVisible();
    },
  },
  {
    name: "version 0 props with entity values",
    document: { c_promo: promoData },
    props: {
      data: {
        promo: {
          field: "c_promo",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            title: "Title",
            description: "Description",
            cta: { label: "Call To Action", link: "#", linkType: "URL" },
          },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-white",
          textColor: "text-black",
        },
        orientation: "right",
        ctaVariant: "secondary",
      },
      liveVisibility: true,
    },
    version: 0,
    tests: async (page) => {
      expect(page.getByText("Taste the universe!")).toBeVisible();
      expect(page.getByText("Call to Order")).toBeVisible();
      expect(page.getByText("out-of-this-world")).toBeVisible();
    },
  },
  {
    name: "version 0 props with constant value",
    document: { c_promo: promoData },
    props: {
      data: {
        promo: {
          constantValueOverride: {
            image: true,
            title: true,
            description: true,
            cta: true,
          },
          field: "c_promo",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            title: "Title",
            description: "Description",
            cta: { label: "Call To Action", link: "#", linkType: "URL" },
          },
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        orientation: "right",
        ctaVariant: "secondary",
      },
      liveVisibility: true,
    },
    version: 0,
    tests: async (page) => {
      expect(page.getByText("Title")).toBeVisible();
      expect(page.getByText("Description")).toBeVisible();
      expect(page.getByText("Call to Action")).toBeVisible();
    },
  },
  {
    name: "version 5 props with constant value",
    document: { c_promo: promoData },
    props: {
      data: {
        promo: {
          field: "c_promo",
          constantValue: {
            image: {
              height: 360,
              width: 640,
              url: "https://placehold.co/640x360",
            },
            title: { en: "Featured Promotion" },
            description: {
              en: "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters",
            },
            cta: {
              label: { en: "Learn More" },
              link: "#",
              linkType: "URL",
            },
          },
          constantValueEnabled: true,
          constantValueOverride: {
            image: true,
            title: true,
            description: true,
            cta: true,
          },
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        orientation: "right",
        ctaVariant: "secondary",
        heading: {
          level: 2,
          align: "left",
        },
      },
      liveVisibility: true,
    },
    version: 5,
    tests: async (page) => {
      expect(page.getByText("Featured Promotion")).toBeVisible();
      expect(page.getByText("Lorem ipsum dolor sit amet")).toBeVisible();
      expect(page.getByText("Learn More")).toBeVisible();
    },
  },
];

const testsWithViewports: ComponentTest[] = [
  ...tests.map((t) => ({ ...t, viewport: viewports[0] })),
  ...tests.map((t) => ({ ...t, viewport: viewports[1] })),
];

describe("PromoSection", async () => {
  const puckConfig: Config = {
    components: { PromoSection },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(testsWithViewports)(
    "renders $name $viewport.name",
    async ({
      document,
      props,
      tests,
      version,
      viewport: { width, height } = viewports[0],
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
              type: "PromoSection",
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
      await page.screenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      await tests(page);
    }
  );
});
