import * as React from "react";
import { describe, expect, it } from "vitest";
import { render as reactRender, waitFor } from "@testing-library/react";
import { Render, resolveAllData } from "@puckeditor/core";
import { VisualEditorProvider } from "./VisualEditorProvider.tsx";
import { migrate } from "./migrate.ts";
import { migrationRegistry } from "../components/migrations/migrationRegistry.ts";
import { mainConfig } from "../components/configs/mainConfig.tsx";
import { locatorConfig } from "../components/configs/locatorConfig.tsx";
import { ExpandedHeader } from "../components/header/ExpandedHeader.tsx";
import { BannerSection } from "../components/pageSections/Banner.tsx";
import { ExpandedFooter } from "../components/footer/ExpandedFooter.tsx";
import { LocatorComponent } from "../components/Locator.tsx";

describe("page landmarks", () => {
  it("renders one main landmark for a migrated main page and uses a native header", async () => {
    const document = {
      businessId: "test-business",
    };
    const migratedData = migrate(
      {
        root: {
          props: {
            version: migrationRegistry.length - 1,
          },
        },
        content: [
          {
            type: "ExpandedHeader",
            props: {
              ...ExpandedHeader.defaultProps,
              id: "ExpandedHeader-test",
            },
          },
          {
            type: "BannerSection",
            props: {
              ...BannerSection.defaultProps,
              id: "BannerSection-test",
            },
          },
          {
            type: "ExpandedFooter",
            props: {
              ...ExpandedFooter.defaultProps,
              id: "ExpandedFooter-test",
            },
          },
        ],
        zones: {},
      },
      migrationRegistry,
      mainConfig,
      document
    );

    const resolvedData = await resolveAllData(migratedData, mainConfig, {
      streamDocument: document,
    });

    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document }}>
        <Render
          config={mainConfig}
          data={resolvedData}
          metadata={{ streamDocument: document }}
        />
      </VisualEditorProvider>
    );

    await waitFor(() => {
      expect(container.querySelectorAll("main")).toHaveLength(1);
      expect(container.querySelectorAll("header")).toHaveLength(1);
    });
  });

  it("renders one main landmark for a migrated locator page", async () => {
    const document = {};
    const migratedData = migrate(
      {
        root: {
          props: {
            version: migrationRegistry.length - 1,
          },
        },
        content: [
          {
            type: "Locator",
            props: {
              ...LocatorComponent.defaultProps,
              id: "Locator-test",
            },
          },
        ],
        zones: {},
      },
      migrationRegistry,
      locatorConfig,
      document
    );

    const resolvedData = await resolveAllData(migratedData, locatorConfig, {
      streamDocument: document,
    });

    const { container } = reactRender(
      <VisualEditorProvider templateProps={{ document }}>
        <Render
          config={locatorConfig}
          data={resolvedData}
          metadata={{ streamDocument: document }}
        />
      </VisualEditorProvider>
    );

    await waitFor(() => {
      expect(container.querySelectorAll("main")).toHaveLength(1);
    });
  });
});
