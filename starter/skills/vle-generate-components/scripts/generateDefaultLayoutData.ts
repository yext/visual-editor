import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { Data, DefaultComponentProps } from "@puckeditor/core";
import type { YextEntityField } from "@yext/visual-editor";

type DefaultLayoutEntry = {
  type: string;
  props: DefaultComponentProps;
};

type DefaultLayoutData = Data<
  DefaultComponentProps,
  { title: YextEntityField<string>; description: YextEntityField<string> }
>;

const usage = `Usage:
  pnpm run generate-default-layout-data <templateName> <componentName1> [componentName2 ...]

Example:
  pnpm run generate-default-layout-data galaxy-grill GalaxyGrillHeroSection GalaxyGrillFooterSection
  pnpm run generate-default-layout-data galaxy-grill "GalaxyGrillHeroSection,GalaxyGrillFooterSection"`;

function sanitizeTemplateName(templateName: string): string {
  return templateName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
}

function toDisplayName(value: string): string {
  const withWordBoundaries = value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  return withWordBoundaries
    .split(" ")
    .filter(Boolean)
    .map(
      (word) => `${word[0]?.toUpperCase() ?? ""}${word.slice(1).toLowerCase()}`,
    )
    .join(" ");
}

function parseArgs(argv: string[]): {
  templateName: string;
  componentNames: string[];
} {
  const args = argv.slice(2);
  const normalizedArgs = args[0] === "--" ? args.slice(1) : args;
  const [rawTemplateName, ...componentArgs] = normalizedArgs;

  if (!rawTemplateName || componentArgs.length === 0) {
    throw new Error(usage);
  }

  const templateName = sanitizeTemplateName(rawTemplateName);
  if (!templateName) {
    throw new Error(`Invalid templateName: ${rawTemplateName}`);
  }

  const componentNames = componentArgs
    .flatMap((arg) => arg.split(","))
    .map((name) => name.trim())
    .filter(Boolean);

  if (componentNames.length === 0) {
    throw new Error("At least one component name is required.");
  }

  return { templateName, componentNames };
}

function getModulePathCandidates(
  repoRoot: string,
  templateName: string,
  componentName: string,
): string[] {
  const componentsPath = path.join(
    repoRoot,
    "starter",
    "src",
    "registry",
    templateName,
    "components",
  );

  return [path.join(componentsPath, `${componentName}.tsx`)];
}

async function loadComponentDefaultProps(
  repoRoot: string,
  templateName: string,
  componentName: string,
): Promise<Record<string, unknown>> {
  const candidates = getModulePathCandidates(
    repoRoot,
    templateName,
    componentName,
  );
  let lastError: unknown;

  for (const candidate of candidates) {
    try {
      const moduleUrl = pathToFileURL(candidate).href;
      const moduleExports = (await import(moduleUrl)) as Record<string, any>;
      const componentConfig = moduleExports[componentName];

      if (!componentConfig) {
        throw new Error(
          `Export "${componentName}" was not found in ${candidate}.`,
        );
      }

      const defaultProps = componentConfig.defaultProps;
      if (!defaultProps || typeof defaultProps !== "object") {
        throw new Error(
          `Export "${componentName}" in ${candidate} has no object defaultProps.`,
        );
      }

      return defaultProps as Record<string, unknown>;
    } catch (error) {
      lastError = error;
    }
  }

  throw new Error(
    `Unable to load "${componentName}" for template "${templateName}". Tried:\n- ${candidates.join(
      "\n- ",
    )}\nLast error: ${String(lastError)}`,
  );
}

async function main() {
  const { templateName, componentNames } = parseArgs(process.argv);
  const scriptPath = fileURLToPath(import.meta.url);
  const repoRoot = path.resolve(
    path.dirname(scriptPath),
    "..",
    "..",
    "..",
    "..",
  );

  const outputDir = path.join(
    repoRoot,
    "starter",
    "src",
    "registry",
    templateName,
  );
  const outputPath = path.join(outputDir, "defaultLayout.json");

  const content: DefaultLayoutEntry[] = [];
  for (const componentName of componentNames) {
    const defaultProps = await loadComponentDefaultProps(
      repoRoot,
      templateName,
      componentName,
    );
    content.push({
      type: componentName,
      props: {
        id: `${componentName}-${randomUUID()}`,
        ...defaultProps,
      },
    });
  }

  const data: DefaultLayoutData = {
    root: {
      props: {
        title: {
          field: "name",
          constantValue: `${toDisplayName(templateName)} Pages`,
          constantValueEnabled: false,
        },
        description: {
          field: "description",
          constantValue: "",
          constantValueEnabled: false,
        },
      },
    },
    content,
    zones: {},
  };

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  console.log(
    `Generated ${path.relative(repoRoot, outputPath)} with ${content.length} components.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
