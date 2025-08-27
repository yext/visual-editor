import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  YextField,
  msg,
  resolveComponentData,
  CTA,
  pt,
} from "@yext/visual-editor";
import { CTAWrapperProps } from "./CtaWrapper.tsx";
import {
  ctaTypeOptions,
  ctaTypeToEntityFieldType,
  getCTATypeAndCoordinate,
} from "../../internal/puck/constant-value-fields/EnhancedCallToAction.tsx";

const defaultButton: CTAWrapperProps = {
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
};

export interface CTAGroupProps {
  buttons: CTAWrapperProps[];
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
          optionValueToEntityFieldType: ctaTypeToEntityFieldType,
        },
      }),
      variant: YextField(msg("fields.variant", "Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
      }),
    },
    getItemSummary: (_, i) => pt("CTA", "CTA") + " " + ((i ?? 0) + 1),
  }),
};

const CTAGroupComponent = ({ buttons }: CTAGroupProps) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const locale = i18n.language;

  if (!buttons || buttons.length === 0) return null;

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
        const { ctaType, coordinate } = getCTATypeAndCoordinate(
          button.entityField,
          cta
        );

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
                presetImageType={cta.presetImageType}
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
  render: (props: CTAGroupProps) => <CTAGroupComponent {...props} />,
};
