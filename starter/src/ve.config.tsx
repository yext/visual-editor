import { type Config } from "@puckeditor/core";
import "@yext/visual-editor/style.css";
import "./index.css";
import {
  DirectoryCategory,
  DirectoryCategoryComponents,
  DirectoryCategoryProps,
  MainConfigProps,
  mainConfig,
} from "@yext/visual-editor";
import {
  FriendlyFacesAboutSection,
  FriendlyFacesAboutSectionProps,
} from "./registry/friendly-faces/components/FriendlyFacesAboutSection";
import {
  FriendlyFacesCoreInfoSection,
  FriendlyFacesCoreInfoSectionProps,
} from "./registry/friendly-faces/components/FriendlyFacesCoreInfoSection";
import {
  FriendlyFacesFaqSection,
  FriendlyFacesFaqSectionProps,
} from "./registry/friendly-faces/components/FriendlyFacesFaqSection";
import {
  FriendlyFacesFooterSection,
  FriendlyFacesFooterSectionProps,
} from "./registry/friendly-faces/components/FriendlyFacesFooterSection";
import {
  FriendlyFacesHeaderSection,
  FriendlyFacesHeaderSectionProps,
} from "./registry/friendly-faces/components/FriendlyFacesHeaderSection";
import {
  FriendlyFacesHeroSection,
  FriendlyFacesHeroSectionProps,
} from "./registry/friendly-faces/components/FriendlyFacesHeroSection";
import {
  FriendlyFacesPromoSection,
  FriendlyFacesPromoSectionProps,
} from "./registry/friendly-faces/components/FriendlyFacesPromoSection";
import {
  FriendlyFacesReviewsSection,
  FriendlyFacesReviewsSectionProps,
} from "./registry/friendly-faces/components/FriendlyFacesReviewsSection";
import {
  FriendlyFacesServicesSection,
  FriendlyFacesServicesSectionProps,
} from "./registry/friendly-faces/components/FriendlyFacesServicesSection";
import {
  ModernEraAboutSection,
  ModernEraAboutSectionProps,
} from "./registry/modern-era/components/ModernEraAboutSection";
import {
  ModernEraClientReviewsSection,
  ModernEraClientReviewsSectionProps,
} from "./registry/modern-era/components/ModernEraClientReviewsSection";
import {
  ModernEraCoreInfoSection,
  ModernEraCoreInfoSectionProps,
} from "./registry/modern-era/components/ModernEraCoreInfoSection";
import {
  ModernEraFaqSection,
  ModernEraFaqSectionProps,
} from "./registry/modern-era/components/ModernEraFaqSection";
import {
  ModernEraFooterSection,
  ModernEraFooterSectionProps,
} from "./registry/modern-era/components/ModernEraFooterSection";
import {
  ModernEraHeaderSection,
  ModernEraHeaderSectionProps,
} from "./registry/modern-era/components/ModernEraHeaderSection";
import {
  ModernEraHeroSection,
  ModernEraHeroSectionProps,
} from "./registry/modern-era/components/ModernEraHeroSection";
import {
  ModernEraRetirementPathsSection,
  ModernEraRetirementPathsSectionProps,
} from "./registry/modern-era/components/ModernEraRetirementPathsSection";
import {
  ModernEraWorkshopPromoSection,
  ModernEraWorkshopPromoSectionProps,
} from "./registry/modern-era/components/ModernEraWorkshopPromoSection";
import {
  RuggedUtilityCoreInfoSection,
  RuggedUtilityCoreInfoSectionProps,
} from "./registry/rugged-utility/components/RuggedUtilityCoreInfoSection";
import {
  RuggedUtilityFaqSection,
  RuggedUtilityFaqSectionProps,
} from "./registry/rugged-utility/components/RuggedUtilityFaqSection";
import {
  RuggedUtilityFeaturedDepartmentsSection,
  RuggedUtilityFeaturedDepartmentsSectionProps,
} from "./registry/rugged-utility/components/RuggedUtilityFeaturedDepartmentsSection";
import {
  RuggedUtilityFooterSection,
  RuggedUtilityFooterSectionProps,
} from "./registry/rugged-utility/components/RuggedUtilityFooterSection";
import {
  RuggedUtilityHeaderSection,
  RuggedUtilityHeaderSectionProps,
} from "./registry/rugged-utility/components/RuggedUtilityHeaderSection";
import {
  RuggedUtilityHeroSection,
  RuggedUtilityHeroSectionProps,
} from "./registry/rugged-utility/components/RuggedUtilityHeroSection";
import {
  RuggedUtilityNearbyLocationsSection,
  RuggedUtilityNearbyLocationsSectionProps,
} from "./registry/rugged-utility/components/RuggedUtilityNearbyLocationsSection";
import {
  RuggedUtilityRouteBoardPromoSection,
  RuggedUtilityRouteBoardPromoSectionProps,
} from "./registry/rugged-utility/components/RuggedUtilityRouteBoardPromoSection";
import {
  RuggedUtilityStoreBannerSection,
  RuggedUtilityStoreBannerSectionProps,
} from "./registry/rugged-utility/components/RuggedUtilityStoreBannerSection";
import {
  NaturallyGroundedAboutSection,
  NaturallyGroundedAboutSectionProps,
} from "./registry/naturally-grounded/components/NaturallyGroundedAboutSection";
import {
  NaturallyGroundedCoreInfoSection,
  NaturallyGroundedCoreInfoSectionProps,
} from "./registry/naturally-grounded/components/NaturallyGroundedCoreInfoSection";
import {
  NaturallyGroundedFeaturedDepartmentsSection,
  NaturallyGroundedFeaturedDepartmentsSectionProps,
} from "./registry/naturally-grounded/components/NaturallyGroundedFeaturedDepartmentsSection";
import {
  NaturallyGroundedFooterSection,
  NaturallyGroundedFooterSectionProps,
} from "./registry/naturally-grounded/components/NaturallyGroundedFooterSection";
import {
  NaturallyGroundedHeaderSection,
  NaturallyGroundedHeaderSectionProps,
} from "./registry/naturally-grounded/components/NaturallyGroundedHeaderSection";
import {
  NaturallyGroundedHeroSection,
  NaturallyGroundedHeroSectionProps,
} from "./registry/naturally-grounded/components/NaturallyGroundedHeroSection";
import {
  NaturallyGroundedNearbyLocationsSection,
  NaturallyGroundedNearbyLocationsSectionProps,
} from "./registry/naturally-grounded/components/NaturallyGroundedNearbyLocationsSection";
import {
  NaturallyGroundedPromoSection,
  NaturallyGroundedPromoSectionProps,
} from "./registry/naturally-grounded/components/NaturallyGroundedPromoSection";
import {
  NaturallyGroundedReviewsSection,
  NaturallyGroundedReviewsSectionProps,
} from "./registry/naturally-grounded/components/NaturallyGroundedReviewsSection";
import {
  NaturallyGroundedStoreUpdateBannerSection,
  NaturallyGroundedStoreUpdateBannerSectionProps,
} from "./registry/naturally-grounded/components/NaturallyGroundedStoreUpdateBannerSection";
import {
  CoolRunningCoreInfoSection,
  CoolRunningCoreInfoSectionProps,
} from "./registry/cool-running/components/CoolRunningCoreInfoSection";
import {
  CoolRunningDetailsSection,
  CoolRunningDetailsSectionProps,
} from "./registry/cool-running/components/CoolRunningDetailsSection";
import {
  CoolRunningFaqSection,
  CoolRunningFaqSectionProps,
} from "./registry/cool-running/components/CoolRunningFaqSection";
import {
  CoolRunningFooterSection,
  CoolRunningFooterSectionProps,
} from "./registry/cool-running/components/CoolRunningFooterSection";
import {
  CoolRunningHeaderSection,
  CoolRunningHeaderSectionProps,
} from "./registry/cool-running/components/CoolRunningHeaderSection";
import {
  CoolRunningHeroSection,
  CoolRunningHeroSectionProps,
} from "./registry/cool-running/components/CoolRunningHeroSection";
import {
  CoolRunningNearbyLocationsSection,
  CoolRunningNearbyLocationsSectionProps,
} from "./registry/cool-running/components/CoolRunningNearbyLocationsSection";
import {
  CoolRunningUpdateBannerSection,
  CoolRunningUpdateBannerSectionProps,
} from "./registry/cool-running/components/CoolRunningUpdateBannerSection";
import {
  FormalFinderAboutSection,
  FormalFinderAboutSectionProps,
} from "./registry/formal-finder/components/FormalFinderAboutSection";
import {
  FormalFinderCoreInfoSection,
  FormalFinderCoreInfoSectionProps,
} from "./registry/formal-finder/components/FormalFinderCoreInfoSection";
import {
  FormalFinderFaqSection,
  FormalFinderFaqSectionProps,
} from "./registry/formal-finder/components/FormalFinderFaqSection";
import {
  FormalFinderFooterSection,
  FormalFinderFooterSectionProps,
} from "./registry/formal-finder/components/FormalFinderFooterSection";
import {
  FormalFinderHeaderSection,
  FormalFinderHeaderSectionProps,
} from "./registry/formal-finder/components/FormalFinderHeaderSection";
import {
  FormalFinderHeroSection,
  FormalFinderHeroSectionProps,
} from "./registry/formal-finder/components/FormalFinderHeroSection";
import {
  FormalFinderReviewsSection,
  FormalFinderReviewsSectionProps,
} from "./registry/formal-finder/components/FormalFinderReviewsSection";
import {
  FormalFinderServicesSection,
  FormalFinderServicesSectionProps,
} from "./registry/formal-finder/components/FormalFinderServicesSection";
import {
  HereForYouAboutSection,
  HereForYouAboutSectionProps,
} from "./registry/here-for-you/components/HereForYouAboutSection";
import {
  HereForYouCoreInfoSection,
  HereForYouCoreInfoSectionProps,
} from "./registry/here-for-you/components/HereForYouCoreInfoSection";
import {
  HereForYouFooterSection,
  HereForYouFooterSectionProps,
} from "./registry/here-for-you/components/HereForYouFooterSection";
import {
  HereForYouHeaderSection,
  HereForYouHeaderSectionProps,
} from "./registry/here-for-you/components/HereForYouHeaderSection";
import {
  HereForYouHeroSection,
  HereForYouHeroSectionProps,
} from "./registry/here-for-you/components/HereForYouHeroSection";
import {
  HereForYouPromoSection,
  HereForYouPromoSectionProps,
} from "./registry/here-for-you/components/HereForYouPromoSection";
import {
  HereForYouReviewsSection,
  HereForYouReviewsSectionProps,
} from "./registry/here-for-you/components/HereForYouReviewsSection";
import {
  CoastalCareAboutSection,
  CoastalCareAboutSectionProps,
} from "./registry/coastal-care/components/CoastalCareAboutSection";
import {
  CoastalCareCoreInfoSection,
  CoastalCareCoreInfoSectionProps,
} from "./registry/coastal-care/components/CoastalCareCoreInfoSection";
import {
  CoastalCareFaqSection,
  CoastalCareFaqSectionProps,
} from "./registry/coastal-care/components/CoastalCareFaqSection";
import {
  CoastalCareFooterSection,
  CoastalCareFooterSectionProps,
} from "./registry/coastal-care/components/CoastalCareFooterSection";
import {
  CoastalCareHeaderSection,
  CoastalCareHeaderSectionProps,
} from "./registry/coastal-care/components/CoastalCareHeaderSection";
import {
  CoastalCareHeroSection,
  CoastalCareHeroSectionProps,
} from "./registry/coastal-care/components/CoastalCareHeroSection";
import {
  CoastalCareReviewsSection,
  CoastalCareReviewsSectionProps,
} from "./registry/coastal-care/components/CoastalCareReviewsSection";
import {
  CoastalCareServicesSection,
  CoastalCareServicesSectionProps,
} from "./registry/coastal-care/components/CoastalCareServicesSection";
import {
  WelcomeInAboutSection,
  WelcomeInAboutSectionProps,
} from "./registry/welcome-in/components/WelcomeInAboutSection";
import {
  WelcomeInCoreInfoSection,
  WelcomeInCoreInfoSectionProps,
} from "./registry/welcome-in/components/WelcomeInCoreInfoSection";
import {
  WelcomeInFeaturedShelvesSection,
  WelcomeInFeaturedShelvesSectionProps,
} from "./registry/welcome-in/components/WelcomeInFeaturedShelvesSection";
import {
  WelcomeInFooterSection,
  WelcomeInFooterSectionProps,
} from "./registry/welcome-in/components/WelcomeInFooterSection";
import {
  WelcomeInHeaderSection,
  WelcomeInHeaderSectionProps,
} from "./registry/welcome-in/components/WelcomeInHeaderSection";
import {
  WelcomeInHeroSection,
  WelcomeInHeroSectionProps,
} from "./registry/welcome-in/components/WelcomeInHeroSection";
import {
  WelcomeInReviewsSection,
  WelcomeInReviewsSectionProps,
} from "./registry/welcome-in/components/WelcomeInReviewsSection";
import {
  WellnessRetreatCoreInfoSection,
  WellnessRetreatCoreInfoSectionProps,
} from "./registry/wellness-retreat/components/WellnessRetreatCoreInfoSection";
import {
  WellnessRetreatFaqSection,
  WellnessRetreatFaqSectionProps,
} from "./registry/wellness-retreat/components/WellnessRetreatFaqSection";
import {
  WellnessRetreatFooterSection,
  WellnessRetreatFooterSectionProps,
} from "./registry/wellness-retreat/components/WellnessRetreatFooterSection";
import {
  WellnessRetreatGallerySection,
  WellnessRetreatGallerySectionProps,
} from "./registry/wellness-retreat/components/WellnessRetreatGallerySection";
import {
  WellnessRetreatHeaderSection,
  WellnessRetreatHeaderSectionProps,
} from "./registry/wellness-retreat/components/WellnessRetreatHeaderSection";
import {
  WellnessRetreatHeroSection,
  WellnessRetreatHeroSectionProps,
} from "./registry/wellness-retreat/components/WellnessRetreatHeroSection";
import {
  WellnessRetreatOffersSection,
  WellnessRetreatOffersSectionProps,
} from "./registry/wellness-retreat/components/WellnessRetreatOffersSection";
import {
  WellnessRetreatPromoSection,
  WellnessRetreatPromoSectionProps,
} from "./registry/wellness-retreat/components/WellnessRetreatPromoSection";
import {
  WarmEditorialAboutSection,
  WarmEditorialAboutSectionProps,
} from "./registry/warm-editorial/components/WarmEditorialAboutSection";
import {
  WarmEditorialAnnouncementSection,
  WarmEditorialAnnouncementSectionProps,
} from "./registry/warm-editorial/components/WarmEditorialAnnouncementSection";
import {
  WarmEditorialCoreInfoSection,
  WarmEditorialCoreInfoSectionProps,
} from "./registry/warm-editorial/components/WarmEditorialCoreInfoSection";
import {
  WarmEditorialFaqSection,
  WarmEditorialFaqSectionProps,
} from "./registry/warm-editorial/components/WarmEditorialFaqSection";
import {
  WarmEditorialFeaturedPicksSection,
  WarmEditorialFeaturedPicksSectionProps,
} from "./registry/warm-editorial/components/WarmEditorialFeaturedPicksSection";
import {
  WarmEditorialFooterSection,
  WarmEditorialFooterSectionProps,
} from "./registry/warm-editorial/components/WarmEditorialFooterSection";
import {
  WarmEditorialHeaderSection,
  WarmEditorialHeaderSectionProps,
} from "./registry/warm-editorial/components/WarmEditorialHeaderSection";
import {
  WarmEditorialHeroSection,
  WarmEditorialHeroSectionProps,
} from "./registry/warm-editorial/components/WarmEditorialHeroSection";

