import { Slot, setDeep } from "@puckeditor/core";

interface CardWrapper {
  slots: {
    CardSlot: Slot;
  };
}

/**
 * Reads the section heading level from `SectionHeadingSlot` and passes the
 * next semantic level into each card's destination heading slot. When the
 * section heading is already `h6`, card headings are rendered as `span` so the
 * document outline does not exceed valid heading levels.
 */
export const forwardHeadingLevel = <T extends CardWrapper>(
  data: Record<string, any>,
  destinationHeadingSlotKey: string
) => {
  const sectionHeadingLevel =
    data.props.slots.SectionHeadingSlot?.[0]?.props?.styles?.level;
  const cards: T["slots"]["CardSlot"] =
    data.props.slots.CardsWrapperSlot?.[0]?.props?.slots?.CardSlot;
  const semanticOverride =
    sectionHeadingLevel < 6 ? sectionHeadingLevel + 1 : "span";

  if (cards) {
    data.props.slots.CardsWrapperSlot[0].props.slots.CardSlot = cards.map(
      (card) => {
        return setDeep(
          card,
          `props.slots.${destinationHeadingSlotKey}[0].props.styles.semanticLevelOverride`,
          semanticOverride
        );
      }
    );
  }

  return data;
};
