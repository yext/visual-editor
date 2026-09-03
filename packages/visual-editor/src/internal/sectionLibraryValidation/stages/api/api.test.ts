import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { createTempRoot } from "../../testUtils.ts";
import { validateApi } from "./api.ts";

describe("validateApi", () => {
  it("accepts one supported layout preview image", () => {
    const rootDir = createValidApiFiles();
    fs.outputFileSync(previewImagePath(rootDir, "preview.webp"), "image");

    expect(validateApi(rootDir).issues).toEqual([]);
  });

  it("reports multiple layout preview images", () => {
    const rootDir = createValidApiFiles();
    fs.outputFileSync(previewImagePath(rootDir, "preview.jpg"), "image");
    fs.outputFileSync(previewImagePath(rootDir, "preview.png"), "image");

    expect(validateApi(rootDir).issues).toEqual([
      expect.objectContaining({
        category: "api",
        rule: "layouts/preview-image",
      }),
    ]);
  });

  it("reports an oversized layout preview image", () => {
    const rootDir = createValidApiFiles();
    const imagePath = previewImagePath(rootDir, "preview.png");
    fs.ensureFileSync(imagePath);
    fs.truncateSync(imagePath, 20 * 1024 * 1024 + 1);

    expect(validateApi(rootDir).issues).toEqual([
      expect.objectContaining({
        category: "api",
        rule: "layouts/preview-image",
      }),
    ]);
  });
});

const createValidApiFiles = (): string => {
  const rootDir = createTempRoot();
  fs.outputJsonSync(path.join(rootDir, "src", "library", "library.json"), {
    schemaVersion: 1,
    id: "library",
    displayName: "Library",
    description: "Description",
  });
  return rootDir;
};

const previewImagePath = (rootDir: string, filename: string): string =>
  path.join(rootDir, "src", "library", "layouts", "entity-layout", filename);
