import * as React from "react";
import { ComponentConfig, PuckComponent, setDeep } from "@puckeditor/core";
import { YextField } from "../../editor/YextField.tsx";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { TranslatableString, TranslatableCTA } from "../../types/types.ts";
import { i18nComponentsInstance } from "../../utils/i18n/components.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import {
  getDisplayValue,
  resolveComponentData,
} from "../../utils/resolveComponentData.tsx";
import { CTA } from "../atoms/cta.tsx";
import { useBackground } from "../../hooks/useBackground.tsx";
import { Body } from "../atoms/body.tsx";
import { useTranslation } from "react-i18next";
import { defaultLink, defaultLinks } from "./ExpandedFooter.tsx";
import { isNonNormalizableLinkType } from "../../utils/normalizeLink.ts";
import { ThemeColor } from "../../utils/themeConfigOptions.ts";
import { cva } from "class-variance-authority";
import { themeManagerCn } from "../../utils/cn.ts";

const defaultSection = {
  label: { defaultValue: "Footer Label" },
  links: defaultLinks,
};

const footerExpandedLinksWrapperFields = {
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
                      value: "PHONE",
                    },
                    {
                      label: msg("fields.options.email", "Email"),
                      value: "EMAIL",
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
                normalizeLink: YextField(
                  msg("fields.normalizeLink", "Normalize Link"),
                  {
                    type: "radio",
                    options: [
                      {
                        label: msg("fields.options.yes", "Yes"),
                        value: true,
                      },
                      {
                        label: msg("fields.options.no", "No"),
                        value: false,
                      },
                    ],
                  }
                ),
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
              getItemSummary: (item, index) => {
                const locale = i18nComponentsInstance.language || "en";
                const label = getDisplayValue(item.label, locale);
                return label || pt("link", "Link") + " " + ((index ?? 0) + 1);
              },
            }),
          },
          defaultItemProps: defaultSection,
          getItemSummary: (item, index) => {
            const locale = i18nComponentsInstance.language || "en";
            const label = getDisplayValue(item.label, locale);
            return label || pt("section", "Section") + " " + ((index ?? 0) + 1);
          },
        }
      ),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      color: YextField(msg("fields.color", "Color"), {
        type: "select",
        options: "SITE_COLOR",
      }),
    },
  }),
};

export interface FooterExpandedLinksWrapperProps {
  data: {
    sections: {
      label: TranslatableString;
      links: TranslatableCTA[];
    }[];
  };
  styles?: {
    color?: ThemeColor;
  };
  /** @internal */
  desktopContentAlignment?: "left" | "center" | "right";
  /** @internal */
  mobileContentAlignment?: "left" | "center" | "right";
}

const expandedLinksWrapperAlignment = cva("w-full flex", {
  variants: {
    desktopContentAlignment: {
      left: "md:justify-start",
      center: "md:justify-center",
      right: "md:justify-end",
    },
    mobileContentAlignment: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
  },
  defaultVariants: {
    desktopContentAlignment: "left",
    mobileContentAlignment: "left",
  },
});

const expandedLinksContainerAlignment = cva(
  "grid grid-cols-1 gap-6 md:w-full md:[grid-template-columns:repeat(var(--expanded-footer-section-columns),minmax(0,1fr))]",
  {
    variants: {
      desktopContentAlignment: {
        left: "md:text-left md:justify-items-start",
        center: "md:text-center md:justify-items-center",
        right: "md:text-right md:justify-items-end",
      },
      mobileContentAlignment: {
        left: "text-left justify-items-start",
        center: "text-center justify-items-center",
        right: "text-right justify-items-end",
      },
    },
    defaultVariants: {
      desktopContentAlignment: "left",
      mobileContentAlignment: "left",
    },
  }
);

const expandedSectionAlignment = cva("flex flex-col gap-6", {
  variants: {
    desktopContentAlignment: {
      left: "md:items-start",
      center: "md:items-center",
      right: "md:items-end",
    },
    mobileContentAlignment: {
      left: "items-start",
      center: "items-center",
      right: "items-end",
    },
  },
  defaultVariants: {
    desktopContentAlignment: "left",
    mobileContentAlignment: "left",
  },
});

const expandedLinkJustification = cva("block break-words whitespace-normal", {
  variants: {
    desktopContentAlignment: {
      left: "md:justify-start",
      center: "md:justify-center",
      right: "md:justify-end",
    },
    mobileContentAlignment: {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
    },
  },
  defaultVariants: {
    desktopContentAlignment: "left",
    mobileContentAlignment: "left",
  },
});

const shouldShowNormalizeLinkField = (
  sections?: FooterExpandedLinksWrapperProps["data"]["sections"]
) => {
  return (
    !sections?.length ||
    sections.some(
      (section) =>
        !section.links?.length ||
        section.links.some((link) => !isNonNormalizableLinkType(link?.linkType))
    )
  );
};

const FooterExpandedLinksWrapperInternal: PuckComponent<
  FooterExpandedLinksWrapperProps
> = (props) => {
  const {
    data,
    styles,
    desktopContentAlignment = "left",
    mobileContentAlignment = "left",
  } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const background = useBackground();
  const isDarkBackground = background?.isDarkColor ?? false;

  const sections = data.sections || [];
  const defaultLabelColor = isDarkBackground
    ? ({ selectedColor: "white", contrastingColor: "black" } as ThemeColor)
    : ({ selectedColor: "black", contrastingColor: "white" } as ThemeColor);
  const defaultLinkColor = isDarkBackground
    ? ({ selectedColor: "white", contrastingColor: "black" } as ThemeColor)
    : ({
        selectedColor: "palette-primary-dark",
        contrastingColor: "white",
      } as ThemeColor);
  const resolvedLabelColor = styles?.color ?? defaultLabelColor;
  const resolvedLinkColor = styles?.color ?? defaultLinkColor;
  const desktopSectionColumns = Math.max(1, Math.min(sections.length, 4));

  return (
    <div
      className={expandedLinksWrapperAlignment({
        desktopContentAlignment,
        mobileContentAlignment,
      })}
    >
      <div
        className={expandedLinksContainerAlignment({
          desktopContentAlignment,
          mobileContentAlignment,
        })}
        style={
          {
            "--expanded-footer-section-columns": desktopSectionColumns,
          } as React.CSSProperties
        }
      >
        {sections.map((section, sectionIndex) => {
          const label = resolveComponentData(
            section.label,
            i18n.language,
            streamDocument
          );
          const links = section.links || [];

          return (
            <div
              key={sectionIndex}
              className={expandedSectionAlignment({
                desktopContentAlignment,
                mobileContentAlignment,
              })}
            >
              <Body
                className="break-words font-link-fontWeight font-body-fontFamily font-body-fontWeight"
                color={resolvedLabelColor}
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
                      normalizeLink={
                        isNonNormalizableLinkType(linkData.linkType)
                          ? false
                          : (linkData.normalizeLink ?? true)
                      }
                      className={themeManagerCn(
                        expandedLinkJustification({
                          desktopContentAlignment,
                          mobileContentAlignment,
                        })
                      )}
                      color={resolvedLinkColor}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const FooterExpandedLinksWrapper: ComponentConfig<{
  props: FooterExpandedLinksWrapperProps;
}> = {
  label: msg("components.expandedLinks", "Expanded Links"),
  fields: footerExpandedLinksWrapperFields,
  resolveFields: (data) =>
    setDeep(
      footerExpandedLinksWrapperFields,
      "data.objectFields.sections.arrayFields.links.arrayFields.normalizeLink.visible",
      shouldShowNormalizeLinkField(data.props.data.sections)
    ),
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
