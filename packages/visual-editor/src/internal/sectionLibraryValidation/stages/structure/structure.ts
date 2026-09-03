import path from "node:path";
import fs from "fs-extra";
import {
  purposes,
  verticals,
  type LayoutMetadata,
  type PageSetType,
  type SectionLibraryLayout,
  type SharedHiddenPuckComponent,
} from "../../../../types/sectionLibrary.ts";
import { buildLocalEditorDataTemplateName } from "../../../../vite-plugin/local-editor/generatedFiles.ts";
import { extractSectionConfigFrontmatter } from "../../../../vite-plugin/section-library/sectionFrontmatter.ts";
import { readSharedComponentRegistry } from "../../../../vite-plugin/section-library/sharedComponentRegistry.ts";
import type {
  ResolvedSection,
  ResolvedSectionLibraryStructure,
  ValidationIssue,
} from "../../types.ts";

const reservedLayoutIds = new Set([
  "main", // legacy Entity template ID
  "directory", // legacy Directory template ID
  "locator", // legacy Locator template ID
  "edit", // legacy editor template ID
  "local-editor", // generated Local Editor template ID
]);
export const safeSectionLibraryIdPattern = /^[A-Za-z0-9_-]+$/;
type ParsedLayout = SectionLibraryLayout & { defaultLayoutPath: string };

/** validateSectionLibraryStructure validates that repo structure is correct for Section Libraries. */
export const validateSectionLibraryStructure = (
  rootDir: string
): {
  issues: ValidationIssue[];
  structure?: ResolvedSectionLibraryStructure;
} => {
  const libraryDirectory = path.join(rootDir, "src", "library");

  const issues: ValidationIssue[] = [];
  const addIssue = (filePath: string, rule: string, message: string): void => {
    issues.push({
      category: "structure",
      filePath: path.relative(rootDir, filePath) || ".",
      message: cleanMessage(message, rootDir),
      rule,
    });
  };

  const sections = readSections(rootDir, libraryDirectory, addIssue);
  const registryPath = path.join(
    libraryDirectory,
    "shared",
    "componentRegistry.ts"
  );
  let sharedRegistry: ReturnType<typeof readSharedComponentRegistry>;
  try {
    sharedRegistry = readSharedComponentRegistry(registryPath);
  } catch (error) {
    addIssue(registryPath, "shared/invalid", errorMessage(error));
  }

  const sharedComponents = sharedRegistry?.components ?? [];
  const sharedRootPageSetTypes = sharedRegistry?.rootPageSetTypes ?? [];
  const parsedLayouts = readLayouts(libraryDirectory, addIssue);
  const layouts = parsedLayouts.map(
    ({ defaultLayoutPath: _, ...layout }) => layout
  );

  if (
    !sharedRegistry &&
    !fs.existsSync(registryPath) &&
    parsedLayouts.some((layout) => layout.metadata.pageSetType !== "ENTITY")
  ) {
    addIssue(
      registryPath,
      "shared/missing",
      "A shared component registry is required for DIRECTORY and LOCATOR layouts."
    );
  }
  validateComponentIds(sections, sharedComponents, libraryDirectory, addIssue);
  for (const layout of parsedLayouts) {
    validateLayoutReferences(layout, sections, sharedComponents, addIssue);
  }

  if (issues.length > 0) {
    return { issues };
  }
  return {
    issues,
    structure: {
      sections,
      sharedComponents,
      sharedRootPageSetTypes,
      layouts,
    },
  };
};