interface ModernEraCategoryProps {
  ModernEraHeaderSection: ModernEraHeaderSectionProps;
  ModernEraHeroSection: ModernEraHeroSectionProps;
  ModernEraCoreInfoSection: ModernEraCoreInfoSectionProps;
  ModernEraAboutSection: ModernEraAboutSectionProps;
  ModernEraRetirementPathsSection: ModernEraRetirementPathsSectionProps;
  ModernEraWorkshopPromoSection: ModernEraWorkshopPromoSectionProps;
  ModernEraClientReviewsSection: ModernEraClientReviewsSectionProps;
  ModernEraFaqSection: ModernEraFaqSectionProps;
  ModernEraFooterSection: ModernEraFooterSectionProps;
}

const ModernEraCategory = [
  "ModernEraHeaderSection",
  "ModernEraHeroSection",
  "ModernEraCoreInfoSection",
  "ModernEraAboutSection",
  "ModernEraRetirementPathsSection",
  "ModernEraWorkshopPromoSection",
  "ModernEraClientReviewsSection",
  "ModernEraFaqSection",
  "ModernEraFooterSection",
] as (keyof ModernEraCategoryProps)[];

interface FriendlyFacesCategoryProps {
  FriendlyFacesHeaderSection: FriendlyFacesHeaderSectionProps;
  FriendlyFacesHeroSection: FriendlyFacesHeroSectionProps;
  FriendlyFacesCoreInfoSection: FriendlyFacesCoreInfoSectionProps;
  FriendlyFacesAboutSection: FriendlyFacesAboutSectionProps;
  FriendlyFacesServicesSection: FriendlyFacesServicesSectionProps;
  FriendlyFacesPromoSection: FriendlyFacesPromoSectionProps;
  FriendlyFacesReviewsSection: FriendlyFacesReviewsSectionProps;
  FriendlyFacesFaqSection: FriendlyFacesFaqSectionProps;
  FriendlyFacesFooterSection: FriendlyFacesFooterSectionProps;
}

