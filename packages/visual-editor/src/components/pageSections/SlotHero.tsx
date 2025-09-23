import { ComponentConfig, Slot } from "@measured/puck";
import {
  YextField,
  msg,
  backgroundColors,
  themeManagerCn,
  PageSection,
} from "@yext/visual-editor";
import { HeroStyles } from "./HeroSection";
import { ComponentDataOptionalId } from "@measured/puck";
import {
  LockedCategoryProps,
  LockedCategoryComponents,
} from "../categories/LockedCategory";

export type Components = LockedCategoryProps;

const contentBlocks = {
  ...LockedCategoryComponents,
};

async function createComponent<T extends keyof Components>(
  component: T,
  props?: Partial<Components[T]>
): Promise<ComponentDataOptionalId<Components[T]>> {
  return {
    type: component,
    props: {
      ...contentBlocks[component].defaultProps,
      ...props,
    },
  } as ComponentDataOptionalId<Components[T]>;
}

export type SlotHeroProps = {
  slots: {
    BusinessName: Slot;
    GeoModifier: Slot;
    HoursStatus: Slot;
    CTAGroup: Slot;
    Image: Slot;
  };
  styles: Pick<
    HeroStyles,
    | "backgroundColor"
    | "desktopImagePosition"
    | "mobileImagePosition"
    | "showImage"
  >;
};

export const SlotHero: ComponentConfig<SlotHeroProps> = {
  label: "Slot Hero",
  fields: {
    slots: {
      type: "object",
      objectFields: {
        BusinessName: { type: "slot" },
        GeoModifier: { type: "slot" },
        HoursStatus: { type: "slot" },
        CTAGroup: { type: "slot" },
        Image: { type: "slot" },
      },
      visible: false,
    },
    styles: YextField(msg("fields.styles", "Styles"), {
      type: "object",
      objectFields: {
        backgroundColor: YextField(
          msg("fields.backgroundColor", "Background Color"),
          {
            type: "select",
            options: "BACKGROUND_COLOR",
          }
        ),
        showImage: YextField(msg("fields.showImage", "Show Image"), {
          type: "radio",
          options: [
            {
              label: msg("fields.options.true", "True"),
              value: true,
            },
            {
              label: msg("fields.options.false", "False"),
              value: false,
            },
          ],
        }),
        desktopImagePosition: YextField(
          msg("fields.desktopImagePosition", "Desktop Image Position"),
          {
            type: "radio",
            options: [
              {
                label: msg("fields.options.left", "Left", {
                  context: "direction",
                }),
                value: "left",
              },
              {
                label: msg("fields.options.right", "Right", {
                  context: "direction",
                }),
                value: "right",
              },
            ],
          }
        ),
        mobileImagePosition: YextField(
          msg("fields.mobileImagePosition", "Mobile Image Position"),
          {
            type: "radio",
            options: [
              {
                label: msg("fields.options.top", "Top"),
                value: "top",
              },
              {
                label: msg("fields.options.bottom", "Bottom"),
                value: "bottom",
              },
            ],
          }
        ),
      },
    }),
  },
  defaultProps: {
    slots: {
      BusinessName: [],
      GeoModifier: [],
      HoursStatus: [],
      CTAGroup: [],
      Image: [],
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      showImage: true,
      desktopImagePosition: "right",
      mobileImagePosition: "bottom",
    },
  },
  resolveData: async (data, { changed, trigger }) => {
    // Initialize slots with default content when component is first created
    const slotsAreEmpty =
      data.props.slots.BusinessName.length === 0 &&
      data.props.slots.GeoModifier.length === 0 &&
      data.props.slots.HoursStatus.length === 0 &&
      data.props.slots.CTAGroup.length === 0 &&
      data.props.slots.Image.length === 0;

    // Only create default content if slots are empty or on first load
    if (!slotsAreEmpty && trigger === "load") return data;
    if (!slotsAreEmpty && !changed.slots) return data;

    // Business Name (H1)
    const businessName = await createComponent("HeadingTextLocked", {
      text: {
        field: "",
        constantValue: {
          en: "Business Name",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      level: 1,
    });

    // Local Geo Modifier (H3)
    const geoModifier = await createComponent("HeadingTextLocked", {
      text: {
        field: "",
        constantValue: {
          en: "Geomodifier",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      level: 3,
    });

    // Hours Status
    const hoursStatus = await createComponent("HoursStatusLocked", {
      hours: {
        field: "hours",
        constantValue: {},
      },
    });

    // CTA Group
    const ctaGroup = await createComponent("CTAGroupLocked", {
      buttons: [
        {
          entityField: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              ctaType: "textAndLink",
              label: "Call To Action",
              link: "#",
            },
          },
          variant: "primary",
        },
        {
          entityField: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              ctaType: "textAndLink",
              label: "Learn More",
              link: "#",
            },
          },
          variant: "secondary",
        },
      ],
    });

    // Image component
    const imageComponent = await createComponent("ImageWrapperLocked", {
      data: {
        image: {
          field: "",
          constantValue: {
            url: "https://placehold.co/640x360",
            height: 360,
            width: 640,
          },
          constantValueEnabled: true,
        },
      },
      styles: {
        aspectRatio: 1.78, // 16:9
        width: 640,
      },
    });

    return {
      ...data,
      props: {
        ...data.props,
        slots: {
          BusinessName: [businessName],
          GeoModifier: [geoModifier],
          HoursStatus: [hoursStatus],
          CTAGroup: [ctaGroup],
          Image: [imageComponent],
        },
      },
    };
  },
  render: ({ slots, styles }) => {
    const { desktopImagePosition, mobileImagePosition, showImage } = styles;

    return (
      <PageSection
        background={styles.backgroundColor}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 items-center"
      >
        {/* Content Area */}
        <div
          className={themeManagerCn(
            "flex flex-col w-full justify-center",
            !showImage && "sm:col-span-2",
            showImage && desktopImagePosition === "left" && "sm:order-2",
            showImage &&
              mobileImagePosition === "bottom" &&
              "order-1 sm:order-none"
          )}
        >
          {/* Business Information Group - tight spacing between business name and geomodifier */}
          <div className="flex flex-col gap-y-0 mb-6 md:mb-8">
            {slots.BusinessName.length > 0 && (
              <slots.BusinessName allow={["HeadingTextLocked"]} />
            )}

            {slots.GeoModifier.length > 0 && (
              <slots.GeoModifier allow={["HeadingTextLocked"]} />
            )}
          </div>

          {/* Hours Status */}
          <div className="mb-6 md:mb-8">
            {slots.HoursStatus.length > 0 && (
              <slots.HoursStatus allow={["HoursStatusLocked"]} />
            )}
          </div>

          {/* CTA Group */}
          {slots.CTAGroup.length > 0 && (
            <slots.CTAGroup allow={["CTAGroupLocked"]} />
          )}
        </div>

        {/* Image Area */}
        {showImage && slots.Image.length > 0 && (
          <div
            className={themeManagerCn(
              "w-full my-auto max-w-full",
              desktopImagePosition === "left" && "sm:order-1",
              mobileImagePosition === "top" && "order-0 sm:order-none",
              mobileImagePosition === "bottom" && "order-2 sm:order-none"
            )}
          >
            <slots.Image allow={["ImageWrapperLocked"]} className="w-full" />
          </div>
        )}
      </PageSection>
    );
  },
};
