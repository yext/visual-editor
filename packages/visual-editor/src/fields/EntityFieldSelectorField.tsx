import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { type YextFieldDefinition } from "../editor/YextField.tsx";
import { type BasicSelectorField } from "./BasicSelectorField.tsx";
import { YextAutoField } from "./YextAutoField.tsx";
import { DATE_TIME_CONSTANT_CONFIG } from "./DateTimeSelectorField.tsx";
import { type ImageField } from "./ImageField.tsx";
import {
  ConstantValueTypes,
  EntityFieldTypes,
  RenderEntityFieldFilter,
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
import { useEntityFields } from "../hooks/useEntityFields.tsx";
import { useTemplateMetadata } from "../internal/hooks/useMessageReceivers.ts";
import { getRandomPlaceholderImageObject } from "../utils/imagePlaceholders.ts";
import { EVENT_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/EventSection.tsx";
import { INSIGHT_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/InsightSection.tsx";
import { PRODUCT_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/ProductSection.tsx";
import { TEAM_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/TeamSection.tsx";
import { TESTIMONIAL_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/TestimonialSection.tsx";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../internal/puck/ui/Tooltip.tsx";
import { KnowledgeGraphIcon } from "../editor/KnowledgeGraphIcon.tsx";
import { Switch } from "../internal/puck/ui/switch.tsx";
import { pt, type MsgString } from "../utils/i18n/platform.ts";
import { useTranslation } from "react-i18next";
import { EmbeddedFieldStringInputFromEntity } from "../editor/EmbeddedFieldStringInput.tsx";
import { FAQ_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/FAQsSection.tsx";
import {
  getEntityFieldDisplayName,
  getFieldsForSelector,
} from "../editor/yextEntityFieldUtils.ts";
import { useDocument } from "../hooks/useDocument.tsx";
import { isLinkedEntityFieldPath } from "../utils/linkedEntityFieldUtils.ts";
import { warnOnMultiValueLinkedEntityTraversal } from "../utils/linkedEntityWarningUtils.ts";
import { buildEntityFieldOptionGroups } from "../editor/entityFieldOptionGroups.ts";
import { type MappedSourceFieldFilter } from "../utils/cardSlots/mappedSource.ts";
import { useResolvedSourceField } from "../editor/currentDocumentContext.tsx";

const devLogger = new DevLogger();

type ConstantFieldConfig<ValueType = any> = YextFieldDefinition<ValueType>;

const YEXT_FIELD_OVERRIDE_TYPES = new Set([
  "basicSelector",
  "ctaSelector",
  "code",
  "dateTimeSelector",
  "entityField",
  "fontSizeSelector",
  "image",
  "optionalNumber",
  "translatableString",
  "video",
]);

const isYextOverrideType = (type: string): boolean => {
  return YEXT_FIELD_OVERRIDE_TYPES.has(type);
};

export type EntityFieldSelectorField<
  T extends Record<string, any> = Record<string, any>,
> = BaseField & {
  type: "entityField";
  label?: string | MsgString;
  visible?: boolean;
  filter: MappedSourceFieldFilter<T>;
  constantValueFilter?: RenderEntityFieldFilter<T>;
  disableConstantValueToggle?: boolean;
  disallowTranslation?: boolean;
  sourceFieldPath?: string;
  sourceEntityPath?: string | null;
};

type EntityFieldSelectorFieldProps = FieldProps<EntityFieldSelectorField>;

const IMAGE_CONSTANT_CONFIG: ImageField = {
  type: "image",
};

const IMAGE_LIST_CONSTANT_CONFIG = () => {
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
  } satisfies YextFieldDefinition;
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
    render: () => <></>,
  },
};

const LIST_TYPE_TO_CONSTANT_CONFIG = (): Record<
  string,
  ConstantFieldConfig
> => {
  return {
    "type.string": TRANSLATABLE_TEXT_LIST_CONSTANT_CONFIG,
    "type.image": IMAGE_LIST_CONSTANT_CONFIG(),
  };
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

const LOCALIZED_CONSTANT_CONFIGS = new Set<ConstantFieldConfig>([
  TRANSLATABLE_STRING_CONSTANT_CONFIG,
  TRANSLATABLE_RICH_TEXT_CONSTANT_CONFIG,
  TRANSLATABLE_TEXT_LIST_CONSTANT_CONFIG,
]);

const supportsLocalizedConstantValue = (
  constantFieldConfig: ConstantFieldConfig | undefined
): boolean => {
  return (
    constantFieldConfig !== undefined &&
    LOCALIZED_CONSTANT_CONFIGS.has(constantFieldConfig)
  );
};

export const getConstantConfigFromType = (
  type: ConstantValueTypes,
  isList?: boolean,
  disallowTranslation?: boolean
): ConstantFieldConfig | undefined => {
  if (isList) {
    if (disallowTranslation) {
      return (
        LIST_TYPE_TO_NON_TRANSLATABLE_CONSTANT_CONFIG[type] ??
        LIST_TYPE_TO_CONSTANT_CONFIG()[type]
      );
    }
    return LIST_TYPE_TO_CONSTANT_CONFIG()[type];
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
 * Returns the constant type configuration when all field-type filters map to
 * a single compatible constant-input configuration.
 */
export const returnConstantFieldConfig = (
  typeFilter: EntityFieldTypes[] | undefined,
  isList: boolean,
  disallowTranslation: boolean
): ConstantFieldConfig | undefined => {
  if (!typeFilter) {
    return undefined;
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

export const EntityFieldSelectorFieldOverride = ({
  field,
  value,
  onChange,
}: EntityFieldSelectorFieldProps) => {
  const translatedLabel = field.label ? pt(field.label) : "";
  const constantValueFilter = field.constantValueFilter ?? field.filter;
  const constantValueEnabled =
    !field.disableConstantValueToggle && !!value?.constantValueEnabled;
  const allowsListValues = !!constantValueFilter.includeListsOnly;
  const canUseEmbeddedStringConstantValue =
    constantValueFilter.types?.includes("type.string") &&
    !allowsListValues &&
    !field.disallowTranslation;

  let constantFieldConfig = returnConstantFieldConfig(
    constantValueFilter.types,
    allowsListValues,
    !!field.disallowTranslation
  );

  if (!constantFieldConfig && canUseEmbeddedStringConstantValue) {
    constantFieldConfig = getConstantConfigFromType("type.string");
  }
  const constantValueModeSupported = !!constantFieldConfig;
  const showConstantValueInput =
    constantValueEnabled && constantValueModeSupported;

  return (
    <>
      {constantValueModeSupported ? (
        <ConstantValueModeToggler
          fieldTypeFilter={constantValueFilter.types ?? []}
          constantValueEnabled={constantValueEnabled}
          toggleConstantValueEnabled={(constantValueEnabled) =>
            onChange({
              ...value,
              constantValueEnabled,
            })
          }
          disableConstantValue={field.disableConstantValueToggle}
          label={translatedLabel}
          showLocale={supportsLocalizedConstantValue(constantFieldConfig)}
        />
      ) : (
        <FieldLabel label={translatedLabel} />
      )}
      {showConstantValueInput && (
        <ConstantValueInput
          onChange={onChange}
          value={value}
          filter={constantValueFilter}
          disallowTranslation={field.disallowTranslation}
          sourceFieldPath={
            field.sourceFieldPath ?? field.sourceEntityPath ?? undefined
          }
        />
      )}
      {!showConstantValueInput && (
        <EntityFieldInput
          className="ve-pt-3"
          onChange={onChange}
          value={value}
          filter={field.filter}
          sourceFieldPath={
            field.sourceFieldPath ?? field.sourceEntityPath ?? undefined
          }
        />
      )}
    </>
  );
};

export const ConstantValueModeToggler = ({
  fieldTypeFilter,
  constantValueEnabled,
  toggleConstantValueEnabled,
  disableConstantValue,
  label,
  showLocale,
}: {
  fieldTypeFilter: EntityFieldTypes[];
  constantValueEnabled: boolean;
  toggleConstantValueEnabled: (constantValueEnabled: boolean) => void;
  disableConstantValue?: boolean;
  label: string;
  showLocale?: boolean;
}) => {
  const constantValueInputSupported =
    !disableConstantValue &&
    fieldTypeFilter.some(
      (fieldType) =>
        Object.keys(TYPE_TO_CONSTANT_CONFIG).includes(fieldType) ||
        Object.keys(LIST_TYPE_TO_CONSTANT_CONFIG()).includes(fieldType)
    );
  const { i18n } = useTranslation();
  const locale = i18n.language;

  return (
    <div className="ve-w-full ve-flex ve-gap-3">
      {constantValueInputSupported && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="ve-flex ve-flex-row ve-self-center">
                <Switch
                  onCheckedChange={(entityFieldEnabled) =>
                    toggleConstantValueEnabled(!entityFieldEnabled)
                  }
                  checked={!constantValueEnabled}
                  icon={<KnowledgeGraphIcon enabled={!constantValueEnabled} />}
                  className="data-[state=unchecked]:ve-bg-gray-500"
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {constantValueEnabled
                ? pt("staticContent", "Static content")
                : pt("knowledgeGraphContent", "Knowledge Graph content")}
              <TooltipArrow fill="ve-bg-popover" />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <p
        className="ve-self-center ve-text-sm ve-font-semibold"
        style={{ color: "var(--puck-color-grey-04)" }}
      >
        {showLocale && constantValueEnabled
          ? `${pt(label)} (${locale})`
          : `${pt(label)}`}
      </p>
    </div>
  );
};

type InputProps<T extends Record<string, any>> = {
  filter: RenderEntityFieldFilter<T>;
  onChange: (value: any, uiState?: any) => void;
  value: any;
  className?: string;
  disallowTranslation?: boolean;
  label?: string;
  sourceFieldPath?: string;
};

export const ConstantValueInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  disallowTranslation,
  sourceFieldPath,
}: InputProps<T>) => {
  const isSingleStringField =
    filter.types?.includes("type.string") &&
    !filter.includeListsOnly &&
    !disallowTranslation;

  let constantFieldConfig = returnConstantFieldConfig(
    filter.types,
    !!filter.includeListsOnly,
    !!disallowTranslation
  );

  if (!constantFieldConfig && isSingleStringField) {
    // Support mixed string/rich-text field filters while keeping a plain
    // text constant input experience for components that opt into both.
    constantFieldConfig = getConstantConfigFromType(
      "type.string",
      false,
      !!disallowTranslation
    );
  }

  const { i18n } = useTranslation();
  const locale = i18n.language;
  const constantValue = value?.constantValue;
  const localizedConstantValue =
    typeof constantValue === "string"
      ? constantValue
      : constantValue &&
          typeof constantValue === "object" &&
          !Array.isArray(constantValue)
        ? (constantValue[locale] ?? constantValue.defaultValue ?? "")
        : "";
  const singleStringInputValue =
    typeof localizedConstantValue === "string" ? localizedConstantValue : "";

  if (!constantFieldConfig) {
    return;
  }

  const fieldEditor = isSingleStringField ? (
    <div className="ve-pt-3">
      <EmbeddedFieldStringInputFromEntity
        value={singleStringInputValue}
        onChange={(newInputValue) => {
          onChange({
            ...value,
            constantValue: {
              ...(typeof value?.constantValue === "object" &&
              !Array.isArray(value?.constantValue)
                ? value?.constantValue
                : {}),
              [locale]: newInputValue,
              hasLocalizedValue: "true",
            },
          });
        }}
        filter={filter}
        showFieldSelector={true}
        sourceFieldPath={sourceFieldPath}
      />
    </div>
  ) : (
    <YextAutoField
      onChange={(newConstantValue, uiState) =>
        onChange(
          {
            ...value,
            constantValue: newConstantValue,
          },
          uiState
        )
      }
      value={value?.constantValue}
      field={constantFieldConfig}
    />
  );

  return constantFieldConfig.type === "custom" ||
    isYextOverrideType(constantFieldConfig.type) ? (
    fieldEditor
  ) : (
    <FieldLabel
      label={constantFieldConfig.label ?? "Value"}
      el="div"
      className={`ve-inline-block w-full ${
        constantFieldConfig.label ? "ve-pt-3" : ""
      }`}
    >
      {fieldEditor}
    </FieldLabel>
  );
};

export const EntityFieldInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  className,
  label,
  sourceFieldPath,
}: InputProps<T>) => {
  const entityFields = useEntityFields();
  const templateMetadata = useTemplateMetadata();
  const streamDocument = useDocument();
  const sourceFieldFromProps = useResolvedSourceField(sourceFieldPath);
  const sourceField =
    sourceFieldFromProps ||
    (filter as { subdocumentField?: string }).subdocumentField ||
    "";
  const currentFieldPath = value?.field as string | undefined;
  const entityFieldSelector = React.useMemo<BasicSelectorField>(() => {
    const filteredEntityFields = getFieldsForSelector(
      entityFields,
      filter as any,
      streamDocument,
      sourceField || undefined
    );
    const options = filteredEntityFields.map((field) => ({
      label:
        field.displayName ??
        getEntityFieldDisplayName(
          sourceField ? `${sourceField}.${field.name}` : field.name,
          entityFields
        ) ??
        field.name,
      value: field.name,
      fieldPath: sourceField ? `${sourceField}.${field.name}` : field.name,
    }));

    if (
      currentFieldPath &&
      !options.some((option) => option.value === currentFieldPath)
    ) {
      options.push({
        label:
          getEntityFieldDisplayName(
            sourceField
              ? `${sourceField}.${currentFieldPath}`
              : currentFieldPath,
            entityFields
          ) ?? currentFieldPath,
        value: currentFieldPath,
        fieldPath: sourceField
          ? `${sourceField}.${currentFieldPath}`
          : currentFieldPath,
      });
    }

    return {
      type: "basicSelector",
      label,
      optionGroups: buildEntityFieldOptionGroups({
        entityFields,
        options: [
          {
            value: "",
            label: pt("entityTypeField", "{{entityType}} Field", {
              entityType: templateMetadata.entityTypeDisplayName,
            }),
            fieldPath: "",
          },
          ...options,
        ],
        linkedGroupTitle: pt("linkedEntityFields", "Linked Entity Fields"),
        entityGroupTitle: pt("entityFields", "Entity Fields"),
      }),
      translateOptions: false,
      noOptionsPlaceholder: pt("noAvailableFields", "No available fields"),
    };
  }, [
    entityFields,
    filter,
    label,
    currentFieldPath,
    sourceField,
    templateMetadata.entityTypeDisplayName,
    streamDocument,
  ]);

  const previousSourceField = React.useRef(sourceField);

  React.useEffect(() => {
    if (
      !sourceFieldPath ||
      previousSourceField.current === sourceField ||
      !value?.field
    ) {
      previousSourceField.current = sourceField;
      return;
    }

    previousSourceField.current = sourceField;
    onChange(
      {
        ...value,
        field: "",
      },
      undefined
    );
  }, [onChange, sourceField, sourceFieldPath, value]);

  React.useEffect(() => {
    if (
      sourceField ||
      filter.includeListsOnly ||
      !value?.field ||
      !isLinkedEntityFieldPath(value.field, entityFields)
    ) {
      return;
    }

    warnOnMultiValueLinkedEntityTraversal(streamDocument, value.field);
  }, [
    filter.includeListsOnly,
    entityFields,
    sourceField,
    streamDocument,
    value?.field,
  ]);

  return (
    <div className={`ve-inline-block ve-w-full ${className ?? ""}`}>
      <YextAutoField
        field={entityFieldSelector}
        onChange={(selectedEntityField, uiState) => {
          onChange(
            {
              ...value,
              field: selectedEntityField,
            },
            uiState
          );
        }}
        value={value?.field}
      />
    </div>
  );
};