const readSections = (
  rootDir: string,
  libraryDirectory: string,
  addIssue: AddIssue
): ResolvedSection[] => {
  const sectionsDirectory = path.join(libraryDirectory, "sections");
  if (!fs.existsSync(sectionsDirectory)) {
    return [];
  }

  const sections: ResolvedSection[] = [];
  for (const entry of fs
    .readdirSync(sectionsDirectory, { withFileTypes: true })
    .filter((entry) => entry.name !== ".gitkeep")
    .sort((left, right) => left.name.localeCompare(right.name))) {
    const sourcePath = path.join(sectionsDirectory, entry.name);

    if (entry.isDirectory()) {
      addIssue(
        sourcePath,
        "sections/directory",
        "Section directories are not supported."
      );
      continue;
    }

    const extension = path.extname(entry.name);
    if (!entry.isFile() || ![".tsx", ".jsx"].includes(extension)) {
      addIssue(
        sourcePath,
        "sections/extension",
        "Sections must be .tsx or .jsx files."
      );
      continue;
    }

    const componentName = path.basename(entry.name, extension);
    if (!safeSectionLibraryIdPattern.test(componentName)) {
      addIssue(
        sourcePath,
        "sections/component-name",
        `Section component name is not valid: ${componentName}`
      );
      continue;
    }

    try {
      const section: ResolvedSection = {
        ...extractSectionConfigFrontmatter(sourcePath, componentName),
        componentName,
        sourcePath: path.relative(rootDir, sourcePath),
      };

      if (!safeSectionLibraryIdPattern.test(section.id)) {
        addIssue(sourcePath, "sections/id", "config must define a valid id");
      } else {
        sections.push(section);
      }
    } catch (error) {
      const message = errorMessage(error);
      const invalidId = message.includes("config must define a valid id");
      addIssue(
        sourcePath,
        invalidId ? "sections/id" : "sections/frontmatter",
        sourcePath.endsWith(".tsx") && message.includes("config")
          ? `${message}. Accepted form: export const config: SectionConfig = { ... };`
          : message
      );
    }
  }
  return sections;
};

const readLayouts = (
  libraryDirectory: string,
  addIssue: AddIssue
): ParsedLayout[] => {
  const layoutsDirectory = path.join(libraryDirectory, "layouts");

  if (!fs.existsSync(layoutsDirectory)) {
    addIssue(layoutsDirectory, "layouts/missing", "Missing layouts directory.");
    return [];
  }

  const layoutDirectories = fs
    .readdirSync(layoutsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));

  const layouts = layoutDirectories.flatMap((entry) => {
    const layout = readLayout(
      path.join(layoutsDirectory, entry.name),
      addIssue
    );
    return layout ? [layout] : [];
  });

  if (layouts.length === layoutDirectories.length) {
    const layoutIds = new Set<string>();
    const layoutIdByLocalEditorDataTemplateName = new Map<string, string>();

    for (const layout of layouts) {
      const layoutId = layout.metadata.id;

      if (layoutIds.has(layoutId)) {
        addIssue(
          layoutsDirectory,
          "layouts/duplicate-id",
          `Layout ID is not unique: ${layoutId}`
        );
      } else {
        layoutIds.add(layoutId);
      }

      if (
        layout.metadata.pageSetType !== "ENTITY" &&
        layout.metadata.pageSetType !== "DIRECTORY"
      ) {
        continue;
      }

      const templateName = buildLocalEditorDataTemplateName(layoutId);
      const existingLayoutId =
        layoutIdByLocalEditorDataTemplateName.get(templateName);

      if (existingLayoutId && existingLayoutId !== layoutId) {
        addIssue(
          layoutsDirectory,
          "layouts/local-editor-template-collision",
          `Layout IDs ${existingLayoutId} and ${layoutId} generate the same Local Editor id: ${templateName}`
        );
      } else {
        layoutIdByLocalEditorDataTemplateName.set(templateName, layoutId);
      }
    }

    const layoutCountByPageSetType = new Map<PageSetType, number>();

    for (const layout of layouts) {
      const pageSetType = layout.metadata.pageSetType;
      layoutCountByPageSetType.set(
        pageSetType,
        (layoutCountByPageSetType.get(pageSetType) ?? 0) + 1
      );
    }

    if ((layoutCountByPageSetType.get("ENTITY") ?? 0) === 0) {
      addIssue(
        layoutsDirectory,
        "layouts/cardinality",
        "Section Library build mode requires at least one ENTITY layout."
      );
    }

    if (
      layoutCountByPageSetType.get("DIRECTORY") !== 1 ||
      layoutCountByPageSetType.get("LOCATOR") !== 1
    ) {
      addIssue(
        layoutsDirectory,
        "layouts/cardinality",
        "Section Library build mode requires exactly one DIRECTORY and one LOCATOR layout."
      );
    }
  }
  return layouts.sort(compareLayouts);
};

