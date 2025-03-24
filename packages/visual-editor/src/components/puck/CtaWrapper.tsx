import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { CTA, CTAProps, linkTypeFields } from "./atoms/cta.js";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
} from "../../index.js";

interface CTAWrapperProps {
  entityField: YextEntityField<CTAProps>;
  variant: CTAProps["variant"];
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
  variant: {
    label: "Variant",
    type: "radio",
    options: [
      { label: "Primary", value: "primary" },
      { label: "Outline", value: "secondary" },
      { label: "Link", value: "link" },
    ],
  },
  linkType: linkTypeFields,
};

const CTAWrapper: React.FC<CTAWrapperProps> = ({
  entityField,
  variant,
  className,
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
        size={"small"}
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
    linkType: "URL",
  },
  render: (props: CTAWrapperProps) => <CTAWrapper {...props} />,
};

export { CTAWrapperComponent as CTAWrapper, type CTAWrapperProps };
