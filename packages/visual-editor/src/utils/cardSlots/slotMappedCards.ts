import { type ComponentData, setDeep } from "@puckeditor/core";

type CardWithId = ComponentData<{
  id?: string;
  index?: number;
  parentData?: unknown;
}>;

const cloneCard = <TCard extends CardWithId>(card: TCard): TCard =>
  JSON.parse(JSON.stringify(card)) as TCard;

export const syncManualSlotMappedCards = <TCard extends CardWithId>({
  cardReferences,
  currentCards,
  createCard,
  syncChildSlotIds,
  normalizeId,
}: {
  cardReferences: Array<{ id?: string }>;
  currentCards: TCard[];
  createCard: (id: string, index: number) => TCard;
  syncChildSlotIds?: (card: TCard, id: string) => TCard;
  normalizeId?: (id: string) => string;
}) => {
  const inUseIds = new Set<string>();
  const cards = cardReferences.map(({ id }, index) => {
    const existingCard = id
      ? currentCards.find((card) => card.props.id === id)
      : undefined;
    let card = existingCard ? cloneCard(existingCard as TCard) : undefined;
    let nextId =
      card?.props.id ||
      normalizeId?.(crypto.randomUUID()) ||
      `${crypto.randomUUID()}`;

    if (card && inUseIds.has(nextId)) {
      nextId = normalizeId?.(crypto.randomUUID()) || `${crypto.randomUUID()}`;
      card = syncChildSlotIds ? syncChildSlotIds(card, nextId) : card;
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
