import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { createTempRoot } from "../../../../internal/sectionLibraryValidation/testUtils.ts";
import { purposes, verticals } from "../../../../types/sectionLibrary.ts";
import { convertTemplatesToSectionLibrary } from "./main.ts";

describe("convertTemplatesToSectionLibrary", () => {
  it("removes yext- prefixes and creates library metadata without a library.json", () => {
    const rootDirectory = createTempRoot("convert-template-test-");
    const templateDirectory = path.join(
      rootDirectory,
      "src",
      "registry",
      "yext-my-template"
    );
    fs.outputJsonSync(path.join(templateDirectory, "template.json"), {
      displayName: "My Template",
      description: "A converted template.",
    });
    fs.outputJsonSync(path.join(templateDirectory, "defaultLayout.json"), {
      root: {},
      zones: {},
      content: [
        {
          type: "MainContent",
          props: {
            content: [
              { type: "yext-Hero", props: { id: "YextHero" } },
              { type: "YextBanner", props: { id: "yext-banner" } },
            ],
          },
        },
      ],
    });
    fs.outputFileSync(
      path.join(templateDirectory, "components", "yext-Hero.tsx"),
      [
        'import type { YextComponentConfig } from "@yext/visual-editor";',
        "",
        "export const Hero: YextComponentConfig = {",
        '  label: "Hero",',
        "  render: () => null,",
        "};",
        "",
      ].join("\n")
    );
    fs.outputFileSync(
      path.join(templateDirectory, "components", "YextBanner.tsx"),
      [
        'import type { YextComponentConfig } from "@yext/visual-editor";',
        'import { YextExternal } from "@example/components";',
        'import { AnalyticsScopeProvider } from "@yext/pages-components";',
        "",
        "type YextBannerProps = { title: string };",
        "const YextBadge = () => <span />;",
        "",
        "export const YextBanner: YextComponentConfig<YextBannerProps> = {",
        '  label: "Banner",',
        "  render: () => (",
        "    <AnalyticsScopeProvider name={`YextBannerScope${YextExternal}`}>",
        "      <YextBadge />",
        "    </AnalyticsScopeProvider>",
        "  ),",
        "};",
        "",
      ].join("\n")
    );
    fs.outputJsonSync(path.join(rootDirectory, "package.json"), {
      dependencies: {
        "@yext/visual-editor": "2.0.0-beta.4",
        "@puckeditor/core": "0.22.2",
      },
    });
    fs.outputJsonSync(path.join(rootDirectory, "package-lock.json"), {});

    convertTemplatesToSectionLibrary({
      apply: true,
      deleteSource: false,
      targetDirectory: rootDirectory,
      write: () => undefined,
      installDependencies: () => undefined,
    });

    const libraryDirectory = path.join(rootDirectory, "src", "library");
    expect(
      fs.readJsonSync(path.join(libraryDirectory, "library.json"))
    ).toEqual({
      schemaVersion: 1,
      id: "my-template",
      displayName: "My Template",
      description: "A converted template.",
    });
    expect(
      fs.readJsonSync(
        path.join(libraryDirectory, "layouts", "my-template", "metadata.json")
      )
    ).toEqual({
      id: "my-template",
      displayName: "My Template",
      pageSetType: "ENTITY",
    });
    expect(
      fs
        .readJsonSync(
          path.join(
            libraryDirectory,
            "layouts",
            "my-template",
            "defaultLayout.json"
          )
        )
        .content[0].props.content.map(({ type }: { type: string }) => type)
    ).toEqual(["Hero", "Banner"]);
    expect(
      fs
        .readJsonSync(
          path.join(
            libraryDirectory,
            "layouts",
            "my-template",
            "defaultLayout.json"
          )
        )
        .content[0].props.content.map(
          ({ props }: { props: { id: string } }) => props.id
        )
    ).toEqual(["Hero", "banner"]);
    expect(
      fs.existsSync(path.join(libraryDirectory, "sections", "Hero.tsx"))
    ).toBe(true);
    const bannerSource = fs.readFileSync(
      path.join(libraryDirectory, "sections", "Banner.tsx"),
      "utf8"
    );
    expect(bannerSource).toContain(
      "export const Banner: YextComponentConfig<BannerProps>"
    );
    expect(bannerSource).toContain("type BannerProps");
    expect(bannerSource).toContain("const Badge = () => <span />;");
    expect(bannerSource).toContain("YextExternal");
    expect(bannerSource).toContain(
      "<AnalyticsScopeProvider name={`BannerScope${YextExternal}`}>"
    );
    expect(bannerSource).not.toContain("YextBanner");
    expect(
      fs.existsSync(path.join(libraryDirectory, "sections", "yext-Hero.tsx"))
    ).toBe(false);
    expect(
      fs.existsSync(path.join(libraryDirectory, "layouts", "yext-my-template"))
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(libraryDirectory, "layouts", "yext-my-template-directory")
      )
    ).toBe(false);
  });
});

