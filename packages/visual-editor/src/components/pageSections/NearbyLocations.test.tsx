import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import {
  axe,
  ComponentTest,
  delay,
  transformTests,
} from "../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import {
  migrate,
  migrationRegistry,
  NearbyLocationsSection,
  VisualEditorProvider,
} from "@yext/visual-editor";
import { Render, Config } from "@measured/puck";
import { page } from "@vitest/browser/context";

// Uses the content endpoint from
// https://www.yext.com/s/4174974/yextsites/155048/editor#pageSetId=locations
const tests: ComponentTest[] = [
  {
    name: "default props with empty document",
    document: {},
    props: { ...NearbyLocationsSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with multiple nearby locations",
    document: {
      id: "1101-wilson-blvd",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: import.meta.env
          .COMPONENT_TESTS_VISUAL_EDITOR_APP_API_KEY,
      },
      _pageset: JSON.stringify({
        config: {
          contentEndpointId: "locationsContent",
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
      yextDisplayCoordinate: {
        latitude: 38.895546,
        longitude: -77.069915,
      },
      _yext: { contentDeliveryAPIDomain: "https://cdn.yextapis.com" },
    },
    props: { ...NearbyLocationsSection.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "default props with no nearby locations",
    document: {
      id: "7751-bird-rd",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: import.meta.env
          .COMPONENT_TESTS_VISUAL_EDITOR_APP_API_KEY,
      },
      _pageset: JSON.stringify({
        config: {
          contentEndpointId: "locationsContent",
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
      yextDisplayCoordinate: {
        latitude: 25.73398,
        longitude: -80.319968,
      },
      _yext: { contentDeliveryAPIDomain: "https://cdn.yextapis.com" },
    },
    props: { ...NearbyLocationsSection.defaultProps },
    interactions: async () => {
      // re-enable fetch
      vi.unstubAllGlobals();
      await delay(1000);
    },
    version: migrationRegistry.length,
  },
  {
    name: "version 10 with multiple nearby locations",
    document: {
      id: "1101-wilson-blvd",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: import.meta.env
          .COMPONENT_TESTS_VISUAL_EDITOR_APP_API_KEY,
      },
      _pageset: JSON.stringify({
        config: {
          contentEndpointId: "locationsContent",
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
      yextDisplayCoordinate: {
        latitude: 38.895546,
        longitude: -77.069915,
      },
      _yext: { contentDeliveryAPIDomain: "https://cdn.yextapis.com" },
    },
    props: {
      data: {
        heading: {
          field: "",
          constantValue: { en: "Nearby Locations", hasLocalizedValue: "true" },
          constantValueEnabled: true,
        },
        coordinate: {
          field: "yextDisplayCoordinate",
          constantValue: {
            latitude: 0,
            longitude: 0,
          },
        },
        radius: 10,
        limit: 3,
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-dark",
          textColor: "text-white",
        },
        heading: {
          level: 1,
          align: "right",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-tertiary-light",
            textColor: "text-black",
          },
          headingLevel: 5,
        },
        hours: {
          showCurrentStatus: true,
          timeFormat: "12h",
          showDayNames: false,
          dayOfWeekFormat: "short",
        },
        phoneNumberFormat: "international",
        phoneNumberLink: true,
      },
      analytics: {
        scope: "nearbyLocationsSection",
      },
      liveVisibility: true,
    },
    version: 10,
  },
  {
    name: "version 10 with no nearby locations",
    document: {
      id: "7751-bird-rd",
      businessId: "4174974",
      __: {
        isPrimaryLocale: true,
      },
      _env: {
        YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: import.meta.env
          .COMPONENT_TESTS_VISUAL_EDITOR_APP_API_KEY,
      },
      _pageset: JSON.stringify({
        config: {
          contentEndpointId: "locationsContent",
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
      _yext: { contentDeliveryAPIDomain: "https://cdn.yextapis.com" },
      c_nearbyHeader: "Nearby",
    },
    props: {
      data: {
        heading: {
          field: "c_nearbyHeader",
          constantValue: { en: "", hasLocalizedValue: "true" },
        },
        coordinate: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            latitude: 25.73398,
            longitude: -80.319968,
          },
        },
        radius: 10,
        limit: 3,
      },
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-primary-light",
          textColor: "text-black",
        },
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: {
            bgColor: "bg-palette-tertiary-dark",
            textColor: "text-white",
          },
          headingLevel: 5,
        },
        hours: {
          showCurrentStatus: true,
          timeFormat: "12h",
          showDayNames: false,
          dayOfWeekFormat: "short",
        },
        phoneNumberFormat: "international",
        phoneNumberLink: true,
      },
      analytics: {
        scope: "nearbyLocationsSection",
      },
      liveVisibility: true,
    },
    interactions: async () => {
      // re-enable fetch
      vi.unstubAllGlobals();
      await delay(1000);
    },
    version: 10,
  },
];

describe("NearbyLocationsSection", async () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const puckConfig: Config = {
    components: { NearbyLocationsSection },
    root: {
      render: ({ children }) => {
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
              type: "NearbyLocationsSection",
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

      // wait for locations to load
      if (name.includes("multiple nearby locations")) {
        await waitFor(() => {
          expect(page.getByText("Washington, DC")).toBeInTheDocument();
        });
      } else {
        // block fetch to ensure loading screen
        vi.stubGlobal(
          "fetch",
          vi.fn(() => {
            throw new Error("Network access currently disabled");
          })
        );
      }

      await expect(
        `NearbyLocationsSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      expect(results).toHaveNoViolations();

      if (interactions) {
        await interactions(page);
        await expect(
          `NearbyLocationsSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      }
    }
  );
});
