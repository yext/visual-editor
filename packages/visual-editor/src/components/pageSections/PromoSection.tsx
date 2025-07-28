import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  themeManagerCn,
  useDocument,
  Image,
  BackgroundStyle,
  backgroundColors,
  Heading,
  CTA,
  PageSection,
  YextField,
  VisibilityWrapper,
  CTAProps,
  PromoSectionType,
  YextStructEntityField,
  YextStructFieldSelector,
  resolveYextStructField,
  ComponentFields,
  EntityField,
  msg,
  pt,
  HeadingLevel,
  ThemeOptions,
  getAnalyticsScopeHash,
  resolveComponentData,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/ImageStyling.js";

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
  analytics?: {
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
      promo: YextStructFieldSelector({
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
      image: YextField(msg("fields.image", "Image"), {
        type: "object",
        objectFields: ImageStylingFields,
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
      className={themeManagerCn(
        "flex flex-col md:flex-row md:gap-16",
        styles.orientation === "right" && "md:flex-row-reverse"
      )}
    >
      {resolvedPromo?.image && (
        <EntityField
          displayName={pt("fields.image", "Image")}
          fieldId={data.promo.field}
          constantValueEnabled={data.promo.constantValueOverride.image}
        >
          <div className="w-full max-w-[500px] lg:max-w-none">
            <Image
              image={resolvedPromo.image}
              aspectRatio={styles.image.aspectRatio ?? 1.78}
              width={styles.image.width || 640}
              className="max-w-full sm:max-w-initial rounded-image-borderRadius w-full"
            />
          </div>
        </EntityField>
      )}
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
        {resolvedPromo?.cta?.label && (
          <EntityField
            displayName={pt("fields.callToAction", "Call To Action")}
            fieldId={data.promo.field}
            constantValueEnabled={data.promo.constantValueOverride.cta}
          >
            <CTA
              eventName={`cta`}
              variant={styles?.ctaVariant}
              label={resolveComponentData(
                resolvedPromo?.cta.label,
                i18n.language,
                streamDocument
              )}
              link={resolvedPromo?.cta.link}
              linkType={resolvedPromo?.cta.linkType}
            />
          </EntityField>
        )}
      </div>
    </PageSection>
  );
};

/**
 * The Promo Section is a flexible content component designed to highlight a single, specific promotion. It combines an image with a title, description, and a call-to-action button in a customizable, split-column layout, making it perfect for drawing attention to special offers or announcements.
 * Available on Location templates.
 */
export const PromoSection: ComponentConfig<PromoSectionProps> = {
  label: msg("components.promoSection", "Promo Section"),
  fields: promoSectionFields,
  defaultProps: {
    data: {
      promo: {
        field: "",
        constantValueEnabled: true,
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
          },
        },
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
  resolveFields: (data, { lastData }) => {
    // If set to entity value and no field selected, hide the component.
    if (
      !data.props.data.promo.constantValueEnabled &&
      data.props.data.promo.field === ""
    ) {
      data.props.liveVisibility = false;
      return {
        ...promoSectionFields,
        liveVisibility: undefined,
      };
    }

    // If no field was selected and then constant value is enabled
    // or a field is selected, show the component.
    if (
      (data.props.data.promo.constantValueEnabled &&
        !lastData?.props.data.promo.constantValueEnabled &&
        data.props.data.promo.field === "") ||
      (lastData?.props.data.promo.field === "" &&
        data.props.data.promo.field !== "")
    ) {
      data.props.liveVisibility = true;
    }

    // Otherwise, return normal fields.
    return promoSectionFields;
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
