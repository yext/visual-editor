import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import {
  purposes,
  verticals,
  type EntityLayoutMetadata,
  type LibraryMetadata,
  type PageSetType,
} from "../src/sectionLibrary.ts";
import { exportDirectoryLocatorSectionLibrary } from "./exportDirectoryLocatorSectionLibrary.ts";

const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
const VERTICALS = new Set(verticals);
const PURPOSES = new Set(purposes);
const REQUIRED_BASE_SECTIONS = new Set(["Directory", "Locator"]);
const RESERVED_COMPONENT_IDS = new Set([
  ...REQUIRED_BASE_SECTIONS,
  "MainContent",
]);
const RESERVED_LAYOUT_IDS = new Set(["main", "directory", "locator", "edit"]);

type JsonRecord = Record<string, any>;

type LegacyComponent = {
  displayName: string;
  id: string;
  content: string;
};

type LegacyTemplate = {
  templateId: string;
  directory: string;
  metadata: JsonRecord;
  defaultLayout: JsonRecord;
  components: LegacyComponent[];
};

type BaseLayout = {
  directory: string;
  metadata: { id: string; pageSetType: PageSetType; [key: string]: any };
};

type BaseLibrary = {
  directory: BaseLayout;
  locator: BaseLayout;
  layouts: BaseLayout[];
};

type PreparedBaseLibrary = {
  directory: string;
  temporaryDirectory?: string;
};

type CopiedComponent = LegacyComponent & { templateId: string };

type Conversion = {
  baseLibrary: BaseLibrary;
  components: Map<string, CopiedComponent>;
  directoryLayoutId: string;
  duplicates: {
    componentId: string;
    keptTemplateId: string;
    ignoredTemplateId: string;
    differs: boolean;
  }[];
  libraryMetadata: LibraryMetadata;
  locatorLayoutId: string;
  templates: LegacyTemplate[];
};

type ConvertOptions = {
  apply: boolean;
  deleteSource: boolean;
  targetDirectory: string;
  write?: (message: string) => void;
};

type CommandOptions =
  | { help: true }
  | (Omit<ConvertOptions, "write"> & { help: false });

/**
 * Converts all legacy registry templates into one Section Library.
 *
 * Run the following from `packages/visual-editor`:
 *
 * ```
 * pnpm run convert-templates-to-section-library -- \
 *   --target <starter-path> [--apply] [--delete-source]
 * ```
 *
 * `--target` is the starter repository root. Without `--apply`, the command
 * validates the source templates and reports the planned conversion without
 * changing files. `--delete-source` requires `--apply` and removes converted
 * `src/registry` template directories after the new library is in place.
 *
 * 1. Export missing Directory and Locator source, then validate the base
 *    library and every legacy template.
 * 2. Build one Entity layout per template and one section per component ID.
 * 3. Replace the library only after the staged copy is complete.
 */
export const convertTemplatesToSectionLibrary = ({
  apply,
  deleteSource,
  targetDirectory,
  write = console.log,
}: ConvertOptions): void => {
  if (deleteSource && !apply) {
    throw new Error("--delete-source requires --apply");
  }

  const rootDirectory = path.resolve(targetDirectory);
  const libraryDirectory = path.join(rootDirectory, "src", "library");
  const templates = readLegacyTemplates(rootDirectory);
  const preparedBaseLibrary = prepareBaseLibrary(rootDirectory, templates[0]);
  try {
    const baseLibrary = readBaseLibrary(preparedBaseLibrary.directory);
    const conversion = buildConversion(templates, baseLibrary);

    if (preparedBaseLibrary.temporaryDirectory) {
      write(
        "Directory and Locator source will be added to the converted library."
      );
    }
    writeReport({ apply, conversion, deleteSource, write });
    if (!apply) {
      return;
    }

    replaceLibrary(libraryDirectory, preparedBaseLibrary.directory, conversion);
    if (deleteSource) {
      deleteLegacyTemplates(templates, write);
    }
    write(
      "The current Section Library generator supports one Entity layout. This conversion is ready for future multi-Entity support, but it cannot build yet."
    );
  } finally {
    if (preparedBaseLibrary.temporaryDirectory) {
      fs.rmSync(preparedBaseLibrary.temporaryDirectory, {
        recursive: true,
        force: true,
      });
    }
  }
};

