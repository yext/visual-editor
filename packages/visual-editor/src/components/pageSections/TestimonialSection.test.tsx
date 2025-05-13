import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, viewports } from "../WCAG/WCAG.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { TestimonialSection, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("TestimonialSection $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { TestimonialSection },
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
                type: "TestimonialSection",
                props: { id: "abc", ...TestimonialSection.defaultProps },
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

  it("should pass wcag with testimonials", async () => {
    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: {
            c_testimonialsSection: {
              testimonials: [
                {
                  description: {
                    html: "<strong>Great service!</strong> I had an amazing experience.",
                  },
                  contributorName: "John Doe",
                  contributionDate: "2024-03-20",
                },
                {
                  description: "Very satisfied with the results.",
                  contributorName: "Jane Smith",
                  contributionDate: "2024-03-19",
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
                type: "TestimonialSection",
                props: {
                  id: "abc",
                  ...TestimonialSection.defaultProps,
                  data: {
                    ...TestimonialSection.defaultProps!.data,
                    testimonials: {
                      field: "c_testimonialsSection",
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
