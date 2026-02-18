import * as React from "react";
import { describe, it, expect } from "vitest";
import {
  axe,
  ComponentTest,
  logSuppressedWcagViolations,
  transformTests,
} from "./testing/componentTests.setup.ts";
import {
  act,
  render as reactRender,
  screen,
  waitFor,
} from "@testing-library/react";
import { injectTranslations } from "../utils/i18n/components.ts";
import { migrate } from "../utils/migrate.ts";
import { migrationRegistry } from "./migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../utils/VisualEditorProvider.tsx";
import { LocatorComponent } from "./Locator.tsx";
import { Render, Config, resolveAllData } from "@puckeditor/core";
import { page } from "@vitest/browser/context";
import mapboxPackageJson from "mapbox-gl/package.json" with { type: "json" };
import { backgroundColors } from "../utils/themeConfigOptions.ts";

// Uses the content endpoint from
// https://www.yext.com/s/4174974/yextsites/155048/editor#pageSetId=locations
const tests: ComponentTest[] = [
  {
    name: "latest version default props with empty document",
    document: {},
    props: { ...LocatorComponent.defaultProps },
    version: migrationRegistry.length,
  },
  {
    name: "latest version default props",
    document: {
      locale: "en",
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
    name: "latest version non-default props",
    document: {
      locale: "en",
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
      filters: {
        openNowButton: true,
        showDistanceOptions: true,
      },
      resultCard: {
        primaryHeading: {
          field: "name",
          headingLevel: 5,
        },
        secondaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        tertiaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        icons: true,
        hours: {
          table: {
            startOfWeek: "monday",
            collapseDays: true,
            showAdditionalHoursText: false,
          },
          liveVisibility: true,
        },
        address: {
          showGetDirectionsLink: true,
          liveVisibility: true,
        },
        phone: {
          field: "mainPhone",
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          liveVisibility: false,
        },
        email: {
          field: "emails",
          liveVisibility: false,
        },
        services: {
          field: "services",
          liveVisibility: false,
        },
        primaryCTA: {
          variant: "primary",
          liveVisibility: true,
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "https://www.yext.com",
          variant: "secondary",
          liveVisibility: true,
        },
        image: {
          field: "headshot",
          liveVisibility: false,
        },
      },
    },
    version: migrationRegistry.length,
  },
  {
    name: "version 24 with filters",
    document: {
      locale: "en",
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
      filters: {
        openNowButton: true,
        showDistanceOptions: true,
      },
      resultCard: {
        primaryHeading: {
          field: "name",
          headingLevel: 3,
        },
        secondaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        tertiaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        icons: true,
        hours: {
          table: {
            startOfWeek: "today",
            collapseDays: false,
            showAdditionalHoursText: false,
          },
          liveVisibility: true,
        },
        address: {
          showGetDirectionsLink: true,
          liveVisibility: true,
        },
        phone: {
          field: "mainPhone",
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          liveVisibility: true,
        },
        email: {
          field: "emails",
          liveVisibility: false,
        },
        services: {
          field: "services",
          liveVisibility: false,
        },
        primaryCTA: {
          variant: "primary",
          liveVisibility: true,
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "#",
          variant: "secondary",
          liveVisibility: false,
        },
        image: {
          field: "headshot",
          liveVisibility: false,
        },
      },
    },
    interactions: async (page) => {
      const filterButton = page.getByText("Filter");
      await act(async () => {
        await filterButton.click();
      });
    },
    version: 24,
  },
  {
    name: "version 60 custom heading",
    document: {
      locale: "en",
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
      filters: {
        openNowButton: false,
        showDistanceOptions: false,
      },
      pageHeading: {
        title: { en: "Custom Heading", hasLocalizedValue: "true" },
      },
      resultCard: {
        primaryHeading: {
          field: "name",
          headingLevel: 3,
        },
        secondaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        tertiaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        icons: true,
        hours: {
          table: {
            startOfWeek: "today",
            collapseDays: false,
            showAdditionalHoursText: false,
          },
          liveVisibility: true,
        },
        address: {
          showGetDirectionsLink: true,
          liveVisibility: true,
        },
        phone: {
          field: "mainPhone",
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          liveVisibility: true,
        },
        email: {
          field: "emails",
          liveVisibility: false,
        },
        services: {
          field: "services",
          liveVisibility: false,
        },
        primaryCTA: {
          variant: "primary",
          liveVisibility: true,
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "#",
          variant: "secondary",
          liveVisibility: false,
        },
        image: {
          field: "headshot",
          liveVisibility: false,
        },
      },
    },
    version: 60,
  },
  {
    name: "version 60 custom heading with site color 2",
    document: {
      locale: "en",
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
      filters: {
        openNowButton: false,
        showDistanceOptions: false,
      },
      pageHeading: {
        title: { en: "Custom Heading", hasLocalizedValue: "true" },
        color: backgroundColors.color2.value,
      },
      resultCard: {
        primaryHeading: {
          field: "name",
          headingLevel: 3,
        },
        secondaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        tertiaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        icons: true,
        hours: {
          table: {
            startOfWeek: "today",
            collapseDays: false,
            showAdditionalHoursText: false,
          },
          liveVisibility: true,
        },
        address: {
          showGetDirectionsLink: true,
          liveVisibility: true,
        },
        phone: {
          field: "mainPhone",
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          liveVisibility: true,
        },
        email: {
          field: "emails",
          liveVisibility: false,
        },
        services: {
          field: "services",
          liveVisibility: false,
        },
        primaryCTA: {
          variant: "primary",
          liveVisibility: true,
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "#",
          variant: "secondary",
          liveVisibility: false,
        },
        image: {
          field: "headshot",
          liveVisibility: false,
        },
      },
    },
    version: 60,
  },
  {
    name: "version 60 custom title and result cards with site color 3",
    document: {
      locale: "en",
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
      filters: {
        openNowButton: false,
        showDistanceOptions: false,
      },
      pageHeading: {
        title: { en: "Custom Heading", hasLocalizedValue: "true" },
      },
      resultCard: {
        primaryHeading: {
          field: "name",
          headingLevel: 3,
          color: backgroundColors.color3.value,
        },
        secondaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        tertiaryHeading: {
          field: "name",
          variant: "base",
          liveVisibility: false,
        },
        icons: true,
        hours: {
          table: {
            startOfWeek: "today",
            collapseDays: false,
            showAdditionalHoursText: false,
          },
          liveVisibility: true,
        },
        address: {
          showGetDirectionsLink: true,
          liveVisibility: true,
        },
        phone: {
          field: "mainPhone",
          phoneFormat: "domestic",
          includePhoneHyperlink: true,
          liveVisibility: true,
        },
        email: {
          field: "emails",
          liveVisibility: false,
        },
        services: {
          field: "services",
          liveVisibility: false,
        },
        primaryCTA: {
          variant: "primary",
          liveVisibility: true,
        },
        secondaryCTA: {
          label: "Call to Action",
          link: "#",
          variant: "secondary",
          liveVisibility: false,
        },
        image: {
          field: "headshot",
          liveVisibility: false,
        },
      },
    },
    version: 60,
  },
];

const screenshotThreshold = 30;

describe("Locator", async () => {
  const puckConfig: Config = {
    components: { Locator: LocatorComponent },
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
      let data = migrate(
        {
          root: {
            props: {
              version,
            },
          },
          content: [
            {
              type: "Locator",
              props: props,
            },
          ],
        },
        migrationRegistry,
        puckConfig,
        document
      );

      data = await resolveAllData(data, puckConfig, {
        streamDocument: document,
      });

      const translations = await injectTranslations(document);

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
          <VisualEditorProvider templateProps={{ document, translations }}>
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
      logSuppressedWcagViolations(results);
      // TODO: Re-enable WCAG test
      // expect(results).toHaveNoViolations()

      if (interactions) {
        await interactions(page);
        await expect(
          `Locator/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot({ customThreshold: screenshotThreshold });
        const results = await axe(container);
        logSuppressedWcagViolations(results);
      }
    }
  );
});
