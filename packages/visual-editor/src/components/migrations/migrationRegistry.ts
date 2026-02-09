import { MigrationRegistry } from "../../utils/migrate.ts";
import { adjustPropObjectsMigration } from "./0001_adjust_prop_objects.ts";
import { addHeadingAlignmentMigration } from "./0002_add_heading_alignment.ts";
import { adjustStructFields } from "./0003_adjust_struct_fields.ts";
import { addDirectoryRootPropMigration } from "./0004_add_directory_root_prop.ts";
import { addPromoHeadingStylesMigration } from "./0005_add_promo_heading_styles.ts";
import { updateImageStylingMigration } from "./0006_update_image_styling.ts";
import { addCardStylesMigration } from "./0007_add_card_styles.ts";
import { addBreadcrumbsDirectoryBackgroundMigration } from "./0008_add_breadcrumbs_directory_background.ts";
import { addShowAverageReviewMigration } from "./0009_add_show_average_reviews.ts";
import { updateExpandedHeaderStylesMigration } from "./0010_update_expanded_header_styles.ts";
import { addDirectoryTitleMigration } from "./0011_add_directory_title.ts";
import { addHeaderFooterMaxWidth } from "./0012_add_header_footer_max_width.ts";
import { ignoreLocaleWarningBannerSection } from "./0013_ignore_locale_warning_banner_section.ts";
import { directoryHoursStyles } from "./0014_directory_hours_styles.ts";
import { addHeaderPosition } from "./0015_add_header_position.ts";
import { migrateCTAStructures } from "./0016_migrate_cta_structures.ts";
import { heroVariants } from "./0017_hero_variants.ts";
import { addDirectorySiteNameMigration } from "./0018_add_directory_site_name.ts";
import { refactorContentBlocks } from "./0019_refactor_content_blocks.ts";
import { updateFooterForAssetImages } from "./0020_footer_asset_images.ts";
import { setOpenNowDefault } from "./0021_set_open_now_default.ts";
import { adjustLocatorOpenNowSchema } from "./0022_adjust_locator_open_now_schema.ts";
import { addIdToSchema } from "./0023_add_id_to_schema.ts";
import { locatorCardDefaultProps } from "./0024_locator_card_default_props.ts";
import { organizeHeadingTextProps } from "./0025_organize_heading_text_props.ts";
import { eventSectionSlots } from "./0026_event_section_slots.ts";
import { coreInfoSectionSlots } from "./0027_core_info_section_slots.ts";
import { videoSectionSlots } from "./0028_video_section_slots.ts";
import { organizeCTAWrapperProps } from "./0029_organize_cta_wrapper_props.ts";
import { promoSectionSlots } from "./0030_promo_section_slots.ts";
import { heroSectionSlots } from "./0031_slotify_hero_section.ts";
import { productSectionSlots } from "./0032_product_section_slots.ts";
import { insightSectionSlots } from "./0033_insight_section_slots.ts";
import { teamsSectionSlots } from "./0034_teams_section_slots.ts";
import { faqsSectionSlots } from "./0035_slotify_faq_section.ts";
import { nearbyLocationSlots } from "./0036_nearby_location_slots.ts";
import { testimonialsSectionSlots } from "./0037_testimonials_section_slots.ts";
import { photoGallerySlots } from "./0038_photo_gallery_slots.ts";
import { reviewsSectionSlots } from "./0039_reviews_section_slots.ts";
import { directorySlots } from "./0040_slotify_directory.ts";
import { expandedHeaderSlots } from "./0041_expanded_header_slots.ts";
import { expandedFooterSlots } from "./0042_expanded_footer_slots.ts";
import { setDefaultCtaVariants } from "./0043_set_default_cta_variants.ts";
import { fixRootMetaFieldsMigration } from "./0044_fix_root_meta_fields.ts";
import { schemaUpdates } from "./0045_schema_updates.ts";
import { mergeStickyAndFixedHeader } from "./0046_merge_sticky_and_fixed_header.ts";
import { fixPromoSectionSlots } from "./0047_fix_promo_section_slots.ts";
import { translatableCTAImageMigration } from "./0048_translatable_cta_image.ts";
import { simplifyFaqSection } from "./0049_simplify_faq_section.ts";
import { promoVariants } from "./0050_promo_variants.ts";
import { updateLinksAlignmentMigration } from "./0051_update_link_align_prop.ts";
import { addDefaultLocatorAndDirectoryMetaFields } from "./0052_add_default_locator_and_directory_meta_fields.ts";
import { photoGalleryVariant } from "./0053_photo_gallery_variant.ts";
import { productVariants } from "./0054_product_variants.ts";
import { headerLinksUpdate } from "./0055_header_link_updates.ts";
import { emptyTitleFix } from "./0056_empty_title_fix.ts";
import { ctaActionTypeDefaults } from "./0057_cta_action_type_defaults.ts";
import { fixDirectoryTitleBindingAndSlotifyAddress } from "./0058_dynamic_directory_title_binding_and_slotify_address.ts";
import { addDefaultLocatorPageTitle } from "./0059_add_default_locator_title.ts";

// To add a migration:
// Create a new file in this directory that exports a Migration
// Import it in this file and add it to this array.
// The migrations are run in the order of this array
// and the data's version number indicates the last applied index.
export const migrationRegistry: MigrationRegistry = [
  adjustPropObjectsMigration,
  addHeadingAlignmentMigration,
  adjustStructFields,
  addDirectoryRootPropMigration,
  addPromoHeadingStylesMigration,
  updateImageStylingMigration,
  addCardStylesMigration,
  addBreadcrumbsDirectoryBackgroundMigration,
  addShowAverageReviewMigration,
  updateExpandedHeaderStylesMigration,
  addDirectoryTitleMigration,
  addHeaderFooterMaxWidth,
  ignoreLocaleWarningBannerSection,
  directoryHoursStyles,
  addHeaderPosition,
  migrateCTAStructures,
  heroVariants,
  addDirectorySiteNameMigration,
  refactorContentBlocks,
  updateFooterForAssetImages,
  setOpenNowDefault,
  adjustLocatorOpenNowSchema,
  addIdToSchema,
  locatorCardDefaultProps,
  organizeHeadingTextProps,
  eventSectionSlots,
  coreInfoSectionSlots,
  videoSectionSlots,
  organizeCTAWrapperProps,
  promoSectionSlots,
  heroSectionSlots,
  productSectionSlots,
  insightSectionSlots,
  teamsSectionSlots,
  faqsSectionSlots,
  nearbyLocationSlots,
  testimonialsSectionSlots,
  photoGallerySlots,
  reviewsSectionSlots,
  directorySlots,
  expandedHeaderSlots,
  expandedFooterSlots,
  setDefaultCtaVariants,
  fixRootMetaFieldsMigration,
  schemaUpdates,
  mergeStickyAndFixedHeader,
  fixPromoSectionSlots,
  translatableCTAImageMigration,
  simplifyFaqSection,
  promoVariants,
  updateLinksAlignmentMigration,
  addDefaultLocatorAndDirectoryMetaFields,
  photoGalleryVariant,
  productVariants,
  headerLinksUpdate,
  emptyTitleFix,
  ctaActionTypeDefaults,
  fixDirectoryTitleBindingAndSlotifyAddress,
  addDefaultLocatorPageTitle,
];
