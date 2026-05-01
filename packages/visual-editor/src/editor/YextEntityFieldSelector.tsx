import React from "react";
import { FieldLabel, Field, CustomField } from "@puckeditor/core";
import { type BasicSelectorField } from "../fields/BasicSelectorField.tsx";
import { type YextArrayField, type YextFieldDefinition } from "./YextField.tsx";
import { YextPuckFieldOverrides } from "../fields/fields.ts";
import { YextAutoField } from "../fields/YextAutoField.tsx";
import { DATE_TIME_CONSTANT_CONFIG } from "../fields/DateTimeSelectorField.tsx";
import { type ImageField } from "../fields/ImageField.tsx";
import {
  ConstantValueTypes,
  EntityFieldTypes,
  type RenderEntityFieldFilter,
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
import { KnowledgeGraphIcon } from "./KnowledgeGraphIcon.tsx";
import { Switch } from "../internal/puck/ui/switch.tsx";
import { pt } from "../utils/i18n/platform.ts";
import { useTranslation } from "react-i18next";
import { EmbeddedFieldStringInputFromEntity } from "./EmbeddedFieldStringInput.tsx";
import { EmbeddedFieldStringInputFromOptions } from "./EmbeddedFieldStringInput.tsx";
import { FAQ_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/FAQsSection.tsx";
import {
  getFieldsForSelector,
  getEntityFieldDisplayName,
  getSubfieldsForSelector,
  type YextEntityField,
} from "./yextEntityFieldUtils.ts";
import { useDocument } from "../hooks/useDocument.tsx";
import { isLinkedEntityFieldPath } from "../utils/linkedEntityFieldUtils.ts";
import { type MappedSourceFieldFilter } from "../utils/cardSlots/mappedSource.ts";
import { warnOnMultiValueLinkedEntityTraversal } from "../utils/linkedEntityWarningUtils.ts";
import { buildEntityFieldOptionGroups } from "./entityFieldOptionGroups.ts";

const devLogger = new DevLogger();

type RenderProps = Parameters<CustomField<any>["render"]>[0];
type ConstantFieldConfig<ValueType = any> = YextFieldDefinition<ValueType>;

const isYextPuckFieldType = (
  type: string
): type is keyof typeof YextPuckFieldOverrides => {
  return type in YextPuckFieldOverrides;
};

export type { YextEntityField } from "./yextEntityFieldUtils.ts";
export type RenderYextEntityFieldSelectorProps<T extends Record<string, any>> =
  {
    label: string;
    filter: MappedSourceFieldFilter<T>;
    disableConstantValueToggle?: boolean;
    disallowTranslation?: boolean;
  };

export type RenderYextSubfieldSelectorProps<T extends Record<string, any>> = {
  label: string;
  sourceField: string;
  filter: RenderEntityFieldFilter<T>;
  disableConstantValueToggle?: boolean;
  disallowTranslation?: boolean;
};

const IMAGE_CONSTANT_CONFIG: ImageField = {
  type: "image",
};

const IMAGE_LIST_CONSTANT_CONFIG = (): YextArrayField<any> => {
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
 * Returns the constant type configuration if all types match
 * @param typeFilter
 * @param isList
 * @param disallowTranslation
 */
const returnConstantFieldConfig = (
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

/**
 * Allows the user to select an entity field from the document and set a constant value.
 */
export const YextEntityFieldSelector = <T extends Record<string, any>, U>(
  props: RenderYextEntityFieldSelectorProps<T>
): Field<YextEntityField<U>> => {
  return {
    type: "custom",
    render: ({ value, onChange }: RenderProps) => {
      const constantValueEnabled =
        !props.disableConstantValueToggle && !!value?.constantValueEnabled;

      const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
        onChange({
          ...value,
          constantValueEnabled: constantValueEnabled,
        });
      };

      return (
        <>
          <ConstantValueModeToggler
            fieldTypeFilter={props.filter.types ?? []}
            constantValueEnabled={constantValueEnabled}
            toggleConstantValueEnabled={toggleConstantValueEnabled}
            disableConstantValue={props.disableConstantValueToggle}
            label={pt(props.label)}
            showLocale={
              props.filter.types?.includes("type.string") &&
              !props.disallowTranslation
            }
          />
          {constantValueEnabled && (
            <ConstantValueInput<T>
              onChange={onChange}
              value={value}
              filter={props.filter}
              disallowTranslation={props.disallowTranslation}
            />
          )}
          {!constantValueEnabled && (
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

/**
 * Allows the user to select only descendants of an already-selected mapped
 * source such as a linked entity or list item.
 */
export const YextSubfieldSelector = <T extends Record<string, any>, U>(
  props: RenderYextSubfieldSelectorProps<T>
): Field<YextEntityField<U>> => {
  return {
    type: "custom",
    render: ({ value, onChange }: RenderProps) => {
      const constantValueEnabled =
        !props.disableConstantValueToggle && !!value?.constantValueEnabled;

      return (
        <>
          <ConstantValueModeToggler
            fieldTypeFilter={props.filter.types ?? []}
            constantValueEnabled={constantValueEnabled}
            toggleConstantValueEnabled={(nextConstantValueEnabled) =>
              onChange({
                ...value,
                constantValueEnabled: nextConstantValueEnabled,
              })
            }
            disableConstantValue={props.disableConstantValueToggle}
            label={pt(props.label)}
            showLocale={
              props.filter.types?.includes("type.string") &&
              !props.disallowTranslation
            }
          />
          {constantValueEnabled ? (
            <SubfieldConstantValueInput<T>
              className="ve-pt-3"
              filter={props.filter}
              onChange={onChange}
              sourceField={props.sourceField}
              value={value}
              disallowTranslation={props.disallowTranslation}
            />
          ) : (
            <SubfieldInput<T>
              className="ve-pt-3"
              filter={props.filter}
              onChange={onChange}
              sourceField={props.sourceField}
              value={value}
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
    fieldTypeFilter.some(
      (fieldType) =>
        Object.keys(TYPE_TO_CONSTANT_CONFIG).includes(fieldType) ||
        Object.keys(LIST_TYPE_TO_CONSTANT_CONFIG).includes(fieldType)
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
};

type SubfieldInputProps<T extends Record<string, any>> = InputProps<T> & {
  sourceField: string;
};

export const ConstantValueInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  disallowTranslation,
}: InputProps<T>) => {
  const isSingleStringField =
    filter.types?.includes("type.string") && !filter.includeListsOnly;

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
    isYextPuckFieldType(constantFieldConfig.type) ? (
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

const getSubfieldOptions = (
  entityFields: ReturnType<typeof useEntityFields>,
  sourceField: string,
  filter: RenderEntityFieldFilter<any>,
  streamDocument: ReturnType<typeof useDocument>
): { label: string; value: string }[] => {
  const rootDisplayName = getEntityFieldDisplayName(sourceField, entityFields);
  const rootPrefix = rootDisplayName ? `${rootDisplayName} > ` : undefined;

  return getSubfieldsForSelector(
    entityFields,
    sourceField,
    filter,
    streamDocument
  ).map((field) => {
    const displayName =
      field.displayName ??
      getEntityFieldDisplayName(field.name, entityFields) ??
      field.name;

    return {
      label:
        rootPrefix && displayName.startsWith(rootPrefix)
          ? displayName.slice(rootPrefix.length)
          : displayName,
      value: field.name.slice(sourceField.length + 1),
    };
  });
};

export const EntityFieldInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  className,
  label,
}: InputProps<T>) => {
  const entityFields = useEntityFields();
  const templateMetadata = useTemplateMetadata();
  const streamDocument = useDocument();
  const entityFieldSelector = React.useMemo<BasicSelectorField>(() => {
    const filteredEntityFields = getFieldsForSelector(
      entityFields,
      filter,
      streamDocument
    );

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
          ...filteredEntityFields.map((field) => ({
            label: field.displayName ?? field.name,
            value: field.name,
            fieldPath: field.name,
          })),
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
    templateMetadata.entityTypeDisplayName,
    streamDocument,
  ]);

  React.useEffect(() => {
    if (
      filter.includeListsOnly ||
      !value?.field ||
      !isLinkedEntityFieldPath(value.field, entityFields)
    ) {
      return;
    }

    warnOnMultiValueLinkedEntityTraversal(streamDocument, value.field);
  }, [filter.includeListsOnly, entityFields, streamDocument, value?.field]);

  return (
    <div className={"ve-inline-block ve-w-full " + className}>
      <YextAutoField
        field={entityFieldSelector}
        onChange={(selectedEntityField, uiState) =>
          onChange(
            {
              ...value,
              field: selectedEntityField,
            },
            uiState
          )
        }
        value={value?.field}
      />
    </div>
  );
};

const SubfieldConstantValueInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  className,
  disallowTranslation,
  sourceField,
}: SubfieldInputProps<T>) => {
  const entityFields = useEntityFields();
  const streamDocument = useDocument();
  const subfieldOptions = React.useMemo(
    () => getSubfieldOptions(entityFields, sourceField, filter, streamDocument),
    [entityFields, filter, sourceField, streamDocument]
  );
  const isSingleStringField =
    filter.types?.includes("type.string") && !filter.includeListsOnly;
  let constantFieldConfig = returnConstantFieldConfig(
    filter.types,
    !!filter.includeListsOnly,
    !!disallowTranslation
  );

  if (!constantFieldConfig && isSingleStringField) {
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

  if (!constantFieldConfig) {
    return;
  }

  const fieldEditor = isSingleStringField ? (
    <div className={className}>
      <EmbeddedFieldStringInputFromOptions
        value={
          typeof localizedConstantValue === "string"
            ? localizedConstantValue
            : ""
        }
        onChange={(newInputValue) =>
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
          })
        }
        optionGroups={[{ options: subfieldOptions }]}
        showFieldSelector={true}
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
    isYextPuckFieldType(constantFieldConfig.type) ? (
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

export const SubfieldInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  className,
  label,
  sourceField,
}: SubfieldInputProps<T>) => {
  const entityFields = useEntityFields();
  const streamDocument = useDocument();
  const currentFieldPath = value?.field as string | undefined;
  const currentSubfieldValue = currentFieldPath?.startsWith(`${sourceField}.`)
    ? currentFieldPath.slice(sourceField.length + 1)
    : "";
  const subfieldOptions = React.useMemo(() => {
    const nextSubfieldOptions = getSubfieldOptions(
      entityFields,
      sourceField,
      filter,
      streamDocument
    );

    if (
      currentFieldPath?.startsWith(`${sourceField}.`) &&
      currentSubfieldValue &&
      !nextSubfieldOptions.some(
        (option) => option.value === currentSubfieldValue
      )
    ) {
      const rootDisplayName = getEntityFieldDisplayName(
        sourceField,
        entityFields
      );
      const rootPrefix = rootDisplayName ? `${rootDisplayName} > ` : undefined;
      const currentDisplayName =
        getEntityFieldDisplayName(currentFieldPath, entityFields) ??
        currentSubfieldValue;

      nextSubfieldOptions.push({
        label:
          rootPrefix && currentDisplayName.startsWith(rootPrefix)
            ? currentDisplayName.slice(rootPrefix.length)
            : currentDisplayName,
        value: currentSubfieldValue,
      });
    }

    return nextSubfieldOptions;
  }, [
    currentFieldPath,
    currentSubfieldValue,
    entityFields,
    filter,
    sourceField,
    streamDocument,
  ]);

  return (
    <div className={"ve-inline-block ve-w-full " + className}>
      <YextAutoField
        field={{
          type: "basicSelector",
          label,
          optionGroups: [
            {
              options: [
                {
                  value: "",
                  label: pt("fields.options.selectAField", "Select a field"),
                },
                ...subfieldOptions,
              ],
            },
          ],
          translateOptions: false,
          noOptionsPlaceholder: pt("noAvailableFields", "No available fields"),
        }}
        onChange={(selectedSubfield, uiState) =>
          onChange(
            {
              ...value,
              field: selectedSubfield
                ? `${sourceField}.${selectedSubfield}`
                : "",
            },
            uiState
          )
        }
        value={currentSubfieldValue}
      />
    </div>
  );
};
