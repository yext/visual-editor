import { BannerSection, BannerSectionProps } from "../pageSections/Banner.tsx";
import {
  BreadcrumbsSection,
  BreadcrumbsSectionProps,
} from "../pageSections/Breadcrumbs.tsx";
import {
  CoreInfoSection,
  CoreInfoSectionProps,
} from "../pageSections/CoreInfoSection.tsx";
import {
  EventSection,
  EventSectionProps,
} from "../pageSections/EventSection.tsx";
import { HeroSection, HeroSectionProps } from "../pageSections/HeroSection.tsx";
import {
  InsightSectionProps,
  InsightSection,
} from "../pageSections/InsightSection.tsx";
import {
  NearbyLocationsSection,
  NearbyLocationsSectionProps,
} from "../pageSections/NearbyLocations.tsx";
import {
  ProductSection,
  ProductSectionProps,
} from "../pageSections/ProductSection.tsx";
import {
  PromoSection,
  PromoSectionProps,
} from "../pageSections/PromoSection.tsx";
import {
  PhotoGallerySection,
  PhotoGallerySectionProps,
} from "../pageSections/PhotoGallerySection.tsx";
import { FAQSection, FAQSectionProps } from "../pageSections/FAQsSection.tsx";
import {
  ReviewsSection,
  ReviewsSectionProps,
} from "../pageSections/ReviewsSection.tsx";
import {
  TestimonialSection,
  TestimonialSectionProps,
} from "../pageSections/TestimonialSection.tsx";
import { TeamSection, TeamSectionProps } from "../pageSections/TeamSection.tsx";
import {
  StaticMapSection,
  StaticMapSectionProps,
} from "../pageSections/StaticMapSection.tsx";
import {
  VideoSection,
  VideoSectionProps,
} from "../pageSections/VideoSection.tsx";
import { SlotHero, SlotHeroProps } from "../pageSections/SlotHero.tsx";

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
  VideoSection: VideoSectionProps;
  SlotHero: SlotHeroProps;
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
  VideoSection,
  SlotHero,
};

export const PageSectionCategory = Object.keys(
  PageSectionCategoryComponents
) as (keyof PageSectionCategoryProps)[];
