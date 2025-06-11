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
  TRANSLATABLE_RTF2_CONSTANT_CONFIG,
  TRANSLATABLE_STRING_CONSTANT_CONFIG,
} from "../internal/puck/constant-value-fields/Text.tsx";
import { ADDRESS_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Address.tsx";
import {
  TEXT_LIST_CONSTANT_CONFIG,
  TRANSLATABLE_TEXT_LIST_CONSTANT_CONFIG,
} from "../internal/puck/constant-value-fields/TextList.tsx";
import {
  CTA_CONSTANT_CONFIG,
  TRANSLATABLE_CTA_CONSTANT_CONFIG,
} from "../internal/puck/constant-value-fields/CallToAction.tsx";
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
import { pt } from "../utils/i18nPlatform.ts";

const devLogger = new DevLogger();

type RenderProps = Parameters<CustomField<any>["render"]>[0];

export type YextEntityField<T> = {
  field: string;
  constantValue: T;
  constantValueEnabled?: boolean;
  isTranslatable?: boolean;
};

export type YextCollection = {
  items: YextEntityField<Array<any>>;
  limit: string | number;
};

export type RenderYextEntityFieldSelectorProps<T extends Record<string, any>> =
  {
    label: string;
    filter: RenderEntityFieldFilter<T>;
    isCollection?: boolean;
    disableConstantValueToggle?: boolean;
    isTranslatable?: boolean;
  };

export const TYPE_TO_CONSTANT_CONFIG: Record<string, Field<any>> = {
  "type.string": TEXT_CONSTANT_CONFIG,
  "type.rich_text_v2": TEXT_CONSTANT_CONFIG,
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
    "type.string": TEXT_LIST_CONSTANT_CONFIG,
    "type.image": IMAGE_LIST_CONSTANT_CONFIG(),
  };
};

const TRANSLATABLE_TYPE_TO_CONSTANT_CONFIG: Record<string, Field<any>> = {
  "type.string": TRANSLATABLE_STRING_CONSTANT_CONFIG,
  "type.rich_text_v2": TRANSLATABLE_RTF2_CONSTANT_CONFIG,
  "type.cta": TRANSLATABLE_CTA_CONSTANT_CONFIG,
};

const TRANSLATABLE_LIST_TYPE_TO_CONSTANT_CONFIG: Record<string, Field<any>> = {
  "type.string": TRANSLATABLE_TEXT_LIST_CONSTANT_CONFIG,
  "type.rich_text_v2": TRANSLATABLE_TEXT_LIST_CONSTANT_CONFIG,
};

