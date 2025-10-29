import * as React from "react";
import { ComponentConfig, PuckComponent, Slot } from "@measured/puck";
import {
  YextField,
  msg,
  pt,
  TranslatableString,
  TranslatableCTA,
  YextEntityField,
  i18nComponentsInstance,
} from "@yext/visual-editor";

export interface FooterExpandedLinksWrapperProps {
  data: YextEntityField<
    {
      label: TranslatableString;
      links: TranslatableCTA[];
    }[]
  >;
  slots: {
    ExpandedSectionsSlot: Slot;
  };
}

const FooterExpandedLinksWrapperInternal: PuckComponent<
  FooterExpandedLinksWrapperProps
> = (props) => {
  const { slots } = props;

  return (
    <slots.ExpandedSectionsSlot
      className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full text-center md:text-left justify-items-center md:justify-items-start"
      style={{
        height: "auto",
      }}
      allow={[]}
    />
  );
};

export const FooterExpandedLinksWrapper: ComponentConfig<{
  props: FooterExpandedLinksWrapperProps;
}> = {
  label: msg("components.expandedLinks", "Expanded Links"),
  fields: {
    data: YextField(
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
        defaultItemProps: {
          label: { en: "Footer Section", hasLocalizedValue: "true" },
          links: [],
        },
        getItemSummary: (item, index) => {
          const locale = i18nComponentsInstance.language || "en";
          const label =
            typeof item.label === "string" ? item.label : item.label?.[locale];
          return label || pt("section", "Section") + " " + ((index ?? 0) + 1);
        },
      }
    ),
    slots: {
      type: "object",
      objectFields: {
        ExpandedSectionsSlot: { type: "slot" },
      },
      visible: false,
    },
  },
  defaultProps: {
    data: {
      field: "",
      constantValue: [],
      constantValueEnabled: true,
    },
    slots: {
      ExpandedSectionsSlot: [],
    },
  },
  resolveData: async (data) => {
    // Ensure data structure exists
    if (!data?.props?.data) {
      return data;
    }

    const expandedFooterLinks = data.props.data.constantValueEnabled
      ? data.props.data.constantValue
      : [];

    if (!expandedFooterLinks || !Array.isArray(expandedFooterLinks)) {
      return data;
    }

    // Always rebuild slots to sync with expandedFooterLinks array
    const newSlots = expandedFooterLinks.map(
      (section: any, sectionIndex: number) => ({
        type: "FooterExpandedLinkSectionSlot",
        props: {
          data: {
            label: {
              field: "",
              constantValue: section.label,
              constantValueEnabled: true,
            },
            links: {
              field: "",
              constantValue: section.links,
              constantValueEnabled: true,
            },
          },
          index: sectionIndex,
        },
      })
    );

    return {
      ...data,
      props: {
        ...data.props,
        slots: {
          ...data.props.slots,
          ExpandedSectionsSlot: newSlots,
        },
      },
    };
  },
  render: (props) => <FooterExpandedLinksWrapperInternal {...props} />,
};
