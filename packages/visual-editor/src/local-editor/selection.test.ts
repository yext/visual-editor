import type { Config } from "@puckeditor/core";
import { expect, it } from "vitest";
import { buildLocalEditorSelection } from "./selection.ts";

it("selects the first fixture entity when the selected layout changes", () => {
  const manifest = {
    layouts: ["entity", "directory", "locator"],
    pageSetTypeByLayout: {
      entity: "ENTITY" as const,
      directory: "DIRECTORY" as const,
      locator: "LOCATOR" as const,
    },
    dataSourceByLayout: {
      entity: "stream" as const,
      directory: "fixture" as const,
      locator: "fixture" as const,
    },
    entitiesByLayout: {
      entity: [
        { entityId: "location", displayName: "Location", locales: ["en"] },
      ],
      directory: [
        {
          entityId: "fixture-directory-root",
          displayName: "Locations Directory",
          locales: ["en"],
        },
      ],
      locator: [
        {
          entityId: "fixture-locator-locator",
          displayName: "Local Editor Locator",
          locales: ["en"],
        },
      ],
    },
    layoutDefaults: {},
    defaults: {},
    diagnostics: [],
    streamConfigPath: "stream.config.ts",
    localDataPath: "localData",
  };
  const componentRegistry = {
    entity: {} as Config,
    directory: {} as Config,
    locator: {} as Config,
  };
  for (const [layoutId, entityId] of [
    ["directory", "fixture-directory-root"],
    ["locator", "fixture-locator-locator"],
  ]) {
    const selection = buildLocalEditorSelection(
      manifest,
      componentRegistry,
      new URLSearchParams({ layoutId, entityId: "location" })
    );
    expect(selection.selectedEntity?.entityId).toBe(entityId);
  }
});
