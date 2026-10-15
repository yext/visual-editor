/**
 * Reads legacy registry templates, normalizes Yext-prefixed identifiers, and
 * validates component source before it can be copied into a Section Library.
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import {
  ID_REQUIREMENTS,
  SAFE_ID,
  isRecord,
  readJson,
  validateDefaultLayout,
} from "./shared.ts";
import type { LegacyTemplate } from "./types.ts";

const RESERVED_LAYOUT_IDS = new Set(["main", "directory", "locator", "edit"]);

/** Reads every registry template and rejects IDs that cannot become layout IDs. */
export const readLegacyTemplates = (
  rootDirectory: string
): LegacyTemplate[] => {
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
  const normalizedTemplateIds = new Map<string, string>();
  return templateDirectories.map((templateDirectory) => {
    if (!SAFE_ID.test(templateDirectory)) {
      throw new Error(
        `Template ID is not valid: ${path.join(registryDirectory, templateDirectory)}. Template IDs ${ID_REQUIREMENTS}.`
      );
    }
    const templateId = removeYextPrefix(templateDirectory);
    if (!SAFE_ID.test(templateId)) {
      throw new Error(
        `Template ID is not valid: ${path.join(registryDirectory, templateDirectory)}. After removing the yext prefix, ${JSON.stringify(templateId)} ${ID_REQUIREMENTS}.`
      );
    }
    if (normalizedTemplateIds.has(templateId)) {
      throw new Error(
        `Template IDs collide after removing the yext prefix: ${path.join(registryDirectory, normalizedTemplateIds.get(templateId)!)} and ${path.join(registryDirectory, templateDirectory)} both normalize to ${JSON.stringify(templateId)}.`
      );
    }
    normalizedTemplateIds.set(templateId, templateDirectory);
    if (RESERVED_LAYOUT_IDS.has(templateId)) {
      throw new Error(
        `Template ID is reserved for a generated template alias: ${path.join(registryDirectory, templateDirectory)} normalizes to ${JSON.stringify(templateId)}. Reserved IDs: ${Array.from(RESERVED_LAYOUT_IDS).join(", ")}. Rename the template directory.`
      );
    }
    return readLegacyTemplate(
      path.join(registryDirectory, templateDirectory),
      templateId
    );
  });
};

/** Reads one template's metadata, default layout, and component source. */
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
    .flatMap((entry) => {
      const sourcePath = path.join(componentsDirectory, entry.name);
      const componentName = path.basename(entry.name, ".tsx");
      const id = removeYextPrefix(componentName);
      if (!SAFE_ID.test(id)) {
        throw new Error(`Component ID is not valid: ${componentName}`);
      }
      const content = fs.readFileSync(sourcePath, "utf8");
      if (
        id === "CustomCodeSection" &&
        content.trim() ===
          'export { CustomCodeSection } from "@yext/visual-editor";'
      ) {
        return [];
      }
      validateComponentSource(
        content,
        sourcePath,
        [id, componentName],
        componentsDirectory
      );
      return [
        {
          id,
          content: renameComponentIdentifiers(content),
          displayName: readComponentLabel(content, sourcePath),
        },
      ];
    })
    .sort((left, right) => left.id.localeCompare(right.id));
  if (components.length === 0) {
    throw new Error(
      `Legacy template has no .tsx components: ${componentsDirectory}`
    );
  }

  const metadata = readJson(metadataPath, "legacy template metadata");
  const defaultLayout = normalizeLayoutComponentIds(
    readJson(defaultLayoutPath, "legacy default layout")
  );
  if (!isRecord(metadata)) {
    throw new Error(
      `Legacy template metadata must be an object: ${metadataPath}`
    );
  }
  validateDefaultLayout(defaultLayout, defaultLayoutPath, "Legacy");
  return { templateId, directory, metadata, defaultLayout, components };
};

/** Removes the legacy Yext prefix from a local identifier. */
const removeYextPrefix = (id: string): string => id.replace(/^yext-?/i, "");

/** Normalizes component IDs throughout nested default layout data. */
const normalizeLayoutComponentIds = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(normalizeLayoutComponentIds);
  }
  if (!isRecord(value)) {
    return value;
  }
  const isComponent = typeof value.type === "string" && isRecord(value.props);
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      key === "type" && isComponent && typeof child === "string"
        ? removeYextPrefix(child)
        : key === "props" && isComponent && isRecord(child)
          ? Object.fromEntries(
              Object.entries(child).map(([propKey, propValue]) => [
                propKey,
                propKey === "id" && typeof propValue === "string"
                  ? removeYextPrefix(propValue)
                  : normalizeLayoutComponentIds(propValue),
              ])
            )
          : normalizeLayoutComponentIds(child),
    ])
  );
};

/**
 * Removes Yext prefixes from local identifiers in component source code.
 *
 * The converter renames declarations and references for local variables,
 * functions, types, and components. It also removes the prefix from a
 * hardcoded `AnalyticsScopeProvider` `name` value. Other strings, comments,
 * and names imported from external packages remain unchanged.
 *
 * @param content The legacy component source.
 * @returns The source with local Yext-prefixed identifiers normalized.
 */
