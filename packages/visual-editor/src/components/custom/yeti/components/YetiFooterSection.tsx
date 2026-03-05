// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { YextField } from "../ve.ts";
import { YetiSectionShell } from "../atoms/YetiSectionShell.tsx";
import { defaultYetiFooterLayoutSlotProps } from "./YetiFooterLayoutSlot.tsx";

export interface YetiFooterSectionProps {
  styles: {
    backgroundClassName: "bg-neutral-100" | "bg-white" | "bg-[#0F3658]";
    textClassName: "text-neutral-900" | "text-white";
    dividerClassName: "border-black/15" | "border-white/30";
    showTopDivider: boolean;
    showFooterLayout: boolean;
  };
  slots: {
    FooterLayoutSlot: Slot;
  };
  liveVisibility: boolean;
}

const fields: Fields<YetiFooterSectionProps> = {
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
      showTopDivider: YextField("Show Top Divider", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showFooterLayout: YextField("Show Footer Layout", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      FooterLayoutSlot: { type: "slot" },
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

const YetiFooterSectionComponent: PuckComponent<YetiFooterSectionProps> = ({
  styles,
  slots,
}) => {
  return (
    <YetiSectionShell
      backgroundClassName={styles.backgroundClassName}
      className={`py-10 md:py-14 ${styles.textClassName}`}
      contentClassName={
        styles.showTopDivider ? `border-t pt-6 ${styles.dividerClassName}` : ""
      }
    >
      {styles.showFooterLayout ? (
        <slots.FooterLayoutSlot style={{ height: "auto" }} allow={[]} />
      ) : null}
    </YetiSectionShell>
  );
};

export const YetiFooterSection: ComponentConfig<{
  props: YetiFooterSectionProps;
}> = {
  label: "Yeti Footer Section",
  fields,
  defaultProps: {
    styles: {
      backgroundClassName: "bg-[#0F3658]",
      textClassName: "text-white",
      dividerClassName: "border-white/30",
      showTopDivider: true,
      showFooterLayout: true,
    },
    slots: {
      FooterLayoutSlot: [
        {
          type: "YetiFooterLayoutSlot",
          props: defaultYetiFooterLayoutSlotProps,
        },
      ],
    },
    liveVisibility: true,
  },
  render: (props) => {
    if (!props.liveVisibility && !props.puck.isEditing) {
      return null;
    }
    return <YetiFooterSectionComponent {...props} />;
  },
};
