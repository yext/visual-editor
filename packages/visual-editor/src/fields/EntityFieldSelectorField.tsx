import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { type YextFieldDefinition } from "./fields.ts";
import { type BasicSelectorField } from "./BasicSelectorField.tsx";
import { YextAutoField } from "./YextAutoField.tsx";
import {
  ConstantValueTypes,
  EntityFieldTypes,
  RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { useEntityFields } from "../hooks/useEntityFields.tsx";
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
import {
  getFieldsForSelector,
  getEntityFieldScopeDisplayName,
  getScopedEntityFieldDisplayName,
} from "../editor/yextEntityFieldUtils.ts";
import { useDocument } from "../hooks/useDocument.tsx";
import { isLinkedEntityFieldPath } from "../utils/linkedEntityFieldUtils.ts";
import { warnOnMultiValueLinkedEntityTraversal } from "../utils/linkedEntityWarningUtils.ts";
import { buildEntityFieldOptionGroups } from "../editor/entityFieldOptionGroups.ts";
import { type MappedSourceFieldFilter } from "../utils/cardSlots/mappedSource.ts";
import { useCurrentSourceField } from "../hooks/useCurrentSourceField.tsx";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import {
  type RepeatedEntityFieldMetadata,
  type RepeatedEntityFieldValue,
} from "../utils/itemSource/itemSourceTypes.ts";
import {
  getConstantConfigFromType,
  returnConstantFieldConfig,
  supportsLocalizedConstantValue,
} from "./entityFieldConstantConfig.ts";
export {
  getConstantConfigFromType,
  returnConstantFieldConfig,
} from "./entityFieldConstantConfig.ts";

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
  repeated?: RepeatedEntityFieldMetadata<any>;
};

type EntityFieldSelectorFieldProps = FieldProps<EntityFieldSelectorField>;

const RepeatedEntitySourceFieldContext = React.createContext<
  string | undefined
>(undefined);

const clearEntityFieldBindings = (value: unknown): unknown => {
  if (
    value &&
    typeof value === "object" &&
    "field" in value &&
    "constantValue" in value
  ) {
    return {
      ...value,
      field: "",
    };
  }

  if (Array.isArray(value)) {
    return value.map(clearEntityFieldBindings);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        clearEntityFieldBindings(nestedValue),
      ])
    );
  }

  return value;
};

const hasEntityFieldBindings = (value: unknown): boolean => {
  if (
    value &&
    typeof value === "object" &&
    "field" in value &&
    "constantValue" in value
  ) {
    return !!(value as { field?: string }).field;
  }

  if (Array.isArray(value)) {
    return value.some(hasEntityFieldBindings);
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(hasEntityFieldBindings);
  }

  return false;
};

/**
 * Renders repeated linked-item editing on top of one `entityField` value.
 *
 * 1. Lets the user switch between linked-list mode and manual-item mode.
 * 2. Shows either the linked source selector or the inline manual item editor.
 * 3. Clears stale linked mapping selections when the user switches between
 *    linked parent sources while preserving any authored constant values.
 */
const RepeatedEntityFieldSelector = ({
  field,
  repeated,
  onChange,
  value,
}: EntityFieldSelectorFieldProps & {
  repeated: RepeatedEntityFieldMetadata<Record<string, unknown>>;
}) => {
  const translatedLabel = field.label ? pt(field.label) : "";
  const constantValueEnabled = !!value?.constantValueEnabled;
  const baseValue: RepeatedEntityFieldValue<Record<string, unknown>> = {
    field: value?.field ?? "",
    constantValueEnabled: value?.constantValueEnabled ?? true,
    constantValue: value?.constantValue ?? [repeated.defaultItemValue],
    mappings: value?.mappings ?? repeated.defaultMappings,
  };
  const itemListField = React.useMemo<YextFieldDefinition<any[]>>(
    () => ({
      type: "array",
      label: "",
      arrayFields: repeated.manualItemFields,
      defaultItemProps: repeated.defaultItemValue,
      getItemSummary:
        repeated.manualItemSummary ??
        ((_, index) => pt("item", "Item") + " " + String((index ?? 0) + 1)),
    }),
    [
      repeated.defaultItemValue,
      repeated.manualItemFields,
      repeated.manualItemSummary,
    ]
  );
  const mappingsField = React.useMemo<YextFieldDefinition<any>>(
    () => ({
      type: "object",
      label: "",
      objectFields: repeated.mappingFields,
    }),
    [repeated.mappingFields]
  );

  const updateRepeatedValue = React.useCallback(
    (nextValue: RepeatedEntityFieldValue<Record<string, unknown>>) => {
      const previousField =
        !baseValue.constantValueEnabled && typeof baseValue.field === "string"
          ? baseValue.field
          : "";
      const nextField =
        !nextValue.constantValueEnabled && typeof nextValue.field === "string"
          ? nextValue.field
          : "";

      if (
        !previousField ||
        !nextField ||
        previousField === nextField ||
        !hasEntityFieldBindings(baseValue.mappings)
      ) {
        onChange(nextValue);
        return;
      }

      onChange({
        ...nextValue,
        mappings: clearEntityFieldBindings(baseValue.mappings),
      });
    },
    [baseValue, onChange]
  );

  return (
    <>
      <ConstantValueModeToggler
        fieldTypeFilter={["type.string"]}
        constantValueEnabled={constantValueEnabled}
        toggleConstantValueEnabled={(nextConstantValueEnabled) =>
          onChange({
            ...baseValue,
            constantValueEnabled: nextConstantValueEnabled,
          })
        }
        label={translatedLabel}
      />
      {constantValueEnabled ? (
        <div className="ve-pt-3">
          <YextAutoField
            field={itemListField}
            onChange={(constantValue) =>
              onChange({
                ...baseValue,
                constantValue,
              })
            }
            value={baseValue.constantValue ?? []}
          />
        </div>
      ) : (
        <>
          <EntityFieldInput
            className="ve-pt-3"
            onChange={updateRepeatedValue}
            value={baseValue}
            filter={field.filter}
          />
          {!!baseValue.field && (
            <RepeatedEntitySourceFieldContext.Provider value={baseValue.field}>
              <div className="ve-pt-3">
                <YextAutoField
                  field={mappingsField}
                  onChange={(mappings) =>
                    onChange({
                      ...baseValue,
                      mappings,
                    })
                  }
                  value={baseValue.mappings ?? repeated.defaultMappings}
                />
              </div>
            </RepeatedEntitySourceFieldContext.Provider>
          )}
        </>
      )}
    </>
  );
};

