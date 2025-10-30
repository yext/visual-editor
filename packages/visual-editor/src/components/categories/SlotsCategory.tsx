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
  NearbyLocationCardsWrapper,
  NearbyLocationCardsWrapperProps,
} from "../pageSections/NearbyLocations/NearbyLocationsCardsWrapper.tsx";
import {
  InsightCardsWrapper,
  InsightCardsWrapperProps,
} from "../pageSections/InsightSection/InsightCardsWrapper.tsx";
import {
  InsightCard,
  InsightCardProps,
} from "../pageSections/InsightSection/InsightCard.tsx";
import {
  PhotoGalleryWrapperProps,
  PhotoGalleryWrapper,
} from "../pageSections/PhotoGallerySection/PhotoGalleryWrapper.tsx";
import {
  FAQsWrapperSlot,
  FAQsWrapperSlotProps,
} from "../pageSections/FAQsSection/FAQsWrapperSlot.tsx";
import { FAQSlot, FAQSlotProps } from "../pageSections/FAQsSection/FAQSlot.tsx";
import {
  TeamCardsWrapper,
  TeamCardsWrapperProps,
} from "../pageSections/TeamSection/TeamCardsWrapper.tsx";
import {
  TeamCard,
  TeamCardProps,
} from "../pageSections/TeamSection/TeamCard.tsx";
import {
  TestimonialCardsWrapper,
  TestimonialCardsWrapperProps,
} from "../pageSections/TestimonialSection/TestimonialCardsWrapper.tsx";
import {
  TestimonialCard,
  TestimonialCardProps,
} from "../pageSections/TestimonialSection/TestimonialCard.tsx";
import {
  FooterLogoSlot,
  FooterLogoSlotProps,
} from "../footer/FooterLogoSlot.tsx";
import {
  FooterSocialLinksSlot,
  FooterSocialLinksSlotProps,
} from "../footer/FooterSocialLinksSlot.tsx";
import {
  FooterUtilityImagesSlot,
  FooterUtilityImagesSlotProps,
} from "../footer/FooterUtilityImagesSlot.tsx";
import {
  FooterLinksSlot,
  FooterLinksSlotProps,
} from "../footer/FooterLinksSlot.tsx";
import {
  FooterExpandedLinkSectionSlot,
  FooterExpandedLinkSectionSlotProps,
} from "../footer/FooterExpandedLinkSectionSlot.tsx";
import {
  FooterExpandedLinksWrapper,
  FooterExpandedLinksWrapperProps,
} from "../footer/FooterExpandedLinksWrapper.tsx";
import {
  CopyrightMessageSlot,
  CopyrightMessageSlotProps,
} from "../footer/CopyrightMessageSlot.tsx";
import {
  SecondaryFooterSlot,
  SecondaryFooterSlotProps,
} from "../footer/SecondaryFooterSlot.tsx";
import {
  DirectoryCard,
  DirectoryCardProps,
} from "../directory/DirectoryCard.tsx";
import {
  DirectoryGrid,
  DirectoryGridProps,
} from "../directory/DirectoryWrapper.tsx";
import { Phone, PhoneProps } from "../contentBlocks/Phone.tsx";
import {
  BreadcrumbsSection,
  BreadcrumbsSectionProps,
} from "../pageSections/Breadcrumbs.tsx";
import {
  PrimaryHeaderSlot,
  PrimaryHeaderSlotProps,
} from "../header/PrimaryHeaderSlot.tsx";
import {
  SecondaryHeaderSlot,
  SecondaryHeaderSlotProps,
} from "../header/SecondaryHeaderSlot.tsx";
import { HeaderLinks, HeaderLinksProps } from "../header/HeaderLinks.tsx";

