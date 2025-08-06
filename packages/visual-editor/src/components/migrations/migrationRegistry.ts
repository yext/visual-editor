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
import { ignore18nWarningBannerSection } from "./0013_ignore_i18n_warning_banner_section.ts";

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
  ignore18nWarningBannerSection,
];
