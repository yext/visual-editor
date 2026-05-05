import {
  type ComponentData,
  type DefaultComponentProps,
  type Fields,
  setDeep,
} from "@puckeditor/core";
import { type StreamDocument } from "../types/StreamDocument.ts";
import { type CardWrapperType } from "./cardWrapperHelpers.ts";
import { buildListSectionCards } from "./listSectionData.ts";
import { resolveMappedListSource } from "./mappedSource.ts";
import {
  toPuckFields,
  type YextFieldMap,
  type YextFields,
} from "../../fields/fields.ts";
import { type YextFieldDefinition } from "../../editor/YextField.tsx";

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

/**
 * Resolves a wrapper's cards from the selected source.
 *
 * 1. Classify the source as constant value or mapped items.
 * 2. Keep constant value cards and ids in sync while preserving existing card
 *    styling.
 * 3. Resolve mapped items and expand/trim cards to match.
 * 4. Decorate each card with parent data for rendering.
 */
export const resolveMappedListWrapperData = <
  TWrapperProps extends CardWrapperType<any>,
  TCardProps extends DefaultComponentProps,
  TMappedItem,
  TSharedCardProps,
>({
  data,
  streamDocument,
  cardIdPrefix,
  getSharedCardProps,
  createCard,
  decorateMappedItemCard,
  fallbackToIndex = false,
  rewriteChildSlotIds,
}: {
  data: ComponentData<TWrapperProps>;
  streamDocument: StreamDocument;
  cardIdPrefix: string;
  getSharedCardProps: (
    card: ComponentData<TCardProps> | undefined
  ) => TSharedCardProps | undefined;
  createCard: (
    id: string,
    index: number | undefined,
    sharedCardProps: TSharedCardProps | undefined
  ) => ComponentData<TCardProps>;
  decorateMappedItemCard: (
    card: ComponentData<TCardProps>,
    item: TMappedItem,
    index: number
  ) => ComponentData<TCardProps>;
  fallbackToIndex?: boolean;
  rewriteChildSlotIds?:
    | boolean
    | ((card: ComponentData<TCardProps>, newId: string) => void);
}): ComponentData<TWrapperProps> => {
  const source = resolveMappedListSource<TMappedItem>({
    streamDocument,
    constantValueEnabled: data.props.data.constantValueEnabled,
    fieldPath: data.props.data.field,
  });
  const currentCards = data.props.slots.CardSlot as ComponentData<TCardProps>[];
  const sharedCardProps = getSharedCardProps(currentCards[0]);

  if (source.mode === "constantValue") {
    const syncedCards = syncConstantValueListCards({
      currentCards,
      constantValue: data.props.data.constantValue,
      createId: () => `${cardIdPrefix}-${crypto.randomUUID()}`,
      createCard: (id, index) => createCard(id, index, sharedCardProps),
      fallbackToIndex,
      rewriteChildSlotIds,
    });
    return setDeep(
      setDeep(data, "props.slots.CardSlot", syncedCards.slots),
      "props.data.constantValue",
      syncedCards.constantValue
    ) as ComponentData<TWrapperProps>;
  }

  if (!source.items.length) {
    return setDeep(
      data,
      "props.slots.CardSlot",
      []
    ) as ComponentData<TWrapperProps>;
  }

  return setDeep(
    data,
    "props.slots.CardSlot",
    buildListSectionCards<TCardProps, TMappedItem>({
      currentCards,
      createCard: () =>
        createCard(
          `${cardIdPrefix}-${crypto.randomUUID()}`,
          undefined,
          sharedCardProps
        ),
      decorateCard: decorateMappedItemCard,
      items: source.items,
    })
  ) as ComponentData<TWrapperProps>;
};

/**
 * Rebuilds a wrapper's fields and toggles mapping visibility.
 */
export const resolveMappedListFields = <
  TProps extends CardWrapperType<any> & DefaultComponentProps,
>({
  data,
  createFields,
  mappingFieldName,
  createMappingFields,
}: {
  data: ComponentData<TProps>;
  createFields: (
    sourceFieldPath?: string
  ) => YextFields<TProps> | YextFieldMap<TProps>;
  mappingFieldName: keyof TProps & string;
  createMappingFields: (sourceFieldPath?: string) => YextFieldDefinition<any>;
}): Fields<TProps> => {
  const sourceFieldPath =
    data.props.data.constantValueEnabled || !data.props.data.field
      ? undefined
      : "data.field";

  return toPuckFields({
    ...(createFields(sourceFieldPath) as YextFieldMap<TProps>),
    [mappingFieldName]: {
      ...(createMappingFields(sourceFieldPath) as object),
      visible: !!sourceFieldPath,
    },
  });
};
