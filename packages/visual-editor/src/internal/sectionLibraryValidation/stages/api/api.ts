import path from "node:path";
import fs from "fs-extra";
import type { LibraryMetadata } from "../../../../types/sectionLibrary.ts";
import type { ValidationIssue } from "../../types.ts";
import { validateLibraryMetadata } from "./libraryMetadata.ts";

const previewImageFilenames = new Set([
  "preview.png",
  "preview.jpg",
  "preview.jpeg",
  "preview.webp",
]);
const maxPreviewImageSizeBytes = 20 * 1024 * 1024;

/** validateApi validates files that are only consumed by the Section Library API. */
export const validateApi = (
  rootDir: string
): { issues: ValidationIssue[]; metadata?: LibraryMetadata } => {
  const metadataResult = validateLibraryMetadata(rootDir);
  const issues = [...metadataResult.issues];
  const layoutsDirectory = path.join(rootDir, "src", "library", "layouts");

  if (fs.existsSync(layoutsDirectory)) {
    for (const entry of fs
      .readdirSync(layoutsDirectory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())) {
      const layoutDirectory = path.join(layoutsDirectory, entry.name);
      const previewImagePaths = fs
        .readdirSync(layoutDirectory, { withFileTypes: true })
        .filter(
          (entry) => entry.isFile() && previewImageFilenames.has(entry.name)
        )
        .map((entry) => path.join(layoutDirectory, entry.name));

      if (previewImagePaths.length > 1) {
        issues.push({
          category: "api",
          filePath: path.relative(rootDir, layoutDirectory),
          message: "A layout may contain only one preview image.",
          rule: "layouts/preview-image",
        });
        continue;
      }

      const previewImagePath = previewImagePaths[0];
      if (
        previewImagePath &&
        fs.statSync(previewImagePath).size > maxPreviewImageSizeBytes
      ) {
        issues.push({
          category: "api",
          filePath: path.relative(rootDir, previewImagePath),
          message: "Layout preview images must be 20 MiB or smaller.",
          rule: "layouts/preview-image",
        });
      }
    }
  }

  return { ...metadataResult, issues };
};
