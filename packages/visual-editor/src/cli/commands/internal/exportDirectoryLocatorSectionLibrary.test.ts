import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import { exportDirectoryLocatorSectionLibrary } from "./exportDirectoryLocatorSectionLibrary.ts";

const temporaryDirectories: string[] = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.removeSync(directory);
  }
});

describe("exportDirectoryLocatorSectionLibrary", () => {
  it.each(["directory", "locator"])(
    "refuses to overwrite the existing %s layout without --overwrite",
    (layoutId) => {
      const targetDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), "directory-locator-library-")
      );
      temporaryDirectories.push(targetDirectory);
      const layoutDirectory = path.join(
        targetDirectory,
        "src",
        "library",
        "layouts",
        layoutId
      );
      fs.ensureDirSync(layoutDirectory);
      const metadataPath = path.join(layoutDirectory, "metadata.json");
      fs.writeFileSync(metadataPath, "existing metadata");

      expect(() =>
        exportDirectoryLocatorSectionLibrary({
          targetDirectory,
          overwrite: false,
        })
      ).toThrow(
        `Refusing to overwrite existing layout at ${layoutDirectory}. Pass --overwrite to override.`
      );
      expect(fs.readFileSync(metadataPath, "utf8")).toBe("existing metadata");
      expect(
        fs.existsSync(path.join(targetDirectory, "src", "library", "shared"))
      ).toBe(false);
    }
  );

  it("exports deterministic editable Directory and Locator source", () => {
    const targetDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "directory-locator-library-")
    );
    temporaryDirectories.push(targetDirectory);

    exportDirectoryLocatorSectionLibrary({
      targetDirectory,
      overwrite: false,
    });

    const libraryDirectory = path.join(targetDirectory, "src", "library");
    const directorySection = fs.readFileSync(
      path.join(libraryDirectory, "sections", "Directory.tsx"),
      "utf8"
    );
    const locatorSection = fs.readFileSync(
      path.join(libraryDirectory, "sections", "Locator.tsx"),
      "utf8"
    );
    const registryPath = path.join(
      libraryDirectory,
      "shared",
      "componentRegistry.ts"
    );
    const registry = fs.readFileSync(registryPath, "utf8");

    expect(directorySection).toContain('id: "Directory"');
    expect(directorySection).toContain('pageSetTypes: ["DIRECTORY"]');
    expect(directorySection).toContain('category: "Standard Sections"');
    expect(locatorSection).toContain('id: "Locator"');
    expect(locatorSection).toContain('pageSetTypes: ["LOCATOR"]');
    expect(
      fs.existsSync(
        path.join(libraryDirectory, "sections", "BannerSection.tsx")
      )
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(libraryDirectory, "sections", "ExpandedHeader.tsx")
      )
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(libraryDirectory, "sections", "ExpandedFooter.tsx")
      )
    ).toBe(false);
    expect(
      fs.existsSync(
        path.join(libraryDirectory, "sections", "CustomCodeSection.tsx")
      )
    ).toBe(false);
    expect(registry).toContain("sharedRootAllowedComponentIds");
    expect(registry).toContain("sharedRootPageSetTypes");
    ["DirectoryCard", "AddressSlot", "HoursStatusSlot", "PhoneSlot"].forEach(
      (componentId) => {
        expect(registry).toContain(`id: "${componentId}"`);
        expect(registry).toContain(`"${componentId}": SharedComponent`);
      }
    );
    expect(registry).toContain(
      'DIRECTORY: ["MainContent", "CustomCodeSection"]'
    );
    expect(registry).toContain('LOCATOR: ["MainContent", "CustomCodeSection"]');
    expect(
      fs
        .readJsonSync(
          path.join(
            libraryDirectory,
            "layouts",
            "directory",
            "defaultLayout.json"
          )
        )
        .content.map(({ type }: { type: string }) => type)
    ).toEqual(["MainContent"]);
    expect(
      fs.readJsonSync(
        path.join(libraryDirectory, "shared", "sourceVersion.json")
      )
    ).toMatchObject({ visualEditorVersion: expect.any(String) });
    expect(
      fs.readJsonSync(
        path.join(libraryDirectory, "layouts", "directory", "metadata.json")
      )
    ).toMatchObject({ pageSetType: "DIRECTORY" });
    expect(
      fs.readJsonSync(
        path.join(libraryDirectory, "layouts", "locator", "metadata.json")
      )
    ).toMatchObject({ pageSetType: "LOCATOR" });

    exportDirectoryLocatorSectionLibrary({
      targetDirectory,
      overwrite: true,
    });

    expect(fs.readFileSync(registryPath, "utf8")).toBe(registry);
  });

  it("uses the existing library ID for layout names", () => {
    const targetDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "directory-locator-library-")
    );
    temporaryDirectories.push(targetDirectory);
    fs.outputJsonSync(
      path.join(targetDirectory, "src", "library", "library.json"),
      {
        schemaVersion: 1,
        id: "test-library",
        displayName: "Test Library",
        description: "A test library.",
      }
    );

    exportDirectoryLocatorSectionLibrary({
      targetDirectory,
      overwrite: false,
    });

    const layoutsDirectory = path.join(
      targetDirectory,
      "src",
      "library",
      "layouts"
    );
    expect(
      fs.existsSync(path.join(layoutsDirectory, "test-library-directory"))
    ).toBe(true);
    expect(
      fs.existsSync(path.join(layoutsDirectory, "test-library-locator"))
    ).toBe(true);
    expect(fs.existsSync(path.join(layoutsDirectory, "directory"))).toBe(false);
    expect(fs.existsSync(path.join(layoutsDirectory, "locator"))).toBe(false);
  });
});
