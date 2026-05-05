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

/**
 * Describes how a card wrapper should populate its repeated card slot.
 *
 * - `constantValue`: the editor stores the card list as a constant value and
 *   the wrapper keeps those explicit card ids in sync with the slot contents.
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

/**
 * Resolves a wrapper-level mapped field against one mapped source item. Saved
 * field ids are interpreted against the current item context.
 */
export const resolveMappedSourceField = <T>(
  item: StreamDocument,
  entityField: Partial<YextEntityField<T>> | undefined,
  locale?: string
): T | undefined => {
  if (!entityField) {
    return undefined;
  }

  return resolveYextEntityField(
    item,
    {
      field: entityField.field ?? "",
      constantValue: entityField.constantValue as T,
      constantValueEnabled: entityField.constantValueEnabled,
    },
    locale
  );
};

export type MappedSourceFieldFilter<T extends Record<string, any>> =
  RenderEntityFieldFilter<T> & {
    mappedSourceTypes?: EntityFieldTypes[][];
  };
