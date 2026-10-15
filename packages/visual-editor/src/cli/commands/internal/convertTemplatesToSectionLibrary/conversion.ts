import path from "node:path";
import {
  purposes,
  verticals,
  type EntityLayoutMetadata,
  type LibraryMetadata,
} from "../../../../types/sectionLibrary.ts";
import { isRecord } from "./shared.ts";
import type {
  BaseLibrary,
  Conversion,
  CopiedComponent,
  JsonRecord,
  LegacyTemplate,
  TemplateHeaderFooter,
  TemplateHeaderFooterSelection,
} from "./types.ts";

const VERTICALS = new Set(verticals);
const PURPOSES = new Set(purposes);
const RESERVED_COMPONENT_IDS = new Set(["Directory", "Locator", "MainContent"]);

export const buildConversion = (
  templates: LegacyTemplate[],
  baseLibrary: BaseLibrary
): Conversion => {
  const firstTemplate = templates[0];
  const templateHeaderFooter: TemplateHeaderFooter = {
    header: selectTemplateHeaderFooter(firstTemplate, "header"),
    footer: selectTemplateHeaderFooter(firstTemplate, "footer"),
  };
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
  const conflictingTemplate = templates.find(
    (template) =>
      template.templateId === directoryLayoutId ||
      template.templateId === locatorLayoutId
  );
  if (conflictingTemplate) {
    throw new Error(
      `Legacy template ${conflictingTemplate.directory} conflicts with generated layout ID ${JSON.stringify(conflictingTemplate.templateId)} from ${firstTemplate.directory}. Rename the conflicting template directory.`
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
    templateHeaderFooter,
    components,
    directoryLayoutId,
    duplicates,
    libraryMetadata: buildLibraryMetadata(firstTemplate),
    locatorLayoutId,
    templates,
  };
};

// Finds the existing header or footer by looking at the default layout
// and finding a "type" that includes "header" or "footer"
const selectTemplateHeaderFooter = (
  template: LegacyTemplate,
  kind: "header" | "footer"
): TemplateHeaderFooterSelection => {
  const matches = template.defaultLayout.content.filter(
    (component: unknown): component is JsonRecord & { type: string } =>
      isRecord(component) &&
      typeof component.type === "string" &&
      component.type.toLowerCase().includes(kind)
  );
  return {
    kind,
    matches: matches.map((component: any) => component.type),
    ...(matches.length === 1 ? { component: matches[0] } : {}),
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
        : "",
  };
};

export const buildEntityLayoutMetadata = (
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
  if (!Array.isArray(value)) {
    throw new Error(
      `${sourcePath} ${property} must be an array of supported strings; received ${JSON.stringify(value)}. Allowed values: ${Array.from(allowedValues).join(", ")}.`
    );
  }
  const invalidValues = value.filter(
    (item) => typeof item !== "string" || !allowedValues.has(item as T)
  );
  if (invalidValues.length > 0) {
    throw new Error(
      `${sourcePath} ${property} contains unsupported values: ${invalidValues.map((item) => JSON.stringify(item)).join(", ")}. Allowed values: ${Array.from(allowedValues).join(", ")}.`
    );
  }
  return value as T[];
};

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
