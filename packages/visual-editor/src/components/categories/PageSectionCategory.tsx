import {
  AboutSection,
  AboutSectionProps,
} from "../pageSections/AboutSection/AboutSection.tsx";
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
import {
  ClassicSearchComponent,
  ClassicSearchProps,
} from "../pageSections/index.ts";
import {
  SearchComponentProps,
  SearchComponent,
} from "../pageSections/SearchSection/Search.tsx";
import {
  CustomDirectoryComponent,
  CustomDirectoryProps,
} from "../pageSections/CustomDirectory/CustomDirectory.tsx";
import {
  CustomBreadcrumbs,
  CustomBreadcrumbsProps,
} from "../pageSections/CustomBreadcrumbs.tsx";

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
  ProfessionalHeroSection: ProfessionalHeroSectionProps;
  PromoSection: PromoSectionProps;
  ReviewsSection: ReviewsSectionProps;
  StaticMapSection: StaticMapSectionProps;
  TeamSection: TeamSectionProps;
  TestimonialSection: TestimonialSectionProps;
  VideoSection: VideoSectionProps;
  ClassicSearchComponent: ClassicSearchProps;
  SearchComponent: SearchComponentProps;
  CustomDirectoryComponent: CustomDirectoryProps;
  CustomBreadcrumbs: CustomBreadcrumbsProps;
}

export const PageSectionCategoryComponents = {
  AboutSection,
  BannerSection,
  BreadcrumbsSection,
  CoreInfoSection,
  CustomBreadcrumbs,
  CustomDirectoryComponent,
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
  ClassicSearchComponent,
  SearchComponent,
};

export const PageSectionCategory = Object.keys(
  PageSectionCategoryComponents
) as (keyof PageSectionCategoryProps)[];
