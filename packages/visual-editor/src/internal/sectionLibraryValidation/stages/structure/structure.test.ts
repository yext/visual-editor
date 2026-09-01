import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { createTempRoot } from "../../testUtils.ts";
import { validateSectionLibraryStructure } from "./structure.ts";

describe("validateSectionLibraryStructure", () => {
  it("reports a section directory", () => {
    const rootDir = createValidLibrary();
    fs.ensureDirSync(sectionPath(rootDir, "Nested"));

    expectRules(rootDir, "sections/directory");
  });

  it("reports an unsupported section extension", () => {
    const rootDir = createValidLibrary();
    fs.outputFileSync(sectionPath(rootDir, "Notes.txt"), "notes");

    expectRules(rootDir, "sections/extension");
  });

  it("reports an invalid section component name", () => {
    const rootDir = createValidLibrary();
    fs.outputFileSync(sectionPath(rootDir, "Bad name.tsx"), validSectionSource);

    expectRules(rootDir, "sections/component-name");
  });

  it("reports an invalid section id", () => {
    const rootDir = createValidLibrary();
    writeSection(
      rootDir,
      validSectionSource.replace('id: "hero"', 'id: "bad id"')
    );

    expectRules(rootDir, "sections/id");
  });

  it("reports an invalid section id before invalid page set types", () => {
    const rootDir = createValidLibrary();
    writeSection(
      rootDir,
      validSectionSource
        .replace('id: "hero"', 'id: "bad id"')
        .replace('pageSetTypes: ["ENTITY"]', 'pageSetTypes: ["DOODLE"]')
    );

    const issues = validateSectionLibraryStructure(rootDir).issues;
    expect(issues[0]).toMatchObject({
      rule: "sections/id",
      message: expect.stringContaining("config must define a valid id"),
    });
    expect(issues).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: expect.stringContaining(
            "config.pageSetTypes must contain only"
          ),
        }),
      ])
    );
  });

  it("reports invalid section frontmatter", () => {
    const rootDir = createValidLibrary();
    writeSection(rootDir, "export const Hero = () => null;");

    expectRules(rootDir, "sections/frontmatter");
  });

  it("ignores .gitkeep", () => {
    const rootDir = createValidLibrary();
    fs.outputFileSync(sectionPath(rootDir, ".gitkeep"), "");

    expect(validateSectionLibraryStructure(rootDir).issues).toEqual([]);
  });
  it("reports a missing layouts directory", () => {
    const rootDir = createValidLibrary();
    fs.removeSync(layoutsPath(rootDir));

    expectRules(rootDir, "layouts/missing");
  });

  it("reports invalid layout cardinality", () => {
    const rootDir = createValidLibrary();
    fs.removeSync(layoutPath(rootDir, "locator-layout"));

    expectRules(rootDir, "layouts/cardinality");
  });

  it("allows multiple Entity layouts and sorts layouts by type and ID", () => {
    const rootDir = createValidLibrary();
    fs.copySync(
      layoutPath(rootDir, "entity-layout"),
      layoutPath(rootDir, "alternate-entity")
    );
    fs.writeJsonSync(
      layoutFilePath(rootDir, "alternate-entity", "metadata.json"),
      {
        ...entityMetadata,
        id: "alternate-entity",
        displayName: "Alternate Entity",
      }
    );

    const result = validateSectionLibraryStructure(rootDir);

    expect(result.issues).toEqual([]);
    expect(
      result.structure?.layouts.map((layout) => layout.metadata.id)
    ).toEqual([
      "alternate-entity",
      "entity-layout",
      "directory-layout",
      "locator-layout",
    ]);
  });

  it("reports a missing layout JSON file", () => {
    const rootDir = createValidLibrary();
    fs.removeSync(layoutFilePath(rootDir, "entity-layout", "metadata.json"));

    expectRules(rootDir, "json/missing");
  });

  it("accepts one supported layout preview image", () => {
    const rootDir = createValidLibrary();
    fs.outputFileSync(
      layoutFilePath(rootDir, "entity-layout", "preview.webp"),
      "image"
    );

    expect(validateSectionLibraryStructure(rootDir).issues).toEqual([]);
  });

  it("reports multiple layout preview images", () => {
    const rootDir = createValidLibrary();
    fs.outputFileSync(
      layoutFilePath(rootDir, "entity-layout", "preview.jpg"),
      "image"
    );
    fs.outputFileSync(
      layoutFilePath(rootDir, "entity-layout", "preview.png"),
      "image"
    );

    expectRules(rootDir, "layouts/preview-image");
  });

  it("reports an oversized layout preview image", () => {
    const rootDir = createValidLibrary();
    const previewImagePath = layoutFilePath(
      rootDir,
      "entity-layout",
      "preview.png"
    );
    fs.ensureFileSync(previewImagePath);
    fs.truncateSync(previewImagePath, 20 * 1024 * 1024 + 1);

    expectRules(rootDir, "layouts/preview-image");
  });

  it("reports malformed layout JSON", () => {
    const rootDir = createValidLibrary();
    fs.outputFileSync(
      layoutFilePath(rootDir, "entity-layout", "defaultLayout.json"),
      "{"
    );

    expectRules(rootDir, "json/invalid");
  });

  it("reports a non-object layout JSON value", () => {
    const rootDir = createValidLibrary();
    fs.outputJsonSync(
      layoutFilePath(rootDir, "entity-layout", "defaultLayout.json"),
      []
    );

    expectRules(rootDir, "json/invalid");
  });

  it("reports an unsupported page set type", () => {
    const rootDir = createValidLibrary();
    writeLayoutMetadata(rootDir, "entity-layout", {
      id: "entity-layout",
      displayName: "Entity",
      pageSetType: "UNKNOWN",
    });

    expectRules(rootDir, "layouts/metadata");
  });

  it("reports a missing required metadata string", () => {
    const rootDir = createValidLibrary();
    writeLayoutMetadata(rootDir, "directory-layout", {
      id: "directory-layout",
      pageSetType: "DIRECTORY",
    });

    expectRules(rootDir, "layouts/metadata");
  });

  it("reports an invalid optional metadata list", () => {
    const rootDir = createValidLibrary();
    writeLayoutMetadata(rootDir, "entity-layout", {
      ...entityMetadata,
      vertical: ["UNKNOWN"],
    });

    expectRules(rootDir, "layouts/metadata");
  });

  it("reports an invalid layout id", () => {
    const rootDir = createValidLibrary();
    writeLayoutMetadata(rootDir, "directory-layout", {
      id: "bad id",
      displayName: "Directory",
      pageSetType: "DIRECTORY",
    });

    expectRules(rootDir, "layouts/metadata");
  });

  it("reports a reserved legacy layout id", () => {
    const rootDir = createValidLibrary();
    writeLayoutMetadata(rootDir, "directory-layout", {
      id: "directory",
      displayName: "Directory",
      pageSetType: "DIRECTORY",
    });

    expectRules(rootDir, "layouts/metadata");
  });

  it.each(["edit-entity", "local-editor", "local-editor-data-entity"])(
    "reports layout id %s as reserved for generated ids",
    (layoutId) => {
      const rootDir = createValidLibrary();
      writeLayoutMetadata(rootDir, "entity-layout", {
        ...entityMetadata,
        id: layoutId,
      });

      const issues = validateSectionLibraryStructure(rootDir).issues;

      expect(issues).toEqual([
        expect.objectContaining({
          rule: "layouts/metadata",
          message: expect.stringContaining(
            `${layoutId} because it is reserved for a generated id`
          ),
        }),
      ]);
    }
  );

  it("reports Local Editor data template name collisions", () => {
    const rootDir = createValidLibrary();
    fs.copySync(
      layoutPath(rootDir, "entity-layout"),
      layoutPath(rootDir, "entity_layout")
    );
    writeLayoutMetadata(rootDir, "entity_layout", {
      ...entityMetadata,
      id: "entity_layout",
    });

    const issues = validateSectionLibraryStructure(rootDir).issues;

    expect(issues).toEqual([
      expect.objectContaining({
        rule: "layouts/local-editor-template-collision",
        message:
          "Layout IDs entity_layout and entity-layout generate the same Local Editor id: local-editor-data-entity-layout",
      }),
    ]);
  });

  it("reports an invalid shared component registry", () => {
    const rootDir = createValidLibrary();
    fs.outputFileSync(registryPath(rootDir), "export const nope = [];");

    expectRules(rootDir, "shared/invalid");
  });

  it("requires a shared registry for non-entity layouts", () => {
    const rootDir = createValidLibrary();
    fs.removeSync(registryPath(rootDir));

    expectRules(rootDir, "shared/missing");
  });

  it("reports an invalid shared component id", () => {
    const rootDir = createValidLibrary();
    writeRegistry(rootDir, [{ id: "bad id", pageSetTypes: ["DIRECTORY"] }]);

    expectRules(rootDir, "components/id");
  });

  it("reports a duplicate component id", () => {
    const rootDir = createValidLibrary();
    writeRegistry(rootDir, [{ id: "hero", pageSetTypes: ["DIRECTORY"] }]);

    expectRules(rootDir, "components/duplicate");
  });

  it("reports a missing component instance id", () => {
    const rootDir = createValidLibrary();
    writeDefaultLayout(rootDir, "entity-layout", {
      content: [{ type: "hero", props: {} }],
      zones: {},
    });

    expectRules(rootDir, "layouts/instance-id");
  });

  it("reports a duplicate component instance id", () => {
    const rootDir = createValidLibrary();
    writeDefaultLayout(rootDir, "entity-layout", {
      content: [
        { type: "hero", props: { id: "duplicate" } },
        { type: "hero", props: { id: "duplicate" } },
      ],
      zones: {},
    });

    expectRules(rootDir, "layouts/duplicate-instance-id");
  });

  it("reports a missing component reference", () => {
    const rootDir = createValidLibrary();
    writeDefaultLayout(rootDir, "entity-layout", {
      content: [{ type: "missing", props: { id: "missing-1" } }],
      zones: {},
    });

    expectRules(rootDir, "layouts/reference");
  });

  it("reports a page-set-incompatible component reference", () => {
    const rootDir = createValidLibrary();
    writeDefaultLayout(rootDir, "directory-layout", {
      content: [{ type: "hero", props: { id: "hero-1" } }],
      zones: {},
    });

    expectRules(rootDir, "layouts/reference");
  });

  it.each([
    [
      "zones",
      {
        content: [],
        zones: { root: [{ type: "missing", props: { id: "zone-1" } }] },
      },
    ],
    [
      "slots",
      {
        content: [
          {
            type: "MainContent",
            props: {
              id: "main",
              slots: {
                header: [{ type: "missing", props: { id: "slot-1" } }],
              },
            },
          },
        ],
        zones: {},
      },
    ],
    [
      "MainContent",
      {
        content: [
          {
            type: "MainContent",
            props: {
              id: "main",
              content: [{ type: "missing", props: { id: "content-1" } }],
            },
          },
        ],
        zones: {},
      },
    ],
  ])("validates components nested in %s", (_location, layout) => {
    const rootDir = createValidLibrary();
    writeDefaultLayout(rootDir, "entity-layout", layout);

    expectRules(rootDir, "layouts/reference");
  });

  it("returns the resolved structure for a valid library", () => {
    const result = validateSectionLibraryStructure(createValidLibrary());

    expect(result.issues).toEqual([]);
    expect(result.structure).toMatchObject({
      sections: [{ id: "hero", componentName: "Hero" }],
      sharedComponents: [{ id: "directory-header" }],
      sharedRootPageSetTypes: ["DIRECTORY", "LOCATOR"],
      layouts: [
        { metadata: { pageSetType: "ENTITY" } },
        { metadata: { pageSetType: "DIRECTORY" } },
        { metadata: { pageSetType: "LOCATOR" } },
      ],
    });
  });
});

