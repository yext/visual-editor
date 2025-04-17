import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, testHours, viewports } from "../WCAG/WCAG.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { HoursTable, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("HoursTable $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { HoursTable },
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
            hours: testHours,
            additionalHoursText: "Hours Text",
          },
        }}
      >
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "HoursTable",
                props: { id: "abc", ...HoursTable.defaultProps },
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
                type: "HoursTable",
                props: { id: "abc", ...HoursTable.defaultProps },
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
