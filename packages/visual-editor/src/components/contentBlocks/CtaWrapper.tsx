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
  CTAVariant,
} from "@yext/visual-editor";
import {
  ctaTypeOptions,
  ctaTypeToEntityFieldType,
  getCTATypeAndCoordinate,
} from "../../internal/puck/constant-value-fields/EnhancedCallToAction.tsx";

export interface CTAWrapperProps {
  data: {
    entityField: YextEntityField<EnhancedTranslatableCTA>;
  };
  styles: {
    variant: CTAVariant;
  };
  className?: string;
  parentData?: {
    field: string;
    cta: EnhancedTranslatableCTA;
  };
}

const ctaWrapperFields: Fields<CTAWrapperProps> = {
  data: {
    type: "object",
    label: msg("fields.data", "Data"),
    objectFields: {
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
    },
  },
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      variant: YextField(msg("fields.variant", "Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
      }),
    },
  },
};

const CTAWrapperComponent: React.FC<CTAWrapperProps> = (props) => {
  const { i18n } = useTranslation();
  const { data, styles, className, parentData } = props;
  const streamDocument = useDocument();
  const cta = parentData
    ? parentData.cta
    : resolveComponentData(data.entityField, i18n.language, streamDocument);
  const { ctaType, coordinate } = getCTATypeAndCoordinate(
    data.entityField,
    cta
  );

  return (
    <EntityField
      displayName={pt("cta", "CTA")}
      fieldId={parentData ? parentData.field : data.entityField.field}
      constantValueEnabled={
        !parentData && data.entityField.constantValueEnabled
      }
    >
      {cta && (
        <CTA
          label={resolveComponentData(cta.label, i18n.language, streamDocument)}
          link={resolveComponentData(cta.link, i18n.language, streamDocument)}
          linkType={cta.linkType}
          ctaType={ctaType}
          coordinate={coordinate}
          presetImageType={cta.presetImageType}
          variant={styles.variant}
          className={className}
        />
      )}
    </EntityField>
  );
};

export const CTAWrapper: ComponentConfig<{ props: CTAWrapperProps }> = {
  label: msg("components.callToAction", "Call to Action"),
  fields: ctaWrapperFields,
  defaultProps: {
    data: {
      entityField: {
        field: "",
        constantValue: {
          label: "Call to Action",
          link: "#",
          linkType: "URL",
          ctaType: "textAndLink",
        },
      },
    },
    styles: {
      variant: "primary",
    },
  },
  resolveFields: (data) => {
    if (data.props.parentData) {
      return {
        ...ctaWrapperFields,
        data: {
          label: msg("fields.data", "Data"),
          type: "object",
          objectFields: {
            info: {
              type: "custom",
              render: () => (
                <p style={{ fontSize: "var(--puck-font-size-xxs)" }}>
                  Data is inherited from the parent section.
                </p>
              ),
            },
          },
        },
      } as any;
    }
    return ctaWrapperFields;
  },
  render: (props: CTAWrapperProps) => <CTAWrapperComponent {...props} />,
};
