import {
  HeadingTextProps,
  HeadingText,
} from "../contentBlocks/HeadingText.tsx";
import { EventCard, EventCardProps } from "../pageSections/EventSection.tsx";

export interface SlotsCategoryProps {
  HeadingTextSlot: HeadingTextProps;
  EventCard: EventCardProps;
}

const lockedPermissions = {
  delete: false,
  drag: false,
  duplicate: false,
  insert: false,
};

export const SlotsCategoryComponents = {
  HeadingTextSlot: { ...HeadingText, permissions: lockedPermissions },
  EventCard: { ...EventCard, permissions: lockedPermissions },
};

export const SlotsCategory = Object.keys(
  SlotsCategoryComponents
) as (keyof SlotsCategoryProps)[];
