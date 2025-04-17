import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, viewports } from "./WCAG/WCAG.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { FAQsSection, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("FAQsSection $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { FAQsSection },
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
                type: "FAQsSection",
                props: { id: "abc", ...FAQsSection.defaultProps },
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