const createConversionFixture = () => {
  const rootDirectory = createTempRoot("convert-template-errors-");
  const templateDirectory = path.join(rootDirectory, "src/registry/example");
  fs.outputJsonSync(path.join(templateDirectory, "template.json"), {
    displayName: "Example",
  });
  fs.outputJsonSync(path.join(templateDirectory, "defaultLayout.json"), {
    root: {},
    zones: {},
    content: [],
  });
  fs.outputFileSync(
    path.join(templateDirectory, "components/Hero.tsx"),
    'export const Hero: YextComponentConfig = { label: "Hero", render: () => null };'
  );
  const libraryDirectory = path.join(rootDirectory, "src/library");
  fs.outputFileSync(
    path.join(libraryDirectory, "shared/componentRegistry.ts"),
    ""
  );
  for (const id of ["Directory", "Locator"]) {
    fs.outputFileSync(path.join(libraryDirectory, `sections/${id}.tsx`), "");
    fs.outputJsonSync(
      path.join(libraryDirectory, `layouts/${id}/metadata.json`),
      {
        id,
        pageSetType: id.toUpperCase(),
      }
    );
    fs.outputJsonSync(
      path.join(libraryDirectory, `layouts/${id}/defaultLayout.json`),
      {
        root: {},
        zones: {},
        content: [],
      }
    );
  }
  fs.outputJsonSync(path.join(rootDirectory, "package.json"), {
    dependencies: {
      "@yext/visual-editor": "2.0.0-beta.4",
      "@puckeditor/core": "0.22.2",
    },
  });
  fs.outputJsonSync(path.join(rootDirectory, "package-lock.json"), {});
  const convert = () =>
    convertTemplatesToSectionLibrary({
      apply: true,
      deleteSource: false,
      targetDirectory: rootDirectory,
      write: () => undefined,
      installDependencies: () => undefined,
    });
  return { rootDirectory, templateDirectory, libraryDirectory, convert };
};

