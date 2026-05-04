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

/**
 * Describes how a card wrapper should populate its repeated card slot.
 *
 * - `constantValue`: the editor stores the card list as a constant value and
 *   the wrapper keeps those explicit card ids in sync with the slot contents.
 * - `sectionField`: the selected source is a section-shaped object that owns
 *   the wrapper's list field, such as `{ events: [...] }`.
 * - `mappedItemList`: the selected source is itself the repeatable item or
 *   list of repeatable items, such as a linked entity or linked entity list.
 */
export type ResolvedMappedSourceMode = "constantValue" | "resolvedItems";
export type MappedItemSource = "sectionField" | "mappedItemList";

export type ResolvedMappedSource<TMappedItem, TSectionItem> =
  | {
      mode: "constantValue";
      items: [];
    }
  | {
      mode: "resolvedItems";
      itemSource: "sectionField";
      items: TSectionItem[];
    }
  | {
      mode: "resolvedItems";
      itemSource: "mappedItemList";
      items: TMappedItem[];
    };

/**
 * Identifies the kinds of top-level schema fields that can be offered as
 * wrapper-level source roots in mapped field selectors.
 */
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
 * Resolves the selected wrapper source into either constant value mode or a
 * list of stream items. Section-backed sources read the nested `listFieldName`
 * array from a section object; mapped-item-list sources use the selected value
 * itself as the repeatable item or item list.
 *
 * Unresolved non-constant sources stay in mapped-item-list mode with no items
 * so mapped subfield UIs do not collapse while data is still loading.
 */
export const resolveMappedListSource = <TMappedItem, TSectionItem>({
  streamDocument,
  constantValueEnabled,
  fieldPath,
  listFieldName,
}: {
  streamDocument: StreamDocument;
  constantValueEnabled?: boolean;
  fieldPath?: string;
  listFieldName: string;
}): ResolvedMappedSource<TMappedItem, TSectionItem> => {
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
      itemSource: "mappedItemList",
      items: resolvedSource as TMappedItem[],
    };
  }

  if (resolvedSource === undefined) {
    return {
      mode: "resolvedItems",
      itemSource: "mappedItemList",
      items: [],
    };
  }

  if (resolvedSource && typeof resolvedSource === "object") {
    const sectionItems = (resolvedSource as Record<string, unknown>)[
      listFieldName
    ];
    if (Array.isArray(sectionItems)) {
      return {
        mode: "resolvedItems",
        itemSource: "sectionField",
        items: sectionItems as TSectionItem[],
      };
    }

    return {
      mode: "resolvedItems",
      itemSource: "mappedItemList",
      items: [resolvedSource as TMappedItem],
    };
  }

  return {
    mode: "resolvedItems",
    itemSource: "mappedItemList",
    items: [],
  };
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
    sourceRootKinds?: SourceRootKind[];
    sourceRootsOnly?: boolean;
  };
