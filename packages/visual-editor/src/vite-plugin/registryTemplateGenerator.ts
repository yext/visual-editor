/**
 * High-level overview:
 *
 * 1) Discover templates from `<starter>/src/registry/*`.
 *    - Each subdirectory under `<starter>/src/registry` is treated as a
 *      template name.
 *    - Example: `<starter>/src/registry/main` -> template name `main`.
 *
 * 2) Generate one config per template.
 *    - Scan template-specific components from
 *      `<starter>/src/registry/<template>/components`.
 *    - Emit `<starter>/src/registry/<template>/config.tsx`.
 *    - Ignore registry templates that do not contain any component source files.
 *
 * 3) Materialize template files for discovered registry templates.
 *    - Use the plugin's internal `base.tsx` source as the shared base template.
 *    - Emit `<starter>/src/templates/<template>.tsx` for each registry
 *      template that has components.
 *    - Insert the matching `<starter>/src/registry/<template>/config.tsx`
 *      import.
 *    - Adapt `baseConfig` and rename the exported `Base` component to match the
 *      template name.
 *
 * 4) Update `<starter>/.template-manifest.json`.
 *    - Read `<starter>/src/registry/<template>/defaultLayout.json` when
 *      present.
 *    - Write that JSON into the matching template's `defaultLayoutData`.
 *    - Create a manifest entry when a registry template is missing.
 *
 * 5) Update editor wiring.
 *    - Patch `<starter>/src/templates/edit.tsx`.
 *    - Import each generated config into `componentRegistry`.
 *    - Ensure `componentRegistry` points each generated template name to its
 *      config while preserving existing `directory` and `locator` entries.
 */
import path from "node:path";
import fs from "fs-extra";
import { Project, QuoteKind, SyntaxKind, type SourceFile } from "ts-morph";

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

type CollectedTemplate = {
  templateName: string;
  templatePaths: TemplatePaths;
  items: CollectedItem[];
};

type ImportDefinition = string | { name: string; alias?: string };

type InsertNamedImportOptions = {
  moduleSpecifier: string;
  namedImports: ImportDefinition[];
};

const VALID_EXTENSIONS = new Set([".tsx", ".ts", ".jsx", ".js"]);
const PRESERVED_EDIT_REGISTRY_KEYS = new Set(["directory", "locator"]);
const AST_PROJECT = new Project({
  manipulationSettings: {
    quoteKind: QuoteKind.Double,
  },
});

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

const toCamelCase = (value: string): string => {
  const pascalValue = toPascalCase(value);
  if (!pascalValue) {
    return "";
  }

  return pascalValue[0].toLowerCase() + pascalValue.slice(1);
};

const requireNonEmpty = (value: string, errorMessage: string): string => {
  if (!value) {
    throw new Error(errorMessage);
  }

  return value;
};

const toPosixPath = (value: string): string => {
  return value.split(path.sep).join(path.posix.sep);
};

const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

const readUtf8File = (filePath: string, description: string): string => {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(
      `Failed to read ${description} at ${filePath}: ${toErrorMessage(error)}`
    );
  }
};

