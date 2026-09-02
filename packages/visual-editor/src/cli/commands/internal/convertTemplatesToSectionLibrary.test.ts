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
