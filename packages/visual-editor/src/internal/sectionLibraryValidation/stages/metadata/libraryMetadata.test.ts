import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { createTempRoot } from "../../testUtils.ts";
import { validateLibraryMetadata } from "./libraryMetadata.ts";

describe("validateLibraryMetadata", () => {
  it("reports a missing library.json", () => {
    expect(validateLibraryMetadata(createTempRoot()).issues).toMatchObject([
      { rule: "file/missing" },
    ]);
  });

  it("reports malformed JSON", () => {
    const rootDir = createTempRoot();
    writeLibraryJsonSource(rootDir, "{");

    expect(validateLibraryMetadata(rootDir).issues).toMatchObject([
      { rule: "json/invalid" },
    ]);
  });

  it.each([null, [], "library"])(
    "reports a non-object JSON root for %j",
    (value) => {
      const rootDir = createTempRoot();
      writeLibraryJson(rootDir, value);

      expect(validateLibraryMetadata(rootDir).issues).toMatchObject([
        { rule: "json/object" },
      ]);
    }
  );

  it("reports an unsupported schema version", () => {
    const rootDir = createTempRoot();
    writeLibraryJson(rootDir, validMetadata({ schemaVersion: 2 }));

    expect(validateLibraryMetadata(rootDir).issues).toContainEqual(
      expect.objectContaining({ rule: "schema/version" })
    );
  });

  it.each(["id", "displayName", "description"] as const)(
    "reports a non-string %s",
    (field) => {
      const rootDir = createTempRoot();
      writeLibraryJson(rootDir, validMetadata({ [field]: 42 }));

      expect(validateLibraryMetadata(rootDir).issues).toContainEqual(
        expect.objectContaining({ rule: `field/${field}/type` })
      );
    }
  );

  it.each(["id", "displayName"] as const)("reports an empty %s", (field) => {
    const rootDir = createTempRoot();
    writeLibraryJson(rootDir, validMetadata({ [field]: " " }));

    expect(validateLibraryMetadata(rootDir).issues).toContainEqual(
      expect.objectContaining({ rule: `field/${field}/empty` })
    );
  });

  it("reports a description longer than 1,024 characters", () => {
    const rootDir = createTempRoot();
    writeLibraryJson(rootDir, validMetadata({ description: "a".repeat(1025) }));

    expect(validateLibraryMetadata(rootDir).issues).toContainEqual(
      expect.objectContaining({ rule: "field/description/length" })
    );
  });

  it("reports an unsafe id", () => {
    const rootDir = createTempRoot();
    writeLibraryJson(rootDir, validMetadata({ id: "unsafe id" }));

    expect(validateLibraryMetadata(rootDir).issues).toContainEqual(
      expect.objectContaining({ rule: "field/id/safe" })
    );
  });

  it("aggregates independent field errors", () => {
    const rootDir = createTempRoot();
    writeLibraryJson(rootDir, {
      schemaVersion: 1,
      id: 42,
      displayName: "",
      description: null,
    });

    expect(validateLibraryMetadata(rootDir).issues).toHaveLength(3);
  });

  it("returns valid metadata", () => {
    const rootDir = createTempRoot();
    writeLibraryJson(rootDir, validMetadata({ futureField: true }));

    expect(validateLibraryMetadata(rootDir)).toEqual({
      issues: [],
      metadata: validMetadata(),
    });
  });
});

const validMetadata = (
  overrides: Record<string, unknown> = {}
): Record<string, unknown> => ({
  schemaVersion: 1,
  id: "safe-id",
  displayName: "Library",
  description: "Description",
  ...overrides,
});

const writeLibraryJson = (rootDir: string, value: unknown): void => {
  fs.outputJsonSync(libraryJsonPath(rootDir), value);
};

const writeLibraryJsonSource = (rootDir: string, value: string): void => {
  fs.outputFileSync(libraryJsonPath(rootDir), value);
};

const libraryJsonPath = (rootDir: string): string =>
  path.join(rootDir, "src", "library", "library.json");
