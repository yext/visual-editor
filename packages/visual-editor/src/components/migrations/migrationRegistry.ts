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
import { organizeHeadingTextProps } from "./0022_organize_heading_text_props.ts";
import { eventSectionSlots } from "./0023_event_section_slots.ts";
import { coreInfoSectionSlots } from "./0024_core_info_section_slots.ts";
import { videoSectionSlots } from "./0025_video_section_slots.ts";
import { organizeCTAWrapperProps } from "./0026_organize_cta_wrapper_props.ts";
import { promoSectionSlots } from "./0027_promo_section_slots.ts";
import { heroSectionSlots } from "./0028_slotify_hero_section.ts";
import { productSectionSlots } from "./0029_product_section_slots.ts";

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
  organizeHeadingTextProps,
  eventSectionSlots,
  coreInfoSectionSlots,
  videoSectionSlots,
  organizeCTAWrapperProps,
  promoSectionSlots,
  heroSectionSlots,
  productSectionSlots,
];
