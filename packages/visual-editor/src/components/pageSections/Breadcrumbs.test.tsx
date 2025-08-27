import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
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
  {
    name: "version 8 with non-default props with document data",
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
        directoryRoot:
          "Locations Directory with a really really really really long directory root prop - Locations Directory - Locations Directory - Locations Directory - Locations Directory - Locations Directory",
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
      },
      liveVisibility: true,
    },
    version: 8,
  },
];

describe("BreadcrumbsSection", async () => {
  const puckConfig: Config = {
    components: { BreadcrumbsSection },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
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

      await expect(
        `BreadcrumbsSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `BreadcrumbsSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
