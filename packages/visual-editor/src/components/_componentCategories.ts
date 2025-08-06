import { BannerSection, BannerSectionProps } from "./pageSections/Banner.tsx";
import {
  BreadcrumbsSection,
  BreadcrumbsSectionProps,
} from "./pageSections/Breadcrumbs.tsx";
import {
  CoreInfoSection,
  CoreInfoSectionProps,
} from "./pageSections/CoreInfoSection.tsx";
import {
  EventSection,
  EventSectionProps,
} from "./pageSections/EventSection.tsx";
import { HeroSection, HeroSectionProps } from "./pageSections/HeroSection.tsx";
import {
  InsightSectionProps,
  InsightSection,
} from "./pageSections/InsightSection.tsx";
import {
  NearbyLocationsSection,
  NearbyLocationsSectionProps,
} from "./pageSections/NearbyLocations.tsx";
import {
  ProductSection,
  ProductSectionProps,
} from "./pageSections/ProductSection.tsx";
import {
  PromoSection,
  PromoSectionProps,
} from "./pageSections/PromoSection.tsx";
import {
  PhotoGallerySection,
  PhotoGallerySectionProps,
} from "./pageSections/PhotoGallerySection.tsx";
import { FAQSection, FAQSectionProps } from "./pageSections/FAQsSection.tsx";
import {
  ReviewsSection,
  ReviewsSectionProps,
} from "./pageSections/ReviewsSection.tsx";
import {
  TestimonialSection,
  TestimonialSectionProps,
} from "./pageSections/TestimonialSection.tsx";
import { TeamSection, TeamSectionProps } from "./pageSections/TeamSection.tsx";
import { Flex, FlexProps } from "./layoutBlocks/Flex.tsx";
import { Grid, GridProps } from "./layoutBlocks/Grid.tsx";
import { Address, AddressProps } from "./contentBlocks/Address.tsx";
import { BodyText, BodyTextProps } from "./contentBlocks/BodyText.tsx";
import { CTAWrapper, CTAWrapperProps } from "./contentBlocks/CtaWrapper.tsx";
import { Emails, EmailsProps } from "./contentBlocks/Emails.tsx";
import {
  GetDirections,
  GetDirectionsProps,
} from "./contentBlocks/GetDirections.tsx";
import { HeadingText, HeadingTextProps } from "./contentBlocks/HeadingText.tsx";
import { HoursTable, HoursTableProps } from "./contentBlocks/HoursTable.tsx";
import { HoursStatus, HoursStatusProps } from "./contentBlocks/HoursStatus.tsx";
import { ImageWrapper, ImageWrapperProps } from "./contentBlocks/Image.tsx";
import {
  MapboxStaticMap,
  MapboxStaticProps,
} from "./contentBlocks/MapboxStaticMap.tsx";
import { Phone, PhoneProps } from "./contentBlocks/Phone.tsx";
import { TextList, TextListProps } from "./contentBlocks/TextList.tsx";
import { Header, HeaderProps } from "./header/Header.tsx";
import {
  ExpandedHeader,
  ExpandedHeaderProps,
} from "./header/ExpandedHeader.tsx";
import { Footer, FooterProps } from "./footer/Footer.tsx";
import { Directory, DirectoryProps } from "./Directory.tsx";
import { LocatorComponent, LocatorProps } from "./Locator.tsx";
import {
  StaticMapSection,
  StaticMapSectionProps,
} from "./pageSections/StaticMapSection.tsx";
import {
  ExpandedFooter,
  ExpandedFooterProps,
} from "./footer/ExpandedFooter.tsx";
import {
  CustomCodeSection,
  CustomCodeSectionProps,
} from "./CustomCodeSection.tsx";

export interface PageSectionCategoryProps {
  BannerSection: BannerSectionProps;
  BreadcrumbsSection: BreadcrumbsSectionProps;
  CoreInfoSection: CoreInfoSectionProps;
  EventSection: EventSectionProps;
  FAQSection: FAQSectionProps;
  HeroSection: HeroSectionProps;
  InsightSection: InsightSectionProps;
  NearbyLocationsSection: NearbyLocationsSectionProps;
  PhotoGallerySection: PhotoGallerySectionProps;
  ProductSection: ProductSectionProps;
  PromoSection: PromoSectionProps;
  ReviewsSection: ReviewsSectionProps;
  StaticMapSection: StaticMapSectionProps;
  TeamSection: TeamSectionProps;
  TestimonialSection: TestimonialSectionProps;
}

