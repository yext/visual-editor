import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import {
  cleanupGeneratedSectionLibraryFiles,
  generateSectionLibraryFiles,
} from "./sectionLibraryGenerator.ts";

const tempRoots: string[] = [];

afterEach(() => {
  for (const rootDir of tempRoots.splice(0)) {
    fs.removeSync(rootDir);
  }
});

describe("generateSectionLibraryFiles", () => {
  it("maps the Entity layout to the Platform main template", () => {
    const rootDir = createLibrary();

    const result = generateSectionLibraryFiles(rootDir);

    expect(result.generatedFiles).toHaveLength(5);
    const config = fs.readFileSync(
      path.join(rootDir, "src", "library", ".generated", "libraryConfig.tsx"),
      "utf8"
    );
    expect(config).toContain("label: section.config.displayName");
    expect(config).toContain('id: "hero"');
    expect(config).toContain("import { Hero as Section0");
    expect(config).toContain('components: ["MainContent"]');
    expect(config).not.toContain("mainConfig");
    expect(config).not.toContain("directoryConfig");
    expect(config).not.toContain("locatorConfig");
    expect(config).not.toContain("Object.groupBy");
    const mainTemplate = fs.readFileSync(
      path.join(rootDir, "src", "templates", "main.tsx"),
      "utf8"
    );
    const locationTemplate = fs.readFileSync(
      path.join(rootDir, "src", "templates", "location.tsx"),
      "utf8"
    );
    expect(mainTemplate).toContain('const layoutId = "location"');
    expect(mainTemplate).toBe(locationTemplate);
    expect(
      fs.readFileSync(
        path.join(rootDir, "src", "templates", "edit-location.tsx"),
        "utf8"
      )
    ).toContain('const editorPath = "edit/location"');
    expect(
      fs.readFileSync(
        path.join(rootDir, "src", "templates", "edit.tsx"),
        "utf8"
      )
    ).toContain('const editorName = "edit"');
    expect(
      fs.readJsonSync(path.join(rootDir, ".template-manifest.json"))
    ).toEqual({
      templates: [
        expect.objectContaining({
          name: "main",
          defaultLayoutData: expect.any(String),
        }),
        expect.objectContaining({
          name: "location",
          defaultLayoutData: expect.any(String),
        }),
      ],
    });
    expect(
      JSON.parse(
        fs.readJsonSync(path.join(rootDir, ".template-manifest.json"))
          .templates[0].defaultLayoutData
      )
    ).toEqual(
      expect.objectContaining({
        root: expect.objectContaining({
          props: expect.objectContaining({ version: 73 }),
        }),
      })
    );
    expect(result.manifestSource).toContain('"templateId": "location"');
    expect(result.manifestSource).toContain('"editorPath": "edit/location"');
    expect(result.manifestSource).toContain(
      '"vertical": [\n        "RETAIL"\n      ]'
    );
    expect(result.manifestSource).toContain(
      '"purpose": [\n        "LOCATION"\n      ]'
    );
  });

  it("does not remove a handwritten template", () => {
    const rootDir = createLibrary();
    const handwrittenMainPath = path.join(
      rootDir,
      "src",
      "templates",
      "main.tsx"
    );
    fs.ensureDirSync(path.dirname(handwrittenMainPath));
    fs.writeFileSync(handwrittenMainPath, "export default null;");

    const { generatedFiles } = generateSectionLibraryFiles(rootDir);
    cleanupGeneratedSectionLibraryFiles(generatedFiles);

    expect(fs.readFileSync(handwrittenMainPath, "utf8")).toBe(
      "export default null;"
    );
    expect(generatedFiles).toHaveLength(4);
    for (const filePath of generatedFiles) {
      expect(fs.existsSync(filePath)).toBe(false);
    }
    expect(fs.existsSync(path.join(rootDir, ".template-manifest.json"))).toBe(
      true
    );
  });

  it("does not generate files without library metadata", () => {
    const rootDir = createLibrary();
    fs.removeSync(path.join(rootDir, "src", "library", "library.json"));

    expect(generateSectionLibraryFiles(rootDir)).toEqual({
      generatedFiles: [],
    });
    expect(
      fs.existsSync(
        path.join(rootDir, "src", "library", ".generated", "libraryConfig.tsx")
      )
    ).toBe(false);
    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "main.tsx"))
    ).toBe(false);
  });

  it("rejects the layout ID reserved for the editor template", () => {
    const rootDir = createLibrary();
    fs.writeJsonSync(
      path.join(
        rootDir,
        "src",
        "library",
        "layouts",
        "location",
        "metadata.json"
      ),
      {
        id: "edit",
        displayName: "Edit",
        previewImageUrl: "",
        pageSetType: "ENTITY",
      }
    );

    expect(() => generateSectionLibraryFiles(rootDir)).toThrow(
      /edit because it is reserved for the generated editor template/
    );
    expect(
      fs.existsSync(
        path.join(rootDir, "src", "library", ".generated", "libraryConfig.tsx")
      )
    ).toBe(false);
    expect(
      fs.existsSync(path.join(rootDir, "src", "templates", "edit.tsx"))
    ).toBe(false);
  });

  it("reads JSX sections", () => {
    const rootDir = createLibrary();
    const sectionsDirectory = path.join(rootDir, "src", "library", "sections");
    fs.removeSync(path.join(sectionsDirectory, "Hero.tsx"));
    fs.writeFileSync(
      path.join(sectionsDirectory, "Hero.jsx"),
      'export const Hero = () => <section />;\nexport const config = { id: "hero", displayName: "Hero", description: "A hero.", pageSetTypes: ["ENTITY"] };'
    );

    generateSectionLibraryFiles(rootDir);

    expect(
      fs.readFileSync(
        path.join(rootDir, "src", "library", ".generated", "libraryConfig.tsx"),
        "utf8"
      )
    ).toContain('from "../sections/Hero"');
  });

  it("reads indirect component and config exports", () => {
    const rootDir = createLibrary();
    fs.writeFileSync(
      path.join(rootDir, "src", "library", "sections", "Hero.tsx"),
      [
        'import type { SectionConfig } from "@yext/visual-editor";',
        "const HeroComponent = () => <section />;",
        'const heroConfig: SectionConfig = { id: "hero", displayName: "Hero", description: "A hero.", pageSetTypes: ["ENTITY"] };',
        "export { HeroComponent as Hero, heroConfig as config };",
      ].join("\n")
    );

    generateSectionLibraryFiles(rootDir);

    expect(
      fs.readFileSync(
        path.join(rootDir, "src", "library", ".generated", "libraryConfig.tsx"),
        "utf8"
      )
    ).toContain("import { Hero as Section0");
  });

  it("uses the config ID after a section file is renamed", () => {
    const rootDir = createLibrary();
    const sectionsDirectory = path.join(rootDir, "src", "library", "sections");
    fs.removeSync(path.join(sectionsDirectory, "Hero.tsx"));
    fs.writeFileSync(
      path.join(sectionsDirectory, "NewHero.tsx"),
      [
        'import type { SectionConfig } from "@yext/visual-editor";',
        "export const NewHero = {};",
        'export const config: SectionConfig = { id: "hero", displayName: "Hero", description: "A hero.", pageSetTypes: ["ENTITY"] };',
      ].join("\n")
    );

    generateSectionLibraryFiles(rootDir);

    const config = fs.readFileSync(
      path.join(rootDir, "src", "library", ".generated", "libraryConfig.tsx"),
      "utf8"
    );
    expect(config).toContain('from "../sections/NewHero"');
    expect(config).toContain("import { NewHero as Section0");
    expect(config).toContain('id: "hero"');
  });

  it.each([
    {
      name: "missing config",
      update: (rootDir: string): void => {
        fs.writeFileSync(
          path.join(rootDir, "src", "library", "sections", "Hero.tsx"),
          "export const Hero = {};"
        );
      },
      error: /must export 'config'/,
    },
    {
      name: "missing component export",
      update: (rootDir: string): void => {
        fs.writeFileSync(
          path.join(rootDir, "src", "library", "sections", "Hero.tsx"),
          'export const config = { displayName: "Hero", description: "Hero", pageSetTypes: ["ENTITY"] };'
        );
      },
      error: /must export 'Hero'/,
    },
    {
      name: "untyped config",
      update: (rootDir: string): void => {
        fs.writeFileSync(
          path.join(rootDir, "src", "library", "sections", "Hero.tsx"),
          'export const Hero = {};\nexport const config = { displayName: "Hero", description: "Hero", pageSetTypes: ["ENTITY"] };'
        );
      },
      error: /must use the SectionConfig type/,
    },
    {
      name: "missing section ID",
      update: (rootDir: string): void => {
        fs.writeFileSync(
          path.join(rootDir, "src", "library", "sections", "Hero.tsx"),
          [
            'import type { SectionConfig } from "@yext/visual-editor";',
            "export const Hero = {};",
            'export const config: SectionConfig = { displayName: "Hero", description: "Hero", pageSetTypes: ["ENTITY"] };',
          ].join("\n")
        );
      },
      error: /must define a valid id/,
    },
    {
      name: "empty section ID",
      update: (rootDir: string): void => {
        fs.writeFileSync(
          path.join(rootDir, "src", "library", "sections", "Hero.tsx"),
          [
            'import type { SectionConfig } from "@yext/visual-editor";',
            "export const Hero = {};",
            'export const config: SectionConfig = { id: "", displayName: "Hero", description: "Hero", pageSetTypes: ["ENTITY"] };',
          ].join("\n")
        );
      },
      error: /must define a valid id/,
    },
    {
      name: "unsafe section ID",
      update: (rootDir: string): void => {
        fs.writeFileSync(
          path.join(rootDir, "src", "library", "sections", "Hero.tsx"),
          [
            'import type { SectionConfig } from "@yext/visual-editor";',
            "export const Hero = {};",
            'export const config: SectionConfig = { id: "invalid id", displayName: "Hero", description: "Hero", pageSetTypes: ["ENTITY"] };',
          ].join("\n")
        );
      },
      error: /must define a valid id/,
    },
    {
      name: "non-string page set type",
      update: (rootDir: string): void => {
        fs.writeFileSync(
          path.join(rootDir, "src", "library", "sections", "Hero.tsx"),
          [
            'import type { SectionConfig } from "@yext/visual-editor";',
            "export const Hero = {};",
            'export const config: SectionConfig = { id: "hero", displayName: "Hero", description: "Hero", pageSetTypes: [1] };',
          ].join("\n")
        );
      },
      error: /must contain only ENTITY, DIRECTORY, or LOCATOR/,
    },
    {
      name: "unsupported page set type",
      update: (rootDir: string): void => {
        fs.writeFileSync(
          path.join(rootDir, "src", "library", "sections", "Hero.tsx"),
          [
            'import type { SectionConfig } from "@yext/visual-editor";',
            "export const Hero = {};",
            'export const config: SectionConfig = { id: "hero", displayName: "Hero", description: "Hero", pageSetTypes: ["ALL"] };',
          ].join("\n")
        );
      },
      error: /must contain only ENTITY, DIRECTORY, or LOCATOR/,
    },
    {
      name: "duplicate section ID",
      update: (rootDir: string): void => {
        fs.writeFileSync(
          path.join(rootDir, "src", "library", "sections", "SecondHero.tsx"),
          [
            'import type { SectionConfig } from "@yext/visual-editor";',
            "export const SecondHero = {};",
            'export const config: SectionConfig = { id: "hero", displayName: "Second Hero", description: "Another hero.", pageSetTypes: ["ENTITY"] };',
          ].join("\n")
        );
      },
      error: /Section ID is not unique: hero/,
    },
    {
      name: "invalid library metadata",
      update: (rootDir: string): void => {
        fs.writeJsonSync(path.join(rootDir, "src", "library", "library.json"), {
          schemaVersion: 2,
          id: "library",
          displayName: "Library",
          description: "A test library.",
        });
      },
      error: /must set schemaVersion to 1/,
    },
    {
      name: "unsupported layout vertical",
      update: (rootDir: string): void => {
        fs.writeJsonSync(
          path.join(
            rootDir,
            "src",
            "library",
            "layouts",
            "location",
            "metadata.json"
          ),
          {
            id: "location",
            displayName: "Location",
            previewImageUrl: "",
            vertical: ["UNKNOWN"],
            pageSetType: "ENTITY",
          }
        );
      },
      error: /vertical as a list of supported values/,
    },
    {
      name: "nested sections",
      update: (rootDir: string): void => {
        fs.ensureDirSync(
          path.join(rootDir, "src", "library", "sections", "nested")
        );
      },
      error: /Section directories are not supported/,
    },
    {
      name: "non Entity layout",
      update: (rootDir: string): void => {
        fs.writeJsonSync(
          path.join(
            rootDir,
            "src",
            "library",
            "layouts",
            "location",
            "metadata.json"
          ),
          {
            id: "location",
            displayName: "Location",
            previewImageUrl: "",
            pageSetType: "DIRECTORY",
          }
        );
      },
      error: /must set pageSetType to ENTITY/,
    },
    {
      name: "missing layout section",
      update: (rootDir: string): void => {
        fs.writeJsonSync(
          path.join(
            rootDir,
            "src",
            "library",
            "layouts",
            "location",
            "defaultLayout.json"
          ),
          {
            root: { props: {} },
            content: [{ type: "Missing", props: {} }],
            zones: {},
          }
        );
      },
      error: /references missing section Missing/,
    },
  ])("rejects $name", ({ update, error }) => {
    const rootDir = createLibrary();
    update(rootDir);

    expect(() => generateSectionLibraryFiles(rootDir)).toThrow(error);
  });
});

