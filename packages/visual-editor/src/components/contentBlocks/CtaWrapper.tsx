import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
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
  resolveDataFromParent,
  themeManagerCn,
} from "@yext/visual-editor";
import {
  ctaTypeOptions,
  ctaTypeToEntityFieldType,
  getCTATypeAndCoordinate,
} from "../../internal/puck/constant-value-fields/EnhancedCallToAction.tsx";

export interface CTAWrapperProps {
  data: {
    /** The call to action to display */
    entityField: YextEntityField<EnhancedTranslatableCTA>;
  };

  styles: {
    /** The visual style of the CTA. */
    variant: CTAVariant;
  };

  /** Additional CSS classes to apply to the CTA. */
  className?: string;

  /** @internal Controlled data from the parent section. */
  parentData?: {
    field: string;
    cta: EnhancedTranslatableCTA;
  };

  /** @internal Controlled style from the parent section */
  parentStyles?: {
    classNameFn?: (variant: CTAVariant) => string;
  };

  /** @internal Event name to be used for click analytics */
  eventName?: string;
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

const CTAWrapperComponent: PuckComponent<CTAWrapperProps> = (props) => {
  const { i18n } = useTranslation();
  const { data, styles, className, parentData, puck, parentStyles, eventName } =
    props;
  const streamDocument = useDocument();
  const cta = parentData
    ? parentData.cta
    : resolveComponentData(data.entityField, i18n.language, streamDocument);
  const { ctaType, coordinate } = getCTATypeAndCoordinate(
    data.entityField,
    cta
  );

  let combinedClassName = className;
  if (parentStyles?.classNameFn) {
    combinedClassName = themeManagerCn(
      parentStyles.classNameFn(styles.variant),
      className
    );
  }

  return (
    <EntityField
      displayName={pt("cta", "CTA")}
      fieldId={parentData ? parentData.field : data.entityField.field}
      constantValueEnabled={
        !parentData && data.entityField.constantValueEnabled
      }
    >
      {cta ? (
        <CTA
          label={resolveComponentData(cta.label, i18n.language, streamDocument)}
          link={resolveComponentData(cta.link, i18n.language, streamDocument)}
          linkType={cta.linkType}
          ctaType={ctaType}
          coordinate={coordinate}
          presetImageType={cta.presetImageType}
          variant={styles.variant}
          className={combinedClassName}
          eventName={eventName}
        />
      ) : puck.isEditing ? (
        <div className="h-[50px] min-w-[130px]" />
      ) : (
        <></>
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
  resolveFields: (data) => resolveDataFromParent(ctaWrapperFields, data),
  render: (props) => <CTAWrapperComponent {...props} />,
};
