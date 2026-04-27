import { type YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";

type CardWrapperSlot = {
  id?: string;
  props?: {
    id?: string;
    data?: YextEntityField<unknown>;
    slots?: {
      CardSlot?: unknown[];
    };
  };
};

export const isMappedEntityFieldSelected = (
  entityField?: YextEntityField<unknown>
): boolean => {
  return (
    Boolean(entityField?.field) && entityField?.constantValueEnabled === false
  );
};

export const isMappedEntityFieldCollectionEmpty = (
  entityField: YextEntityField<unknown> | undefined,
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
