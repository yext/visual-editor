import {
  type EntityFieldTypes,
  type RenderEntityFieldFilter,
} from "../../internal/utils/getFilteredEntityFields.ts";
import {
  type StreamFields,
  type YextSchemaField,
} from "../../types/entityFields.ts";
import { resolveField } from "../resolveYextEntityField.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";

/**
 * Describes how a card wrapper should populate its repeated card slot.
 *
 * - `constantValue`: the editor stores the list inline as manual items.
 * - `resolvedItems`: the selected value is itself the repeatable item or list
 *   of repeatable items, such as a linked entity, linked entity list, or
 *   nested list field.
 */
export type ResolvedMappedSourceMode = "constantValue" | "resolvedItems";

export type ResolvedMappedSource<TMappedItem> =
  | {
      mode: "constantValue";
      items: [];
    }
  | {
      mode: "resolvedItems";
      items: TMappedItem[];
    };

const getListFields = (
  fields: YextSchemaField[],
  parentPath = ""
): YextSchemaField[] =>
  fields.flatMap((field) => {
    const name = parentPath ? `${parentPath}.${field.name}` : field.name;
    return [
      { ...field, name },
      ...getListFields(field.children?.fields ?? [], name),
    ];
  });

/**
 * Returns every list field with nested children so wrappers can treat that
 * list's item shape as a mapped source.
 */
export const getListSourceRootFields = (
  entityFields: StreamFields | YextSchemaField[] | null
): YextSchemaField[] => {
  const fields = Array.isArray(entityFields)
    ? entityFields
    : (entityFields?.fields ?? []);

  return getListFields(fields).filter(
    (field) =>
      !!field.definition?.isList &&
      Array.isArray(field.children?.fields) &&
      field.children.fields.length > 0
  );
};

/**
 * Resolves the selected wrapper source into either constant value mode or a
 * list of stream items.
 *
 * Unresolved non-constant sources stay in resolved-items mode with no items so
 * mapped subfield UIs do not collapse while data is still loading.
 */
export const resolveMappedListSource = <TMappedItem>({
  streamDocument,
  constantValueEnabled,
  fieldPath,
}: {
  streamDocument: StreamDocument;
  constantValueEnabled?: boolean;
  fieldPath?: string;
}): ResolvedMappedSource<TMappedItem> => {
  if (constantValueEnabled || !fieldPath) {
    return {
      mode: "constantValue",
      items: [],
    };
  }

  const resolvedSource = resolveField<unknown>(streamDocument, fieldPath).value;

  if (Array.isArray(resolvedSource)) {
    return {
      mode: "resolvedItems",
      items: resolvedSource as TMappedItem[],
    };
  }

  if (resolvedSource && typeof resolvedSource === "object") {
    return {
      mode: "resolvedItems",
      items: [resolvedSource as TMappedItem],
    };
  }

  return {
    mode: "resolvedItems",
    items: [],
  };
};

export const hasResolvedMappedListSource = ({
  streamDocument,
  constantValueEnabled,
  fieldPath,
}: {
  streamDocument: StreamDocument;
  constantValueEnabled?: boolean;
  fieldPath?: string;
}): boolean =>
  !fieldPath ||
  !!constantValueEnabled ||
  resolveMappedListSource({
    streamDocument,
    constantValueEnabled,
    fieldPath,
  }).items.length > 0;

export type MappedSourceFieldFilter<T extends Record<string, any>> =
  RenderEntityFieldFilter<T> & {
    mappedSourceTypes?: EntityFieldTypes[][];
    itemSourceTypes?: EntityFieldTypes[][];
  };
