import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
} from "@measured/puck";
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
  PresetImageType,
  CTADisplayType,
} from "@yext/visual-editor";
import { ctaTypeOptions } from "../../internal/puck/constant-value-fields/EnhancedCallToAction.tsx";
import { CTAProps } from "../atoms/cta.tsx";

export interface CTAWrapperProps {
  data: {
    /** Whether to show the CTA */
    show?: boolean;
    /** The call to action to display */
    entityField: YextEntityField<EnhancedTranslatableCTA>;
  };

  styles: {
    /** The CTA display type */
    displayType: CTADisplayType;
    /** The visual style of the CTA. */
    variant: CTAVariant;
    /** The image to use if the CTA is set to preset image */
    presetImage?: PresetImageType;
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

  /** @internal Fields to hide from the editor i.e. styles.displayType */
  fieldsToHide?: string[];

  /** @internal Event name to be used for click analytics */
  eventName?: string;
}

const ctaWrapperFields: Fields<CTAWrapperProps> = {
  data: {
    type: "object",
    label: msg("fields.data", "Data"),
    objectFields: {
      show: YextField(msg("fields.showCTA", "Show CTA"), {
        type: "radio",
        options: [
          { label: msg("fields.options.show", "Show"), value: true },
          { label: msg("fields.options.hide", "Hide"), value: false },
        ],
        visible: false,
      }),
      entityField: YextField(msg("fields.cta", "CTA"), {
        type: "entityField",
        filter: {
          types: ["type.cta"],
        },
        typeSelectorConfig: {
          typeLabel: msg("fields.ctaType", "CTA Type"),
          fieldLabel: msg("fields.ctaField", "CTA Field"),
          options: ctaTypeOptions(),
        },
      }),
    },
  },
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      displayType: YextField(msg("fields.displayType", "Display Type"), {
        type: "select",
        options: "CTA_DISPLAY_TYPE",
      }),
      variant: YextField(msg("fields.variant", "Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
      }),
      presetImage: YextField(msg("fields.presetImage", "Preset Image"), {
        type: "select",
        options: "PRESET_IMAGE",
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

  let coordinate = undefined;
  let ctaType: CTAProps["ctaType"] =
    data.entityField.selectedTypes?.[0] === "type.coordinate"
      ? "getDirections"
      : styles.displayType;
  if (
    ctaType === "getDirections" &&
    cta?.latitude !== undefined &&
    cta?.longitude !== undefined
  ) {
    coordinate = { latitude: cta.latitude, longitude: cta.longitude };
  }

  let combinedClassName = className;
  if (parentStyles?.classNameFn) {
    combinedClassName = themeManagerCn(
      parentStyles.classNameFn(styles.variant),
      className
    );
  }

  const resolvedLabel =
    cta && resolveComponentData(cta.label, i18n.language, streamDocument);

  // showCTA is true if there is a cta and one of the following is true:
  // 1. there is a coordinate (for get directions)
  // 2. ctaType is presetImage
  // 3. there is a resolved label (for textAndLink or linkOnly)
  // and data.show is not set to false
  const showCTA =
    cta &&
    (coordinate || ctaType === "presetImage" || resolvedLabel) &&
    (data.show ?? true);

  return showCTA ? (
    <EntityField
      displayName={pt("cta", "CTA")}
      fieldId={parentData ? parentData.field : data.entityField.field}
      constantValueEnabled={
        !parentData && data.entityField.constantValueEnabled
      }
    >
      <CTA
        label={resolvedLabel}
        link={resolveComponentData(cta.link, i18n.language, streamDocument)}
        linkType={cta.linkType}
        ctaType={ctaType}
        coordinate={coordinate}
        presetImageType={styles.presetImage}
        variant={styles.variant}
        className={combinedClassName}
        eventName={eventName}
      />
    </EntityField>
  ) : puck.isEditing ? (
    <div className="h-[50px] min-w-[130px]" />
  ) : (
    <></>
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
      displayType: "textAndLink",
      variant: "primary",
      presetImage: "app-store",
    },
  },
  resolveFields: (data) => {
    const updatedFields = resolveDataFromParent(ctaWrapperFields, data);

    if (data.props.data.entityField.selectedTypes?.[0] === "type.coordinate") {
      data.props.styles.displayType = "textAndLink";
      setDeep(updatedFields, "styles.objectFields.displayType.visible", false);
    } else {
      setDeep(updatedFields, "styles.objectFields.displayType.visible", true);
    }

    if (data.props.styles.displayType === "presetImage") {
      setDeep(updatedFields, "styles.objectFields.variant.visible", false);
      setDeep(updatedFields, "styles.objectFields.presetImage.visible", true);
    } else {
      setDeep(updatedFields, "styles.objectFields.variant.visible", true);
      setDeep(updatedFields, "styles.objectFields.presetImage.visible", false);
    }

    // If the show field exists, make it visible in the editor
    if (data.props.data.show !== undefined) {
      setDeep(updatedFields, "data.objectFields.show.visible", true);
    }

    // If fieldsToHide is defined, hide those fields in the editor
    for (const field of data.props.fieldsToHide ?? []) {
      setDeep(updatedFields, field, { visible: false });
    }

    return updatedFields;
  },
  render: (props) => <CTAWrapperComponent {...props} />,
};
