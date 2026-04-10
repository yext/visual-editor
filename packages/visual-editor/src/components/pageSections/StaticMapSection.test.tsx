import * as React from "react";
import { describe, it, expect } from "vitest";
import { axe, ComponentTest, transformTests } from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { migrate } from "../../utils/migrate.ts";
import { migrationRegistry } from "../migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { Render, Config } from "@puckeditor/core";
import { page } from "@vitest/browser/context";
import { StaticMapSection } from "./StaticMapSection.tsx";

const STATIC_MAP_TEST_API_KEY = "fixture-static-map-api-key";

const tests: ComponentTest[] = [
  {
    name: "default props with no coordinate",
    document: {},
    props: {
      ...StaticMapSection.defaultProps,
      data: {
        ...StaticMapSection.defaultProps?.data,
        apiKey: STATIC_MAP_TEST_API_KEY,
      },
    },
    version: migrationRegistry.length,
  },
  {
    name: "default props with coordinate - no api key",
    document: {
      yextDisplayCoordinate: {
        latitude: 38.895546,
        longitude: -77.069915,
      },
    },
    props: { ...StaticMapSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with coordinate - with api key",
    document: {
      yextDisplayCoordinate: {
        latitude: 38.895546,
        longitude: -77.069915,
      },
    },
    props: {
      ...StaticMapSection.defaultProps,
      data: {
        ...StaticMapSection.defaultProps?.data,
        apiKey: STATIC_MAP_TEST_API_KEY,
      },
    },
    version: migrationRegistry.length,
  },
  {
    name: "version 10 props with no coordinate",
    document: {},
    props: {
      data: {
        apiKey: STATIC_MAP_TEST_API_KEY,
      },
      liveVisibility: true,
    },
    version: 10,
  },
  {
    name: "version 10 props with coordinate - no api key",
    document: {
      yextDisplayCoordinate: {
        latitude: 38.895546,
        longitude: -77.069915,
      },
    },
    props: {
      data: {
        apiKey: "",
      },
      liveVisibility: true,
    },
    version: 10,
  },
  {
    name: "version 10 props with coordinate - with api key",
    document: {
      yextDisplayCoordinate: {
        latitude: 38.895546,
        longitude: -77.069915,
      },
    },
    props: {
      data: {
        apiKey: STATIC_MAP_TEST_API_KEY,
      },
      liveVisibility: true,
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
      },
    },
    version: 10,
  },
];

describe("StaticMapSection", async () => {
  const puckConfig: Config = {
    components: { StaticMapSection },
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
              type: "StaticMapSection",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      const { container } = reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render config={puckConfig} data={data} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);
      await expect(`StaticMapSection/[${viewportName}] ${name}`).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `StaticMapSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
