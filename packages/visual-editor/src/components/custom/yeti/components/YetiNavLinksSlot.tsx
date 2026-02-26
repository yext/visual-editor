// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiNavLinksSlotProps {
  data: {
    links: Array<{
      label: TranslatableString;
      href: string;
      openInNewTab: boolean;
    }>;
  };
  styles: {
    align: "left" | "center" | "right";
  };
}

const fields: Fields<YetiNavLinksSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      links: YextField("Links", {
        type: "array",
        defaultItemProps: {
          label: toTranslatableString("Link"),
          href: "#",
          openInNewTab: false,
        },
        arrayFields: {
          label: YextField("Label", {
            type: "translatableString",
            filter: { types: ["type.string"] },
          }),
          href: YextField("Href", { type: "text" }),
          openInNewTab: YextField("Open in New Tab", {
            type: "radio",
            options: [
              { label: "No", value: false },
              { label: "Yes", value: true },
            ],
          }),
        },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      align: YextField("Align", {
        type: "radio",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      }),
    },
  }),
};

const alignClassMap: Record<YetiNavLinksSlotProps["styles"]["align"], string> =
  {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  };

const YetiNavLinksSlotComponent: PuckComponent<YetiNavLinksSlotProps> = ({
  data,
  styles,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  return (
    <ul
      className={`flex w-full flex-wrap gap-x-6 gap-y-2 text-sm uppercase tracking-[0.08em] ${alignClassMap[styles.align]}`}
    >
      {data.links.map((item, index) => {
        const label = resolveComponentData(
          item?.label,
          i18n.language,
          streamDocument
        );
        if (!label) {
          return null;
        }

        return (
          <li key={`${item.href}-${index}`}>
            <a
              href={item.href || "#"}
              target={item.openInNewTab ? "_blank" : undefined}
              rel={item.openInNewTab ? "noreferrer" : undefined}
              className="font-semibold"
            >
              {label}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export const defaultYetiPrimaryNavLinksSlotProps: YetiNavLinksSlotProps = {
  data: {
    links: [
      {
        label: toTranslatableString("Shop All"),
        href: "https://www.yeti.com/",
        openInNewTab: false,
      },
      {
        label: toTranslatableString("Corporate Sales"),
        href: "https://www.yeti.com/corporate-sales.html",
        openInNewTab: false,
      },
      {
        label: toTranslatableString("Customize"),
        href: "https://www.yeti.com/customize",
        openInNewTab: false,
      },
      {
        label: toTranslatableString("Resale"),
        href: "https://rescues.yeti.com/",
        openInNewTab: true,
      },
    ],
  },
  styles: {
    align: "left",
  },
};

export const defaultYetiUtilityNavLinksSlotProps: YetiNavLinksSlotProps = {
  data: {
    links: [
      {
        label: toTranslatableString("Find a Store"),
        href: "https://www.yeti.com/yeti-store-locations.html",
        openInNewTab: false,
      },
      {
        label: toTranslatableString("Customer Support"),
        href: "https://www.yeti.com/help-guide.html",
        openInNewTab: false,
      },
    ],
  },
  styles: {
    align: "right",
  },
};

export const YetiNavLinksSlot: ComponentConfig<{
  props: YetiNavLinksSlotProps;
}> = {
  label: "Yeti Nav Links Slot",
  fields,
  defaultProps: defaultYetiPrimaryNavLinksSlotProps,
  render: (props) => <YetiNavLinksSlotComponent {...props} />,
};
