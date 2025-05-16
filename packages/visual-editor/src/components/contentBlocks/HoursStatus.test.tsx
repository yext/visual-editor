import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, viewports } from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { HoursStatus, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("HoursStatus $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { HoursStatus },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };

  it("should pass wcag with default props", async () => {
    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: {
            hours: {
              friday: {
                openIntervals: [
                  {
                    end: "22:00",
                    start: "10:00",
                  },
                ],
              },
              monday: {
                openIntervals: [
                  {
                    end: "22:00",
                    start: "10:00",
                  },
                ],
              },
              saturday: {
                openIntervals: [
                  {
                    end: "22:00",
                    start: "10:00",
                  },
                ],
              },
              sunday: {
                openIntervals: [
                  {
                    end: "22:00",
                    start: "10:00",
                  },
                ],
              },
              thursday: {
                openIntervals: [
                  {
                    end: "22:00",
                    start: "10:00",
                  },
                ],
              },
              tuesday: {
                openIntervals: [
                  {
                    end: "22:00",
                    start: "10:00",
                  },
                ],
              },
              wednesday: {
                openIntervals: [
                  {
                    end: "22:00",
                    start: "10:00",
                  },
                ],
              },
            },
          },
        }}
      >
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "HoursStatus",
                props: { id: "abc", ...HoursStatus.defaultProps },
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

  it("should pass wcag with empty document", async () => {
    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: {},
        }}
      >
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "HoursStatus",
                props: { id: "abc", ...HoursStatus.defaultProps },
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
