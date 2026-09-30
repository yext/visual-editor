import * as React from "react";
import { describe, it, expect } from "vitest";
import { page } from "@vitest/browser/context";
import { render as reactRender } from "@testing-library/react";
import {
  Render,
  Config,
  DefaultComponentProps,
  Data,
  DefaultRootProps,
  resolveAllData,
} from "@puckeditor/core";
import { migrationRegistry } from "../migrations/migrationRegistry.ts";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { migrate } from "../../utils/migrate.ts";
import { ThemeData } from "../../internal/types/themeData.ts";
import { MainContent } from "../helpers/MainContent.tsx";
import {
  testHours,
  testSetup,
  viewports,
} from "../testing/componentTests.setup.ts";
import { Directory } from "../sections/directory/Directory.tsx";
import { SlotsCategoryComponents } from "./SlotComponents.tsx";

const testDocument = {
  locale: "en",
  name: "name",
  dm_directoryChildren: [
    {
      address: {
        city: "Arlington",
        countryCode: "US",
        line1: "1101 Wilson Blvd",
        postalCode: "22209",
        region: "VA",
      },
      hours: testHours,
      id: "1101-wilson-blvd",
      mainPhone: "+17577017560",
      meta: {
        entityType: {
          id: "location",
        },
      },
      name: "Galaxy Grill",
      timezone: "America/New_York",
    },
    {
      address: {
        city: "Arlington",
        countryCode: "US",
        line1: "1735 North Lynn Street",
        postalCode: "22209",
        region: "VA",
      },
      geomodifier: "Rosslyn",
      hours: testHours,
      id: "1735-lynn",
      mainPhone: "+18005551010",
      meta: {
        entityType: {
          id: "location",
        },
      },
      name: "Galaxy Grill 2",
      timezone: "America/New_York",
    },
  ],
};

interface RootProps extends DefaultRootProps {
  version: number;
}

type ThemeTest = {
  name: string;
  document: Record<string, any>;
  theme: ThemeData;
  data: Data<DefaultComponentProps, RootProps>;
};

