import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  delay,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { act, render as reactRender, waitFor } from "@testing-library/react";
import {
  migrate,
  migrationRegistry,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";
import { StaticMapSection } from "./StaticMapSection.tsx";

const tests: ComponentTest[] = [
  {
    name: "default props with no coordinate",
    document: {},
    props: {
      ...StaticMapSection.defaultProps,
      data: {
        ...StaticMapSection.defaultProps?.data,
        apiKey: import.meta.env.COMPONENT_TESTS_MAPBOX_STATIC_MAP_KEY,
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
        apiKey: import.meta.env.COMPONENT_TESTS_MAPBOX_STATIC_MAP_KEY,
      },
    },
    version: migrationRegistry.length,
  },
  {
    name: "version 10 props with no coordinate",
    document: {},
    props: {
      data: {
        apiKey: import.meta.env.COMPONENT_TESTS_MAPBOX_STATIC_MAP_KEY,
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
        apiKey: import.meta.env.COMPONENT_TESTS_MAPBOX_STATIC_MAP_KEY,
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
              type: "StaticMapSection",
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
      const images = Array.from(container.querySelectorAll("img"));
      await waitFor(() => {
        expect(images.every((i) => i.complete)).toBe(true);
      });

      // flush resizing useEffects
      await act(async () => await delay(1000));
      await act(async () => await delay(1000));

      await expect(
        `StaticMapSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
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
