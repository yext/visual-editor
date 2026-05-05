import {
  type ComponentData,
  type DefaultComponentProps,
  setDeep,
} from "@puckeditor/core";

/**
 * Deep-clones a card before reuse so slot synchronization can update ids,
 * indices, and parent data without mutating the input Puck component tree.
 */
const cloneCard = <TCardProps extends DefaultComponentProps>(
  card: ComponentData<TCardProps>
): ComponentData<TCardProps> =>
  JSON.parse(JSON.stringify(card)) as ComponentData<TCardProps>;

/**
 * Rewrites immediate nested slot item ids when a reused constant value card
 * receives a new id, keeping child component ids derived from the parent card
 * id.
 */
const rewriteNestedSlotIds = <TCardProps extends DefaultComponentProps>(
  card: ComponentData<TCardProps>,
  newId: string
): void => {
  if (!card.props.slots || typeof card.props.slots !== "object") {
    return;
  }

  Object.entries(card.props.slots).forEach(([slotKey, slotArray]) => {
    if (!Array.isArray(slotArray)) {
      return;
    }

    slotArray.forEach((slotItem) => {
      if (slotItem?.props?.id) {
        slotItem.props.id = `${newId}-${slotKey}`;
      }
    });
  });
};

/**
 * Synchronizes cards for constant value mode, where the wrapper's constant
 * value stores only the card ids and the per-card content remains in the Puck
 * slot tree.
 */
export const syncConstantValueListCards = <
  TCardProps extends DefaultComponentProps,
>({
  currentCards,
  constantValue,
  createId,
  createCard,
  fallbackToIndex = false,
  rewriteChildSlotIds = true,
}: {
  currentCards: ComponentData<TCardProps>[];
  constantValue: { id?: string }[] | undefined;
  createId: () => string;
  createCard: (id: string, index: number) => ComponentData<TCardProps>;
  fallbackToIndex?: boolean;
  rewriteChildSlotIds?:
    | boolean
    | ((card: ComponentData<TCardProps>, newId: string) => void);
}): {
  slots: ComponentData<TCardProps>[];
  constantValue: { id?: string }[];
} => {
  const inUseIds = new Set<string>();
  const slots = (Array.isArray(constantValue) ? constantValue : []).map(
    ({ id }, index) => {
      const existingCard = id
        ? (currentCards.find((slot) => slot.props.id === id) as
            | ComponentData<TCardProps>
            | undefined)
        : fallbackToIndex
          ? currentCards[index]
          : undefined;
      let card = existingCard ? cloneCard(existingCard) : undefined;
      let nextId = card?.props.id || createId();

      while (inUseIds.has(nextId)) {
        nextId = createId();
      }

      if (card && card.props.id !== nextId) {
        if (typeof rewriteChildSlotIds === "function") {
          rewriteChildSlotIds(card, nextId);
        } else if (rewriteChildSlotIds) {
          rewriteNestedSlotIds(card, nextId);
        }
      }
      inUseIds.add(nextId);

      if (!card) {
        return createCard(nextId, index);
      }

      return setDeep(
        setDeep(setDeep(card, "props.id", nextId), "props.index", index),
        "props.parentData",
        undefined
      );
    }
  );

  return {
    slots,
    constantValue: slots.map((card) => ({ id: card.props.id })),
  };
};
