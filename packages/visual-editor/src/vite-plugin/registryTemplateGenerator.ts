/**
 * Registry template generation overview:
 * 1. Discover template directories under `src/registry` and find component overrides.
 * 2. Generate one `config.tsx` file per registry template from the discovered components.
 * 3. Generate `src/templates/<template>.tsx` only for templates that have component overrides.
 * 4. Update `src/templates/edit.tsx` so the editor can resolve generated template configs.
 * 5. Merge `defaultLayout.json` into `.template-manifest.json` for each registry template.
 */
import path from "node:path";
import fs from "fs-extra";

type TemplateManifestEntry = {
  name: string;
  description: string;
  exampleSiteUrl: string;
  layoutRequired: boolean;
  defaultLayoutData?: unknown;
};

type ManifestFile = {
  templates?: TemplateManifestEntry[];
};

type TemplatePaths = {
  templateName: string;
  registryDirectory: string;
  componentsDirectory: string;
  defaultLayoutPath: string;
  configPath: string;
  templatePath: string;
};

type CollectedItem = {
  importName: string;
  exportName: string;
  componentName: string;
  fileRelativeToRoot: string;
};

const VALID_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);
const PRESERVED_EDIT_REGISTRY_KEYS = new Set(["directory", "locator"]);

/** Convert a filename or path fragment into PascalCase for generated identifiers. */
const toPascalCase = (value: string): string => {
  return value
    .replace(/\.[^/.]+$/, "")
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => {
      return segment[0].toUpperCase() + segment.slice(1);
    })
    .join("");
};

/** Convert a filename or path fragment into camelCase for local variable names. */
const toCamelCase = (value: string): string => {
  const pascalValue = toPascalCase(value);
  if (!pascalValue) {
    return "";
  }

  return pascalValue[0].toLowerCase() + pascalValue.slice(1);
};

/** Guard against empty derived identifiers so generation fails loudly and early. */
const requireNonEmpty = (value: string, errorMessage: string): string => {
  if (!value) {
    throw new Error(errorMessage);
  }

  return value;
};

/** Normalize paths to POSIX separators so generated imports are portable. */
const toPosixPath = (value: string): string => {
  return value.split(path.sep).join(path.posix.sep);
};

/** Build the registry, config, template, and layout paths for a template name. */
const getTemplatePaths = (
  rootDir: string,
  templateName: string
): TemplatePaths => {
  const registryDirectory = path.join(rootDir, "src", "registry", templateName);
  return {
    templateName,
    registryDirectory,
    componentsDirectory: path.join(registryDirectory, "components"),
    defaultLayoutPath: path.join(registryDirectory, "defaultLayout.json"),
    configPath: path.join(registryDirectory, "config.tsx"),
    templatePath: path.join(rootDir, "src", "templates", `${templateName}.tsx`),
  };
};

/** Recursively collect source files from a component directory. */
const walkDirectory = (directory: string): string[] => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const entries = fs.readdirSync(directory, { withFileTypes: true });
  return entries
    .flatMap((entry) => {
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return walkDirectory(absolutePath);
      }
      if (!entry.isFile() || !VALID_EXTENSIONS.has(path.extname(entry.name))) {
        return [];
      }

      return [absolutePath];
    })
    .sort((a, b) => a.localeCompare(b));
};

