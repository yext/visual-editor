import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import React from "react";
import { Config, Data, resolveAllData } from "@puckeditor/core";
import {
  getDirectoryMemoryPreset,
  getDirectoryMemoryPresetNames,
} from "./directoryMemoryPresets.ts";

const execFileAsync = promisify(execFile);

const PACKAGE_ROOT = path.join("packages", "visual-editor");

type RuntimeModules = {
  Directory: unknown;
  SlotsCategoryComponents: Record<string, unknown>;
  migrate: (
    data: Data,
    migrations: unknown[],
    config: Config,
    streamDocument?: Record<string, any>
  ) => Data;
  migrationRegistry: unknown[];
};

export type ProfileInput = {
  scenarioName: string;
  document: Record<string, any>;
  layoutString: string;
  input: {
    preset?: string;
    documentPath?: string;
    layoutPath?: string;
  };
};

export type TreeSummary = {
  serializedBytes: number;
  componentCounts: Record<string, number>;
  slotCounts: Record<string, number>;
  duplicatePayloadBytes: {
    profileParentData: number;
    slotParentData: number;
    total: number;
  };
  directory: {
    directoryCardCount: number;
    profileParentDataBytes: number;
    slotParentDataBytes: number;
    directoryGridCardSlotBytes: number;
  };
};

export type ProfileReport = {
  scenarioName: string;
  repoLabel: string;
  repoRoot: string;
  input: ProfileInput["input"];
  summary: TreeSummary;
};

export type ComparisonMetric = {
  key: string;
  label: string;
  base: number;
  head: number;
  delta: number;
  deltaPercent: number | null;
};

export type ComparisonReport = {
  scenarioName: string;
  base: ProfileReport;
  head: ProfileReport;
  metrics: ComparisonMetric[];
};

export type LoadProfileInputOptions = {
  preset?: string;
  documentPath?: string;
  layoutPath?: string;
  cwd?: string;
  layoutVersion: number;
};

export type CompareOptions = {
  baseRef: string;
  headRef?: string;
  preset?: string;
  documentPath?: string;
  layoutPath?: string;
  cwd?: string;
};

export type ProfileRefOptions = {
  ref?: string;
  preset?: string;
  documentPath?: string;
  layoutPath?: string;
  cwd?: string;
};

type PreparedRepo = {
  repoRoot: string;
  repoLabel: string;
  cleanup: () => Promise<void>;
};

const dynamicImport = async <T>(
  modulePath: string
): Promise<T> => {
  const url = pathToFileURL(modulePath).href;
  return (await import(url)) as T;
};

const importRuntimeModules = async (repoRoot: string): Promise<RuntimeModules> => {
  const directoryModule = await dynamicImport<{
    Directory: unknown;
  }>(
    path.join(repoRoot, PACKAGE_ROOT, "src/components/directory/Directory.tsx")
  );
  const slotsModule = await dynamicImport<{
    SlotsCategoryComponents: Record<string, unknown>;
  }>(
    path.join(
      repoRoot,
      PACKAGE_ROOT,
      "src/components/categories/SlotsCategory.tsx"
    )
  );
  const migrateModule = await dynamicImport<{
    migrate: RuntimeModules["migrate"];
  }>(path.join(repoRoot, PACKAGE_ROOT, "src/utils/migrate.ts"));
  const migrationsModule = await dynamicImport<{
    migrationRegistry: unknown[];
  }>(
    path.join(
      repoRoot,
      PACKAGE_ROOT,
      "src/components/migrations/migrationRegistry.ts"
    )
  );

  return {
    Directory: directoryModule.Directory,
    SlotsCategoryComponents: slotsModule.SlotsCategoryComponents,
    migrate: migrateModule.migrate,
    migrationRegistry: migrationsModule.migrationRegistry,
  };
};

const createPuckConfig = (runtime: RuntimeModules): Config => ({
  components: {
    Directory: runtime.Directory as Config["components"][string],
    ...(runtime.SlotsCategoryComponents as Config["components"]),
  },
  root: {
    render: () => React.createElement(React.Fragment),
  },
});