/**
 * Returns the existing base library, or creates a temporary Directory and
 * Locator base that the conversion can validate and apply atomically.
 */
const prepareBaseLibrary = (
  rootDirectory: string,
  firstTemplate: LegacyTemplate
): PreparedBaseLibrary => {
  const libraryDirectory = path.join(rootDirectory, "src", "library");
  if (hasDirectoryLocatorBase(libraryDirectory)) {
    return { directory: libraryDirectory };
  }

  const temporaryDirectory = fs.mkdtempSync(
    path.join(rootDirectory, "src", ".section-library-base-")
  );
  const temporaryLibraryDirectory = path.join(
    temporaryDirectory,
    "src",
    "library"
  );
  if (fs.existsSync(libraryDirectory)) {
    fs.cpSync(libraryDirectory, temporaryLibraryDirectory, {
      recursive: true,
    });
  }
  exportDirectoryLocatorSectionLibrary({
    targetDirectory: temporaryDirectory,
    libraryId: firstTemplate.templateId,
    overwrite: fs.existsSync(path.join(temporaryLibraryDirectory, "shared")),
  });
  if (!fs.existsSync(path.join(temporaryLibraryDirectory, "library.json"))) {
    fs.writeFileSync(
      path.join(temporaryLibraryDirectory, "library.json"),
      formatJson(buildLibraryMetadata(firstTemplate))
    );
  }
  return {
    directory: temporaryLibraryDirectory,
    temporaryDirectory,
  };
};

