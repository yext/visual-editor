import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { CTA, CTAProps } from "./atoms/cta.js";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  FontSizeSelector,
} from "../../index.ts";

interface CTAWrapperProps {
  entityField: YextEntityField<CTAProps>;
  variant: CTAProps["variant"];
  fontSize: CTAProps["fontSize"];
  className?: CTAProps["className"];
}

const ctaWrapperFields: Fields<CTAWrapperProps> = {
  entityField: YextEntityFieldSelector({
    label: "Entity Field",
    filter: {
      types: ["type.cta"],
    },
  }),
  fontSize: FontSizeSelector(),
  variant: {
    type: "select",
    label: "Variant",
    options: [
      { label: "Primary", value: "primary" },
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
        label={cta?.label}
        link={cta?.link || "#"}
        variant={variant}
        className={className}
        fontSize={fontSize}
        {...rest}
      />
    </EntityField>
  );
};

const CTAWrapperComponent: ComponentConfig<CTAWrapperProps> = {
  label: "Call to Action",
  fields: ctaWrapperFields,
  defaultProps: {
    entityField: {
      field: "",
      constantValue: {
        name: "Call to Action",
      },
    },
    variant: "primary",
    fontSize: "default",
  },
  render: (props) => <CTAWrapper {...props} />,
};

export { CTAWrapperComponent as CTAWrapper, type CTAWrapperProps };