const isObject = (value: unknown): value is Record<string, any> =>
  typeof value === "object" && value !== null;

const isComponentNode = (
  value: unknown
): value is {
  type: string;
  props?: Record<string, any>;
} => isObject(value) && typeof value.type === "string";

const computeSerializedBytes = (value: unknown): number =>
  Buffer.byteLength(JSON.stringify(value ?? null), "utf8");

const addCount = (record: Record<string, number>, key: string, delta = 1) => {
  record[key] = (record[key] ?? 0) + delta;
};

const summarizeResolvedTree = (value: unknown): TreeSummary => {
  const componentCounts: Record<string, number> = {};
  const slotCounts: Record<string, number> = {};

  let profileParentDataBytes = 0;
  let slotParentDataBytes = 0;
  let directoryGridCardSlotBytes = 0;
  let directoryCardCount = 0;

  const visit = (node: unknown, insideDirectoryCard = false): void => {
    if (Array.isArray(node)) {
      node.forEach((child) => visit(child, insideDirectoryCard));
      return;
    }

    if (!isObject(node)) {
      return;
    }

    let nextInsideDirectoryCard = insideDirectoryCard;

    if (isComponentNode(node)) {
      addCount(componentCounts, node.type);
      if (node.type === "DirectoryCard") {
        directoryCardCount += 1;
        nextInsideDirectoryCard = true;
      }

      const slots = node.props?.slots;
      if (isObject(slots)) {
        Object.entries(slots).forEach(([slotKey, slotValue]) => {
          if (!Array.isArray(slotValue)) {
            return;
          }
          addCount(slotCounts, slotKey, slotValue.length);
          if (node.type === "DirectoryGrid" && slotKey === "CardSlot") {
            directoryGridCardSlotBytes += computeSerializedBytes(slotValue);
          }
        });
      }

      const parentData = node.props?.parentData;
      if (isObject(parentData)) {
        if (node.type === "DirectoryCard" && "profile" in parentData) {
          profileParentDataBytes += computeSerializedBytes(parentData.profile);
        } else if (nextInsideDirectoryCard && node.type !== "DirectoryCard") {
          slotParentDataBytes += computeSerializedBytes(parentData);
        }
      }
    }

    Object.values(node).forEach((child) => visit(child, nextInsideDirectoryCard));
  };

  visit(value);

  return {
    serializedBytes: computeSerializedBytes(value),
    componentCounts,
    slotCounts,
    duplicatePayloadBytes: {
      profileParentData: profileParentDataBytes,
      slotParentData: slotParentDataBytes,
      total: profileParentDataBytes + slotParentDataBytes,
    },
    directory: {
      directoryCardCount,
      profileParentDataBytes,
      slotParentDataBytes,
      directoryGridCardSlotBytes,
    },
  };
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const readJsonFile = async (
  resolvedPath: string,
  label: string
): Promise<Record<string, any>> => {
  const fileContents = await fs.readFile(resolvedPath, "utf8");

  try {
    const parsed = JSON.parse(fileContents);
    if (!isObject(parsed)) {
      throw new Error(`${label} JSON must be an object.`);
    }
    return parsed;
  } catch (error) {
    throw new Error(
      `Failed to parse ${label} JSON from "${resolvedPath}": ${getErrorMessage(error)}`
    );
  }
};

const readLayoutFile = async (resolvedPath: string): Promise<string> => {
  const fileContents = await fs.readFile(resolvedPath, "utf8");

  try {
    const parsed = JSON.parse(fileContents);
    if (typeof parsed === "string") {
      JSON.parse(parsed);
      return parsed;
    }

    return JSON.stringify(parsed);
  } catch (error) {
    throw new Error(
      `Failed to parse layout JSON from "${resolvedPath}": ${getErrorMessage(error)}`
    );
  }
};

const readEmbeddedLayout = (
  document: Record<string, any>,
  sourcePath: string
): string => {
  const layout = document.__?.layout;
  if (typeof layout !== "string") {
    throw new Error(
      `Document "${sourcePath}" does not contain document.__.layout. Pass --layout to provide a layout file explicitly.`
    );
  }

  try {
    JSON.parse(layout);
  } catch (error) {
    throw new Error(
      `Document "${sourcePath}" contains invalid document.__.layout JSON: ${getErrorMessage(error)}`
    );
  }

  return layout;
};

export const loadProfileInput = async ({
  preset,
  documentPath,
  layoutPath,
  cwd = process.cwd(),
  layoutVersion,
}: LoadProfileInputOptions): Promise<ProfileInput> => {
  if (preset && documentPath) {
    throw new Error("Use either --preset or --document, not both.");
  }

  if (!preset && !documentPath) {
    const defaultPreset = "directory-city-current";
    const scenario = getDirectoryMemoryPreset(defaultPreset, layoutVersion);
    return {
      scenarioName: defaultPreset,
      document: scenario.document,
      layoutString: JSON.stringify(scenario.layout),
      input: { preset: defaultPreset },
    };
  }

  if (preset) {
    const scenario = getDirectoryMemoryPreset(preset, layoutVersion);
    return {
      scenarioName: preset,
      document: scenario.document,
      layoutString: JSON.stringify(scenario.layout),
      input: { preset },
    };
  }

  const resolvedDocumentPath = path.resolve(cwd, documentPath!);
  const document = await readJsonFile(resolvedDocumentPath, "document");
  const layoutString = layoutPath
    ? await readLayoutFile(path.resolve(cwd, layoutPath))
    : readEmbeddedLayout(document, resolvedDocumentPath);

  return {
    scenarioName: path.basename(resolvedDocumentPath),
    document,
    layoutString,
    input: {
      documentPath: resolvedDocumentPath,
      ...(layoutPath && { layoutPath: path.resolve(cwd, layoutPath) }),
    },
  };
};

export const profileTemplateMemory = async ({
  repoRoot,
  repoLabel,
  input,
}: {
  repoRoot: string;
  repoLabel: string;
  input: ProfileInput;
}): Promise<ProfileReport> => {
  const runtime = await importRuntimeModules(repoRoot);
  const config = createPuckConfig(runtime);
  const parsedLayout = JSON.parse(input.layoutString) as Data;
  const migratedLayout = runtime.migrate(
    structuredClone(parsedLayout),
    runtime.migrationRegistry,
    config,
    structuredClone(input.document)
  );
  const resolvedLayout = await resolveAllData(migratedLayout, config, {
    streamDocument: structuredClone(input.document),
  });

  return {
    scenarioName: input.scenarioName,
    repoLabel,
    repoRoot,
    input: input.input,
    summary: summarizeResolvedTree(resolvedLayout),
  };
};

const roundPercent = (value: number): number =>
  Number(value.toFixed(1));

const computeDeltaPercent = (base: number, delta: number): number | null => {
  if (base === 0) {
    return delta === 0 ? 0 : null;
  }

  return roundPercent((delta / base) * 100);
};

const buildMetric = (
  key: string,
  label: string,
  base: number,
  head: number
): ComparisonMetric => ({
  key,
  label,
  base,
  head,
  delta: head - base,
  deltaPercent: computeDeltaPercent(base, head - base),
});

const getComparisonMetrics = (
  baseSummary: TreeSummary,
  headSummary: TreeSummary
): ComparisonMetric[] => {
  const basePerCard =
    baseSummary.directory.directoryCardCount > 0
      ? Math.round(baseSummary.serializedBytes / baseSummary.directory.directoryCardCount)
      : 0;
  const headPerCard =
    headSummary.directory.directoryCardCount > 0
      ? Math.round(headSummary.serializedBytes / headSummary.directory.directoryCardCount)
      : 0;

  return [
    buildMetric(
      "serializedBytes",
      "serializedBytes",
      baseSummary.serializedBytes,
      headSummary.serializedBytes
    ),
    buildMetric(
      "profileParentDataBytes",
      "profileParentDataBytes",
      baseSummary.directory.profileParentDataBytes,
      headSummary.directory.profileParentDataBytes
    ),
    buildMetric(
      "slotParentDataBytes",
      "slotParentDataBytes",
      baseSummary.directory.slotParentDataBytes,
      headSummary.directory.slotParentDataBytes
    ),
    buildMetric(
      "duplicatePayloadBytes.total",
      "duplicatePayloadBytes.total",
      baseSummary.duplicatePayloadBytes.total,
      headSummary.duplicatePayloadBytes.total
    ),
    buildMetric(
      "directoryGridCardSlotBytes",
      "directoryGridCardSlotBytes",
      baseSummary.directory.directoryGridCardSlotBytes,
      headSummary.directory.directoryGridCardSlotBytes
    ),
    buildMetric(
      "directoryCardCount",
      "directoryCardCount",
      baseSummary.directory.directoryCardCount,
      headSummary.directory.directoryCardCount
    ),
    buildMetric(
      "avgSerializedBytesPerCard",
      "avgSerializedBytesPerCard",
      basePerCard,
      headPerCard
    ),
  ];
};

const getCurrentBranchName = async (repoRoot: string): Promise<string> => {
  const { stdout } = await execFileAsync("git", [
    "-C",
    repoRoot,
    "rev-parse",
    "--abbrev-ref",
    "HEAD",
  ]);
  return stdout.trim();
};

const ensureNodeModulesSymlink = async (
  sourceRepoRoot: string,
  targetRepoRoot: string
) => {
  const pairs = [
    {
      source: path.join(sourceRepoRoot, "node_modules"),
      target: path.join(targetRepoRoot, "node_modules"),
    },
    {
      source: path.join(sourceRepoRoot, PACKAGE_ROOT, "node_modules"),
      target: path.join(targetRepoRoot, PACKAGE_ROOT, "node_modules"),
    },
  ];

  for (const pair of pairs) {
    try {
      const stat = await fs.lstat(pair.target);
      if (stat.isSymbolicLink() || stat.isDirectory()) {
        continue;
      }
    } catch {
      // continue below
    }

    try {
      await fs.access(pair.source);
    } catch {
      continue;
    }

    await fs.mkdir(path.dirname(pair.target), { recursive: true });
    try {
      await fs.symlink(pair.source, pair.target, "dir");
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== "EEXIST") {
        throw error;
      }
    }
  }
};

