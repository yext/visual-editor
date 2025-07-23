import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  CTA,
  YextField,
  TranslatableString,
  resolveTranslatableString,
} from "@yext/visual-editor";

export interface CtaWrapperProps {
  label: YextEntityField<TranslatableString>;
  link: YextEntityField<string>;
  linkType: "URL" | "PHONE" | "EMAIL" | "DRIVING_DIRECTIONS";
  variant: "primary" | "secondary" | "link";
  target: "_self" | "_blank";
}

const ctaWrapperFields: Fields<CtaWrapperProps> = {
  label: YextField<any, TranslatableString>("Label", {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  link: YextField<any, string>("Link", {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  linkType: YextField("Link Type", {
    type: "radio",
    options: [
      { label: "URL", value: "URL" },
      { label: "Phone", value: "PHONE" },
      { label: "Email", value: "EMAIL" },
      { label: "Driving Directions", value: "DRIVING_DIRECTIONS" },
    ],
  }),
  variant: YextField("Variant", {
    type: "radio",
    options: [
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
      { label: "Link", value: "link" },
    ],
  }),
  target: YextField("Target", {
    type: "radio",
    options: [
      { label: "Same Window", value: "_self" },
      { label: "New Window", value: "_blank" },
    ],
  }),
};

const CtaWrapperComponent = ({
  label,
  link,
  linkType,
  variant,
  target,
}: CtaWrapperProps) => {
  const { t, i18n } = useTranslation();
  const document = useDocument();

  return (
    <EntityField
      displayName={t("cta", "Call to Action")}
      fieldId={label.field}
      constantValueEnabled={label.constantValueEnabled}
    >
      <CTA
        label={resolveTranslatableString(
          resolveYextEntityField(document, label),
          i18n.language,
        )}
        link={resolveYextEntityField(document, link)}
        linkType={linkType}
        variant={variant}
        target={target}
      />
    </EntityField>
  );
};

export const CtaWrapper: ComponentConfig<CtaWrapperProps> = {
  label: "CTA Wrapper",
  fields: ctaWrapperFields,
  defaultProps: {
    label: {
      field: "",
      constantValue: "Click Here",
      constantValueEnabled: true,
    },
    link: {
      field: "",
      constantValue: "#",
      constantValueEnabled: true,
    },
    linkType: "URL",
    variant: "primary",
    target: "_self",
  },
  render: (props) => <CtaWrapperComponent {...props} />,
};