const readJsonFile = <T>(filePath: string, description: string): T => {
  const source = readUtf8File(filePath, description);

  try {
    return JSON.parse(source) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse ${description} at ${filePath}: ${toErrorMessage(error)}`
    );
  }
};

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

const walkDirectory = (directory: string): string[] => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(directory, { withFileTypes: true });
  } catch (error) {
    throw new Error(
      `Failed to read registry directory at ${directory}: ${toErrorMessage(error)}`
    );
  }

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

const getTemplateNames = (rootDir: string): string[] => {
  const registryDir = path.join(rootDir, "src", "registry");
  if (!fs.existsSync(registryDir)) {
    return [];
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(registryDir, { withFileTypes: true });
  } catch (error) {
    throw new Error(
      `Failed to read registry directory at ${registryDir}: ${toErrorMessage(error)}`
    );
  }

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
};

/**
 * Collects template-specific components for a template config while keeping
 * generated identifiers unique within one config file.
 * @param {string} rootDir
 * @param {string} templateName
 * @returns {CollectedItem[]}
 */
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

const getTemplateConfigExportName = (templateName: string): string => {
  return `${requireNonEmpty(
    toPascalCase(templateName),
    `Could not derive a config export name from ${templateName}`
  )}Config`;
};

const getEditConfigIdentifier = (templateName: string): string => {
  return `${requireNonEmpty(
    toCamelCase(templateName),
    `Could not derive an edit config identifier from ${templateName}`
  )}Config`;
};

const renderIdentifierMap = (value: Record<string, string>): string => {
  return [
    "{",
    ...Object.entries(value).map(([key, identifier]) => {
      return `    ${JSON.stringify(key)}: ${identifier},`;
    }),
    "  }",
  ].join("\n");
};

/**
 * Creates the TypeScript source for a generated Puck config.
 * @param {string} rootDir
 * @param {CollectedItem[]} items
 * @param {string} outputFilePath
 * @param {string} templateName
 * @returns {string}
 */
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

const getAstSourceFile = (filePath: string): SourceFile => {
  AST_PROJECT.getSourceFile(filePath)?.forget();
  try {
    return AST_PROJECT.addSourceFileAtPath(filePath);
  } catch (error) {
    throw new Error(
      `Failed to read TypeScript source at ${filePath}: ${toErrorMessage(error)}`
    );
  }
};

const removeNamedImports = (
  sourceFile: SourceFile,
  moduleSpecifier: string,
  namesToRemove: string[]
): void => {
  const declaration = sourceFile.getImportDeclarations().find((item) => {
    return item.getModuleSpecifierValue() === moduleSpecifier;
  });
  if (!declaration) {
    return;
  }

  for (const namedImport of declaration.getNamedImports()) {
    if (namesToRemove.includes(namedImport.getName())) {
      namedImport.remove();
    }
  }

  if (
    declaration.getNamedImports().length === 0 &&
    !declaration.getDefaultImport() &&
    !declaration.getNamespaceImport()
  ) {
    declaration.remove();
  }
};

const removeGeneratedConfigImports = (sourceFile: SourceFile): void => {
  for (const declaration of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = declaration.getModuleSpecifierValue();
    if (
      moduleSpecifier === "../config" ||
      moduleSpecifier === "./config" ||
      moduleSpecifier.endsWith("/config")
    ) {
      declaration.remove();
    }
  }
};

const insertNamedImport = (
  sourceFile: SourceFile,
  options: InsertNamedImportOptions
): void => {
  const pagesComponentsImport = sourceFile
    .getImportDeclarations()
    .find((item) => {
      return item.getModuleSpecifierValue() === "@yext/pages-components";
    });

  if (pagesComponentsImport) {
    sourceFile.insertImportDeclaration(
      pagesComponentsImport.getChildIndex() + 1,
      {
        namedImports: options.namedImports,
        moduleSpecifier: options.moduleSpecifier,
      }
    );
    return;
  }

  sourceFile.addImportDeclaration({
    namedImports: options.namedImports,
    moduleSpecifier: options.moduleSpecifier,
  });
};

const ensureSideEffectImport = (
  sourceFile: SourceFile,
  moduleSpecifier: string
): void => {
  const exists = sourceFile.getImportDeclarations().some((item) => {
    return item.getModuleSpecifierValue() === moduleSpecifier;
  });
  if (!exists) {
    sourceFile.insertImportDeclaration(0, {
      moduleSpecifier,
    });
  }
};

const setEditComponentRegistry = (
  sourceFile: SourceFile,
  templateNames: string[]
): void => {
  const declaration = sourceFile.getVariableDeclaration("componentRegistry");
  if (!declaration) {
    return;
  }

  const initializer = declaration.getInitializerIfKind(
    SyntaxKind.ObjectLiteralExpression
  );
  if (!initializer) {
    const registryEntries = templateNames
      .map((templateName) => {
        return `  "${templateName}": ${getEditConfigIdentifier(templateName)},`;
      })
      .join("\n");
    declaration.setInitializer(`{
${registryEntries}
}`);
    return;
  }

  for (const property of initializer.getProperties()) {
    const propertyAssignment = property.asKind(SyntaxKind.PropertyAssignment);
    if (!propertyAssignment) {
      continue;
    }

    const propertyName = propertyAssignment.getName();
    if (PRESERVED_EDIT_REGISTRY_KEYS.has(propertyName)) {
      continue;
    }

    propertyAssignment.remove();
  }

  for (const templateName of templateNames) {
    initializer.addPropertyAssignment({
      name: `"${templateName}"`,
      initializer: getEditConfigIdentifier(templateName),
    });
  }
};

/**
 * Renders a template file from the plugin's internal base template by inserting
 * the registry config import, replacing `baseConfig`, and renaming the exported
 * `Base` component.
 * @param {string} baseSource
 * @param {string} templateName
 * @param {string} configImportPath
 * @param {string} configExportName
 * @returns {string}
 */
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
  const sourceFilePath = path.join(
    process.cwd(),
    "__generated_template_source__.tsx"
  );
  AST_PROJECT.getSourceFile(sourceFilePath)?.forget();

  const sourceFile = AST_PROJECT.createSourceFile(sourceFilePath, baseSource, {
    overwrite: true,
  });

  insertNamedImport(sourceFile, {
    namedImports: [configExportName],
    moduleSpecifier: configImportPath,
  });
  removeNamedImports(sourceFile, "@puckeditor/core", ["Config"]);

  const baseConfigDeclaration = sourceFile.getVariableDeclaration("baseConfig");
  if (!baseConfigDeclaration) {
    sourceFile.forget();
    throw new Error("Could not find baseConfig in generated base template");
  }

  for (const referenceNode of baseConfigDeclaration.findReferencesAsNodes()) {
    if (
      referenceNode.getStart() ===
      baseConfigDeclaration.getNameNode().getStart()
    ) {
      continue;
    }

    referenceNode.replaceWithText(configExportName);
  }

  const baseConfigStatement = baseConfigDeclaration.getFirstAncestorByKind(
    SyntaxKind.VariableStatement
  );
  if (!baseConfigStatement) {
    sourceFile.forget();
    throw new Error(
      "Could not find baseConfig declaration in generated base template"
    );
  }
  baseConfigStatement.remove();

  const baseDeclaration = sourceFile.getVariableDeclaration("Base");
  if (!baseDeclaration) {
    sourceFile.forget();
    throw new Error(
      "Could not find Base component placeholder in generated base template"
    );
  }
  baseDeclaration.rename(templateComponentName);

  const exportAssignment = sourceFile.getExportAssignment((assignment) => {
    return !assignment.isExportEquals();
  });
  if (!exportAssignment) {
    sourceFile.forget();
    throw new Error(
      "Could not find default export placeholder in generated base template"
    );
  }
  exportAssignment.setExpression(templateComponentName);

  sourceFile.formatText();
  const renderedTemplateSource = sourceFile.getFullText();
  sourceFile.forget();
  return renderedTemplateSource;
};

/**
 * Updates `src/templates/edit.tsx` to import each generated config and register it.
 * @param {string} rootDir
 * @param {string[]} templateNames
 * @returns {void}
 */
const updateEditTemplate = (rootDir: string, templateNames: string[]): void => {
  const editTemplatePath = path.join(rootDir, "src", "templates", "edit.tsx");
  if (!fs.existsSync(editTemplatePath)) {
    return;
  }

  const originalSource = readUtf8File(editTemplatePath, "edit template source");
  const sourceFile = getAstSourceFile(editTemplatePath);

  removeGeneratedConfigImports(sourceFile);
  ensureSideEffectImport(sourceFile, "@yext/visual-editor/editor.css");
  ensureSideEffectImport(sourceFile, "../index.css");

  for (const templateName of templateNames) {
    const templatePaths = getTemplatePaths(rootDir, templateName);
    const moduleSpecifier = toPosixPath(
      path
        .relative(path.dirname(editTemplatePath), templatePaths.configPath)
        .replace(/\.[^/.]+$/, "")
    );

    insertNamedImport(sourceFile, {
      namedImports: [
        {
          name: getTemplateConfigExportName(templateName),
          alias: getEditConfigIdentifier(templateName),
        },
      ],
      moduleSpecifier: moduleSpecifier.startsWith(".")
        ? moduleSpecifier
        : `./${moduleSpecifier}`,
    });
  }

  setEditComponentRegistry(sourceFile, templateNames);

  sourceFile.formatText();
  const updatedSource = sourceFile.getFullText();
  sourceFile.forget();

  if (updatedSource !== originalSource) {
    fs.writeFileSync(editTemplatePath, updatedSource);
  }
};

/**
 * Updates `.template-manifest.json` so matching template entries use
 * `src/registry/<template>/defaultLayout.json` as `defaultLayoutData`,
 * creating manifest entries when they are missing.
 * @param {string} rootDir
 * @param {string[]} templateNames
 * @returns {void}
 */
const updateTemplateManifest = (
  rootDir: string,
  templateNames: string[]
): void => {
  const manifestPath = path.join(rootDir, ".template-manifest.json");
  const manifest: ManifestFile = fs.existsSync(manifestPath)
    ? readJsonFile<ManifestFile>(manifestPath, "template manifest JSON")
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

    const defaultLayoutData = readJsonFile<unknown>(
      defaultLayoutPath,
      `default layout JSON for template "${templateName}"`
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

/**
 * Generates all template configs, optional template overrides, matching
 * `.template-manifest.json` entries, and `edit.tsx` registry wiring.
 * @param {{
 *   rootDir: string,
 *   generatedBaseTemplateSource: string
 * }} options
 * @returns {void}
 */
export const generateRegistryTemplateFiles = ({
  rootDir,
  generatedBaseTemplateSource,
}: {
  rootDir: string;
  generatedBaseTemplateSource: string;
}): void => {
  const collectedTemplates: CollectedTemplate[] = getTemplateNames(rootDir)
    .map((templateName) => {
      return {
        templateName,
        templatePaths: getTemplatePaths(rootDir, templateName),
        items: collectTemplateComponents(rootDir, templateName),
      };
    })
    .filter(({ items }) => items.length > 0);

  if (!collectedTemplates.length) {
    return;
  }

  const templateNames = collectedTemplates.map(
    ({ templateName }) => templateName
  );

  for (const { templateName, templatePaths, items } of collectedTemplates) {
    const configSource = buildConfigSource(
      rootDir,
      items,
      templatePaths.configPath,
      templateName
    );
    fs.ensureDirSync(path.dirname(templatePaths.configPath));
    fs.writeFileSync(templatePaths.configPath, configSource);

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

  updateTemplateManifest(rootDir, templateNames);
  updateEditTemplate(rootDir, templateNames);
};
