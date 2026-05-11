import { type ComponentData } from "@puckeditor/core";
import {
  type YextFieldDefinition,
  type YextFieldMap,
} from "../../fields/fields.ts";
import {
  syncLinkedSlotMappedCards,
  syncManualSlotMappedCards,
} from "../cardSlots/slotMappedCards.ts";
import {
  getDefaultValueForField,
  getItemSourceTypes,
  getMappingItemField,
} from "./itemSourceFieldTransforms.ts";
import { resolveItemValue } from "./itemSourceResolution.ts";
import {
  type CreateSlottedItemSourceOptions,
  type ResolvedItemField,
  type SlottedItemSourceInstance,
  type SlotMappedCardsData,
} from "./itemSourceTypes.ts";
import { pt } from "../i18n/platform.ts";

/**
 * Slotted item source helper.
 *
 * 1. Builds the repeated entity-field config for choosing a linked item source.
 * 2. Resolves mapped item values from the chosen repeated field.
 * 3. Preserves authored manual cards in hidden `manualSlots.CardSlot`.
 * 4. Reconciles visible `slots.CardSlot` between linked and manual mode.
 */

/**
 * Deep-clones helper-owned values before reconciliation mutates card data.
 */
const cloneValue = <T>(value: T): T =>
  typeof structuredClone === "function"
    ? structuredClone(value)
    : (JSON.parse(JSON.stringify(value)) as T);

/**
 * Assigns stable child-slot ids for one card and clears stale slot parent data.
 */
const setChildSlotIds = (
  card: ComponentData<Record<string, unknown>>,
  cardId: string
): ComponentData<Record<string, unknown>> => {
  const slots = card.props.slots as
    | Record<string, Array<{ props?: Record<string, unknown> }>>
    | undefined;

  if (!slots) {
    return card;
  }

  Object.entries(slots).forEach(([slotKey, slotArray]) => {
    slotArray.forEach((slotChild, index) => {
      if (!slotChild.props) {
        slotChild.props = {};
      }
      slotChild.props.id = `${cardId}-${slotKey}-${index}`;
      delete slotChild.props.parentData;
    });
  });

  return card;
};

/**
 * Creates the helper API for one slot-backed repeated-item wrapper.
 */
export function createSlottedItemSource<
  TMappings extends Record<string, unknown>,
  TCardProps extends Record<string, unknown> = Record<string, unknown>,
