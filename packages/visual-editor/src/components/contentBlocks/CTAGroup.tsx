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

const defaultButton: CTAWrapperProps = {
  entityField: {
    field: "",
    constantValueEnabled: true,
    constantValue: {
      label: "Button",
      link: "#",
    },
  },
  variant: "primary",
};

export interface CTAGroupProps {
  buttons: CTAWrapperProps[]; // TODO adjust from Colton's PR
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
      }),
      variant: YextField(msg("fields.variant", "Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
      }),
    },
  }),
};

const CTAGroupComponent = ({ buttons }: CTAGroupProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  if (!buttons || buttons.length === 0) return null;

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center align-center`}
    >
      {buttons.map((button, idx) => {
        const cta = resolveComponentData(
          button.entityField,
          i18n.language,
          streamDocument
        );

        return (
          <div key={idx} className="flex">
            {cta && (
              <CTA
                label={resolveComponentData(
                  cta.label,
                  i18n.language,
                  streamDocument
                )}
                link={cta.link}
                linkType={cta.linkType}
                variant={button.variant}
                className="w-full" // handle excessively long strings
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
