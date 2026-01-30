import * as React from "react";
import { ComponentConfig, PuckComponent } from "@puckeditor/core";
import { YextField } from "../../editor/YextField";
import { msg, pt } from "../../utils/i18n/platform";
import { TranslatableString, TranslatableCTA } from "../../types/types";
import { i18nComponentsInstance } from "../../utils/i18n/components";
import { useDocument } from "../../hooks/useDocument";
import { resolveComponentData } from "../../utils/resolveComponentData";
import { CTA } from "../atoms/cta";
import { useBackground } from "../../hooks/useBackground";
import { Body } from "../atoms/body";
import { useTranslation } from "react-i18next";
import { defaultLink, defaultLinks } from "./ExpandedFooter.tsx";

const defaultSection = {
  label: { en: "Footer Label", hasLocalizedValue: "true" as const },
  links: defaultLinks,
};

export interface FooterExpandedLinksWrapperProps {
  data: {
    sections: {
      label: TranslatableString;
      links: TranslatableCTA[];
    }[];
  };
}

const FooterExpandedLinksWrapperInternal: PuckComponent<
  FooterExpandedLinksWrapperProps
> = (props) => {
  const { data } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const background = useBackground();
  const isDarkBackground = background?.isDarkBackground ?? false;

  const sections = data.sections || [];
  const labelColorClass = isDarkBackground ? "text-white" : "text-black";

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full text-center md:text-left justify-items-center md:justify-items-start">
      {sections.map((section, sectionIndex) => {
        const label = resolveComponentData(
          section.label,
          i18n.language,
          streamDocument
        );
        const links = section.links || [];

        return (
          <div key={sectionIndex} className="flex flex-col gap-6">
            <Body
              className={`break-words font-link-fontWeight font-body-fontFamily font-body-fontWeight ${labelColorClass}`}
            >
              {label}
            </Body>
            <div className="flex flex-col gap-4">
              {links.map((linkData, linkIndex) => {
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
                    key={linkIndex}
                    variant="headerFooterMainLink"
                    eventName={`cta.expandedFooter.${sectionIndex}-Link-${linkIndex + 1}`}
                    label={linkLabel}
                    linkType={linkData.linkType}
                    link={link}
                    className="justify-center md:justify-start block break-words whitespace-normal"
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const FooterExpandedLinksWrapper: ComponentConfig<{
  props: FooterExpandedLinksWrapperProps;
}> = {
  label: msg("components.expandedLinks", "Expanded Links"),
  fields: {
    data: YextField(msg("fields.data", "Data"), {
      type: "object",
      objectFields: {
        sections: YextField(
          msg("fields.expandedFooterLinks", "Expanded Footer Links"),
          {
            type: "array",
            arrayFields: {
              label: YextField(msg("fields.sectionLabel", "Section Label"), {
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
                      {
                        label: msg("fields.options.phone", "Phone"),
                        value: "Phone",
                      },
                      {
                        label: msg("fields.options.email", "Email"),
                        value: "Email",
                      },
                    ],
                  }),
                  label: YextField(msg("fields.linkLabel", "Link Label"), {
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
                        {
                          label: msg("fields.options.yes", "Yes"),
                          value: true,
                        },
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
            defaultItemProps: defaultSection,
            getItemSummary: (item: any, index?: number) => {
              const locale = i18nComponentsInstance.language || "en";
              const label =
                typeof item.label === "string"
                  ? item.label
                  : item.label?.[locale];
              return (
                label || pt("section", "Section") + " " + ((index ?? 0) + 1)
              );
            },
          }
        ),
      },
    }),
  },
  defaultProps: {
    data: {
      sections: [
        { ...defaultSection },
        { ...defaultSection },
        { ...defaultSection },
        { ...defaultSection },
      ],
    },
  },
  render: (props) => <FooterExpandedLinksWrapperInternal {...props} />,
};
