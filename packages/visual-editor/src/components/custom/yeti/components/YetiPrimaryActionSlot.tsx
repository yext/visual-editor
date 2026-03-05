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

export interface YetiPrimaryActionSlotProps {
  data: {
    actionText: TranslatableString;
    actionHref: string;
    openInNewTab: boolean;
  };
  styles: {
    variant: "solid" | "outline";
  };
}

const fields: Fields<YetiPrimaryActionSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      actionText: YextField("Action Text", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      actionHref: YextField("Action Href", { type: "text" }),
      openInNewTab: YextField("Open in New Tab", {
        type: "radio",
        options: [
          { label: "No", value: false },
          { label: "Yes", value: true },
        ],
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      variant: YextField("Variant", {
        type: "radio",
        options: [
          { label: "Solid", value: "solid" },
          { label: "Outline", value: "outline" },
        ],
      }),
    },
  }),
};

const YetiPrimaryActionSlotComponent: PuckComponent<
  YetiPrimaryActionSlotProps
> = ({ data, styles }) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const actionText = resolveComponentData(
    data.actionText,
    i18n.language,
    streamDocument
  );

  if (!actionText) {
    return null;
  }

  const variantClass =
    styles.variant === "outline"
      ? "border border-current bg-transparent"
      : "bg-black text-white";

  return (
    <a
      href={data.actionHref || "#"}
      target={data.openInNewTab ? "_blank" : undefined}
      rel={data.openInNewTab ? "noreferrer" : undefined}
      className={`inline-flex items-center justify-center px-5 py-2 text-sm font-semibold uppercase tracking-[0.08em] ${variantClass}`}
    >
      {actionText}
    </a>
  );
};

export const defaultYetiPrimaryActionSlotProps: YetiPrimaryActionSlotProps = {
  data: {
    actionText: toTranslatableString("Shop the shop"),
    actionHref:
      "https://yeti.locally.com/search/search?embed_type=store&store=173976&uri=search&limit=6&host_domain=www.yeti.com",
    openInNewTab: false,
  },
  styles: {
    variant: "outline",
  },
};

export const YetiPrimaryActionSlot: ComponentConfig<{
  props: YetiPrimaryActionSlotProps;
}> = {
  label: "Yeti Primary Action Slot",
  fields,
  defaultProps: defaultYetiPrimaryActionSlotProps,
  render: (props) => <YetiPrimaryActionSlotComponent {...props} />,
};
