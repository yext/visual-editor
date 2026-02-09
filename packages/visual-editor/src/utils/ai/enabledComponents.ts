import { PageSectionCategoryProps } from "../../components/categories/PageSectionCategory.tsx";
import { DirectoryCategoryProps } from "../../components/categories/DirectoryCategory.tsx";
import { LocatorCategoryProps } from "../../components/categories/LocatorCategory.tsx";
import { SlotsCategoryProps } from "../../components/categories/SlotsCategory.tsx";
import { AdvancedCoreInfoCategoryProps } from "../../components/categories/AdvancedCoreInfoCategory.tsx";
import { OtherCategoryProps } from "../../components/categories/OtherCategory.tsx";

/** The config passed to Puck will be filtered to the components listed here */
export const enabledAiComponents: (
  | keyof PageSectionCategoryProps
  | keyof DirectoryCategoryProps
  | keyof LocatorCategoryProps
  | keyof SlotsCategoryProps
  | keyof AdvancedCoreInfoCategoryProps
  | keyof OtherCategoryProps
)[] = [
  "AddressSlot",
  "BannerSection",
  "BodyTextSlot",
  "CopyrightMessageSlot",
  "CoreInfoSection",
  "CTASlot",
  "EmailsSlot",
  "ExpandedFooter",
  "ExpandedHeader",
  "FooterExpandedLinksWrapper",
  "FooterLinksSlot",
  "FooterLogoSlot",
  "FooterSocialLinksSlot",
  "FooterUtilityImagesSlot",
  "HeaderLinks",
  "HeadingTextSlot",
  "HeroImageSlot",
  "HeroSection",
  "HoursStatusSlot",
  "HoursTableSlot",
  "ImageSlot",
  "PhoneNumbersSlot",
  "PrimaryHeaderSlot",
  "PromoSection",
  "SecondaryHeaderSlot",
  "SecondaryFooterSlot",
  "TextListSlot",
  "VideoSlot",
];
