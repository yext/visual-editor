// @vitest-environment node
import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import type { SectionLibraryLayout } from "../../sectionLibrary.ts";
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
      dm_directoryChildren: [
        {
          name: "Example Location",
          address: { city: "Arlington" },
        },
      ],
    });
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
    expect(
      (
        await getLocalEditorDocument(
          rootDir,
          layouts,
          "locator-layout",
          "fixture-locator-locator-layout",
          "en"
        )
      ).document
    ).toMatchObject({ meta: { entityType: { id: "locator" } } });
  });

  it("uses generated snapshots for Entity layouts", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "local-editor-"));
    rootDirs.push(rootDir);
    fs.writeJsonSync(path.join(rootDir, "package.json"), { type: "module" });
    fs.writeFileSync(
      path.join(rootDir, "stream.config.ts"),
      'export default { env: { YEXT_CLOUD_REGION: "US", YEXT_SEARCH_API_KEY: "" }, pageSetTypes: { ENTITY: { stream: { $id: "entity", fields: ["id", "name"] } } } };\n'
    );
    fs.outputJsonSync(path.join(rootDir, "localData", "mapping.json"), {
      "local-editor-data-entity-layout": ["entity.json"],
    });
    fs.outputJsonSync(path.join(rootDir, "localData", "entity.json"), {
      id: "location-1",
      locale: "en",
      name: "Example Location",
      _env: { YEXT_CLOUD_REGION: "EU", EXISTING_VALUE: "preserved" },
    });
    const layouts: SectionLibraryLayout[] = [
      {
        metadata: {
          id: "entity-layout",
          displayName: "Entity",
          pageSetType: "ENTITY",
          previewImageUrl: "",
        },
        defaultLayout: {},
      },
    ];

    const response = await getLocalEditorDocument(
      rootDir,
      layouts,
      "entity-layout",
      "location-1",
      "en"
    );

    expect(response.diagnostics).toEqual([]);
    expect(response.document).toMatchObject({
      id: "location-1",
      _env: {
        YEXT_CLOUD_REGION: "US",
        YEXT_SEARCH_API_KEY: "",
        EXISTING_VALUE: "preserved",
      },
    });
  });
});
