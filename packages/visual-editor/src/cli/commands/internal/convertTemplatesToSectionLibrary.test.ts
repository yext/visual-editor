import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { createTempRoot } from "../../../internal/sectionLibraryValidation/testUtils.ts";
import { purposes, verticals } from "../../../types/sectionLibrary.ts";
import { convertTemplatesToSectionLibrary } from "./convertTemplatesToSectionLibrary.ts";

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

    convertTemplatesToSectionLibrary({
      apply: true,
      deleteSource: false,
      targetDirectory: rootDirectory,
      write: () => undefined,
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
  const convert = () =>
    convertTemplatesToSectionLibrary({
      apply: true,
      deleteSource: false,
      targetDirectory: rootDirectory,
      write: () => undefined,
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