/** List all registry template directory names under `src/registry`. */
const getTemplateNames = (rootDir: string): string[] => {
  const registryDir = path.join(rootDir, "src", "registry");
  if (!fs.existsSync(registryDir)) {
    return [];
  }

  return fs
    .readdirSync(registryDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
};

/** Determine whether a template should get a generated template file override. */
const hasTemplateComponentOverride = (
  rootDir: string,
  templateName: string
): boolean => {
  return fs.existsSync(
    getTemplatePaths(rootDir, templateName).componentsDirectory
  );
};

/** Collect and uniquely name all generated component imports for one template. */
const collectTemplateComponents = (
  rootDir: string,
  templateName: string
): CollectedItem[] => {
  const templatePaths = getTemplatePaths(rootDir, templateName);
  const templateKey = requireNonEmpty(
    toPascalCase(templateName),
    `Could not derive a template key from ${templateName}`
  );
  const usedImportNames = new Set<string>();
  const usedComponentNames = new Set<string>();

  return walkDirectory(templatePaths.componentsDirectory).map(
    (absolutePath) => {
      const fileRelativeToRoot = toPosixPath(
        path.relative(rootDir, absolutePath)
      );
      const fileRelativeToGroup = toPosixPath(
        path.relative(templatePaths.componentsDirectory, absolutePath)
      );

      const baseName = requireNonEmpty(
        toPascalCase(fileRelativeToGroup),
        `Could not derive a component name from ${fileRelativeToRoot}`
      );

      let componentName = baseName;
      let componentNameSuffix = 2;
      while (usedComponentNames.has(componentName)) {
        componentName = `${baseName}${componentNameSuffix}`;
        componentNameSuffix += 1;
      }
      usedComponentNames.add(componentName);

      const importBase = `${templateKey}Component${baseName}`;
      let importName = importBase;
      let importNameSuffix = 2;
      while (usedImportNames.has(importName)) {
        importName = `${importBase}${importNameSuffix}`;
        importNameSuffix += 1;
      }
      usedImportNames.add(importName);

      return {
        importName,
        exportName: baseName,
        componentName,
        fileRelativeToRoot,
      };
    }
  );
};

/** Build the exported config symbol name for a generated registry config file. */
const getTemplateConfigExportName = (templateName: string): string => {
  return `${requireNonEmpty(
    toPascalCase(templateName),
    `Could not derive a config export name from ${templateName}`
  )}Config`;
};

/** Build the local identifier used when a generated config is imported into `edit.tsx`. */
const getEditConfigIdentifier = (templateName: string): string => {
  return `${requireNonEmpty(
    toCamelCase(templateName),
    `Could not derive an edit config identifier from ${templateName}`
  )}Config`;
};

/** Render a string-to-identifier map into TypeScript object literal source. */
const renderIdentifierMap = (value: Record<string, string>): string => {
  return [
    "{",
    ...Object.entries(value).map(([key, identifier]) => {
      return `    ${JSON.stringify(key)}: ${identifier},`;
    }),
    "  }",
  ].join("\n");
};

/** Build the full `config.tsx` source for one registry template. */
const buildConfigSource = (
  rootDir: string,
  items: CollectedItem[],
  outputFilePath: string,
  templateName: string
): string => {
  const configExportName = getTemplateConfigExportName(templateName);
  const importLines = items.map((item) => {
    const importPath = toPosixPath(
      path
        .relative(
          path.dirname(outputFilePath),
          path.join(rootDir, item.fileRelativeToRoot)
        )
        .replace(/\.[^/.]+$/, "")
    );
    const normalizedImportPath = importPath.startsWith(".")
      ? importPath
      : `./${importPath}`;
    return `import { ${item.exportName} as ${item.importName} } from "${normalizedImportPath}";`;
  });
  const componentNames = items.map((item) => item.componentName);
  const components = Object.fromEntries(
    items.map((item) => [item.componentName, item.importName])
  ) as Record<string, string>;
  const categories = items.length
    ? `{
    "components": {
      "title": "Components",
      "components": ${JSON.stringify(componentNames)}
    },
    "other": {
      "title": "Other",
      "visible": false,
      "components": []
    }
  }`
    : `{
    "other": {
      "title": "Other",
      "visible": false,
      "components": []
    }
  }`;

  return [
    "/** THIS FILE IS AUTOGENERATED BY @yext/visual-editor/plugin */",
    'import type { Config } from "@puckeditor/core";',
    ...(importLines.length ? ["", ...importLines] : []),
    "",
    `export const ${configExportName}: Config = {`,
    items.length
      ? `  components: ${renderIdentifierMap(components)},`
      : "  components: {},",
    items.length ? "" : "  // No components found in this template registry",
    `  categories: ${categories},`,
    "};",
    "",
  ]
    .filter(Boolean)
    .join("\n");
};

/** Render a template file by adapting the shared base template to one registry config. */
const buildTemplateSource = (
  baseSource: string,
  templateName: string,
  configImportPath: string,
  configExportName: string
): string => {
  const templateComponentName = requireNonEmpty(
    toPascalCase(templateName),
    `Could not derive a template component name from ${templateName}`
  );

  const importAnchor =
    'import { AnalyticsProvider, SchemaWrapper } from "@yext/pages-components";';
  if (!baseSource.includes(importAnchor)) {
    throw new Error(
      "Could not find config import anchor in generated base template"
    );
  }

  let renderedSource = baseSource.replace(
    importAnchor,
    `${importAnchor}\nimport { ${configExportName} } from "${configImportPath}";`
  );

  if (renderedSource.includes("TEMPLATE_CONFIG")) {
    renderedSource = renderedSource.replace(
      /\bTEMPLATE_CONFIG\b/g,
      configExportName
    );
  } else if (renderedSource.includes("baseConfig")) {
    renderedSource = renderedSource.replace(
      'import { Config, Render, resolveAllData } from "@puckeditor/core";',
      'import { Render, resolveAllData } from "@puckeditor/core";'
    );
    renderedSource = renderedSource.replace(
      /\nconst baseConfig: Config = \{\};\n/,
      "\n"
    );
    renderedSource = renderedSource.replace(
      /\bbaseConfig\b/g,
      configExportName
    );
  } else {
    throw new Error(
      "Could not find TEMPLATE_CONFIG or baseConfig in generated base template"
    );
  }

  if (renderedSource.includes("const Location:")) {
    renderedSource = renderedSource.replace(
      /const\s+Location\s*:/,
      `const ${templateComponentName}:`
    );
    renderedSource = renderedSource.replace(
      /export default Location;/,
      `export default ${templateComponentName};`
    );
  } else if (renderedSource.includes("const Base:")) {
    renderedSource = renderedSource.replace(
      /const\s+Base\s*:/,
      `const ${templateComponentName}:`
    );
    renderedSource = renderedSource.replace(
      /export default Base;/,
      `export default ${templateComponentName};`
    );
  } else {
    throw new Error(
      "Could not find template component placeholder in generated base template"
    );
  }

  return renderedSource;
};

/** Patch `src/templates/edit.tsx` so the editor knows about generated template configs. */
const updateEditTemplate = (
  rootDir: string,
  templateNames: string[],
  overriddenTemplateNames: string[]
): void => {
  const editTemplatePath = path.join(rootDir, "src", "templates", "edit.tsx");
  if (!fs.existsSync(editTemplatePath)) {
    return;
  }

  let editSource = fs.readFileSync(editTemplatePath, "utf8");

  if (!editSource.includes('import "@yext/visual-editor/editor.css";')) {
    editSource = `import "@yext/visual-editor/editor.css";\n${editSource}`;
  }
  if (!editSource.includes('import "../index.css";')) {
    editSource = `import "../index.css";\n${editSource}`;
  }

  editSource = editSource.replace(
    /^import\s+\{[^}]+\}\s+from\s+"(?:\.\.\/)?(?:registry\/[^"]+\/config|\.\/config|[^"]+\/config)";\n/gm,
    ""
  );

  const generatedImports = overriddenTemplateNames.map((templateName) => {
    const templatePaths = getTemplatePaths(rootDir, templateName);
    const moduleSpecifier = toPosixPath(
      path
        .relative(path.dirname(editTemplatePath), templatePaths.configPath)
        .replace(/\.[^/.]+$/, "")
    );

    return `import { ${getTemplateConfigExportName(templateName)} as ${getEditConfigIdentifier(
      templateName
    )} } from "${moduleSpecifier.startsWith(".") ? moduleSpecifier : `./${moduleSpecifier}`}";`;
  });

  const configImportAnchor = 'import { type Config } from "@puckeditor/core";';
  if (editSource.includes(configImportAnchor)) {
    editSource = editSource.replace(
      configImportAnchor,
      [configImportAnchor, ...generatedImports].filter(Boolean).join("\n")
    );
  } else if (generatedImports.length) {
    editSource = `${generatedImports.join("\n")}\n${editSource}`;
  }

  editSource = editSource.replace(
    /const componentRegistry: Record<string, Config<any>> = \{[\s\S]*?\n\};/,
    (_match) => {
      const existingRegistryEntries =
        /const componentRegistry: Record<string, Config<any>> = \{\n([\s\S]*?)\n\};/
          .exec(_match)?.[1]
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => {
            const propertyName = line.match(/^"?([A-Za-z0-9_-]+)"?\s*:/)?.[1];
            return (
              propertyName &&
              PRESERVED_EDIT_REGISTRY_KEYS.has(propertyName) &&
              !overriddenTemplateNames.includes(propertyName)
            );
          }) ?? [];

      const registryEntries = [
        ...existingRegistryEntries,
        ...overriddenTemplateNames.map((templateName) => {
          return `"${templateName}": ${getEditConfigIdentifier(templateName)},`;
        }),
      ];

      const body = registryEntries.length
        ? `\n  ${registryEntries.join("\n  ")}\n`
        : "\n";

      return `const componentRegistry: Record<string, Config<any>> = {${body}};`;
    }
  );

  fs.writeFileSync(editTemplatePath, editSource);
};

