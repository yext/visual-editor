import * as React from "react";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import {
  YextField,
  msg,
  pt,
  useDocument,
  resolveComponentData,
  TranslatableString,
  TranslatableCTA,
  YextEntityField,
  CTA,
  Body,
  i18nComponentsInstance,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export interface FooterExpandedLinkSectionSlotProps {
  data: {
    label: YextEntityField<TranslatableString>;
    links: YextEntityField<TranslatableCTA[]>;
  };
  index?: number;
}

const FooterExpandedLinkSectionSlotInternal: PuckComponent<
  FooterExpandedLinkSectionSlotProps
> = (props) => {
  const { data, puck } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const label = resolveComponentData(data.label, i18n.language, streamDocument);
  const links = resolveComponentData(
    data.links,
    i18n.language,
    streamDocument
  ) as TranslatableCTA[];

  if (!label && !puck.isEditing) {
    return <></>;
  }

  if (!label && puck.isEditing) {
    return <div className="h-10" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <Body className="break-words">{label}</Body>
      <div className="flex flex-col gap-4">
        {links && links.length > 0
          ? links.map((linkData, index) => {
              const linkLabel = resolveComponentData(
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
                <CTA
                  key={index}
                  variant="headerFooterMainLink"
                  eventName={`cta.expandedFooter.${index}-Link-${index + 1}`}
                  label={linkLabel}
                  linkType={linkData.linkType}
                  link={link}
                  className="justify-center md:justify-start block break-words whitespace-normal"
                />
              );
            })
          : puck.isEditing && <div className="h-6 min-w-[100px]" />}
      </div>
    </div>
  );
};

export const FooterExpandedLinkSectionSlot: ComponentConfig<{
  props: FooterExpandedLinkSectionSlotProps;
}> = {
  label: msg(
    "components.footerExpandedLinkSectionSlot",
    "Expanded Link Section"
  ),
  fields: {
    data: YextField(msg("fields.data", "Data"), {
      type: "object",
      objectFields: {
        label: YextField(msg("fields.label", "Label"), {
          type: "translatableString",
          filter: { types: ["type.string"] },
        }),
        links: YextField(msg("fields.links", "Links"), {
          type: "array",
          arrayFields: {
            linkType: YextField(msg("fields.linkType", "Link Type"), {
              type: "radio",
              options: [
                { label: msg("fields.options.url", "URL"), value: "URL" },
                { label: msg("fields.options.phone", "Phone"), value: "Phone" },
                { label: msg("fields.options.email", "Email"), value: "Email" },
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
          defaultItemProps: {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          getItemSummary: (item, index) => {
            const locale = i18nComponentsInstance.language || "en";
            const label =
              typeof item.label === "string"
                ? item.label
                : item.label?.[locale];
            return label || pt("link", "Link") + " " + ((index ?? 0) + 1);
          },
        }),
      },
    }),
    index: {
      type: "number",
      visible: false,
    },
  },
  defaultProps: {
    data: {
      label: {
        field: "",
        constantValue: { en: "Footer Label", hasLocalizedValue: "true" },
        constantValueEnabled: true,
      },
      links: {
        field: "",
        constantValue: [
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
          {
            linkType: "URL",
            label: { en: "Footer Link", hasLocalizedValue: "true" },
            link: "#",
          },
        ],
        constantValueEnabled: true,
      },
    },
  },
  render: (props) => <FooterExpandedLinkSectionSlotInternal {...props} />,
};
