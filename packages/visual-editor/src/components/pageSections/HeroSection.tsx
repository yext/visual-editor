import {
  ComponentConfig,
  DefaultComponentProps,
  Fields,
  setDeep,
  Slot,
} from "@measured/puck";
import { AnalyticsScopeProvider, ImageType } from "@yext/pages-components";
import {
  backgroundColors,
  BackgroundStyle,
  YextField,
  VisibilityWrapper,
  msg,
  getAnalyticsScopeHash,
  YextEntityField,
  AssetImageType,
  themeManagerCn,
  CTAVariant,
  HeadingLevel,
  HeadingTextProps,
  HoursStatusProps,
  ImageWrapperProps,
  CTAWrapperProps,
  resolveComponentData,
} from "@yext/visual-editor";
import { ClassicHero } from "./heroVariants/ClassicHero.js";
import { CompactHero } from "./heroVariants/CompactHero.js";
import { SpotlightHero } from "./heroVariants/SpotlightHero.js";
import { ImmersiveHero } from "./heroVariants/ImmersiveHero.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface HeroData {
  backgroundImage: YextEntityField<ImageType | AssetImageType>;
}

export interface HeroStyles {
  /**
   * The visual variant for the hero section.
   * @defaultValue classic
   */
  variant: "classic" | "immersive" | "spotlight" | "compact";

  /**
   * The background color for the entire section (classic and compact variants).
   * The background color for the featured content (spotlight variant).
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /**
   * If 'true', displays the entity's average review rating.
   * @defaultValue true
   */
  showAverageReview: boolean;

  /**
   * Whether to show the hero image (classic and compact variant).
   * @defaultValue true
   */
  showImage: boolean;

  /**
   * Image Height for the hero image with Immersive or Spotlight variant
   * Minimum height: content height + Page Section Top/Bottom Padding
   * @default 500px
   */
  imageHeight?: number;

  /**
   * Container position on desktop (spotlight and immersive variants).
   * @defaultValue left
   */
  desktopContainerPosition?: "left" | "center";

  /**
   * Content alignment for mobile viewports.
   * @defaultValue left
   */
  mobileContentAlignment?: "left" | "center";

  /**
   * Positions the image to the left or right of the hero content on desktop (classic and compact variants).
   * @defaultValue right
   */
  desktopImagePosition: "left" | "right";

  /**
   * Positions the image to the top or bottom of the hero content on mobile (classic and compact variants).
   * @defaultValue top
   */
  mobileImagePosition: "bottom" | "top";
}

export interface HeroSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: HeroData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: HeroStyles;

  slots: {
    BusinessNameSlot: Slot;
    GeomodifierSlot: Slot;
    HoursStatusSlot: Slot;
    ImageSlot: Slot;
    PrimaryCTASlot: Slot;
    SecondaryCTASlot: Slot;
  };

  /** @internal */
  conditionalRender?: {
    hours: boolean;
  };

  /** @internal */
  analytics: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility?: boolean;
}

export type HeroVariantProps = Pick<
  HeroSectionProps,
  "data" | "styles" | "slots" | "conditionalRender"
>;

export type HeroImageProps = {
  className: string;
  styles: HeroStyles;
  slots: HeroSectionProps["slots"];
};

const heroSectionFields: Fields<HeroSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      backgroundImage: YextField(msg("fields.image", "Image"), {
        type: "entityField",
        filter: {
          types: ["type.image"],
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      variant: YextField(msg("fields.variant", "Variant"), {
        type: "select",
        options: [
          { label: msg("fields.options.classic", "Classic"), value: "classic" },
          {
            label: msg("fields.options.immersive", "Immersive"),
            value: "immersive",
          },
          {
            label: msg("fields.options.spotlight", "Spotlight"),
            value: "spotlight",
          },
          {
            label: msg("fields.options.compact", "Compact"),
            value: "compact",
          },
        ],
      }),
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
      showAverageReview: YextField(
        msg("fields.showAverageReview", "Show Average Review"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.show", "Show"), value: true },
            { label: msg("fields.options.hide", "Hide"), value: false },
          ],
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
      imageHeight: YextField(msg("fields.imageHeight", "Image Height"), {
        type: "number",
        min: 0,
      }),
      desktopContainerPosition: YextField(
        msg("fields.desktopContainerPosition", "Desktop Container Position"),
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
              label: msg("fields.options.center", "Center", {
                context: "direction",
              }),
              value: "center",
            },
          ],
        }
      ),
      mobileContentAlignment: YextField(
        msg("fields.mobileContentAlignment", "Mobile Content Alignment"),
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
              label: msg("fields.options.center", "Center", {
                context: "direction",
              }),
              value: "center",
            },
          ],
        }
      ),
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
  slots: {
    type: "object",
    objectFields: {
      BusinessNameSlot: { type: "slot" },
      GeomodifierSlot: { type: "slot" },
      HoursStatusSlot: { type: "slot" },
      ImageSlot: { type: "slot" },
      PrimaryCTASlot: { type: "slot" },
      SecondaryCTASlot: { type: "slot" },
    },
    visible: false,
  },
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

