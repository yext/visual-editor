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
} from "../../index.js";
import { Body } from "./atoms/body.js";
import { CTA, CTAProps, linkTypeFields } from "./atoms/cta.js";
import { Heading, HeadingProps } from "./atoms/heading.js";
import { Section } from "./atoms/section.js";
import { imageWrapperVariants, ImageWrapperProps } from "./Image.js";
import { BasicSelector } from "../editor/BasicSelector.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

interface PromoProps {
  orientation: "left" | "right";
  title: {
    text: YextEntityField<string>;
    fontSize: HeadingProps["fontSize"];
    color: HeadingProps["color"];
    transform: HeadingProps["transform"];
  };
  description: {
    text: YextEntityField<string>;
    fontSize: HeadingProps["fontSize"];
    color: HeadingProps["color"];
    transform: HeadingProps["transform"];
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
    fontSize: CTAProps["fontSize"];
    linkType: CTAProps["linkType"];
  };
}

const promoFields: Fields<PromoProps> = {
  orientation: BasicSelector("Orientation", [
    { label: "Left", value: "left" },
    { label: "Right", value: "right" },
  ]),
  title: {
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
      color: BasicSelector("Font Color", [
        { label: "Default", value: "default" },
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Accent", value: "accent" },
        { label: "Text", value: "text" },
        { label: "Background", value: "background" },
      ]),
      transform: BasicSelector("Text Transform", [
        { value: "none", label: "None" },
        { value: "lowercase", label: "Lowercase" },
        { value: "uppercase", label: "Uppercase" },
        { value: "capitalize", label: "Capitalize" },
      ]),
    },
  },
  description: {
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
      color: BasicSelector("Font Color", [
        { label: "Default", value: "default" },
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Accent", value: "accent" },
        { label: "Text", value: "text" },
        { label: "Background", value: "background" },
      ]),
      transform: BasicSelector("Text Transform", [
        { value: "none", label: "None" },
        { value: "lowercase", label: "Lowercase" },
        { value: "uppercase", label: "Uppercase" },
        { value: "capitalize", label: "Capitalize" },
      ]),
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
      variant: BasicSelector("Variant", [
        { label: "Primary", value: "primary" },
        { label: "Link", value: "link" },
      ]),
      fontSize: FontSizeSelector(),
      linkType: linkTypeFields,
    },
  },
};

const PromoWrapper: React.FC<PromoProps> = ({
  orientation,
  title,
  description,
  image,
  cta,
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
          "flex flex-col md:flex-row bg-white overflow-hidden md:gap-8",
          orientation === "right" && "md:flex-row-reverse"
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
          {title?.text && (
            <Heading
              fontSize={title.fontSize}
              color={title.color}
              transform={title.transform}
            >
              {resolveYextEntityField(document, title.text)}
            </Heading>
          )}
          {description?.text && (
            <Body
              fontSize={description.fontSize}
              textTransform={description.transform}
              color={description.color}
            >
              {resolveYextEntityField(document, description.text)}
            </Body>
          )}
          {resolvedCTA && (
            <CTA
              variant={cta.variant}
              label={resolvedCTA.label ?? ""}
              link={resolvedCTA.link || "#"}
              linkType={cta.linkType}
              fontSize={cta.fontSize}
            />
          )}
        </div>
      </div>
    </Section>
  );
};

export const PromoComponent: ComponentConfig<PromoProps> = {
  label: "Promo",
  fields: promoFields,
  defaultProps: {
    orientation: "left",
    title: {
      text: {
        field: "",
        constantValue: "Title",
        constantValueEnabled: true,
      },
      fontSize: "default",
      color: "default",
      transform: "none",
    },
    description: {
      text: {
        field: "",
        constantValue: "Description",
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
      size: "medium",
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
      linkType: "URL",
    },
  },
  render: (props) => <PromoWrapper {...props} />,
};

export { PromoComponent as Promo, type PromoProps };
