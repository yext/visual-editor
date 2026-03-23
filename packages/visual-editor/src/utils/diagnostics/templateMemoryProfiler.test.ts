import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import {
  compareTemplateMemory,
  formatComparisonReport,
  formatProfileReport,
  loadProfileInput,
  profileTemplateMemory,
} from "./templateMemoryProfiler.ts";
import { runMemoryProfileCli } from "./memoryProfileCli.ts";

const tempDirectories: string[] = [];
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../../"
);

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true })
    )
  );
});

const createTempDir = async () => {
  const directory = await fs.mkdtemp(
    path.join(os.tmpdir(), "visual-editor-memory-profile-")
  );
  tempDirectories.push(directory);
  return directory;
};

describe("templateMemoryProfiler", () => {
  it("loads a built-in preset", async () => {
    const input = await loadProfileInput({
      preset: "directory-city-current",
      layoutVersion: 69,
    });

    expect(input.scenarioName).toBe("directory-city-current");
    expect(JSON.parse(input.layoutString).content[0].type).toBe("Directory");
  });

  it("profiles the current repo for a built-in preset", async () => {
    const input = await loadProfileInput({
      preset: "directory-city-current",
      layoutVersion: 69,
    });

    const report = await profileTemplateMemory({
      repoRoot,
      repoLabel: "test repo",
      input,
    });

    expect(report.scenarioName).toBe("directory-city-current");
    expect(report.summary.directory.directoryCardCount).toBeGreaterThan(0);
    expect(report.summary.serializedBytes).toBeGreaterThan(0);
  }, 15000);

  it("loads layout from document.__.layout by default", async () => {
    const directory = await createTempDir();
    const documentPath = path.join(directory, "document.json");
    const embeddedLayout = {
      root: {
        props: {
          version: 8,
        },
      },
      content: [],
    };

    await fs.writeFile(
      documentPath,
      JSON.stringify({
        __: {
          layout: JSON.stringify(embeddedLayout),
        },
      })
    );

    const input = await loadProfileInput({
      documentPath,
      layoutVersion: 69,
    });

    expect(JSON.parse(input.layoutString)).toEqual(embeddedLayout);
  });

  it("formats a comparison report as a table", () => {
    const formatted = formatComparisonReport(
      {
        scenarioName: "directory-city-current",
        base: {
          scenarioName: "directory-city-current",
          repoLabel: "main",
          repoRoot: "/tmp/base",
          input: { preset: "directory-city-current" },
          summary: {
            serializedBytes: 100,
            componentCounts: {},
            slotCounts: {},
            duplicatePayloadBytes: {
              profileParentData: 30,
              slotParentData: 10,
              total: 40,
            },
            directory: {
              directoryCardCount: 4,
              profileParentDataBytes: 30,
              slotParentDataBytes: 10,
              directoryGridCardSlotBytes: 80,
            },
          },
        },
        head: {
          scenarioName: "directory-city-current",
          repoLabel: "feature",
          repoRoot: "/tmp/head",
          input: { preset: "directory-city-current" },
          summary: {
            serializedBytes: 80,
            componentCounts: {},
            slotCounts: {},
            duplicatePayloadBytes: {
              profileParentData: 0,
              slotParentData: 6,
              total: 6,
            },
            directory: {
              directoryCardCount: 4,
              profileParentDataBytes: 0,
              slotParentDataBytes: 6,
              directoryGridCardSlotBytes: 70,
            },
          },
        },
        metrics: [
          {
            key: "serializedBytes",
            label: "serializedBytes",
            base: 100,
            head: 80,
            delta: -20,
            deltaPercent: -20,
          },
        ],
      },
      "text"
    );

    expect(formatted).toContain("Base: main");
    expect(formatted).toContain("serializedBytes");
    expect(formatted).toContain("-20.0%");
  });

  it("formats a profile report as JSON", () => {
    const formatted = formatProfileReport(
      {
        scenarioName: "directory-city-current",
        repoLabel: "current worktree",
        repoRoot: "/tmp/repo",
        input: { preset: "directory-city-current" },
        summary: {
          serializedBytes: 80,
          componentCounts: {},
          slotCounts: {},
          duplicatePayloadBytes: {
            profileParentData: 0,
            slotParentData: 6,
            total: 6,
          },
          directory: {
            directoryCardCount: 4,
            profileParentDataBytes: 0,
            slotParentDataBytes: 6,
            directoryGridCardSlotBytes: 70,
          },
        },
      },
      "json"
    );

    expect(JSON.parse(formatted).summary.serializedBytes).toBe(80);
  });
});

describe("memoryProfileCli", () => {
  it("prints a JSON report for a preset", async () => {
    const stdout: string[] = [];
    const stderr: string[] = [];

    const exitCode = await runMemoryProfileCli({
      argv: [
        "profile",
        "--preset",
        "directory-city-current",
        "--format",
        "json",
      ],
      io: {
        stdout: { write: (chunk) => void stdout.push(chunk) },
        stderr: { write: (chunk) => void stderr.push(chunk) },
      },
      cwd: repoRoot,
    });

    expect(exitCode).toBe(0);
    expect(stderr).toEqual([]);
    const parsed = JSON.parse(stdout.join("").trim());
    expect(parsed.scenarioName).toBe("directory-city-current");
    expect(parsed.summary.serializedBytes).toBeGreaterThan(0);
  });

  it("returns an actionable error for invalid JSON input", async () => {
    const directory = await createTempDir();
    const documentPath = path.join(directory, "document.json");
    const stdout: string[] = [];
    const stderr: string[] = [];

    await fs.writeFile(documentPath, "{ invalid json");

    const exitCode = await runMemoryProfileCli({
      argv: ["profile", "--document", documentPath],
      io: {
        stdout: { write: (chunk) => void stdout.push(chunk) },
        stderr: { write: (chunk) => void stderr.push(chunk) },
      },
      cwd: repoRoot,
    });

    expect(exitCode).toBe(1);
    expect(stdout).toEqual([]);
    expect(stderr.join("")).toContain("Failed to parse document JSON");
  });
});
