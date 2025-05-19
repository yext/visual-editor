import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, viewports } from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  Address,
  AddressProps,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

describe.each(viewports)("Address $name", ({ width, height }) => {
  const puckConfig: Config<{ Address: AddressProps }> = {
    components: { Address },
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
                type: "Address",
                props: {
                  id: "abc",
                  ...Address.defaultProps,
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

  it("should pass wcag with data present", async () => {
    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document: {} }}>
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "Address",
                props: {
                  id: "abc",
                  showGetDirections: true,
                  address: {
                    field: "",
                    constantValue: {
                      line1: "123 Sesame St",
                      line2: "Apt 101",
                      city: "New York",
                      region: "NY",
                      postalCode: "10001",
                      countryCode: "US",
                    },
                    constantValueEnabled: true,
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
