import { type FieldProps } from "@puckeditor/core";
import {
  EntityFieldSelectorFieldOverride,
  type EntityFieldSelectorField,
} from "./EntityFieldSelectorField.tsx";
import { type TestEntityField, type TestRichTextField } from "./fields.ts";
import { type MappedSourceFieldFilter } from "../utils/cardSlots/mappedSource.ts";

type TestEntityFieldOverrideProps = FieldProps<
  TestEntityField | TestRichTextField
>;

/**
 * Keeps generated test text fields selectable when Puck design mode omits the
 * field schema. The transform layer reports malformed values separately.
 */
export const TestEntityFieldOverride = ({
  field,
  ...props
}: TestEntityFieldOverrideProps) => {
  const filter: MappedSourceFieldFilter<Record<string, any>> =
    field.filter &&
    typeof field.filter === "object" &&
    !Array.isArray(field.filter) &&
    Array.isArray(field.filter.types)
      ? field.filter
      : {
          types:
            field.type === "testRichText"
              ? ["type.string", "type.rich_text_v2"]
              : ["type.string"],
        };
  if (!field.filter) {
    console.error(
      `[VisualEditor] Invalid ${field.type} field config. Using the test field schema.`
    );
  }

  return (
    <EntityFieldSelectorFieldOverride
      {...props}
      field={
        {
          type: "entityField",
          label: typeof field.label === "string" ? field.label : "",
          filter,
        } as EntityFieldSelectorField
      }
    />
  );
};
