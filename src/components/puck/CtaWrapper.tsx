import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { CTA, CTAProps } from "./atoms/cta.js";
import {
  yextCn,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  NumberFieldWithDefaultOption,
  NumberOrDefault,
} from "../../index.ts";

export interface CTAWrapperProps {
  entityField: YextEntityField<CTAProps>;
  variant: CTAProps["variant"];
  fontSize: NumberOrDefault;
  className?: CTAProps["className"];
}

const ctaWrapperFields: Fields<CTAWrapperProps> = {
  entityField: YextEntityFieldSelector({
    label: "Entity Field",
    filter: {
      types: ["c_cta"],
    },
  }),
  fontSize: NumberFieldWithDefaultOption({
    label: "Font Size",
    defaultCustomValue: 12,
  }),
  variant: {
    type: "select",
    label: "Variant",
    options: [
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Outline", value: "outline" },
      { label: "Link", value: "link" },
    ],
  },
};

const CTAWrapper: React.FC<CTAWrapperProps> = ({
  entityField,
  variant,
  className,
  fontSize,
  ...rest
}) => {
  const document = useDocument();
  const cta = resolveYextEntityField(document, entityField);

  return (
    <EntityField
      displayName="CTA"
      fieldId={
        entityField.constantValueEnabled ? "constant value" : entityField.field
      }
    >
      <CTA
        label={cta?.name}
        url={cta?.url || "#"}
        variant={variant}
        className={yextCn(className)}
        fontSize={fontSize}
        {...rest}
      />
    </EntityField>
  );
};

export const CTAWrapperComponent: ComponentConfig<CTAWrapperProps> = {
  label: "Call to Action",
  fields: ctaWrapperFields,
  defaultProps: {
    entityField: {
      field: "",
      constantValue: {
        name: "Call to Action",
        variant: "primary",
        fontSize: "default",
      },
    },
    variant: "primary",
    fontSize: "default",
  },
  render: (props) => <CTAWrapper {...props} />,
};

export { CTAWrapper };
