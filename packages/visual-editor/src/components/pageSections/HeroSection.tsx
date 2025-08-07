import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider, HoursType } from "@yext/pages-components";
import {
  HeroSectionType,
  YextEntityField,
  backgroundColors,
  BackgroundStyle,
  HeadingLevel,
  YextField,
  VisibilityWrapper,
  CTAProps,
  YextStructFieldSelector,
  YextStructEntityField,
  ComponentFields,
  TranslatableString,
  msg,
  getAnalyticsScopeHash,
} from "@yext/visual-editor";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/ImageStyling.js";
import { ClassicHero } from "./heroVariants/ClassicHero.js";
import { CompactHero } from "./heroVariants/CompactHero.js";
import { SpotlightHero } from "./heroVariants/SpotlightHero.js";
import { ImmersiveHero } from "./heroVariants/ImmersiveHero.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface HeroData {
  /**
   * The primary business name displayed in the hero.
   * @defaultValue "Business Name" (constant)
   */
  businessName: YextEntityField<TranslatableString>;

  /**
   * A location-based modifier or slogan (e.g., "Serving Downtown").
   * @defaultValue "Geomodifier" (constant)
   */
  localGeoModifier: YextEntityField<TranslatableString>;

  /**
   * The entity's hours data, used to display an "Open/Closed" status.
   * @defaultValue 'hours' field
   */
  hours: YextEntityField<HoursType>;

  /**
   * The main hero content, including an image and primary/secondary call-to-action buttons.
   * @defaultValue Placeholder image and CTAs
   */
  hero: YextStructEntityField<HeroSectionType>;

  /**
   * If 'true', displays the entity's average review rating.
   * @defaultValue true
   */
  showAverageReview: boolean;
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
   * The HTML heading level for the business name.
   * @defaultValue 3
   */
  businessNameLevel: HeadingLevel;

  /**
   * The HTML heading level for the local geo-modifier.
   * @defaultValue 1
   */
  localGeoModifierLevel: HeadingLevel;

  /**
   * The visual style variant for the primary call-to-action button.
   * @defaultValue primary
   */
  primaryCTA: CTAProps["variant"];

  /**
   * The visual style variant for the secondary call-to-action button.
   * @defaultValue secondary
   */
  secondaryCTA: CTAProps["variant"];

  /**
   * Styling options for the hero image, such as aspect ratio (classic variant).
   */
  image: ImageStylingProps;

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
   * Whether to show the hero image (classic and compact variant).
   * @defaultValue true
   */
  showImage: boolean;

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

export type HeroVariantProps = Pick<HeroSectionProps, "data" | "styles">;

