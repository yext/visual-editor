import { type StreamFields } from "../types/entityFields.ts";
import { isLinkedEntityFieldPath } from "../utils/linkedEntityFieldUtils.ts";

export type EntityFieldOption = {
  label: string;
  value: string;
  fieldPath: string;
};

export type EntityFieldOptionGroup<TOption> = {
  title?: string;
  options: TOption[];
};

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
  const linkedOptions: Omit<TOption, "fieldPath">[] = [];
  const entityOptions: Omit<TOption, "fieldPath">[] = [];

  options.forEach(({ fieldPath, ...option }) => {
    if (isLinkedEntityFieldPath(fieldPath, entityFields)) {
      linkedOptions.push(option);
      return;
    }

    entityOptions.push(option);
  });

  const nonEmptyGroups = [
    linkedOptions.length
      ? { title: linkedGroupTitle, options: linkedOptions }
      : undefined,
    entityOptions.length
      ? { title: entityGroupTitle, options: entityOptions }
      : undefined,
  ].filter((group) => !!group);

  if (nonEmptyGroups.length <= 1) {
    return nonEmptyGroups.map((group) => ({ options: group!.options }));
  }

  return nonEmptyGroups as EntityFieldOptionGroup<Omit<TOption, "fieldPath">>[];
};