const FriendlyFacesCategory = [
  "FriendlyFacesHeaderSection",
  "FriendlyFacesHeroSection",
  "FriendlyFacesCoreInfoSection",
  "FriendlyFacesAboutSection",
  "FriendlyFacesServicesSection",
  "FriendlyFacesPromoSection",
  "FriendlyFacesReviewsSection",
  "FriendlyFacesFaqSection",
  "FriendlyFacesFooterSection",
] as (keyof FriendlyFacesCategoryProps)[];

interface RuggedUtilityCategoryProps {
  RuggedUtilityHeaderSection: RuggedUtilityHeaderSectionProps;
  RuggedUtilityHeroSection: RuggedUtilityHeroSectionProps;
  RuggedUtilityCoreInfoSection: RuggedUtilityCoreInfoSectionProps;
  RuggedUtilityStoreBannerSection: RuggedUtilityStoreBannerSectionProps;
  RuggedUtilityFeaturedDepartmentsSection: RuggedUtilityFeaturedDepartmentsSectionProps;
  RuggedUtilityFaqSection: RuggedUtilityFaqSectionProps;
  RuggedUtilityRouteBoardPromoSection: RuggedUtilityRouteBoardPromoSectionProps;
  RuggedUtilityNearbyLocationsSection: RuggedUtilityNearbyLocationsSectionProps;
  RuggedUtilityFooterSection: RuggedUtilityFooterSectionProps;
}

