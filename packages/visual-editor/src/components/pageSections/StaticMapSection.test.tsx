import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender } from "@testing-library/react";
import { migrate } from "../../utils/migrate.ts";
import { migrationRegistry } from "../migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { Render, Config } from "@puckeditor/core";
import { page } from "@vitest/browser/context";
import { StaticMapSection } from "./StaticMapSection.tsx";
import { MainContent } from "../structure/MainContent.tsx";

const tests: ComponentTest[] = [
  {
    name: "default props with no coordinate",
    document: { _env: { YEXT_MAPBOX_API_KEY: "fixture-static-map-api-key" } },
    props: { ...StaticMapSection.defaultProps },
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
    name: "default props with coordinate - with env api key",
    document: {
      _env: { YEXT_MAPBOX_API_KEY: "fixture-static-map-api-key" },
      yextDisplayCoordinate: {
        latitude: 38.895546,
        longitude: -77.069915,
      },
    },
    props: { ...StaticMapSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 10 props with no coordinate",
    document: { _env: { YEXT_MAPBOX_API_KEY: "fixture-static-map-api-key" } },
    props: { liveVisibility: true },
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
    props: { liveVisibility: true },
    version: 10,
  },
  {
    name: "version 10 props with coordinate - with env api key",
    document: {
      _env: { YEXT_MAPBOX_API_KEY: "fixture-static-map-api-key" },
      yextDisplayCoordinate: {
        latitude: 38.895546,
        longitude: -77.069915,
      },
    },
    props: {
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
    components: { StaticMapSection, MainContent },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({ document, props, interactions, version }) => {
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

      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );

  it("migrates version 77 by removing the legacy data prop", async () => {
    const data = migrate(
      {
        root: {
          props: {
            version: 77,
          },
        },
        content: [
          {
            type: "StaticMapSection",
            props: {
              id: "static-map-section",
              liveVisibility: true,
              data: {
                apiKey: "fixture-static-map-api-key",
              },
              styles: {
                backgroundColor: {
                  selectedColor: "white",
                  contrastingColor: "black",
                },
                mapStyle: "streets-v12",
              },
            },
          },
        ],
      },
      migrationRegistry,
      puckConfig,
      {
        _env: { YEXT_MAPBOX_API_KEY: "fixture-static-map-api-key" },
        yextDisplayCoordinate: {
          latitude: 38.895546,
          longitude: -77.069915,
        },
      }
    );

    expect(data.content[0]).toEqual({
      type: "StaticMapSection",
      props: {
        id: "static-map-section",
        liveVisibility: true,
        styles: {
          backgroundColor: {
            selectedColor: "white",
            contrastingColor: "black",
          },
          mapStyle: "streets-v12",
        },
      },
    });
  });
});
