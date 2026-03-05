// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { YextField } from "../ve.ts";
import { YetiSectionShell } from "../atoms/YetiSectionShell.tsx";
import { defaultYetiSectionHeadingSlotProps } from "./YetiSectionHeadingSlot.tsx";
import { defaultYetiFaqListSlotProps } from "./YetiFaqListSlot.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiFaqSectionProps {
  styles: {
    backgroundClassName: "bg-white" | "bg-neutral-100";
    showHeading: boolean;
    showFaqList: boolean;
  };
  slots: {
    HeadingSlot: Slot;
    FaqListSlot: Slot;
  };
  liveVisibility: boolean;
}

const fields: Fields<YetiFaqSectionProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundClassName: YextField("Background", {
        type: "select",
        options: [
          { label: "White", value: "bg-white" },
          { label: "Soft Gray", value: "bg-neutral-100" },
        ],
      }),
      showHeading: YextField("Show Heading", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showFaqList: YextField("Show FAQ List", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      HeadingSlot: { type: "slot" },
      FaqListSlot: { type: "slot" },
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

const YetiFaqSectionComponent: PuckComponent<YetiFaqSectionProps> = ({
  styles,
  slots,
}) => {
  return (
    <YetiSectionShell
      backgroundClassName={styles.backgroundClassName}
      className="py-10 md:py-14"
    >
      <div className="flex w-full flex-col gap-6">
        {styles.showHeading ? (
          <slots.HeadingSlot style={{ height: "auto" }} allow={[]} />
        ) : null}
        {styles.showFaqList ? (
          <slots.FaqListSlot style={{ height: "auto" }} allow={[]} />
        ) : null}
      </div>
    </YetiSectionShell>
  );
};

export const YetiFaqSection: ComponentConfig<{ props: YetiFaqSectionProps }> = {
  label: "Yeti FAQ Section",
  fields,
  defaultProps: {
    styles: {
      backgroundClassName: "bg-white",
      showHeading: true,
      showFaqList: true,
    },
    slots: {
      HeadingSlot: [
        {
          type: "YetiSectionHeadingSlot",
          props: {
            ...defaultYetiSectionHeadingSlotProps,
            data: {
              text: toTranslatableString("FAQ"),
            },
            styles: {
              level: 2,
              align: "left",
            },
          },
        },
      ],
      FaqListSlot: [
        {
          type: "YetiFaqListSlot",
          props: defaultYetiFaqListSlotProps,
        },
      ],
    },
    liveVisibility: true,
  },
  render: (props) => {
    if (!props.liveVisibility && !props.puck.isEditing) {
      return null;
    }
    return <YetiFaqSectionComponent {...props} />;
  },
};
