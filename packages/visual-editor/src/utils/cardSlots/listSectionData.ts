import { ComponentData, DefaultComponentProps } from "@puckeditor/core";
import { resolveMappedListItems } from "../listSourceFieldUtils.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";

type ListSourceFieldLike = {
  field: string;
  itemFieldMappings?: Record<string, string>;
};

type ResolveListSectionItemsArgs<T> = {
  buildMappedItem: (resolvedItemFields: Record<string, unknown>) => T;
  data: ListSourceFieldLike;
  resolveLegacyItems: () => T[] | undefined;
  streamDocument: StreamDocument;
  isValidItem?: (item: T) => boolean;
};

/**
 * Resolves list-backed section items by preferring explicit list-item mappings
 * and falling back to the legacy section field shape.
 */
export const resolveListSectionItems = <T>({
  buildMappedItem,
  data,
  resolveLegacyItems,
  streamDocument,
  isValidItem,
}: ResolveListSectionItemsArgs<T>): {
  items: T[] | undefined;
  requiredLength: number;
} => {
  const items =
    resolveMappedListItems<T>(
      streamDocument,
      data.field,
      data.itemFieldMappings,
      buildMappedItem
    ) ?? resolveLegacyItems();

  const filteredItems = isValidItem ? items?.filter(isValidItem) : items;
  return {
    items: filteredItems,
    requiredLength: filteredItems?.length ?? 0,
  };
};

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
