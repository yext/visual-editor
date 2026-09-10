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
import { addShowHideOptions } from "./0059_show_hide_options.ts";
import { addDefaultLocatorPageTitle } from "./0060_add_default_locator_title.ts";
import { expandedHeaderLinks } from "./0061_expanded_header_links.ts";
import { addLocatorPrimaryCtaLabel } from "./0062_add_locator_primary_cta_label.ts";
import { textAtomUpdates } from "./0063_text_atom_updates.ts";
import { locatorStaticContentToggles } from "./0064_locator_static_content_toggles.ts";
import { locatorDistanceDisplay } from "./0065_locator_distance_display.ts";
import { normalizeLocatorResultCard } from "./0066_normalize_locator_result_card.ts";
import { ctaNormalizeLinkDefault } from "./0067_cta_normalize_link_default.ts";
import { directoryBreadcrumbCurrentPage } from "./0068_directory_breadcrumb_current_page.ts";
import { updateSchemaIdAnchorFormat } from "./0069_update_schema_id_anchor_format.ts";
import { directoryGridBackgroundStyles } from "./0070_directory_grid_background_styles.ts";
import { themeColorPropertyKeyMigration } from "./0071_theme_color_property_keys.ts";
import { footerAlignmentAndVisibilityPropsMigration } from "./0072_footer_alignment_and_visibility_props.ts";
import { mainContentWrapperMigration } from "./0073_main_content_wrapper.ts";
import { flattenLocatorResultCardSingleSelectFields } from "./0074_flatten_locator_result_card_single_select_fields.ts";
import { normalizeFooterLogoImageMigration } from "./0075_normalize_footer_logo_image.ts";
import { slotMappedCardsMigration } from "./0076_slot_mapped_cards.ts";
import { directoryCardTitleField } from "./0077_directory_card_title_field.ts";
import { removeMapboxApiKeyPropsMigration } from "./0078_remove_mapbox_api_key_props.ts";
import { imageFillTypeMigration } from "./0079_image_fill_type.ts";
import { directoryCardDisplayProps } from "./0080_directory_card_display_props.ts";
import { headerFooterImageFillTypeMigration } from "./0081_header_footer_image_fill_type.ts";
import { heroPhoneSlotMigration } from "./0082_hero_phone_slot.ts";