const validSectionSource = [
  "export const Hero = () => null;",
  'export const config: SectionConfig = { id: "hero", displayName: "Hero", description: "Hero section", pageSetTypes: ["ENTITY"] };',
].join("\n");

const entityMetadata = {
  id: "entity-layout",
  displayName: "Entity",
  previewImageUrl: "https://example.com/entity.png",
  vertical: ["RETAIL"],
  purpose: ["LOCATION"],
  pageSetType: "ENTITY",
};

const createValidLibrary = (): string => {
  const rootDir = createTempRoot();
  writeSection(rootDir, validSectionSource);
  writeLayout(rootDir, "entity-layout", entityMetadata);
  writeLayout(rootDir, "directory-layout", {
    id: "directory-layout",
    displayName: "Directory",
    pageSetType: "DIRECTORY",
  });
  writeLayout(rootDir, "locator-layout", {
    id: "locator-layout",
    displayName: "Locator",
    pageSetType: "LOCATOR",
  });
  writeRegistry(rootDir, [
    { id: "directory-header", pageSetTypes: ["DIRECTORY"] },
  ]);
  return rootDir;
};

const writeSection = (rootDir: string, source: string): void => {
  fs.outputFileSync(sectionPath(rootDir, "Hero.tsx"), source);
};

const writeLayout = (
  rootDir: string,
  directoryName: string,
  metadata: Record<string, unknown>
): void => {
  writeLayoutMetadata(rootDir, directoryName, metadata);
  writeDefaultLayout(rootDir, directoryName, { content: [], zones: {} });
};