const pageSetTypeOrder: Record<PageSetType, number> = {
  ENTITY: 0,
  DIRECTORY: 1,
  LOCATOR: 2,
};

const compareLayouts = (left: ParsedLayout, right: ParsedLayout): number =>
  pageSetTypeOrder[left.metadata.pageSetType] -
    pageSetTypeOrder[right.metadata.pageSetType] ||
  left.metadata.id.localeCompare(right.metadata.id);

const readLayout = (
  layoutDirectory: string,
  addIssue: AddIssue
): ParsedLayout | undefined => {
  const metadataPath = path.join(layoutDirectory, "metadata.json");
  const defaultLayoutPath = path.join(layoutDirectory, "defaultLayout.json");
  const metadataValue = readJsonObject(
    metadataPath,
    "layout metadata",
    addIssue
  );
  const defaultLayout = readJsonObject(
    defaultLayoutPath,
    "default layout",
    addIssue
  );

  if (!metadataValue || !defaultLayout) {
    return;
  }

  try {
    const pageSetType = metadataValue.pageSetType;
    let metadata: LayoutMetadata;
    if (pageSetType === "ENTITY") {
      const vertical = getOptionalStringListProperty(
        metadataValue,
        "vertical",
        verticals,
        metadataPath
      );
      const purpose = getOptionalStringListProperty(
        metadataValue,
        "purpose",
        purposes,
        metadataPath
      );

      metadata = {
        id: requireString(metadataValue.id, metadataPath, "id"),
        displayName: requireString(
          metadataValue.displayName,
          metadataPath,
          "displayName"
        ),
        ...(vertical === undefined ? {} : { vertical }),
        ...(purpose === undefined ? {} : { purpose }),
        pageSetType,
      };
    } else if (pageSetType === "DIRECTORY" || pageSetType === "LOCATOR") {
      metadata = {
        id: requireString(metadataValue.id, metadataPath, "id"),
        displayName: requireString(
          metadataValue.displayName,
          metadataPath,
          "displayName"
        ),
        pageSetType,
      };
    } else {
      throw new Error("must set a supported pageSetType");
    }
    if (!safeSectionLibraryIdPattern.test(metadata.id)) {
      throw new Error(`Layout ID is not valid: ${metadata.id}`);
    }

    if (
      reservedLayoutIds.has(metadata.id) ||
      metadata.id.startsWith("edit-") ||
      metadata.id.startsWith("local-editor")
    ) {
      throw new Error(
        `cannot use ${metadata.id} because it is reserved for a generated id`
      );
    }

    return { metadata, defaultLayout, defaultLayoutPath };
  } catch (error) {
    addIssue(metadataPath, "layouts/metadata", errorMessage(error));
  }
};

const validateComponentIds = (
  sections: ResolvedSection[],
  sharedComponents: SharedHiddenPuckComponent[],
  libraryDirectory: string,
  addIssue: AddIssue
): void => {
  const componentIds = new Set<string>();
  for (const [componentTypeName, components] of [
    ["Section", sections],
    ["Component", sharedComponents],
  ] as const) {
    for (const component of components) {
      const filePath =
        componentTypeName === "Section" && "sourcePath" in component
          ? path.join(
              libraryDirectory,
              "sections",
              component.sourcePath.split(path.sep).at(-1) ?? ""
            )
          : path.join(libraryDirectory, "shared", "componentRegistry.ts");

      if (!safeSectionLibraryIdPattern.test(component.id)) {
        addIssue(
          filePath,
          "components/id",
          `${componentTypeName} ID is not valid: ${component.id}`
        );
      }

      if (componentIds.has(component.id)) {
        addIssue(
          filePath,
          "components/duplicate",
          `${componentTypeName} ID is not unique: ${component.id}`
        );
      }

      componentIds.add(component.id);
    }
  }
};

