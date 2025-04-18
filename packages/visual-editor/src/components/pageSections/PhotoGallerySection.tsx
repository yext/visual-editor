import React, { cloneElement } from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  Dot,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import {
  backgroundColors,
  BackgroundStyle,
  EntityField,
  Heading,
  HeadingLevel,
  Image,
  ImageProps,
  ImageWrapperProps,
  resolveYextEntityField,
  PageSection,
  themeManagerCn,
  useBackground,
  useDocument,
  YextEntityField,
  YextField,
  VisibilityWrapper,
} from "@yext/visual-editor";
import {
  resolvedImageFields,
  ImageWrapperFields,
} from "../contentBlocks/Image.js";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/1000x570/png";

export interface PhotoGallerySectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  images: Array<ImageWrapperProps>;
  liveVisibility: boolean;
}

interface DynamicChildColorsProps {
  children: React.ReactElement;
  category: "arrow" | "slide";
}

const DynamicChildColors = ({
  children,
  category,
}: DynamicChildColorsProps) => {
  const background = useBackground();
  const hasDarkBackground = background?.textColor === "text-white";

  const dynamicClasses =
    category === "slide"
      ? hasDarkBackground
        ? "bg-white disabled:bg-gray-400"
        : "bg-palette-primary-dark disabled:bg-gray-400"
      : hasDarkBackground
        ? "text-white disabled:text-gray-400"
        : "text-palette-primary-dark disabled:text-gray-400";

  return cloneElement(children, {
    className: themeManagerCn(children.props.className, dynamicClasses),
  });
};

const photoGallerySectionFields: Fields<PhotoGallerySectionProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
    },
  }),
  sectionHeading: YextField("Section Heading", {
    type: "object",
    objectFields: {
      text: YextField<any, string>("Text", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      level: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  images: YextField("Images", {
    type: "array",
    arrayFields: { ...ImageWrapperFields },
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const PhotoGallerySectionWrapper = ({
  styles,
  sectionHeading: sectionHeadingField,
  images,
}: PhotoGallerySectionProps) => {
  const document = useDocument();
  const sectionHeading = resolveYextEntityField(
    document,
    sectionHeadingField.text
  );

  return (
    <PageSection
      aria-label="Photo Gallery Section"
      background={styles.backgroundColor}
      className="flex flex-col gap-8 justify-center text-center"
    >
      {sectionHeading && (
        <EntityField
          displayName="Heading Text"
          fieldId={sectionHeadingField.text.field}
          constantValueEnabled={sectionHeadingField.text.constantValueEnabled}
        >
          <Heading level={sectionHeadingField.level}>{sectionHeading}</Heading>
        </EntityField>
      )}
      {images && (
        <CarouselProvider
          className="flex flex-col md:flex-row gap-8"
          naturalSlideWidth={100}
          naturalSlideHeight={100}
          totalSlides={images.length}
          isIntrinsicHeight={true}
        >
          <DynamicChildColors category="arrow">
            <ButtonBack className="hidden md:block my-auto pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default">
              <FaArrowLeft className="h-10 w-20" />
            </ButtonBack>
          </DynamicChildColors>
          <div className="flex flex-col gap-8">
            <Slider className="md:px-8">
              {images.map((item, idx) => {
                const resolvedImage = resolveYextEntityField<
                  ImageProps["image"]
                >(document, item.image);
                if (!resolvedImage) return;
                return (
                  <Slide index={idx} key={idx}>
                    <Image
                      image={resolvedImage}
                      layout={item.layout}
                      width={item.width}
                      height={item.height}
                      aspectRatio={item.aspectRatio}
                    />
                  </Slide>
                );
              })}
            </Slider>
            <div className="flex justify-between items-center px-4 md:hidden gap-6 w-full">
              <DynamicChildColors category="arrow">
                <ButtonBack className="pointer-events-auto w-8 h-8 disabled:cursor-default">
                  <FaArrowLeft className="h-6 w-6" />
                </ButtonBack>
              </DynamicChildColors>
              <div className="flex gap-2 justify-center flex-grow w-full">
                {images.map((_, idx) => (
                  <DynamicChildColors category="slide" key={idx}>
                    <Dot
                      slide={idx}
                      className=" h-1.5 w-full rounded-full disabled:cursor-default"
                    />
                  </DynamicChildColors>
                ))}
              </div>
              <DynamicChildColors category="arrow">
                <ButtonNext className="pointer-events-auto w-8 h-8 disabled:cursor-default">
                  <FaArrowRight className="h-6 w-6" />
                </ButtonNext>
              </DynamicChildColors>
            </div>
            <div className="hidden md:flex justify-center">
              {images.map((_, idx) => {
                const afterStyles =
                  "after:content-[' '] after:py-2 after:block";
                return (
                  <div key={idx} className="w-16 flex justify-center">
                    <DynamicChildColors category="slide">
                      <Dot
                        slide={idx}
                        className={`text-center w-16 mx-2 basis-0 flex-grow h-1 rounded-full disabled:cursor-default ${afterStyles}`}
                      ></Dot>
                    </DynamicChildColors>
                  </div>
                );
              })}
            </div>
          </div>
          <DynamicChildColors category="arrow">
            <ButtonNext className="hidden md:block pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default my-auto">
              <FaArrowRight className="h-10 w-20" />
            </ButtonNext>
          </DynamicChildColors>
        </CarouselProvider>
      )}
    </PageSection>
  );
};

export const PhotoGallerySection: ComponentConfig<PhotoGallerySectionProps> = {
  label: "Photo Gallery Section",
  fields: photoGallerySectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Gallery",
        constantValueEnabled: true,
      },
      level: 2,
    },
    images: [
      {
        image: {
          field: "",
          constantValue: {
            alternateText: "Image 1",
            height: 570,
            width: 1000,
            url: PLACEHOLDER_IMAGE_URL,
          },
          constantValueEnabled: true,
        },
        layout: "auto",
        aspectRatio: 1.78,
      },
      {
        image: {
          field: "",
          constantValue: {
            alternateText: "Image 2",
            height: 570,
            width: 1000,
            url: PLACEHOLDER_IMAGE_URL,
          },
          constantValueEnabled: true,
        },
        layout: "auto",
        aspectRatio: 1.78,
      },
    ],
    liveVisibility: true,
  },
  resolveFields(data) {
    const layout = data.props.images?.[0]?.layout ?? "auto";
    return {
      ...photoGallerySectionFields,
      images: {
        ...photoGallerySectionFields.images,
        arrayFields: resolvedImageFields(layout),
      },
    };
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <PhotoGallerySectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