>({
  label,
  mappingFields,
  itemLabel,
  cardName,
  defaultItemProps,
  defaultItems = 3,
}: CreateSlottedItemSourceOptions<
  TMappings,
  TCardProps
>): SlottedItemSourceInstance<TMappings> {
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
        `${pt(itemLabel, itemLabel)} ${String((index ?? 0) + 1)}`,
    },
  } satisfies YextFieldDefinition<SlotMappedCardsData<TMappings>>;
  const defaultValue: SlotMappedCardsData<TMappings> = {
    field: "",
    constantValueEnabled: true,
    constantValue: Array.from({ length: defaultItems }, () => ({})),
    mappings: defaultMappings,
  };
  const defaultWrapperProps = {
    data: defaultValue,
    slots: {
      CardSlot: [] as [],
    },
    manualSlots: {
      CardSlot: [] as [],
    },
  };
  const sourceField = {
    type: "entityField",
    label,
    filter: { itemSourceTypes: [] },
  } satisfies YextFieldDefinition<unknown>;
  const resolvedCardName = cardName ?? itemLabel;
  const resolveItems = (
    value: SlotMappedCardsData<TMappings> | undefined,
    streamDocument: Parameters<
      SlottedItemSourceInstance<TMappings>["resolveItems"]
    >[1]
  ) => {
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
  };

  return {
    field,
    defaultValue,
    defaultWrapperProps,
    value: undefined as unknown as SlotMappedCardsData<TMappings>,
    resolveItems,
    populateSlots: (data, streamDocument) => {
      if (!streamDocument) {
        return data;
      }

      const wrapperData = data as unknown as ComponentData<{
        data: SlotMappedCardsData<TMappings>;
        slots: { CardSlot: ComponentData<Record<string, unknown>>[] };
        manualSlots?: { CardSlot: ComponentData<Record<string, unknown>>[] };
        conditionalRender?: { isMappedContentEmpty?: boolean };
      }>;

      if (!Array.isArray(wrapperData.props.slots?.CardSlot)) {
        throw new Error(
          "createSlottedItemSource.populateSlots requires props.slots.CardSlot"
        );
      }

      const visibleCards = wrapperData.props.slots.CardSlot;
      const hasManualSlots = Array.isArray(
        wrapperData.props.manualSlots?.CardSlot
      );
      const persistedManualCards = hasManualSlots
        ? wrapperData.props.manualSlots!.CardSlot
        : undefined;
      const hasPersistedManualCards =
        Array.isArray(persistedManualCards) && persistedManualCards.length > 0;
      const manualCards = hasPersistedManualCards
        ? persistedManualCards
        : visibleCards;
      const shouldBootstrapLegacyManualCards =
        wrapperData.props.data.constantValueEnabled &&
        !wrapperData.props.data.field &&
        Array.isArray(wrapperData.props.data.constantValue) &&
        wrapperData.props.data.constantValue.length > 0 &&
        wrapperData.props.data.constantValue.every(
          (cardReference) => !cardReference?.id
        ) &&
        manualCards.every((card) => !card.props.id);
      const sharedVisibleCardProps = visibleCards[0]?.props as
        | {
            styles?: Record<string, unknown>;
            slots?: Record<
              string,
              Array<{ props?: { styles?: Record<string, unknown> } }>
            >;
          }
        | undefined;

      const createCard = (
        id: string,
        index: number
      ): ComponentData<Record<string, unknown>> => {
        const card = setChildSlotIds(
          {
            type: resolvedCardName,
            props: {
              ...(cloneValue(defaultItemProps ?? {}) as Record<
                string,
                unknown
              >),
              id,
              index,
            },
          },
          id
        );

        if (sharedVisibleCardProps?.styles) {
          card.props.styles = cloneValue(sharedVisibleCardProps.styles);
        }

        const cardSlots = card.props.slots as
          | Record<
              string,
              Array<{ props?: { styles?: Record<string, unknown> } }>
            >
          | undefined;

        Object.entries(sharedVisibleCardProps?.slots ?? {}).forEach(
          ([slotKey, slotArray]) => {
            if (
              !cardSlots?.[slotKey]?.[0]?.props?.styles ||
              !slotArray[0]?.props?.styles
            ) {
              return;
            }

            cardSlots[slotKey][0]!.props!.styles = cloneValue(
              slotArray[0].props.styles
            );
          }
        );

        return card;
      };

      if (
        !wrapperData.props.data.constantValueEnabled &&
        wrapperData.props.data.field
      ) {
        const items = cloneValue(
          resolveItems(
            wrapperData.props.data as SlotMappedCardsData<TMappings>,
            streamDocument
          )
        );

        if (items.length === 0) {
          return {
            ...wrapperData,
            props: {
              ...wrapperData.props,
              manualSlots: {
                CardSlot: manualCards,
              },
              slots: {
                ...wrapperData.props.slots,
                CardSlot: [],
              },
              conditionalRender: { isMappedContentEmpty: true },
            },
          } as unknown as typeof data;
        }

        const cards = syncLinkedSlotMappedCards({
          items,
          currentCards: visibleCards,
          createCard,
          toParentData: () => undefined,
          normalizeId: (id) => `${resolvedCardName}-${id}`,
        }).map((card, index) => {
          const cardProps = {
            ...card.props,
            field: wrapperData.props.data.field,
            ...(items[index] as Record<string, unknown>),
          } as Record<string, unknown>;

          delete cardProps.parentData;

          return {
            ...card,
            props: cardProps,
          };
        });

        return {
          ...wrapperData,
          props: {
            ...wrapperData.props,
            manualSlots: {
              CardSlot: manualCards,
            },
            slots: {
              ...wrapperData.props.slots,
              CardSlot: cards,
            },
            conditionalRender: undefined,
          },
        } as unknown as typeof data;
      }

      const normalizedCards = syncManualSlotMappedCards({
        cardReferences: Array.isArray(wrapperData.props.data.constantValue)
          ? wrapperData.props.data.constantValue
          : [],
        currentCards: visibleCards.some(
          (card) =>
            typeof card.props.field === "string" && card.props.field.length > 0
        )
          ? manualCards
          : visibleCards,
        createCard,
        syncChildSlotIds: (card, id) => setChildSlotIds(card, id),
        normalizeId: (id) => `${resolvedCardName}-${id}`,
        reuseIdlessCards:
          hasPersistedManualCards && !shouldBootstrapLegacyManualCards,
      }).cards.map((card) => {
        const cardProps = { ...card.props } as Record<string, unknown>;

        delete cardProps.field;
        delete cardProps.parentData;
        Object.keys(scopedMappingFields).forEach((key) => {
          delete cardProps[key];
        });

        return {
          ...card,
          props: cardProps,
        };
      });

      return {
        ...wrapperData,
        props: {
          ...wrapperData.props,
          data: {
            ...wrapperData.props.data,
            constantValue: normalizedCards.map((card) => ({
              id: card.props.id as string | undefined,
            })),
          },
          manualSlots: {
            CardSlot: normalizedCards,
          },
          slots: {
            ...wrapperData.props.slots,
            CardSlot: normalizedCards,
          },
          conditionalRender: undefined,
        },
      } as unknown as typeof data;
    },
  };
}
