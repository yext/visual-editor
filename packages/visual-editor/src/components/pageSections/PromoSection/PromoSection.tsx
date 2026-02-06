import { ComponentConfig, Fields, setDeep, Slot } from "@puckeditor/core";
import { PromoSectionType } from "../../../types/types.ts";
import {
  backgroundColors,
  BackgroundStyle,
  ThemeOptions,
} from "../../../utils/themeConfigOptions.ts";
import { YextField } from "../../../editor/YextField.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { ComponentFields } from "../../../types/fields.ts";
import {
  YextEntityField,
  YextEntityFieldSelector,
} from "../../../editor/YextEntityFieldSelector.tsx";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { BodyTextProps } from "../../contentBlocks/BodyText.tsx";
import { CTAWrapperProps } from "../../contentBlocks/CtaWrapper.tsx";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { ImageWrapperProps } from "../../contentBlocks/image/Image.tsx";
import { VideoProps } from "../../contentBlocks/Video.tsx";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { getDefaultRTF } from "../../../editor/TranslatableRichTextField.tsx";
import { themeManagerCn } from "../../../utils/cn.ts";
import { useDocument } from "../../../hooks/useDocument.tsx";
import {
  TranslatableAssetImage,
  AssetImageType,
} from "../../../types/images.ts";
import { AnalyticsScopeProvider, ImageType } from "@yext/pages-components";
import { getRandomPlaceholderImageObject } from "../../../utils/imagePlaceholders.ts";
import { updateFields } from "../HeroSection.tsx";
import { ClassicPromo } from "./ClassicPromo.tsx";
import { SpotlightPromo } from "./SpotlightPromo.tsx";
import { ImmersivePromo } from "./ImmersivePromo.tsx";
import { CompactPromo } from "./CompactPromo.tsx";
import { useTranslation } from "react-i18next";
import { PromoEmptyState } from "./PromoEmptyState.tsx";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";

export interface PromoData {
  /**
   * The source for the promotional content, including an image, title, description, and a call-to-action.
   * @defaultValue Placeholder content for a featured promotion.
   */
  promo: YextEntityField<PromoSectionType | {}>;

  /**
   * Determines whether to display an image or video in the media section.
   * @defaultValue 'image'
   */
  media: "image" | "video";

  /**
   * The background image used by the immersive and spotlight variants.
   * @defaultValue Placeholder image.
   */
  backgroundImage: YextEntityField<
    ImageType | AssetImageType | TranslatableAssetImage
  >;
}

export interface PromoStyles {
  /**
   * The visual variant for the promo section.
   * @defaultValue classic
   */
  variant: "classic" | "immersive" | "spotlight" | "compact";

  /**
   * The background color for the entire section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /**
   * Positions the media to the left or right of the promo content on desktop (classic and compact variants).
   * @defaultValue right
   */
  desktopImagePosition: "left" | "right";

  /**
   * Positions the media to the top or bottom of the promo content on mobile (classic and compact variants).
   * @defaultValue top
   */
  mobileImagePosition: "top" | "bottom";

  /**
   * Text content position and alignment.
   * @defaultValue left
   */
  containerAlignment: "left" | "center" | "right";

  /**
   * Image Height for the promo image with Immersive or Spotlight variant
   * Minimum height: content height + Page Section Top/Bottom Padding
   * @defaultValue 500px
   */
  imageHeight: number;

  /**
   * Whether to show the media content, either image or video.
   * @defaultValue true
   */
  showMedia: boolean;

  /**
   * Whether to show the heading text.
   * @defaultValue true
   */
  showHeading: boolean;

  /**
   * Whether to show the description text.
   * @defaultValue true
   */
  showDescription: boolean;

  /**
   * Whether to show the CTA.
   * @defaultValue true
   */
  showCTA: boolean;
}