describe("ThemeTest", async () => {
  const puckConfig: Config = {
    components: {
      Directory,
      MainContent,
      ...SlotsCategoryComponents,
    },
    root: {
      render: ({ children }: { children: React.ReactNode }) => {
        return <>{children}</>;
      },
    },
  };

  const test: ThemeTest = {
    name: "hero section theme test",
    document: testDocument,
    data: {
      root: {
        props: {
          version: 82,
        },
      },
      content: [
        {
          type: "MainContent",
          props: {
            content: [
              {
                type: "Directory",
                props: {
                  id: "Directory-d21d6943-0a81-4a8e-b76b-cecb5b157c14",
                  slots: {
                    TitleSlot: [
                      {
                        type: "HeadingTextSlot",
                        props: {
                          id: "HeadingTextSlot-1a871989-a34d-426c-b24a-a1888c1a46ea",
                          data: {
                            text: {
                              field: "name",
                              constantValue: {
                                defaultValue: "",
                              },
                              constantValueEnabled: false,
                            },
                          },
                          styles: {
                            align: "center",
                            level: 2,
                          },
                        },
                      },
                    ],
                    SiteNameSlot: [
                      {
                        type: "HeadingTextSlot",
                        props: {
                          id: "HeadingTextSlot-9a120ff6-d494-4ec8-9ab8-e43017d77c03",
                          data: {
                            text: {
                              field: "name",
                              constantValue: {
                                defaultValue: "",
                              },
                              constantValueEnabled: true,
                            },
                          },
                          styles: {
                            align: "center",
                            level: 4,
                          },
                        },
                      },
                    ],
                    DirectoryGrid: [
                      {
                        type: "DirectoryGrid",
                        props: {
                          id: "DirectoryGrid-dab8e202-600a-47da-b5c7-971df3f504fb",
                          slots: {
                            CardSlot: [],
                          },
                          styles: {
                            backgroundColor: {
                              selectedColor: "palette-quaternary-light",
                              contrastingColor: "black",
                            },
                          },
                          data: {
                            field: "dm_directoryChildren",
                            constantValueEnabled: false,
                            constantValue: [],
                            mappings: {
                              cardTitle: {
                                field: "name",
                                constantValueEnabled: true,
                                constantValue: {
                                  defaultValue: "[[name]]",
                                },
                              },
                              linkOverride: {
                                enabled: false,
                                normalizeLink: false,
                                field: "",
                                constantValue: {
                                  defaultValue: "",
                                  hasLocalizedValue: "true",
                                },
                                constantValueEnabled: false,
                              },
                              showAddress: true,
                              showHoursStatus: true,
                              showPhoneNumber: true,
                            },
                          },
                          manualSlots: {
                            CardSlot: [],
                          },
                        },
                      },
                    ],
                    BreadcrumbsSlot: [
                      {
                        type: "BreadcrumbsSlot",
                        props: {
                          id: "BreadcrumbsSlot-13dba298-abd1-4f75-a7e9-b19779a4fc5b",
                          data: {
                            currentPage: {
                              field: "name",
                              constantValue: {
                                defaultValue: "[[name]]",
                              },
                              constantValueEnabled: false,
                            },
                            directoryRoot: {
                              defaultValue: "Directory Root",
                            },
                          },
                          styles: {
                            backgroundColor: {
                              selectedColor: "white",
                              contrastingColor: "black",
                            },
                            showCurrentPage: true,
                          },
                          analytics: {
                            scope: "directory",
                          },
                          liveVisibility: true,
                        },
                      },
                    ],
                  },
                  styles: {
                    backgroundColor: {
                      selectedColor: "palette-primary-dark",
                      contrastingColor: "white",
                    },
                    listBackgroundColor: {
                      selectedColor: "white",
                      contrastingColor: "black",
                    },
                  },
                  analytics: {
                    scope: "directory",
                  },
                },
              },
            ],
            id: "MainContent-76dbbc2c-0ca1-479c-ac6b-5e6b4bd82be7",
          },
        },
      ],
      zones: {},
    },
    theme: {
      "--fontFamily-link-fontFamily":
        "'Courier Prime', 'Courier Prime Fallback', monospace",
      "--fontSize-link-fontSize": "20px",
      "--fontWeight-link-fontWeight": "400",
      "--textTransform-link-textTransform": "none",
      "--letterSpacing-link-letterSpacing": "0em",
      "--display-link-caret": "none",
      "--fontFamily-body-fontFamily":
        "'Are You Serious', 'Are You Serious Fallback', cursive",
      "--fontSize-body-fontSize": "14px",
      "--fontWeight-body-fontWeight": "400",
      "--textTransform-body-textTransform": "uppercase",
      "--maxWidth-pageSection-contentWidth": "1024px",
      "--padding-pageSection-verticalPadding": "48px",
      "--fontFamily-button-fontFamily":
        "'Are You Serious', 'Are You Serious Fallback', cursive",
      "--fontSize-button-fontSize": "16px",
      "--fontWeight-button-fontWeight": "700",
      "--borderRadius-button-borderRadius": "9999px",
      "--textTransform-button-textTransform": "lowercase",
      "--letterSpacing-button-letterSpacing": "0.1em",
      "--borderRadius-image-borderRadius": "24px",
      "--colors-palette-primary": "#417505",
      "--colors-palette-primary-contrast": "#FFFFFF",
      "--colors-palette-secondary": "#dd86e9",
      "--colors-palette-secondary-contrast": "#000000",
      "--colors-palette-tertiary": "#000000",
      "--colors-palette-tertiary-contrast": "#FFFFFF",
      "--colors-palette-quaternary": "#ffffff",
      "--colors-palette-quaternary-contrast": "#000000",
      "--fontFamily-h1-fontFamily":
        "'Roboto Serif', 'Roboto Serif Fallback', serif",
      "--fontSize-h1-fontSize": "48px",
      "--fontWeight-h1-fontWeight": "700",
      "--textTransform-h1-textTransform": "none",
    },
  };

  beforeEach(() => {
    testSetup(test.theme);
  });

  it.each([
    { ...test, viewport: viewports.desktop },
    { ...test, viewport: viewports.tablet },
    { ...test, viewport: viewports.mobile },
  ])(
    "$viewport.name $name",
    async ({
      name,
      document,
      data,
      viewport: { width, height, name: viewportName },
    }) => {
      const migratedData = migrate(
        puckConfig,
        data,
        document,
        migrationRegistry
      );

      const updatedData = await resolveAllData(migratedData, puckConfig, {
        streamDocument: document,
      });

      reactRender(
        <VisualEditorProvider templateProps={{ document }}>
          <Render config={puckConfig} data={updatedData} />
        </VisualEditorProvider>
      );

      await page.viewport(width, height);

      await expect(`ThemeTest/[${viewportName}] ${name}`).toMatchScreenshot();
    }
  );
});
