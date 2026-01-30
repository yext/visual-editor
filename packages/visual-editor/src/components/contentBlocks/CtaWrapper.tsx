import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
} from "@puckeditor/core";
import { BackgroundStyle } from "../../utils/themeConfigOptions.ts";
import { CTA, CTAVariant } from "../atoms/cta.tsx";
import { EnhancedTranslatableCTA, PresetImageType } from "../../types/types.ts";
import { EntityField } from "../../editor/EntityField.tsx";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { YextField } from "../../editor/YextField.tsx";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { resolveDataFromParent } from "../../editor/ParentData.tsx";
import { themeManagerCn } from "../../utils/cn.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { useTranslation } from "react-i18next";
import {
  ctaTypeOptions,
  getCTAType,
} from "../../internal/puck/constant-value-fields/EnhancedCallToAction.tsx";

// TODO: ensure CTAwrapper works as expected

export interface CTAWrapperProps {
  data: {
    /** Whether to show the CTA */
    show?: boolean;
    /** The call to action to display */
    entityField: YextEntityField<EnhancedTranslatableCTA>;
  };

  styles: {
    /** The visual style of the CTA. */
    variant: CTAVariant;
    /** The image to use if the CTA is set to preset image */
    presetImage?: PresetImageType;
    color?: BackgroundStyle;
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
          optionValueToEntityFieldType: {
            presetImage: "type.cta",
            textAndLink: "type.cta",
          },
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
      presetImage: YextField(msg("fields.presetImage", "Preset Image"), {
        type: "select",
        options: "PRESET_IMAGE",
      }),
      color: YextField(msg("fields.color", "Color"), {
        type: "select",
        options: "SITE_COLOR",
      }),
    },
  },
};

const CTAWrapperComponent: PuckComponent<CTAWrapperProps> = (props) => {
  const { t, i18n } = useTranslation();
  const { data, styles, className, parentData, puck, parentStyles, eventName } =
    props;
  const streamDocument = useDocument();

  const cta = parentData
    ? parentData.cta
    : resolveComponentData(data.entityField, i18n.language, streamDocument);
  const { ctaType } = getCTAType(data.entityField);

  let combinedClassName = className;
  if (parentStyles?.classNameFn) {
    combinedClassName = themeManagerCn(
      parentStyles.classNameFn(styles.variant),
      className
    );
  }

  let resolvedLabel =
    cta && resolveComponentData(cta.label, i18n.language, streamDocument);
  if (
    (parentData || !data.entityField.constantValueEnabled) &&
    ctaType === "getDirections"
  ) {
    resolvedLabel = t("getDirections", "Get Directions");
  }

  const showCTA =
    cta && (ctaType === "presetImage" || resolvedLabel) && (data.show ?? true);

  return showCTA ? (
    <EntityField
      displayName={pt("cta", "CTA")}
      fieldId={parentData ? parentData.field : data.entityField.field}
      constantValueEnabled={
        !parentData && data.entityField.constantValueEnabled
      }
    >
      {cta && (
        <CTA
          setPadding={true}
          label={resolvedLabel}
          link={
            ctaType === "getDirections"
              ? undefined
              : resolveComponentData(cta.link, i18n.language, streamDocument)
          }
          linkType={cta.linkType}
          ctaType={ctaType}
          presetImageType={styles.presetImage}
          variant={styles.variant}
          className={combinedClassName}
          eventName={eventName}
          color={styles.color}
        />
      )}
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
        },
        selectedType: "textAndLink",
      },
    },
    styles: {
      variant: "primary",
      presetImage: "app-store",
    },
  },
  resolveFields: (data) => {
    const updatedFields = resolveDataFromParent(ctaWrapperFields, data);
    const ctaVariant = data.props.styles.variant;
    const ctaType = getCTAType(data.props.data.entityField).ctaType;

    if (ctaType === "presetImage") {
      setDeep(updatedFields, "styles.objectFields.variant.visible", false);
      setDeep(updatedFields, "styles.objectFields.presetImage.visible", true);
    } else {
      setDeep(updatedFields, "styles.objectFields.variant.visible", true);
      setDeep(updatedFields, "styles.objectFields.presetImage.visible", false);
    }

    // If the show field exists, make it visible in the editor
    if (data.props.data.show !== undefined) {
      setDeep(updatedFields, "data.objectFields.show.visible", true);
    } else {
      setDeep(updatedFields, "data.objectFields.show.visible", false);
    }

    const showColor =
      (ctaVariant === "primary" || ctaVariant === "secondary") &&
      ctaType !== "presetImage";
    setDeep(updatedFields, "styles.objectFields.color.visible", showColor);

    return updatedFields;
  },
  render: (props) => <CTAWrapperComponent {...props} />,
};
