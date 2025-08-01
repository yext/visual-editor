import React from "react";
import { AutoField, FieldLabel, Field, CustomField } from "@measured/puck";
import {
  EntityFieldTypes,
  getFilteredEntityFields,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { DevLogger } from "../utils/devLogger.ts";
import { IMAGE_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Image.tsx";
import {
  TEXT_CONSTANT_CONFIG,
  TRANSLATABLE_RICH_TEXT_CONSTANT_CONFIG,
  TRANSLATABLE_STRING_CONSTANT_CONFIG,
} from "../internal/puck/constant-value-fields/Text.tsx";
import { ADDRESS_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Address.tsx";
import {
  TEXT_LIST_CONSTANT_CONFIG,
  TRANSLATABLE_TEXT_LIST_CONSTANT_CONFIG,
} from "../internal/puck/constant-value-fields/TextList.tsx";
import { CTA_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/CallToAction.tsx";
import { PHONE_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Phone.tsx";
import { BasicSelector } from "./BasicSelector.tsx";
import { useEntityFields } from "../hooks/useEntityFields.tsx";
import { useTemplateMetadata } from "../internal/hooks/useMessageReceivers.ts";
import { IMAGE_LIST_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/ImageList.tsx";
import { EVENT_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/EventSection.tsx";
import { INSIGHT_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/InsightSection.tsx";
import { PRODUCT_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/ProductSection.tsx";
import { FAQ_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/FAQsSection.tsx";
import { TEAM_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/TeamSection.tsx";
import { TESTIMONIAL_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/TestimonialSection.tsx";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../internal/puck/ui/Tooltip.tsx";
import { KnowledgeGraphIcon } from "./KnowledgeGraphIcon.tsx";
import { Switch } from "../internal/puck/ui/switch.tsx";
import { pt } from "../utils/i18n/platform.ts";
import { supportedStructEntityFieldTypes } from "./YextStructFieldSelector.tsx";
import { useTranslation } from "react-i18next";
import { StreamFields, YextSchemaField } from "../types/entityFields.ts";
import { EmbeddedFieldStringInput } from "./EmbeddedFieldStringInput.tsx";

const devLogger = new DevLogger();

type RenderProps = Parameters<CustomField<any>["render"]>[0];

export type YextEntityField<T> = {
  field: string;
  constantValue: T;
  constantValueEnabled?: boolean;
  disallowTranslation?: boolean;
};

export type RenderYextEntityFieldSelectorProps<T extends Record<string, any>> =
  {
    label: string;
    filter: RenderEntityFieldFilter<T>;
    disableConstantValueToggle?: boolean;
    disallowTranslation?: boolean;
  };

export const TYPE_TO_CONSTANT_CONFIG: Record<string, Field<any>> = {
  "type.string": TRANSLATABLE_STRING_CONSTANT_CONFIG,
  "type.rich_text_v2": TRANSLATABLE_RICH_TEXT_CONSTANT_CONFIG,
  "type.phone": PHONE_CONSTANT_CONFIG,
  "type.image": IMAGE_CONSTANT_CONFIG,
  "type.address": ADDRESS_CONSTANT_CONFIG,
  "type.cta": CTA_CONSTANT_CONFIG,
  "type.events_section": EVENT_SECTION_CONSTANT_CONFIG,
  "type.insights_section": INSIGHT_SECTION_CONSTANT_CONFIG,
  "type.products_section": PRODUCT_SECTION_CONSTANT_CONFIG,
  "type.faq_section": FAQ_SECTION_CONSTANT_CONFIG,
  "type.team_section": TEAM_SECTION_CONSTANT_CONFIG,
  "type.testimonials_section": TESTIMONIAL_SECTION_CONSTANT_CONFIG,
};

const LIST_TYPE_TO_CONSTANT_CONFIG = (): Record<string, Field<any>> => {
  return {
    "type.string": TRANSLATABLE_TEXT_LIST_CONSTANT_CONFIG,
    "type.image": IMAGE_LIST_CONSTANT_CONFIG(),
  };
};

const TYPE_TO_NON_TRANSLATABLE_CONSTANT_CONFIG: Record<string, Field<any>> = {
  "type.string": TEXT_CONSTANT_CONFIG,
  "type.rich_text_v2": TEXT_CONSTANT_CONFIG,
};

const LIST_TYPE_TO_NON_TRANSLATABLE_CONSTANT_CONFIG: Record<
  string,
  Field<any>
> = {
  "type.string": TEXT_LIST_CONSTANT_CONFIG,
  "type.rich_text_v2": TEXT_LIST_CONSTANT_CONFIG,
};

export const getConstantConfigFromType = (
  type: EntityFieldTypes,
  isList?: boolean,
  disallowTranslation?: boolean
): Field<any> | undefined => {
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
 * Returns the constant type configuration if all types match
 * @param typeFilter
 * @param isList
 * @param disallowTranslation
 */
const returnConstantFieldConfig = (
  typeFilter: EntityFieldTypes[] | undefined,
  isList: boolean,
  disallowTranslation: boolean
): Field | undefined => {
  if (!typeFilter) {
    return undefined;
  }

  let fieldConfiguration: Field | undefined;
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

/**
 * Allows the user to select an entity field from the document and set a constant value.
 */
export const YextEntityFieldSelector = <T extends Record<string, any>, U>(
  props: RenderYextEntityFieldSelectorProps<T>
): Field<YextEntityField<U>> => {
  return {
    type: "custom",
    render: ({ value, onChange }: RenderProps) => {
      const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
        onChange({
          field: value?.field ?? "",
          constantValue: value?.constantValue ?? "",
          constantValueEnabled: constantValueEnabled,
        });
      };

      return (
        <>
          <ConstantValueModeToggler
            fieldTypeFilter={props.filter.types ?? []}
            constantValueEnabled={value?.constantValueEnabled}
            toggleConstantValueEnabled={toggleConstantValueEnabled}
            disableConstantValue={props.disableConstantValueToggle}
            label={pt(props.label)}
            showLocale={
              props.filter.types?.includes("type.string") &&
              !props.disallowTranslation
            }
          />
          {value?.constantValueEnabled && (
            <ConstantValueInput<T>
              onChange={onChange}
              value={value}
              filter={props.filter}
              disallowTranslation={props.disallowTranslation}
            />
          )}
          {!value?.constantValueEnabled && (
            <EntityFieldInput<T>
              className="ve-pt-3"
              onChange={onChange}
              value={value}
              filter={props.filter}
            />
          )}
        </>
      );
    },
  };
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
  // If disableConstantValue is true, constantValueInputSupported is always false.
  // Else if the field type is supported by constant value input, constantValueInputSupported is true
  const constantValueInputSupported =
    !disableConstantValue &&
    (fieldTypeFilter.some(
      (fieldType) =>
        Object.keys(TYPE_TO_CONSTANT_CONFIG).includes(fieldType) ||
        Object.keys(LIST_TYPE_TO_CONSTANT_CONFIG).includes(fieldType)
    ) ||
      fieldTypeFilter.some((fieldType) =>
        supportedStructEntityFieldTypes.includes(fieldType)
      ));
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
      <p className="ve-self-center ve-text-sm ve-text-gray-800 ve-font-semibold">
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
  hideSelectAFieldOption?: boolean;
};

export const ConstantValueInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  disallowTranslation,
}: InputProps<T>) => {
  const constantFieldConfig = returnConstantFieldConfig(
    filter.types,
    !!filter.includeListsOnly,
    !!disallowTranslation
  );
  const { i18n } = useTranslation();
  const locale = i18n.language;

  if (!constantFieldConfig) {
    return;
  }

  const isSingleStringField =
    filter.types?.includes("type.string") && !filter.includeListsOnly;

  const fieldEditor = isSingleStringField ? (
    <div className="ve-pt-3">
      <EmbeddedFieldStringInput
        value={value?.constantValue?.[locale] ?? ""}
        onChange={(newInputValue) => {
          onChange({
            field: value?.field ?? "",
            constantValue: {
              ...value?.constantValue,
              [locale]: newInputValue,
            },
            constantValueEnabled: true,
          });
        }}
        filter={filter}
      />
    </div>
  ) : (
    <AutoField
      onChange={(newConstantValue, uiState) =>
        onChange(
          {
            field: value?.field ?? "",
            constantValue: newConstantValue,
            constantValueEnabled: true,
          },
          uiState
        )
      }
      value={value?.constantValue}
      field={constantFieldConfig}
    />
  );

  return constantFieldConfig.type === "custom" ? (
    fieldEditor
  ) : (
    <FieldLabel
      label={constantFieldConfig.label ?? "Value"}
      className={`ve-inline-block w-full ${
        constantFieldConfig.label ? "ve-pt-3" : ""
      }`}
    >
      {fieldEditor}
    </FieldLabel>
  );
};

export const getFieldsForSelector = (
  entityFields: StreamFields | null,
  filter: RenderEntityFieldFilter<any>
): YextSchemaField[] => {
  let filteredEntityFields = getFilteredEntityFields(entityFields, filter);

  // If there are no direct children, return the parent field if it is a list
  if (filter.directChildrenOf && filteredEntityFields.length === 0) {
    filteredEntityFields = getFilteredEntityFields(entityFields, {
      allowList: [filter.directChildrenOf],
      types: filter.types,
      includeListsOnly: true,
    });
  }

  return filteredEntityFields.sort((entityFieldA, entityFieldB) => {
    const nameA = (entityFieldA.displayName ?? entityFieldA.name).toUpperCase();
    const nameB = (entityFieldB.displayName ?? entityFieldB.name).toUpperCase();
    return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
  });
};

export const EntityFieldInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  className,
  hideSelectAFieldOption,
}: InputProps<T>) => {
  const entityFields = useEntityFields();
  const templateMetadata = useTemplateMetadata();

  const basicSelectorField = React.useMemo(() => {
    const filteredEntityFields = getFieldsForSelector(entityFields, filter);
    const entityFieldOptions = filteredEntityFields.map((field) => ({
      label: field.displayName ?? field.name,
      value: field.name,
    }));

    const options = hideSelectAFieldOption
      ? [...entityFieldOptions]
      : [
          {
            value: "",
            label: pt("basicSelectorContentLabel", "Select a Content field"),
          },
          ...entityFieldOptions,
        ];

    // If hideSelectAFieldOption, set to the first available field,
    // or unset if there are no fields available.
    if (hideSelectAFieldOption && !value.constantValueEnabled) {
      if (filteredEntityFields.length > 0 && value.field === "") {
        onChange({
          ...value,
          field: filteredEntityFields[0].name,
        });
      }
      if (filteredEntityFields.length === 0 && value.field !== "") {
        onChange({
          ...value,
          field: "",
        });
      }
    }

    // TODO: translation concatenation
    return BasicSelector({
      label:
        templateMetadata.entityTypeDisplayName + " " + pt("field", "Field"),
      options,
      translateOptions: false,
      noOptionsPlaceholder: pt("noAvailableFields", "No available fields"),
      noOptionsMessage: getNoFieldsFoundMessage(filter),
      icon: null,
    });
  }, [entityFields, filter]);

  return (
    <div className={"ve-inline-block ve-w-full " + className}>
      <AutoField
        field={basicSelectorField}
        onChange={(selectedEntityField, uiState) => {
          onChange(
            {
              field: selectedEntityField,
              constantValue: value?.constantValue ?? "",
              constantValueEnabled: false,
              constantValueOverride: value?.constantValueOverride,
            },
            uiState
          );
        }}
        value={value?.field}
      />
    </div>
  );
};

const getNoFieldsFoundMessage = (
  filter: RenderEntityFieldFilter<any>
): string | undefined => {
  if (!filter.types?.length || filter.allowList) {
    return;
  }

  if (filter.types.includes("type.hero_section")) {
    return pt(
      "noHeroFieldsMsg",
      "To use entity content for this section, add a Hero Section field to your page group's entity type."
    );
  }
  if (filter.types.includes("type.promo_section")) {
    return pt(
      "noPromoFieldsMsg",
      "To use entity content for this section, add a Promo Section field to your page group's entity type."
    );
  }
};
