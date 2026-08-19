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
  it("exports deterministic editable Directory and Locator source", () => {
    const targetDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "directory-locator-library-")
    );
    temporaryDirectories.push(targetDirectory);

    exportDirectoryLocatorSectionLibrary({
      targetDirectory,
      libraryId: "test-library",
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
    const bannerSection = fs.readFileSync(
      path.join(libraryDirectory, "sections", "BannerSection.tsx"),
      "utf8"
    );
    const headerSection = fs.readFileSync(
      path.join(libraryDirectory, "sections", "ExpandedHeader.tsx"),
      "utf8"
    );
    const footerSection = fs.readFileSync(
      path.join(libraryDirectory, "sections", "ExpandedFooter.tsx"),
      "utf8"
    );
    const customCodeSection = fs.readFileSync(
      path.join(libraryDirectory, "sections", "CustomCodeSection.tsx"),
      "utf8"
    );
    const registryPath = path.join(
      libraryDirectory,
      "shared",
      "sectionRegistry.ts"
    );
    const registry = fs.readFileSync(registryPath, "utf8");

    expect(directorySection).toContain('id: "Directory"');
    expect(directorySection).toContain('pageSetTypes: ["DIRECTORY"]');
    expect(directorySection).toContain('category: "Standard Sections"');
    expect(locatorSection).toContain('id: "Locator"');
    expect(locatorSection).toContain('pageSetTypes: ["LOCATOR"]');
    expect(bannerSection).toContain('category: "Standard Sections"');
    expect(headerSection).toContain('category: "Other"');
    expect(footerSection).toContain('category: "Other"');
    expect(customCodeSection).toContain('category: "Other"');
    expect(registry).not.toContain('"directory-header"');
    expect(registry).not.toContain('"locator-header"');
    expect(registry).toContain("sharedRootAllowedComponentIds");
    expect(registry).toContain("sharedRootPageSetTypes");
    expect(registry).toContain('"ExpandedHeader"');
    expect(registry).toContain('"ExpandedFooter"');
    expect(registry).toContain('"CustomCodeSection"');
    expect(
      fs
        .readJsonSync(
          path.join(
            libraryDirectory,
            "layouts",
            "test-library-directory",
            "defaultLayout.json"
          )
        )
        .content.map(({ type }: { type: string }) => type)
    ).toEqual(expect.arrayContaining(["ExpandedHeader", "ExpandedFooter"]));
    expect(
      fs.readJsonSync(
        path.join(libraryDirectory, "shared", "sourceVersion.json")
      )
    ).toMatchObject({ visualEditorVersion: expect.any(String) });
    expect(
      fs.readJsonSync(
        path.join(
          libraryDirectory,
          "layouts",
          "test-library-directory",
          "metadata.json"
        )
      )
    ).toMatchObject({ pageSetType: "DIRECTORY" });
    expect(
      fs.readJsonSync(
        path.join(
          libraryDirectory,
          "layouts",
          "test-library-locator",
          "metadata.json"
        )
      )
    ).toMatchObject({ pageSetType: "LOCATOR" });

    exportDirectoryLocatorSectionLibrary({
      targetDirectory,
      libraryId: "test-library",
      overwrite: true,
    });

    expect(fs.readFileSync(registryPath, "utf8")).toBe(registry);
  });
});
