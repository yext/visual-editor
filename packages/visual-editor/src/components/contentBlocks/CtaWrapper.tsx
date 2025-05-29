import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  CTA,
  CTAProps,
  YextField,
  i18n,
} from "@yext/visual-editor";

export interface CTAWrapperProps {
  entityField: YextEntityField<CTAProps>;
  variant: CTAProps["variant"];
  className?: CTAProps["className"];
}

const ctaWrapperFields: Fields<CTAWrapperProps> = {
  entityField: YextField(i18n("CTA"), {
    type: "entityField",
    filter: {
      types: ["type.cta"],
    },
  }),
  variant: YextField(i18n("Variant"), {
    type: "radio",
    options: "CTA_VARIANT",
  }),
};

const CTAWrapperComponent: React.FC<CTAWrapperProps> = ({
  entityField,
  variant,
  className,
}) => {
  const document = useDocument();
  const cta = resolveYextEntityField(document, entityField);

  return (
    <EntityField
      displayName={i18n("CTA")}
      fieldId={entityField.field}
      constantValueEnabled={entityField.constantValueEnabled}
    >
      <CTA
        label={cta?.label}
        link={cta?.link}
        linkType={cta?.linkType}
        variant={variant}
        className={className}
      />
    </EntityField>
  );
};

export const CTAWrapper: ComponentConfig<CTAWrapperProps> = {
  label: i18n("Call to Action"),
  fields: ctaWrapperFields,
  defaultProps: {
    entityField: {
      field: "",
      constantValue: {
        label: i18n("Call to Action"),
      },
    },
    variant: "primary",
  },
  render: (props: CTAWrapperProps) => <CTAWrapperComponent {...props} />,
};
