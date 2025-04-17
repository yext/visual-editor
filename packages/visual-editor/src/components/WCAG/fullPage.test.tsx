import * as React from "react";
import { describe, it, expect } from "vitest";
import { render as reactRender } from "@testing-library/react";
import { VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config, ComponentConfig } from "@measured/puck";
import * as allExports from "../index.ts";
import { page } from "@vitest/browser/context";
import { axe, testHours, testSite, viewports } from "./WCAG.setup.ts";

describe.each(viewports)("full page wcag $name", ({ width }) => {
  const components: Record<string, ComponentConfig<any>> = {};
  Object.entries(allExports).forEach(([key, value]) => {
    if (
      typeof value === "object" &&
      "defaultProps" in value &&
      "render" in value
    ) {
      components[key] = value as ComponentConfig<any>;
    }
  });

  const puckConfig: Config = {
    components,
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };
  it("should pass wcag with all elements on page", async () => {
    const data = {
      content: Object.keys(components).map((key) => {
        return {
          type: key,
          props: {
            id: key,
            ...(allExports as any)[key].defaultProps,
          },
        };
      }),
    };

    const { container } = reactRender(
      <VisualEditorProvider
        templateProps={{
          document: {
            hours: testHours,
            _site: testSite,
          },
        }}
      >
        <Render config={puckConfig} data={data} />
      </VisualEditorProvider>
    );

    await page.viewport(width, 8000);
    await page.screenshot();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
