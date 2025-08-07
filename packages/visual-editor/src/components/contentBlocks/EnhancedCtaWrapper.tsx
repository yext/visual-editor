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
  EnhancedTranslatableCTA,
} from "@yext/visual-editor";
import { CTA } from "../atoms/cta";

export interface EnhancedCTAWrapperProps {
  entityField: YextEntityField<EnhancedTranslatableCTA>;
  variant: any;
  className?: string;
}

const enhancedCtaWrapperFields: Fields<EnhancedCTAWrapperProps> = {
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

const EnhancedCTAWrapperComponent: React.FC<EnhancedCTAWrapperProps> = ({
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
          ctaType={cta.ctaType}
          coordinate={cta.coordinate}
          presetImageType={cta.presetImageType}
          variant={variant}
          className={className}
        />
      )}
    </EntityField>
  );
};

export const EnhancedCTAWrapper: ComponentConfig<EnhancedCTAWrapperProps> = {
  label: msg("components.enhancedCallToAction", "Enhanced Call to Action"),
  fields: enhancedCtaWrapperFields,
  defaultProps: {
    entityField: {
      field: "",
      constantValue: {
        label: "Call to Action",
        link: "#",
        linkType: "URL",
        ctaType: "textAndLink",
      },
    },
    variant: "primary",
  },
  render: (props: EnhancedCTAWrapperProps) => (
    <EnhancedCTAWrapperComponent {...props} />
  ),
};