/** Merge registry `defaultLayout.json` files into `.template-manifest.json`. */
const updateTemplateManifest = (
  rootDir: string,
  templateNames: string[]
): void => {
  const manifestPath = path.join(rootDir, ".template-manifest.json");
  const manifest: ManifestFile = fs.existsSync(manifestPath)
    ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
    : { templates: [] };

  if (!Array.isArray(manifest.templates)) {
    manifest.templates = [];
  }

  let updated = false;

  for (const templateName of templateNames) {
    const { defaultLayoutPath } = getTemplatePaths(rootDir, templateName);
    if (!fs.existsSync(defaultLayoutPath)) {
      continue;
    }

    const defaultLayoutData = JSON.parse(
      fs.readFileSync(defaultLayoutPath, "utf8")
    );
    const existingEntry = manifest.templates.find(
      (template) => template.name === templateName
    );

    if (!existingEntry) {
      manifest.templates.push({
        name: templateName,
        description: `Autogenerated template entry for ${templateName}.`,
        exampleSiteUrl: "",
        layoutRequired: true,
        defaultLayoutData,
      });
      updated = true;
      continue;
    }

    if (
      JSON.stringify(existingEntry.defaultLayoutData) !==
      JSON.stringify(defaultLayoutData)
    ) {
      existingEntry.defaultLayoutData = defaultLayoutData;
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }
};

/** Generate config files, optional template overrides, manifest entries, and edit wiring. */
export const generateRegistryTemplateFiles = ({
  rootDir,
  generatedBaseTemplateSource,
}: {
  rootDir: string;
  generatedBaseTemplateSource: string;
}): void => {
  const templateNames = getTemplateNames(rootDir);
  const overriddenTemplateNames = templateNames.filter((templateName) => {
    return hasTemplateComponentOverride(rootDir, templateName);
  });
  if (!templateNames.length && !overriddenTemplateNames.length) {
    return;
  }

  for (const templateName of templateNames) {
    const templatePaths = getTemplatePaths(rootDir, templateName);
    const items = collectTemplateComponents(rootDir, templateName);
    const configSource = buildConfigSource(
      rootDir,
      items,
      templatePaths.configPath,
      templateName
    );
    fs.ensureDirSync(path.dirname(templatePaths.configPath));
    fs.writeFileSync(templatePaths.configPath, configSource);

    if (overriddenTemplateNames.includes(templateName)) {
      const configImportPath = toPosixPath(
        path
          .relative(
            path.dirname(templatePaths.templatePath),
            templatePaths.configPath
          )
          .replace(/\.[^/.]+$/, "")
      );
      const templateSource = buildTemplateSource(
        generatedBaseTemplateSource,
        templateName,
        configImportPath.startsWith(".")
          ? configImportPath
          : `./${configImportPath}`,
        getTemplateConfigExportName(templateName)
      );
      fs.ensureDirSync(path.dirname(templatePaths.templatePath));
      fs.writeFileSync(templatePaths.templatePath, templateSource);
    }
  }

  updateTemplateManifest(rootDir, templateNames);
  updateEditTemplate(rootDir, templateNames, overriddenTemplateNames);
};
