import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import {
  BackgroundStyle,
  CTA,
  PresetImageType,
  YextField,
  msg,
  pt,
  resolveComponentData,
  useDocument,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import {
  ctaTypeOptions,
  getCTAType,
} from "../../internal/puck/constant-value-fields/EnhancedCallToAction.tsx";
import { CTAVariant } from "../atoms/cta.tsx";
import { CTAWrapperProps } from "./CtaWrapper.tsx";

// TODO: re-enable CTA Group

type BasicCTAProps = {
  /** The CTA entity field or static value */
  entityField: CTAWrapperProps["data"]["entityField"];
  /** The visual style of the CTA. */
  variant: CTAVariant;
  /** The image to use if the CTA is set to preset image */
  presetImage?: PresetImageType;
  color?: BackgroundStyle;
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
          optionValueToEntityFieldType: {
            presetImage: "type.cta",
            textAndLink: "type.cta",
          },
        },
      }),
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
    getItemSummary: (_, i) => pt("CTA", "CTA") + " " + ((i ?? 0) + 1),
  }),
};

const CTAGroupComponent: PuckComponent<CTAGroupProps> = ({ buttons }) => {
  const streamDocument = useDocument();
  const { t, i18n } = useTranslation();
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
        const { ctaType } = getCTAType(button.entityField);

        let resolvedLabel =
          cta && resolveComponentData(cta.label, i18n.language, streamDocument);
        if (
          !button.entityField.constantValueEnabled &&
          ctaType === "getDirections"
        ) {
          resolvedLabel = t("getDirections", "Get Directions");
        }

        return (
          cta && (
            <div
              key={idx}
              className={
                button.variant === "link" ? "w-fit" : "w-full sm:w-auto"
              }
            >
              <CTA
                label={resolvedLabel}
                link={
                  ctaType === "getDirections"
                    ? undefined
                    : resolveComponentData(cta.link, locale, streamDocument)
                }
                linkType={cta.linkType}
                variant={button.variant}
                ctaType={ctaType}
                presetImageType={button.presetImage}
                className="truncate w-full"
                color={button.color}
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
