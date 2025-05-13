import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, viewports } from "../WCAG/WCAG.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { InsightSection, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("InsightSection $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { InsightSection },
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
                type: "InsightSection",
                props: { id: "abc", ...InsightSection.defaultProps },
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

  it("should pass wcag with insights", async () => {
    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: {
            c_insightsSection: {
              insights: [
                {
                  image: {
                    url: "https://placehold.co/600x400",
                    width: 600,
                    height: 400,
                  },
                  name: "Insight 1",
                  category: "Category 1",
                  publishTime: "2025-05-12T13:00:00Z",
                  description: { html: "<strong>Test</strong> RTF" },
                  cta: {
                    link: "https://yext.com",
                    label: "Learn More",
                    linkType: "URL",
                  },
                },
                {
                  name: "Insight 2",
                  category: "Category 2",
                  publishTime: "invalid date",
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
                type: "InsightSection",
                props: {
                  id: "abc",
                  ...InsightSection.defaultProps,
                  data: {
                    ...InsightSection.defaultProps!.data,
                    insights: {
                      field: "c_insightsSection",
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
