import { useTranslation } from "react-i18next";
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
  const { t, i18n } = useTranslation();
  const document = useDocument();
  const cta = resolveYextEntityField(document, entityField, i18n.language);

  return (
    <EntityField
      displayName={t("cta", "CTA")}
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
