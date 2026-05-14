import { Slot } from "@puckeditor/core";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { YextFields } from "../../fields/fields.ts";
import { MsgString } from "../i18n/platform.ts";
import { EntityFieldTypes } from "../../internal/utils/getFilteredEntityFields.ts";
import { type SlotMappedCardsData } from "../itemSource/itemSourceTypes.ts";

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

export interface SlotMappedCardWrapperType<
  TMappings extends Record<string, unknown>,
> {
  data: SlotMappedCardsData<TMappings>;
  slots: {
    CardSlot: Slot;
  };
}

export const cardWrapperFields = <T>(
  label: MsgString,
  entityFieldType: EntityFieldTypes
): YextFields<CardWrapperType<T>> => ({
  data: {
    type: "entityField",
    label,
    filter: {
      types: [entityFieldType],
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
