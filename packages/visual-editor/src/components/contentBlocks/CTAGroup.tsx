import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  YextField,
  msg,
  resolveComponentData,
  CTA,
} from "@yext/visual-editor";
import { CTAWrapperProps } from "./CtaWrapper.tsx";
import {
  ctaTypeOptions,
  ctaTypeToEntityFieldType,
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
  }),
};

const CTAGroupComponent = ({ buttons }: CTAGroupProps) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const locale = i18n.language;

  if (!buttons || buttons.length === 0) return null;

  return (
    <div className={"flex flex-wrap items-center justify-start gap-4"}>
      {buttons.map((button, idx) => {
        const cta = resolveComponentData(
          button.entityField,
          locale,
          streamDocument
        );

        return (
          <div key={idx}>
            {cta && (
              <CTA
                label={resolveComponentData(cta.label, locale, streamDocument)}
                link={resolveComponentData(cta.link, locale, streamDocument)}
                linkType={cta.linkType}
                variant={button.variant}
                ctaType={cta.ctaType}
                coordinate={cta.coordinate}
                presetImageType={cta.presetImageType}
                className="truncate"
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export const CTAGroup: ComponentConfig<CTAGroupProps> = {
  label: msg("components.ctaGroup", "CTA Group"),
  fields: ctaGroupFields,
  defaultProps: {
    buttons: [defaultButton, defaultButton],
  },
  render: (props: CTAGroupProps) => <CTAGroupComponent {...props} />,
};
