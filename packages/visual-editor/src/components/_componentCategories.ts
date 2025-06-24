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
import { Footer, FooterProps } from "./Footer.tsx";
import { Directory, DirectoryProps } from "./Directory.tsx";
import { LocatorComponent, LocatorProps } from "./Locator.tsx";
import { Reviews, ReviewsProps } from "./Reviews.tsx";
import {
  StaticMapSection,
  StaticMapSectionProps,
} from "./pageSections/StaticMapSection.tsx";

export interface PageSectionCategoryProps {
  BreadcrumbsSection: BreadcrumbsSectionProps;
  HeroSection: HeroSectionProps;
  EventSection: EventSectionProps;
  CoreInfoSection: CoreInfoSectionProps;
  InsightSection: InsightSectionProps;
  NearbyLocationsSection: NearbyLocationsSectionProps;
  BannerSection: BannerSectionProps;
  ProductSection: ProductSectionProps;
  PromoSection: PromoSectionProps;
  PhotoGallerySection: PhotoGallerySectionProps;
  TeamSection: TeamSectionProps;
  FAQSection: FAQSectionProps;
  StaticMapSection: StaticMapSectionProps;
  TestimonialSection: TestimonialSectionProps;
}

export const PageSectionCategoryComponents = {
  BreadcrumbsSection,
  HeroSection,
  CoreInfoSection,
  NearbyLocationsSection,
  BannerSection,
  PhotoGallerySection,
  StaticMapSection,
  EventSection,
  FAQSection,
  InsightSection,
  ProductSection,
  PromoSection,
  TeamSection,
  TestimonialSection,
};

export const PageSectionCategory = Object.keys(
  PageSectionCategoryComponents
) as (keyof PageSectionCategoryProps)[];

export interface OtherCategoryProps {
  Header: HeaderProps;
  Footer: FooterProps;
}

export const OtherCategoryComponents = {
  Header,
  Footer,
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

export interface ReviewsCategoryProps {
  Reviews: ReviewsProps;
}

export const ReviewsCategoryComponents = {
  Reviews,
};

export const ReviewsCategory = Object.keys(
  ReviewsCategoryComponents
) as (keyof ReviewsCategoryProps)[];

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