const hasDirectoryLocatorBase = (libraryDirectory: string): boolean => {
  const sectionsDirectory = path.join(libraryDirectory, "sections");
  if (
    !fs.existsSync(
      path.join(libraryDirectory, "shared", "componentRegistry.ts")
    ) ||
    !fs.existsSync(path.join(sectionsDirectory, "Directory.tsx")) ||
    !fs.existsSync(path.join(sectionsDirectory, "Locator.tsx"))
  ) {
    return false;
  }
  const layoutsDirectory = path.join(libraryDirectory, "layouts");
  if (!fs.existsSync(layoutsDirectory)) {
    return false;
  }
  const pageSetTypes = fs
    .readdirSync(layoutsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .flatMap((entry) => {
      try {
        const metadata = readJson(
          path.join(layoutsDirectory, entry.name, "metadata.json"),
          `layout metadata for ${entry.name}`
        );
        return isRecord(metadata) &&
          (metadata.pageSetType === "DIRECTORY" ||
            metadata.pageSetType === "LOCATOR")
          ? [metadata.pageSetType]
          : [];
      } catch {
        return [];
      }
    });
  return (
    pageSetTypes.filter((pageSetType) => pageSetType === "DIRECTORY").length ===
      1 &&
    pageSetTypes.filter((pageSetType) => pageSetType === "LOCATOR").length === 1
  );
};

const readLegacyTemplates = (rootDirectory: string): LegacyTemplate[] => {
  const registryDirectory = path.join(rootDirectory, "src", "registry");
  if (!fs.existsSync(registryDirectory)) {
    throw new Error(`Missing legacy template registry at ${registryDirectory}`);
  }
  const templateDirectories = fs
    .readdirSync(registryDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
  if (templateDirectories.length === 0) {
    throw new Error(`No legacy templates found in ${registryDirectory}`);
  }
  return templateDirectories.map((templateId) => {
    if (!SAFE_ID.test(templateId)) {
      throw new Error(`Template ID is not valid: ${templateId}`);
    }
    if (RESERVED_LAYOUT_IDS.has(templateId)) {
      throw new Error(
        `Template ID is reserved for a generated template alias: ${templateId}`
      );
    }
    return readLegacyTemplate(
      path.join(registryDirectory, templateId),
      templateId
    );
  });
};

const readLegacyTemplate = (
  directory: string,
  templateId: string
): LegacyTemplate => {
  const metadataPath = path.join(directory, "template.json");
  const defaultLayoutPath = path.join(directory, "defaultLayout.json");
  const componentsDirectory = path.join(directory, "components");
  for (const requiredPath of [
    metadataPath,
    defaultLayoutPath,
    componentsDirectory,
  ]) {
    if (!fs.existsSync(requiredPath)) {
      throw new Error(`Legacy template is missing ${requiredPath}`);
    }
  }
  if (!fs.statSync(componentsDirectory).isDirectory()) {
    throw new Error(
      `Legacy components path is not a directory: ${componentsDirectory}`
    );
  }

  const entries = fs.readdirSync(componentsDirectory, { withFileTypes: true });
  const nestedDirectory = entries.find((entry) => entry.isDirectory());
  if (nestedDirectory) {
    throw new Error(
      `Nested component directories are not supported: ${path.join(componentsDirectory, nestedDirectory.name)}`
    );
  }
  const unsupportedFile = entries.find(
    (entry) => entry.isFile() && path.extname(entry.name) !== ".tsx"
  );
  if (unsupportedFile) {
    throw new Error(
      `Legacy component file must use the .tsx extension: ${path.join(componentsDirectory, unsupportedFile.name)}`
    );
  }
  const components = entries
    .filter((entry) => entry.isFile() && path.extname(entry.name) === ".tsx")
    .map((entry) => {
      const sourcePath = path.join(componentsDirectory, entry.name);
      const id = path.basename(entry.name, ".tsx");
      if (!SAFE_ID.test(id)) {
        throw new Error(`Component ID is not valid: ${id}`);
      }
      const content = fs.readFileSync(sourcePath, "utf8");
      validateComponentSource(content, sourcePath, id, componentsDirectory);
      return {
        id,
        content,
        displayName: readComponentLabel(content, sourcePath),
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
  if (components.length === 0) {
    throw new Error(
      `Legacy template has no .tsx components: ${componentsDirectory}`
    );
  }

  const metadata = readJson(metadataPath, "legacy template metadata");
  const defaultLayout = readJson(defaultLayoutPath, "legacy default layout");
  if (!isRecord(metadata)) {
    throw new Error(
      `Legacy template metadata must be an object: ${metadataPath}`
    );
  }
  validateDefaultLayout(defaultLayout, defaultLayoutPath, "Legacy");
  return { templateId, directory, metadata, defaultLayout, components };
};

/** Reads the static label from a legacy component configuration. */
const readComponentLabel = (content: string, sourcePath: string): string => {
  const sourceFile = ts.createSourceFile(
    sourcePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const declarations = sourceFile.statements.flatMap((statement) =>
    ts.isVariableStatement(statement) &&
    (statement.declarationList.flags & ts.NodeFlags.Const) !== 0
      ? statement.declarationList.declarations.filter(
          (declaration) =>
            declaration.type &&
            ts.isTypeReferenceNode(declaration.type) &&
            declaration.type.typeName.getText(sourceFile) ===
              "YextComponentConfig"
        )
      : []
  );
  if (declarations.length !== 1) {
    throw new Error(
      `Component must define one const with type YextComponentConfig: ${sourcePath}`
    );
  }
  const initializer = declarations[0].initializer;
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    throw new Error(
      `YextComponentConfig must use an object literal initializer: ${sourcePath}`
    );
  }
  const label = initializer.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) &&
      property.name.getText(sourceFile) === "label"
  );
  if (
    !label ||
    !ts.isStringLiteral(label.initializer) ||
    !label.initializer.text.trim()
  ) {
    throw new Error(
      `YextComponentConfig label must be a non-empty string: ${sourcePath}`
    );
  }
  return label.initializer.text;
};

const validateComponentSource = (
  content: string,
  sourcePath: string,
  componentId: string,
  componentsDirectory: string
): void => {
  const directNamedExport = new RegExp(
    `export\\s+(?:async\\s+)?(?:const|function|class)\\s+${componentId}\\b`
  );
  const namedExport =
    directNamedExport.test(content) ||
    Array.from(content.matchAll(/export\s*\{([^}]*)\}/g)).some((match) =>
      match[1].split(",").some((entry) => {
        const exportName = entry
          .trim()
          .replace(/^type\s+/, "")
          .split(/\s+as\s+/)
          .at(-1)
          ?.trim();
        return exportName === componentId;
      })
    );
  if (!namedExport) {
    throw new Error(
      `Component ${componentId} must have a named export in ${sourcePath}`
    );
  }
  const exportsConfig =
    /export\s+(?:const|let|var|function|class)\s+config\b/.test(content) ||
    Array.from(content.matchAll(/export\s*\{([^}]*)\}/g)).some((match) =>
      match[1].split(",").some((entry) => {
        const exportName = entry
          .trim()
          .split(/\s+as\s+/)
          .at(-1)
          ?.trim();
        return exportName === "config";
      })
    );
  if (
    /\b(?:const|let|var|function|class)\s+config\b/.test(content) ||
    exportsConfig
  ) {
    throw new Error(
      `Component ${componentId} already defines config: ${sourcePath}`
    );
  }
  for (const match of content.matchAll(
    /(?:import|export)\s+(?:type\s+)?(?:[^"']+?\s+from\s+)?["']([^"']+)["']/g
  )) {
    const specifier = match[1];
    if (!specifier.startsWith(".")) {
      continue;
    }
    const resolvedPath = path.resolve(path.dirname(sourcePath), specifier);
    if (
      resolvedPath !== componentsDirectory &&
      !resolvedPath.startsWith(`${componentsDirectory}${path.sep}`)
    ) {
      throw new Error(
        `Relative import leaves the legacy components directory: ${sourcePath} imports ${specifier}`
      );
    }
    if (!fs.existsSync(`${resolvedPath}.tsx`) && !fs.existsSync(resolvedPath)) {
      throw new Error(
        `Relative import cannot be copied from the legacy components directory: ${sourcePath} imports ${specifier}`
      );
    }
  }
};

const readBaseLibrary = (libraryDirectory: string): BaseLibrary => {
  const layoutsDirectory = path.join(libraryDirectory, "layouts");
  const sectionsDirectory = path.join(libraryDirectory, "sections");
  const sharedRegistryPath = path.join(
    libraryDirectory,
    "shared",
    "componentRegistry.ts"
  );
  for (const requiredPath of [
    path.join(libraryDirectory, "library.json"),
    layoutsDirectory,
    sectionsDirectory,
    sharedRegistryPath,
  ]) {
    if (!fs.existsSync(requiredPath)) {
      throw new Error(`Base Section Library is missing ${requiredPath}`);
    }
  }
  const libraryMetadataPath = path.join(libraryDirectory, "library.json");
  const libraryMetadata = readJson(
    libraryMetadataPath,
    "base library metadata"
  );
  if (
    !isRecord(libraryMetadata) ||
    libraryMetadata.schemaVersion !== 1 ||
    typeof libraryMetadata.id !== "string" ||
    !SAFE_ID.test(libraryMetadata.id) ||
    typeof libraryMetadata.displayName !== "string" ||
    !libraryMetadata.displayName.trim() ||
    typeof libraryMetadata.description !== "string" ||
    !libraryMetadata.description.trim()
  ) {
    throw new Error(
      `Base library metadata is not valid: ${libraryMetadataPath}`
    );
  }
  const layouts = fs
    .readdirSync(layoutsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const directory = path.join(layoutsDirectory, entry.name);
      const metadataPath = path.join(directory, "metadata.json");
      const metadata = readJson(
        metadataPath,
        `layout metadata for ${entry.name}`
      );
      if (
        !isRecord(metadata) ||
        !["ENTITY", "DIRECTORY", "LOCATOR"].includes(metadata.pageSetType) ||
        typeof metadata.id !== "string" ||
        metadata.id !== entry.name ||
        !SAFE_ID.test(metadata.id)
      ) {
        throw new Error(`Base layout metadata is not valid: ${metadataPath}`);
      }
      const defaultLayoutPath = path.join(directory, "defaultLayout.json");
      const defaultLayout = readJson(
        defaultLayoutPath,
        `base default layout for ${entry.name}`
      );
      validateDefaultLayout(defaultLayout, defaultLayoutPath, "Base");
      return { directory, metadata } as BaseLayout;
    });
  const directoryLayouts = layouts.filter(
    (layout) => layout.metadata.pageSetType === "DIRECTORY"
  );
  const locatorLayouts = layouts.filter(
    (layout) => layout.metadata.pageSetType === "LOCATOR"
  );
  if (directoryLayouts.length !== 1 || locatorLayouts.length !== 1) {
    throw new Error(
      "Base Section Library must contain one Directory layout and one Locator layout"
    );
  }

  const sectionIds = fs
    .readdirSync(sectionsDirectory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && [".tsx", ".jsx"].includes(path.extname(entry.name))
    )
    .map((entry) => path.basename(entry.name, path.extname(entry.name)));
  for (const requiredSection of REQUIRED_BASE_SECTIONS) {
    if (!sectionIds.includes(requiredSection)) {
      throw new Error(`Base Section Library is missing ${requiredSection}.tsx`);
    }
  }
  return {
    directory: directoryLayouts[0],
    locator: locatorLayouts[0],
    layouts,
  };
};

const buildConversion = (
  templates: LegacyTemplate[],
  baseLibrary: BaseLibrary
): Conversion => {
  const firstTemplate = templates[0];
  const components = new Map<string, CopiedComponent>();
  const duplicates: Conversion["duplicates"] = [];
  for (const template of templates) {
    for (const component of template.components) {
      const existing = components.get(component.id);
      if (existing) {
        duplicates.push({
          componentId: component.id,
          keptTemplateId: existing.templateId,
          ignoredTemplateId: template.templateId,
          differs: existing.content !== component.content,
        });
        continue;
      }
      if (RESERVED_COMPONENT_IDS.has(component.id)) {
        throw new Error(
          `Legacy component ID is reserved by the base library: ${component.id}`
        );
      }
      components.set(component.id, {
        ...component,
        templateId: template.templateId,
      });
    }
  }
  const componentIds = new Set(components.keys());
  const directoryLayoutId = `${firstTemplate.templateId}-directory`;
  const locatorLayoutId = `${firstTemplate.templateId}-locator`;
  if (
    templates.some(
      (template) =>
        template.templateId === directoryLayoutId ||
        template.templateId === locatorLayoutId
    )
  ) {
    throw new Error(
      "A legacy template ID conflicts with the generated Directory or Locator layout ID"
    );
  }
  for (const template of templates) {
    validateLayoutReferences(
      template.defaultLayout.content,
      componentIds,
      path.join(template.directory, "defaultLayout.json")
    );
    validateLayoutReferences(
      template.defaultLayout.zones,
      componentIds,
      path.join(template.directory, "defaultLayout.json")
    );
  }
  return {
    baseLibrary,
    components,
    directoryLayoutId,
    duplicates,
    libraryMetadata: buildLibraryMetadata(firstTemplate),
    locatorLayoutId,
    templates,
  };
};

const buildLibraryMetadata = (template: LegacyTemplate): LibraryMetadata => {
  const displayName = requireString(
    template.metadata.displayName,
    path.join(template.directory, "template.json"),
    "displayName"
  );
  return {
    schemaVersion: 1,
    id: template.templateId,
    displayName,
    description:
      typeof template.metadata.description === "string" &&
      template.metadata.description.trim()
        ? template.metadata.description
        : `Sections and layouts converted from ${displayName}.`,
  };
};

const buildEntityLayoutMetadata = (
  template: LegacyTemplate
): EntityLayoutMetadata => {
  const metadataPath = path.join(template.directory, "template.json");
  const vertical = readMetadataList(
    template.metadata.verticals,
    VERTICALS,
    metadataPath,
    "verticals"
  );
  const purpose = readMetadataList(
    template.metadata.purposes,
    PURPOSES,
    metadataPath,
    "purposes"
  );
  return {
    id: template.templateId,
    displayName: requireString(
      template.metadata.displayName,
      metadataPath,
      "displayName"
    ),
    previewImageUrl: requireString(
      template.metadata.previewImageUrl,
      metadataPath,
      "previewImageUrl"
    ),
    ...(vertical.length > 0 ? { vertical } : {}),
    ...(purpose.length > 0 ? { purpose } : {}),
    pageSetType: "ENTITY",
  };
};

const readMetadataList = <T extends string>(
  value: unknown,
  allowedValues: Set<T>,
  sourcePath: string,
  property: string
): T[] => {
  if (value === undefined) {
    return [];
  }
  if (
    !Array.isArray(value) ||
    value.some(
      (item) => typeof item !== "string" || !allowedValues.has(item as T)
    )
  ) {
    throw new Error(
      `${sourcePath} ${property} must contain supported string values`
    );
  }
  return value as T[];
};

function validateDefaultLayout(
  defaultLayout: unknown,
  sourcePath: string,
  description: string
): asserts defaultLayout is JsonRecord {
  if (
    !isRecord(defaultLayout) ||
    !isRecord(defaultLayout.root) ||
    !isRecord(defaultLayout.zones) ||
    !Array.isArray(defaultLayout.content)
  ) {
    throw new Error(
      `${description} default layout is not valid: ${sourcePath}`
    );
  }
}

const validateLayoutReferences = (
  value: unknown,
  componentIds: Set<string>,
  sourcePath: string
): void => {
  if (Array.isArray(value)) {
    value.forEach((item) =>
      validateLayoutReferences(item, componentIds, sourcePath)
    );
    return;
  }
  if (!isRecord(value)) {
    return;
  }
  if (
    typeof value.type === "string" &&
    isRecord(value.props) &&
    value.type !== "MainContent" &&
    !componentIds.has(value.type)
  ) {
    throw new Error(
      `Default layout references missing section ${value.type}: ${sourcePath}`
    );
  }
  Object.values(value).forEach((child) =>
    validateLayoutReferences(child, componentIds, sourcePath)
  );
};

const replaceLibrary = (
  libraryDirectory: string,
  baseLibraryDirectory: string,
  conversion: Conversion
): void => {
  const parentDirectory = path.dirname(libraryDirectory);
  const stagedDirectory = fs.mkdtempSync(
    path.join(parentDirectory, ".section-library-conversion-")
  );
  const backupDirectory = path.join(
    parentDirectory,
    `.section-library-backup-${process.pid}-${Date.now()}`
  );
  const hasExistingLibrary = fs.existsSync(libraryDirectory);
  try {
    fs.cpSync(baseLibraryDirectory, stagedDirectory, { recursive: true });
    writeConvertedLibrary(stagedDirectory, conversion);
    if (hasExistingLibrary) {
      fs.renameSync(libraryDirectory, backupDirectory);
    }
    try {
      fs.renameSync(stagedDirectory, libraryDirectory);
    } catch (error) {
      if (hasExistingLibrary) {
        fs.renameSync(backupDirectory, libraryDirectory);
      }
      throw error;
    }
    if (hasExistingLibrary) {
      fs.rmSync(backupDirectory, { recursive: true, force: true });
    }
  } catch (error) {
    fs.rmSync(stagedDirectory, { recursive: true, force: true });
    if (fs.existsSync(backupDirectory) && !fs.existsSync(libraryDirectory)) {
      fs.renameSync(backupDirectory, libraryDirectory);
    }
    throw error;
  }
};

const writeConvertedLibrary = (
  libraryDirectory: string,
  conversion: Conversion
): void => {
  fs.rmSync(path.join(libraryDirectory, ".generated"), {
    recursive: true,
    force: true,
  });
  fs.writeFileSync(
    path.join(libraryDirectory, "library.json"),
    formatJson(conversion.libraryMetadata)
  );
  const layoutsDirectory = path.join(libraryDirectory, "layouts");
  for (const layout of conversion.baseLibrary.layouts) {
    if (layout.metadata.pageSetType === "ENTITY") {
      fs.rmSync(path.join(layoutsDirectory, path.basename(layout.directory)), {
        recursive: true,
        force: true,
      });
    }
  }
  renameBaseLayout(
    libraryDirectory,
    conversion.baseLibrary.directory,
    conversion.directoryLayoutId
  );
  renameBaseLayout(
    libraryDirectory,
    conversion.baseLibrary.locator,
    conversion.locatorLayoutId
  );
  for (const template of conversion.templates) {
    const layoutDirectory = path.join(layoutsDirectory, template.templateId);
    fs.mkdirSync(layoutDirectory, { recursive: true });
    fs.writeFileSync(
      path.join(layoutDirectory, "metadata.json"),
      formatJson(buildEntityLayoutMetadata(template))
    );
    fs.writeFileSync(
      path.join(layoutDirectory, "defaultLayout.json"),
      formatJson(template.defaultLayout)
    );
  }
  const sectionsDirectory = path.join(libraryDirectory, "sections");
  for (const entry of fs.readdirSync(sectionsDirectory, {
    withFileTypes: true,
  })) {
    if (
      entry.isFile() &&
      [".tsx", ".jsx"].includes(path.extname(entry.name)) &&
      !REQUIRED_BASE_SECTIONS.has(
        path.basename(entry.name, path.extname(entry.name))
      )
    ) {
      fs.rmSync(path.join(sectionsDirectory, entry.name));
    }
  }
  for (const component of conversion.components.values()) {
    fs.writeFileSync(
      path.join(sectionsDirectory, `${component.id}.tsx`),
      buildSectionSource(component)
    );
  }
};

const renameBaseLayout = (
  libraryDirectory: string,
  layout: BaseLayout,
  layoutId: string
): void => {
  const layoutsDirectory = path.join(libraryDirectory, "layouts");
  const currentDirectory = path.join(
    layoutsDirectory,
    path.basename(layout.directory)
  );
  const nextDirectory = path.join(layoutsDirectory, layoutId);
  if (currentDirectory !== nextDirectory) {
    fs.rmSync(nextDirectory, { recursive: true, force: true });
    fs.renameSync(currentDirectory, nextDirectory);
  }
  const metadata = readJson(
    path.join(nextDirectory, "metadata.json"),
    `layout metadata for ${layoutId}`
  );
  if (!isRecord(metadata)) {
    throw new Error(`Layout metadata is not valid: ${layoutId}`);
  }
  fs.writeFileSync(
    path.join(nextDirectory, "metadata.json"),
    formatJson({ ...metadata, id: layoutId })
  );
};

const buildSectionSource = (component: CopiedComponent): string => {
  return [
    'import type { SectionConfig } from "@yext/visual-editor";',
    "",
    component.content.trimEnd(),
    "",
    "export const config: SectionConfig = {",
    `  id: ${JSON.stringify(component.id)},`,
    `  displayName: ${JSON.stringify(component.displayName)},`,
    // The description should default to the display name until a human updates it manually.
    `  description: ${JSON.stringify(component.displayName)},`,
    '  pageSetTypes: ["ENTITY"],',
    "};",
    "",
  ].join("\n");
};

const deleteLegacyTemplates = (
  templates: LegacyTemplate[],
  write: (message: string) => void
): void => {
  for (const template of templates) {
    fs.rmSync(template.directory, { recursive: true });
    write(`Removed ${template.directory}`);
  }
};

const writeReport = ({
  apply,
  conversion,
  deleteSource,
  write,
}: {
  apply: boolean;
  conversion: Conversion;
  deleteSource: boolean;
  write: (message: string) => void;
}): void => {
  write(
    apply
      ? "Applying Section Library conversion:"
      : "Dry run: no files changed."
  );
  write(
    `  library: ${conversion.libraryMetadata.id} from ${conversion.templates[0].templateId}`
  );
  write(
    `  Entity layouts: ${conversion.templates.map((template) => template.templateId).join(", ")}`
  );
  write(
    `  shared sections: ${Array.from(conversion.components.keys()).join(", ")}`
  );
  for (const duplicate of conversion.duplicates) {
    write(
      `  duplicate section ${duplicate.componentId}: kept ${duplicate.keptTemplateId}, ignored ${duplicate.ignoredTemplateId}${duplicate.differs ? " (source differs)" : ""}`
    );
  }
  write(`  Directory layout: ${conversion.directoryLayoutId}`);
  write(`  Locator layout: ${conversion.locatorLayoutId}`);
  write(
    deleteSource
      ? "  legacy source: remove after conversion"
      : "  legacy source: keep"
  );
};

const requireString = (
  value: unknown,
  sourcePath: string,
  property: string
): string => {
  if (typeof value !== "string") {
    throw new Error(`${sourcePath} must define a string ${property}`);
  }
  return value;
};

const readJson = (filePath: string, description: string): unknown => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `Could not read ${description} at ${filePath}: ${getErrorMessage(error)}`
    );
  }
};