const RuggedUtilityCategory = [
  "RuggedUtilityHeaderSection",
  "RuggedUtilityHeroSection",
  "RuggedUtilityCoreInfoSection",
  "RuggedUtilityStoreBannerSection",
  "RuggedUtilityFeaturedDepartmentsSection",
  "RuggedUtilityFaqSection",
  "RuggedUtilityRouteBoardPromoSection",
  "RuggedUtilityNearbyLocationsSection",
  "RuggedUtilityFooterSection",
] as (keyof RuggedUtilityCategoryProps)[];

interface NaturallyGroundedCategoryProps {
  NaturallyGroundedHeaderSection: NaturallyGroundedHeaderSectionProps;
  NaturallyGroundedHeroSection: NaturallyGroundedHeroSectionProps;
  NaturallyGroundedStoreUpdateBannerSection: NaturallyGroundedStoreUpdateBannerSectionProps;
  NaturallyGroundedCoreInfoSection: NaturallyGroundedCoreInfoSectionProps;
  NaturallyGroundedAboutSection: NaturallyGroundedAboutSectionProps;
  NaturallyGroundedFeaturedDepartmentsSection: NaturallyGroundedFeaturedDepartmentsSectionProps;
  NaturallyGroundedPromoSection: NaturallyGroundedPromoSectionProps;
  NaturallyGroundedNearbyLocationsSection: NaturallyGroundedNearbyLocationsSectionProps;
  NaturallyGroundedReviewsSection: NaturallyGroundedReviewsSectionProps;
  NaturallyGroundedFooterSection: NaturallyGroundedFooterSectionProps;
}

