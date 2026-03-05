// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { YextField } from "../ve.ts";
import { YetiSectionShell } from "../atoms/YetiSectionShell.tsx";
import { defaultYetiHeroImageSlotProps } from "./YetiHeroImageSlot.tsx";
import { defaultYetiSectionHeadingSlotProps } from "./YetiSectionHeadingSlot.tsx";
import { defaultYetiBodyCopySlotProps } from "./YetiBodyCopySlot.tsx";
import { defaultYetiPrimaryActionSlotProps } from "./YetiPrimaryActionSlot.tsx";
import { toTranslatableString } from "../atoms/defaults.ts";

export interface YetiPromoBannerSectionProps {
  styles: {
    contentAlign: "left" | "center";
    showImage: boolean;
    showHeading: boolean;
    showBody: boolean;
    showPrimaryAction: boolean;
    fullBleed: boolean;
  };
  slots: {
    PromoImageSlot: Slot;
    PromoHeadingSlot: Slot;
    PromoBodySlot: Slot;
    PromoPrimaryActionSlot: Slot;
  };
  liveVisibility: boolean;
}

const fields: Fields<YetiPromoBannerSectionProps> = {
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
      showPrimaryAction: YextField("Show Primary Action", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      fullBleed: YextField("Full Bleed", {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      PromoImageSlot: { type: "slot" },
      PromoHeadingSlot: { type: "slot" },
      PromoBodySlot: { type: "slot" },
      PromoPrimaryActionSlot: { type: "slot" },
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

const YetiPromoBannerSectionComponent: PuckComponent<
  YetiPromoBannerSectionProps
> = ({ styles, slots }) => {
  const isCentered = styles.contentAlign === "center";

  return (
    <YetiSectionShell
      className={
        styles.fullBleed ? "px-0 md:px-0 py-0 md:py-0" : "py-10 md:py-14"
      }
      contentClassName={styles.fullBleed ? "max-w-none" : ""}
    >
      <section className="relative w-full overflow-hidden">
        {styles.showImage ? (
          <slots.PromoImageSlot style={{ height: "auto" }} allow={[]} />
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
              <slots.PromoHeadingSlot style={{ height: "auto" }} allow={[]} />
            ) : null}
            {styles.showBody ? (
              <div className="mt-4">
                <slots.PromoBodySlot style={{ height: "auto" }} allow={[]} />
              </div>
            ) : null}
            {styles.showPrimaryAction ? (
              <div className="mt-5">
                <slots.PromoPrimaryActionSlot
                  style={{ height: "auto" }}
                  allow={[]}
                />
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </YetiSectionShell>
  );
};

export const defaultYetiPromoBannerSectionProps: YetiPromoBannerSectionProps = {
  styles: {
    contentAlign: "left",
    showImage: true,
    showHeading: true,
    showBody: true,
    showPrimaryAction: true,
    fullBleed: true,
  },
  slots: {
    PromoImageSlot: [
      {
        type: "YetiHeroImageSlot",
        props: {
          ...defaultYetiHeroImageSlotProps,
          data: {
            ...defaultYetiHeroImageSlotProps.data,
            image: {
              field: "",
              constantValue: {
                url: "https://yeti-webmedia.imgix.net/m/35d6810f223f9fc3/original/240074_PLP_BMD_3-0_Paragraph_Lifestyle_Store_Page_Customize_Desktop.jpg?auto=format,compress",
                width: 1920,
                height: 1080,
              },
              constantValueEnabled: true,
            },
          },
        },
      },
    ],
    PromoHeadingSlot: [
      {
        type: "YetiSectionHeadingSlot",
        props: {
          ...defaultYetiSectionHeadingSlotProps,
          data: {
            text: toTranslatableString("CUSTOMIZE IT IN-STORE"),
          },
          styles: {
            level: 2,
            align: "left",
          },
        },
      },
    ],
    PromoBodySlot: [
      {
        type: "YetiBodyCopySlot",
        props: {
          ...defaultYetiBodyCopySlotProps,
          data: {
            copy: toTranslatableString(
              "Choose from 9 different fonts and 12 design galleries to make your drinkware all your own."
            ),
          },
          styles: {
            align: "left",
          },
        },
      },
    ],
    PromoPrimaryActionSlot: [
      {
        type: "YetiPrimaryActionSlot",
        props: {
          ...defaultYetiPrimaryActionSlotProps,
          data: {
            ...defaultYetiPrimaryActionSlotProps.data,
            actionText: toTranslatableString("Shop the shop"),
          },
          styles: {
            variant: "outline",
          },
        },
      },
    ],
  },
  liveVisibility: true,
};

export const defaultYetiReservePromoBannerSectionProps: YetiPromoBannerSectionProps =
  {
    ...defaultYetiPromoBannerSectionProps,
    slots: {
      PromoImageSlot: [
        {
          type: "YetiHeroImageSlot",
          props: {
            ...defaultYetiHeroImageSlotProps,
            data: {
              ...defaultYetiHeroImageSlotProps.data,
              image: {
                field: "",
                constantValue: {
                  url: "https://yeti-webmedia.imgix.net/m/204eb0035a6bce05/original/240074_PLP_BMD_3-0_Paragraph_Lifestyle_Store_Page_Desktop.jpg?auto=format,compress",
                  width: 1920,
                  height: 1080,
                },
                constantValueEnabled: true,
              },
            },
          },
        },
      ],
      PromoHeadingSlot: [
        {
          type: "YetiSectionHeadingSlot",
          props: {
            ...defaultYetiSectionHeadingSlotProps,
            data: {
              text: toTranslatableString("PUT IT ON ICE"),
            },
            styles: {
              level: 2,
              align: "left",
            },
          },
        },
      ],
      PromoBodySlot: [
        {
          type: "YetiBodyCopySlot",
          props: {
            ...defaultYetiBodyCopySlotProps,
            data: {
              copy: toTranslatableString(
                "Reserve gear in your local YETI store to pick up when you're ready."
              ),
            },
            styles: {
              align: "left",
            },
          },
        },
      ],
      PromoPrimaryActionSlot: [
        {
          type: "YetiPrimaryActionSlot",
          props: {
            ...defaultYetiPrimaryActionSlotProps,
            data: {
              ...defaultYetiPrimaryActionSlotProps.data,
              actionText: toTranslatableString("Shop the shop"),
            },
            styles: {
              variant: "outline",
            },
          },
        },
      ],
    },
  };

export const YetiPromoBannerSection: ComponentConfig<{
  props: YetiPromoBannerSectionProps;
}> = {
  label: "Yeti Promo Banner Section",
  fields,
  defaultProps: defaultYetiPromoBannerSectionProps,
  render: (props) => {
    if (!props.liveVisibility && !props.puck.isEditing) {
      return null;
    }
    return <YetiPromoBannerSectionComponent {...props} />;
  },
};
