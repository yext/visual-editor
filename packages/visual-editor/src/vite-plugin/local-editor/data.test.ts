// @vitest-environment node
import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import type { SectionLibraryLayout } from "../../types/sectionLibrary.ts";
import { getLocalEditorDocument, getLocalEditorManifest } from "./data.ts";

const rootDirs: string[] = [];

afterEach(() => {
  while (rootDirs.length > 0) {
    fs.removeSync(rootDirs.pop()!);
  }
});

describe("getLocalEditorDocument", () => {
  it("returns four built-in Directory fixture documents", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "local-editor-"));
    rootDirs.push(rootDir);
    fs.writeJsonSync(path.join(rootDir, "package.json"), { type: "module" });
    fs.writeFileSync(
      path.join(rootDir, "stream.config.ts"),
      "export default {};\n"
    );

    const layouts: SectionLibraryLayout[] = [
      {
        metadata: {
          id: "directory-layout",
          displayName: "Directory",
          pageSetType: "DIRECTORY",
        },
        defaultLayout: {},
      },
    ];
    const manifest = await getLocalEditorManifest(rootDir, layouts);
    expect(manifest.layouts).toEqual(["directory-layout"]);
    expect(
      manifest.entitiesByLayout["directory-layout"].map(
        ({ entityId }) => entityId
      )
    ).toEqual([
      "fixture-directory-city",
      "fixture-directory-root",
      "fixture-directory-country",
      "fixture-directory-region",
    ]);
    const response = await getLocalEditorDocument(
      rootDir,
      layouts,
      "directory-layout",
      "fixture-directory-city",
      "en"
    );

    expect(response.diagnostics).toEqual([]);
    expect(response.document).toMatchObject({
      meta: { entityType: { id: "dm_city" } },
    });
    const directoryChildren = response.document?.dm_directoryChildren;
    expect(Array.isArray(directoryChildren)).toBe(true);
    if (!Array.isArray(directoryChildren)) {
      throw new Error("Expected Directory fixture children.");
    }
    expect(directoryChildren[0]).toMatchObject({
      name: "Example Location 1",
      address: { city: "Arlington" },
    });
    expect(directoryChildren).toHaveLength(4);
  });

  it("limits Directory fixtures to 100 children", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "local-editor-"));
    rootDirs.push(rootDir);
    fs.writeJsonSync(path.join(rootDir, "package.json"), { type: "module" });
    fs.writeFileSync(
      path.join(rootDir, "stream.config.ts"),
      "export default {};\n"
    );
    const layouts: SectionLibraryLayout[] = [
      {
        metadata: {
          id: "directory-layout",
          displayName: "Directory",
          pageSetType: "DIRECTORY",
        },
        defaultLayout: {},
      },
    ];

    const response = await getLocalEditorDocument(
      rootDir,
      layouts,
      "directory-layout",
      "fixture-directory-city",
      "en",
      101
    );

    expect(response.document?.dm_directoryChildren).toHaveLength(100);
  });

  it("returns a Locator fixture without a stream or snapshot", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "local-editor-"));
    rootDirs.push(rootDir);
    fs.writeJsonSync(path.join(rootDir, "package.json"), { type: "module" });
    fs.writeFileSync(
      path.join(rootDir, "stream.config.ts"),
      "export default {};\n"
    );
    const layouts: SectionLibraryLayout[] = [
      {
        metadata: {
          id: "locator-layout",
          displayName: "Locator",
          pageSetType: "LOCATOR",
        },
        defaultLayout: {},
      },
    ];

    const manifest = await getLocalEditorManifest(rootDir, layouts);
    expect(manifest.diagnostics).toEqual([]);
    expect(manifest.entitiesByLayout["locator-layout"]).toEqual([
      {
        entityId: "fixture-locator-locator-layout",
        displayName: "Local Editor Locator",
        locales: ["en"],
      },
    ]);
    const response = await getLocalEditorDocument(
      rootDir,
      layouts,
      "locator-layout",
      "fixture-locator-locator-layout",
      "en"
    );
    expect(response.locatorDataSource).toBe("fixture");
    expect(response.document).toMatchObject({
      meta: { entityType: { id: "locator" } },
      _env: {
        YEXT_MAPBOX_API_KEY: "local-editor-fixture-key",
        YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY: "local-editor-fixture-key",
        YEXT_SEARCH_API_KEY: "local-editor-fixture-key",
      },
    });
  });

  it("uses real Locator Search when configured", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "local-editor-"));
    rootDirs.push(rootDir);
    fs.writeJsonSync(path.join(rootDir, "package.json"), { type: "module" });
    fs.writeFileSync(
      path.join(rootDir, "stream.config.ts"),
      'export default { env: { YEXT_SEARCH_API_KEY: "search-key", YEXT_SEARCH_EXPERIENCE_KEY: "experience-key" } };\n'
    );
    const layouts: SectionLibraryLayout[] = [
      {
        metadata: {
          id: "locator-layout",
          displayName: "Locator",
          pageSetType: "LOCATOR",
        },
        defaultLayout: {},
      },
    ];

    const response = await getLocalEditorDocument(
      rootDir,
      layouts,
      "locator-layout",
      "fixture-locator-locator-layout",
      "en"
    );

    expect(response.locatorDataSource).toBe("real");
    expect(response.document?._env).toMatchObject({
      YEXT_SEARCH_API_KEY: "search-key",
    });
    expect(JSON.parse(String(response.document?._pageset))).toMatchObject({
      typeConfig: { locatorConfig: { experienceKey: "experience-key" } },
    });
  });

  it("keeps generated snapshots and defaults isolated by Entity layout", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "local-editor-"));
    rootDirs.push(rootDir);
    fs.writeJsonSync(path.join(rootDir, "package.json"), { type: "module" });
    fs.writeFileSync(
      path.join(rootDir, "stream.config.ts"),
      'export default { defaults: { layoutId: "alternate-entity-layout" }, env: { YEXT_CLOUD_REGION: "US", YEXT_SEARCH_API_KEY: "" }, pageSetTypes: { ENTITY: { stream: { $id: "entity", fields: ["id", "name"] } } }, layouts: { "alternate-entity-layout": { defaults: { entityId: "location-2" }, stream: { $id: "alternate-entity", fields: ["id", "name", "description"] } } } };\n'
    );
    fs.outputJsonSync(path.join(rootDir, "localData", "mapping.json"), {
      "local-editor-data-entity-layout": ["entity.json"],
      "local-editor-data-alternate-entity-layout": ["alternate-entity.json"],
    });
    fs.outputJsonSync(path.join(rootDir, "localData", "entity.json"), {
      id: "location-1",
      locale: "en",
      name: "Example Location",
      _env: { YEXT_CLOUD_REGION: "EU", EXISTING_VALUE: "preserved" },
    });
    fs.outputJsonSync(
      path.join(rootDir, "localData", "alternate-entity.json"),
      {
        id: "location-2",
        locale: "en",
        name: "Alternate Location",
        description: "Alternate layout snapshot",
      }
    );
    const layouts: SectionLibraryLayout[] = [
      {
        metadata: {
          id: "entity-layout",
          displayName: "Entity",
          pageSetType: "ENTITY",
        },
        defaultLayout: { root: { props: { version: 1 } } },
      },
      {
        metadata: {
          id: "alternate-entity-layout",
          displayName: "Alternate Entity",
          pageSetType: "ENTITY",
        },
        defaultLayout: { root: { props: { version: 2 } } },
      },
    ];

    const manifest = await getLocalEditorManifest(rootDir, layouts);
    expect(manifest.layouts).toEqual([
      "entity-layout",
      "alternate-entity-layout",
    ]);
    expect(manifest.defaults).toMatchObject({
      layoutId: "alternate-entity-layout",
      entityId: "location-2",
    });
    expect(manifest.layoutDefaults).toMatchObject({
      "entity-layout": {
        defaultLayoutData: { root: { props: { version: 1 } } },
      },
      "alternate-entity-layout": {
        entityId: "location-2",
        defaultLayoutData: { root: { props: { version: 2 } } },
      },
    });

    const entityResponse = await getLocalEditorDocument(
      rootDir,
      layouts,
      "entity-layout",
      "location-1",
      "en"
    );
    const alternateResponse = await getLocalEditorDocument(
      rootDir,
      layouts,
      "alternate-entity-layout",
      "location-2",
      "en"
    );

    expect(entityResponse.diagnostics).toEqual([]);
    expect(entityResponse.document).toMatchObject({
      id: "location-1",
      name: "Example Location",
      _env: {
        YEXT_CLOUD_REGION: "US",
        YEXT_SEARCH_API_KEY: "",
        EXISTING_VALUE: "preserved",
      },
    });
    expect(alternateResponse.diagnostics).toEqual([]);
    expect(alternateResponse.document).toMatchObject({
      id: "location-2",
      name: "Alternate Location",
      description: "Alternate layout snapshot",
    });
  });
});
