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
import { FAQ_SECTION_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/FAQsSection.tsx";
import {
  getFieldsForSelector,
  getEntityFieldDisplayName,
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
  filter: MappedSourceFieldFilter<T>;
  onChange: (value: any, uiState?: any) => void;
  value: any;
  className?: string;
  disallowTranslation?: boolean;
  label?: string;
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
  const descendantRoot = filter.subdocumentField;
  const currentFieldPath = value?.field as string | undefined;
  const hasValidDescendantSelection =
    !descendantRoot ||
    !currentFieldPath ||
    currentFieldPath.startsWith(`${descendantRoot}.`);
  const entityFieldSelector = React.useMemo<BasicSelectorField>(() => {
    const filteredEntityFields = getFieldsForSelector(
      entityFields,
      {
        ...filter,
      },
      streamDocument
    );
    const descendantRootDisplayName = descendantRoot
      ? getEntityFieldDisplayName(descendantRoot, entityFields)
      : undefined;
    const currentOptionValue =
      descendantRoot && hasValidDescendantSelection && currentFieldPath
        ? currentFieldPath.slice(descendantRoot.length + 1)
        : currentFieldPath;
    const fieldOptions = filteredEntityFields.map((field) => {
      const displayName =
        field.displayName ??
        getEntityFieldDisplayName(field.name, entityFields) ??
        field.name;

      return {
        label:
          descendantRootDisplayName &&
          displayName.startsWith(`${descendantRootDisplayName} > `)
            ? displayName.slice(descendantRootDisplayName.length + 3)
            : displayName,
        value:
          descendantRoot && field.name.startsWith(`${descendantRoot}.`)
            ? field.name.slice(descendantRoot.length + 1)
            : field.name,
        fieldPath: field.name,
      };
    });
    const scopedFieldOptions = descendantRoot
      ? fieldOptions.filter((option) =>
          option.fieldPath.startsWith(`${descendantRoot}.`)
        )
      : fieldOptions;
    if (descendantRoot && scopedFieldOptions.length !== fieldOptions.length) {
      devLogger.log(
        `Scoped entity field options stripped for ${descendantRoot}: ${JSON.stringify(
          {
            originalFieldPaths: fieldOptions.map((option) => option.fieldPath),
            keptFieldPaths: scopedFieldOptions.map(
              (option) => option.fieldPath
            ),
          }
        )}`
      );
    }
    if (
      hasValidDescendantSelection &&
      currentFieldPath &&
      currentOptionValue &&
      !scopedFieldOptions.some((option) => option.value === currentOptionValue)
    ) {
      const savedFieldDisplayName =
        getEntityFieldDisplayName(currentFieldPath, entityFields) ??
        currentOptionValue;

      scopedFieldOptions.push({
        label:
          descendantRootDisplayName &&
          savedFieldDisplayName.startsWith(`${descendantRootDisplayName} > `)
            ? savedFieldDisplayName.slice(descendantRootDisplayName.length + 3)
            : savedFieldDisplayName,
        value: currentOptionValue,
        fieldPath: currentFieldPath,
      });
    }

    const optionGroups = descendantRoot
      ? [
          {
            options: [
              {
                value: "",
                label: pt("fields.options.selectAField", "Select a field"),
              },
              ...scopedFieldOptions.map(
                ({ fieldPath: _fieldPath, ...option }) => option
              ),
            ],
          },
        ]
      : buildEntityFieldOptionGroups({
          entityFields,
          options: [
            {
              value: "",
              label: pt("entityTypeField", "{{entityType}} Field", {
                entityType: templateMetadata.entityTypeDisplayName,
              }),
              fieldPath: "",
            },
            ...scopedFieldOptions,
          ],
          linkedGroupTitle: pt("linkedEntityFields", "Linked Entity Fields"),
          entityGroupTitle: pt("entityFields", "Entity Fields"),
        });

    return {
      type: "basicSelector",
      label,
      optionGroups,
      translateOptions: false,
      noOptionsPlaceholder: pt("noAvailableFields", "No available fields"),
    };
  }, [
    entityFields,
    hasValidDescendantSelection,
    descendantRoot,
    filter,
    label,
    templateMetadata.entityTypeDisplayName,
    currentFieldPath,
    streamDocument,
  ]);

  React.useEffect(() => {
    if (
      descendantRoot ||
      filter.includeListsOnly ||
      !value?.field ||
      !isLinkedEntityFieldPath(value.field, entityFields)
    ) {
      return;
    }

    warnOnMultiValueLinkedEntityTraversal(streamDocument, value.field);
  }, [
    descendantRoot,
    filter.includeListsOnly,
    entityFields,
    streamDocument,
    value?.field,
  ]);

  return (
    <div className={"ve-inline-block ve-w-full " + className}>
      <YextAutoField
        field={entityFieldSelector}
        onChange={(selectedEntityField, uiState) => {
          onChange(
            {
              ...value,
              field:
                descendantRoot &&
                selectedEntityField &&
                !selectedEntityField.startsWith(`${descendantRoot}.`)
                  ? `${descendantRoot}.${selectedEntityField}`
                  : selectedEntityField,
            },
            uiState
          );
        }}
        value={
          descendantRoot && value?.field?.startsWith(`${descendantRoot}.`)
            ? value.field.slice(descendantRoot.length + 1)
            : value?.field
        }
      />
    </div>
  );
};
