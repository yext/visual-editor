import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
} from "@measured/puck";
import {
  PromoSectionType,
  backgroundColors,
  BackgroundStyle,
  PageSection,
  YextField,
  VisibilityWrapper,
  msg,
  getAnalyticsScopeHash,
  ComponentFields,
  EntityField,
  pt,
  themeManagerCn,
  YextEntityField,
  YextEntityFieldSelector,
  resolveYextEntityField,
  BodyTextProps,
  CTAWrapperProps,
  HeadingTextProps,
  ImageWrapperProps,
  VideoProps,
  i18nComponentsInstance,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

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
}

export interface PromoStyles {
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /**
   * Positions the image to the left or right of the text content.
   * @defaultValue 'left'
   */
  orientation: "left" | "right";
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
    },
  }),
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
      orientation: YextField(
        msg("fields.mediaOrientation", "Media Orientation"),
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

const PromoMedia = ({
  className,
  data,
  slots,
}: {
  className: string;
  data: PromoData;
  slots: {
    VideoSlot: React.ElementType;
    ImageSlot: React.ElementType;
  };
}) => {
  const { t } = useTranslation();

  return (
    <div
      className={themeManagerCn("w-full my-auto", className)}
      role="region"
      aria-label={t("promoMedia", "Promo Media")}
    >
      <EntityField
        displayName={pt("fields.media", "Media")}
        fieldId={data.promo.field}
        constantValueEnabled={data.promo.constantValueEnabled}
      >
        {data.media === "video" ? (
          <slots.VideoSlot style={{ height: "auto" }} allow={[]} />
        ) : (
          <slots.ImageSlot style={{ height: "auto" }} allow={[]} />
        )}
      </EntityField>
    </div>
  );
};

const PromoWrapper: PuckComponent<PromoSectionProps> = (props) => {
  const { data, styles, slots } = props;

  return (
    <PageSection
      background={styles.backgroundColor}
      className={themeManagerCn("flex flex-col md:flex-row md:gap-16")}
    >
      {/* Desktop left image */}
      <PromoMedia
        data={data}
        slots={slots}
        className={themeManagerCn(
          styles.orientation === "right" && "md:hidden"
        )}
      />
      <div className="flex flex-col justify-center gap-y-4 md:gap-y-8 pt-4 md:pt-0 w-full break-words">
        <slots.HeadingSlot style={{ height: "auto" }} allow={[]} />
        <slots.DescriptionSlot style={{ height: "auto" }} allow={[]} />
        <slots.CTASlot style={{ height: "auto" }} allow={[]} />
      </div>
      {/* Desktop right image */}
      <PromoMedia
        data={data}
        slots={slots}
        className={themeManagerCn(
          "hidden sm:block",
          styles.orientation === "left" && "md:hidden"
        )}
      />
    </PageSection>
  );
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
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      orientation: "left",
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
                  en: "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters",
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
            className:
              "max-w-full sm:max-w-initial md:max-w-[450px] lg:max-w-none rounded-image-borderRadius w-full",
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
              },
            },
            styles: { variant: "primary" },
          } satisfies CTAWrapperProps,
        },
      ],
    },
    analytics: {
      scope: "promoSection",
    },
    liveVisibility: true,
  },
  resolveData: (data, params) => {
    // puck supports dot notation even though the type does not
    const mediaSubfield = "data.media" as any;

    if (data.props?.data?.promo.constantValueEnabled) {
      let updatedData = setDeep(
        data,
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

    let updatedData = setDeep(data, "props.data.media", "image");
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

    return {
      ...updatedData,
      readOnly: {
        [mediaSubfield]: true,
      },
    };
  },
  render: (props) => {
    return (
      <AnalyticsScopeProvider
        name={`${props.analytics?.scope ?? "promoSection"}${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={!!props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          <PromoWrapper {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    );
  },
};
