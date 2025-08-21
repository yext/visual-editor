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
  CTA,
  CTAProps,
} from "@yext/visual-editor";
import {
  ctaTypeOptions,
  ctaTypeToEntityFieldType,
  getCTATypeAndCoordinate,
} from "../../internal/puck/constant-value-fields/EnhancedCallToAction.tsx";
export interface CTAWrapperProps {
  entityField: YextEntityField<EnhancedTranslatableCTA>;
  variant: CTAProps["variant"];
  className?: CTAProps["className"];
}

const ctaWrapperFields: Fields<CTAWrapperProps> = {
  entityField: YextField(msg("fields.cta", "CTA"), {
    type: "entityField",
    filter: {
      types: ["type.cta"],
    },
    typeSelectorConfig: {
      typeLabel: msg("fields.ctaType", "CTA Type"),
      fieldLabel: msg("fields.ctaField", "CTA Field"),
      options: ctaTypeOptions(),
      optionValueToEntityFieldType: ctaTypeToEntityFieldType,
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
  const { ctaType, coordinate } = getCTATypeAndCoordinate(entityField, cta);

  return (
    <EntityField
      displayName={pt("cta", "CTA")}
      fieldId={entityField.field}
      constantValueEnabled={entityField.constantValueEnabled}
    >
      {cta && (
        <CTA
          label={resolveComponentData(cta.label, i18n.language, streamDocument)}
          link={resolveComponentData(cta.link, i18n.language, streamDocument)}
          linkType={cta.linkType}
          ctaType={ctaType}
          coordinate={coordinate}
          presetImageType={cta.presetImageType}
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
        linkType: "URL",
        ctaType: "textAndLink",
      },
    },
    variant: "primary",
  },
  render: (props: CTAWrapperProps) => <CTAWrapperComponent {...props} />,
};
