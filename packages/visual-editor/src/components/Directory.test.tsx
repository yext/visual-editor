import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  testHours,
  viewports,
} from "./testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import {
  Directory,
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

const tests: ComponentTest[] = [
  {
    name: "version 0 default props with document data that has directory cards",
    document: {
      _site: {
        name: "Example Business",
      },
      dm_childEntityIds: ["8725530"],
      dm_directoryChildren: [
        {
          address: {
            city: "Arlington",
            countryCode: "US",
            line1: "1101 Wilson Blvd",
            postalCode: "22209",
            region: "VA",
          },
          mainPhone: "+12025551010",
          hours: testHours,
          name: "Galaxy Grill",
          timezone: "America/New_York",
        },
      ],
      name: "Arlington",
      meta: { entityType: { id: "dm_city", uid: 456 }, locale: "en" },
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
      dm_directoryManagerId: "63590-locations",
      dm_directoryParents_63590_locations: [
        { name: "Locations Directory", slug: "en/index.html" },
        {
          name: "US",
          slug: "en/us",
          dm_addressCountryDisplayName: "United States",
        },
        {
          name: "VA",
          slug: "us/va",
          dm_addressCountryDisplayName: "United States",
          dm_addressRegionDisplayName: "Virginia",
        },
      ],
    },
    props: { ...Directory.defaultProps },
    version: 0,
    tests: async (page) => {
      expect(page.getByText("Directory Root")).toBeVisible();
    },
  },
  {
    name: "version 0 default props with document data that has directory lists",
    document: {
      _site: {
        name: "Example Business",
      },
      meta: { entityType: { id: "dm_region", uid: 123 }, locale: "en" },
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
      dm_childEntityIds: ["8932945"],
      dm_directoryChildren: [
        {
          name: "Arlington",
          slug: "us/va/arlington",
          dm_addressCountryDisplayName: "United States",
          dm_addressRegionDisplayName: "Virginia",
        },
      ],
      dm_directoryManagerId: "63590-locations",
      dm_directoryParents_63590_locations: [
        {
          name: "Locations Directory",
          slug: "en/index.html",
          dm_addressCountryDisplayName: "United States",
          dm_addressRegionDisplayName: "Virginia",
        },
        {
          name: "US",
          slug: "en/us",
          dm_addressCountryDisplayName: "United States",
        },
      ],
    },
    props: { ...Directory.defaultProps },
    version: 0,
    tests: async (page) => {
      expect(page.getByText("Directory Root")).toBeVisible();
    },
  },
  {
    name: "version 4 with non-default props",
    document: {
      _site: {
        name: "Example Business",
      },
      meta: { entityType: { id: "dm_region", uid: 123 }, locale: "en" },
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
      dm_childEntityIds: ["8932945"],
      dm_directoryChildren: [
        {
          name: "Arlington",
          slug: "us/va/arlington",
          dm_addressCountryDisplayName: "United States",
          dm_addressRegionDisplayName: "Virginia",
        },
      ],
      dm_directoryManagerId: "63590-locations",
      dm_directoryParents_63590_locations: [
        {
          name: "Locations Directory",
          slug: "en/index.html",
          dm_addressCountryDisplayName: "United States",
          dm_addressRegionDisplayName: "Virginia",
        },
        {
          name: "US",
          slug: "en/us",
          dm_addressCountryDisplayName: "United States",
        },
      ],
    },
    props: {
      data: {
        directoryRoot: "Not Default Root",
      },
      liveVisibility: true,
    },
    version: 4,
    tests: async (page) => {
      expect(page.getByText("Not Default Root")).toBeVisible();
    },
  },
  {
    name: "version 4 with default props",
    document: {
      _site: {
        name: "Example Business",
      },
      meta: { entityType: { id: "dm_region", uid: 123 }, locale: "en" },
      dm_addressCountryDisplayName: "United States",
      dm_addressRegionDisplayName: "Virginia",
      dm_childEntityIds: ["8932945"],
      dm_directoryChildren: [
        {
          name: "Arlington",
          slug: "us/va/arlington",
          dm_addressCountryDisplayName: "United States",
          dm_addressRegionDisplayName: "Virginia",
        },
      ],
      dm_directoryManagerId: "63590-locations",
      dm_directoryParents_63590_locations: [
        {
          name: "Locations Directory",
          slug: "en/index.html",
          dm_addressCountryDisplayName: "United States",
          dm_addressRegionDisplayName: "Virginia",
        },
        {
          name: "US",
          slug: "en/us",
          dm_addressCountryDisplayName: "United States",
        },
      ],
    },
    props: {
      data: {
        directoryRoot: "Directory Root",
      },
      liveVisibility: true,
    },
    version: 4,
    tests: async (page) => {
      expect(page.getByText("Directory Root")).toBeVisible();
    },
  },
];

const testsWithViewports: ComponentTest[] = [
  ...tests.map((t) => ({ ...t, viewport: viewports[0] })),
  ...tests.map((t) => ({ ...t, viewport: viewports[1] })),
];

describe("Directory", async () => {
  const puckConfig: Config = {
    components: { Directory },
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
              type: "Directory",
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
