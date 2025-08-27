import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  transformTests,
} from "./testing/componentTests.setup.ts";
import {
  act,
  render as reactRender,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  migrate,
  migrationRegistry,
  VisualEditorProvider,
  LocatorComponent,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";
import mapboxPackageJson from "mapbox-gl/package.json";

// Uses the content endpoint from
// https://www.yext.com/s/4174974/yextsites/155048/editor#pageSetId=locations
const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...LocatorComponent.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props",
    document: {
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: import.meta.env
          .COMPONENT_TESTS_VISUAL_EDITOR_APP_API_KEY,
        YEXT_CLOUD_CHOICE: "GLOBAL-MULTI",
        YEXT_CLOUD_REGION: "US",
        YEXT_ENVIRONMENT: "PROD",
        YEXT_MAPBOX_API_KEY: import.meta.env.COMPONENT_TESTS_MAPBOX_API_KEY,
        YEXT_SEARCH_API_KEY: import.meta.env.COMPONENT_TESTS_SEARCH_API_KEY,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            source: "accounts/4174974/sites/155048/pagesets/locations",
            experienceKey: "locator-41",
            entityType: "location",
          },
        },
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    },
    props: { ...LocatorComponent.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "version 10 default props",
    document: {
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: import.meta.env
          .COMPONENT_TESTS_VISUAL_EDITOR_APP_API_KEY,
        YEXT_CLOUD_CHOICE: "GLOBAL-MULTI",
        YEXT_CLOUD_REGION: "US",
        YEXT_ENVIRONMENT: "PROD",
        YEXT_MAPBOX_API_KEY: import.meta.env.COMPONENT_TESTS_MAPBOX_API_KEY,
        YEXT_SEARCH_API_KEY: import.meta.env.COMPONENT_TESTS_SEARCH_API_KEY,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            source: "accounts/4174974/sites/155048/pagesets/locations",
            experienceKey: "locator-41",
            entityType: "location",
          },
        },
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    },
    props: {},
    version: migrationRegistry.length,
  },
  {
    name: "version 10 non-default props",
    document: {
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: import.meta.env
          .COMPONENT_TESTS_VISUAL_EDITOR_APP_API_KEY,
        YEXT_CLOUD_CHOICE: "GLOBAL-MULTI",
        YEXT_CLOUD_REGION: "US",
        YEXT_ENVIRONMENT: "PROD",
        YEXT_MAPBOX_API_KEY: import.meta.env.COMPONENT_TESTS_MAPBOX_API_KEY,
        YEXT_SEARCH_API_KEY: import.meta.env.COMPONENT_TESTS_SEARCH_API_KEY,
      },
      _pageset: JSON.stringify({
        type: "LOCATOR",
        typeConfig: {
          locatorConfig: {
            source: "accounts/4174974/sites/155048/pagesets/locations",
            experienceKey: "locator-41",
            entityType: "location",
          },
        },
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    },
    props: {
      mapStyle: "mapbox://styles/mapbox/dark-v11",
      openNowButton: true,
    },
    version: migrationRegistry.length,
  },
];

const screenshotThreshold = 30;

describe("Locator", async () => {
  const puckConfig: Config = {
    components: { LocatorComponent },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      },
    },
  };
  it.each(transformTests(tests))(
    "$viewport.name $name",
    async ({
      name,
      document,
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
              type: "LocatorComponent",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig
      );

      const { container } = reactRender(
        <>
          <script
            id="mapbox-script"
            src={`https://api.mapbox.com/mapbox-gl-js/v${mapboxPackageJson.version}/mapbox-gl.js`}
          />
          <link
            id="mapbox-stylesheet"
            rel="stylesheet"
            href={`https://api.mapbox.com/mapbox-gl-js/v${mapboxPackageJson.version}/mapbox-gl.css`}
          />
          <VisualEditorProvider templateProps={{ document }}>
            <Render config={puckConfig} data={data} />
          </VisualEditorProvider>
        </>
      );

      await page.viewport(width, height);

      // Unless testing empty state, wait for search to load
      if (!name.includes("empty document")) {
        await waitFor(() => {
          screen.getAllByText("Galaxy Grill");
          const opacityContainer = container.querySelector("#innerDiv div");
          if (opacityContainer) {
            expect(getComputedStyle(opacityContainer).opacity).toBe("1");
          }
        });
      }

      // Hide the distance to each location because it is based on the test runner's IP address
      await act(async () => {
        const allDivs = container.querySelectorAll("div");
        allDivs.forEach((div) => {
          if (div.textContent?.includes("mi") && !div.children.length) {
            div.style.backgroundColor = "black";
            div.style.width = "8em";
          }
        });
      });

      await expect(`Locator/[${viewportName}] ${name}`).toMatchScreenshot({
        customThreshold: screenshotThreshold,
      });
      const results = await axe(container);
      if (results.violations.length) {
        console.error("WCAG Violations:", results.violations);
      }
      // TODO: Re-enable WCAG test
      // expect(results).toHaveNoViolations()

      if (interactions) {
        await interactions(page);
        await expect(
          `Locator/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot({ customThreshold: screenshotThreshold });
        const results = await axe(container);
        if (results.violations.length) {
          console.error("WCAG Violations:", results.violations);
        }
      }
    }
  );
});
