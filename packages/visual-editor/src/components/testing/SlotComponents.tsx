import { Address, AddressProps } from "../contentBlocks/Address.tsx";
import {
  HeadingTextProps,
  HeadingText,
} from "../contentBlocks/HeadingText.tsx";
import { HoursTable, HoursTableProps } from "../contentBlocks/HoursTable.tsx";
import {
  ImageWrapperProps,
  ImageWrapper,
} from "../contentBlocks/image/Image.tsx";
import {
  HoursStatus,
  HoursStatusProps,
} from "../contentBlocks/HoursStatus.tsx";
import {
  DirectoryCard,
  DirectoryCardProps,
} from "../sections/directory/DirectoryCard.tsx";
import {
  DirectoryGrid,
  DirectoryGridProps,
} from "../sections/directory/DirectoryWrapper.tsx";
import { Phone, PhoneProps } from "../contentBlocks/Phone.tsx";
import {
  BreadcrumbsSection,
  BreadcrumbsSectionProps,
} from "../sections/Breadcrumbs.tsx";

export interface SlotsCategoryProps {
  AddressSlot: AddressProps;
  BreadcrumbsSlot: BreadcrumbsSectionProps;
  DirectoryCard: DirectoryCardProps;
  DirectoryGrid: DirectoryGridProps;
  HeadingTextSlot: HeadingTextProps;
  HoursStatusSlot: HoursStatusProps;
  HoursTableSlot: HoursTableProps;
  ImageSlot: ImageWrapperProps;
  PhoneSlot: PhoneProps;
}

const lockedPermissions = {
  delete: false,
  drag: false,
  duplicate: false,
  insert: false,
};

export const SlotsCategoryComponents = {
  AddressSlot: { ...Address, permissions: lockedPermissions },
  BreadcrumbsSlot: { ...BreadcrumbsSection, permissions: lockedPermissions },
  DirectoryCard: { ...DirectoryCard, permissions: lockedPermissions },
  DirectoryGrid: { ...DirectoryGrid, permissions: lockedPermissions },
  HeadingTextSlot: { ...HeadingText, permissions: lockedPermissions },
  HoursStatusSlot: { ...HoursStatus, permissions: lockedPermissions },
  HoursTableSlot: { ...HoursTable, permissions: lockedPermissions },
  ImageSlot: { ...ImageWrapper, permissions: lockedPermissions },
  PhoneSlot: { ...Phone, permissions: lockedPermissions },
};
