import {
  type YextFieldDefinition,
  type YextFieldMap,
} from "../../fields/fields.ts";
import {
  getDefaultValueForField,
  getItemSourceTypes,
  getMappingItemField,
} from "./itemSourceFieldTransforms.ts";
import { resolveItemValue } from "./itemSourceResolution.ts";
import {
  type CreateSlotMappedCardsSourceOptions,
  type ResolvedItemField,
  type SlotMappedCardsData,
  type SlotMappedCardsSourceInstance,
} from "./itemSourceTypes.ts";
import { pt } from "../i18n/platform.ts";

/**
 * Slot-backed repeated source assembly.
 *
 * 1. Builds one repeated `entityField` config for linked-mode source selection.
 * 2. Keeps manual-mode content in slots by storing only card ids in constantValue.
 * 3. Resolves linked mappings into render-ready per-card parent data.
 */
export function createSlotMappedCardsSource<
  TMappings extends Record<string, unknown>,
>({
  label,
  mappingFields,
  manualItemLabel,
}: CreateSlotMappedCardsSourceOptions<TMappings>): SlotMappedCardsSourceInstance<TMappings> {
  const scopedMappingFields = Object.fromEntries(
    Object.entries(mappingFields).map(([key, field]) => [
      key,
      getMappingItemField(field as YextFieldDefinition<any>),
    ])
  ) as YextFieldMap<TMappings>;
  const defaultMappings = Object.fromEntries(
    Object.entries(scopedMappingFields).map(([key, field]) => [
      key,
      getDefaultValueForField(field as YextFieldDefinition<any>, false),
    ])
  ) as TMappings;
  const field = {
    type: "entityField",
    label,
    filter: {
      itemSourceTypes: getItemSourceTypes(scopedMappingFields),
    },
    repeated: {
      mappingFields: scopedMappingFields,
      manualItemFields: {},
      defaultItemValue: {} as TMappings,
      defaultMappings,
      manualItemSummary: (_, index) =>
        `${pt(manualItemLabel, manualItemLabel)} ${String((index ?? 0) + 1)}`,
    },
  } satisfies YextFieldDefinition<SlotMappedCardsData<TMappings>>;
  const defaultValue: SlotMappedCardsData<TMappings> = {
    field: "",
    constantValueEnabled: true,
    constantValue: [],
    mappings: defaultMappings,
  };
  const sourceField = {
    type: "entityField",
    label,
    filter: { itemSourceTypes: [] },
  } satisfies YextFieldDefinition<unknown>;

  return {
    field,
    defaultValue,
    value: undefined as unknown as SlotMappedCardsData<TMappings>,
    resolveMappedItems: (value, streamDocument) => {
      if (!value || value.constantValueEnabled || !value.field) {
        return [];
      }

      const resolvedSourceItems = resolveItemValue(
        sourceField,
        {
          field: value.field,
          constantValue: value.constantValue,
          constantValueEnabled: false,
        },
        streamDocument
      );

      if (!Array.isArray(resolvedSourceItems)) {
        return [];
      }

      return resolvedSourceItems.map((itemDocument) =>
        Object.fromEntries(
          Object.entries(scopedMappingFields).map(([key, itemField]) => [
            key,
            resolveItemValue(
              itemField as YextFieldDefinition<any>,
              value.mappings?.[key as keyof TMappings],
              streamDocument,
              itemDocument
            ),
          ])
        )
      ) as ResolvedItemField<TMappings>[];
    },
  };
}
