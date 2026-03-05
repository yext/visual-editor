import {
  YetiExploreCarouselSection,
  YetiExploreCarouselSectionProps,
} from "../custom/yeti/components/YetiExploreCarouselSection.tsx";
import {
  YetiFaqSection,
  YetiFaqSectionProps,
} from "../custom/yeti/components/YetiFaqSection.tsx";
import {
  YetiFooterSection,
  YetiFooterSectionProps,
} from "../custom/yeti/components/YetiFooterSection.tsx";
import {
  YetiHeaderSection,
  YetiHeaderSectionProps,
} from "../custom/yeti/components/YetiHeaderSection.tsx";
import {
  YetiLocationHeroSection,
  YetiLocationHeroSectionProps,
} from "../custom/yeti/components/YetiLocationHeroSection.tsx";
import {
  YetiPromoBannerSection,
  YetiPromoBannerSectionProps,
} from "../custom/yeti/components/YetiPromoBannerSection.tsx";
import {
  YetiStoreInfoSection,
  YetiStoreInfoSectionProps,
} from "../custom/yeti/components/YetiStoreInfoSection.tsx";

export interface YetiSectionsCategoryProps {
  YetiHeaderSection: YetiHeaderSectionProps;
  YetiLocationHeroSection: YetiLocationHeroSectionProps;
  YetiStoreInfoSection: YetiStoreInfoSectionProps;
  YetiPromoBannerSection: YetiPromoBannerSectionProps;
  YetiExploreCarouselSection: YetiExploreCarouselSectionProps;
  YetiFaqSection: YetiFaqSectionProps;
  YetiFooterSection: YetiFooterSectionProps;
}

export const YetiSectionsCategoryComponents = {
  YetiHeaderSection,
  YetiLocationHeroSection,
  YetiStoreInfoSection,
  YetiPromoBannerSection,
  YetiExploreCarouselSection,
  YetiFaqSection,
  YetiFooterSection,
};

export const YetiSectionsCategory = Object.keys(
  YetiSectionsCategoryComponents
) as (keyof YetiSectionsCategoryProps)[];
