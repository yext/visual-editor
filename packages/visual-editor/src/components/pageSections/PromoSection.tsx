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
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface PromoSectionProps {
  data: {
    promo: YextStructEntityField<PromoSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    orientation: "left" | "right";
    ctaVariant: CTAProps["variant"];
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
          hasSearch: true,
          options: "BACKGROUND_COLOR",
        }
      ),
      orientation: YextField(
        msg("fields.imageOrientation", "Image Orientation"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.left", "Left"), value: "left" },
            { label: msg("fields.options.right", "Right"), value: "right" },
          ],
        }
      ),
      ctaVariant: YextField(msg("fields.ctaVariant", "CTA Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
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
            layout={"auto"}
            aspectRatio={resolvedPromo.image.width / resolvedPromo.image.height}
          />
        </EntityField>
      )}
      <div className="flex flex-col justify-center gap-y-4 md:gap-y-8 md:px-16 pt-4 md:pt-0 w-full break-words">
        {resolvedPromo?.title && (
          <EntityField
            displayName={pt("fields.title", "Title")}
            fieldId={data.promo.field}
            constantValueEnabled={data.promo.constantValueOverride.title}
          >
            <Heading level={3}>
              {resolveTranslatableString(resolvedPromo?.title, i18n.language)}
            </Heading>
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
          title: "Title",
          description: "Description",
          cta: {
            label: "Call To Action",
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
      <AnalyticsScopeProvider name={props.analytics?.scope ?? "promoSection"}>
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