export const EntityFieldSelectorFieldOverride = ({
  field,
  value,
  onChange,
}: EntityFieldSelectorFieldProps) => {
  if (field.repeated) {
    return (
      <RepeatedEntityFieldSelector
        field={field}
        repeated={field.repeated}
        value={value}
        onChange={onChange}
      />
    );
  }

  const translatedLabel = field.label ? pt(field.label) : "";
  const constantValueFilter = field.constantValueFilter ?? field.filter;
  const constantValueEnabled =
    !field.disableConstantValueToggle && !!value?.constantValueEnabled;
  const allowsListValues = !!constantValueFilter.includeListsOnly;
  const constantFieldConfig = returnConstantFieldConfig(
    constantValueFilter.types,
    allowsListValues,
    !!field.disallowTranslation
  );
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
          sourceField={field.filter.subdocumentField}
          sourceFieldPath={field.sourceFieldPath}
        />
      )}
      {!showConstantValueInput && (
        <EntityFieldInput
          className="ve-pt-3"
          onChange={onChange}
          value={value}
          filter={field.filter}
          sourceField={field.filter.subdocumentField}
          sourceFieldPath={field.sourceFieldPath}
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
        !!getConstantConfigFromType(fieldType as ConstantValueTypes) ||
        !!getConstantConfigFromType(fieldType as ConstantValueTypes, true)
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
  sourceField?: string;
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

  if (!constantFieldConfig) {
    return;
  }

  const fieldEditor = (
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

/**
 * Renders the KG field picker for one entity-field value.
 *
 * 1. Resolves the active source-field scope from explicit props, repeated-item
 *    context, the current source-field path, or the field filter.
 * 2. Builds option labels relative to that scope so repeated-item mappings show
 *    labels like "Products Fields" instead of the template entity type.
 * 3. Preserves the current selection in the option list even when the active
 *    filter would otherwise exclude it.
 */
export const EntityFieldInput = <T extends Record<string, any>>({
  filter,
  onChange,
  value,
  className,
  label,
  sourceFieldPath,
  sourceField: sourceFieldFromInputProps,
}: InputProps<T>) => {
  const entityFields = useEntityFields();
  const streamDocument = useDocument();
  const templateMetadata = React.useContext(TemplateMetadataContext);
  const sourceFieldFromContext = React.useContext(
    RepeatedEntitySourceFieldContext
  );
  const sourceFieldFromProps = useCurrentSourceField(sourceFieldPath);
  const sourceField =
    sourceFieldFromInputProps ||
    sourceFieldFromContext ||
    sourceFieldFromProps ||
    filter.subdocumentField ||
    "";
  const currentFieldPath = value?.field as string | undefined;
  const sourceFieldDisplayName = getEntityFieldScopeDisplayName(
    sourceField,
    entityFields
  );
  const entityGroupTitle = sourceFieldDisplayName
    ? pt("entityTypeField", "{{entityType}} Fields", {
        entityType: sourceFieldDisplayName,
      })
    : templateMetadata?.entityTypeDisplayName
      ? pt("entityTypeField", "{{entityType}} Fields", {
          entityType: templateMetadata.entityTypeDisplayName,
        })
      : pt("entityFields", "Entity Fields");
  const entityFieldSelector = React.useMemo<BasicSelectorField>(() => {
    const filteredEntityFields = getFieldsForSelector(
      entityFields,
      filter,
      streamDocument,
      sourceField || undefined
    );
    const options = filteredEntityFields.map((field) => {
      return {
        label:
          getScopedEntityFieldDisplayName(
            sourceField || undefined,
            field.name,
            entityFields
          ) ??
          field.displayName ??
          field.name,
        value: field.name,
        fieldPath: sourceField ? `${sourceField}.${field.name}` : field.name,
      };
    });

    if (
      currentFieldPath &&
      !options.some((option) => option.value === currentFieldPath)
    ) {
      options.push({
        label:
          getScopedEntityFieldDisplayName(
            sourceField || undefined,
            currentFieldPath,
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
            label: pt("fields.options.selectAField", "Select a Field"),
            fieldPath: "",
          },
          ...options,
        ],
        linkedGroupTitle: pt("linkedEntityFields", "Linked Entity Fields"),
        entityGroupTitle,
      }),
      translateOptions: false,
      noOptionsPlaceholder: pt("noAvailableFields", "No available fields"),
    };
  }, [
    entityGroupTitle,
    entityFields,
    filter,
    label,
    currentFieldPath,
    sourceField,
    streamDocument,
  ]);

  const previousSourceField = React.useRef(sourceField);
  const valueRef = React.useRef(value);
  valueRef.current = value;

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
        ...valueRef.current,
        field: "",
      },
      undefined
    );
  }, [onChange, sourceField, sourceFieldPath, value?.field]);

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
