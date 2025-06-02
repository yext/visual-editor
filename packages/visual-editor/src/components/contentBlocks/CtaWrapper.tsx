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
  useI18n,
} from "@yext/visual-editor";

export interface CTAWrapperProps {
  entityField: YextEntityField<CTAProps>;
  variant: CTAProps["variant"];
  className?: CTAProps["className"];
}

const ctaWrapperFields: Fields<CTAWrapperProps> = {
  entityField: YextField("CTA", {
    type: "entityField",
    filter: {
      types: ["type.cta"],
    },
  }),
  variant: YextField("Variant", {
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
  const i18n = useI18n();
  const cta = resolveYextEntityField(document, entityField);

  return (
    <EntityField
      displayName={i18n("cta", { defaultValue: "CTA" })}
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
  render: (props: CTAWrapperProps) => <CTAWrapperComponent {...props} />,
};
