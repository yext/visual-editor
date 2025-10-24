import * as React from "react";
import { ComponentConfig, PuckComponent, Slot, setDeep } from "@measured/puck";
import {
  YextField,
  msg,
  useDocument,
  resolveComponentData,
  TranslatableString,
  TranslatableCTA,
  YextEntityField,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { FooterLinkSlotProps } from "./FooterLinkSlot";

export interface FooterExpandedLinkSectionSlotProps {
  data: {
    label: YextEntityField<TranslatableString>;
    links: YextEntityField<TranslatableCTA[]>;
  };
  slots: {
    LinksSlot: Slot;
  };
  index?: number;
}

const FooterExpandedLinkSectionSlotInternal: PuckComponent<
  FooterExpandedLinkSectionSlotProps
> = (props) => {
  const { data, slots, puck } = props;
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const label = resolveComponentData(data.label, i18n.language, streamDocument);

  if (!label && !puck.isEditing) {
    return <></>;
  }

  if (!label && puck.isEditing) {
    return <div className="h-10" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h3 className="font-bold">{label}</h3>
      <ul className="flex flex-col gap-4">
        <slots.LinksSlot style={{ height: "auto" }} allow={[]} />
      </ul>
    </div>
  );
};

export const FooterExpandedLinkSectionSlot: ComponentConfig<{
  props: FooterExpandedLinkSectionSlotProps;
}> = {
  label: msg(
    "components.footerExpandedLinkSectionSlot",
    "Footer Expanded Link Section"
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
        constantValue: [],
        constantValueEnabled: true,
      },
    },
    slots: {
      LinksSlot: [],
    },
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
          variant: "primary",
          eventNamePrefix: "expandedFooter",
          index: (data.props.index || 0) * 100 + index,
        } satisfies FooterLinkSlotProps,
      }));

      return setDeep(data, "props.slots.LinksSlot", newSlots);
    }

    return data;
  },
  render: (props) => <FooterExpandedLinkSectionSlotInternal {...props} />,
};
