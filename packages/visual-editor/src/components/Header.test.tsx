import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, testSite, viewports } from "./testing/componentTests.setup.ts";
import { act, render as reactRender, screen } from "@testing-library/react";
import { Header, VisualEditorProvider } from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page, userEvent } from "@vitest/browser/context";

describe.each(viewports)("Header $name", async ({ name, width, height }) => {
  const puckConfig: Config = {
    components: { Header },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };

  it("should pass wcag with default empty document", async () => {
    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document: {} }}>
        <Render
          config={puckConfig}
          data={{
            content: [
              {
                type: "Header",
                props: { id: "abc", ...Header.defaultProps },
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

  if (name === "mobile") {
    it("should pass wcag with a closed mobile menu", async () => {
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
                  type: "Header",
                  props: { id: "abc", ...Header.defaultProps },
                },
              ],
            }}
          />
        </VisualEditorProvider>
      );

      await page.screenshot();
      await page.viewport(width, height);
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      expect(page.getByText("Home")).not.toBeVisible();
      expect(page.getByText("More Info")).not.toBeVisible();
      expect(page.getByText("Call Us")).not.toBeVisible();
      expect(page.getByText("Secondary Link 1")).not.toBeVisible();
      expect(page.getByText("Secondary Link 2")).not.toBeVisible();
      expect(page.getByText("Call To Action 1")).not.toBeVisible();
    });

    it("should pass wcag with a open mobile menu", async () => {
      const user = userEvent.setup();
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
                  type: "Header",
                  props: { id: "abc", ...Header.defaultProps },
                },
              ],
            }}
          />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      await act(async () => {
        await user.click(screen.getByLabelText("Open header menu"));
      });
      await page.screenshot();

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      expect(page.getByText("Home").last()).toBeVisible();
      expect(page.getByText("More Info").last()).toBeVisible();
      expect(page.getByText("Call Us").last()).toBeVisible();
      expect(page.getByText("Secondary Link 1").last()).toBeVisible();
      expect(page.getByText("Secondary Link 2").last()).toBeVisible();
      expect(page.getByText("Call To Action 1").last()).toBeVisible();
      expect(page.getByText("Call To Action 2").last()).not.toBeVisible();
    });
  } else {
    it("should pass wcag on a desktop screen size", async () => {
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
                  type: "Header",
                  props: { id: "abc", ...Header.defaultProps },
                },
              ],
            }}
          />
        </VisualEditorProvider>
      );

      await page.screenshot();
      await page.viewport(width, height);
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      expect(page.getByText("Home")).toBeVisible();
      expect(page.getByText("More Info")).toBeVisible();
      expect(page.getByText("Call Us")).toBeVisible();
      expect(page.getByText("Secondary Link 1")).toBeVisible();
      expect(page.getByText("Secondary Link 2")).toBeVisible();
      expect(page.getByText("Call To Action 1")).toBeVisible();
      expect(page.getByText("Call To Action 2")).toBeVisible();
    });
  }
});