export interface SlotsCategoryProps {
  AddressSlot: AddressProps;
  BreadcrumbsSlot: BreadcrumbsSectionProps;
  BodyTextSlot: BodyTextProps;
  CopyrightMessageSlot: CopyrightMessageSlotProps;
  CTASlot: CTAWrapperProps;
  DirectoryCard: DirectoryCardProps;
  DirectoryGrid: DirectoryGridProps;
  EmailsSlot: EmailsProps;
  EventCard: EventCardProps;
  EventCardsWrapper: EventCardsWrapperProps;
  FAQsWrapperSlot: FAQsWrapperSlotProps;
  FAQSlot: FAQSlotProps;
  FooterExpandedLinkSectionSlot: FooterExpandedLinkSectionSlotProps;
  FooterExpandedLinksWrapper: FooterExpandedLinksWrapperProps;
  FooterLinksSlot: FooterLinksSlotProps;
  FooterLogoSlot: FooterLogoSlotProps;
  FooterSocialLinksSlot: FooterSocialLinksSlotProps;
  FooterUtilityImagesSlot: FooterUtilityImagesSlotProps;
  HeaderLinks: HeaderLinksProps;
  HeadingTextSlot: HeadingTextProps;
  HeroImageSlot: HeroImageProps;
  HoursStatusSlot: HoursStatusProps;
  HoursTableSlot: HoursTableProps;
  ImageSlot: ImageWrapperProps;
  InsightCardsWrapper: InsightCardsWrapperProps;
  InsightCard: InsightCardProps;
  NearbyLocationCardsWrapper: NearbyLocationCardsWrapperProps;
  PhoneNumbersSlot: PhoneListProps;
  PhoneSlot: PhoneProps;
  PhotoGalleryWrapper: PhotoGalleryWrapperProps;
  PrimaryHeaderSlot: PrimaryHeaderSlotProps;
  ProductCardsWrapper: ProductCardsWrapperProps;
  ProductCard: ProductCardProps;
  SecondaryFooterSlot: SecondaryFooterSlotProps;
  SecondaryHeaderSlot: SecondaryHeaderSlotProps;
  ServicesListSlot: TextListProps;
  TeamCard: TeamCardProps;
  TeamCardsWrapper: TeamCardsWrapperProps;
  TestimonialCard: TestimonialCardProps;
  TestimonialCardsWrapper: TestimonialCardsWrapperProps;
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

const ExpandedHeaderComponents = {
  HeaderLinks: { ...HeaderLinks, permissions: lockedPermissions },
  PrimaryHeaderSlot: { ...PrimaryHeaderSlot, permissions: lockedPermissions },
  SecondaryHeaderSlot: {
    ...SecondaryHeaderSlot,
    permissions: lockedPermissions,
  },
};

export const SlotsCategoryComponents = {
  AddressSlot: { ...Address, permissions: lockedPermissions },
  BodyTextSlot: { ...BodyText, permissions: lockedPermissions },
  BreadcrumbsSlot: { ...BreadcrumbsSection, permissions: lockedPermissions },
  CopyrightMessageSlot: {
    ...CopyrightMessageSlot,
    permissions: lockedPermissions,
  },
  CTASlot: { ...CTAWrapper, permissions: lockedPermissions },
  DirectoryCard: { ...DirectoryCard, permissions: lockedPermissions },
  DirectoryGrid: { ...DirectoryGrid, permissions: lockedPermissions },
  EmailsSlot: { ...Emails, permissions: lockedPermissions },
  EventCard: { ...EventCard, permissions: lockedPermissions },
  EventCardsWrapper: { ...EventCardsWrapper, permissions: lockedPermissions },
  ...ExpandedHeaderComponents,
  FAQsWrapperSlot: { ...FAQsWrapperSlot, permissions: lockedPermissions },
  FAQSlot: { ...FAQSlot, permissions: lockedPermissions },
  FooterExpandedLinkSectionSlot: {
    ...FooterExpandedLinkSectionSlot,
    permissions: lockedPermissions,
  },
  FooterExpandedLinksWrapper: {
    ...FooterExpandedLinksWrapper,
    permissions: lockedPermissions,
  },
  FooterLinksSlot: { ...FooterLinksSlot, permissions: lockedPermissions },
  FooterLogoSlot: { ...FooterLogoSlot, permissions: lockedPermissions },
  FooterSocialLinksSlot: {
    ...FooterSocialLinksSlot,
    permissions: lockedPermissions,
  },
  FooterUtilityImagesSlot: {
    ...FooterUtilityImagesSlot,
    permissions: lockedPermissions,
  },
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
  NearbyLocationCardsWrapper: {
    ...NearbyLocationCardsWrapper,
    permissions: lockedPermissions,
  },
  PhoneNumbersSlot: { ...PhoneList, permissions: lockedPermissions },
  PhoneSlot: { ...Phone, permissions: lockedPermissions },
  PhotoGalleryWrapper: {
    ...PhotoGalleryWrapper,
    permissions: lockedPermissions,
  },
  ProductCardsWrapper: {
    ...ProductCardsWrapper,
    permissions: lockedPermissions,
  },
  ProductCard: { ...ProductCard, permissions: lockedPermissions },
  SecondaryFooterSlot: {
    ...SecondaryFooterSlot,
    permissions: lockedPermissions,
  },
  ServicesListSlot: { ...ServicesList, permissions: lockedPermissions },
  TeamCard: { ...TeamCard, permissions: lockedPermissions },
  TeamCardsWrapper: { ...TeamCardsWrapper, permissions: lockedPermissions },
  TestimonialCard: { ...TestimonialCard, permissions: lockedPermissions },
  TestimonialCardsWrapper: {
    ...TestimonialCardsWrapper,
    permissions: lockedPermissions,
  },
  TextListSlot: { ...TextList, permissions: lockedPermissions },
  Timestamp: { ...Timestamp, permissions: lockedPermissions },
  VideoSlot: { ...Video, permissions: lockedPermissions },
};

export const SlotsCategory = Object.keys(
  SlotsCategoryComponents
) as (keyof SlotsCategoryProps)[];
