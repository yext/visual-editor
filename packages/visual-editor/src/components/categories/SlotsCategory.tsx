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
import {
  ProductCardsWrapper,
  ProductCardsWrapperProps,
} from "../pageSections/ProductSection/ProductCardsWrapper.tsx";
import {
  ProductCard,
  ProductCardProps,
} from "../pageSections/ProductSection/ProductCard.tsx";
import {
  EventCardsWrapper,
  EventCardsWrapperProps,
} from "../pageSections/EventSection/EventCardsWrapper.tsx";
import {
  EventCard,
  EventCardProps,
} from "../pageSections/EventSection/EventCard.tsx";
import { Emails, EmailsProps } from "../contentBlocks/Emails.tsx";
import {
  HoursStatus,
  HoursStatusProps,
} from "../contentBlocks/HoursStatus.tsx";
import {
  HeroImage,
  HeroImageProps,
} from "../contentBlocks/image/HeroImage.tsx";
import { Timestamp, TimestampProps } from "../contentBlocks/Timestamp.tsx";
import {
  InsightCardsWrapper,
  InsightCardsWrapperProps,
} from "../pageSections/InsightSection/InsightCardsWrapper.tsx";
import {
  InsightCard,
  InsightCardProps,
} from "../pageSections/InsightSection/InsightCard.tsx";
import {
  TeamCardsWrapper,
  TeamCardsWrapperProps,
} from "../pageSections/TeamSection/TeamCardsWrapper.tsx";
import {
  TeamCard,
  TeamCardProps,
} from "../pageSections/TeamSection/TeamCard.tsx";

export interface SlotsCategoryProps {
  AddressSlot: AddressProps;
  BodyTextSlot: BodyTextProps;
  CTASlot: CTAWrapperProps;
  EmailsSlot: EmailsProps;
  EventCard: EventCardProps;
  EventCardsWrapper: EventCardsWrapperProps;
  HeadingTextSlot: HeadingTextProps;
  HeroImageSlot: HeroImageProps;
  HoursStatusSlot: HoursStatusProps;
  HoursTableSlot: HoursTableProps;
  ImageSlot: ImageWrapperProps;
  InsightCardsWrapper: InsightCardsWrapperProps;
  InsightCard: InsightCardProps;
  PhoneNumbersSlot: PhoneListProps;
  ProductCardsWrapper: ProductCardsWrapperProps;
  ProductCard: ProductCardProps;
  ServicesListSlot: TextListProps;
  TeamCard: TeamCardProps;
  TeamCardsWrapper: TeamCardsWrapperProps;
  TextListSlot: TextListProps;
  Timestamp: TimestampProps;
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
  EventCard: { ...EventCard, permissions: lockedPermissions },
  EventCardsWrapper: { ...EventCardsWrapper, permissions: lockedPermissions },
  HeadingTextSlot: { ...HeadingText, permissions: lockedPermissions },
  HeroImageSlot: { ...HeroImage, permissions: lockedPermissions },
  HoursStatusSlot: { ...HoursStatus, permissions: lockedPermissions },
  HoursTableSlot: { ...HoursTable, permissions: lockedPermissions },
  ImageSlot: { ...ImageWrapper, permissions: lockedPermissions },
  InsightCardsWrapper: {
    ...InsightCardsWrapper,
    permissions: lockedPermissions,
  },
  InsightCard: { ...InsightCard, permissions: lockedPermissions },
  PhoneNumbersSlot: { ...PhoneList, permissions: lockedPermissions },
  ProductCardsWrapper: {
    ...ProductCardsWrapper,
    permissions: lockedPermissions,
  },
  ProductCard: { ...ProductCard, permissions: lockedPermissions },
  ServicesListSlot: { ...ServicesList, permissions: lockedPermissions },
  TeamCard: { ...TeamCard, permissions: lockedPermissions },
  TeamCardsWrapper: { ...TeamCardsWrapper, permissions: lockedPermissions },
  TextListSlot: { ...TextList, permissions: lockedPermissions },
  Timestamp: { ...Timestamp, permissions: lockedPermissions },
  VideoSlot: { ...Video, permissions: lockedPermissions },
};

export const SlotsCategory = Object.keys(
  SlotsCategoryComponents
) as (keyof SlotsCategoryProps)[];
