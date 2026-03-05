// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { YextField } from "../ve.ts";
import { YetiSectionShell } from "../atoms/YetiSectionShell.tsx";
import { defaultYetiHeroHeadingSlotProps } from "./YetiHeroHeadingSlot.tsx";
import { defaultYetiHeroImageSlotProps } from "./YetiHeroImageSlot.tsx";
import { defaultYetiBodyCopySlotProps } from "./YetiBodyCopySlot.tsx";
import { defaultYetiPrimaryActionSlotProps } from "./YetiPrimaryActionSlot.tsx";

export interface YetiLocationHeroSectionProps {
  styles: {
    contentAlign: "left" | "center";
    showImage: boolean;
    showHeading: boolean;
    showBody: boolean;
    showAction: boolean;
  };
  slots: {
    HeroImageSlot: Slot;
    HeroHeadingSlot: Slot;
    HeroBodySlot: Slot;
    HeroActionSlot: Slot;
  };
  liveVisibility: boolean;
}

const fields: Fields<YetiLocationHeroSectionProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      contentAlign: YextField("Content Align", {
        type: "radio",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
        ],
      }),
      showImage: YextField("Show Image", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showHeading: YextField("Show Heading", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showBody: YextField("Show Body", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showAction: YextField("Show Action", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      HeroImageSlot: { type: "slot" },
      HeroHeadingSlot: { type: "slot" },
      HeroBodySlot: { type: "slot" },
      HeroActionSlot: { type: "slot" },
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

const YetiLocationHeroSectionComponent: PuckComponent<
  YetiLocationHeroSectionProps
> = ({ styles, slots }) => {
  const isCentered = styles.contentAlign === "center";

  return (
    <YetiSectionShell className="px-0 md:px-0" contentClassName="max-w-none">
      <section className="relative w-full overflow-hidden">
        {styles.showImage ? (
          <slots.HeroImageSlot style={{ height: "auto" }} allow={[]} />
        ) : (
          <div className="h-[420px] w-full bg-neutral-200" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 to-black/5" />
        <div
          className={`pointer-events-none absolute inset-0 flex items-end p-6 md:p-10 ${isCentered ? "justify-center" : "justify-start"}`}
        >
          <div
            className={`pointer-events-auto max-w-3xl text-white ${isCentered ? "text-center" : "text-left"}`}
          >
            {styles.showHeading ? (
              <div className="min-w-0">
                <slots.HeroHeadingSlot style={{ height: "auto" }} allow={[]} />
              </div>
            ) : null}
            {styles.showBody ? (
              <div className="mt-4 min-w-0">
                <slots.HeroBodySlot style={{ height: "auto" }} allow={[]} />
              </div>
            ) : null}
            {styles.showAction ? (
              <div className="mt-5 min-w-0">
                <slots.HeroActionSlot style={{ height: "auto" }} allow={[]} />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </YetiSectionShell>
  );
};

const heroBodyDefaults = {
  ...defaultYetiBodyCopySlotProps,
  data: {
    ...defaultYetiBodyCopySlotProps.data,
    copy: {
      en: "Experience YETI gear, drinkware, and customizations in-store.",
      hasLocalizedValue: "true",
    },
  },
};

export const YetiLocationHeroSection: ComponentConfig<{
  props: YetiLocationHeroSectionProps;
}> = {
  label: "Yeti Location Hero Section",
  fields,
  defaultProps: {
    styles: {
      contentAlign: "left",
      showImage: true,
      showHeading: true,
      showBody: false,
      showAction: true,
    },
    slots: {
      HeroImageSlot: [
        {
          type: "YetiHeroImageSlot",
          props: defaultYetiHeroImageSlotProps,
        },
      ],
      HeroHeadingSlot: [
        {
          type: "YetiHeroHeadingSlot",
          props: defaultYetiHeroHeadingSlotProps,
        },
      ],
      HeroBodySlot: [
        {
          type: "YetiBodyCopySlot",
          props: heroBodyDefaults,
        },
      ],
      HeroActionSlot: [
        {
          type: "YetiPrimaryActionSlot",
          props: defaultYetiPrimaryActionSlotProps,
        },
      ],
    },
    liveVisibility: true,
  },
  render: (props) => {
    if (!props.liveVisibility && !props.puck.isEditing) {
      return null;
    }
    return <YetiLocationHeroSectionComponent {...props} />;
  },
};
