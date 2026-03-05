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

export interface YetiBrandSlotProps {
  data: {
    logoLabel: TranslatableString;
    logoHref: string;
    utilityLabel: TranslatableString;
    utilityHref: string;
  };
  styles: {
    showUtilityLink: boolean;
  };
}

const fields: Fields<YetiBrandSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      logoLabel: YextField("Logo Label", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      logoHref: YextField("Logo Href", { type: "text" }),
      utilityLabel: YextField("Utility Label", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
      utilityHref: YextField("Utility Href", { type: "text" }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      showUtilityLink: YextField("Show Utility Link", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
};

const YetiBrandSlotComponent: PuckComponent<YetiBrandSlotProps> = ({
  data,
  styles,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const logoLabel = resolveComponentData(
    data.logoLabel,
    i18n.language,
    streamDocument
  );
  const utilityLabel = resolveComponentData(
    data.utilityLabel,
    i18n.language,
    streamDocument
  );

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <a
        href={data.logoHref || "/"}
        className="text-xl font-black tracking-[0.18em] uppercase"
      >
        {logoLabel}
      </a>
      {styles.showUtilityLink && utilityLabel ? (
        <a
          href={data.utilityHref || "#"}
          className="text-sm font-semibold underline underline-offset-4"
        >
          {utilityLabel}
        </a>
      ) : null}
    </div>
  );
};

export const defaultYetiBrandSlotProps: YetiBrandSlotProps = {
  data: {
    logoLabel: toTranslatableString("YETI"),
    logoHref: "https://www.yeti.com/",
    utilityLabel: toTranslatableString("Find a Store"),
    utilityHref: "https://www.yeti.com/yeti-store-locations.html",
  },
  styles: {
    showUtilityLink: true,
  },
};

export const YetiBrandSlot: ComponentConfig<{ props: YetiBrandSlotProps }> = {
  label: "Yeti Brand Slot",
  fields,
  defaultProps: defaultYetiBrandSlotProps,
  render: (props) => <YetiBrandSlotComponent {...props} />,
};
