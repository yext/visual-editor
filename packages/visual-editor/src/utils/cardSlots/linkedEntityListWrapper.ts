import { type RenderEntityFieldFilter } from "../../internal/utils/getFilteredEntityFields.ts";
import { type LinkedEntitySchemas } from "../linkedEntityFieldUtils.ts";
import {
  type StreamFields,
  type YextSchemaField,
} from "../../types/entityFields.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";
import { resolveField } from "../resolveYextEntityField.ts";
import { resolveYextEntityField } from "../resolveYextEntityField.ts";
import { type YextEntityField } from "../../editor/yextEntityFieldUtils.ts";

type MappedCardSourceMode = "section" | "itemList" | "unknown";
export type SourceRootKind = "linkedEntityRoot" | "baseListRoot";

/**
 * Returns true when a field is a top-level linked entity reference root exposed
 * by the linked entity schema payload.
 */
export const isTopLevelLinkedEntitySourceField = (
  fieldPath: string | undefined,
  linkedEntitySchemas?: LinkedEntitySchemas
): boolean => {
  if (!fieldPath || fieldPath.includes(".") || !linkedEntitySchemas) {
    return false;
  }

  return Object.hasOwn(linkedEntitySchemas, fieldPath);
};

/**
 * Returns top-level list fields on the base entity so wrappers can treat a
 * list of structs as a card/item source. Only lists with children are useful
 * for wrapper-level field mapping, so scalar lists are excluded.
 */
export const getBaseEntityListSourceRootFields = (
  entityFields: StreamFields | YextSchemaField[] | null
): YextSchemaField[] =>
  (Array.isArray(entityFields)
    ? entityFields
    : (entityFields?.fields ?? [])
  ).filter(
    (field) =>
      Array.isArray(field.children?.fields) && field.children.fields.length > 0
  );

/**
 * Detects whether the selected wrapper source resolves as a normal section
 * object or as a linked entity list/single linked entity source.
 */
export const getMappedCardSourceMode = (
  streamDocument: StreamDocument,
  fieldPath: string,
  listFieldName: string
): MappedCardSourceMode => {
  const resolvedSource = resolveField<unknown>(streamDocument, fieldPath).value;

  if (Array.isArray(resolvedSource)) {
    return "itemList";
  }

  if (!resolvedSource || typeof resolvedSource !== "object") {
    return "unknown";
  }

  if (
    Array.isArray((resolvedSource as Record<string, unknown>)[listFieldName])
  ) {
    return "section";
  }

  return "itemList";
};

/**
 * Resolves the selected linked entity source into a list so wrappers can render
 * one card per linked entity.
 */
export const resolveLinkedEntitySourceItems = <T>(
  streamDocument: StreamDocument,
  fieldPath: string
): T[] => {
  const resolvedSource = resolveField<unknown>(streamDocument, fieldPath).value;

  if (Array.isArray(resolvedSource)) {
    return resolvedSource as T[];
  }

  if (resolvedSource && typeof resolvedSource === "object") {
    return [resolvedSource as T];
  }

  return [];
};

/**
 * Resolves a wrapper-level field mapping against a linked entity item. Stored
 * field ids are absolute editor paths like `c_linkedLocation.name`, so this
 * strips the selected linked source root before resolving against the linked
 * entity document itself.
 */
export const resolveLinkedEntityMappedField = <T>(
  linkedEntity: StreamDocument,
  sourceFieldPath: string,
  mappedFieldPath: string | undefined
): T | undefined => {
  if (!mappedFieldPath) {
    return undefined;
  }

  const relativeFieldPath = mappedFieldPath.startsWith(`${sourceFieldPath}.`)
    ? mappedFieldPath.slice(sourceFieldPath.length + 1)
    : mappedFieldPath;

  return resolveField<T>(linkedEntity, relativeFieldPath).value;
};

/**
 * Resolves a wrapper-level mapped entity field against a linked entity item.
 * Field ids are stored as absolute editor paths, while constant values and
 * embedded fields should resolve directly against the linked entity document.
 */
export const resolveLinkedEntityMappedData = <T>(
  linkedEntity: StreamDocument,
  sourceFieldPath: string,
  entityField: Partial<YextEntityField<T>> | undefined,
  locale?: string
): T | undefined => {
  if (!entityField) {
    return undefined;
  }

  if (!entityField.field || entityField.constantValueEnabled) {
    return resolveYextEntityField(
      linkedEntity,
      {
        field: entityField.field ?? "",
        constantValue: entityField.constantValue as T,
        constantValueEnabled: entityField.constantValueEnabled,
      },
      locale
    );
  }

  return resolveYextEntityField(
    linkedEntity,
    {
      ...entityField,
      constantValue: entityField.constantValue as T,
      field: entityField.field.startsWith(`${sourceFieldPath}.`)
        ? entityField.field.slice(sourceFieldPath.length + 1)
        : entityField.field,
    },
    locale
  );
};

export type LinkedEntitySourceFieldFilter<T extends Record<string, any>> =
  RenderEntityFieldFilter<T> & {
    sourceRootKinds?: SourceRootKind[];
    sourceRootsOnly?: boolean;
  };
