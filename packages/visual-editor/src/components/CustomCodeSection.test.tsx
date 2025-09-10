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
      name: "Galaxy Restaurant",
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
        <button onclick="showName(this)">
          Show Restaurant Name 
        </button>
        <ul class="product-list">
          {{#each c_exampleProducts.products}}
            <li class="product-item">
              <strong>{{name}}</strong>
              {{#if image.url}}
                <br />
                <img src="{{image.url}}" class="product-img" />
              {{/if}}
              {{#if description.html}}
                <div class="product-desc">{{{description.html}}}</div>
              {{/if}}
            </li>
          {{/each}}
        </ul>
      `,
      javascript: `
        function showName(el) {
          el.textContent = {{name}};
        }
      `,
    },
    version: migrationRegistry.length,
    interactions: async (page) => {
      await page.getByRole("button", { name: "Show Restaurant Name" }).click();
    },
  },
];

describe("CustomCodeSection", async () => {
  const puckConfig: Config = {
    components: { CustomCodeSection },
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
      ).toMatchScreenshot({ useFullPage: true });
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