const NaturallyGroundedCategory = [
  "NaturallyGroundedHeaderSection",
  "NaturallyGroundedHeroSection",
  "NaturallyGroundedStoreUpdateBannerSection",
  "NaturallyGroundedCoreInfoSection",
  "NaturallyGroundedAboutSection",
  "NaturallyGroundedFeaturedDepartmentsSection",
  "NaturallyGroundedPromoSection",
  "NaturallyGroundedNearbyLocationsSection",
  "NaturallyGroundedReviewsSection",
  "NaturallyGroundedFooterSection",
] as (keyof NaturallyGroundedCategoryProps)[];

interface CoolRunningCategoryProps {
  CoolRunningHeaderSection: CoolRunningHeaderSectionProps;
  CoolRunningHeroSection: CoolRunningHeroSectionProps;
  CoolRunningCoreInfoSection: CoolRunningCoreInfoSectionProps;
  CoolRunningUpdateBannerSection: CoolRunningUpdateBannerSectionProps;
  CoolRunningDetailsSection: CoolRunningDetailsSectionProps;
  CoolRunningNearbyLocationsSection: CoolRunningNearbyLocationsSectionProps;
  CoolRunningFaqSection: CoolRunningFaqSectionProps;
  CoolRunningFooterSection: CoolRunningFooterSectionProps;
}

