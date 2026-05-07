import React from "react";
import { type YextFieldDefinition } from "./fields.ts";
import {
  ConstantValueTypes,
  EntityFieldTypes,
} from "../internal/utils/getFilteredEntityFields.ts";
import { DevLogger } from "../utils/devLogger.ts";
import {
  TEXT_CONSTANT_CONFIG,
  TRANSLATABLE_RICH_TEXT_CONSTANT_CONFIG,
  TRANSLATABLE_STRING_CONSTANT_CONFIG,
} from "../internal/puck/constant-value-fields/Text.tsx";
import {
  TEXT_LIST_CONSTANT_CONFIG,
  TRANSLATABLE_TEXT_LIST_CONSTANT_CONFIG,
} from "../internal/puck/constant-value-fields/TextList.tsx";
import { ENHANCED_CTA_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/EnhancedCallToAction.tsx";
import { PHONE_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Phone.tsx";
import { DATE_TIME_CONSTANT_CONFIG } from "./DateTimeSelectorField.tsx";
import { type ImageField } from "./ImageField.tsx";
import { getRandomPlaceholderImageObject } from "../utils/imagePlaceholders.ts";
import { pt } from "../utils/i18n/platform.ts";
import { EVENT_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/EventSection.tsx";
import { INSIGHT_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/InsightSection.tsx";
import { PRODUCT_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/ProductSection.tsx";
import { TEAM_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/TeamSection.tsx";
import { TESTIMONIAL_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/TestimonialSection.tsx";
import { FAQ_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/FAQsSection.tsx";

const devLogger = new DevLogger();

type ConstantFieldConfig<ValueType = any> = YextFieldDefinition<ValueType>;

const IMAGE_CONSTANT_CONFIG: ImageField = {
  type: "image",
};

const getImageListConstantConfig = (): YextFieldDefinition => {
  return {
    label: "",
    type: "array",
    arrayFields: {
      assetImage: {
        ...IMAGE_CONSTANT_CONFIG,
        label: pt("fields.image", "Image"),
      },
    },
    defaultItemProps: {
      assetImage: {
        ...getRandomPlaceholderImageObject({ width: 1000, height: 570 }),
        width: 1000,
        height: 570,
      },
    },
    getItemSummary: (_, i) => pt("photo", "Photo") + " " + ((i ?? 0) + 1),
  };
};

export const TYPE_TO_CONSTANT_CONFIG: Record<string, ConstantFieldConfig> = {
  "type.string": TRANSLATABLE_STRING_CONSTANT_CONFIG,
  "type.rich_text_v2": TRANSLATABLE_RICH_TEXT_CONSTANT_CONFIG,
  "type.phone": PHONE_CONSTANT_CONFIG,
  "type.image": IMAGE_CONSTANT_CONFIG,
  "type.cta": ENHANCED_CTA_CONSTANT_CONFIG,
  "type.datetime": DATE_TIME_CONSTANT_CONFIG,
  "type.events_section": EVENT_SECTION_CONSTANT_CONFIG,
  "type.insights_section": INSIGHT_SECTION_CONSTANT_CONFIG,
  "type.products_section": PRODUCT_SECTION_CONSTANT_CONFIG,
  "type.faq_section": FAQ_SECTION_CONSTANT_CONFIG,
  "type.team_section": TEAM_SECTION_CONSTANT_CONFIG,
  "type.testimonials_section": TESTIMONIAL_SECTION_CONSTANT_CONFIG,
  "type.promo_section": {
    type: "custom",
    render: () => React.createElement(React.Fragment),
  },
};

const TYPE_TO_NON_TRANSLATABLE_CONSTANT_CONFIG: Record<
  string,
  ConstantFieldConfig
> = {
  "type.string": TEXT_CONSTANT_CONFIG,
  "type.rich_text_v2": TEXT_CONSTANT_CONFIG,
};

const LIST_TYPE_TO_NON_TRANSLATABLE_CONSTANT_CONFIG: Record<
  string,
  ConstantFieldConfig
> = {
  "type.string": TEXT_LIST_CONSTANT_CONFIG,
  "type.rich_text_v2": TEXT_LIST_CONSTANT_CONFIG,
};

const getListTypeToConstantConfig = (): Record<string, ConstantFieldConfig> => {
  return {
    "type.string": TRANSLATABLE_TEXT_LIST_CONSTANT_CONFIG,
    "type.image": getImageListConstantConfig(),
  };
};

const LOCALIZED_CONSTANT_CONFIGS = new Set<ConstantFieldConfig>([
  TRANSLATABLE_STRING_CONSTANT_CONFIG,
  TRANSLATABLE_RICH_TEXT_CONSTANT_CONFIG,
  TRANSLATABLE_TEXT_LIST_CONSTANT_CONFIG,
]);

export const supportsLocalizedConstantValue = (
  constantFieldConfig: ConstantFieldConfig | undefined
): boolean => {
  return (
    constantFieldConfig !== undefined &&
    LOCALIZED_CONSTANT_CONFIGS.has(constantFieldConfig)
  );
};

/**
 * Returns the constant-editor field config for one entity-field type, if one
 * exists for the current list/translation mode.
 */
export const getConstantConfigFromType = (
  type: ConstantValueTypes,
  isList?: boolean,
  disallowTranslation?: boolean
): ConstantFieldConfig | undefined => {
  if (isList) {
    if (disallowTranslation) {
      return (
        LIST_TYPE_TO_NON_TRANSLATABLE_CONSTANT_CONFIG[type] ??
        getListTypeToConstantConfig()[type]
      );
    }

    return getListTypeToConstantConfig()[type];
  }

  const constantConfig = disallowTranslation
    ? (TYPE_TO_NON_TRANSLATABLE_CONSTANT_CONFIG[type] ??
      TYPE_TO_CONSTANT_CONFIG[type])
    : TYPE_TO_CONSTANT_CONFIG[type];

  if (!constantConfig) {
    devLogger.log(`No constant configuration for ${type}`);
    return;
  }

  return constantConfig;
};

/**
 * Returns the shared constant-editor config when every allowed field type maps
 * to the same compatible input.
 */
export const returnConstantFieldConfig = (
  typeFilter: EntityFieldTypes[] | undefined,
  isList: boolean,
  disallowTranslation: boolean
): ConstantFieldConfig | undefined => {
  if (!typeFilter) {
    return undefined;
  }

  if (
    !isList &&
    !disallowTranslation &&
    typeFilter.includes("type.rich_text_v2") &&
    typeFilter.every(
      (entityFieldType) =>
        entityFieldType === "type.string" ||
        entityFieldType === "type.rich_text_v2"
    )
  ) {
    return getConstantConfigFromType("type.rich_text_v2");
  }

  let fieldConfiguration: ConstantFieldConfig | undefined;
  for (const entityFieldType of typeFilter) {
    const mappedConfiguration = getConstantConfigFromType(
      entityFieldType,
      isList,
      disallowTranslation
    );

    if (!mappedConfiguration) {
      devLogger.log(`No mapped configuration for ${entityFieldType}`);
      return;
    }

    if (!fieldConfiguration) {
      fieldConfiguration = mappedConfiguration;
    }

    if (fieldConfiguration !== mappedConfiguration) {
      devLogger.log(`Could not resolve configuration for ${entityFieldType}`);
      return;
    }
  }

  return fieldConfiguration;
};
