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
  FontSizeSelector,
  BasicSelector,
  BodyProps,
  getFontWeightOverrideOptions,
} from "../../index.js";
import { Body } from "./atoms/body.js";
import { CTA, CTAProps, linkTypeFields } from "./atoms/cta.js";
import {
  Heading,
  HeadingProps,
  HeadingLevel,
  headingOptions,
} from "./atoms/heading.js";
import { Section } from "./atoms/section.js";
import { imageWrapperVariants, ImageWrapperProps } from "./Image.js";
import {
  backgroundColors,
  BackgroundStyle,
  ctaVariantOptions,
} from "../../utils/themeConfigOptions.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

interface CardProps {
  orientation: "left" | "right";
  heading: {
    text: YextEntityField<string>;
    fontSize: HeadingProps["fontSize"];
    weight: HeadingProps["weight"];
    transform: HeadingProps["transform"];
    level: HeadingLevel;
  };
  subheading: {
    text: YextEntityField<string>;
    fontSize: HeadingProps["fontSize"];
    weight: HeadingProps["weight"];
    transform: HeadingProps["transform"];
    level: HeadingLevel;
  };
  body: {
    text: YextEntityField<string>;
    variant: BodyProps["variant"];
  };
  image: {
    image: YextEntityField<ImageType>;
    size: ImageWrapperProps["size"];
    aspectRatio: ImageWrapperProps["aspectRatio"];
    rounded: ImageWrapperProps["rounded"];
  };
  cta: {
    entityField: YextEntityField<CTAProps>;
    linkType: CTAProps["linkType"];
    variant: CTAProps["variant"];
  };
  backgroundColor?: BackgroundStyle;
}

const cardFields: Fields<CardProps> = {
  orientation: BasicSelector("Orientation", [
    { label: "Left", value: "left" },
    { label: "Right", value: "right" },
  ]),
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
      weight: BasicSelector("Font Weight", []),
      transform: BasicSelector("Text Transform", [
        { value: "none", label: "None" },
        { value: "lowercase", label: "Lowercase" },
        { value: "uppercase", label: "Uppercase" },
        { value: "capitalize", label: "Capitalize" },
      ]),
      level: BasicSelector("Level", headingOptions),
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
      weight: BasicSelector("Font Weight", []),
      transform: BasicSelector("Text Transform", [
        { value: "none", label: "None" },
        { value: "lowercase", label: "Lowercase" },
        { value: "uppercase", label: "Uppercase" },
        { value: "capitalize", label: "Capitalize" },
      ]),
      level: BasicSelector("Level", headingOptions),
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
      variant: {
        type: "radio",
        label: "Variant",
        options: [
          { label: "Small", value: "sm" },
          { label: "Base", value: "base" },
          { label: "Large", value: "lg" },
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
      size: BasicSelector("Size", [
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
        { label: "Full Width", value: "full" },
      ]),
      aspectRatio: BasicSelector("Aspect Ratio", [
        { label: "Auto", value: "auto" },
        { label: "Square", value: "square" },
        { label: "Video (16:9)", value: "video" },
        { label: "Portrait (3:4)", value: "portrait" },
      ]),
      rounded: BasicSelector("Rounded Corners", [
        { label: "None", value: "none" },
        { label: "Small", value: "small" },
        { label: "Medium", value: "medium" },
        { label: "Large", value: "large" },
        { label: "Full", value: "full" },
      ]),
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
        label: "Variant",
        type: "radio",
        options: ctaVariantOptions,
      },
      linkType: linkTypeFields,
    },
  },
  backgroundColor: BasicSelector(
    "Background Color",
    Object.values(backgroundColors)
  ),
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
    <Section background={backgroundColor} className={`components`}>
      <div
        className={themeManagerCn(
          "flex flex-col md:flex-row overflow-hidden md:gap-8",
          orientation === "right" && "md:flex-row-reverse"
        )}
      >
        {resolvedImage && (
          <div className="w-full">
            <EntityField
              displayName="Image"
              fieldId={image.image.field}
              constantValueEnabled={image.image.constantValueEnabled}
            >
              <div
                className={themeManagerCn(
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
          </div>
        )}
        <div className="flex flex-col justify-center gap-y-4 md:gap-y-8 p-4 md:px-16 md:py-0 w-full break-all">
          {heading?.text && (
            <EntityField displayName="Heading" fieldId={heading.text.field}>
              <Heading
                fontSize={heading.fontSize}
                transform={heading.transform}
                level={heading.level}
                weight={heading.weight}
              >
                {resolveYextEntityField(document, heading.text)}
              </Heading>
            </EntityField>
          )}
          {subheading?.text && (
            <EntityField displayName="Subtitle" fieldId={subheading.text.field}>
              <Heading
                fontSize={subheading.fontSize}
                transform={subheading.transform}
                level={subheading.level}
                weight={subheading.weight}
              >
                {resolveYextEntityField(document, subheading.text)}
              </Heading>
            </EntityField>
          )}
          {body?.text && (
            <EntityField displayName="Description" fieldId={body.text.field}>
              <Body variant={body.variant}>
                {resolveYextEntityField(document, body.text)}
              </Body>
            </EntityField>
          )}
          {resolvedCTA && (
            <CTA
              variant={cta.variant}
              label={resolvedCTA.label ?? ""}
              link={resolvedCTA.link || "#"}
              linkType={cta.linkType}
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
      weight: "default",
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
      weight: "default",
      transform: "none",
      level: 2,
    },
    body: {
      text: {
        field: "",
        constantValue: "Body",
        constantValueEnabled: true,
      },
      variant: "base",
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
          label: "Call to Action",
        },
      },
      variant: "primary",
      linkType: "URL",
    },
    backgroundColor: backgroundColors.background1.value,
  },
  resolveFields: async (data): Promise<Fields<CardProps>> => {
    const headingFontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: `--fontFamily-heading${data.props.heading.level}-fontFamily`,
    });
    const subheadingFontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: `--fontFamily-heading${data.props.subheading.level}-fontFamily`,
    });
    const bodyFontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: "--fontFamily-body-fontFamily",
    });
    return {
      ...cardFields,
      heading: {
        ...cardFields.heading,
        // @ts-expect-error ts(2322) 'objectFields' does not exist in type 'TextField'
        objectFields: {
          // @ts-expect-error ts(2339) objectFields does exist on the heading field
          ...cardFields.heading.objectFields,
          weight: BasicSelector("Font Weight", headingFontWeightOptions),
        },
      },
      subheading: {
        ...cardFields.subheading,
        // @ts-expect-error ts(2322) 'objectFields' does not exist in type 'TextField'
        objectFields: {
          // @ts-expect-error ts(2339) objectFields does exist on the subheading field
          ...cardFields.subheading.objectFields,
          weight: BasicSelector("Font Weight", subheadingFontWeightOptions),
        },
      },
      body: {
        ...cardFields.body,
        // @ts-expect-error ts(2322) 'objectFields' does not exist in type 'TextField'
        objectFields: {
          // @ts-expect-error ts(2339) objectFields does exist on the body field
          ...cardFields.body.objectFields,
          weight: BasicSelector("Font Weight", bodyFontWeightOptions),
        },
      },
    };
  },
  render: (props) => <CardWrapper {...props} />,
};

export { CardComponent as Card, type CardProps };
