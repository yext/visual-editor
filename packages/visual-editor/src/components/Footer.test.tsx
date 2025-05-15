import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, testSite, viewports } from "./testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { Footer, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("Footer $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { Footer },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };

  it("should pass wcag with footer data", async () => {
    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: { _site: testSite },
        }}
      >
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "Footer",
                props: { id: "abc", ...Footer.defaultProps },
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
      <VisualEditorProvider templateProps={{ document: { _site: testSite } }}>
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "Footer",
                props: { id: "abc", ...Footer.defaultProps },
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
