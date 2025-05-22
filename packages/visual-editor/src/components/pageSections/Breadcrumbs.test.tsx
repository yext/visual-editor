import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  viewports,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  BreadcrumbsSection,
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
    props: { ...BreadcrumbsSection.defaultProps },
    version: migrationRegistry.length,
    tests: async () => {
      expect(document.getElementsByTagName("nav")).toHaveLength(0);
    },
  },
  {
    name: "default props with document data",
    document: {
      name: "Galaxy Grill",
      dm_directoryParents_63590_locations: [
        { name: "Locations Directory", slug: "en/index.html" },
        {
          name: "US",
          slug: "en/us",
          dm_addressCountryDisplayName: "United States",
        },
        {
          name: "NY",
          slug: "en/us/ny",
          dm_addressCountryDisplayName: "United States",
          dm_addressRegionDisplayName: "New York",
        },
        {
          name: "Brooklyn",
          slug: "en/us/ny/brooklyn",
          dm_addressCountryDisplayName: "United States",
          dm_addressRegionDisplayName: "New York",
        },
      ],
    },
    props: { ...BreadcrumbsSection.defaultProps },
    version: migrationRegistry.length,
    tests: async (page) => {
      // expect(document.getElementsByTagName("nav")[0]).toBeVisible();
      expect(page.getByText("Locations Directory")).toBeVisible();
      expect(page.getByText("US")).toBeVisible();
      expect(page.getByText("NY")).toBeVisible();
      expect(page.getByText("Brooklyn")).toBeVisible();
      expect(page.getByText("Galaxy Grill")).toBeVisible();
    },
  },
];

const testsWithViewports: ComponentTest[] = [
  ...tests.map((t) => ({ ...t, viewport: viewports[0] })),
  ...tests.map((t) => ({ ...t, viewport: viewports[1] })),
];

describe("BreadcrumbsSection", async () => {
  const puckConfig: Config = {
    components: { BreadcrumbsSection },
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
          root: {
            props: {
              version,
            },
          },
          content: [
            {
              type: "BreadcrumbsSection",
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
