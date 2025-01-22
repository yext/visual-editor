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
  size: CTAProps["size"];
  borderRadius: CTAProps["borderRadius"];
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
  variant: {
    type: "select",
    label: "Variant",
    options: [
      { label: "Primary", value: "primary" },
      { label: "Link", value: "link" },
    ],
  },
  size: {
    label: "Size",
    type: "radio",
    options: [
      { label: "Default", value: "default" },
      { label: "Small", value: "small" },
      { label: "Large", value: "large" },
    ],
  },
  fontSize: FontSizeSelector(),
  borderRadius: {
    label: "Border Radius",
    type: "radio",
    options: [
      { label: "Default", value: "default" },
      { label: "None", value: "none" },
      { label: "Medium", value: "medium" },
      { label: "Large", value: "large" },
      { label: "Full", value: "full" },
    ],
  },
};

const CTAWrapper: React.FC<CTAWrapperProps> = ({
  entityField,
  variant,
  className,
  fontSize,
  size,
  borderRadius,
}) => {
  const document = useDocument();
  const cta = resolveYextEntityField(document, entityField);

  return (
    <EntityField
      displayName="CTA"
      fieldId={entityField.field}
      constantValueEnabled={entityField.constantValueEnabled}
    >
      <CTA
        label={cta?.label}
        link={cta?.link || "#"}
        variant={variant}
        className={className}
        fontSize={fontSize}
        size={size}
        borderRadius={borderRadius}
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
    borderRadius: "default",
    size: "default",
  },
  render: (props) => <CTAWrapper {...props} />,
};

export { CTAWrapperComponent as CTAWrapper, type CTAWrapperProps };