const CoolRunningCategory = [
  "CoolRunningHeaderSection",
  "CoolRunningHeroSection",
  "CoolRunningCoreInfoSection",
  "CoolRunningUpdateBannerSection",
  "CoolRunningDetailsSection",
  "CoolRunningNearbyLocationsSection",
  "CoolRunningFaqSection",
  "CoolRunningFooterSection",
] as (keyof CoolRunningCategoryProps)[];

interface WelcomeInCategoryProps {
  WelcomeInHeaderSection: WelcomeInHeaderSectionProps;
  WelcomeInHeroSection: WelcomeInHeroSectionProps;
  WelcomeInCoreInfoSection: WelcomeInCoreInfoSectionProps;
  WelcomeInAboutSection: WelcomeInAboutSectionProps;
  WelcomeInFeaturedShelvesSection: WelcomeInFeaturedShelvesSectionProps;
  WelcomeInReviewsSection: WelcomeInReviewsSectionProps;
  WelcomeInFooterSection: WelcomeInFooterSectionProps;
}

const WelcomeInCategory = [
  "WelcomeInHeaderSection",
  "WelcomeInHeroSection",
  "WelcomeInCoreInfoSection",
  "WelcomeInAboutSection",
  "WelcomeInFeaturedShelvesSection",
  "WelcomeInReviewsSection",
  "WelcomeInFooterSection",
] as (keyof WelcomeInCategoryProps)[];

interface WellnessRetreatCategoryProps {
  WellnessRetreatHeaderSection: WellnessRetreatHeaderSectionProps;
  WellnessRetreatHeroSection: WellnessRetreatHeroSectionProps;
  WellnessRetreatCoreInfoSection: WellnessRetreatCoreInfoSectionProps;
  WellnessRetreatGallerySection: WellnessRetreatGallerySectionProps;
  WellnessRetreatPromoSection: WellnessRetreatPromoSectionProps;
  WellnessRetreatOffersSection: WellnessRetreatOffersSectionProps;
  WellnessRetreatFaqSection: WellnessRetreatFaqSectionProps;
  WellnessRetreatFooterSection: WellnessRetreatFooterSectionProps;
}

const WellnessRetreatCategory = [
  "WellnessRetreatHeaderSection",
  "WellnessRetreatHeroSection",
  "WellnessRetreatCoreInfoSection",
  "WellnessRetreatGallerySection",
  "WellnessRetreatPromoSection",
  "WellnessRetreatOffersSection",
  "WellnessRetreatFaqSection",
  "WellnessRetreatFooterSection",
] as (keyof WellnessRetreatCategoryProps)[];

interface FormalFinderCategoryProps {
  FormalFinderHeaderSection: FormalFinderHeaderSectionProps;
  FormalFinderHeroSection: FormalFinderHeroSectionProps;
  FormalFinderCoreInfoSection: FormalFinderCoreInfoSectionProps;
  FormalFinderAboutSection: FormalFinderAboutSectionProps;
  FormalFinderServicesSection: FormalFinderServicesSectionProps;
  FormalFinderReviewsSection: FormalFinderReviewsSectionProps;
  FormalFinderFaqSection: FormalFinderFaqSectionProps;
  FormalFinderFooterSection: FormalFinderFooterSectionProps;
}

const FormalFinderCategory = [
  "FormalFinderHeaderSection",
  "FormalFinderHeroSection",
  "FormalFinderCoreInfoSection",
  "FormalFinderAboutSection",
  "FormalFinderServicesSection",
  "FormalFinderReviewsSection",
  "FormalFinderFaqSection",
  "FormalFinderFooterSection",
] as (keyof FormalFinderCategoryProps)[];

