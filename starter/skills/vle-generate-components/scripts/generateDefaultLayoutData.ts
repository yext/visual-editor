import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { Data, DefaultComponentProps } from "@puckeditor/core";
import { YextEntityField } from "../../../../packages/visual-editor/dist";

type DefaultLayoutEntry = {
  type: string;
  props: DefaultComponentProps;
};

type DefaultLayoutData = Data<
  DefaultComponentProps,
  { title: YextEntityField<string>; description: YextEntityField<string> }
>;

const usage = `Usage:
  tsx starter/skills/vle-generate-components/scripts/generateDefaultLayoutData.ts <clientName> <componentName1> [componentName2 ...]

Example:
  tsx starter/skills/vle-generate-components/scripts/generateDefaultLayoutData.ts GalaxyGrill GalaxyGrillHeroSection GalaxyGrillFooterSection
  tsx starter/skills/vle-generate-components/scripts/generateDefaultLayoutData.ts GalaxyGrill "GalaxyGrillHeroSection,GalaxyGrillFooterSection"`;

function parseArgs(argv: string[]): {
  clientName: string;
  componentNames: string[];
} {
  const args = argv.slice(2);
  const normalizedArgs = args[0] === "--" ? args.slice(1) : args;
  const [clientName, ...componentArgs] = normalizedArgs;

  if (!clientName || componentArgs.length === 0) {
    throw new Error(usage);
  }

  const componentNames = componentArgs
    .flatMap((arg) => arg.split(","))
    .map((name) => name.trim())
    .filter(Boolean);

  if (componentNames.length === 0) {
    throw new Error("At least one component name is required.");
  }

  return { clientName, componentNames };
}

function getModulePathCandidates(
  repoRoot: string,
  clientName: string,
  componentName: string,
): string[] {
  const basePath = path.join(
    repoRoot,
    "starter",
    "src",
    "components",
    "custom",
    clientName,
  );

  return [
    path.join(basePath, `${componentName}.tsx`),
    path.join(basePath, "components", `${componentName}.tsx`),
  ];
}

async function loadComponentDefaultProps(
  repoRoot: string,
  clientName: string,
  componentName: string,
): Promise<Record<string, unknown>> {
  const candidates = getModulePathCandidates(
    repoRoot,
    clientName,
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
    `Unable to load "${componentName}" for client "${clientName}". Tried:\n- ${candidates.join(
      "\n- ",
    )}\nLast error: ${String(lastError)}`,
  );
}

async function main() {
  const { clientName, componentNames } = parseArgs(process.argv);
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
    "components",
    "custom",
    clientName,
  );
  const outputPath = path.join(outputDir, "defaultLayout.json");

  const content: DefaultLayoutEntry[] = [];
  for (const componentName of componentNames) {
    const defaultProps = await loadComponentDefaultProps(
      repoRoot,
      clientName,
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
          constantValue: `${clientName} Pages`,
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
