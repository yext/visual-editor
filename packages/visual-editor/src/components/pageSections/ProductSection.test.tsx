import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, viewports } from "../WCAG/WCAG.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { ProductSection, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("ProductSection $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { ProductSection },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };
  it("should pass wcag with default props", async () => {
    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document: {} }}>
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "ProductSection",
                props: { id: "abc", ...ProductSection.defaultProps },
              },
            ],
          }}
        />
      </VisualEditorProvider>
    );

    await page.viewport(width, height);
    await page.screenshot();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("should pass wcag with products", async () => {
    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: {
            c_productsSection: {
              products: [
                {
                  image: {
                    url: "https://placehold.co/600x400",
                    width: 600,
                    height: 400,
                  },
                  name: "Product 1",
                  category: "Category 1",
                  description: { html: "<strong>Test</strong> RTF" },
                  cta: {
                    link: "https://yext.com",
                    label: "Learn More",
                    linkType: "URL",
                  },
                },
                {
                  name: "Product 2",
                  category: "Category 2",
                  description: "This is normal text",
                },
              ],
            },
          },
        }}
      >
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "ProductSection",
                props: {
                  id: "abc",
                  ...ProductSection.defaultProps,
                  data: {
                    ...ProductSection.defaultProps!.data,
                    products: {
                      field: "c_productsSection",
                      constantValue: {},
                    },
                  },
                },
              },
            ],
          }}
        />
      </VisualEditorProvider>
    );

    await page.viewport(width, height);
    await page.screenshot();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
