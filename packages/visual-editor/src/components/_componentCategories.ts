import { BannerSection, BannerSectionProps } from "./pageSections/Banner.tsx";
import {
  BreadcrumbsSection,
  BreadcrumbsSectionProps,
} from "./pageSections/Breadcrumbs.tsx";
import {
  CoreInfoSection,
  CoreInfoSectionProps,
} from "./pageSections/CoreInfoSection.tsx";
import { HeroSection, HeroSectionProps } from "./pageSections/HeroSection.tsx";
import {
  NearbyLocationsSection,
  NearbyLocationsSectionProps,
} from "./pageSections/NearbyLocations.tsx";
import { PromoSection, PromoSectionProps } from "./pageSections/Promo.tsx";
import {
  PhotoGallerySection,
  PhotoGallerySectionProps,
} from "./pageSections/PhotoGallerySection.tsx";
import { FAQsSection, FAQsSectionProps } from "./pageSections/FAQs.tsx";
import {
  SectionContainer,
  SectionContainerProps,
} from "./pageSections/SectionContainer.tsx";
import {
  EventSection,
  EventSectionProps,
} from "./pageSections/EventSection.tsx";
import { Collection, CollectionProps } from "./layoutBlocks/Collection.tsx";
import { Flex, FlexProps } from "./layoutBlocks/Flex.tsx";
import { Grid, GridProps } from "./layoutBlocks/Grid.tsx";
import { ProductCard, ProductCardProps } from "./cards/ProductCard.tsx";
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
import { Header, HeaderProps } from "./Header.tsx";
import { Footer, FooterProps } from "./Footer.tsx";
import { Directory, DirectoryProps } from "./Directory.tsx";
import { InsightCardProps, InsightCard } from "./cards/InsightCard.tsx";
import { PersonCardProps, PersonCard } from "./cards/PersonCard.tsx";
import {
  TestimonialCardProps,
  TestimonialCard,
} from "./cards/TestimonialCard.tsx";

export interface PageSectionCategoryProps {
  BreadcrumbsSection: BreadcrumbsSectionProps;
  HeroSection: HeroSectionProps;
  CoreInfoSection: CoreInfoSectionProps;
  NearbyLocationsSection: NearbyLocationsSectionProps;
  BannerSection: BannerSectionProps;
  PromoSection: PromoSectionProps;
  PhotoGallerySection: PhotoGallerySectionProps;
  FAQsSection: FAQsSectionProps;
  EventSection: EventSectionProps;
  SectionContainer: SectionContainerProps;
}

export const PageSectionCategoryComponents = {
  BreadcrumbsSection,
  HeroSection,
  CoreInfoSection,
  NearbyLocationsSection,
  BannerSection,
  PromoSection,
  PhotoGallerySection,
  FAQsSection,
  EventSection,
  SectionContainer,
};

export const PageSectionCategory = Object.keys(
  PageSectionCategoryComponents
) as (keyof PageSectionCategoryProps)[];

export interface LayoutBlockCategoryProps {
  Collection: CollectionProps;
  Flex: FlexProps;
  Grid: GridProps;
}

export const LayoutBlockCategoryComponents = {
  Collection,
  Flex,
  Grid,
};

export const LayoutBlockCategory = Object.keys(
  LayoutBlockCategoryComponents
) as (keyof LayoutBlockCategoryProps)[];

export interface CardCategoryProps {
  InsightCard: InsightCardProps;
  PersonCard: PersonCardProps;
  ProductCard: ProductCardProps;
  TestimonialCard: TestimonialCardProps;
}

export const CardCategoryComponents = {
  InsightCard,
  PersonCard,
  ProductCard,
  TestimonialCard,
};

export const CardCategory = Object.keys(
  CardCategoryComponents
) as (keyof CardCategoryProps)[];

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