describe("conversion error diagnostics", () => {
  it.each([
    { metadata: null, messages: ["metadata must be a JSON object"] },
    {
      metadata: {},
      messages: [
        "pageSetType must be ENTITY, DIRECTORY, or LOCATOR; received undefined",
        "id must be a string; received undefined",
      ],
    },
    {
      metadata: { id: "bad id", pageSetType: "OTHER" },
      messages: [
        'received "OTHER"',
        'id must match directory name "entity"; received "bad id"',
        "id must start with a letter or number",
      ],
    },
  ])("explains invalid base metadata: $metadata", ({ metadata, messages }) => {
    const { libraryDirectory, convert } = createConversionFixture();
    const metadataPath = path.join(
      libraryDirectory,
      "layouts/entity/metadata.json"
    );
    fs.outputJsonSync(metadataPath, metadata);
    for (const message of [metadataPath, ...messages]) {
      expect(convert).toThrow(message);
    }
  });

  it.each(["Legacy", "Base"])(
    "explains invalid %s layout fields",
    (description) => {
      const { templateDirectory, libraryDirectory, convert } =
        createConversionFixture();
      const layoutPath = path.join(
        description === "Legacy"
          ? templateDirectory
          : path.join(libraryDirectory, "layouts/Directory"),
        "defaultLayout.json"
      );
      fs.outputJsonSync(layoutPath, { root: null, zones: [], content: {} });
      for (const message of [
        layoutPath,
        "root must be a JSON object; received null",
        "zones must be a JSON object; received []",
        "content must be an array; received {}",
      ]) {
        expect(convert).toThrow(message);
      }
      fs.outputJsonSync(layoutPath, []);
      expect(convert).toThrow("default layout must be a JSON object");
    }
  );

  it.each([
    { property: "purposes", allowedValues: purposes },
    { property: "verticals", allowedValues: verticals },
  ])(
    "lists allowed $property and invalid entries",
    ({ property, allowedValues }) => {
      const { templateDirectory, convert } = createConversionFixture();
      const metadataPath = path.join(templateDirectory, "template.json");
      fs.outputJsonSync(metadataPath, {
        displayName: "Example",
        [property]: [allowedValues[0], "UNKNOWN", 42],
      });
      expect(convert).toThrow(
        `${property} contains unsupported values: "UNKNOWN", 42`
      );
      expect(convert).toThrow(`Allowed values: ${allowedValues.join(", ")}`);
      fs.outputJsonSync(metadataPath, {
        displayName: "Example",
        [property]: "UNKNOWN",
      });
      expect(convert).toThrow(
        `${property} must be an array of supported strings; received "UNKNOWN"`
      );
    }
  );

  it.each(["bad name", "yext-"])(
    "explains invalid template identifier %s",
    (name) => {
      const { rootDirectory, templateDirectory, convert } =
        createConversionFixture();
      const renamedDirectory = path.join(rootDirectory, "src/registry", name);
      fs.renameSync(templateDirectory, renamedDirectory);
      expect(convert).toThrow(renamedDirectory);
      expect(convert).toThrow(
        "must start with a letter or number and contain only letters, numbers, underscores, and hyphens"
      );
      if (name === "yext-") {
        expect(convert).toThrow('After removing the yext prefix, ""');
      }
    }
  );

  it("names both templates with colliding normalized identifiers", () => {
    const { rootDirectory, templateDirectory, convert } =
      createConversionFixture();
    const otherDirectory = path.join(
      rootDirectory,
      "src/registry/yext-example"
    );
    fs.copySync(templateDirectory, otherDirectory);
    expect(convert).toThrow(
      `${templateDirectory} and ${otherDirectory} both normalize to "example"`
    );
  });

  it("names the conflicting generated layout and source templates", () => {
    const { rootDirectory, templateDirectory, convert } =
      createConversionFixture();
    const otherDirectory = path.join(
      rootDirectory,
      "src/registry/example-directory"
    );
    fs.copySync(templateDirectory, otherDirectory);
    expect(convert).toThrow(
      `Legacy template ${otherDirectory} conflicts with generated layout ID "example-directory" from ${templateDirectory}`
    );
  });

  it("identifies reserved template aliases and the source directory", () => {
    const { rootDirectory, templateDirectory, convert } =
      createConversionFixture();
    const renamedDirectory = path.join(rootDirectory, "src/registry/yext-main");
    fs.renameSync(templateDirectory, renamedDirectory);
    expect(convert).toThrow(`${renamedDirectory} normalizes to "main"`);
    expect(convert).toThrow(
      "Reserved IDs: main, directory, locator, edit. Rename the template directory."
    );
  });
});

