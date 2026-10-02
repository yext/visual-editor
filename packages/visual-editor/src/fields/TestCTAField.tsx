import { type FieldProps } from "@puckeditor/core";
import { CTASelectorFieldOverride } from "./CTASelectorField.tsx";
import { type TestCTAField } from "./fields.ts";
import { getFieldLabel } from "./getFieldLabel.ts";

/** Keeps malformed generated CTA field metadata out of the shared selector UI. */
export const TestCTAFieldOverride = ({
  field,
  name,
  ...props
}: FieldProps<TestCTAField> & { name?: string }) => {
  return (
    <CTASelectorFieldOverride
      {...props}
      field={{
        type: "ctaSelector",
        label: getFieldLabel(name ?? "", field.label),
      }}
    />
  );
};
