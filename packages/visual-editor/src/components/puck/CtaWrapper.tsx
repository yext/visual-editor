import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { CTA, CTAProps } from "./atoms/cta.js";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  ctaVariantOptions,
} from "../../index.js";

interface CTAWrapperProps {
  entityField: YextEntityField<CTAProps>;
  variant: CTAProps["variant"];
  className?: CTAProps["className"];
}

const ctaWrapperFields: Fields<CTAWrapperProps> = {
  entityField: YextEntityFieldSelector({
    label: "CTA",
    filter: {
      types: ["type.cta"],
    },
  }),
  variant: {
    label: "Variant",
    type: "radio",
    options: ctaVariantOptions,
  },
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
        label: "Call to Action",
      },
    },
    variant: "primary",
  },
  render: (props: CTAWrapperProps) => <CTAWrapper {...props} />,
};

export { CTAWrapperComponent as CTAWrapper, type CTAWrapperProps };
