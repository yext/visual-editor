import {
  HeadingTextProps,
  HeadingText,
} from "../contentBlocks/HeadingText.tsx";
import { Video, VideoProps } from "../contentBlocks/Video.tsx";

export interface SlotsCategoryProps {
  HeadingTextSlot: HeadingTextProps;
  VideoSlot: VideoProps;
}

const lockedPermissions = {
  delete: false,
  drag: false,
  duplicate: false,
  insert: false,
};

export const SlotsCategoryComponents = {
  HeadingTextSlot: { ...HeadingText, permissions: lockedPermissions },
  VideoSlot: { ...Video, permissions: lockedPermissions },
};

export const SlotsCategory = Object.keys(
  SlotsCategoryComponents
) as (keyof SlotsCategoryProps)[];