const createWorktreeRepo = async (
  sourceRepoRoot: string,
  ref: string
): Promise<PreparedRepo> => {
  const tempDirectory = await fs.mkdtemp(
    path.join(os.tmpdir(), "visual-editor-memory-compare-")
  );
  await execFileAsync("git", [
    "-C",
    sourceRepoRoot,
    "worktree",
    "add",
    "--detach",
    tempDirectory,
    ref,
  ]);

  try {
    await ensureNodeModulesSymlink(sourceRepoRoot, tempDirectory);
  } catch (error) {
    await execFileAsync("git", [
      "-C",
      sourceRepoRoot,
      "worktree",
      "remove",
      "--force",
      tempDirectory,
    ]);
    throw error;
  }

  return {
    repoRoot: tempDirectory,
    repoLabel: ref,
    cleanup: async () => {
      await execFileAsync("git", [
        "-C",
        sourceRepoRoot,
        "worktree",
        "remove",
        "--force",
        tempDirectory,
      ]);
    },
  };
};

const prepareRepo = async ({
  sourceRepoRoot,
  ref,
  useCurrentWorktree,
}: {
  sourceRepoRoot: string;
  ref?: string;
  useCurrentWorktree?: boolean;
}): Promise<PreparedRepo> => {
  if (useCurrentWorktree || !ref) {
    const branchName = await getCurrentBranchName(sourceRepoRoot);
    return {
      repoRoot: sourceRepoRoot,
      repoLabel: `current worktree (${branchName})`,
      cleanup: async () => undefined,
    };
  }

  return createWorktreeRepo(sourceRepoRoot, ref);
};

