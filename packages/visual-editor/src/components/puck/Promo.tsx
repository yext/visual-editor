import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  themeManagerCn,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  BasicSelector,
  ImageProps,
  Image,
  Body,
  BackgroundStyle,
  backgroundColors,
  BodyProps,
  ImageWrapperProps,
  ThemeOptions,
  Heading,
  HeadingProps,
  CTA,
  CTAProps,
  Section,
} from "../../index.js";
import { resolvedImageFields, ImageWrapperFields } from "./Image.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface PromoProps {
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
}

const promoFields: Fields<PromoProps> = {
  image: {
    type: "object",
    label: "Image",
    objectFields: {
      ...ImageWrapperFields,
    },
  },
  title: {
    type: "object",
    label: "Business Name Heading Value",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Entity Field",
        filter: {
          types: ["type.string"],
        },
      }),
      level: BasicSelector(
        "Business Name Heading Level",
        ThemeOptions.HEADING_LEVEL
      ),
    },
  },
  description: {
    type: "object",
    label: "Text",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Entity Field",
        filter: {
          types: ["type.string"],
        },
      }),
      variant: {
        label: "Variant",
        type: "radio",
        options: ThemeOptions.BODY_VARIANT,
      },
    },
  },
  cta: {
    type: "object",
    label: "Primary CTA Value",
    objectFields: {
      entityField: YextEntityFieldSelector({
        label: "Entity Field",
        filter: {
          types: ["type.cta"],
        },
      }),
      variant: {
        label: "Variant",
        type: "radio",
        options: ThemeOptions.CTA_VARIANT,
      },
      visible: {
        label: "Show Primary CTA",
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
      },
    },
  },
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      backgroundColor: BasicSelector(
        "Background Color",
        ThemeOptions.BACKGROUND_COLOR
      ),
      orientation: BasicSelector("Image Orientation", [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
      ]),
    },
  },
};

const PromoWrapper: React.FC<PromoProps> = ({
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

  if (!resolvedImage) {
    return null;
  }

  return (
    <Section className="components" background={styles.backgroundColor}>
      <div
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
        <div className="flex flex-col justify-center gap-y-4 md:gap-y-8 p-4 md:px-16 md:py-0 w-full break-all">
          {title?.text && (
            <Heading level={title.level}>
              {resolveYextEntityField(document, title.text)}
            </Heading>
          )}
          {description?.text && (
            <Body variant={description.variant}>
              {resolveYextEntityField(document, description.text)}
            </Body>
          )}
          {resolvedCTA && cta.visible && (
            <CTA
              variant={cta.variant}
              label={resolvedCTA.label ?? ""}
              link={resolvedCTA.link || "#"}
              linkType={resolvedCTA.linkType}
            />
          )}
        </div>
      </div>
    </Section>
  );
};

export const Promo: ComponentConfig<PromoProps> = {
  label: "Promo",
  fields: promoFields,
  defaultProps: {
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
      ...promoFields,
      image: {
        ...promoFields.image,
        objectFields: resolvedImageFields(data.props.image.layout),
      },
    };
  },
  render: (props) => <PromoWrapper {...props} />,
};