const formatJson = (value: unknown): string =>
  `${JSON.stringify(value, null, 2)}\n`;

const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const parseOptions = (args: string[]): CommandOptions => {
  if (args.includes("--help") || args.includes("-h")) {
    return { help: true };
  }
  const targetIndex = args.indexOf("--target");
  const targetDirectory = args[targetIndex + 1];
  if (targetIndex === -1 || !targetDirectory) {
    throw new Error(
      "Usage: convertTemplatesToSectionLibrary --target <starter path> [--apply] [--delete-source]"
    );
  }

  let apply = false;
  let deleteSource = false;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    switch (argument) {
      case "--":
        break;
      case "--target":
        index += 1;
        break;
      case "--apply":
        apply = true;
        break;
      case "--delete-source":
        deleteSource = true;
        break;
      default:
        throw new Error(`Unknown argument: ${argument}`);
    }
  }
  return {
    help: false,
    apply,
    deleteSource,
    targetDirectory: path.resolve(targetDirectory),
  };
};

const printHelp = (): void => {
  console.log(`Usage: pnpm run convert-templates-to-section-library -- --target <starter path> [--apply] [--delete-source]

Converts every src/registry/<template-id> directory in the target starter into Entity layouts in one Section Library.
Without --apply, the script reports the conversion without changing files.
--delete-source removes converted legacy templates after a successful apply.`);
};

const main = (): void => {
  try {
    const options = parseOptions(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }
    convertTemplatesToSectionLibrary(options);
  } catch (error) {
    console.error(`Conversion failed: ${getErrorMessage(error)}`);
    process.exitCode = 1;
  }
};

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main();
}
