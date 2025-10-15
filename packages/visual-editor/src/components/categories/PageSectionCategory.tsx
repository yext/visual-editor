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
  InsightSection,
  InsightSectionProps,
} from "../pageSections/InsightSection.tsx";
import {
  NearbyLocationsSection,
  NearbyLocationsSectionProps,
} from "../pageSections/NearbyLocations.tsx";
import {
  ProductSection,
  ProductSectionProps,
} from "../pageSections/ProductSection/ProductSection.tsx";
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
};

export const PageSectionCategory = Object.keys(
  PageSectionCategoryComponents
) as (keyof PageSectionCategoryProps)[];