// Validates the props.id and type fields of the default layout
const validateLayoutReferences = (
  layout: ParsedLayout,
  sections: ResolvedSection[],
  sharedComponents: SharedHiddenPuckComponent[],
  addIssue: AddIssue
): void => {
  const componentIds = new Set(
    [...sections, ...sharedComponents]
      .filter((component) =>
        component.pageSetTypes.includes(layout.metadata.pageSetType)
      )
      .map((component) => component.id)
  );
  const instanceIds = new Set<string>();
  const filePath = layout.defaultLayoutPath;

  for (const component of collectLayoutComponents(layout.defaultLayout)) {
    const instanceId = component.props.id;

    if (typeof instanceId !== "string" || !instanceId) {
      addIssue(
        filePath,
        "layouts/instance-id",
        `Layout ${layout.metadata.id} component ${component.type} must contain props.id`
      );
      continue;
    }

    if (instanceIds.has(instanceId)) {
      addIssue(
        filePath,
        "layouts/duplicate-instance-id",
        `Layout ${layout.metadata.id} props.id is not unique: ${instanceId}`
      );
    }

    instanceIds.add(instanceId);

    if (component.type !== "MainContent" && !componentIds.has(component.type)) {
      addIssue(
        filePath,
        "layouts/reference",
        `Layout ${layout.metadata.id} references missing or incompatible section ${component.type}`
      );
    }
  }
};

const collectLayoutComponents = (
  value: unknown
): { type: string; props: Record<string, unknown> }[] => {
  if (!value || typeof value !== "object") {
    return [];
  }

  const layout = value as Record<string, unknown>;

  return [
    ...collectComponentList(layout.content),
    ...Object.values(layout.zones ?? {}).flatMap(collectComponentList),
  ];
};

const collectComponentList = (
  value: unknown
): { type: string; props: Record<string, unknown> }[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") {
      return [];
    }

    const component = entry as Record<string, unknown>;
    if (typeof component.type !== "string" || !component.props) {
      return [];
    }

    const props = component.props as Record<string, unknown>;
    const slots =
      props.slots && typeof props.slots === "object"
        ? Object.values(props.slots).flatMap(collectComponentList)
        : [];
    const mainContent =
      component.type === "MainContent"
        ? collectComponentList(props.content)
        : [];

    return [{ type: component.type, props }, ...slots, ...mainContent];
  });
};

const readJsonObject = (
  filePath: string,
  description: string,
  addIssue: AddIssue
): Record<string, unknown> | undefined => {
  if (!fs.existsSync(filePath)) {
    addIssue(filePath, "json/missing", `Missing ${description}.`);
    return;
  }

  try {
    const value: unknown = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("must be a JSON object");
    }

    return value as Record<string, unknown>;
  } catch (error) {
    addIssue(
      filePath,
      "json/invalid",
      `Could not parse ${description}: ${errorMessage(error)}`
    );
  }
};

const requireString = (
  value: unknown,
  filePath: string,
  field: string
): string => {
  if (typeof value !== "string") {
    throw new Error(`${filePath} must define a string ${field}`);
  }

  return value;
};

const getOptionalStringListProperty = <T extends string>(
  metadata: Record<string, unknown>,
  name: string,
  allowedValues: readonly T[],
  filePath: string
): T[] | undefined => {
  const value = metadata[name];

  if (value === undefined) {
    return;
  }

  if (
    !Array.isArray(value) ||
    value.some(
      (item) => typeof item !== "string" || !allowedValues.includes(item as T)
    )
  ) {
    throw new Error(
      `${filePath} must define ${name} as a list of supported values`
    );
  }
  return value as T[];
};

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const cleanMessage = (message: string, rootDir: string): string =>
  message.split(`${rootDir}${path.sep}`).join("");

type AddIssue = (filePath: string, rule: string, message: string) => void;