export const HeroSection: ComponentConfig<{ props: HeroSectionProps }> = {
  label: msg("components.heroSection", "Hero Section"),
  fields: heroSectionFields,
  defaultProps: {
    data: {
      backgroundImage: {
        field: "",
        constantValue: {
          url: PLACEHOLDER_IMAGE_URL,
          height: 360,
          width: 640,
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      variant: "classic",
      backgroundColor: backgroundColors.background1.value,
      showAverageReview: true,
      showImage: true,
      imageHeight: 500,
      desktopImagePosition: "right",
      desktopContainerPosition: "left",
      mobileContentAlignment: "left",
      mobileImagePosition: "bottom",
    },
    slots: {
      BusinessNameSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "Business Name",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 3, align: "left" },
          } satisfies HeadingTextProps,
        },
      ],
      GeomodifierSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "Geomodifier",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 1, align: "left" },
          } satisfies HeadingTextProps,
        },
      ],
      HoursStatusSlot: [
        {
          type: "HoursStatusSlot",
          props: {
            data: {
              hours: {
                field: "hours",
                constantValue: {},
              },
            },
            styles: {
              dayOfWeekFormat: "long",
              showDayNames: true,
              showCurrentStatus: true,
            },
          } satisfies HoursStatusProps,
        },
      ],
      ImageSlot: [
        {
          type: "HeroImageSlot",
          props: {
            data: {
              image: {
                field: "",
                constantValue: {
                  url: PLACEHOLDER_IMAGE_URL,
                  height: 360,
                  width: 640,
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              aspectRatio: 1.78,
              width: 640,
            },
          } satisfies ImageWrapperProps,
        },
      ],
      PrimaryCTASlot: [
        {
          type: "CTASlot",
          props: {
            data: {
              entityField: {
                field: "",
                constantValue: {
                  label: {
                    en: "Call To Action",
                    hasLocalizedValue: "true",
                  },
                  link: "#",
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
              },
            },
            eventName: "primaryCta",
            styles: {
              displayType: "textAndLink",
              variant: "primary",
            },
          } satisfies CTAWrapperProps,
        },
      ],
      SecondaryCTASlot: [
        {
          type: "CTASlot",
          props: {
            data: {
              entityField: {
                field: "",
                constantValue: {
                  label: {
                    en: "Learn More",
                    hasLocalizedValue: "true",
                  },
                  link: "#",
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
              },
            },
            styles: {
              displayType: "textAndLink",
              variant: "secondary",
            },
            eventName: "secondaryCta",
          } satisfies CTAWrapperProps,
        },
      ],
    },
    analytics: {
      scope: "heroSection",
    },
    liveVisibility: true,
  },
  resolveData: (data, params) => {
    data = setDeep(
      data,
      "props.slots.ImageSlot[0].props.variant",
      data.props.styles.variant
    );

    const ctaClassNameFn = (variant: CTAVariant): string => {
      switch (variant) {
        case "link":
          return (
            "py-3 border-2 border-transparent w-fit " +
            (data.props.styles.mobileContentAlignment === "center"
              ? " mx-auto sm:m-0"
              : "")
          );
        default:
          return "";
      }
    };

    data = setDeep(
      data,
      "props.slots.PrimaryCTASlot[0].props.parentStyles.classNameFn",
      ctaClassNameFn
    );

    data = setDeep(
      data,
      "props.slots.SecondaryCTASlot[0].props.parentStyles.classNameFn",
      ctaClassNameFn
    );

    const geomodifierLevel =
      data.props.slots.GeomodifierSlot[0]?.props.styles.level;
    data = setDeep(
      data,
      "props.slots.BusinessNameSlot[0].props.styles.semanticLevelOverride",
      geomodifierLevel < 6 ? ((geomodifierLevel + 1) as HeadingLevel) : "span"
    );

    switch (data.props.styles.variant) {
      case "compact":
        data = setDeep(
          data,
          "props.slots.ImageSlot[0].props.className",
          themeManagerCn(
            "w-full sm:w-fit h-full",
            data.props.styles.desktopImagePosition === "left"
              ? "mr-auto"
              : "ml-auto"
          )
        );
        break;
      case "classic":
        data = setDeep(
          data,
          "props.slots.ImageSlot[0].props.className",
          "max-w-full sm:max-w-initial md:max-w-[350px] lg:max-w-none rounded-image-borderRadius"
        );
        break;
      case "spotlight":
        data = setDeep(
          data,
          "props.slots.GeomodifierSlot[0].props.styles.align",
          "center"
        );
        data = setDeep(
          data,
          "props.slots.BusinessNameSlot[0].props.styles.align",
          "center"
        );
        break;
    }

    const streamDocument = params.metadata?.streamDocument;
    const locale = streamDocument?.locale;
    if (!locale || !streamDocument) {
      return { ...data };
    }

    // Check if the HoursStatusSlot has content to display
    const resolvedHours = resolveComponentData(
      data?.props?.slots?.HoursStatusSlot.map(
        (slot) => slot.props.data.hours
      )[0],
      locale,
      streamDocument
    );

    return {
      ...data,
      props: {
        ...data.props,
        conditionalRender: { hours: !!resolvedHours },
      },
    };
  },
  resolveFields: (data) => {
    let fields = heroSectionFields;

    switch (data.props.styles.variant) {
      case "compact": {
        // compact should also remove the props removed by classic
      }
      case "classic": {
        fields = updateFields(
          fields,
          [
            "data",
            "styles.objectFields.imageHeight",
            "styles.objectFields.desktopContainerPosition",
          ],
          undefined
        );

        if (!data.props.styles.showImage) {
          fields = updateFields(
            fields,
            [
              "styles.objectFields.mobileImagePosition",
              "styles.objectFields.desktopImagePosition",
            ],
            undefined
          );
        }
        break;
      }
      case "immersive": {
        fields = updateFields(
          fields,
          ["styles.objectFields.backgroundColor", "slots.ImageSlot"],
          undefined
        );
        // immersive should also remove the props removed by spotlight
      }
      case "spotlight": {
        fields = updateFields(
          fields,
          [
            "styles.objectFields.showImage",
            "styles.objectFields.mobileImagePosition",
            "styles.objectFields.desktopImagePosition",
          ],
          undefined
        );
        break;
      }
    }

    return fields;
  },
  render: (props) => {
    let HeroVariant = <ClassicHero {...props} />;
    switch (props.styles.variant) {
      case "immersive":
        HeroVariant = <ImmersiveHero {...props} />;
        break;
      case "spotlight":
        HeroVariant = <SpotlightHero {...props} />;
        break;
      case "compact":
        HeroVariant = <CompactHero {...props} />;
        break;
    }

    return (
      <AnalyticsScopeProvider
        name={`${props.analytics?.scope ?? "heroSection"}${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={!!props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          {HeroVariant}
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    );
  },
};

/**
 * updateFields is a resolveFields helper that can update or remove fields
 * based on a dot notation path
 * @internal
 */
export const updateFields = <T extends DefaultComponentProps>(
  obj: Record<string, any>,
  paths: string[],
  value: any
): Fields<T> => {
  const newObj = { ...obj };

  for (const path of paths) {
    const keys = path.split(".");
    let current = newObj;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      // Create new objects along the path to ensure deep immutability
      current[key] = { ...current[key] };
      current = current[key];
    }

    const lastKey = keys[keys.length - 1];

    if (value === undefined) {
      delete current[lastKey];
    } else {
      current[lastKey] = value;
    }
  }

  return newObj as Fields<T>;
};
