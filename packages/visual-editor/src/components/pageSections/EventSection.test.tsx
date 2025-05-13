import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, viewports } from "../WCAG/WCAG.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { EventSection, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("EventSection $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { EventSection },
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
                type: "EventSection",
                props: { id: "abc", ...EventSection.defaultProps },
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

  it("should pass wcag with events", async () => {
    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: {
            c_eventsSection: {
              events: [
                {
                  image: {
                    url: "https://placehold.co/600x400",
                    width: 600,
                    height: 400,
                  },
                  title: "Event 1",
                  dateTime: "2025-05-12 13:00:00",
                  description: { html: "<strong>Test</strong> RTF" },
                  cta: {
                    link: "https://yext.com",
                    label: "More Info",
                    linkType: "LINK",
                  },
                },
                {
                  title: "Event 2",
                  dateTime: "invalid date",
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
                type: "EventSection",
                props: {
                  id: "abc",
                  ...EventSection.defaultProps,
                  data: {
                    ...EventSection.defaultProps!.data,
                    events: {
                      field: "c_eventsSection",
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
