import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  EntityField,
  YextEntityField,
  msg,
  pt,
  YextField,
  resolveComponentData,
  TranslatableCTA,
} from "@yext/visual-editor";
import { CTA, CTAProps } from "../atoms/cta";

export interface CTAWrapperProps {
  entityField: YextEntityField<TranslatableCTA>;
  variant: CTAProps["variant"];
  className?: CTAProps["className"];
}

const ctaWrapperFields: Fields<CTAWrapperProps> = {
  entityField: YextField(msg("fields.cta", "CTA"), {
    type: "entityField",
    filter: {
      types: ["type.cta"],
    },
  }),
  variant: YextField(msg("fields.variant", "Variant"), {
    type: "radio",
    options: "CTA_VARIANT",
  }),
};

const CTAWrapperComponent: React.FC<CTAWrapperProps> = ({
  entityField,
  variant,
  className,
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const cta = resolveComponentData(entityField, i18n.language, streamDocument);

  return (
    <EntityField
      displayName={pt("cta", "CTA")}
      fieldId={entityField.field}
      constantValueEnabled={entityField.constantValueEnabled}
    >
      {cta && (
        <CTA
          label={resolveComponentData(cta.label, i18n.language, streamDocument)}
          link={cta.link}
          linkType={cta.linkType}
          variant={variant}
          className={className}
        />
      )}
    </EntityField>
  );
};

export const CTAWrapper: ComponentConfig<CTAWrapperProps> = {
  label: msg("components.callToAction", "Call to Action"),
  fields: ctaWrapperFields,
  defaultProps: {
    entityField: {
      field: "",
      constantValue: {
        label: "Call to Action",
        link: "#",
      },
    },
    variant: "primary",
  },
  render: (props: CTAWrapperProps) => <CTAWrapperComponent {...props} />,
};
