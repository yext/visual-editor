import * as React from "react";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { YextField } from "../../editor/YextField.tsx";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { TranslatableString, TranslatableCTA } from "../../types/types.ts";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { CTA } from "../atoms/cta.tsx";
import { Body } from "../atoms/body.tsx";
import { i18nComponentsInstance } from "../../utils/i18n/components.ts";
import { useBackground } from "../../hooks/useBackground.tsx";
import { useTranslation } from "react-i18next";
import { defaultLink, defaultLinks } from "./ExpandedFooter.tsx";
import { defaultText } from "../../utils/i18n/defaultContent.ts";

export interface FooterExpandedLinkSectionSlotProps {
  data: {
    label: YextEntityField<TranslatableString>;
    links: TranslatableCTA[];
  };
  /** @internal */
  index?: number;
}

const FooterExpandedLinkSectionSlotInternal: PuckComponent<
  FooterExpandedLinkSectionSlotProps
> = (props) => {
  const { data, puck } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const background = useBackground();
  const isDarkBackground = background?.isDarkBackground ?? false;

  const label = resolveComponentData(data.label, i18n.language, streamDocument);
  const links = data.links;

  const textColorClass = isDarkBackground
    ? "text-white"
    : "text-palette-primary-dark";

  return (
    <div className="flex flex-col gap-6">
      <Body className={`break-words ${textColorClass}`}>{label}</Body>
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
                  openInNewTab={linkData.openInNewTab}
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

const defaultFooterExpandedLinkSectionProps: FooterExpandedLinkSectionSlotProps =
  {
    data: {
      label: {
        field: "",
        constantValue: defaultText(
          "componentDefaults.footerLabel",
          "Footer Label"
        ),
        constantValueEnabled: true,
      },
      links: defaultLinks,
    },
  };

const footerExpandedLinkSectionSlotFields: Fields<FooterExpandedLinkSectionSlotProps> =
  {
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
            openInNewTab: YextField(
              msg("fields.openInNewTab", "Open in new tab"),
              {
                type: "radio",
                options: [
                  { label: msg("fields.options.yes", "Yes"), value: true },
                  { label: msg("fields.options.no", "No"), value: false },
                ],
              }
            ),
          },
          defaultItemProps: defaultLink,
          getItemSummary: (item: any, index?: number) => {
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
  };

export const FooterExpandedLinkSectionSlot: ComponentConfig<{
  props: FooterExpandedLinkSectionSlotProps;
}> = {
  label: msg(
    "components.footerExpandedLinkSectionSlot",
    "Expanded Link Section"
  ),
  fields: footerExpandedLinkSectionSlotFields,
  defaultProps: defaultFooterExpandedLinkSectionProps,
  render: (props) => <FooterExpandedLinkSectionSlotInternal {...props} />,
};
