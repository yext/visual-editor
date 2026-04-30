import { Fields, Slot } from "@puckeditor/core";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { MsgString } from "../i18n/platform.ts";
import { EntityFieldTypes } from "../../internal/utils/getFilteredEntityFields.ts";
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

export const cardWrapperFields = <T>(
  label: MsgString,
  entityFieldType: EntityFieldTypes,
  listFieldName = "",
  sourceRootKinds: SourceRootKind[] = [],
  sourceRootsOnly = false,
  requiredDescendantTypes?: EntityFieldTypes[][]
): Fields<CardWrapperType<T>> => ({
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
  } as any,
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot" },
    },
    visible: false,
  },
});
