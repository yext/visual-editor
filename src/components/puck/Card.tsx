import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { Image, ImageProps, ImageType } from "@yext/pages-components";
import {
  themeMangerCn,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  FontSizeSelector,
  BodyProps,
} from "../../index.js";
import { Body } from "./atoms/body.js";
import { CTA, CTAProps } from "./atoms/cta.js";
import {
  Heading,
  HeadingProps,
  HeadingLevel,
  headingOptions,
} from "./atoms/heading.js";
import { Section } from "./atoms/section.js";
import { imageWrapperVariants, ImageWrapperProps } from "./Image.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

interface CardProps {
  orientation: "left" | "right";
  heading: {
    text: YextEntityField<string>;
    fontSize: HeadingProps["fontSize"];
    color: HeadingProps["color"];
    transform: HeadingProps["transform"];
    level: HeadingLevel;
  };
  subheading: {
    text: YextEntityField<string>;
    fontSize: HeadingProps["fontSize"];
    color: HeadingProps["color"];
    transform: HeadingProps["transform"];
    level: HeadingLevel;
  };
  body: {
    text: YextEntityField<string>;
    fontSize: BodyProps["fontSize"];
    color: BodyProps["color"];
    transform: BodyProps["textTransform"];
  };
  image: {
    image: YextEntityField<ImageType>;
    size: ImageWrapperProps["size"];
    aspectRatio: ImageWrapperProps["aspectRatio"];
    rounded: ImageWrapperProps["rounded"];
  };
  cta: {
    entityField: YextEntityField<CTAProps>;
    variant: CTAProps["variant"];
    fontSize: HeadingProps["fontSize"];
  };
  backgroundColor:
    | "bg-palette-primary"
    | "bg-palette-secondary"
    | "bg-palette-accent"
    | "bg-palette-text"
    | "bg-palette-background";
}

const cardFields: Fields<CardProps> = {
  orientation: {
    type: "select",
    label: "Orientation",
    options: [
      { label: "Left", value: "left" },
      { label: "Right", value: "right" },
    ],
  },
  heading: {
    type: "object",
    label: "Title",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Entity Field",
        filter: {
          types: ["type.string"],
        },
      }),
      fontSize: FontSizeSelector(),
      color: {
        label: "Font Color",
        type: "select",
        options: [
          { label: "Default", value: "default" },
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Accent", value: "accent" },
          { label: "Text", value: "text" },
          { label: "Background", value: "background" },
        ],
      },
      transform: {
        label: "Text Transform",
        type: "select",
        options: [
          { value: "none", label: "None" },
          { value: "lowercase", label: "Lowercase" },
          { value: "uppercase", label: "Uppercase" },
          { value: "capitalize", label: "Capitalize" },
        ],
      },
      level: {
        label: "Level",
        type: "select",
        options: headingOptions,
      },
    },
  },
  subheading: {
    type: "object",
    label: "Subtitle",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Entity Field",
        filter: {
          types: ["type.string"],
        },
      }),
      fontSize: FontSizeSelector(),
      color: {
        label: "Font Color",
        type: "select",
        options: [
          { label: "Default", value: "default" },
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Accent", value: "accent" },
          { label: "Text", value: "text" },
          { label: "Background", value: "background" },
        ],
      },
      transform: {
        label: "Text Transform",
        type: "select",
        options: [
          { value: "none", label: "None" },
          { value: "lowercase", label: "Lowercase" },
          { value: "uppercase", label: "Uppercase" },
          { value: "capitalize", label: "Capitalize" },
        ],
      },
      level: {
        label: "Level",
        type: "select",
        options: headingOptions,
      },
    },
  },
  body: {
    type: "object",
    label: "Description",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Entity Field",
        filter: {
          types: ["type.string"],
        },
      }),
      fontSize: FontSizeSelector(),
      color: {
        label: "Font Color",
        type: "select",
        options: [
          { label: "Default", value: "default" },
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Accent", value: "accent" },
          { label: "Text", value: "text" },
          { label: "Background", value: "background" },
        ],
      },
      transform: {
        label: "Text Transform",
        type: "select",
        options: [
          { value: "none", label: "None" },
          { value: "lowercase", label: "Lowercase" },
          { value: "uppercase", label: "Uppercase" },
          { value: "capitalize", label: "Capitalize" },
        ],
      },
    },
  },
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
      size: {
        type: "select",
        label: "Size",
        options: [
          { label: "Small", value: "small" },
          { label: "Medium", value: "medium" },
          { label: "Large", value: "large" },
          { label: "Full Width", value: "full" },
        ],
      },
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
      rounded: {
        type: "select",
        label: "Rounded Corners",
        options: [
          { label: "None", value: "none" },
          { label: "Small", value: "small" },
          { label: "Medium", value: "medium" },
          { label: "Large", value: "large" },
          { label: "Full", value: "full" },
        ],
      },
    },
  },
  cta: {
    type: "object",
    label: "Call to Action",
    objectFields: {
      entityField: YextEntityFieldSelector({
        label: "Entity Field",
        filter: {
          types: ["type.cta"],
        },
      }),
      variant: {
        type: "select",
        label: "Variant",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Link", value: "link" },
        ],
      },
      fontSize: FontSizeSelector(),
    },
  },
  backgroundColor: {
    label: "Background Color",
    type: "radio",
    options: [
      { label: "Background", value: "bg-palette-background" },
      { label: "Primary", value: "bg-palette-primary" },
      { label: "Secondary", value: "bg-palette-secondary" },
      { label: "Accent", value: "bg-palette-accent" },
      { label: "Text", value: "bg-palette-text" },
    ],
  },
};

