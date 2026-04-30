import { ComponentData, DefaultComponentProps } from "@puckeditor/core";

type BuildListSectionCardsArgs<
  TCardProps extends DefaultComponentProps,
  TItem,
> = {
  currentCards: ComponentData<TCardProps>[];
  createCard: () => ComponentData<TCardProps>;
  decorateCard: (
    card: ComponentData<TCardProps>,
    item: TItem,
    index: number
  ) => ComponentData<TCardProps>;
  items: TItem[];
};

/**
 * Expands or trims a card slot to match the resolved items, then decorates
 * each card with item-specific data.
 */
export const buildListSectionCards = <
  TCardProps extends DefaultComponentProps,
  TItem,
>({
  currentCards,
  createCard,
  decorateCard,
  items,
}: BuildListSectionCardsArgs<
  TCardProps,
  TItem
>): ComponentData<TCardProps>[] => {
  const cardsToAdd =
    currentCards.length < items.length
      ? Array(items.length - currentCards.length)
          .fill(null)
          .map(createCard)
      : [];

  return [...currentCards, ...cardsToAdd]
    .slice(0, items.length)
    .map((card, index) => decorateCard(card, items[index], index));
};
