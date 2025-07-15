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
  resolveTranslatableString,
  resolveTranslatableRichText,
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
          <div className="w-full">
            <Image
              image={resolvedPromo.image}
              aspectRatio={styles.image.aspectRatio ?? 1.78}
              width={styles.image.width || 640}
              className="max-w-full sm:max-w-initial rounded-image-borderRadius"
            />
          </div>
        </EntityField>
      )}
      <div className="flex flex-col justify-center gap-y-4 md:gap-y-8 md:px-16 pt-4 md:pt-0 w-full break-words">
        {resolvedPromo?.title && (
          <EntityField
            displayName={pt("fields.title", "Title")}
            fieldId={data.promo.field}
            constantValueEnabled={data.promo.constantValueOverride.title}
          >
            <div className={`flex ${justifyClass}`}>
              <Heading level={styles.heading.level}>
                {resolveTranslatableString(resolvedPromo?.title, i18n.language)}
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
          {resolveTranslatableRichText(
            resolvedPromo?.description,
            i18n.language
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
              label={resolveTranslatableString(
                resolvedPromo?.cta.label,
                i18n.language
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