const CardWrapper = ({
  orientation,
  heading,
  subheading,
  body,
  image,
  cta,
  backgroundColor,
}: CardProps) => {
  const document = useDocument();
  const resolvedImage = resolveYextEntityField<ImageProps["image"]>(
    document,
    image.image
  );
  const resolvedCTA = resolveYextEntityField(document, cta.entityField);

  return (
    <Section className="components">
      <div
        className={themeMangerCn(
          "flex flex-col md:flex-row bg-white overflow-hidden md:gap-8",
          orientation === "right" && "md:flex-row-reverse",
          backgroundColor
        )}
      >
        {resolvedImage && (
          <EntityField displayName="Image" fieldId={image.image.field}>
            <div
              className={themeMangerCn(
                imageWrapperVariants({
                  size: image.size,
                  rounded: image.rounded,
                  aspectRatio: image.aspectRatio,
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
          {heading?.text && (
            <EntityField displayName="Heading" fieldId={heading.text.field}>
              <Heading
                fontSize={heading.fontSize}
                color={heading.color}
                transform={heading.transform}
                level={heading.level}
              >
                {resolveYextEntityField(document, heading.text)}
              </Heading>
            </EntityField>
          )}
          {subheading?.text && (
            <EntityField displayName="Heading" fieldId={subheading.text.field}>
              <Heading
                fontSize={subheading.fontSize}
                color={subheading.color}
                transform={subheading.transform}
                level={subheading.level}
              >
                {resolveYextEntityField(document, subheading.text)}
              </Heading>
            </EntityField>
          )}
          {body?.text && (
            <EntityField displayName="Heading" fieldId={body.text.field}>
              <Body
                fontSize={body.fontSize}
                textTransform={body.transform}
                color={body.color}
              >
                {resolveYextEntityField(document, body.text)}
              </Body>
            </EntityField>
          )}
          {resolvedCTA && (
            <CTA
              variant={cta.variant}
              label={resolvedCTA.name}
              link={resolvedCTA.link ?? "#"}
              fontSize={cta.fontSize}
            />
          )}
        </div>
      </div>
    </Section>
  );
};

export const CardComponent: ComponentConfig<CardProps> = {
  label: "Card",
  fields: cardFields,
  defaultProps: {
    orientation: "left",
    heading: {
      text: {
        field: "",
        constantValue: "Heading",
        constantValueEnabled: true,
      },
      fontSize: "default",
      color: "default",
      transform: "none",
      level: 1,
    },
    subheading: {
      text: {
        field: "",
        constantValue: "SubHeading",
        constantValueEnabled: true,
      },
      fontSize: "default",
      color: "default",
      transform: "none",
      level: 2,
    },
    body: {
      text: {
        field: "",
        constantValue: "Body",
        constantValueEnabled: true,
      },
      fontSize: "default",
      color: "default",
      transform: "none",
    },
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
      size: "full",
      rounded: "none",
      aspectRatio: "auto",
    },
    cta: {
      entityField: {
        field: "",
        constantValue: {
          name: "Call to Action",
        },
      },
      fontSize: "default",
      variant: "primary",
    },
    backgroundColor: "bg-palette-background",
  },
  render: (props) => <CardWrapper {...props} />,
};

export { CardComponent as Card, type CardProps };
