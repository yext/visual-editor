import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import {
  axe,
  ComponentTest,
  delay,
  logSuppressedWcagViolations,
  transformTests,
} from "../../testing/componentTests.setup.ts";
import { render as reactRender, waitFor } from "@testing-library/react";
import { migrate } from "../../../utils/migrate.ts";
import { migrationRegistry } from "../../migrations/migrationRegistry.ts";
import { NearbyLocationsSection } from "./NearbyLocations.tsx";
import { SlotsCategoryComponents } from "../../categories/SlotsCategory.tsx";
import { VisualEditorProvider } from "../../../utils/VisualEditorProvider.tsx";
import { Render, Config } from "@puckeditor/core";
import { page } from "@vitest/browser/context";
import { backgroundColors } from "../../../utils/themeConfigOptions.ts";

const interactionsDelay = 1000;

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
      locale: "en",
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
      locale: "en",
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
      await delay(interactionsDelay);
    },
    version: migrationRegistry.length,
  },
  {
    name: "version 36 with no nearby locations",
    document: {
      locale: "en",
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
      yextDisplayCoordinate: {
        latitude: 25.73398,
        longitude: -80.319968,
      },
    },
    props: {
      styles: {
        backgroundColor: {
          bgColor: "bg-palette-secondary-dark",
          textColor: "text-white",
        },
      },
      analytics: { scope: "nearbyLocationsSection" },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-a17250dd-d35c-4797-b3ef-21150332d629",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Nearby Locations",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "left" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "NearbyLocationCardsWrapper",
            props: {
              id: "NearbyLocationCardsWrapper-7474f646-0751-4920-94cd-64d20c6a9490",
              data: {
                coordinate: {
                  field: "yextDisplayCoordinate",
                  constantValue: { latitude: -10, longitude: 0 },
                  constantValueEnabled: true,
                },
                radius: 10,
                limit: 3,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-white",
                  textColor: "text-black",
                },
                headingLevel: 3,
                hours: {
                  showCurrentStatus: true,
                  timeFormat: "12h",
                  showDayNames: true,
                  dayOfWeekFormat: "long",
                },
                phone: { phoneNumberFormat: "domestic", phoneNumberLink: true },
              },
              sectionHeadingLevel: 2,
            },
          },
        ],
      },
      liveVisibility: true,
    },
    interactions: async () => {
      // re-enable fetch
      vi.unstubAllGlobals();
      await delay(interactionsDelay);
    },
    version: 36,
  },
  {
    name: "version 59 with multiple nearby locations (showSectionHeading, showHours false)",
    document: {
      locale: "en",
      id: "1101-wilson-blvd",
      businessId: "4174974",
      address: {
        city: "Washington",
      },
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
      styles: {
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        showSectionHeading: false,
      },
      analytics: { scope: "nearbyLocationsSection" },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-a17250dd-d35c-4797-b3ef-21150332d629",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Nearby [[address.city]]",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "center" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "NearbyLocationCardsWrapper",
            props: {
              id: "NearbyLocationCardsWrapper-7474f646-0751-4920-94cd-64d20c6a9490",
              data: {
                coordinate: {
                  field: "yextDisplayCoordinate",
                  constantValue: { latitude: 0, longitude: 0 },
                },
                radius: 10,
                limit: 3,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-light",
                  textColor: "text-black",
                },
                headingLevel: 4,
                hours: {
                  showCurrentStatus: true,
                  timeFormat: "12h",
                  showDayNames: true,
                  dayOfWeekFormat: "short",
                },
                phone: { phoneNumberFormat: "domestic", phoneNumberLink: true },
                showHours: false,
                showPhone: true,
                showAddress: true,
              },
              sectionHeadingLevel: 2,
            },
          },
        ],
      },
      liveVisibility: true,
    },
    version: 59,
  },
  {
    name: "version 59 with multiple nearby locations (showPhone, showAddress false)",
    document: {
      locale: "en",
      id: "1101-wilson-blvd",
      businessId: "4174974",
      address: {
        city: "Washington",
      },
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
      styles: {
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
        showSectionHeading: true,
      },
      analytics: { scope: "nearbyLocationsSection" },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-a17250dd-d35c-4797-b3ef-21150332d629",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Nearby [[address.city]]",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "center" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "NearbyLocationCardsWrapper",
            props: {
              id: "NearbyLocationCardsWrapper-7474f646-0751-4920-94cd-64d20c6a9490",
              data: {
                coordinate: {
                  field: "yextDisplayCoordinate",
                  constantValue: { latitude: 0, longitude: 0 },
                },
                radius: 10,
                limit: 3,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-light",
                  textColor: "text-black",
                },
                headingLevel: 4,
                hours: {
                  showCurrentStatus: true,
                  timeFormat: "12h",
                  showDayNames: true,
                  dayOfWeekFormat: "short",
                },
                phone: { phoneNumberFormat: "domestic", phoneNumberLink: true },
                showHours: true,
                showPhone: false,
                showAddress: false,
              },
              sectionHeadingLevel: 2,
            },
          },
        ],
      },
      liveVisibility: true,
    },
    version: 59,
  },
  {
    name: "version 60 with multiple nearby locations with site color 3",
    document: {
      locale: "en",
      id: "1101-wilson-blvd",
      businessId: "4174974",
      address: {
        city: "Washington",
      },
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
      styles: {
        backgroundColor: { bgColor: "bg-white", textColor: "text-black" },
      },
      analytics: { scope: "nearbyLocationsSection" },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              id: "HeadingTextSlot-a17250dd-d35c-4797-b3ef-21150332d629",
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: "Nearby [[address.city]]",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { level: 2, align: "center" },
            },
          },
        ],
        CardsWrapperSlot: [
          {
            type: "NearbyLocationCardsWrapper",
            props: {
              id: "NearbyLocationCardsWrapper-7474f646-0751-4920-94cd-64d20c6a9490",
              data: {
                coordinate: {
                  field: "yextDisplayCoordinate",
                  constantValue: { latitude: 0, longitude: 0 },
                },
                radius: 10,
                limit: 3,
              },
              styles: {
                backgroundColor: {
                  bgColor: "bg-palette-primary-light",
                  textColor: "text-black",
                },
                color: backgroundColors.color3.value,
                headingLevel: 4,
                hours: {
                  showCurrentStatus: true,
                  timeFormat: "12h",
                  showDayNames: true,
                  dayOfWeekFormat: "short",
                },
                phone: { phoneNumberFormat: "domestic", phoneNumberLink: true },
              },
              sectionHeadingLevel: 2,
            },
          },
        ],
      },
      liveVisibility: true,
    },
    version: 60,
  },
];

