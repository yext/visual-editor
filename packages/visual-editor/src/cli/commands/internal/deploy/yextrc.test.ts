import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { updateYextrc, yextrcPath } from "./yextrc.ts";

function permissions(filePath: string): number {
  return fs.statSync(filePath).mode & 0o777;
}

describe("updateYextrc", () => {
  it("creates a .yextrc containing an API key with 0600 permissions", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "yextrc-test-"));

    updateYextrc(rootDir, { apiKey: "secret" });

    expect(permissions(yextrcPath(rootDir))).toBe(0o600);
  });

  it("resets permissions on an existing .yextrc containing an API key", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "yextrc-test-"));
    const filePath = yextrcPath(rootDir);
    fs.writeFileSync(filePath, "apiKey: secret\n", { mode: 0o644 });

    updateYextrc(rootDir, { accountId: "123" });

    expect(permissions(filePath)).toBe(0o600);
  });
});
