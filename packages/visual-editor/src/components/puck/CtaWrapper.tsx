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
  BorderRadiusSelector,
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
      { label: "Small", value: "small" },
      { label: "Large", value: "large" },
    ],
  },
  fontSize: FontSizeSelector("Font Size", true),
  borderRadius: BorderRadiusSelector(),
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
        linkType={cta?.linkType}
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
    size: "small",
  },
  render: (props) => <CTAWrapper {...props} />,
};

export { CTAWrapperComponent as CTAWrapper, type CTAWrapperProps };
