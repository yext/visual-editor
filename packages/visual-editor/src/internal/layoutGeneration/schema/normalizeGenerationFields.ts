import type { Fields } from "@puckeditor/core";
import type {
  YextFieldDefinition,
  YextFieldMap,
} from "../../../fields/fields.ts";

/** Recover original Yext definitions once for generated and runtime catalogs. */
export const normalizeGenerationFields = (
  fields: Fields | YextFieldMap = {}
): Fields =>
  Object.fromEntries(
    Object.entries(fields).map(([name, input]) => {
      const adapted = input as typeof input & {
        yextField?: YextFieldDefinition;
      };

      const original = (input.metadata?.yextField ??
        adapted.yextField ??
        input) as YextFieldDefinition;

      const field = {
        ...original,
        generation: input.generation ?? original.generation,
      };

      if (field.type === "object") {
        return [
          name,
          {
            ...field,
            objectFields: normalizeGenerationFields(field.objectFields),
          },
        ];
      }

      if (field.type === "array") {
        return [
          name,
          {
            ...field,
            arrayFields: normalizeGenerationFields(field.arrayFields),
          },
        ];
      }

      return [name, field];
    })
  ) as Fields;

/** Validate declarations even when explicit schemas bypass inference. */
export const validateSingleChildSlots = (
  component: string,
  fields: Fields,
  slottedItemSource: boolean,
  path = "props"
): void => {
  for (const [name, field] of Object.entries(fields)) {
    const fieldPath = `${path}.${name}`;
    const singleChild = field.generation?.singleChild;

    if (singleChild !== undefined) {
      if (field.type !== "slot") {
        throw new Error(
          `Generation singleChild at ${component}.${fieldPath}: only slots support singleChild`
        );
      }
      if (
        slottedItemSource &&
        fieldPath === "props.slots.CardSlot" &&
        singleChild === true
      ) {
        throw new Error(
          `Generation singleChild at ${component}.${fieldPath}: slottedItemSource card collections cannot use singleChild: true`
        );
      }
    }
    if (field.type === "object" || field.type === "array") {
      validateSingleChildSlots(
        component,
        field.type === "object" ? field.objectFields : field.arrayFields,
        slottedItemSource,
        field.type === "array" ? `${fieldPath}[]` : fieldPath
      );
    }
  }
};