export const getConstantConfigFromType = (
  type: EntityFieldTypes,
  isList?: boolean,
  isTranslatable?: boolean
): Field<any> | undefined => {
  if (isList) {
    if (isTranslatable) {
      return (
        TRANSLATABLE_LIST_TYPE_TO_CONSTANT_CONFIG[type] ??
        LIST_TYPE_TO_CONSTANT_CONFIG()[type]
      );
    }
    return LIST_TYPE_TO_CONSTANT_CONFIG()[type];
  }
  const constantConfig = isTranslatable
    ? (TRANSLATABLE_TYPE_TO_CONSTANT_CONFIG[type] ??
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
 * @param isTranslatable
 */
const returnConstantFieldConfig = (
  typeFilter: EntityFieldTypes[] | undefined,
  isList: boolean,
  isTranslatable: boolean
): Field | undefined => {
  if (!typeFilter) {
    return undefined;
  }

  let fieldConfiguration: Field | undefined;
  for (const entityFieldType of typeFilter) {
    const mappedConfiguration = getConstantConfigFromType(
      entityFieldType,
      isList,
      isTranslatable
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
  // set "isTranslatable" to true if it is missing from props
  if (props.isTranslatable === undefined) {
    props.isTranslatable = true;
  }

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
            isCollection={!!props.isCollection}
            disableConstantValue={props.disableConstantValueToggle}
            label={pt(props.label)}
          />
          {value?.constantValueEnabled && !props.isCollection && (
            <ConstantValueInput<T>
              onChange={onChange}
              value={value}
              filter={props.filter}
              isTranslatable={props.isTranslatable}
            />
          )}
          {!value?.constantValueEnabled && (
            <EntityFieldInput<T>
              className="ve-pt-4"
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

/**
 * Allows the user to select an entity subfield from the document and set a constant value.
 */
export const YextCollectionSubfieldSelector = <
  T extends Record<string, any>,
  U,
>(
  props: RenderYextEntityFieldSelectorProps<T>
): Field<YextEntityField<U>> => {
  // If the field is not part of a collection, redirect to the normal entity field selector
  if (!props.isCollection) {
    return YextEntityFieldSelector({ ...props });
  }

  // set "isTranslatable" to true if it is missing from props
  if (props.isTranslatable === undefined) {
    props.isTranslatable = true;
  }

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
            isCollection={!!props.isCollection}
            disableConstantValue={props.disableConstantValueToggle}
            label={pt(props.label)}
          />
          {value?.constantValueEnabled ? (
            <ConstantValueInput<T>
              onChange={onChange}
              value={value}
              filter={props.filter}
              isTranslatable={props.isTranslatable}
            />
          ) : (
            <EntityFieldInput<T>
              className="ve-pt-4"
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
  isCollection,
  disableConstantValue,
  label,
}: {
  fieldTypeFilter: EntityFieldTypes[];
  constantValueEnabled: boolean;
  toggleConstantValueEnabled: (constantValueEnabled: boolean) => void;
  isCollection?: boolean;
  disableConstantValue?: boolean;
  label: string;
}) => {
  // If disableConstantValue is true, constantValueInputSupported is always false.
  // Else if isCollection or a supported field type, constantValueInputSupported is true
  const constantValueInputSupported =
    !disableConstantValue &&
    (isCollection ||
      fieldTypeFilter.some(
        (fieldType) =>
          Object.keys(TYPE_TO_CONSTANT_CONFIG).includes(fieldType) ||
          Object.keys(LIST_TYPE_TO_CONSTANT_CONFIG).includes(fieldType)
      ));

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
        {pt(label)}
      </p>
    </div>
  );
};

type InputProps<T extends Record<string, any>> = {
  filter: RenderEntityFieldFilter<T>;
  onChange: (value: any, uiState: any) => void;
  value: any;
  className?: string;
  isTranslatable?: boolean;
};

export const ConstantValueInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  isTranslatable,
}: InputProps<T>) => {
  const constantFieldConfig = returnConstantFieldConfig(
    filter.types,
    !!filter.includeListsOnly,
    !!isTranslatable
  );

  if (!constantFieldConfig) {
    return;
  }

  return constantFieldConfig.type === "custom" ? (
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
  ) : (
    <FieldLabel
      label={constantFieldConfig.label ?? "Value"}
      className={`ve-inline-block w-full ${constantFieldConfig.label ? "ve-pt-4" : ""}`}
    >
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
    </FieldLabel>
  );
};

export const EntityFieldInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  className,
}: InputProps<T>) => {
  const entityFields = useEntityFields();
  const templateMetadata = useTemplateMetadata();

  const basicSelectorField = React.useMemo(() => {
    let filteredEntityFields = getFilteredEntityFields(entityFields, filter);

    // If there are no direct children, return the parent field if it is a list
    if (filter.directChildrenOf && filteredEntityFields.length === 0) {
      filteredEntityFields = getFilteredEntityFields(entityFields, {
        allowList: [filter.directChildrenOf],
        types: filter.types,
        includeListsOnly: true,
      });
    }

    // TODO: translation concatenation
    return BasicSelector(
      templateMetadata.entityTypeDisplayName + " " + pt("field", "Field"),
      [
        {
          value: "",
          label: pt("basicSelectorContentLabel", "Select a Content field"),
        },
        ...filteredEntityFields
          .map((entityFieldNameToSchema) => {
            return {
              label:
                entityFieldNameToSchema.displayName ??
                entityFieldNameToSchema.name,
              value: entityFieldNameToSchema.name,
            };
          })
          .sort((entityFieldA, entityFieldB) => {
            const nameA = entityFieldA.label.toUpperCase();
            const nameB = entityFieldB.label.toUpperCase();
            return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
          }),
      ],
      false
    );
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
              constantValueOverride: {},
            },
            uiState
          );
        }}
        value={value?.field}
      />
    </div>
  );
};
