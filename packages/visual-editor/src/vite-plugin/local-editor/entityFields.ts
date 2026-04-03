import type { YextSchemaField } from "../../types/entityFields.ts";
import type { LocalEditorStreamDefinition } from "./types.ts";
import { isPlainObject } from "./utils.ts";

type MutableFieldNode = {
  name: string;
  isList?: boolean;
  typeName?: string;
  typeRegistryId?: string;
  children: Map<string, MutableFieldNode>;
};

export const inferEntityFields = (
  document: Record<string, unknown>,
  stream?: LocalEditorStreamDefinition
): {
  fields: YextSchemaField[];
  displayNames: Record<string, string>;
} => {
  const configuredDisplayNames = buildConfiguredDisplayNames(stream);
  const rootNodes = new Map<string, MutableFieldNode>();

  for (const [key, value] of Object.entries(document)) {
    if (shouldSkipField(key)) {
      continue;
    }

    mergeFieldNode(rootNodes, inferFieldNode(key, value));
  }

  const fields = Array.from(rootNodes.values())
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((node) => {
      return toSchemaField(node, configuredDisplayNames, node.name);
    });

  return {
    fields,
    displayNames: configuredDisplayNames,
  };
};

const inferFieldNode = (name: string, value: unknown): MutableFieldNode => {
  if (Array.isArray(value)) {
    const sampleValue = value.find(
      (item) => item !== null && item !== undefined
    );
    if (isPlainObject(sampleValue)) {
      return {
        name,
        isList: true,
        typeRegistryId: "type.object",
        children: inferObjectChildren(sampleValue),
      };
    }

    return {
      name,
      isList: true,
      typeRegistryId: inferScalarType(sampleValue),
      children: new Map(),
    };
  }

  if (isPlainObject(value)) {
    return {
      name,
      typeRegistryId: "type.object",
      children: inferObjectChildren(value),
    };
  }

  return {
    name,
    typeRegistryId: inferScalarType(value),
    children: new Map(),
  };
};

const inferObjectChildren = (
  value: Record<string, unknown>
): Map<string, MutableFieldNode> => {
  const children = new Map<string, MutableFieldNode>();
  for (const [childName, childValue] of Object.entries(value)) {
    if (shouldSkipField(childName)) {
      continue;
    }

    mergeFieldNode(children, inferFieldNode(childName, childValue));
  }

  return children;
};

const mergeFieldNode = (
  target: Map<string, MutableFieldNode>,
  incoming: MutableFieldNode
) => {
  const existing = target.get(incoming.name);
  if (!existing) {
    target.set(incoming.name, incoming);
    return;
  }

  existing.isList = existing.isList || incoming.isList;
  existing.typeRegistryId = pickPreferredType(
    existing.typeRegistryId,
    incoming.typeRegistryId
  );

  for (const childNode of incoming.children.values()) {
    mergeFieldNode(existing.children, childNode);
  }
};

const toSchemaField = (
  node: MutableFieldNode,
  displayNames: Record<string, string>,
  currentPath: string
): YextSchemaField => {
  const children = Array.from(node.children.values())
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((childNode) => {
      return toSchemaField(
        childNode,
        displayNames,
        `${currentPath}.${childNode.name}`
      );
    });

  return {
    name: node.name,
    displayName: displayNames[currentPath] ?? toDisplayName(currentPath),
    definition: {
      name: node.name,
      isList: node.isList,
      typeName: node.typeName,
      typeRegistryId: node.typeRegistryId ?? "type.string",
      type: {},
    },
    children: children.length ? { fields: children } : undefined,
  };
};

const buildConfiguredDisplayNames = (
  stream?: LocalEditorStreamDefinition
): Record<string, string> => {
  const displayNames: Record<string, string> = {};

  for (const field of stream?.fields ?? []) {
    const fieldName = typeof field === "string" ? field : field.name;
    if (!fieldName) {
      continue;
    }

    const segments = fieldName.split(".");
    segments.reduce((currentPath, segment) => {
      const nextPath = currentPath ? `${currentPath}.${segment}` : segment;
      if (!displayNames[nextPath]) {
        displayNames[nextPath] = toDisplayName(nextPath);
      }
      return nextPath;
    }, "");
  }

  return displayNames;
};

const shouldSkipField = (fieldName: string): boolean => {
  return fieldName.startsWith("_");
};

const inferScalarType = (value: unknown): string => {
  if (typeof value === "boolean") {
    return "type.boolean";
  }
  if (typeof value === "number") {
    return "type.number";
  }
  if (typeof value === "string") {
    return "type.string";
  }
  return "type.string";
};

const pickPreferredType = (
  existingType?: string,
  incomingType?: string
): string | undefined => {
  if (!existingType) {
    return incomingType;
  }
  if (!incomingType) {
    return existingType;
  }
  if (existingType === "type.string" && incomingType !== "type.string") {
    return incomingType;
  }
  return existingType;
};

const toDisplayName = (pathName: string): string => {
  return pathName
    .split(".")
    .map((segment) => {
      return segment
        .replace(/[_-]+/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (character) => character.toUpperCase());
    })
    .join(" > ");
};
