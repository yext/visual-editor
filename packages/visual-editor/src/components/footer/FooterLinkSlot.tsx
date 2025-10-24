import * as React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import {
  YextField,
  msg,
  useDocument,
  resolveComponentData,
  CTA,
  TranslatableCTA,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export interface FooterLinkSlotProps {
  data: {
    link: {
      field: string;
      constantValue: TranslatableCTA;
      constantValueEnabled: boolean;
    };
  };
  variant?: "primary" | "secondary";
  eventNamePrefix?: string;
  index?: number;
}

const FooterLinkSlotInternal: PuckComponent<FooterLinkSlotProps> = (props) => {
  const { data, variant = "primary", eventNamePrefix, index, puck } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const linkData = resolveComponentData(
    data.link,
    i18n.language,
    streamDocument
  ) as TranslatableCTA;

  if (!linkData) {
    return puck.isEditing ? <div className="h-10" /> : <></>;
  }

  const label = resolveComponentData(
    linkData.label,
    i18n.language,
    streamDocument
  );

  const link = resolveComponentData(
    linkData.link,
    i18n.language,
    streamDocument
  );

  return (
    <li>
      <CTA
        variant={
          variant === "primary"
            ? "headerFooterMainLink"
            : "headerFooterSecondaryLink"
        }
        eventName={`cta.${eventNamePrefix || variant}.${index !== undefined ? `${index}-Link-${index + 1}` : "link"}`}
        label={label}
        linkType={linkData.linkType}
        link={link}
        className="justify-center md:justify-start block break-words whitespace-normal"
      />
    </li>
  );
};

export const FooterLinkSlot: ComponentConfig<{ props: FooterLinkSlotProps }> = {
  label: msg("components.footerLinkSlot", "Footer Link"),
  fields: {
    data: YextField(msg("fields.data", "Data"), {
      type: "object",
      objectFields: {
        link: YextField(msg("fields.link", "Link"), {
          type: "object",
          objectFields: {
            linkType: YextField(msg("fields.linkType", "Link Type"), {
              type: "radio",
              options: [
                { label: "URL", value: "URL" },
                { label: "Phone", value: "Phone" },
                { label: "Email", value: "Email" },
              ],
            }),
            label: YextField(msg("fields.label", "Label"), {
              type: "translatableString",
              filter: { types: ["type.string"] },
            }),
            link: YextField(msg("fields.link", "Link"), {
              type: "text",
            }),
          },
        }),
      },
    }),
    variant: YextField(msg("fields.variant", "Variant"), {
      type: "radio",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
      ],
    }),
  },
  defaultProps: {
    data: {
      link: {
        field: "",
        constantValue: {
          linkType: "URL",
          label: { en: "Footer Link", hasLocalizedValue: "true" },
          link: "#",
        },
        constantValueEnabled: true,
      },
    },
    variant: "primary",
  },
  render: (props) => <FooterLinkSlotInternal {...props} />,
};
