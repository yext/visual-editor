import * as React from "react";
import { ComponentConfig, PuckComponent, Slot, setDeep } from "@measured/puck";
import {
  YextField,
  msg,
  TranslatableString,
  TranslatableCTA,
  YextEntityField,
} from "@yext/visual-editor";
import { FooterExpandedLinkSectionSlotProps } from "./FooterExpandedLinkSectionSlot";

export interface FooterExpandedLinksWrapperProps {
  data: {
    expandedFooterLinks: YextEntityField<
      {
        label: TranslatableString;
        links: TranslatableCTA[];
      }[]
    >;
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
    <div className="grid grid-cols-1 md:grid-cols-4 w-full text-center md:text-left justify-items-center md:justify-items-start gap-6">
      <slots.ExpandedSectionsSlot style={{ height: "auto" }} allow={[]} />
    </div>
  );
};

export const FooterExpandedLinksWrapper: ComponentConfig<{
  props: FooterExpandedLinksWrapperProps;
}> = {
  label: msg(
    "components.footerExpandedLinksWrapper",
    "Footer Expanded Links Wrapper"
  ),
  fields: {
    data: YextField(msg("fields.data", "Data"), {
      type: "object",
      objectFields: {
        expandedFooterLinks: YextField(
          msg("fields.expandedFooterLinks", "Expanded Footer Links"),
          {
            type: "array",
            arrayFields: {
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
            getItemSummary: (item, index) => `Section ${(index ?? 0) + 1}`,
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
      expandedFooterLinks: {
        field: "",
        constantValue: [],
        constantValueEnabled: true,
      },
    },
    slots: {
      ExpandedSectionsSlot: [],
    },
  },
  resolveData: async (data, { changed }) => {
    const expandedFooterLinks = data.props.data.expandedFooterLinks
      .constantValueEnabled
      ? data.props.data.expandedFooterLinks.constantValue
      : [];

    if (!expandedFooterLinks || !Array.isArray(expandedFooterLinks)) {
      return data;
    }

    // If expanded footer links data changed, sync the slots
    if (
      changed?.data?.expandedFooterLinks ||
      data.props.slots.ExpandedSectionsSlot.length !==
        expandedFooterLinks.length
    ) {
      const newSlots = expandedFooterLinks.map((section, index) => ({
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
          slots: {
            LinksSlot: [],
          },
          index,
        } satisfies FooterExpandedLinkSectionSlotProps,
      }));

      return setDeep(data, "props.slots.ExpandedSectionsSlot", newSlots);
    }

    return data;
  },
  render: (props) => <FooterExpandedLinksWrapperInternal {...props} />,
};
