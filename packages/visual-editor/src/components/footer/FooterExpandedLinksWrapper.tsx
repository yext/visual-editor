import * as React from "react";
import { ComponentConfig, PuckComponent, Slot } from "@measured/puck";
import {
  YextField,
  msg,
  pt,
  TranslatableString,
  TranslatableCTA,
  i18nComponentsInstance,
} from "@yext/visual-editor";
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
      allow={["FooterExpandedLinkSectionSlot"]}
    />
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
      sections: [
        { ...defaultSection },
        { ...defaultSection },
        { ...defaultSection },
        { ...defaultSection },
      ],
    },
    slots: {
      ExpandedSectionsSlot: [],
    },
  },
  resolveData: async (data) => {
    if (!data?.props?.data?.sections) {
      return data;
    }

    const sections = data.props.data.sections;

    if (!sections || !Array.isArray(sections)) {
      return data;
    }

    // Create slots from the sections array
    const newSlots = sections.map((section: any, index: number) => ({
      type: "FooterExpandedLinkSectionSlot",
      props: {
        data: {
          label: {
            field: "",
            constantValue: section.label,
            constantValueEnabled: true,
          },
          links: section.links || [],
        },
        styles: {},
        index,
      },
    }));

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
