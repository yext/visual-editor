import * as React from "react";
import { ComponentConfig, PuckComponent, Slot, setDeep } from "@measured/puck";
import {
  YextField,
  msg,
  TranslatableCTA,
  YextEntityField,
} from "@yext/visual-editor";
import { FooterLinkSlotProps } from "./FooterLinkSlot";

export interface FooterLinksWrapperProps {
  data: {
    links: YextEntityField<TranslatableCTA[]>;
  };
  slots: {
    LinksSlot: Slot;
  };
  variant?: "primary" | "secondary";
}

const FooterLinksWrapperInternal: PuckComponent<FooterLinksWrapperProps> = (
  props
) => {
  const { slots, variant = "primary" } = props;

  return (
    <ul
      className={`w-full ${variant === "secondary" ? "gap-4 flex flex-col md:flex-row" : "grid grid-cols-1 md:grid-cols-5 gap-6"}`}
    >
      <slots.LinksSlot style={{ height: "auto" }} allow={[]} />
    </ul>
  );
};

export const FooterLinksWrapper: ComponentConfig<{
  props: FooterLinksWrapperProps;
}> = {
  label: msg("components.footerLinksWrapper", "Footer Links Wrapper"),
  fields: {
    data: YextField(msg("fields.data", "Data"), {
      type: "object",
      objectFields: {
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
          getItemSummary: (item, index) => `Link ${(index ?? 0) + 1}`,
        }),
      },
    }),
    slots: {
      type: "object",
      objectFields: {
        LinksSlot: { type: "slot" },
      },
      visible: false,
    },
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
      links: {
        field: "",
        constantValue: [],
        constantValueEnabled: true,
      },
    },
    slots: {
      LinksSlot: [],
    },
    variant: "primary",
  },
  resolveData: async (data, { changed }) => {
    const links = data.props.data.links.constantValueEnabled
      ? data.props.data.links.constantValue
      : [];

    if (!links || !Array.isArray(links)) {
      return data;
    }

    // If links data changed, sync the slots
    if (
      changed?.data?.links ||
      data.props.slots.LinksSlot.length !== links.length
    ) {
      const newSlots = links.map((link, index) => ({
        type: "FooterLinkSlot",
        props: {
          data: {
            link: {
              field: "",
              constantValue: link,
              constantValueEnabled: true,
            },
          },
          variant: data.props.variant || "primary",
          eventNamePrefix: data.props.variant || "primary",
          index,
        } satisfies FooterLinkSlotProps,
      }));

      return setDeep(data, "props.slots.LinksSlot", newSlots);
    }

    return data;
  },
  render: (props) => <FooterLinksWrapperInternal {...props} />,
};
