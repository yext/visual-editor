import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { CTA, CTAProps, linkTypeFields } from "./atoms/cta.js";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  FontSizeSelector,
  BorderRadiusSelector,
  BasicSelector,
} from "../../index.js";

interface CTAWrapperProps {
  entityField: YextEntityField<CTAProps>;
  variant: CTAProps["variant"];
  size: CTAProps["size"];
  borderRadius: CTAProps["borderRadius"];
  fontSize: CTAProps["fontSize"];
  linkType: CTAProps["linkType"];
  className?: CTAProps["className"];
}

const ctaWrapperFields: Fields<CTAWrapperProps> = {
  entityField: YextEntityFieldSelector({
    label: "Entity Field",
    filter: {
      types: ["type.cta"],
    },
  }),
  variant: BasicSelector("Variant", [
    { label: "Primary", value: "primary" },
    { label: "Link", value: "link" },
  ]),
  size: {
    label: "Size",
    type: "radio",
    options: [
      { label: "Small", value: "small" },
      { label: "Large", value: "large" },
    ],
  },
  linkType: linkTypeFields,
  fontSize: FontSizeSelector("Font Size", false),
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
    linkType: "URL",
    size: "small",
  },
  render: (props) => <CTAWrapper {...props} />,
};

export { CTAWrapperComponent as CTAWrapper, type CTAWrapperProps };