const loadProfileInputForRepo = async ({
  repoRoot,
  preset,
  documentPath,
  layoutPath,
  cwd,
}: {
  repoRoot: string;
  preset?: string;
  documentPath?: string;
  layoutPath?: string;
  cwd?: string;
}) => {
  const runtime = await importRuntimeModules(repoRoot);
  return loadProfileInput({
    preset,
    documentPath,
    layoutPath,
    cwd,
    layoutVersion: runtime.migrationRegistry.length,
  });
};

const resolveSourceRepoRoot = async (cwd: string): Promise<string> => {
  const { stdout } = await execFileAsync("git", [
    "-C",
    cwd,
    "rev-parse",
    "--show-toplevel",
  ]);
  return stdout.trim();
};

export const profileTemplateMemoryForRef = async ({
  ref,
  preset,
  documentPath,
  layoutPath,
  cwd = process.cwd(),
}: ProfileRefOptions): Promise<ProfileReport> => {
  const sourceRepoRoot = await resolveSourceRepoRoot(cwd);
  const preparedRepo = await prepareRepo({
    sourceRepoRoot,
    ref,
    useCurrentWorktree: !ref,
  });

  try {
    const input = await loadProfileInputForRepo({
      repoRoot: preparedRepo.repoRoot,
      preset,
      documentPath,
      layoutPath,
      cwd,
    });

    return profileTemplateMemory({
      repoRoot: preparedRepo.repoRoot,
      repoLabel: preparedRepo.repoLabel,
      input,
    });
  } finally {
    await preparedRepo.cleanup();
  }
};