// To add a migration:
// Create a new file in this directory that exports a Migration
// Import it in this file and add it to this array.
// The migrations are run in the order of this append-only array.
export const migrationRegistry: MigrationRegistry = [
  { id: "0001-adjust-prop-objects", migration: adjustPropObjectsMigration },
  { id: "0002-add-heading-alignment", migration: addHeadingAlignmentMigration },
  { id: "0003-adjust-struct-fields", migration: adjustStructFields },
  {
    id: "0004-add-directory-root-prop",
    migration: addDirectoryRootPropMigration,
  },
  {
    id: "0005-add-promo-heading-styles",
    migration: addPromoHeadingStylesMigration,
  },
  { id: "0006-update-image-styling", migration: updateImageStylingMigration },
  { id: "0007-add-card-styles", migration: addCardStylesMigration },
  {
    id: "0008-add-breadcrumbs-directory-background",
    migration: addBreadcrumbsDirectoryBackgroundMigration,
  },
  {
    id: "0009-add-show-average-reviews",
    migration: addShowAverageReviewMigration,
  },
  {
    id: "0010-update-expanded-header-styles",
    migration: updateExpandedHeaderStylesMigration,
  },
  { id: "0011-add-directory-title", migration: addDirectoryTitleMigration },
  {
    id: "0012-add-header-footer-max-width",
    migration: addHeaderFooterMaxWidth,
  },
  {
    id: "0013-ignore-locale-warning-banner-section",
    migration: ignoreLocaleWarningBannerSection,
  },
  { id: "0014-directory-hours-styles", migration: directoryHoursStyles },
  { id: "0015-add-header-position", migration: addHeaderPosition },
  { id: "0016-migrate-cta-structures", migration: migrateCTAStructures },
  { id: "0017-hero-variants", migration: heroVariants },
  {
    id: "0018-add-directory-site-name",
    migration: addDirectorySiteNameMigration,
  },
  { id: "0019-refactor-content-blocks", migration: refactorContentBlocks },
  { id: "0020-footer-asset-images", migration: updateFooterForAssetImages },
  { id: "0021-set-open-now-default", migration: setOpenNowDefault },
  {
    id: "0022-adjust-locator-open-now-schema",
    migration: adjustLocatorOpenNowSchema,
  },
  { id: "0023-add-id-to-schema", migration: addIdToSchema },
  { id: "0024-locator-card-default-props", migration: locatorCardDefaultProps },
  {
    id: "0025-organize-heading-text-props",
    migration: organizeHeadingTextProps,
  },
  { id: "0026-event-section-slots", migration: eventSectionSlots },
  { id: "0027-core-info-section-slots", migration: coreInfoSectionSlots },
  { id: "0028-video-section-slots", migration: videoSectionSlots },
  { id: "0029-organize-cta-wrapper-props", migration: organizeCTAWrapperProps },
  { id: "0030-promo-section-slots", migration: promoSectionSlots },
  { id: "0031-slotify-hero-section", migration: heroSectionSlots },
  { id: "0032-product-section-slots", migration: productSectionSlots },
  { id: "0033-insight-section-slots", migration: insightSectionSlots },
  { id: "0034-teams-section-slots", migration: teamsSectionSlots },
  { id: "0035-slotify-faq-section", migration: faqsSectionSlots },
  { id: "0036-nearby-location-slots", migration: nearbyLocationSlots },
  {
    id: "0037-testimonials-section-slots",
    migration: testimonialsSectionSlots,
  },
  { id: "0038-photo-gallery-slots", migration: photoGallerySlots },
  { id: "0039-reviews-section-slots", migration: reviewsSectionSlots },
  { id: "0040-slotify-directory", migration: directorySlots },
  { id: "0041-expanded-header-slots", migration: expandedHeaderSlots },
  { id: "0042-expanded-footer-slots", migration: expandedFooterSlots },
  { id: "0043-set-default-cta-variants", migration: setDefaultCtaVariants },
  { id: "0044-fix-root-meta-fields", migration: fixRootMetaFieldsMigration },
  { id: "0045-schema-updates", migration: schemaUpdates },
  {
    id: "0046-merge-sticky-and-fixed-header",
    migration: mergeStickyAndFixedHeader,
  },
  { id: "0047-fix-promo-section-slots", migration: fixPromoSectionSlots },
  {
    id: "0048-translatable-cta-image",
    migration: translatableCTAImageMigration,
  },
  { id: "0049-simplify-faq-section", migration: simplifyFaqSection },
  { id: "0050-promo-variants", migration: promoVariants },
  {
    id: "0051-update-link-align-prop",
    migration: updateLinksAlignmentMigration,
  },
  {
    id: "0052-add-default-locator-and-directory-meta-fields",
    migration: addDefaultLocatorAndDirectoryMetaFields,
  },
  { id: "0053-photo-gallery-variant", migration: photoGalleryVariant },
  { id: "0054-product-variants", migration: productVariants },
  { id: "0055-header-link-updates", migration: headerLinksUpdate },
  { id: "0056-empty-title-fix", migration: emptyTitleFix },
  { id: "0057-cta-action-type-defaults", migration: ctaActionTypeDefaults },
  {
    id: "0058-dynamic-directory-title-binding-and-slotify-address",
    migration: fixDirectoryTitleBindingAndSlotifyAddress,
  },
  { id: "0059-show-hide-options", migration: addShowHideOptions },
  {
    id: "0060-add-default-locator-title",
    migration: addDefaultLocatorPageTitle,
  },
  { id: "0061-expanded-header-links", migration: expandedHeaderLinks },
  {
    id: "0062-add-locator-primary-cta-label",
    migration: addLocatorPrimaryCtaLabel,
  },
  { id: "0063-text-atom-updates", migration: textAtomUpdates },
  {
    id: "0064-locator-static-content-toggles",
    migration: locatorStaticContentToggles,
  },
  { id: "0065-locator-distance-display", migration: locatorDistanceDisplay },
  {
    id: "0066-normalize-locator-result-card",
    migration: normalizeLocatorResultCard,
  },
  { id: "0067-cta-normalize-link-default", migration: ctaNormalizeLinkDefault },
  {
    id: "0068-directory-breadcrumb-current-page",
    migration: directoryBreadcrumbCurrentPage,
  },
  {
    id: "0069-update-schema-id-anchor-format",
    migration: updateSchemaIdAnchorFormat,
  },
  {
    id: "0070-directory-grid-background-styles",
    migration: directoryGridBackgroundStyles,
  },
  {
    id: "0071-theme-color-property-keys",
    migration: themeColorPropertyKeyMigration,
  },
  {
    id: "0072-footer-alignment-and-visibility-props",
    migration: footerAlignmentAndVisibilityPropsMigration,
  },
  { id: "0073-main-content-wrapper", migration: mainContentWrapperMigration },
  {
    id: "0074-flatten-locator-result-card-single-select-fields",
    migration: flattenLocatorResultCardSingleSelectFields,
  },
  {
    id: "0075-normalize-footer-logo-image",
    migration: normalizeFooterLogoImageMigration,
  },
  { id: "0076-slot-mapped-cards", migration: slotMappedCardsMigration },
  { id: "0077-directory-card-title-field", migration: directoryCardTitleField },
  {
    id: "0078-remove-mapbox-api-key-props",
    migration: removeMapboxApiKeyPropsMigration,
  },
  { id: "0079-image-fill-type", migration: imageFillTypeMigration },
  {
    id: "0080-directory-card-display-props",
    migration: directoryCardDisplayProps,
  },
  {
    id: "0081-header-footer-image-fill-type",
    migration: headerFooterImageFillTypeMigration,
  },
  { id: "0082-hero-phone-slot", migration: heroPhoneSlotMigration },
];
