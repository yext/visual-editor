import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  PromoSectionType,
  useDocument,
  Image,
  backgroundColors,
  BackgroundStyle,
  HeadingLevel,
  Heading,
  PageSection,
  YextField,
  VisibilityWrapper,
  CTAProps,
  msg,
  resolveComponentData,
  YextStructEntityField,
  YextStructFieldSelector,
  resolveYextStructField,
  getAnalyticsScopeHash,
  CTA,
  ComponentFields,
  ThemeOptions,
  EntityField,
  pt,
  Video,
  AssetImageType,
  AssetVideo,
  themeManagerCn,
  imgSizesHelper,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider, ImageType } from "@yext/pages-components";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/image/styling.ts";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface PromoData {
  /**
   * The source for the promotional content, including an image, title, description, and a call-to-action.
   * @defaultValue Placeholder content for a featured promotion.
   */
  promo: YextStructEntityField<PromoSectionType>;
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

  /**
   * The visual style variant for the call-to-action button.
   * @defaultValue 'primary'
   */
  ctaVariant: CTAProps["variant"];

  /** Styling for the promo's title. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };

  /**
   * Styling options for the promo image, such as aspect ratio.
   */
  image: ImageStylingProps;
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
      promo: YextStructFieldSelector<PromoSectionType>({
        label: msg("fields.promo", "Promo"),
        filter: {
          type: ComponentFields.PromoSection.type,
        },
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
        msg("fields.imageOrientation", "Image Orientation"),
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
      ctaVariant: YextField(msg("fields.ctaVariant", "CTA Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
      }),
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.level", "Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          align: YextField(msg("fields.headingAlign", "Heading Align"), {
            type: "radio",
            options: ThemeOptions.ALIGNMENT,
          }),
        },
      }),
      image: YextField(msg("fields.media", "Media"), {
        type: "object",
        objectFields: ImageStylingFields,
      }),
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

const PromoMedia = ({
  className,
  image: media,
  data,
  styles,
}: {
  className: string;
  image: PromoSectionType["image"];
  data: PromoData;
  styles: PromoStyles;
}) => {
  const { t } = useTranslation();

  return (
    media && (
      <div
        className={themeManagerCn("w-full my-auto", className)}
        role="region"
        aria-label={t("promoMedia", "Promo Media")}
      >
        <EntityField
          displayName={pt("fields.media", "Media")}
          fieldId={data.promo.field}
          constantValueEnabled={data.promo.constantValueOverride.image}
        >
          {isVideo(media) ? (
            <Video
              youTubeEmbedUrl={media.video.embeddedUrl}
              title={media.video.title}
            />
          ) : (
            <Image
              image={media}
              aspectRatio={styles.image.aspectRatio ?? 1.78}
              width={styles.image.width || 640}
              className="max-w-full sm:max-w-initial md:max-w-[450px] lg:max-w-none rounded-image-borderRadius w-full"
              sizes={imgSizesHelper({
                base: "100vw",
                md: "450px",
                lg: `${styles.image.width || 640}px`,
              })}
            />
          )}
        </EntityField>
      </div>
    )
  );
};

const PromoWrapper: React.FC<PromoSectionProps> = ({ data, styles }) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedPromo = resolveYextStructField(
    streamDocument,
    data?.promo,
    i18n.language
  );

  const justifyClass = styles?.heading?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.heading.align]
    : "justify-start";

  return (
    <PageSection
      background={styles.backgroundColor}
      className={themeManagerCn("flex flex-col md:flex-row md:gap-16")}
    >
      {/* Desktop left image */}
      <PromoMedia
        data={data}
        styles={styles}
        image={resolvedPromo?.image}
        className={themeManagerCn(
          styles.orientation === "right" && "md:hidden"
        )}
      />
      <div className="flex flex-col justify-center gap-y-4 md:gap-y-8 pt-4 md:pt-0 w-full break-words">
        {resolvedPromo?.title && (
          <EntityField
            displayName={pt("fields.title", "Title")}
            fieldId={data.promo.field}
            constantValueEnabled={data.promo.constantValueOverride.title}
          >
            <div className={`flex ${justifyClass}`}>
              <Heading level={styles.heading.level}>
                {resolveComponentData(
                  resolvedPromo?.title,
                  i18n.language,
                  streamDocument
                )}
              </Heading>
            </div>
          </EntityField>
        )}
        <EntityField
          displayName={pt("fields.description", "Description")}
          fieldId={data.promo.field}
          constantValueEnabled={
            !resolvedPromo?.description ||
            data.promo.constantValueOverride.description
          }
        >
          {resolvedPromo?.description &&
            resolveComponentData(
              resolvedPromo?.description,
              i18n.language,
              streamDocument
            )}
        </EntityField>
        {resolvedPromo?.cta && (
          <EntityField
            displayName={pt("fields.cta", "CTA")}
            fieldId={data.promo.field}
            constantValueEnabled={data.promo.constantValueOverride.cta}
          >
            <CTA
              eventName={`cta`}
              variant={styles?.ctaVariant}
              label={resolveComponentData(
                resolvedPromo.cta.label,
                i18n.language,
                streamDocument
              )}
              link={resolveComponentData(
                resolvedPromo.cta.link,
                i18n.language,
                streamDocument
              )}
              linkType={resolvedPromo.cta.linkType}
              ctaType={resolvedPromo.cta.ctaType || "textAndLink"}
              coordinate={resolvedPromo.cta.coordinate}
              presetImageType={resolvedPromo.cta.presetImageType}
            />
          </EntityField>
        )}
      </div>
      {/* Desktop right image */}
      <PromoMedia
        data={data}
        styles={styles}
        image={resolvedPromo?.image}
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
        constantValue: {
          image: {
            height: 360,
            width: 640,
            url: PLACEHOLDER_IMAGE_URL,
          },
          title: { en: "Featured Promotion", hasLocalizedValue: "true" },
          description: {
            en: "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 100 characters",
            hasLocalizedValue: "true",
          },
          cta: {
            label: { en: "Learn More", hasLocalizedValue: "true" },
            link: "#",
            linkType: "URL",
            ctaType: "textAndLink",
          },
        },
        constantValueEnabled: true,
        constantValueOverride: {
          image: true,
          title: true,
          description: true,
          cta: true,
        },
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      orientation: "left",
      ctaVariant: "primary",
      heading: {
        level: 2,
        align: "left",
      },
      image: {
        aspectRatio: 1.78,
      },
    },
    analytics: {
      scope: "promoSection",
    },
    liveVisibility: true,
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

function isVideo(
  field: ImageType | AssetImageType | AssetVideo | undefined
): field is AssetVideo {
  return Boolean(field && typeof field === "object" && "video" in field);
}
