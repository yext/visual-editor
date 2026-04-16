type EntityFieldSelection = {
  field?: string;
  constantValueEnabled?: boolean;
};

type CardWrapperSlot = {
  id?: string;
  props?: {
    id?: string;
    data?: EntityFieldSelection;
    slots?: {
      CardSlot?: unknown[];
    };
  };
};

export const isMappedEntityFieldSelected = (
  entityField?: EntityFieldSelection
): boolean => {
  return (
    Boolean(entityField?.field) && entityField?.constantValueEnabled === false
  );
};

export const isMappedEntityFieldCollectionEmpty = (
  entityField: EntityFieldSelection | undefined,
  items: unknown[] | undefined
): boolean => {
  return isMappedEntityFieldSelected(entityField) && (items?.length ?? 0) === 0;
};

export const isMappedCardWrapperEmpty = (
  cardWrapperSlot: CardWrapperSlot | undefined
): boolean => {
  return isMappedEntityFieldCollectionEmpty(
    cardWrapperSlot?.props?.data,
    cardWrapperSlot?.props?.slots?.CardSlot
  );
};

export const isMappedCardWrapperSelected = (
  cardWrapperSlot: CardWrapperSlot | undefined
): boolean => {
  return isMappedEntityFieldSelected(cardWrapperSlot?.props?.data);
};

export const getEditorItemId = (
  item:
    | {
        id?: string;
        props?: {
          id?: string;
        };
      }
    | undefined
): string | undefined => {
  return item?.props?.id ?? item?.id;
};
