/**
 * Locates or stages the Directory and Locator base library, then validates its
 * required layouts, sections, and metadata before conversion.
 */
import fs from "node:fs";
import path from "node:path";
import { exportDirectoryLocatorSectionLibrary } from "../exportDirectoryLocatorSectionLibrary.ts";
import {
  ID_REQUIREMENTS,
  REQUIRED_BASE_SECTIONS,
  SAFE_ID,
  isRecord,
  readJson,
  validateDefaultLayout,
} from "./shared.ts";
import type { BaseLayout, BaseLibrary, PreparedBaseLibrary } from "./types.ts";

/**
 * Returns the existing base library, or creates a temporary Directory and
 * Locator base that the conversion can validate and apply atomically.
 */
export const prepareBaseLibrary = (
  rootDirectory: string
): PreparedBaseLibrary => {
  const libraryDirectory = path.join(rootDirectory, "src", "library");
  if (hasDirectoryLocatorBase(libraryDirectory)) {
    return { directory: libraryDirectory };
  }

  const temporaryDirectory = fs.mkdtempSync(
    path.join(rootDirectory, "src", ".section-library-base-")
  );
  const temporaryLibraryDirectory = path.join(
    temporaryDirectory,
    "src",
    "library"
  );
  if (fs.existsSync(libraryDirectory)) {
    fs.cpSync(libraryDirectory, temporaryLibraryDirectory, {
      recursive: true,
    });
  }
  exportDirectoryLocatorSectionLibrary({
    targetDirectory: temporaryDirectory,
    overwrite: fs.existsSync(path.join(temporaryLibraryDirectory, "shared")),
  });
  return {
    directory: temporaryLibraryDirectory,
    temporaryDirectory,
  };
};

/** Checks whether an existing library already contains a complete base. */
const hasDirectoryLocatorBase = (libraryDirectory: string): boolean => {
  const sectionsDirectory = path.join(libraryDirectory, "sections");
  if (
    !fs.existsSync(
      path.join(libraryDirectory, "shared", "componentRegistry.ts")
    ) ||
    !fs.existsSync(path.join(sectionsDirectory, "Directory.tsx")) ||
    !fs.existsSync(path.join(sectionsDirectory, "Locator.tsx"))
  ) {
    return false;
  }
  const layoutsDirectory = path.join(libraryDirectory, "layouts");
  if (!fs.existsSync(layoutsDirectory)) {
    return false;
  }
  const pageSetTypes = fs
    .readdirSync(layoutsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      try {
        const metadata = readJson(
          path.join(layoutsDirectory, entry.name, "metadata.json"),
          `layout metadata for ${entry.name}`
        );
        return isRecord(metadata) &&
          (metadata.pageSetType === "DIRECTORY" ||
            metadata.pageSetType === "LOCATOR")
          ? [metadata.pageSetType]
          : [];
      } catch {
        return [];
      }
    });
  return (
    pageSetTypes.filter((pageSetType) => pageSetType === "DIRECTORY").length ===
      1 &&
    pageSetTypes.filter((pageSetType) => pageSetType === "LOCATOR").length === 1
  );
};

/** Reads the base layouts and rejects missing or inconsistent layout source. */
export const readBaseLibrary = (libraryDirectory: string): BaseLibrary => {
  const layoutsDirectory = path.join(libraryDirectory, "layouts");
  const sectionsDirectory = path.join(libraryDirectory, "sections");
  const sharedRegistryPath = path.join(
    libraryDirectory,
    "shared",
    "componentRegistry.ts"
  );
  for (const requiredPath of [
    layoutsDirectory,
    sectionsDirectory,
    sharedRegistryPath,
  ]) {
    if (!fs.existsSync(requiredPath)) {
      throw new Error(`Base Section Library is missing ${requiredPath}`);
    }
  }
  const layouts = fs
    .readdirSync(layoutsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const directory = path.join(layoutsDirectory, entry.name);
      const metadataPath = path.join(directory, "metadata.json");
      const metadata = readJson(
        metadataPath,
        `layout metadata for ${entry.name}`
      );
      const issues: string[] = [];
      if (!isRecord(metadata)) {
        issues.push("metadata must be a JSON object.");
      } else {
        if (
          !["ENTITY", "DIRECTORY", "LOCATOR"].includes(metadata.pageSetType)
        ) {
          issues.push(
            `pageSetType must be ENTITY, DIRECTORY, or LOCATOR; received ${JSON.stringify(metadata.pageSetType)}.`
          );
        }
        if (typeof metadata.id !== "string") {
          issues.push(
            `id must be a string; received ${JSON.stringify(metadata.id)}.`
          );
        } else {
          if (metadata.id !== entry.name) {
            issues.push(
              `id must match directory name ${JSON.stringify(entry.name)}; received ${JSON.stringify(metadata.id)}.`
            );
          }
          if (!SAFE_ID.test(metadata.id)) {
            issues.push(
              `id ${ID_REQUIREMENTS}; received ${JSON.stringify(metadata.id)}.`
            );
          }
        }
      }
      if (issues.length > 0) {
        throw new Error(
          `Base layout metadata is not valid: ${metadataPath}\n${issues.map((issue) => `  - ${issue}`).join("\n")}`
        );
      }
      const defaultLayoutPath = path.join(directory, "defaultLayout.json");
      const defaultLayout = readJson(
        defaultLayoutPath,
        `base default layout for ${entry.name}`
      );
      validateDefaultLayout(defaultLayout, defaultLayoutPath, "Base");
      return { directory, metadata } as BaseLayout;
    });
  const directoryLayouts = layouts.filter(
    (layout) => layout.metadata.pageSetType === "DIRECTORY"
  );
  const locatorLayouts = layouts.filter(
    (layout) => layout.metadata.pageSetType === "LOCATOR"
  );
  if (directoryLayouts.length !== 1 || locatorLayouts.length !== 1) {
    throw new Error(
      "Base Section Library must contain one Directory layout and one Locator layout"
    );
  }

  const sectionIds = fs
    .readdirSync(sectionsDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && [".tsx", ".jsx"].includes(path.extname(entry.name))
    )
    .map((entry) => path.basename(entry.name, path.extname(entry.name)));
  for (const requiredSection of REQUIRED_BASE_SECTIONS) {
    if (!sectionIds.includes(requiredSection)) {
      throw new Error(`Base Section Library is missing ${requiredSection}.tsx`);
    }
  }
  return {
    directory: directoryLayouts[0],
    locator: locatorLayouts[0],
    layouts,
  };
};