describe("NearbyLocationsSection", async () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const puckConfig: Config = {
    components: { NearbyLocationsSection, ...SlotsCategoryComponents },
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
              type: "NearbyLocationsSection",
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

      // wait for locations to load
      if (name.includes("multiple nearby locations")) {
        await waitFor(() => {
          expect(page.getByText("Galaxy Grill").first()).toBeInTheDocument();
        });
      } else {
        // block fetch to ensure loading screen
        vi.stubGlobal(
          "fetch",
          vi.fn(() => {
            throw new Error("Network access currently disabled");
          })
        );
        if (document?._env?.YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY) {
          await waitFor(() => {
            expect(
              page.getByText("Loading nearby locations")
            ).toBeInTheDocument();
          });
        }
      }

      await expect(
        `NearbyLocationsSection/[${viewportName}] ${name}`
      ).toMatchScreenshot();
      const results = await axe(container);
      if (version === 60 && results.violations.length) {
        logSuppressedWcagViolations(results);
      } else {
        expect(results).toHaveNoViolations();
      }

      if (interactions) {
        await interactions(page);

        await expect(
          `NearbyLocationsSection/[${viewportName}] ${name} (after interactions)`
        ).toMatchScreenshot();

        const results2 = await axe(container);
        if (version === 60 && results2.violations.length) {
          logSuppressedWcagViolations(results2);
        } else {
          expect(results2).toHaveNoViolations();
        }
      }
    }
  );
});
