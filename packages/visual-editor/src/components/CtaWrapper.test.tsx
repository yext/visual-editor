import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, viewports } from "./WCAG/WCAG.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { CTAWrapper, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("CTAWrapper $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { CTAWrapper },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };

  it("should pass wcag with primary variant", async () => {
    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document: {} }}>
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "CTAWrapper",
                props: { id: "abc", ...CTAWrapper.defaultProps },
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

  it("should pass wcag with secondary variant", async () => {
    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document: {} }}>
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "CTAWrapper",
                props: {
                  id: "abc",
                  ...CTAWrapper.defaultProps,
                  variant: "secondary",
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

  it("should pass wcag with link variant", async () => {
    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document: {} }}>
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "CTAWrapper",
                props: {
                  id: "abc",
                  ...CTAWrapper.defaultProps,
                  variant: "link",
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
