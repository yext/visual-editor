import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { createTempRoot } from "../../../internal/sectionLibraryValidation/testUtils.ts";
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
      previewImageUrl: "https://example.com/preview.png",
    });
    fs.outputJsonSync(path.join(templateDirectory, "defaultLayout.json"), {
      root: {},
      zones: {},
      content: [
        {
          type: "MainContent",
          props: {
            content: [
              { type: "yext-Hero", props: {} },
              { type: "YextBanner", props: {} },
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
        "",
        "export const YextBanner: YextComponentConfig = {",
        '  label: "Banner",',
        "  render: () => null,",
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
      fs.existsSync(path.join(libraryDirectory, "sections", "Hero.tsx"))
    ).toBe(true);
    expect(
      fs.readFileSync(
        path.join(libraryDirectory, "sections", "Banner.tsx"),
        "utf8"
      )
    ).toContain("export const Banner: YextComponentConfig");
    expect(
      fs.readFileSync(
        path.join(libraryDirectory, "sections", "Banner.tsx"),
        "utf8"
      )
    ).not.toContain("YextBanner");
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
