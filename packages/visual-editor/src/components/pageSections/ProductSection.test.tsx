import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  viewports,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  ProductSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const productsData = {
  products: [
    {
      category: "Burgers",
      cta: {
        label: "Order Now",
        link: "order",
        linkType: "OTHER",
      },
      description: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Our signature burger! A juicy beef patty topped with melted cheese, crisp lettuce, ripe tomato, and our special Galaxy sauce, all served on a toasted sesame seed bun.</span></p>',
      },
      image: {
        height: 2048,
        thumbnails: [
          {
            height: 2048,
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
            width: 2048,
          },
          {
            height: 1900,
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/1900x1900.jpg",
            width: 1900,
          },
          {
            height: 619,
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/619x619.jpg",
            width: 619,
          },
          {
            height: 450,
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/450x450.jpg",
            width: 450,
          },
          {
            height: 196,
            url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/196x196.jpg",
            width: 196,
          },
        ],
        url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
        width: 2048,
      },
      name: "Galaxy Burger",
    },
    {
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
      name: "Galaxy Salad",
    },
    {
      category: "Desserts",
      cta: {
        label: "Order Now",
        link: "order",
        linkType: "OTHER",
      },
      description: {
        html: '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Indulge in our decadent milkshake! Thick and creamy, topped with whipped cream, chocolate shavings, and a cherry. The perfect sweet treat.</span></p>',
      },
      name: "Galaxy Milkshake",
    },
  ],
};

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...ProductSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Featured Products")).toBeVisible();
      expect(document.body.textContent).toContain(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      );
    },
  },
  {
    name: "default props with document data",
    document: { c_products: productsData },
    props: { ...ProductSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Featured Products")).toBeVisible();
      expect(document.body.textContent).toContain(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
      );
    },
  },
  {
    name: "version 0 props with entity values",
    document: { c_products: productsData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Products",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        products: {
          field: "c_products",
          constantValue: { products: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
        cardBackgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        headingLevel: 6,
      },
      liveVisibility: true,
    },
    version: 0,
    tests: async (page) => {
      expect(page.getByText("Test Name")).toBeVisible();
      expect(page.getByText("Galaxy Burger")).toBeVisible();
      expect(page.getByText("Burgers")).toBeVisible();
      expect(page.getByText("Order Now").elements()).toHaveLength(2);
      expect(page.getByText("Galaxy Salad")).toBeVisible();
      expect(page.getByText("Galaxy Milkshake")).toBeVisible();
      expect(page.getByText("Desserts")).toBeVisible();
      expect(page.getByText("cherry")).toBeVisible();
    },
  },
  {
    name: "version 0 props with constant value",
    document: { c_products: productsData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Products",
          constantValueEnabled: true,
        },
        products: {
          field: "c_products",
          constantValue: {
            products: [
              {
                name: "Product 1",
                category: "Category",
                description: "Description",
                cta: { label: "CTA" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
        },
        cardBackgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        headingLevel: 2,
      },
      liveVisibility: true,
    },
    version: 0,
    tests: async (page) => {
      expect(page.getByText("Featured Products")).toBeVisible();
      expect(page.getByText("Product 1")).toBeVisible();
      expect(page.getByText("Category")).toBeVisible();
      expect(page.getByText("Description")).toBeVisible();
      expect(page.getByText("CTA")).toBeVisible();
    },
  },
  {
    name: "version 7 props with entity values",
    document: { c_products: productsData, name: "Test Name" },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Products",
          constantValueEnabled: false,
          constantValueOverride: {},
        },
        products: {
          field: "c_products",
          constantValue: { products: [] },
          constantValueEnabled: false,
          constantValueOverride: {},
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
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
    tests: async (page) => {
      expect(page.getByText("Test Name")).toBeVisible();
      expect(page.getByText("Galaxy Burger")).toBeVisible();
      expect(page.getByText("Burgers")).toBeVisible();
      expect(page.getByText("Order Now").elements()).toHaveLength(2);
      expect(page.getByText("Galaxy Salad")).toBeVisible();
      expect(page.getByText("Galaxy Milkshake")).toBeVisible();
      expect(page.getByText("Desserts")).toBeVisible();
      expect(page.getByText("cherry")).toBeVisible();
    },
  },
  {
    name: "version 7 props with constant value",
    document: { c_products: productsData },
    props: {
      data: {
        heading: {
          field: "name",
          constantValue: "Featured Products",
          constantValueEnabled: true,
        },
        products: {
          field: "c_products",
          constantValue: {
            products: [
              {
                name: "Product 1",
                category: "Category",
                description: "Description",
                cta: { label: "CTA" },
              },
            ],
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-light",
          textColor: "text-black",
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
    tests: async (page) => {
      expect(page.getByText("Featured Products")).toBeVisible();
      expect(page.getByText("Product 1")).toBeVisible();
      expect(page.getByText("Category")).toBeVisible();
      expect(page.getByText("Description")).toBeVisible();
      expect(page.getByText("CTA")).toBeVisible();
    },
  },
];

const testsWithViewports: ComponentTest[] = [
  ...tests.map((t) => ({ ...t, viewport: viewports[0] })),
  ...tests.map((t) => ({ ...t, viewport: viewports[1] })),
];

describe("ProductSection", async () => {
  const puckConfig: Config = {
    components: { ProductSection },
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
              type: "ProductSection",
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