interface HereForYouCategoryProps {
  HereForYouHeaderSection: HereForYouHeaderSectionProps;
  HereForYouHeroSection: HereForYouHeroSectionProps;
  HereForYouCoreInfoSection: HereForYouCoreInfoSectionProps;
  HereForYouAboutSection: HereForYouAboutSectionProps;
  HereForYouPromoSection: HereForYouPromoSectionProps;
  HereForYouReviewsSection: HereForYouReviewsSectionProps;
  HereForYouFooterSection: HereForYouFooterSectionProps;
}

const HereForYouCategory = [
  "HereForYouHeaderSection",
  "HereForYouHeroSection",
  "HereForYouCoreInfoSection",
  "HereForYouAboutSection",
  "HereForYouPromoSection",
  "HereForYouReviewsSection",
  "HereForYouFooterSection",
] as (keyof HereForYouCategoryProps)[];

interface CoastalCareCategoryProps {
  CoastalCareHeaderSection: CoastalCareHeaderSectionProps;
  CoastalCareHeroSection: CoastalCareHeroSectionProps;
  CoastalCareCoreInfoSection: CoastalCareCoreInfoSectionProps;
  CoastalCareAboutSection: CoastalCareAboutSectionProps;
  CoastalCareServicesSection: CoastalCareServicesSectionProps;
  CoastalCareReviewsSection: CoastalCareReviewsSectionProps;
  CoastalCareFaqSection: CoastalCareFaqSectionProps;
  CoastalCareFooterSection: CoastalCareFooterSectionProps;
}

const CoastalCareCategory = [
  "CoastalCareHeaderSection",
  "CoastalCareHeroSection",
  "CoastalCareCoreInfoSection",
  "CoastalCareAboutSection",
  "CoastalCareServicesSection",
  "CoastalCareReviewsSection",
  "CoastalCareFaqSection",
  "CoastalCareFooterSection",
] as (keyof CoastalCareCategoryProps)[];

interface WarmEditorialCategoryProps {
  WarmEditorialHeaderSection: WarmEditorialHeaderSectionProps;
  WarmEditorialAnnouncementSection: WarmEditorialAnnouncementSectionProps;
  WarmEditorialHeroSection: WarmEditorialHeroSectionProps;
  WarmEditorialCoreInfoSection: WarmEditorialCoreInfoSectionProps;
  WarmEditorialFeaturedPicksSection: WarmEditorialFeaturedPicksSectionProps;
  WarmEditorialAboutSection: WarmEditorialAboutSectionProps;
  WarmEditorialFaqSection: WarmEditorialFaqSectionProps;
  WarmEditorialFooterSection: WarmEditorialFooterSectionProps;
}

const WarmEditorialCategory = [
  "WarmEditorialHeaderSection",
  "WarmEditorialAnnouncementSection",
  "WarmEditorialHeroSection",
  "WarmEditorialCoreInfoSection",
  "WarmEditorialFeaturedPicksSection",
  "WarmEditorialAboutSection",
  "WarmEditorialFaqSection",
  "WarmEditorialFooterSection",
] as (keyof WarmEditorialCategoryProps)[];

interface DevProps
  extends MainConfigProps,
    DirectoryCategoryProps,
    FriendlyFacesCategoryProps,
    ModernEraCategoryProps,
    RuggedUtilityCategoryProps,
    NaturallyGroundedCategoryProps,
    CoolRunningCategoryProps,
    WelcomeInCategoryProps,
    WellnessRetreatCategoryProps,
    FormalFinderCategoryProps,
    HereForYouCategoryProps,
    CoastalCareCategoryProps,
    WarmEditorialCategoryProps {}