const heroSectionFields: Fields<HeroSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      businessName: YextField<any, TranslatableString>(
        msg("fields.businessName", "Business Name"),
        {
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        }
      ),
      localGeoModifier: YextField<any, TranslatableString>(
        msg("fields.localGeomodifier", "Local GeoModifier"),
        {
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        }
      ),
      hours: YextField(msg("fields.hours", "Hours"), {
        type: "entityField",
        filter: {
          types: ["type.hours"],
        },
      }),
      hero: YextStructFieldSelector({
        label: msg("fields.hero", "Hero"),
        filter: {
          type: ComponentFields.HeroSection.type,
        },
      }),
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
      businessNameLevel: YextField(
        msg("fields.businessNameHeadingLevel", "Business Name Heading Level"),
        {
          type: "select",
          hasSearch: true,
          options: "HEADING_LEVEL",
        }
      ),
      localGeoModifierLevel: YextField(
        msg(
          "fields.localGeomodifierHeadingLevel",
          "Local GeoModifier Heading Level"
        ),
        {
          type: "select",
          hasSearch: true,
          options: "HEADING_LEVEL",
        }
      ),
      primaryCTA: YextField(
        msg("fields.primaryCTAVariant", "Primary CTA Variant"),
        {
          type: "radio",
          options: "CTA_VARIANT",
        }
      ),
      secondaryCTA: YextField(
        msg("fields.secondaryCTAVariant", "Secondary CTA Variant"),
        {
          type: "radio",
          options: "CTA_VARIANT",
        }
      ),
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
      image: YextField(msg("fields.image", "Image"), {
        type: "object",
        objectFields: ImageStylingFields,
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

export const HeroSection: ComponentConfig<HeroSectionProps> = {
  label: msg("components.heroSection", "Hero Section"),
  fields: heroSectionFields,
  defaultProps: {
    data: {
      businessName: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          en: "Business Name",
          hasLocalizedValue: "true",
        },
      },
      localGeoModifier: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          en: "Geomodifier",
          hasLocalizedValue: "true",
        },
      },
      hours: {
        field: "hours",
        constantValue: {},
      },
      hero: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          primaryCta: {
            label: {
              en: "Call To Action",
              hasLocalizedValue: "true",
            },
            link: "#",
            linkType: "URL",
          },
          secondaryCta: {
            label: {
              en: "Call To Action",
              hasLocalizedValue: "true",
            },
            link: "#",
            linkType: "URL",
          },
          image: {
            url: PLACEHOLDER_IMAGE_URL,
            height: 360,
            width: 640,
          },
        },
        constantValueOverride: {
          image: true,
          primaryCta: true,
          secondaryCta: true,
        },
      },
      showAverageReview: true,
    },
    styles: {
      variant: "classic",
      backgroundColor: backgroundColors.background1.value,
      desktopImagePosition: "right",
      businessNameLevel: 3,
      localGeoModifierLevel: 1,
      primaryCTA: "primary",
      secondaryCTA: "secondary",
      image: {
        aspectRatio: 1.78, // 16:9 default
      },
      desktopContainerPosition: "left",
      mobileContentAlignment: "left",
      showImage: true,
      mobileImagePosition: "bottom",
    },
    analytics: {
      scope: "heroSection",
    },
    liveVisibility: true,
  },
  resolveFields: (data, { lastData }) => {
    let fields = heroSectionFields;
    // If set to entity value and no field selected, hide the component.
    if (
      !data.props.data.hero.constantValueEnabled &&
      data.props.data.hero.field === ""
    ) {
      data.props.liveVisibility = false;
      fields = {
        ...fields,
        liveVisibility: undefined,
      };
    }

    // If no field was selected and then constant value is enabled
    // or a field is selected, show the component.
    if (
      (data.props.data.hero.constantValueEnabled &&
        !lastData?.props.data.hero.constantValueEnabled &&
        data.props.data.hero.field === "") ||
      (lastData?.props.data.hero.field === "" &&
        data.props.data.hero.field !== "")
    ) {
      data.props.liveVisibility = true;
    }

    switch (data.props.styles.variant) {
      case "compact": {
        fields = removeStyleFields(fields, ["image"]);
        // compact should also remove the props removed by classic
      }
      case "classic": {
        fields = removeStyleFields(fields, ["desktopContainerPosition"]);

        if (!data.props.styles.showImage) {
          fields = removeStyleFields(fields, [
            "image",
            "mobileImagePosition",
            "desktopImagePosition",
          ]);
        }
        break;
      }
      case "immersive": {
        fields = removeStyleFields(fields, ["backgroundColor"]);
        // immersive should also remove the props removed by spotlight
      }
      case "spotlight": {
        fields = removeStyleFields(fields, [
          "showImage",
          "image",
          "mobileImagePosition",
          "desktopImagePosition",
        ]);
        break;
      }
    }

    return fields;
  },
  render: (props) => {
    const { data, styles } = props;
    let HeroVariant = <ClassicHero data={data} styles={styles} />;
    switch (props.styles.variant) {
      case "immersive":
        HeroVariant = <ImmersiveHero data={data} styles={styles} />;
        break;
      case "spotlight":
        HeroVariant = <SpotlightHero data={data} styles={styles} />;
        break;
      case "compact":
        HeroVariant = <CompactHero data={data} styles={styles} />;
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
 * removeStyleFields hides a given list of fields from the Puck sidebar
 * @internal
 */
const removeStyleFields = (
  fields: Fields<HeroSectionProps>,
  styleFieldsToRemove: string[]
): Fields<HeroSectionProps> => {
  // @ts-expect-error ts(2339) objectFields exists
  const objectFields = fields.styles.objectFields;
  const newObjectFields: Record<string, any> = {};

  for (const key in objectFields) {
    if (Object.prototype.hasOwnProperty.call(objectFields, key)) {
      if (!styleFieldsToRemove.includes(key)) {
        newObjectFields[key] = objectFields[key];
      }
    }
  }

  return {
    ...fields,
    styles: {
      ...fields.styles,
      // @ts-expect-error ts(2339) objectFields exists
      objectFields: newObjectFields,
    },
  };
};
