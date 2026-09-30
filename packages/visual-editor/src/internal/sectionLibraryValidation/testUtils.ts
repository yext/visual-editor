import os from "node:os";
import path from "node:path";
import fs from "fs-extra";
import { afterEach } from "vitest";

const tempRoots: string[] = [];

afterEach(() => {
  for (const rootDir of tempRoots.splice(0)) {
    fs.removeSync(rootDir);
  }
});

export const createTempRoot = (prefix = "yextve-test-"): string => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempRoots.push(rootDir);
  return rootDir;
};