export const PageSectionCategoryComponents = {
  BannerSection,
  BreadcrumbsSection,
  CoreInfoSection,
  EventSection,
  FAQSection,
  HeroSection,
  InsightSection,
  NearbyLocationsSection,
  PhotoGallerySection,
  ProductSection,
  PromoSection,
  ReviewsSection,
  StaticMapSection,
  TeamSection,
  TestimonialSection,
};

export const PageSectionCategory = Object.keys(
  PageSectionCategoryComponents
) as (keyof PageSectionCategoryProps)[];

export interface OtherCategoryProps {
  ExpandedHeader: ExpandedHeaderProps;
  ExpandedFooter: ExpandedFooterProps;
  CustomCodeSection: CustomCodeSectionProps;
}

export const OtherCategoryComponents = {
  ExpandedHeader,
  ExpandedFooter,
  CustomCodeSection,
};

export const OtherCategory = Object.keys(
  OtherCategoryComponents
) as (keyof OtherCategoryProps)[];

export interface DirectoryCategoryProps {
  Directory: DirectoryProps;
}

export const DirectoryCategoryComponents = {
  Directory,
};

export const DirectoryCategory = Object.keys(
  DirectoryCategoryComponents
) as (keyof DirectoryCategoryProps)[];

export interface LocatorCategoryProps {
  Locator: LocatorProps;
}

export const LocatorCategoryComponents = {
  Locator: LocatorComponent,
};

export const LocatorCategory = Object.keys(
  LocatorCategoryComponents
) as (keyof LocatorCategoryProps)[];

export interface AdvancedCoreInfoCategoryProps {
  Grid: GridProps;
  Address: AddressProps;
  BodyText: BodyTextProps;
  CTAWrapper: CTAWrapperProps;
  Emails: EmailsProps;
  GetDirections: GetDirectionsProps;
  HeadingText: HeadingTextProps;
  HoursTable: HoursTableProps;
  HoursStatus: HoursStatusProps;
  ImageWrapper: ImageWrapperProps;
  MapboxStaticMap: MapboxStaticProps;
  Phone: PhoneProps;
  TextList: TextListProps;
}

export const AdvancedCoreInfoCategoryComponents = {
  Grid,
  Address,
  BodyText,
  CTAWrapper,
  Emails,
  GetDirections,
  HeadingText,
  HoursStatus,
  HoursTable,
  ImageWrapper,
  MapboxStaticMap,
  Phone,
  TextList,
};

export const AdvancedCoreInfoCategory = Object.keys(
  AdvancedCoreInfoCategoryComponents
) as (keyof AdvancedCoreInfoCategoryProps)[];

export interface DeprecatedCategoryProps {
  Header: HeaderProps;
  Footer: FooterProps;
}

export const DeprecatedCategoryComponents = {
  Header,
  Footer,
};

export const DeprecatedCategory = Object.keys(
  DeprecatedCategoryComponents
) as (keyof DeprecatedCategoryProps)[];

/** THE CATEGORIES BELOW ARE NO LONGER SUPPORTED */

export interface LayoutBlockCategoryProps {
  Flex: FlexProps;
  Grid: GridProps;
}

export const LayoutBlockCategoryComponents = {
  Flex,
  Grid,
};

export const LayoutBlockCategory = Object.keys(
  LayoutBlockCategoryComponents
) as (keyof LayoutBlockCategoryProps)[];

export interface ContentBlockCategoryProps {
  Address: AddressProps;
  BodyText: BodyTextProps;
  CTAWrapper: CTAWrapperProps;
  Emails: EmailsProps;
  GetDirections: GetDirectionsProps;
  HeadingText: HeadingTextProps;
  HoursTable: HoursTableProps;
  HoursStatus: HoursStatusProps;
  ImageWrapper: ImageWrapperProps;
  MapboxStaticMap: MapboxStaticProps;
  Phone: PhoneProps;
  TextList: TextListProps;
}

export const ContentBlockCategoryComponents = {
  Address,
  BodyText,
  CTAWrapper,
  Emails,
  GetDirections,
  HeadingText,
  HoursStatus,
  HoursTable,
  ImageWrapper,
  MapboxStaticMap,
  Phone,
  TextList,
};

export const ContentBlockCategory = Object.keys(
  ContentBlockCategoryComponents
) as (keyof ContentBlockCategoryProps)[];
