import { Slot } from "@puckeditor/core";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import {
  YextField,
  type YextFieldDefinition,
} from "../../editor/YextField.tsx";
import { YextFields } from "../../fields/fields.ts";
import { MsgString } from "../i18n/platform.ts";
import {
  EntityFieldTypes,
  RenderEntityFieldFilter,
} from "../../internal/utils/getFilteredEntityFields.ts";
import { SourceRootKind } from "./mappedSource.ts";

export interface CardWrapperType<T> {
  data: Omit<YextEntityField<T>, "constantValue"> & {
    // At the wrapper level, the only constant value stored is the puck id
    // of the ProductCard. The rest of the data is stored in each card.
    // If id is not provided, a default card will be created with an auto-generated id.
    constantValue: {
      id?: string;
    }[];
  };
  slots: {
    CardSlot: Slot;
  };
}

export type CardWrapperFieldsOptions = {
  label: MsgString;
  entityFieldType: EntityFieldTypes;
  listFieldName?: string;
  sourceRootKinds?: SourceRootKind[];
  sourceRootsOnly?: boolean;
  requiredDescendantTypes?: EntityFieldTypes[][];
};

/**
 * Builds the shared Puck field configuration for wrappers that render repeated
 * cards through a hidden `CardSlot`. The visible `data` field selects either a
 * constant value list or a mapped entity/list source, while `CardSlot` stores
 * the actual card component data.
 */
export const cardWrapperFields = <T>({
  label,
  entityFieldType,
  listFieldName = "",
  sourceRootKinds = [],
  sourceRootsOnly = false,
  requiredDescendantTypes,
}: CardWrapperFieldsOptions): YextFields<CardWrapperType<T>> => ({
  data: {
    label,
    type: "entityField",
    filter: {
      listFieldName,
      types: [entityFieldType],
      requiredDescendantTypes,
      sourceRootKinds,
      sourceRootsOnly,
    },
  },
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot" },
    },
    visible: false,
  },
});

type MappedSubfieldConfig = {
  label: MsgString;
  types: EntityFieldTypes[];
  disableConstantValueToggle?: boolean;
  disallowTranslation?: boolean;
  filter?: Omit<RenderEntityFieldFilter<any>, "types">;
};

/**
 * Builds the repeated subfield selector object used when a wrapper maps cards
 * from arbitrary linked entities or base list items.
 */
export const createMappedSubfieldFields = <
  TFields extends Record<string, MappedSubfieldConfig>,
>(
  label: MsgString,
  sourceField: string | undefined,
  fields: TFields,
  sourceFieldPath = "data.field"
): YextFieldDefinition<any> =>
  YextField(label, {
    type: "object",
    objectFields: Object.fromEntries(
      Object.entries(fields).map(([fieldName, fieldConfig]) => [
        fieldName,
        YextField(fieldConfig.label, {
          type: "subfieldSelector",
          sourceField: sourceField ?? "",
          sourceFieldPath,
          disableConstantValueToggle: fieldConfig.disableConstantValueToggle,
          disallowTranslation: fieldConfig.disallowTranslation,
          filter: {
            ...fieldConfig.filter,
            types: fieldConfig.types,
          },
        } as any),
      ])
    ),
  } as any) as YextFieldDefinition<any>;
