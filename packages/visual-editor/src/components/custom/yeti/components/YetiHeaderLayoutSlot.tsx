// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import {
  TranslatableString,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { toTranslatableString } from "../atoms/defaults.ts";
import {
  defaultYetiPrimaryNavLinksSlotProps,
  defaultYetiUtilityNavLinksSlotProps,
} from "./YetiNavLinksSlot.tsx";
import { defaultYetiBrandSlotProps } from "./YetiBrandSlot.tsx";
import { defaultYetiPrimaryActionSlotProps } from "./YetiPrimaryActionSlot.tsx";

export interface YetiHeaderLayoutSlotProps {
  data: {
    announcementText: TranslatableString;
  };
  styles: {
    showAnnouncement: boolean;
    showBrand: boolean;
    showPrimaryLinks: boolean;
    showUtilityLinks: boolean;
    showPrimaryAction: boolean;
  };
  slots: {
    BrandSlot: Slot;
    PrimaryLinksSlot: Slot;
    UtilityLinksSlot: Slot;
    PrimaryActionSlot: Slot;
  };
}

const fields: Fields<YetiHeaderLayoutSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      announcementText: YextField("Announcement Text", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      showAnnouncement: YextField("Show Announcement", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showBrand: YextField("Show Brand", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showPrimaryLinks: YextField("Show Primary Links", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showUtilityLinks: YextField("Show Utility Links", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showPrimaryAction: YextField("Show Primary Action", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      BrandSlot: { type: "slot" },
      PrimaryLinksSlot: { type: "slot" },
      UtilityLinksSlot: { type: "slot" },
      PrimaryActionSlot: { type: "slot" },
    },
    visible: false,
  },
};

const YetiHeaderLayoutSlotComponent: PuckComponent<
  YetiHeaderLayoutSlotProps
> = ({ data, styles, slots }) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();
  const announcementText = resolveComponentData(
    data.announcementText,
    i18n.language,
    streamDocument
  );

  return (
    <div className="flex w-full flex-col gap-4 overflow-hidden border-b border-current/25 pb-4">
      {styles.showAnnouncement && announcementText ? (
        <div className="text-xs uppercase tracking-[0.08em]">
          {announcementText}
        </div>
      ) : null}
      <div className="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {styles.showBrand ? (
          <div className="min-w-0 lg:flex-1">
            <slots.BrandSlot style={{ height: "auto" }} allow={[]} />
          </div>
        ) : null}
        {styles.showPrimaryLinks ? (
          <div className="min-w-0 lg:flex-[2]">
            <slots.PrimaryLinksSlot style={{ height: "auto" }} allow={[]} />
          </div>
        ) : null}
      </div>
      {(styles.showUtilityLinks || styles.showPrimaryAction) && (
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 lg:flex-1">
            {styles.showUtilityLinks ? (
              <slots.UtilityLinksSlot style={{ height: "auto" }} allow={[]} />
            ) : null}
          </div>
          {styles.showPrimaryAction ? (
            <div className="min-w-0">
              <slots.PrimaryActionSlot style={{ height: "auto" }} allow={[]} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export const defaultYetiHeaderLayoutSlotProps: YetiHeaderLayoutSlotProps = {
  data: {
    announcementText: toTranslatableString(
      "Free customization in select YETI stores"
    ),
  },
  styles: {
    showAnnouncement: true,
    showBrand: true,
    showPrimaryLinks: true,
    showUtilityLinks: true,
    showPrimaryAction: true,
  },
  slots: {
    BrandSlot: [{ type: "YetiBrandSlot", props: defaultYetiBrandSlotProps }],
    PrimaryLinksSlot: [
      { type: "YetiNavLinksSlot", props: defaultYetiPrimaryNavLinksSlotProps },
    ],
    UtilityLinksSlot: [
      { type: "YetiNavLinksSlot", props: defaultYetiUtilityNavLinksSlotProps },
    ],
    PrimaryActionSlot: [
      {
        type: "YetiPrimaryActionSlot",
        props: defaultYetiPrimaryActionSlotProps,
      },
    ],
  },
};

export const YetiHeaderLayoutSlot: ComponentConfig<{
  props: YetiHeaderLayoutSlotProps;
}> = {
  label: "Yeti Header Layout Slot",
  fields,
  defaultProps: defaultYetiHeaderLayoutSlotProps,
  render: (props) => <YetiHeaderLayoutSlotComponent {...props} />,
};