const createLibrary = (): string => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "section-library-"));
  tempRoots.push(rootDir);
  const libraryDirectory = path.join(rootDir, "src", "library");
  fs.ensureDirSync(path.join(libraryDirectory, "sections"));
  fs.ensureDirSync(path.join(libraryDirectory, "layouts", "location"));
  fs.writeJsonSync(path.join(libraryDirectory, "library.json"), {
    schemaVersion: 1,
    id: "library",
    displayName: "Library",
    description: "A test library.",
  });
  fs.writeFileSync(
    path.join(libraryDirectory, "sections", "Hero.tsx"),
    [
      'import type { SectionConfig } from "@yext/visual-editor";',
      "export const Hero = {};",
      'export const config: SectionConfig = { id: "hero", displayName: "Hero", description: "A hero.", pageSetTypes: ["ENTITY"], category: "Content" };',
    ].join("\n")
  );
  fs.writeJsonSync(
    path.join(libraryDirectory, "layouts", "location", "metadata.json"),
    {
      id: "location",
      displayName: "Location",
      previewImageUrl: "",
      vertical: ["RETAIL"],
      purpose: ["LOCATION"],
      pageSetType: "ENTITY",
    }
  );
  fs.writeJsonSync(
    path.join(libraryDirectory, "layouts", "location", "defaultLayout.json"),
    {
      root: { props: { version: 73 } },
      content: [{ type: "hero", props: {} }],
      zones: {},
    }
  );
  return rootDir;
};
