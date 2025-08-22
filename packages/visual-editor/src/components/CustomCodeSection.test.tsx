import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "./testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  CustomCodeSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...CustomCodeSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "with custom HTML, CSS, and JS interaction to change color",
    document: {},
    props: {
      ...CustomCodeSection.defaultProps,
      html: `
        <button id="color-btn" onclick="changeColor(this)">
          Change Color
        </button>
      `,
      css: `
        #color-btn {
          background-color: white;
          color: black;
          border: 1px solid #ccc;
          padding: 10px;
        }
      `,
      javascript: `
        function changeColor(el) {
          el.style.cssText = "background-color: darkblue; color: white;";
        }
      `,
    },
    version: migrationRegistry.length,
    interactions: async (page) => {
      await page.getByRole("button", { name: "Change Color" }).click();
    },
  },
  {
    name: "renders Handlebars template with document data",
    document: {
      c_exampleProducts: {
        products: [
          {
            name: "Galaxy Burger",
            image: {
              url: "https://a.mktgcdn.com/p-dev/2NXFA3zTVNQBcc7LCGNdTHp5SZVHIVTz_X9tLVZI6S8/2048x2048.jpg",
            },
            description: { html: "<p>Our signature burger!</p>" },
          },
          {
            name: "Galaxy Salad",
            image: {
              url: "https://a.mktgcdn.com/p-dev/riaolTLcpz-o-o1mImrnaEaeNBs58dqlB7TS2moQgyo/2048x2048.jpg",
            },
          },
        ],
      },
    },
    props: {
      ...CustomCodeSection.defaultProps,
      html: `
        <ul class="product-list">
          {{#each c_exampleProducts.products}}
            <li class="product-item">
              <strong>{{name}}</strong>
              {{#if image.url}}
                <br />
                <img src="{{image.url}}" alt="{{name}}" class="product-img" />
              {{/if}}
              {{#if description.html}}
                <div class="product-desc">{{{description.html}}}</div>
              {{/if}}
            </li>
          {{/each}}
        </ul>
      `,
      css: `
        .product-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }
        .product-item {
          background: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          padding: 1rem;
          max-width: 220px;
          text-align: center;
          flex: 1 1 180px;
        }
        .product-img {
          width: 100%;
          max-width: 180px;
          height: auto;
          border-radius: 6px;
          margin: 0.5rem 0;
        }
        .product-desc {
          font-size: 0.95rem;
          color: #444;
        }
        @media (max-width: 600px) {
          .product-list {
            flex-direction: column;
            gap: 1rem;
          }
          .product-item {
            max-width: 100%;
            width: 100%;
            margin: 0 auto;
          }
          .product-img {
            max-width: 100%;
          }
        }
      `,
    },
    version: migrationRegistry.length,
  },
];

describe("CustomCodeSection", async () => {
  const puckConfig: Config = {
    components: { CustomCodeSection },
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
              type: "CustomCodeSection",
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
        `CustomCodeSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `CustomCodeSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