const writeLayoutMetadata = (
  rootDir: string,
  directoryName: string,
  metadata: Record<string, unknown>
): void => {
  fs.outputJsonSync(
    layoutFilePath(rootDir, directoryName, "metadata.json"),
    metadata
  );
};

const writeDefaultLayout = (
  rootDir: string,
  directoryName: string,
  layout: unknown
): void => {
  fs.outputJsonSync(
    layoutFilePath(rootDir, directoryName, "defaultLayout.json"),
    layout
  );
};

const writeRegistry = (
  rootDir: string,
  components: { id: string; pageSetTypes: string[] }[]
): void => {
  const metadata = components
    .map(
      ({ id, pageSetTypes }) =>
        `{ id: ${JSON.stringify(id)}, pageSetTypes: ${JSON.stringify(pageSetTypes)} }`
    )
    .join(",\n");
  fs.outputFileSync(
    registryPath(rootDir),
    [
      `export const sharedComponentMetadata = [${metadata}];`,
      "export const sharedComponentConfigs = {};",
      "export const sharedRootConfigs = {};",
      "export const sharedRootAllowedComponentIds = {};",
      'export const sharedRootPageSetTypes = ["DIRECTORY", "LOCATOR"];',
    ].join("\n")
  );
};

const expectRules = (rootDir: string, ...rules: string[]): void => {
  const actualRules = validateSectionLibraryStructure(rootDir).issues.map(
    (issue) => issue.rule
  );
  for (const rule of rules) {
    expect(actualRules).toContain(rule);
  }
};

const sectionPath = (rootDir: string, name: string): string =>
  path.join(rootDir, "src", "library", "sections", name);

const layoutsPath = (rootDir: string): string =>
  path.join(rootDir, "src", "library", "layouts");

const layoutPath = (rootDir: string, name: string): string =>
  path.join(layoutsPath(rootDir), name);

const layoutFilePath = (
  rootDir: string,
  directoryName: string,
  fileName: string
): string => path.join(layoutPath(rootDir, directoryName), fileName);

const registryPath = (rootDir: string): string =>
  path.join(rootDir, "src", "library", "shared", "componentRegistry.ts");
