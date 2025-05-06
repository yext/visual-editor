import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  themeManagerCn,
  useDocument,
  resolveYextEntityField,
  YextEntityField,
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
  Body,
} from "@yext/visual-editor";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface PromoSectionProps {
  promo: YextEntityField<PromoSectionType>;
  cta: {
    showCTA: boolean;
    variant: CTAProps["variant"];
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    orientation: "left" | "right";
  };
  liveVisibility: boolean;
}

const promoSectionFields: Fields<PromoSectionProps> = {
  promo: YextField("Promo", {
    type: "entityField",
    filter: {
      types: ["type.promo_section"],
    },
  }),
  cta: YextField("CTA", {
    type: "object",
    objectFields: {
      showCTA: YextField("Show CTA", {
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
      }),
      variant: YextField("Variant", {
        type: "radio",
        options: "CTA_VARIANT",
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

const PromoDescription = ({ description }: PromoSectionType) => {
  if (!description) {
    return null;
  }
  if (typeof description === "string") {
    return <Body>{description}</Body>;
  } else if (
    typeof description === "object" &&
    typeof description.html === "string"
  ) {
    return (
      <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
        <div
          dangerouslySetInnerHTML={{
            __html: description.html,
          }}
        />
      </div>
    );
  }
};

const PromoWrapper: React.FC<PromoSectionProps> = ({ promo, cta, styles }) => {
  const document = useDocument();
  const resolvedPromo = resolveYextEntityField(document, promo);

  return (
    <PageSection
      background={styles.backgroundColor}
      className={themeManagerCn(
        "flex flex-col md:flex-row overflow-hidden md:gap-8",
        styles.orientation === "right" && "md:flex-row-reverse"
      )}
    >
      {resolvedPromo?.image && (
        <Image
          image={resolvedPromo.image}
          layout={"auto"}
          aspectRatio={resolvedPromo.image.width / resolvedPromo.image.height}
        />
      )}
      <div className="flex flex-col justify-center gap-y-4 md:gap-y-8 md:px-16 pt-4 md:pt-0 w-full break-words">
        {resolvedPromo?.title && (
          <Heading level={3}>{resolvedPromo?.title}</Heading>
        )}
        <PromoDescription description={resolvedPromo?.description} />
        {resolvedPromo?.cta && cta?.showCTA && (
          <CTA
            variant={cta.variant}
            label={resolvedPromo?.cta.label}
            link={resolvedPromo?.cta.link}
            linkType={resolvedPromo?.cta.linkType}
          />
        )}
      </div>
    </PageSection>
  );
};

export const PromoSection: ComponentConfig<PromoSectionProps> = {
  label: "Promo Section",
  fields: promoSectionFields,
  defaultProps: {
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
    },
    cta: {
      showCTA: true,
      variant: "primary",
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      orientation: "left",
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
