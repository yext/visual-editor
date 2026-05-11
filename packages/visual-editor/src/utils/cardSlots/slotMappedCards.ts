import { type ComponentData, setDeep } from "@puckeditor/core";

/**
 * Slot-mapped card reconciliation helpers.
 *
 * 1. Reconcile manual cards against stored card references and preserve authored slots.
 * 2. Reconcile linked cards against resolved item counts while preserving card structure.
 * 3. Normalize ids and clear stale `parentData` at the card and child-slot levels.
 */

type CardWithId = ComponentData<{
  id?: string;
  index?: number;
  parentData?: unknown;
  slots?: Record<string, Array<{ props?: Record<string, unknown> }>>;
}>;

/**
 * Deep-clones one card before reconciliation mutates ids, indexes, or slot
 * parent data.
 */
const cloneCard = <TCard extends CardWithId>(card: TCard): TCard =>
  JSON.parse(JSON.stringify(card)) as TCard;

/**
 * Reconciles manual slot-backed cards against the parent field's stored card
 * references.
 *
 * 1. Reuse existing cards by matching stored ids, or fall back to positional
 *    reuse for legacy manual cards that never had ids.
 * 2. Generate or normalize card ids so the returned list has a stable, unique
 *    order.
 * 3. Clear stale parent-data on the card and all direct slot children so
 *    manual content remains authoritative.
 * 4. Return both the normalized cards and the updated parent references that
 *    should be stored in `constantValue`.
 */
export const syncManualSlotMappedCards = <TCard extends CardWithId>({
  cardReferences,
  currentCards,
  createCard,
  syncChildSlotIds,
  normalizeId,
  reuseIdlessCards = true,
}: {
  cardReferences: Array<{ id?: string }>;
  currentCards: TCard[];
  createCard: (id: string, index: number) => TCard;
  syncChildSlotIds?: (card: TCard, id: string) => TCard;
  normalizeId?: (id: string) => string;
  reuseIdlessCards?: boolean;
}) => {
  const inUseIds = new Set<string>();
  const usedCardIndices = new Set<number>();
  const cards = cardReferences.map(({ id }, index) => {
    const existingCardIndex = id
      ? currentCards.findIndex((card) => card.props.id === id)
      : !reuseIdlessCards
        ? -1
        : usedCardIndices.has(index)
          ? currentCards.findIndex(
              (_, cardIndex) => !usedCardIndices.has(cardIndex)
            )
          : index;
    const existingCard =
      existingCardIndex >= 0 ? currentCards[existingCardIndex] : undefined;
    let card = existingCard ? cloneCard(existingCard as TCard) : undefined;

    if (existingCard && existingCardIndex >= 0) {
      usedCardIndices.add(existingCardIndex);
    }

    let nextId =
      card?.props.id ||
      normalizeId?.(crypto.randomUUID()) ||
      `${crypto.randomUUID()}`;

    if (card && inUseIds.has(nextId)) {
      nextId = normalizeId?.(crypto.randomUUID()) || `${crypto.randomUUID()}`;
    }

    if (card) {
      card = syncChildSlotIds ? syncChildSlotIds(card, nextId) : card;
      const slots = card.props.slots as
        | Record<string, Array<{ props?: Record<string, unknown> }>>
        | undefined;

      Object.values(slots ?? {}).forEach((slotArray) => {
        slotArray.forEach((slotChild) => {
          delete slotChild.props?.parentData;
        });
      });
    }

    inUseIds.add(nextId);

    if (!card) {
      return createCard(nextId, index);
    }

    return setDeep(
      setDeep(setDeep(card, "props.id", nextId), "props.index", index),
      "props.parentData",
      undefined
    ) as TCard;
  });

  return {
    cards,
    cardReferences: cards.map((card) => ({ id: card.props.id })),
  };
};

/**
 * Reconciles linked slot-backed cards against the resolved item list.
 *
 * 1. Grow or shrink the current card list to match the number of resolved
 *    linked items.
 * 2. Preserve existing card instances when possible so slot-level styling and
 *    structure survive linked-data updates.
 * 3. Update each card's index and card-level `parentData` so downstream card
 *    components can bind the resolved item into their internal slots.
 */
export const syncLinkedSlotMappedCards = <
  TMappedItem,
  TCard extends CardWithId,
>({
  items,
  currentCards,
  createCard,
  toParentData,
  normalizeId,
}: {
  items: TMappedItem[];
  currentCards: TCard[];
  createCard: (id: string, index: number) => TCard;
  toParentData: (item: TMappedItem) => TCard["props"]["parentData"];
  normalizeId?: (id: string) => string;
}) => {
  const cardsToAdd =
    currentCards.length < items.length
      ? Array(items.length - currentCards.length)
          .fill(null)
          .map((_, index) =>
            createCard(
              normalizeId?.(crypto.randomUUID()) || `${crypto.randomUUID()}`,
              currentCards.length + index
            )
          )
      : [];
  const updatedCards = [...currentCards, ...cardsToAdd].slice(
    0,
    items.length
  ) as TCard[];

  return updatedCards.map((card, index) =>
    setDeep(
      setDeep(card, "props.index", index),
      "props.parentData",
      toParentData(items[index]!)
    )
  ) as TCard[];
};
