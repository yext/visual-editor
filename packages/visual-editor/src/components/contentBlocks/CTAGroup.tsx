import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import {
  useDocument,
  YextField,
  msg,
  resolveComponentData,
  CTA,
  pt,
  CTADisplayType,
  PresetImageType,
} from "@yext/visual-editor";
import { CTAWrapperProps } from "./CtaWrapper.tsx";
import { ctaTypeOptions } from "../../internal/puck/constant-value-fields/EnhancedCallToAction.tsx";
import { CTAProps, CTAVariant } from "../atoms/cta.tsx";

type BasicCTAProps = {
  /** The CTA entity field or static value */
  entityField: CTAWrapperProps["data"]["entityField"];
  /** The CTA display type */
  displayType: CTADisplayType;
  /** The visual style of the CTA. */
  variant: CTAVariant;
  /** The image to use if the CTA is set to preset image */
  presetImage?: PresetImageType;
};

const defaultButton: BasicCTAProps = {
  entityField: {
    field: "",
    constantValueEnabled: true,
    constantValue: {
      ctaType: "textAndLink",
      label: "Button",
      link: "#",
    },
  },
  variant: "primary",
  displayType: "textAndLink",
  presetImage: "app-store",
};

export interface CTAGroupProps {
  buttons: BasicCTAProps[];
}

const ctaGroupFields: Fields<CTAGroupProps> = {
  buttons: YextField(msg("fields.buttons", "Buttons"), {
    type: "array",
    max: 9,
    defaultItemProps: defaultButton,
    arrayFields: {
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
    getItemSummary: (_, i) => pt("CTA", "CTA") + " " + ((i ?? 0) + 1),
  }),
};

const CTAGroupComponent: PuckComponent<CTAGroupProps> = ({ buttons }) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const locale = i18n.language;

  if (!buttons || buttons.length === 0) {
    return <></>;
  }

  return (
    <div
      className={
        "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start"
      }
    >
      {buttons.map((button, idx) => {
        const cta = resolveComponentData(
          button.entityField,
          locale,
          streamDocument
        );

        let coordinate = undefined;
        let ctaType: CTAProps["ctaType"] =
          button.entityField.selectedTypes?.[0] === "type.coordinate"
            ? "getDirections"
            : button.displayType;
        if (
          ctaType === "getDirections" &&
          cta?.latitude !== undefined &&
          cta?.longitude !== undefined
        ) {
          coordinate = { latitude: cta.latitude, longitude: cta.longitude };
        }

        return (
          cta && (
            <div key={idx} className="w-full sm:w-auto">
              <CTA
                label={resolveComponentData(cta.label, locale, streamDocument)}
                link={resolveComponentData(cta.link, locale, streamDocument)}
                linkType={cta.linkType}
                variant={button.variant}
                ctaType={ctaType}
                coordinate={coordinate}
                presetImageType={button.presetImage}
                className="truncate w-full"
              />
            </div>
          )
        );
      })}
    </div>
  );
};

export const CTAGroup: ComponentConfig<{ props: CTAGroupProps }> = {
  label: msg("components.ctaGroup", "CTA Group"),
  fields: ctaGroupFields,
  defaultProps: {
    buttons: [defaultButton, defaultButton],
  },
  render: (props) => <CTAGroupComponent {...props} />,
};
