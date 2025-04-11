import { BannerSection, BannerSectionProps } from "./Banner.tsx";
import { BreadcrumbsSection, BreadcrumbsSectionProps } from "./Breadcrumbs.tsx";
import { CoreInfoSection, CoreInfoSectionProps } from "./CoreInfoSection.tsx";
import { HeroSection, HeroSectionProps } from "./HeroSection.tsx";
import {
  NearbyLocationsSection,
  NearbyLocationsSectionProps,
} from "./NearbyLocations.tsx";
import { PromoSection, PromoSectionProps } from "./Promo.tsx";
import {
  PhotoGallerySection,
  PhotoGallerySectionProps,
} from "./PhotoGallerySection.tsx";
import { FAQsSection, FAQsSectionProps } from "./FAQs.tsx";
import {
  SectionContainer,
  SectionContainerProps,
} from "./SectionContainer.tsx";
import { Collection, CollectionProps } from "./Collection.tsx";
import { Flex, FlexProps } from "./Flex.tsx";
import { Grid, GridProps } from "./Grid.tsx";
import { ProductCard, ProductCardProps } from "./cards/ProductCard.tsx";
import { Address, AddressProps } from "./Address.tsx";
import { BodyText, BodyTextProps } from "./BodyText.tsx";
import { CTAWrapper, CTAWrapperProps } from "./CtaWrapper.tsx";
import { Emails, EmailsProps } from "./Emails.tsx";
import { GetDirections, GetDirectionsProps } from "./GetDirections.tsx";
import { HoursTable, HoursTableProps } from "./HoursTable.tsx";
import { HoursStatus, HoursStatusProps } from "./HoursStatus.tsx";
import { ImageWrapper, ImageWrapperProps } from "./Image.tsx";
import { MapboxStaticMap, MapboxStaticProps } from "./MapboxStaticMap.tsx";
import { Phone, PhoneProps } from "./Phone.tsx";
import { TextList, TextListProps } from "./TextList.tsx";
import { Header, HeaderProps } from "./Header.tsx";
import { Footer, FooterProps } from "./Footer.tsx";
import { Directory, DirectoryProps } from "./Directory.tsx";
import { EventCardProps, EventCard } from "./cards/EventCard.tsx";
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
  EventCard: EventCardProps;
  InsightCard: InsightCardProps;
  PersonCard: PersonCardProps;
  ProductCard: ProductCardProps;
  TestimonialCard: TestimonialCardProps;
}

export const CardCategoryComponents = {
  EventCard,
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
  HoursTable,
  HoursStatus,
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
