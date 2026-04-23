import { getFieldsForSelector } from "../editor/yextEntityFieldUtils.ts";
import {
  type ComboboxOption,
  type ComboboxOptionGroup,
} from "../internal/types/combobox.ts";
import {
  type EntityFieldTypes,
  type RenderEntityFieldFilter,
} from "../internal/utils/getFilteredEntityFields.ts";
import { type StreamFields } from "../types/entityFields.ts";
import { resolveField } from "./resolveYextEntityField.ts";
import { type LinkedEntitySchemas } from "./linkedEntityFieldUtils.ts";
import { type StreamDocument } from "./types/StreamDocument.ts";

export type ListSourceMappingConfig = {
  key: string;
  label: string;
  types: EntityFieldTypes[];
  preferredFieldNames?: string[];
  required?: boolean;
};

type GetListSourceSelectorOptionsArgs = {
  entityFields: StreamFields | null;
  linkedEntitySchemas?: LinkedEntitySchemas;
  legacySourceFilter: RenderEntityFieldFilter<Record<string, any>>;
  mappingConfigs: ListSourceMappingConfig[];
};

export type ListSourceSelectorOptions = {
  listSourceFieldNames: Set<string>;
  mappingOptionsBySourceField: Record<string, Record<string, ComboboxOption[]>>;
  sourceOptions: ComboboxOption[];
  sourceOptionGroups?: ComboboxOptionGroup[];
};

/**
 * Builds grouped selector options for sources that support both legacy
 * section-shaped entity fields and list parents with per-item mappings.
 */
export const getListSourceSelectorOptions = ({
  entityFields,
  linkedEntitySchemas,
  legacySourceFilter,
  mappingConfigs,
}: GetListSourceSelectorOptionsArgs): ListSourceSelectorOptions => {
  const legacySourceFields = getFieldsForSelector(
    entityFields,
    legacySourceFilter,
    linkedEntitySchemas
  );
  const candidateListFields = getFieldsForSelector(
    entityFields,
    { includeListsOnly: true },
    linkedEntitySchemas
  );

  const mappingOptionsBySourceField: Record<
    string,
    Record<string, ComboboxOption[]>
  > = {};
  const listSourceFieldNames = new Set<string>();

  candidateListFields.forEach((field) => {
    const mappingOptions = getMappingOptionsForListField(
      field.name,
      mappingConfigs,
      entityFields,
      linkedEntitySchemas
    );

    const hasRequiredMappings = mappingConfigs
      .filter((config) => config.required !== false)
      .every((config) => (mappingOptions[config.key]?.length ?? 0) > 0);

    if (!hasRequiredMappings) {
      return;
    }

    listSourceFieldNames.add(field.name);
    mappingOptionsBySourceField[field.name] = mappingOptions;
  });

  const legacyOptions = legacySourceFields.map((field) => ({
    label: field.displayName ?? field.name,
    value: field.name,
  }));
  const listOptions = candidateListFields
    .filter((field) => listSourceFieldNames.has(field.name))
    .map((field) => ({
      label: field.displayName ?? field.name,
      value: field.name,
    }));

  const sourceOptions = legacyOptions.length > 0 ? legacyOptions : listOptions;
  const sourceOptionGroups =
    legacyOptions.length > 0 && listOptions.length > 0
      ? [
          { title: "Section Fields", options: legacyOptions },
          { title: "List Fields", options: listOptions },
        ]
      : undefined;

  return {
    listSourceFieldNames,
    mappingOptionsBySourceField,
    sourceOptions,
    sourceOptionGroups,
  };
};

/**
 * Applies stable defaults for list-item mappings by preferring exact field
 * name matches and falling back to the only available option.
 */
export const resolveDefaultListItemMappings = (
  existingMappings: Record<string, string> | undefined,
  mappingConfigs: ListSourceMappingConfig[],
  mappingOptionsByKey: Record<string, ComboboxOption[]> | undefined
): Record<string, string> | undefined => {
  if (!mappingOptionsByKey) {
    return undefined;
  }

  const nextMappings: Record<string, string> = {};

  mappingConfigs.forEach((config) => {
    const options = mappingOptionsByKey[config.key] ?? [];
    const existingValue = existingMappings?.[config.key];
    if (
      existingValue &&
      options.some((option) => option.value === existingValue)
    ) {
      nextMappings[config.key] = existingValue;
      return;
    }

    const preferredValue = config.preferredFieldNames?.find(
      (preferredFieldName) =>
        options.some((option) => option.value === preferredFieldName)
    );
    if (preferredValue) {
      nextMappings[config.key] = preferredValue;
      return;
    }

    if (options.length === 1) {
      const [onlyOption] = options;
      if (typeof onlyOption?.value === "string") {
        nextMappings[config.key] = onlyOption.value;
      }
    }
  });

  return Object.keys(nextMappings).length > 0 ? nextMappings : undefined;
};

/**
 * Resolves a selected list parent field into normalized items by resolving each
 * configured relative child path against every item in the list.
 */
export const resolveMappedListItems = <T>(
  streamDocument: StreamDocument,
  sourceField: string,
  itemFieldMappings: Record<string, string> | undefined,
  buildItem: (resolvedItemFields: Record<string, unknown>) => T
): T[] | undefined => {
  if (!sourceField || !itemFieldMappings) {
    return undefined;
  }

  const resolvedSource = resolveField<unknown>(
    streamDocument,
    sourceField
  ).value;
  if (!Array.isArray(resolvedSource)) {
    return undefined;
  }

  return resolvedSource.map((item) => {
    const resolvedItemFields: Record<string, unknown> = {};

    Object.entries(itemFieldMappings).forEach(([key, fieldPath]) => {
      resolvedItemFields[key] =
        fieldPath && typeof item === "object" && item !== null
          ? resolveField(item as StreamDocument, fieldPath).value
          : undefined;
    });

    return buildItem(resolvedItemFields);
  });
};

const getMappingOptionsForListField = (
  sourceField: string,
  mappingConfigs: ListSourceMappingConfig[],
  entityFields: StreamFields | null,
  linkedEntitySchemas?: LinkedEntitySchemas
): Record<string, ComboboxOption[]> => {
  const mappingOptions: Record<string, ComboboxOption[]> = {};

  mappingConfigs.forEach((config) => {
    const options = getFieldsForSelector(
      entityFields,
      {
        directChildrenOf: sourceField,
        types: config.types,
      },
      linkedEntitySchemas
    ).map((field) => ({
      label: field.displayName ?? field.name,
      value: field.name.startsWith(`${sourceField}.`)
        ? field.name.slice(sourceField.length + 1)
        : field.name,
    }));

    mappingOptions[config.key] = options;
  });

  return mappingOptions;
};
