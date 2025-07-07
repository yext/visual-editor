import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
  delay,
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
  },
  {
    name: "version 4 props",
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
    props: {
      data: {
        directoryRoot: "Locations Directory",
      },
      liveVisibility: true,
    },
    version: 4,
  },
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
  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({
      document,
      name,
      props,
      interactions,
      version,
      viewport: { width, height, name: viewportName },
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
      await delay(100);
      await page.screenshot({
        path: `../screenshots/Breadcrumbs/[${viewportName}] ${name}.png`,
      });
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await page.screenshot({
          path: `../screenshots/Breadcrumbs/[${viewportName}] ${name} (after interactions).png`,
        });
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
