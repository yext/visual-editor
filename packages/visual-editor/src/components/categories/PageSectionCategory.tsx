import { AboutSection, AboutSectionProps } from "../pageSections/index.ts";
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
} from "../pageSections/EventSection/EventSection.tsx";
import { HeroSection, HeroSectionProps } from "../pageSections/HeroSection.tsx";
import {
  InsightSection,
  InsightSectionProps,
} from "../pageSections/InsightSection/InsightSection.tsx";
import {
  NearbyLocationsSection,
  NearbyLocationsSectionProps,
} from "../pageSections/NearbyLocations/NearbyLocations.tsx";
import {
  ProductSection,
  ProductSectionProps,
} from "../pageSections/ProductSection/ProductSection.tsx";
import {
  PromoSection,
  PromoSectionProps,
} from "../pageSections/PromoSection/PromoSection.tsx";
import {
  PhotoGallerySection,
  PhotoGallerySectionProps,
} from "../pageSections/PhotoGallerySection/PhotoGallerySection.tsx";
import {
  FAQSection,
  FAQSectionProps,
} from "../pageSections/FAQsSection/FAQsSection.tsx";
import {
  ReviewsSection,
  ReviewsSectionProps,
} from "../pageSections/ReviewsSection/ReviewsSection.tsx";
import {
  TestimonialSection,
  TestimonialSectionProps,
} from "../pageSections/TestimonialSection/TestimonialSection.tsx";
import {
  TeamSection,
  TeamSectionProps,
} from "../pageSections/TeamSection/TeamSection.tsx";
import {
  StaticMapSection,
  StaticMapSectionProps,
} from "../pageSections/StaticMapSection.tsx";
import {
  VideoSection,
  VideoSectionProps,
} from "../pageSections/VideoSection.tsx";
import {
  ProfessionalHeroSection,
  ProfessionalHeroSectionProps,
} from "../pageSections/ProfessionalHeroSection.tsx";

export interface PageSectionCategoryProps {
  AboutSection: AboutSectionProps;
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
  ProfessionalHeroSection: ProfessionalHeroSectionProps;
  ReviewsSection: ReviewsSectionProps;
  StaticMapSection: StaticMapSectionProps;
  TeamSection: TeamSectionProps;
  TestimonialSection: TestimonialSectionProps;
  VideoSection: VideoSectionProps;
}

export const PageSectionCategoryComponents = {
  AboutSection,
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
  ProfessionalHeroSection,
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
