import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, viewports } from "../WCAG/WCAG.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { TeamSection, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("TeamSection $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { TeamSection },
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
                type: "TeamSection",
                props: { id: "abc", ...TeamSection.defaultProps },
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

  it("should pass wcag with team members", async () => {
    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: {
            c_teamSection: {
              people: [
                {
                  headshot: {
                    url: "https://placehold.co/600x400",
                  },
                  name: "John Doe",
                  title: "CEO",
                  phoneNumber: "+1-555-555-5555",
                  email: "john@example.com",
                  cta: {
                    link: "https://yext.com",
                    label: "Learn More",
                    linkType: "URL",
                  },
                },
                {
                  name: "Jane Smith",
                  title: "CTO",
                  phoneNumber: "+1-555-555-5556",
                  email: "jane@example.com",
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
                type: "TeamSection",
                props: {
                  id: "abc",
                  ...TeamSection.defaultProps,
                  data: {
                    ...TeamSection.defaultProps!.data,
                    people: {
                      field: "c_teamSection",
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
