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
  resolveTranslatableString,
  resolveTranslatableRichText,
  msg,
  pt,
  HeadingLevel,
  ThemeOptions,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/ImageStyling.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface PromoSectionProps {
  data: {
    promo: YextStructEntityField<PromoSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    orientation: "left" | "right";
    ctaVariant: CTAProps["variant"];
    heading: {
      level: HeadingLevel;
      align: "left" | "center" | "right";
    };
    image: ImageStylingProps;
  };
  analytics?: {
    scope?: string;
  };
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
          level: YextField(msg("fields.headingLevel", "Level"), {
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
  const document = useDocument();
  const resolvedPromo = resolveYextStructField(document, data?.promo);

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
        "flex flex-col md:flex-row md:gap-8",
        styles.orientation === "right" && "md:flex-row-reverse"
      )}
    >
      {resolvedPromo?.image && (
        <EntityField
          displayName={pt("fields.image", "Image")}
          fieldId={data.promo.field}
          constantValueEnabled={data.promo.constantValueOverride.image}
        >
          <Image
            image={resolvedPromo.image}
            aspectRatio={
              styles.image.aspectRatio ??
              resolvedPromo.image.width / resolvedPromo.image.height
            }
            width={styles.image.width}
            className="h-[200px]"
          />
        </EntityField>
      )}
      <div className="flex flex-col gap-6 justify-center">
        {resolvedPromo?.title && (
          <EntityField
            displayName={pt("fields.title", "Title")}
            fieldId={data.promo.field}
            constantValueEnabled={data.promo.constantValueOverride.title}
          >
            <div className={`flex ${justifyClass}`}>
              <Heading level={styles?.heading?.level ?? 2}>
                {resolveTranslatableString(resolvedPromo.title, i18n.language)}
              </Heading>
            </div>
          </EntityField>
        )}
        {resolveTranslatableRichText(resolvedPromo?.description, i18n.language)}
        {resolvedPromo?.cta && (
          <EntityField
            displayName={pt("fields.cta", "CTA")}
            fieldId={data.promo.field}
            constantValueEnabled={data.promo.constantValueOverride.cta}
          >
            <CTA
              eventName="cta"
              variant={styles?.ctaVariant}
              label={resolveTranslatableString(
                resolvedPromo.cta.label,
                i18n.language
              )}
              link={resolvedPromo.cta.link}
              linkType={resolvedPromo.cta.linkType}
            />
          </EntityField>
        )}
      </div>
    </PageSection>
  );
};

export const PromoSection: ComponentConfig<PromoSectionProps> = {
  label: msg("components.promoSection", "Promo Section"),
  fields: promoSectionFields,
  defaultProps: {
    data: {
      promo: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          title: {
            en: "Promo Title",
            hasLocalizedValue: "true",
          },
          description: {
            en: "Promo description",
            hasLocalizedValue: "true",
          },
          cta: {
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
          title: true,
          description: true,
          cta: true,
        },
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      orientation: "right",
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
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "promoSection"}>
      <VisibilityWrapper
        liveVisibility={!!props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <PromoWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