export const compareTemplateMemory = async ({
  baseRef,
  headRef,
  preset,
  documentPath,
  layoutPath,
  cwd = process.cwd(),
}: CompareOptions): Promise<ComparisonReport> => {
  const sourceRepoRoot = await resolveSourceRepoRoot(cwd);

  const baseRepo = await prepareRepo({
    sourceRepoRoot,
    ref: baseRef,
  });
  const headRepo = await prepareRepo({
    sourceRepoRoot,
    ref: headRef,
    useCurrentWorktree: !headRef,
  });

  try {
    const [baseInput, headInput] = await Promise.all([
      loadProfileInputForRepo({
        repoRoot: baseRepo.repoRoot,
        preset,
        documentPath,
        layoutPath,
        cwd,
      }),
      loadProfileInputForRepo({
        repoRoot: headRepo.repoRoot,
        preset,
        documentPath,
        layoutPath,
        cwd,
      }),
    ]);

    const [baseReport, headReport] = await Promise.all([
      profileTemplateMemory({
        repoRoot: baseRepo.repoRoot,
        repoLabel: baseRepo.repoLabel,
        input: baseInput,
      }),
      profileTemplateMemory({
        repoRoot: headRepo.repoRoot,
        repoLabel: headRepo.repoLabel,
        input: headInput,
      }),
    ]);

    return {
      scenarioName: headInput.scenarioName,
      base: baseReport,
      head: headReport,
      metrics: getComparisonMetrics(baseReport.summary, headReport.summary),
    };
  } finally {
    await Promise.all([baseRepo.cleanup(), headRepo.cleanup()]);
  }
};

const formatInteger = (value: number): string => value.toLocaleString("en-US");

const formatSignedInteger = (value: number): string => {
  if (value === 0) {
    return "0";
  }
  return `${value > 0 ? "+" : ""}${formatInteger(value)}`;
};

