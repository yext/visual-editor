import { Address, AddressProps } from "../contentBlocks/Address.tsx";
import { BodyTextProps, BodyText } from "../contentBlocks/BodyText.tsx";
import { CTAWrapperProps, CTAWrapper } from "../contentBlocks/CtaWrapper.tsx";
import {
  HeadingTextProps,
  HeadingText,
} from "../contentBlocks/HeadingText.tsx";
import { HoursTable, HoursTableProps } from "../contentBlocks/HoursTable.tsx";
import {
  ImageWrapperProps,
  ImageWrapper,
} from "../contentBlocks/image/Image.tsx";
import { Video, VideoProps } from "../contentBlocks/Video.tsx";
import {
  TextList,
  TextListProps,
  ServicesList,
} from "../contentBlocks/TextList.tsx";
import { PhoneListProps, PhoneList } from "../contentBlocks/PhoneList.tsx";
import { Emails, EmailsProps } from "../contentBlocks/Emails.tsx";
import {
  HoursStatus,
  HoursStatusProps,
} from "../contentBlocks/HoursStatus.tsx";
import {
  HeroImage,
  HeroImageProps,
} from "../contentBlocks/image/HeroImage.tsx";

export interface SlotsCategoryProps {
  AddressSlot: AddressProps;
  BodyTextSlot: BodyTextProps;
  CTASlot: CTAWrapperProps;
  EmailsSlot: EmailsProps;
  HeadingTextSlot: HeadingTextProps;
  HeroImageSlot: HeroImageProps;
  HoursStatusSlot: HoursStatusProps;
  HoursTableSlot: HoursTableProps;
  ImageSlot: ImageWrapperProps;
  PhoneNumbersSlot: PhoneListProps;
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
  BodyTextSlot: { ...BodyText, permissions: lockedPermissions },
  CTASlot: { ...CTAWrapper, permissions: lockedPermissions },
  EmailsSlot: { ...Emails, permissions: lockedPermissions },
  HeadingTextSlot: { ...HeadingText, permissions: lockedPermissions },
  HeroImageSlot: { ...HeroImage, permissions: lockedPermissions },
  HoursStatusSlot: { ...HoursStatus, permissions: lockedPermissions },
  HoursTableSlot: { ...HoursTable, permissions: lockedPermissions },
  ImageSlot: { ...ImageWrapper, permissions: lockedPermissions },
  PhoneNumbersSlot: { ...PhoneList, permissions: lockedPermissions },
  ServicesListSlot: { ...ServicesList, permissions: lockedPermissions },
  TextListSlot: { ...TextList, permissions: lockedPermissions },
  VideoSlot: { ...Video, permissions: lockedPermissions },
};

export const SlotsCategory = Object.keys(
  SlotsCategoryComponents
) as (keyof SlotsCategoryProps)[];
