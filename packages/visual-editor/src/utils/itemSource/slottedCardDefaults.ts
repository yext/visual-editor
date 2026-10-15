import { type ComponentData } from "@puckeditor/core";
import type { SlottedItemSourceGenerationMetadata } from "./itemSourceTypes.ts";

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
export const setChildSlotIds = (
  card: ComponentData<Record<string, unknown>>,
  cardId: string
): ComponentData<Record<string, unknown>> => {
  const slots = card.props.slots as
    Record<string, Array<{ props?: Record<string, unknown> }>> | undefined;

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

/** Creates a card using the same defaults in generation and editor resolution. */
export const createSlottedCard = (
  metadata: SlottedItemSourceGenerationMetadata,
  id: string,
  index: number
): ComponentData<Record<string, unknown>> =>
  setChildSlotIds(
    {
      type: metadata.cardType,
      props: {
        ...cloneValue(
          typeof metadata.defaultItemProps === "function"
            ? metadata.defaultItemProps()
            : (metadata.defaultItemProps ?? {})
        ),
        id,
        index,
      },
    },
    id
  );
