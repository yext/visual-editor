import {
  HeadingTextProps,
  HeadingText,
} from "../contentBlocks/HeadingText.tsx";
import { Address, AddressProps } from "../contentBlocks/Address.tsx";
import { HoursTable, HoursTableProps } from "../contentBlocks/HoursTable.tsx";
import { Video, VideoProps } from "../contentBlocks/Video.tsx";
import {
  TextList,
  TextListProps,
  ServicesList,
} from "../contentBlocks/TextList.tsx";

export interface SlotsCategoryProps {
  AddressSlot: AddressProps;
  HeadingTextSlot: HeadingTextProps;
  HoursTableSlot: HoursTableProps;
  ServicesListSlot: TextListProps;
  TextListSlot: TextListProps;
  VideoSlot: VideoProps;
}

const lockedPermissions = {
  delete: false,
  drag: false,
  duplicate: false,
  insert: false,
};

export const SlotsCategoryComponents = {
  AddressSlot: { ...Address, permissions: lockedPermissions },
  HeadingTextSlot: { ...HeadingText, permissions: lockedPermissions },
  HoursTableSlot: { ...HoursTable, permissions: lockedPermissions },
  ServicesListSlot: { ...ServicesList, permissions: lockedPermissions },
  TextListSlot: { ...TextList, permissions: lockedPermissions },
  VideoSlot: { ...Video, permissions: lockedPermissions },
};

export const SlotsCategory = Object.keys(
  SlotsCategoryComponents
) as (keyof SlotsCategoryProps)[];