const renameComponentIdentifiers = (content: string): string => {
  const sourceFile = ts.createSourceFile(
    "component.tsx",
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const externalImportNames = new Set<string>();
  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      statement.moduleSpecifier.text.startsWith(".")
    ) {
      continue;
    }
    if (statement.importClause?.name) {
      externalImportNames.add(statement.importClause.name.text);
    }
    const namedBindings = statement.importClause?.namedBindings;
    if (namedBindings && ts.isNamespaceImport(namedBindings)) {
      externalImportNames.add(namedBindings.name.text);
    } else if (namedBindings && ts.isNamedImports(namedBindings)) {
      for (const element of namedBindings.elements) {
        externalImportNames.add(element.name.text);
        if (element.propertyName) {
          externalImportNames.add(element.propertyName.text);
        }
      }
    }
  }
  const identifierRanges: {
    start: number;
    end: number;
    nextName: string;
  }[] = [];
  /** Collects source ranges for local identifiers and analytics names to rename. */
  const visit = (node: ts.Node): void => {
    if (ts.isJsxAttribute(node) && node.name.getText(sourceFile) === "name") {
      const openingElement = node.parent.parent;
      if (
        (ts.isJsxOpeningElement(openingElement) ||
          ts.isJsxSelfClosingElement(openingElement)) &&
        openingElement.tagName.getText(sourceFile) === "AnalyticsScopeProvider"
      ) {
        const initializer = node.initializer;
        const expression =
          initializer && ts.isJsxExpression(initializer)
            ? initializer.expression
            : initializer;
        if (
          expression &&
          (ts.isStringLiteral(expression) ||
            ts.isNoSubstitutionTemplateLiteral(expression))
        ) {
          const nextName = removeYextPrefix(expression.text);
          if (nextName !== expression.text) {
            identifierRanges.push({
              start: expression.getStart(sourceFile) + 1,
              end: expression.end - 1,
              nextName,
            });
          }
        } else if (expression && ts.isTemplateExpression(expression)) {
          const nextName = removeYextPrefix(expression.head.text);
          if (nextName !== expression.head.text) {
            const start = expression.head.getStart(sourceFile) + 1;
            identifierRanges.push({
              start,
              end: start + expression.head.text.length,
              nextName,
            });
          }
        }
      }
    }
    if (ts.isIdentifier(node) && !externalImportNames.has(node.text)) {
      const parent = node.parent;
      const isPropertyName =
        (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
        (ts.isQualifiedName(parent) && parent.right === node) ||
        (ts.isPropertyAssignment(parent) && parent.name === node) ||
        (ts.isMethodDeclaration(parent) && parent.name === node) ||
        (ts.isMethodSignature(parent) && parent.name === node) ||
        (ts.isPropertyDeclaration(parent) && parent.name === node) ||
        (ts.isPropertySignature(parent) && parent.name === node);
      if (!isPropertyName) {
        const nextName = removeYextPrefix(node.text);
        if (nextName !== node.text) {
          identifierRanges.push({
            start: node.getStart(sourceFile),
            end: node.end,
            nextName,
          });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return identifierRanges
    .sort((left, right) => right.start - left.start)
    .reduce(
      (renamedContent, range) =>
        `${renamedContent.slice(0, range.start)}${range.nextName}${renamedContent.slice(range.end)}`,
      content
    );
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

/**
 * Validates a legacy component source file.
 *
 * The source must export one of the provided names, must not define its own
 * SectionConfig, and must keep relative imports inside the components directory.
 * The converter provides both the normalized name and the legacy name because
 * either name can be present in the source export.
 *
 * @param content The legacy component source.
 * @param sourcePath The source path used in validation errors.
 * @param componentNames The normalized and legacy names accepted for the export.
 * @param componentsDirectory The directory that relative imports must not leave.
 * @throws If the source does not meet the legacy component requirements.
 */
const validateComponentSource = (
  content: string,
  sourcePath: string,
  componentNames: string[],
  componentsDirectory: string
): void => {
  const hasNamedExport = componentNames.some((componentName) => {
    const directNamedExport = new RegExp(
      `export\\s+(?:async\\s+)?(?:const|function|class)\\s+${componentName}\\b`
    );
    return (
      directNamedExport.test(content) ||
      Array.from(content.matchAll(/export\s*\{([^}]*)\}/g)).some((match) =>
        match[1].split(",").some((entry) => {
          const exportName = entry
            .trim()
            .replace(/^type\s+/, "")
            .split(/\s+as\s+/)
            .at(-1)
            ?.trim();
          return exportName === componentName;
        })
      )
    );
  });
  if (!hasNamedExport) {
    throw new Error(
      `Component ${componentNames.at(-1)} must have a named export in ${sourcePath}`
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
      `Component ${componentNames.at(-1)} already defines config: ${sourcePath}`
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
