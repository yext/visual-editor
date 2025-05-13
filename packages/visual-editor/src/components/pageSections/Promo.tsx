import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  themeManagerCn,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  ImageProps,
  Image,
  Body,
  BackgroundStyle,
  backgroundColors,
  BodyProps,
  ImageWrapperProps,
  Heading,
  HeadingProps,
  CTA,
  CTAProps,
  PageSection,
  YextField,
  VisibilityWrapper,
} from "@yext/visual-editor";
import {
  resolvedImageFields,
  ImageWrapperFields,
} from "../contentBlocks/Image.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface PromoSectionProps {
  image: ImageWrapperProps;
  title: {
    text: YextEntityField<string>;
    level: HeadingProps["level"];
  };
  description: {
    text: YextEntityField<string>;
    variant: BodyProps["variant"];
  };
  cta: {
    entityField: YextEntityField<CTAProps>;
    variant: CTAProps["variant"];
    visible: boolean;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    orientation: "left" | "right";
  };
  liveVisibility: boolean;
}

const promoSectionFields: Fields<PromoSectionProps> = {
  image: YextField("Image", {
    type: "object",
    objectFields: {
      ...ImageWrapperFields,
    },
  }),
  title: YextField("Business Name Heading", {
    type: "object",
    objectFields: {
      text: YextField<any, string>("Value", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      level: YextField("Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  description: YextField("Description", {
    type: "object",
    objectFields: {
      text: YextField<any, string>("Value", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      variant: YextField("Variant", {
        type: "radio",
        options: "BODY_VARIANT",
      }),
    },
  }),
  cta: YextField("Primary CTA", {
    type: "object",
    objectFields: {
      entityField: YextField<any, CTAProps>("Value", {
        type: "entityField",
        filter: {
          types: ["type.cta"],
        },
      }),
      variant: YextField("Variant", {
        type: "radio",
        options: "CTA_VARIANT",
      }),
      visible: YextField("Show Primary CTA", {
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
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

const PromoWrapper: React.FC<PromoSectionProps> = ({
  image,
  title,
  description,
  cta,
  styles,
}) => {
  const document = useDocument();
  const resolvedImage = resolveYextEntityField<ImageProps["image"]>(
    document,
    image.image
  );
  const resolvedCTA = resolveYextEntityField(document, cta.entityField);
  const resolvedTitle = resolveYextEntityField(document, title.text);

  if (!resolvedImage) {
    return null;
  }

  return (
    <PageSection
      background={styles.backgroundColor}
      className={themeManagerCn(
        "flex flex-col md:flex-row overflow-hidden md:gap-8",
        styles.orientation === "right" && "md:flex-row-reverse"
      )}
    >
      {resolvedImage && (
        <EntityField
          displayName="Image"
          fieldId={image.image.field}
          constantValueEnabled={image.image.constantValueEnabled}
        >
          <Image
            image={resolvedImage}
            layout={image.layout}
            width={image.width}
            height={image.height}
            aspectRatio={image.aspectRatio}
          />
        </EntityField>
      )}
      <div className="flex flex-col justify-center gap-y-4 md:gap-y-8 md:px-16 pt-4 md:pt-0 w-full break-words">
        {resolvedTitle && (
          <Heading level={title.level}>{resolvedTitle}</Heading>
        )}
        {description?.text && (
          <Body variant={description.variant}>
            {resolveYextEntityField(document, description.text)}
          </Body>
        )}
        {resolvedCTA && cta.visible && (
          <CTA
            variant={cta.variant}
            label={resolvedCTA.label}
            link={resolvedCTA.link}
            linkType={resolvedCTA.linkType}
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
    liveVisibility: true,
    image: {
      image: {
        field: "primaryPhoto",
        constantValue: {
          height: 360,
          width: 640,
          url: PLACEHOLDER_IMAGE_URL,
        },
        constantValueEnabled: true,
      },
      layout: "auto",
      aspectRatio: 1.78,
    },
    title: {
      text: {
        field: "name",
        constantValue: "Title",
      },
      level: 3,
    },
    description: {
      text: {
        field: "",
        constantValue: "Description",
        constantValueEnabled: true,
      },
      variant: "base",
    },
    cta: {
      entityField: {
        field: "",
        constantValue: {
          label: "Call to Action",
        },
      },
      variant: "primary",
      visible: true,
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      orientation: "left",
    },
  },
  resolveFields(data) {
    return {
      ...promoSectionFields,
      image: {
        ...promoSectionFields.image,
        objectFields: resolvedImageFields(data.props.image.layout),
      },
    };
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
