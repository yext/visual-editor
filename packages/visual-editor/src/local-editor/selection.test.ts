import type { Config } from "@puckeditor/core";
import { expect, it } from "vitest";
import type { LocalEditorManifestResponse } from "./types.ts";
import {
  buildEditorLocalDevOptions,
  buildLocalEditorSelection,
} from "./selection.ts";

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

it("keeps Entity layout defaults and storage scopes isolated", () => {
  const manifest: LocalEditorManifestResponse = {
    layouts: ["entity-one", "entity-two"],
    pageSetTypeByLayout: {
      "entity-one": "ENTITY",
      "entity-two": "ENTITY",
    },
    dataSourceByLayout: {
      "entity-one": "stream",
      "entity-two": "stream",
    },
    entitiesByLayout: {
      "entity-one": [
        { entityId: "location-one", displayName: "One", locales: ["en"] },
      ],
      "entity-two": [
        {
          entityId: "location-two",
          displayName: "Two",
          locales: ["en", "fr"],
        },
      ],
    },
    layoutDefaults: {
      "entity-one": {
        entityId: "location-one",
        locale: "en",
        defaultLayoutData: { root: { props: { version: 1 } } },
      },
      "entity-two": {
        entityId: "location-two",
        locale: "fr",
        defaultLayoutData: { root: { props: { version: 2 } } },
      },
    },
    defaults: { layoutId: "entity-one" },
    diagnostics: [],
    streamConfigPath: "stream.config.ts",
    localDataPath: "localData",
  };
  const selection = buildLocalEditorSelection(
    manifest,
    {
      "entity-one": {} as Config,
      "entity-two": {} as Config,
    },
    new URLSearchParams({
      layoutId: "entity-two",
      entityId: "location-one",
    })
  );

  expect(selection.selectedEntity?.entityId).toBe("location-two");
  expect(selection.selectedLocale).toBe("fr");
  expect(
    buildEditorLocalDevOptions({
      selectedLayoutId: selection.selectedLayoutId,
      selectedEntity: selection.selectedEntity,
      selectedLocale: selection.selectedLocale,
      selectedLayoutDefaults: selection.selectedLayoutDefaults,
    })
  ).toMatchObject({
    templateId: "entity-two",
    entityId: "location-two",
    locale: "fr",
    layoutScopeKey: "entity-two:fr",
    initialLayoutData: { root: { props: { version: 2 } } },
  });
});
