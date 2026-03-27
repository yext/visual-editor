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

interface DevProps
  extends MainConfigProps,
    DirectoryCategoryProps,
    FriendlyFacesCategoryProps,
    ModernEraCategoryProps,
    RuggedUtilityCategoryProps,
    NaturallyGroundedCategoryProps {}

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
  },
  root: mainConfig.root,
};

export const componentRegistry: Record<string, Config<DevProps>> = {
  dev: devConfig,
  "friendly-faces": devConfig,
  "rugged-utility": devConfig,
  "naturally-grounded": devConfig,
};
