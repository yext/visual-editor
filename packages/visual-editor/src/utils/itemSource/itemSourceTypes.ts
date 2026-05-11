import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { type EntityFieldSelectorField } from "../../fields/EntityFieldSelectorField.tsx";
import {
  type YextFieldDefinition,
  type YextFieldMap,
} from "../../fields/fields.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";

/**
 * Public item-source types.
 *
 * 1. Define the authored configuration accepted by `createItemSource(...)`.
 * 2. Define the repeated entity-field value shape returned to consumers.
 * 3. Define the resolved item shape returned by `resolveItems(...)`.
 */
export type CreateItemSourceOptions<
  TItemProps extends Record<string, unknown>,
> = {
  label: string;
  mappingFields: YextFieldMap<TItemProps>;
  defaultValues?: TItemProps[];
};

export type RepeatedEntityFieldValue<
  TItemProps extends Record<string, unknown>,
> = YextEntityField<TItemProps[], TItemProps>;

export type RepeatedEntityFieldMetadata<
  TItemProps extends Record<string, unknown>,
> = {
  mappingFields: YextFieldMap<TItemProps>;
  manualItemFields: YextFieldMap<TItemProps>;
  defaultItemValue: TItemProps;
  defaultMappings: TItemProps;
  manualItemSummary?: (item: unknown, index?: number) => string;
};

export type RepeatedEntityFieldDefinition<
  TItemProps extends Record<string, unknown>,
> = EntityFieldSelectorField<RepeatedEntityFieldValue<TItemProps>> & {
  repeated: RepeatedEntityFieldMetadata<TItemProps>;
};

/**
 * Resolves authored item fields into the render-ready value shape returned
 * from `ItemSourceInstance.resolveItems(...)`.
 */
export type ResolvedItemField<TValue> =
  TValue extends YextEntityField<infer TResolved, any>
    ? TResolved | undefined
    : TValue extends Array<infer TItem>
      ? ResolvedItemField<TItem>[]
      : TValue extends Record<string, unknown>
        ? { [TKey in keyof TValue]: ResolvedItemField<TValue[TKey]> }
        : TValue;

/**
 * Public contract returned by `createItemSource(...)`.
 */
export type ItemSourceInstance<TItemProps extends Record<string, unknown>> = {
  field: YextFieldDefinition<RepeatedEntityFieldValue<TItemProps>>;
  defaultValue: RepeatedEntityFieldValue<TItemProps>;
  value: RepeatedEntityFieldValue<TItemProps>;
  resolveItems: (
    value: RepeatedEntityFieldValue<TItemProps> | undefined,
    streamDocument: StreamDocument
  ) => ResolvedItemField<TItemProps>[];
};

export type SlotMappedCardsData<TMappings extends Record<string, unknown>> =
  YextEntityField<Array<{ id?: string }>, TMappings>;

export type CreateSlottedItemSourceOptions<
  TMappings extends Record<string, unknown>,
  TCardProps extends Record<string, unknown> = Record<string, unknown>,
> = {
  label: string;
  mappingFields: YextFieldMap<TMappings>;
  itemLabel: string;
  cardName?: string;
  defaultItemProps?: TCardProps;
  defaultItems?: number;
};

export type SlottedItemSourceInstance<
  TMappings extends Record<string, unknown>,
> = {
  field: YextFieldDefinition<SlotMappedCardsData<TMappings>>;
  defaultValue: SlotMappedCardsData<TMappings>;
  defaultWrapperProps: {
    data: SlotMappedCardsData<TMappings>;
    slots: {
      CardSlot: [];
    };
  };
  value: SlotMappedCardsData<TMappings>;
  resolveItems: (
    value: SlotMappedCardsData<TMappings> | undefined,
    streamDocument: StreamDocument
  ) => ResolvedItemField<TMappings>[];
  populateSlots: <
    TData extends {
      props: {
        data: SlotMappedCardsData<TMappings>;
        slots: { CardSlot: unknown };
      };
    },
  >(
    data: TData,
    streamDocument: StreamDocument | undefined
  ) => TData;
};

export type CreateSlotMappedCardsSourceOptions<
  TMappings extends Record<string, unknown>,
> = CreateSlottedItemSourceOptions<TMappings>;

export type SlotMappedCardsSourceInstance<
  TMappings extends Record<string, unknown>,
> = SlottedItemSourceInstance<TMappings>;