const components: Config<DevProps>["components"] = {
  ...mainConfig.components,
  ...DirectoryCategoryComponents,
  FriendlyFacesHeaderSection,
  FriendlyFacesHeroSection,
  FriendlyFacesCoreInfoSection,
  FriendlyFacesAboutSection,
  FriendlyFacesServicesSection,
  FriendlyFacesPromoSection,
  FriendlyFacesReviewsSection,
  FriendlyFacesFaqSection,
  FriendlyFacesFooterSection,
  ModernEraHeaderSection,
  ModernEraHeroSection,
  ModernEraCoreInfoSection,
  ModernEraAboutSection,
  ModernEraRetirementPathsSection,
  ModernEraWorkshopPromoSection,
  ModernEraClientReviewsSection,
  ModernEraFaqSection,
  ModernEraFooterSection,
  RuggedUtilityHeaderSection,
  RuggedUtilityHeroSection,
  RuggedUtilityCoreInfoSection,
  RuggedUtilityStoreBannerSection,
  RuggedUtilityFeaturedDepartmentsSection,
  RuggedUtilityFaqSection,
  RuggedUtilityRouteBoardPromoSection,
  RuggedUtilityNearbyLocationsSection,
  RuggedUtilityFooterSection,
  NaturallyGroundedHeaderSection,
  NaturallyGroundedHeroSection,
  NaturallyGroundedStoreUpdateBannerSection,
  NaturallyGroundedCoreInfoSection,
  NaturallyGroundedAboutSection,
  NaturallyGroundedFeaturedDepartmentsSection,
  NaturallyGroundedPromoSection,
  NaturallyGroundedNearbyLocationsSection,
  NaturallyGroundedReviewsSection,
  NaturallyGroundedFooterSection,
  CoolRunningHeaderSection,
  CoolRunningHeroSection,
  CoolRunningCoreInfoSection,
  CoolRunningUpdateBannerSection,
  CoolRunningDetailsSection,
  CoolRunningNearbyLocationsSection,
  CoolRunningFaqSection,
  CoolRunningFooterSection,
  WelcomeInHeaderSection,
  WelcomeInHeroSection,
  WelcomeInCoreInfoSection,
  WelcomeInAboutSection,
  WelcomeInFeaturedShelvesSection,
  WelcomeInReviewsSection,
  WelcomeInFooterSection,
  WellnessRetreatHeaderSection,
  WellnessRetreatHeroSection,
  WellnessRetreatCoreInfoSection,
  WellnessRetreatGallerySection,
  WellnessRetreatPromoSection,
  WellnessRetreatOffersSection,
  WellnessRetreatFaqSection,
  WellnessRetreatFooterSection,
  FormalFinderHeaderSection,
  FormalFinderHeroSection,
  FormalFinderCoreInfoSection,
  FormalFinderAboutSection,
  FormalFinderServicesSection,
  FormalFinderReviewsSection,
  FormalFinderFaqSection,
  FormalFinderFooterSection,
  HereForYouHeaderSection,
  HereForYouHeroSection,
  HereForYouCoreInfoSection,
  HereForYouAboutSection,
  HereForYouPromoSection,
  HereForYouReviewsSection,
  HereForYouFooterSection,
  CoastalCareHeaderSection,
  CoastalCareHeroSection,
  CoastalCareCoreInfoSection,
  CoastalCareAboutSection,
  CoastalCareServicesSection,
  CoastalCareReviewsSection,
  CoastalCareFaqSection,
  CoastalCareFooterSection,
  WarmEditorialHeaderSection,
  WarmEditorialAnnouncementSection,
  WarmEditorialHeroSection,
  WarmEditorialCoreInfoSection,
  WarmEditorialFeaturedPicksSection,
  WarmEditorialAboutSection,
  WarmEditorialFaqSection,
  WarmEditorialFooterSection,
};

export const devConfig: Config<DevProps> = {
  components,
  categories: {
    ...mainConfig.categories,
    directory: {
      title: "Directory",
      components: DirectoryCategory,
    },
    friendlyFaces: {
      title: "Friendly Faces",
      components: FriendlyFacesCategory,
    },
    modernEra: {
      title: "Modern Era",
      components: ModernEraCategory,
    },
    ruggedUtility: {
      title: "Rugged Utility",
      components: RuggedUtilityCategory,
    },
    naturallyGrounded: {
      title: "Naturally Grounded",
      components: NaturallyGroundedCategory,
    },
    coolRunning: {
      title: "Cool Running",
      components: CoolRunningCategory,
    },
    welcomeIn: {
      title: "Welcome In",
      components: WelcomeInCategory,
    },
    wellnessRetreat: {
      title: "Wellness Retreat",
      components: WellnessRetreatCategory,
    },
    formalFinder: {
      title: "Formal Finder",
      components: FormalFinderCategory,
    },
    hereForYou: {
      title: "Here For You",
      components: HereForYouCategory,
    },
    coastalCare: {
      title: "Coastal Care",
      components: CoastalCareCategory,
    },
    warmEditorial: {
      title: "Warm Editorial",
      components: WarmEditorialCategory,
    },
  },
  root: mainConfig.root,
};

export const componentRegistry: Record<string, Config<DevProps>> = {
  dev: devConfig,
};
