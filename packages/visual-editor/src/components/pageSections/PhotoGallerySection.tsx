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
import { ComplexImageType, ImageType } from "@yext/pages-components";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/1000x570/png";

const DEFAULT_IMAGE = {
  height: 570,
  width: 1000,
  url: PLACEHOLDER_IMAGE_URL,
};

export interface PhotoGallerySectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  images: {
    images: YextEntityField<ImageType[] | ComplexImageType[]>;
    imageStyle: Omit<ImageWrapperProps, "image">;
  };
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
    type: "object",
    objectFields: {
      images: YextField<any, ImageType[] | ComplexImageType[]>("Images", {
        type: "entityField",
        filter: {
          types: ["type.image"],
          includeListsOnly: true,
        },
      }),
      imageStyle: YextField("Style", {
        type: "object",
        objectFields: {
          layout: ImageWrapperFields.layout,
          aspectRatio: ImageWrapperFields.aspectRatio,
          height: ImageWrapperFields.height,
          width: ImageWrapperFields.width,
        },
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

type PhotoGallerySectionComponentProps = {
  backgroundColor: PhotoGallerySectionProps["styles"]["backgroundColor"];
  sectionHeading: {
    text?: string;
    level: HeadingLevel;
    field: PhotoGallerySectionProps["sectionHeading"]["text"];
  };
  images?: ImageProps[];
};

const PhotoGallerySectionComponent = ({
  backgroundColor,
  sectionHeading,
  images,
}: PhotoGallerySectionComponentProps) => {
  return (
    <PageSection
      aria-label="Photo Gallery Section"
      background={backgroundColor}
      className="flex flex-col gap-8 justify-center text-center"
    >
      {sectionHeading.text && (
        <EntityField
          displayName="Heading Text"
          fieldId={sectionHeading.field.field}
          constantValueEnabled={sectionHeading.field.constantValueEnabled}
        >
          <Heading level={sectionHeading.level}>{sectionHeading.text}</Heading>
        </EntityField>
      )}
      {images && images?.length > 0 && (
        <CarouselProvider
          className="flex flex-col md:flex-row justify-center gap-8"
          naturalSlideWidth={100}
          naturalSlideHeight={100}
          totalSlides={images.length}
          isIntrinsicHeight={true}
        >
          <DynamicChildColors category="arrow">
            <ButtonBack className="hidden md:block my-auto pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default">
              <FaArrowLeft className="h-10 w-fit" />
            </ButtonBack>
          </DynamicChildColors>
          <div className="flex flex-col gap-y-8">
            <Slider>
              {images.map((image, idx) => {
                return (
                  <Slide index={idx} key={idx}>
                    <Image
                      image={image.image}
                      layout={image.layout}
                      aspectRatio={image.aspectRatio}
                      height={image.height}
                      width={image.width}
                    />
                  </Slide>
                );
              })}
            </Slider>
            <div className="flex justify-between items-center px-4 md:hidden gap-6 w-full">
              <DynamicChildColors category="arrow">
                <ButtonBack className="pointer-events-auto w-8 h-8 disabled:cursor-default">
                  <FaArrowLeft className="h-6 w-fit" />
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
                  <FaArrowRight className="h-6 w-fit" />
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
              <FaArrowRight className="h-10 w-fit" />
            </ButtonNext>
          </DynamicChildColors>
        </CarouselProvider>
      )}
    </PageSection>
  );
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

  const resolvedImages = resolveYextEntityField(document, images.images);

  const filteredImages: ImageProps[] = (resolvedImages || [])
    .filter((image): image is ImageType | ComplexImageType => !!image)
    .map((image) => ({
      image,
      layout: images.imageStyle.layout,
      aspectRatio: images.imageStyle.aspectRatio,
      width: images.imageStyle.width,
      height: images.imageStyle.height,
    }));

  return (
    <PhotoGallerySectionComponent
      backgroundColor={styles.backgroundColor}
      images={filteredImages}
      sectionHeading={{
        text: sectionHeading,
        level: sectionHeadingField.level,
        field: sectionHeadingField.text,
      }}
    />
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
    images: {
      images: {
        field: "",
        constantValue: [DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE],
        constantValueEnabled: true,
      },
      imageStyle: {
        layout: "fixed",
        height: 570,
        width: 1000,
        aspectRatio: 1.78,
      },
    },
    liveVisibility: true,
  },
  resolveFields(data, { fields }) {
    const layout = data.props.images?.imageStyle?.layout ?? "auto";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image, ...rest } = resolvedImageFields(layout);
    return {
      ...fields,
      images: {
        ...fields.images,
        objectFields: {
          // @ts-expect-error ts(2339) objectFields exists
          ...fields.images.objectFields,
          imageStyle: {
            // @ts-expect-error ts(2339) objectFields exists
            ...fields.images.objectFields.imageStyle,
            objectFields: rest,
          },
        },
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