describe("project setup conversion", () => {
  const setup = () => {
    const fixture = createConversionFixture();
    const packagePath = path.join(fixture.rootDirectory, "package.json");
    const lockPath = path.join(fixture.rootDirectory, "package-lock.json");
    const configPath = path.join(fixture.rootDirectory, "stream.config.ts");
    fs.outputJsonSync(packagePath, {
      dependencies: {
        "@yext/visual-editor": "2.0.0-beta.4",
        "@puckeditor/core": "0.22.2",
      },
      scripts: { dev: "vite" },
    });
    fs.outputJsonSync(lockPath, { lockfileVersion: 3 });
    fs.outputFileSync(
      configPath,
      [
        "const restaurantStream = { filter: { entityTypes: ['restaurant'] } };",
        "const config = {",
        "  defaults: { templateId: 'directory', locale: 'en' },",
        "  templates: {",
        "    example: { stream: { ...restaurantStream, $id: 'restaurant' } },",
        "    directory: { // preserve directory comment",
        "      // stream: { $id: 'directory' },",
        "    },",
        "    locator: {},",
        "  },",
        "};",
        "export default config;",
        "",
      ].join("\n")
    );
    fs.outputFileSync(
      path.join(fixture.rootDirectory, ".template-manifest.json"),
      "{}"
    );
    for (const name of [
      "main.tsx",
      "directory.tsx",
      "locator.tsx",
      "edit.tsx",
    ]) {
      fs.outputFileSync(
        path.join(fixture.rootDirectory, "src/templates", name),
        "/** THIS FILE IS AUTOGENERATED AND SHOULD NOT BE EDITED */\nexport default {};\n"
      );
    }
    fs.outputFileSync(
      path.join(fixture.rootDirectory, "src/templates/robots.tsx"),
      "// project template\n"
    );
    return { ...fixture, packagePath, lockPath, configPath };
  };

  it("converts a Subway-shaped config and removes only generated legacy files", () => {
    const fixture = setup();
    const messages: string[] = [];
    convertTemplatesToSectionLibrary({
      apply: true,
      deleteSource: true,
      targetDirectory: fixture.rootDirectory,
      write: (message) => messages.push(message),
      installDependencies: (_manager, directory) => {
        fs.outputFileSync(
          path.join(directory, "package-lock.json"),
          "refreshed lockfile\n"
        );
      },
    });
    const config = fs.readFileSync(fixture.configPath, "utf8");
    expect(config).toContain('layoutId: "example-directory"');
    expect(config).toContain("layouts: {");
    expect(config).toContain(
      '"example-directory": { // preserve directory comment'
    );
    expect(config).toContain("// stream: { $id: 'directory' },");
    expect(config).toContain("entityTypes: ['restaurant']");
    expect(config).toContain("$id: 'restaurant'");
    expect(fs.readJsonSync(fixture.packagePath).dependencies).toEqual({
      "@yext/visual-editor": "2.0.0-beta.5",
      "@puckeditor/core": "0.24.0-canary.c1ec9773",
    });
    expect(fs.readFileSync(fixture.lockPath, "utf8")).toBe(
      "refreshed lockfile\n"
    );
    expect(
      fs.existsSync(path.join(fixture.rootDirectory, ".template-manifest.json"))
    ).toBe(false);
    for (const name of [
      "main.tsx",
      "directory.tsx",
      "locator.tsx",
      "edit.tsx",
    ]) {
      expect(
        fs.existsSync(path.join(fixture.rootDirectory, "src/templates", name))
      ).toBe(false);
    }
    expect(
      fs.existsSync(
        path.join(fixture.rootDirectory, "src/templates/robots.tsx")
      )
    ).toBe(true);
    expect(fs.existsSync(fixture.templateDirectory)).toBe(false);
    expect(messages).toContain(
      `  remove ${path.join(fixture.rootDirectory, "src/templates/main.tsx")}`
    );
  });

  it("reports changes in a dry run without touching project files", () => {
    const fixture = setup();
    const originalConfig = fs.readFileSync(fixture.configPath, "utf8");
    const originalPackage = fs.readFileSync(fixture.packagePath, "utf8");
    const messages: string[] = [];
    convertTemplatesToSectionLibrary({
      apply: false,
      deleteSource: true,
      targetDirectory: fixture.rootDirectory,
      write: (message) => messages.push(message),
    });
    expect(fs.readFileSync(fixture.configPath, "utf8")).toBe(originalConfig);
    expect(fs.readFileSync(fixture.packagePath, "utf8")).toBe(originalPackage);
    expect(
      fs.existsSync(path.join(fixture.rootDirectory, ".template-manifest.json"))
    ).toBe(true);
    expect(messages.join("\n")).toContain(
      "@yext/visual-editor 2.0.0-beta.4 -> 2.0.0-beta.5"
    );
    expect(messages.join("\n")).toContain(
      "remove " + path.join(fixture.rootDirectory, ".template-manifest.json")
    );
    expect(messages.join("\n")).toContain(
      "remove " + path.join(fixture.rootDirectory, "src/templates/main.tsx")
    );
  });

  it.each([
    { change: "config", error: "Cannot map template ID" },
    { change: "generated file", error: "expected generated-file header" },
    {
      change: "ambiguous lockfiles",
      error: "Expected exactly one npm or pnpm lockfile",
    },
    {
      change: "unsupported manager",
      error: "Unsupported or ambiguous package manager lockfile",
    },
  ])("rejects $change before cleanup", ({ change, error }) => {
    const fixture = setup();
    if (change === "config") {
      fs.writeFileSync(
        fixture.configPath,
        "const config = { defaults: { templateId: 'unknown' }, templates: {} }; export default config;"
      );
    } else if (change === "generated file") {
      fs.writeFileSync(
        path.join(fixture.rootDirectory, "src/templates/main.tsx"),
        "export default {};\n"
      );
    } else if (change === "ambiguous lockfiles") {
      fs.outputFileSync(
        path.join(fixture.rootDirectory, "pnpm-lock.yaml"),
        "lockfileVersion: '9.0'\n"
      );
    } else {
      fs.outputFileSync(path.join(fixture.rootDirectory, "yarn.lock"), "");
    }
    expect(() =>
      convertTemplatesToSectionLibrary({
        apply: true,
        deleteSource: true,
        targetDirectory: fixture.rootDirectory,
        write: () => undefined,
        installDependencies: () => {
          throw new Error("installer should not run");
        },
      })
    ).toThrow(error);
    expect(fs.existsSync(fixture.templateDirectory)).toBe(true);
    expect(
      fs.existsSync(path.join(fixture.rootDirectory, ".template-manifest.json"))
    ).toBe(true);
    expect(
      fs.readJsonSync(fixture.packagePath).dependencies["@yext/visual-editor"]
    ).toBe("2.0.0-beta.4");
  });

  it("restores package files when dependency installation fails", () => {
    const fixture = setup();
    const originalPackage = fs.readFileSync(fixture.packagePath, "utf8");
    const originalLock = fs.readFileSync(fixture.lockPath, "utf8");
    expect(() =>
      convertTemplatesToSectionLibrary({
        apply: true,
        deleteSource: true,
        targetDirectory: fixture.rootDirectory,
        write: () => undefined,
        installDependencies: () => {
          fs.writeFileSync(fixture.lockPath, "partial install");
          throw new Error("install failed");
        },
      })
    ).toThrow("install failed");
    expect(fs.readFileSync(fixture.packagePath, "utf8")).toBe(originalPackage);
    expect(fs.readFileSync(fixture.lockPath, "utf8")).toBe(originalLock);
    expect(fs.existsSync(fixture.templateDirectory)).toBe(true);
    expect(
      fs.existsSync(path.join(fixture.rootDirectory, "src/templates/main.tsx"))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(fixture.rootDirectory, ".template-manifest.json"))
    ).toBe(true);
  });

  it("uses pnpm and updates dependencies in their existing sections", () => {
    const fixture = setup();
    fs.removeSync(fixture.lockPath);
    fs.outputFileSync(
      path.join(fixture.rootDirectory, "pnpm-lock.yaml"),
      "lockfileVersion: '9.0'\n"
    );
    fs.outputJsonSync(fixture.packagePath, {
      packageManager: "pnpm@10.0.0",
      dependencies: { "@yext/visual-editor": "2.0.0-beta.4" },
      devDependencies: { "@puckeditor/core": "0.22.2" },
    });
    let installedWith: string | undefined;
    convertTemplatesToSectionLibrary({
      apply: true,
      deleteSource: false,
      targetDirectory: fixture.rootDirectory,
      write: () => undefined,
      installDependencies: (manager) => {
        installedWith = manager;
      },
    });
    expect(installedWith).toBe("pnpm");
    const targetPackage = fs.readJsonSync(fixture.packagePath);
    expect(targetPackage.dependencies["@yext/visual-editor"]).toBe(
      "2.0.0-beta.5"
    );
    expect(targetPackage.devDependencies["@puckeditor/core"]).toBe(
      "0.24.0-canary.c1ec9773"
    );
    expect(fs.existsSync(fixture.templateDirectory)).toBe(true);
  });
});
