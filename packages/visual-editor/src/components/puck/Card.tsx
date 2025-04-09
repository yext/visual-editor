import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  ThemeOptions,
  themeManagerCn,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  FontSizeSelector,
  BasicSelector,
  Body,
  BodyProps,
  getFontWeightOverrideOptions,
  Image,
  ImageProps,
  ImageWrapperProps,
  backgroundColors,
  BackgroundStyle,
  HeadingLevel,
  CTA,
  CTAProps,
  Heading,
  HeadingProps,
  Section,
} from "../../index.js";
import { resolvedImageFields, ImageWrapperFields } from "./Image.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface CardProps {
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
  image: ImageWrapperProps;
  cta: {
    entityField: YextEntityField<CTAProps>;
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
        label: "Value",
        filter: {
          types: ["type.string"],
        },
      }),
      fontSize: FontSizeSelector(),
      weight: BasicSelector("Font Weight", []),
      transform: BasicSelector("Text Transform", ThemeOptions.TEXT_TRANSFORM),
      level: BasicSelector("Level", ThemeOptions.HEADING_LEVEL),
    },
  },
  subheading: {
    type: "object",
    label: "Subtitle",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Value",
        filter: {
          types: ["type.string"],
        },
      }),
      fontSize: FontSizeSelector(),
      weight: BasicSelector("Font Weight", []),
      transform: BasicSelector("Text Transform", ThemeOptions.TEXT_TRANSFORM),
      level: BasicSelector("Level", ThemeOptions.HEADING_LEVEL),
    },
  },
  body: {
    type: "object",
    label: "Description",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Value",
        filter: {
          types: ["type.string"],
        },
      }),
      variant: {
        type: "radio",
        label: "Variant",
        options: ThemeOptions.BODY_VARIANT,
      },
    },
  },
  image: {
    type: "object",
    label: "Image",
    objectFields: {
      ...ImageWrapperFields,
    },
  },
  cta: {
    type: "object",
    label: "Call to Action",
    objectFields: {
      entityField: YextEntityFieldSelector({
        label: "Value",
        filter: {
          types: ["type.cta"],
        },
      }),
      variant: {
        label: "Variant",
        type: "radio",
        options: ThemeOptions.CTA_VARIANT,
      },
    },
  },
  backgroundColor: BasicSelector(
    "Background Color",
    ThemeOptions.BACKGROUND_COLOR
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
    <Section
      background={backgroundColor}
      className={themeManagerCn(
        "flex flex-col md:flex-row overflow-hidden md:gap-8",
        orientation === "right" && "md:flex-row-reverse"
      )}
      applyPageLevelStyles
    >
      {resolvedImage && (
        <div className="w-full">
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
        </div>
      )}
      <div className="flex flex-col justify-center gap-y-4 md:gap-y-8 md:px-16 pt-4 md:pt-0 w-full break-all">
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
            linkType={resolvedCTA.linkType}
          />
        )}
      </div>
    </Section>
  );
};

export const Card: ComponentConfig<CardProps> = {
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
          height: 360,
          width: 640,
          url: PLACEHOLDER_IMAGE_URL,
        },
        constantValueEnabled: true,
      },
      layout: "auto",
      aspectRatio: 1.78,
    },
    cta: {
      entityField: {
        field: "",
        constantValue: {
          label: "Call to Action",
          linkType: "URL",
        },
      },
      variant: "primary",
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
      image: {
        ...cardFields.image,
        // @ts-expect-error ts(2322) 'objectFields' does not exist in type 'TextField'
        objectFields: resolvedImageFields(data.props.image.layout),
      },
    };
  },
  render: (props) => <CardWrapper {...props} />,
};
