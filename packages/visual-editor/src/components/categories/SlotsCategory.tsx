import {
  HeadingTextProps,
  HeadingText,
} from "../contentBlocks/HeadingText.tsx";

export interface SlotsCategoryProps {
  HeadingTextSlot: HeadingTextProps;
}

const lockedPermissions = {
  delete: false,
  drag: false,
  duplicate: false,
  insert: false,
};

export const SlotsCategoryComponents = {
  HeadingTextSlot: { ...HeadingText, permissions: lockedPermissions },
};

export const SlotsCategory = Object.keys(
  SlotsCategoryComponents
) as (keyof SlotsCategoryProps)[];
