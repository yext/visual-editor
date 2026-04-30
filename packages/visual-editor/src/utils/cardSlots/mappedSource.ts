import {
  type EntityFieldTypes,
  type RenderEntityFieldFilter,
} from "../../internal/utils/getFilteredEntityFields.ts";
import {
  type StreamFields,
  type YextSchemaField,
} from "../../types/entityFields.ts";
import { type YextEntityField } from "../../editor/yextEntityFieldUtils.ts";
import {
  resolveField,
  resolveYextEntityField,
} from "../resolveYextEntityField.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";
import { getTopLevelLinkedEntitySourceFields } from "../linkedEntityFieldUtils.ts";

export type MappedSourceMode = "manual" | "sectionField" | "mappedItemList";
export type SourceRootKind = "linkedEntityRoot" | "baseListRoot";

/**
 * Returns top-level list fields on the base entity so wrappers can treat a
 * list of structs as a mapped item source. Only lists with children are
 * useful for wrapper-level field mapping, so scalar lists are excluded.
 */
export const getBaseEntityListSourceRootFields = (
  entityFields: StreamFields | YextSchemaField[] | null
): YextSchemaField[] => {
  const isFieldList = Array.isArray(entityFields);
  const fields = isFieldList ? entityFields : (entityFields?.fields ?? []);
  const linkedEntityRootNames = new Set(
    getTopLevelLinkedEntitySourceFields(isFieldList ? null : entityFields).map(
      (field) => field.name
    )
  );

  return fields.filter(
    (field) =>
      !linkedEntityRootNames.has(field.name) &&
      !!field.definition.isList &&
      Array.isArray(field.children?.fields) &&
      field.children.fields.length > 0
  );
};

/**
 * Classifies the current wrapper source selection into manual, section-backed,
 * or mapped-item-list behavior. Unresolved sources stay schema-eligible by
 * default so mapped subfield UIs do not collapse while data is still loading.
 */
export const classifyMappedSource = ({
  streamDocument,
  constantValueEnabled,
  fieldPath,
  listFieldName,
}: {
  streamDocument: StreamDocument;
  constantValueEnabled?: boolean;
  fieldPath?: string;
  listFieldName: string;
}): MappedSourceMode => {
  if (constantValueEnabled || !fieldPath) {
    return "manual";
  }

  const resolvedSource = resolveField<unknown>(streamDocument, fieldPath).value;

  if (resolvedSource === undefined || Array.isArray(resolvedSource)) {
    return "mappedItemList";
  }

  if (resolvedSource && typeof resolvedSource === "object") {
    return Array.isArray(
      (resolvedSource as Record<string, unknown>)[listFieldName]
    )
      ? "sectionField"
      : "sectionField";
  }

  return "mappedItemList";
};

/**
 * Resolves a mapped source into a list so wrappers can render one card per
 * linked entity or object item.
 */
export const resolveMappedSourceItems = <T>(
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
 * Resolves a wrapper-level mapped field against one mapped source item. Saved
 * field ids remain absolute editor paths, while constant values and embedded
 * fields resolve directly against the current item.
 */
export const resolveMappedSourceField = <T>(
  item: StreamDocument,
  sourceFieldPath: string,
  entityField: Partial<YextEntityField<T>> | undefined,
  locale?: string
): T | undefined => {
  if (!entityField) {
    return undefined;
  }

  if (!entityField.field || entityField.constantValueEnabled) {
    return resolveYextEntityField(
      item,
      {
        field: entityField.field ?? "",
        constantValue: entityField.constantValue as T,
        constantValueEnabled: entityField.constantValueEnabled,
      },
      locale
    );
  }

  return resolveYextEntityField(
    item,
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

export type MappedSourceFieldFilter<T extends Record<string, any>> =
  RenderEntityFieldFilter<T> & {
    listFieldName?: string;
    requiredDescendantTypes?: EntityFieldTypes[][];
    subdocumentField?: string;
    sourceRootKinds?: SourceRootKind[];
    sourceRootsOnly?: boolean;
  };
