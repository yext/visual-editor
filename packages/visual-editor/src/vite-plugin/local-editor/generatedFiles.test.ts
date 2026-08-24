// @vitest-environment node
import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach, describe, expect, it } from "vitest";
import { ensureLocalEditorStreamConfig } from "./generatedFiles.ts";

const rootDirs: string[] = [];

afterEach(() => {
  while (rootDirs.length > 0) {
    fs.removeSync(rootDirs.pop()!);
  }
});

describe("ensureLocalEditorStreamConfig", () => {
  it("writes locator environment defaults", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "local-editor-"));
    rootDirs.push(rootDir);

    ensureLocalEditorStreamConfig(rootDir);

    expect(fs.readFileSync(path.join(rootDir, "stream.config.ts"), "utf8"))
      .toContain(`env: {
    YEXT_CLOUD_REGION: "US",
    YEXT_CLOUD_CHOICE: "GLOBAL-MULTI",
    YEXT_ENVIRONMENT: "PROD",
    YEXT_SEARCH_API_KEY: "",
    YEXT_SEARCH_EXPERIENCE_KEY: "",
  },`);
  });
});
