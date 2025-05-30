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
  MaybeRTF,
  i18n,
} from "@yext/visual-editor";

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
  liveVisibility: boolean;
}

const promoSectionFields: Fields<PromoSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      promo: YextStructFieldSelector({
        label: "Promo",
        filter: {
          type: ComponentFields.PromoSection.type,
        },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      orientation: YextField("Image Orientation", {
        type: "radio",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      }),
      ctaVariant: YextField("CTA Variant", {
        type: "radio",
        options: "CTA_VARIANT",
      }),
    },
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const PromoWrapper: React.FC<PromoSectionProps> = ({ data, styles }) => {
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
          displayName={i18n("image", { defaultValue: "Image" })}
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
            displayName={i18n("title", { defaultValue: "Title" })}
            fieldId={data.promo.field}
            constantValueEnabled={data.promo.constantValueOverride.title}
          >
            <Heading level={3}>{resolvedPromo?.title}</Heading>
          </EntityField>
        )}
        <EntityField
          displayName={i18n("description", { defaultValue: "Description" })}
          fieldId={data.promo.field}
          constantValueEnabled={
            !resolvedPromo?.description ||
            data.promo.constantValueOverride.description
          }
        >
          <MaybeRTF data={resolvedPromo?.description} />
        </EntityField>
        {resolvedPromo?.cta?.label && (
          <EntityField
            displayName={i18n("callToAction", {
              defaultValue: "Call To Action",
            })}
            fieldId={data.promo.field}
            constantValueEnabled={data.promo.constantValueOverride.cta}
          >
            <CTA
              variant={styles?.ctaVariant}
              label={resolvedPromo?.cta.label}
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
  label: "Promo Section",
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
          title: "Title",
          description: "Description",
          cta: {
            label: "Call To Action",
            link: "#",
            linkType: "URL",
          },
        },
        constantValueOverride: {},
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      orientation: "left",
      ctaVariant: "primary",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <PromoWrapper {...props} />
    </VisibilityWrapper>
  ),
};