const formatDeltaPercent = (value: number | null): string =>
  value === null ? "n/a" : `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

const padCell = (value: string, width: number, align: "left" | "right") =>
  align === "right" ? value.padStart(width) : value.padEnd(width);

const formatTable = (
  rows: string[][],
  alignments: Array<"left" | "right">
): string => {
  const widths = rows[0].map((_cell, index) =>
    Math.max(...rows.map((row) => row[index].length))
  );

  return rows
    .map((row, rowIndex) => {
      const line = row
        .map((cell, index) => padCell(cell, widths[index], alignments[index]))
        .join("  ");
      if (rowIndex === 0) {
        const divider = widths
          .map((width, index) =>
            alignments[index] === "right" ? "-".repeat(width) : "-".repeat(width)
          )
          .join("  ");
        return `${line}\n${divider}`;
      }
      return line;
    })
    .join("\n");
};

export const formatProfileReport = (
  report: ProfileReport,
  format: "text" | "json"
): string => {
  if (format === "json") {
    return JSON.stringify(report, null, 2);
  }

  const summary = report.summary;
  const lines = [
    `Scenario: ${report.scenarioName}`,
    `Repo: ${report.repoLabel}`,
    report.input.preset
      ? `Preset: ${report.input.preset}`
      : `Document: ${report.input.documentPath}`,
    "",
    formatTable(
      [
        ["Metric", "Value"],
        ["serializedBytes", formatInteger(summary.serializedBytes)],
        [
          "profileParentDataBytes",
          formatInteger(summary.directory.profileParentDataBytes),
        ],
        [
          "slotParentDataBytes",
          formatInteger(summary.directory.slotParentDataBytes),
        ],
        [
          "duplicatePayloadBytes.total",
          formatInteger(summary.duplicatePayloadBytes.total),
        ],
        [
          "directoryGridCardSlotBytes",
          formatInteger(summary.directory.directoryGridCardSlotBytes),
        ],
        ["directoryCardCount", formatInteger(summary.directory.directoryCardCount)],
      ],
      ["left", "right"]
    ),
  ];

  return lines.join("\n");
};

export const formatComparisonReport = (
  report: ComparisonReport,
  format: "text" | "json"
): string => {
  if (format === "json") {
    return JSON.stringify(report, null, 2);
  }

  const rows = [
    ["Metric", "Base", "Head", "Delta", "Delta %"],
    ...report.metrics.map((metric) => [
      metric.label,
      formatInteger(metric.base),
      formatInteger(metric.head),
      formatSignedInteger(metric.delta),
      formatDeltaPercent(metric.deltaPercent),
    ]),
  ];

  return [
    `Scenario: ${report.scenarioName}`,
    `Base: ${report.base.repoLabel}`,
    `Head: ${report.head.repoLabel}`,
    report.head.input.preset
      ? `Preset: ${report.head.input.preset}`
      : `Document: ${report.head.input.documentPath}`,
    "",
    formatTable(rows, ["left", "right", "right", "right", "right"]),
  ].join("\n");
};

export const getMemoryProfileHelpText = () => `Directory memory diagnostics

Usage:
  pnpm --dir packages/visual-editor memory:profile -- [options]
  pnpm --dir packages/visual-editor memory:compare -- [options]

Profile options:
  --preset <name>       Built-in preset (${getDirectoryMemoryPresetNames().join(", ")})
  --document <path>     Path to a document JSON file
  --layout <path>       Optional path to a layout JSON file
  --ref <git-ref>       Profile another branch/commit instead of the current worktree
  --format <text|json>  Output format (default: text)

Compare options:
  --base <git-ref>      Base branch/commit to compare against (default: main)
  --head <git-ref>      Optional head branch/commit; defaults to the current worktree
  --preset <name>       Built-in preset (${getDirectoryMemoryPresetNames().join(", ")})
  --document <path>     Path to a document JSON file
  --layout <path>       Optional path to a layout JSON file
  --format <text|json>  Output format (default: text)

Examples:
  pnpm --dir packages/visual-editor memory:profile -- --preset directory-city-current
  pnpm --dir packages/visual-editor memory:compare -- --base main --preset directory-city-current-100-children
  pnpm --dir packages/visual-editor memory:compare -- --base main --head memory --preset directory-city-current
`;
