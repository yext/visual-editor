import {
  type ComponentData,
  type DefaultComponentProps,
  setDeep,
} from "@puckeditor/core";
import { type YextEntityField } from "../../editor/yextEntityFieldUtils.ts";
import { resolveYextEntityField } from "../resolveYextEntityField.ts";
import { type StreamDocument } from "../types/StreamDocument.ts";
import { type CardWrapperType } from "./cardWrapperHelpers.ts";
import { buildListSectionCards } from "./listSectionData.ts";
import {
  classifyMappedSource,
  resolveMappedSourceItems,
  type MappedSourceMode,
} from "./mappedSource.ts";

const cloneCard = <TCardProps extends DefaultComponentProps>(
  card: ComponentData<TCardProps>
): ComponentData<TCardProps> =>
  JSON.parse(JSON.stringify(card)) as ComponentData<TCardProps>;

const resolveSectionFieldItems = <TItem>(
  streamDocument: StreamDocument,
  fieldPath: string,
  listFieldName: string,
  locale: string
): TItem[] => {
  const resolvedValue = resolveYextEntityField<
    Record<string, TItem[] | undefined> | undefined
  >(
    streamDocument,
    {
      field: fieldPath,
      constantValue: { [listFieldName]: undefined } as Record<
        string,
        TItem[] | undefined
      >,
    } as YextEntityField<Record<string, TItem[] | undefined>>,
    locale
  );

  return resolvedValue?.[listFieldName] ?? [];
};

export const syncManualListCards = <TCardProps extends DefaultComponentProps>({
  currentCards,
  constantValue,
  createId,
  createCard,
  fallbackToIndex = false,
  rewriteChildSlotIds,
}: {
  currentCards: ComponentData<TCardProps>[];
  constantValue: { id?: string }[] | undefined;
  createId: () => string;
  createCard: (id: string, index: number) => ComponentData<TCardProps>;
  fallbackToIndex?: boolean;
  rewriteChildSlotIds?: (
    card: ComponentData<TCardProps>,
    newId: string
  ) => void;
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
        rewriteChildSlotIds?.(card, nextId);
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

export const resolveMappedListWrapperData = <
  TWrapperProps extends CardWrapperType<any>,
  TCardProps extends DefaultComponentProps,
  TMappedItem,
  TSectionItem,
  TSharedCardProps,
>({
  data,
  streamDocument,
  locale,
  listFieldName,
  cardIdPrefix,
  getSharedCardProps,
  createCard,
  decorateMappedItemCard,
  decorateSectionItemCard,
  fallbackToIndex = false,
  rewriteChildSlotIds,
}: {
  data: ComponentData<TWrapperProps>;
  streamDocument: StreamDocument;
  locale: string;
  listFieldName: string;
  cardIdPrefix: string;
  getSharedCardProps: (
    data: ComponentData<TWrapperProps>
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
  decorateSectionItemCard: (
    card: ComponentData<TCardProps>,
    item: TSectionItem,
    index: number
  ) => ComponentData<TCardProps>;
  fallbackToIndex?: boolean;
  rewriteChildSlotIds?: (
    card: ComponentData<TCardProps>,
    newId: string
  ) => void;
}): ComponentData<TWrapperProps> => {
  const sourceMode = classifyMappedSource({
    streamDocument,
    constantValueEnabled: data.props.data.constantValueEnabled,
    fieldPath: data.props.data.field,
    listFieldName,
  });
  const currentCards = data.props.slots.CardSlot as ComponentData<TCardProps>[];

  if (sourceMode === "manual") {
    const syncedCards = syncManualListCards({
      currentCards,
      constantValue: data.props.data.constantValue,
      createId: () => `${cardIdPrefix}-${crypto.randomUUID()}`,
      createCard: (id, index) =>
        createCard(id, index, getSharedCardProps(data)),
      fallbackToIndex,
      rewriteChildSlotIds,
    });
    return setDeep(
      setDeep(data, "props.slots.CardSlot", syncedCards.slots),
      "props.data.constantValue",
      syncedCards.constantValue
    ) as ComponentData<TWrapperProps>;
  }

  const sharedCardProps = getSharedCardProps(data);
  const fieldPath = data.props.data.field;
  const items =
    sourceMode === "sectionField"
      ? resolveSectionFieldItems<TSectionItem>(
          streamDocument,
          fieldPath,
          listFieldName,
          locale
        )
      : resolveMappedSourceItems<TMappedItem>(streamDocument, fieldPath);

  if (!items.length) {
    return setDeep(
      data,
      "props.slots.CardSlot",
      []
    ) as ComponentData<TWrapperProps>;
  }

  return setDeep(
    data,
    "props.slots.CardSlot",
    buildListSectionCards<TCardProps, TSectionItem | TMappedItem>({
      currentCards,
      createCard: () =>
        createCard(
          `${cardIdPrefix}-${crypto.randomUUID()}`,
          undefined,
          sharedCardProps
        ),
      decorateCard: (card, item, index) =>
        sourceMode === "sectionField"
          ? decorateSectionItemCard(card, item as TSectionItem, index)
          : decorateMappedItemCard(card, item as TMappedItem, index),
      items,
    })
  ) as ComponentData<TWrapperProps>;
};

export const getMappedListSourceMode = (
  streamDocument: StreamDocument,
  data: Pick<CardWrapperType<any>["data"], "constantValueEnabled" | "field">,
  listFieldName: string
): MappedSourceMode =>
  classifyMappedSource({
    streamDocument,
    constantValueEnabled: data.constantValueEnabled,
    fieldPath: data.field,
    listFieldName,
  });