export interface PromoSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: PromoData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: PromoStyles;

  /** @internal */
  slots: {
    HeadingSlot: Slot;
    DescriptionSlot: Slot;
    VideoSlot: Slot;
    ImageSlot: Slot;
    CTASlot: Slot;
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

export type PromoVariantProps = Pick<
  PromoSectionProps,
  "data" | "styles" | "slots"
>;

const promoSectionFields: Fields<PromoSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      promo: YextEntityFieldSelector<any, PromoSectionType | {}>({
        label: msg("fields.promo", "Promo"),
        filter: {
          types: [ComponentFields.PromoSection.type],
        },
      }),
      media: YextField(msg("fields.media", "Media"), {
        type: "radio",
        options: [
          { label: msg("fields.options.image", "Image"), value: "image" },
          { label: msg("fields.options.video", "Video"), value: "video" },
        ],
      }),
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
      desktopImagePosition: YextField(
        msg("fields.desktopMediaPosition", "Desktop Media Position"),
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
        msg("fields.mobileMediaPosition", "Mobile Media Position"),
        {
          type: "radio",
          options: ThemeOptions.VERTICAL_POSITION,
        }
      ),
      containerAlignment: YextField(
        msg("fields.containerAlignment", "Container Alignment"),
        {
          type: "radio",
          options: ThemeOptions.ALIGNMENT,
        }
      ),
      imageHeight: YextField(msg("fields.imageHeight", "Image Height"), {
        type: "number",
        min: 0,
      }),
      showMedia: YextField(msg("fields.showMedia", "Show Media"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showHeading: YextField(msg("fields.showHeading", "Show Heading"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      showDescription: YextField(
        msg("fields.showDescription", "Show Description"),
        {
          type: "radio",
          options: "SHOW_HIDE",
        }
      ),
      showCTA: YextField(msg("fields.showCTA", "Show CTA"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
    },
  }),
  slots: {
    type: "object",
    visible: false,
    objectFields: {
      HeadingSlot: { type: "slot" },
      DescriptionSlot: { type: "slot" },
      ImageSlot: { type: "slot" },
      VideoSlot: { type: "slot" },
      CTASlot: { type: "slot" },
    },
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

/**
 * The Promo Section is a flexible content component designed to highlight a single, specific promotion. It combines an image with a title, description, and a call-to-action button in a customizable, split-column layout, making it perfect for drawing attention to special offers or announcements.
 * Available on Location templates.
 */
export const PromoSection: ComponentConfig<{ props: PromoSectionProps }> = {
  label: msg("components.promoSection", "Promo Section"),
  fields: promoSectionFields,
  defaultProps: {
    data: {
      promo: {
        field: "",
        constantValue: {},
        constantValueEnabled: true,
      },
      media: "image",
      backgroundImage: {
        field: "",
        constantValue: {
          ...getRandomPlaceholderImageObject({ width: 550, height: 310 }),
          width: 550,
          height: 310,
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      variant: "classic",
      backgroundColor: backgroundColors.background1.value,
      desktopImagePosition: "left",
      mobileImagePosition: "top",
      containerAlignment: "left",
      imageHeight: 500,
      showMedia: true,
      showHeading: true,
      showDescription: true,
      showCTA: true,
    },
    slots: {
      HeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                field: "",
                constantValue: {
                  en: "Featured Promotion",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: { level: 2, align: "left" },
          } satisfies HeadingTextProps,
        },
      ],
      DescriptionSlot: [
        {
          type: "BodyTextSlot",
          props: {
            data: {
              text: {
                field: "",
                constantValue: {
                  en: getDefaultRTF(
                    "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters"
                  ),
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: { variant: "base" },
          } satisfies BodyTextProps,
        },
      ],
      VideoSlot: [
        {
          type: "VideoSlot",
          props: {
            data: {
              assetVideo: undefined,
            },
          } satisfies VideoProps,
        },
      ],
      ImageSlot: [
        {
          type: "ImageSlot",
          props: {
            data: {
              image: {
                field: "",
                constantValue: {
                  ...getRandomPlaceholderImageObject({
                    width: 640,
                    height: 360,
                  }),
                  width: 640,
                  height: 360,
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              aspectRatio: 1.78,
              width: 640,
            },
            sizes: {
              base: "calc(100vw - 32px)",
              md: "min(width, 450px)",
              lg: "width",
            },
          } satisfies ImageWrapperProps,
        },
      ],
      CTASlot: [
        {
          type: "CTASlot",
          props: {
            data: {
              entityField: {
                field: "",
                constantValue: {
                  label: "Learn More",
                  link: "#",
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
                selectedType: "textAndLink",
              },
            },
            styles: { variant: "primary", presetImage: "app-store" },
            eventName: "cta",
          } satisfies CTAWrapperProps,
        },
      ],
    },
    analytics: {
      scope: "promoSection",
    },
    liveVisibility: true,
  },
  resolveFields: (data) => {
    let fields = promoSectionFields;

    switch (data.props.styles.variant) {
      case "compact": {
        // compact should remove the same fields removed by classic
      }
      case "classic": {
        fields = updateFields(
          fields,
          [
            "data.objectFields.backgroundImage",
            "styles.objectFields.imageHeight",
          ],
          undefined
        );

        break;
      }
      case "immersive": {
        fields = updateFields(
          fields,
          ["slots.ImageSlot", "styles.objectFields.backgroundColor"],
          undefined
        );
        // immersive should also remove the fields removed by spotlight
      }
      case "spotlight": {
        fields = updateFields(
          fields,
          [
            "styles.objectFields.mobileImagePosition",
            "styles.objectFields.desktopImagePosition",
            "data.objectFields.media",
            "styles.objectFields.showMedia",
            data.props.data.promo.constantValueEnabled
              ? undefined
              : "data.objectFields.backgroundImage",
          ],
          undefined
        );
        break;
      }
    }

    // If showMedia is false, remove media-related fields
    if (!data.props.styles.showMedia) {
      fields = updateFields(
        fields,
        [
          "data.objectFields.media",
          "data.objectFields.backgroundImage",
          "styles.objectFields.imageHeight",
        ],
        undefined
      );
    }

    return fields;
  },
  resolveData: (data, params) => {
    let updatedData = { ...data };
    // puck supports dot notation even though the type does not
    const mediaSubfield = "data.media" as any;

    // Apply the alignment to the description text
    updatedData = setDeep(
      updatedData,
      "props.slots.DescriptionSlot[0].props.parentStyles.className",
      `text-${updatedData.props.styles.containerAlignment}`
    );

    if (data.props.styles.variant === "compact") {
      updatedData = setDeep(
        updatedData,
        "props.slots.ImageSlot[0].props.className",
        themeManagerCn(
          "!w-full lg:!w-auto h-full",
          data.props.styles.desktopImagePosition === "left"
            ? "mr-auto"
            : "ml-auto"
        )
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.VideoSlot[0].props.className",
        "h-full"
      );
    }

    if (data.props.styles.variant === "classic") {
      updatedData = setDeep(
        updatedData,
        "props.slots.ImageSlot[0].props.className",
        "min-w-full lg:min-w-none max-w-full lg:max-w-none rounded-image-borderRadius"
      );
    }

    if (data.props?.data?.promo.constantValueEnabled) {
      updatedData = setDeep(
        updatedData,
        "props.slots.HeadingSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.DescriptionSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.CTASlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.ImageSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(updatedData, "props.data.backgroundImage", {
        field: data.props?.data?.promo.field
          ? data.props?.data?.promo.field + ".image"
          : "",
        constantValue: data.props.data?.backgroundImage?.constantValue,
        constantValueEnabled: true,
      } satisfies PromoData["backgroundImage"]);

      return { ...updatedData, readOnly: { [mediaSubfield]: false } };
    }

    const resolvedPromo = resolveYextEntityField(
      params.metadata.streamDocument,
      data.props.data.promo,
      i18nComponentsInstance.language || "en"
    );

    if (!resolvedPromo || !("title" in resolvedPromo)) {
      return { ...data, readOnly: { [mediaSubfield]: false } };
    }

    updatedData = setDeep(updatedData, "props.data.media", "image");
    updatedData = setDeep(
      updatedData,
      "props.slots.HeadingSlot[0].props.parentData",
      {
        text: resolvedPromo.title || "",
        field: data.props?.data?.promo.field || "",
      }
    );
    updatedData = setDeep(
      updatedData,
      "props.slots.DescriptionSlot[0].props.parentData",
      {
        richText: resolvedPromo.description || {},
        field: data.props?.data?.promo.field || "",
      }
    );
    updatedData = setDeep(
      updatedData,
      "props.slots.CTASlot[0].props.parentData",
      {
        cta: resolvedPromo.cta || {},
        field: data.props?.data?.promo.field || "",
      }
    );
    updatedData = setDeep(
      updatedData,
      "props.slots.ImageSlot[0].props.parentData",
      {
        image: resolvedPromo.image || {},
        field: data.props?.data?.promo.field || "",
      }
    );
    updatedData = setDeep(updatedData, "props.data.backgroundImage", {
      field: data.props?.data?.promo.field
        ? data.props?.data?.promo.field + ".image"
        : "",
      constantValue: data.props.data?.backgroundImage?.constantValue,
      constantValueEnabled: false,
    } satisfies PromoData["backgroundImage"]);

    return {
      ...updatedData,
      readOnly: {
        [mediaSubfield]: true,
      },
    };
  },
  render: (props) => {
    const { data, styles, puck } = props;
    const { i18n } = useTranslation();
    const locale = i18n.language;
    const streamDocument = useDocument();

    let PromoVariant = <ClassicPromo {...props} />;
    switch (props.styles.variant) {
      case "immersive":
        PromoVariant = <ImmersivePromo {...props} />;
        break;
      case "spotlight":
        PromoVariant = <SpotlightPromo {...props} />;
        break;
      case "compact":
        PromoVariant = <CompactPromo {...props} />;
        break;
    }

    // Check if using mapped entity field (not constant value) and if it's empty
    const isMappedField =
      !data.promo.constantValueEnabled && !!data.promo.field;
    const resolvedPromo = isMappedField
      ? resolveYextEntityField(streamDocument, data.promo, locale)
      : undefined;
    const isEmpty =
      isMappedField &&
      (!resolvedPromo || Object.keys(resolvedPromo || {}).length === 0);

    // Show empty state in editor mode when mapped field is empty
    if (isMappedField && isEmpty) {
      PromoVariant = (
        <PromoEmptyState
          isEditing={puck.isEditing}
          backgroundStyle={styles.backgroundColor}
        />
      );
    }

    return (
      <ComponentErrorBoundary
        isEditing={props.puck.isEditing}
        resetKeys={[props]}
      >
        <AnalyticsScopeProvider
          name={`${props.analytics?.scope ?? "promoSection"}${getAnalyticsScopeHash(props.id)}`}
        >
          <VisibilityWrapper
            liveVisibility={!!props.liveVisibility}
            isEditing={props.puck.isEditing}
          >
            {PromoVariant}
          </VisibilityWrapper>
        </AnalyticsScopeProvider>
      </ComponentErrorBoundary>
    );
  },
};
