// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { YextField } from "../ve.ts";
import { YetiSectionShell } from "../atoms/YetiSectionShell.tsx";
import { defaultYetiHeaderLayoutSlotProps } from "./YetiHeaderLayoutSlot.tsx";

export interface YetiHeaderSectionProps {
  styles: {
    backgroundClassName: "bg-neutral-100" | "bg-white" | "bg-[#0F3658]";
    textClassName: "text-neutral-900" | "text-white";
    dividerClassName: "border-black/15" | "border-white/30";
    showBottomDivider: boolean;
    showHeaderLayout: boolean;
  };
  slots: {
    HeaderLayoutSlot: Slot;
  };
  liveVisibility: boolean;
}

const fields: Fields<YetiHeaderSectionProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundClassName: YextField("Background", {
        type: "select",
        options: [
          { label: "Light Gray", value: "bg-neutral-100" },
          { label: "White", value: "bg-white" },
          { label: "Yeti Blue", value: "bg-[#0F3658]" },
        ],
      }),
      textClassName: YextField("Text Color", {
        type: "select",
        options: [
          { label: "Dark", value: "text-neutral-900" },
          { label: "Light", value: "text-white" },
        ],
      }),
      dividerClassName: YextField("Divider Color", {
        type: "select",
        options: [
          { label: "Dark", value: "border-black/15" },
          { label: "Light", value: "border-white/30" },
        ],
      }),
      showBottomDivider: YextField("Show Bottom Divider", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showHeaderLayout: YextField("Show Header Layout", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      HeaderLayoutSlot: { type: "slot" },
    },
    visible: false,
  },
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const YetiHeaderSectionComponent: PuckComponent<YetiHeaderSectionProps> = ({
  styles,
  slots,
}) => {
  return (
    <YetiSectionShell
      backgroundClassName={styles.backgroundClassName}
      className={`py-4 md:py-6 ${styles.textClassName}`}
      contentClassName={
        styles.showBottomDivider
          ? `border-b pb-4 ${styles.dividerClassName}`
          : ""
      }
    >
      {styles.showHeaderLayout ? (
        <slots.HeaderLayoutSlot style={{ height: "auto" }} allow={[]} />
      ) : null}
    </YetiSectionShell>
  );
};

export const YetiHeaderSection: ComponentConfig<{
  props: YetiHeaderSectionProps;
}> = {
  label: "Yeti Header Section",
  fields,
  defaultProps: {
    styles: {
      backgroundClassName: "bg-[#0F3658]",
      textClassName: "text-white",
      dividerClassName: "border-white/30",
      showBottomDivider: true,
      showHeaderLayout: true,
    },
    slots: {
      HeaderLayoutSlot: [
        {
          type: "YetiHeaderLayoutSlot",
          props: defaultYetiHeaderLayoutSlotProps,
        },
      ],
    },
    liveVisibility: true,
  },
  render: (props) => {
    if (!props.liveVisibility && !props.puck.isEditing) {
      return null;
    }
    return <YetiHeaderSectionComponent {...props} />;
  },
};
