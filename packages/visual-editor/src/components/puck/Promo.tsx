import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Image, ImageProps, ImageType } from "@yext/pages-components";
import {
  themeManagerCn,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  BasicSelector,
  Body,
  ImageWrapperProps,
} from "../../index.js";
import { CTA, CTAProps } from "./atoms/cta.js";
import { Heading, HeadingProps, headingOptions } from "./atoms/heading.js";
import { Section } from "./atoms/section.js";
import { imageWrapperVariants } from "./Image.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

interface PromoProps {
  image: {
    image: YextEntityField<ImageType>;
    aspectRatio: ImageWrapperProps["aspectRatio"];
  };
  title: {
    text: YextEntityField<string>;
    level: HeadingProps["level"];
  };
  description: {
    text: YextEntityField<string>;
  };
  cta: {
    entityField: YextEntityField<CTAProps>;
    variant: CTAProps["variant"];
    visible: boolean;
  };
  styles: {
    backgroundColor:
      | "bg-card-backgroundColor"
      | "bg-palette-primary"
      | "bg-palette-secondary"
      | "bg-palette-accent"
      | "bg-palette-text"
      | "bg-palette-background";
    orientation: "left" | "right";
  };
}

const promoFields: Fields<PromoProps> = {
  image: {
    type: "object",
    label: "Image",
    objectFields: {
      image: YextEntityFieldSelector<any, ImageType>({
        label: "Image",
        filter: {
          types: ["type.image"],
        },
      }),
      // TODO (SUMO-7090): Replace with BasicSelector
      aspectRatio: {
        type: "select",
        label: "Aspect Ratio",
        options: [
          { label: "Auto", value: "auto" },
          { label: "Square", value: "square" },
          { label: "Video (16:9)", value: "video" },
          { label: "Portrait (3:4)", value: "portrait" },
        ],
      },
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
      level: BasicSelector("Business Name Heading", headingOptions),
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
      variant: BasicSelector("Primary CTA Variant", [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Link", value: "link" },
      ]),
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
      backgroundColor: BasicSelector("Background Color", [
        { label: "Default", value: "bg-promo-backgroundColor" },
        { label: "Primary", value: "bg-palette-primary" },
        { label: "Secondary", value: "bg-palette-secondary" },
        { label: "Accent", value: "bg-palette-accent" },
        { label: "Text", value: "bg-palette-text" },
        { label: "Background", value: "bg-palette-background" },
      ]),
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
    <Section className="components">
      <div
        className={themeManagerCn(
          "flex flex-col md:flex-row bg-white overflow-hidden md:gap-8 bg-white",
          styles.orientation === "right" && "md:flex-row-reverse",
          styles.backgroundColor
        )}
      >
        {resolvedImage && (
          <EntityField
            displayName="Image"
            fieldId={image.image.field}
            constantValueEnabled={image.image.constantValueEnabled}
          >
            <div
              className={themeManagerCn(
                imageWrapperVariants({
                  aspectRatio: image.aspectRatio,
                  size: "full",
                }),
                "overflow-hidden"
              )}
            >
              <Image
                image={resolvedImage}
                className="w-full h-full object-cover"
              />
            </div>
          </EntityField>
        )}
        <div className="flex flex-col justify-center gap-y-4 md:gap-y-8 p-4 md:px-16 md:py-0 w-full break-all">
          {title?.text && (
            <Heading level={title.level}>
              {resolveYextEntityField(document, title.text)}
            </Heading>
          )}
          {description?.text && (
            <Body>{resolveYextEntityField(document, description.text)}</Body>
          )}
          {resolvedCTA && cta.visible && (
            <CTA
              variant={cta.variant}
              label={resolvedCTA.label ?? ""}
              link={resolvedCTA.link || "#"}
              className="md:w-fit"
            />
          )}
        </div>
      </div>
    </Section>
  );
};

const Promo: ComponentConfig<PromoProps> = {
  fields: promoFields,
  defaultProps: {
    image: {
      image: {
        field: "primaryPhoto",
        constantValue: {
          alternateText: "",
          height: 360,
          width: 640,
          url: PLACEHOLDER_IMAGE_URL,
        },
        constantValueEnabled: true,
      },
      aspectRatio: "auto",
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
    },
    cta: {
      entityField: {
        field: "",
        constantValue: {
          name: "Call to Action",
        },
      },
      variant: "primary",
      visible: true,
    },
    styles: {
      backgroundColor: "bg-card-backgroundColor",
      orientation: "left",
    },
  },
  render: (props) => <PromoWrapper {...props} />,
};

export { Promo, type PromoProps };
