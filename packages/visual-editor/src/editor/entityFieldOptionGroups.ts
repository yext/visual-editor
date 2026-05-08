import { type StreamFields } from "../types/entityFields.ts";
import { isLinkedEntityFieldPath } from "../utils/linkedEntityFieldUtils.ts";

/**
 * A selectable field option before it is grouped for display.
 */
export type EntityFieldOption = {
  label: string;
  value: string;
  fieldPath: string;
};

/**
 * A rendered combobox group of entity field options.
 */
export type EntityFieldOptionGroup<TOption> = {
  title?: string;
  options: TOption[];
};

/**
 * Groups entity field selector options into linked-entity and root-entity
 * sections for display.
 *
 * 1. Pull the empty-selection option into its own ungrouped section so it
 *    always renders at the top of the picker.
 * 2. Partition the remaining options by whether their full field path starts
 *    from a linked entity source field.
 * 3. Drop the internal `fieldPath` metadata once grouping is decided.
 * 4. Omit empty groups and collapse to a single untitled group when only one
 *    section has options.
 */
export const buildEntityFieldOptionGroups = <
  TOption extends EntityFieldOption,
>({
  entityFields,
  options,
  linkedGroupTitle,
  entityGroupTitle,
}: {
  entityFields: StreamFields | null;
  options: TOption[];
  linkedGroupTitle: string;
  entityGroupTitle: string;
}): EntityFieldOptionGroup<Omit<TOption, "fieldPath">>[] => {
  const topOptions: Omit<TOption, "fieldPath">[] = [];
  const linkedOptions: Omit<TOption, "fieldPath">[] = [];
  const entityOptions: Omit<TOption, "fieldPath">[] = [];

  options.forEach(({ fieldPath, ...option }) => {
    if (option.value === "" && !fieldPath) {
      topOptions.push(option);
      return;
    }

    if (isLinkedEntityFieldPath(fieldPath, entityFields)) {
      linkedOptions.push(option);
      return;
    }

    entityOptions.push(option);
  });

  const nonEmptyGroups = [
    topOptions.length ? { options: topOptions } : undefined,
    entityOptions.length
      ? { title: entityGroupTitle, options: entityOptions }
      : undefined,
    linkedOptions.length
      ? { title: linkedGroupTitle, options: linkedOptions }
      : undefined,
  ].filter((group) => !!group);

  if (nonEmptyGroups.length <= 1) {
    return nonEmptyGroups.map((group) => ({ options: group!.options }));
  }

  return nonEmptyGroups as EntityFieldOptionGroup<Omit<TOption, "fieldPath">>[];
};
