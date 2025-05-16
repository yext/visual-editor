import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  viewports,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  BannerSection,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...BannerSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      expect(page.getByText("Banner Text")).toBeVisible();
    },
  },
  {
    name: "version 0 props with entity values",
    document: {
      name: "test",
    },
    props: {
      text: {
        field: "",
        constantValue: "Constant Text",
        constantValueEnabled: true,
      },
      textAlignment: "left",
      backgroundColor: {
        bgColor: "bg-palette-primary-dark",
        textColor: "text-white",
      },
      liveVisibility: true,
    },
    version: 0,
    tests: async (page) => {
      expect(page.getByText("Constant Text")).toBeVisible();
    },
  },
  {
    name: "version 0 props with constant value",
    document: {
      name: "test",
    },
    props: {
      text: {
        field: "name",
        constantValue: "Constant Text",
      },
      textAlignment: "right",
      backgroundColor: {
        bgColor: "bg-palette-secondary-dark",
        textColor: "text-white",
      },
      liveVisibility: true,
    },
    version: 0,
    tests: async (page) => {
      expect(page.getByText("test")).toBeVisible();
    },
  },
];

const testsWithViewports: ComponentTest[] = [
  ...tests.map((t) => ({ ...t, viewport: viewports[0] })),
  ...tests.map((t) => ({ ...t, viewport: viewports[1] })),
];

describe("BannerSection", async () => {
  const puckConfig: Config = {
    components: { BannerSection },
    root: {
      render: ({ children }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(testsWithViewports)(
    "renders $name $viewport.name",
    async ({
      document,
      props,
      tests,
      version,
      viewport: { width, height } = viewports[0],
    }) => {
      const data = migrate(
        {
          root: { version },
          content: [
            {
              type: "BannerSection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig
      );
      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      await page.screenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();
      await tests(page);
    }
  );
});
