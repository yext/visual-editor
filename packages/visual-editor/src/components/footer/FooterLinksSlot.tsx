import * as React from "react";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import {
  YextField,
  msg,
  pt,
  useDocument,
  resolveComponentData,
  CTA,
  TranslatableCTA,
  i18nComponentsInstance,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { defaultLink, defaultLinks } from "./ExpandedFooter.tsx";

export interface FooterLinksSlotProps {
  data: {
    links: TranslatableCTA[];
  };
  styles: {};
  /** @internal */
  variant?: "primary" | "secondary";
  /** @internal */
  eventNamePrefix?: string;
  /** @internal */
  alignment?: "left" | "right";
}

const FooterLinksSlotInternal: PuckComponent<FooterLinksSlotProps> = (
  props
) => {
  const {
    data,
    variant = "primary",
    eventNamePrefix = "footer",
    alignment = "left",
    puck,
  } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  if (!data.links || data.links.length === 0) {
    return puck.isEditing ? <div className="h-10 min-w-[100px]" /> : <></>;
  }

  const secondaryAlignment =
    variant === "secondary" && alignment === "right"
      ? "md:justify-end"
      : "md:justify-start";

  return (
    <div
      className={`${
        variant === "secondary"
          ? `gap-4 flex flex-col md:flex-row w-full ${secondaryAlignment}`
          : "w-full grid grid-cols-1 md:grid-cols-5 gap-6"
      }`}
    >
      {data.links.map((linkData, index) => {
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
          <CTA
            key={index}
            variant={
              variant === "primary"
                ? "headerFooterMainLink"
                : "headerFooterSecondaryLink"
            }
            eventName={`cta.${eventNamePrefix}.${index}-Link-${index + 1}`}
            label={label}
            linkType={linkData.linkType}
            link={link}
            className={`justify-center block break-words whitespace-normal`}
          />
        );
      })}
    </div>
  );
};

const defaultFooterLinkProps: FooterLinksSlotProps = {
  data: {
    links: defaultLinks,
  },
  styles: {},
  variant: "primary",
  alignment: "left",
};

const footerLinksSlotFields: Fields<FooterLinksSlotProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
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
          label: YextField(msg("fields.label", "Label"), {
            type: "translatableString",
            filter: { types: ["type.string"] },
          }),
          link: YextField(msg("fields.link", "Link"), {
            type: "text",
          }),
        },
        defaultItemProps: defaultLink,
        getItemSummary: (item: any, index?: number) => {
          const locale = i18nComponentsInstance.language || "en";
          const label =
            typeof item.label === "string" ? item.label : item.label?.[locale];
          return label || pt("link", "Link") + " " + ((index ?? 0) + 1);
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {},
  }),
  variant: {
    type: "radio",
    options: [
      { label: "Primary", value: "primary" },
      { label: "Secondary", value: "secondary" },
    ],
    visible: false,
  },
  eventNamePrefix: {
    type: "text",
    visible: false,
  },
  alignment: {
    type: "radio",
    options: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ],
    visible: false,
  },
};

export const FooterLinksSlot: ComponentConfig<{ props: FooterLinksSlotProps }> =
  {
    label: msg("components.footerLinksSlot", "Links"),
    fields: footerLinksSlotFields,
    defaultProps: defaultFooterLinkProps,
    render: (props) => <FooterLinksSlotInternal {...props} />,
  };
