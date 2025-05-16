import * as React from "react";
import { describe, it, expect } from "vitest";
import { render as reactRender } from "@testing-library/react";
import { PersonCard, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { axe, viewports } from "../testing/componentTests.setup.ts";
import { page } from "@vitest/browser/context";

describe.each(viewports)("PersonCard $name", ({ width, height }) => {
  const puckConfig: Config = {
    components: { PersonCard },
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
                type: "PersonCard",
                props: { id: "abc", ...PersonCard.defaultProps },
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
