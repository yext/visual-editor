import { type FieldProps } from "@puckeditor/core";
import { CTASelectorFieldOverride } from "./CTASelectorField.tsx";
import { type TestCTAField } from "./fields.ts";

/** Keeps malformed generated CTA field metadata out of the shared selector UI. */
export const TestCTAFieldOverride = ({
  field,
  ...props
}: FieldProps<TestCTAField>) => {
  return (
    <CTASelectorFieldOverride
      {...props}
      field={{
        type: "ctaSelector",
        label: typeof field.label === "string" ? field.label : "",
      }}
    />
  );
};
