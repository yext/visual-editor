import { useTranslation } from "react-i18next";
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
  TranslatableString,
  resolveTranslatableString,
  msg,
  usePlatformTranslation,
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
  data: {
    heading: YextEntityField<TranslatableString>;
    images: YextEntityField<ImageType[] | ComplexImageType[]>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    headingLevel: HeadingLevel;
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
  styles: YextField(msg("Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(msg("Background Color"), {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      headingLevel: YextField(msg("Heading Level"), {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      imageStyle: YextField(msg("Image Style"), {
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
  data: YextField(msg("Data"), {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>(msg("Heading"), {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      images: YextField<any, ImageType[] | ComplexImageType[]>(msg("Images"), {
        type: "entityField",
        filter: {
          types: ["type.image"],
          includeListsOnly: true,
        },
      }),
    },
  }),
  liveVisibility: YextField(msg("Visible on Live Page"), {
    type: "radio",
    options: [
      { label: msg("Show"), value: true },
      { label: msg("Hide"), value: false },
    ],
  }),
};

const PhotoGallerySectionComponent = ({
  data,
  styles,
}: PhotoGallerySectionProps) => {
  const { t, i18n } = useTranslation();
  const { t: pt } = usePlatformTranslation();
  const document = useDocument();
  const sectionHeading = resolveTranslatableString(
    resolveYextEntityField(document, data.heading),
    i18n.language
  );

  const resolvedImages = resolveYextEntityField(document, data.images);

  const filteredImages: ImageProps[] = (resolvedImages || [])
    .filter((image): image is ImageType | ComplexImageType => !!image)
    .map((image) => ({
      image,
      layout: styles.imageStyle.layout,
      aspectRatio: styles.imageStyle.aspectRatio,
      width: styles.imageStyle.width,
      height: styles.imageStyle.height,
    }));

  return (
    <PageSection
      aria-label={t("photoGallerySection", "Photo Gallery Section")}
      background={styles.backgroundColor}
      className="flex flex-col gap-8 justify-center text-center"
    >
      {sectionHeading && (
        <EntityField
          displayName={pt("headingText", "Heading Text")}
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <Heading level={styles.headingLevel}>{sectionHeading}</Heading>
        </EntityField>
      )}
      {filteredImages && filteredImages.length > 0 && (
        <CarouselProvider
          className="flex flex-col md:flex-row justify-center gap-8"
          naturalSlideWidth={100}
          naturalSlideHeight={100}
          totalSlides={filteredImages.length}
          isIntrinsicHeight={true}
        >
          <DynamicChildColors category="arrow">
            <ButtonBack className="hidden md:block my-auto pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default">
              <FaArrowLeft className="h-10 w-fit" />
            </ButtonBack>
          </DynamicChildColors>
          <div className="flex flex-col gap-y-8">
            <EntityField
              displayName={pt("images", "Images")}
              fieldId={data.images.field}
              constantValueEnabled={data.images.constantValueEnabled}
            >
              <Slider>
                {filteredImages.map((image, idx) => {
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
            </EntityField>
            <div className="flex justify-between items-center px-4 md:hidden gap-6 w-full">
              <DynamicChildColors category="arrow">
                <ButtonBack className="pointer-events-auto w-8 h-8 disabled:cursor-default">
                  <FaArrowLeft className="h-6 w-fit" />
                </ButtonBack>
              </DynamicChildColors>
              <div className="flex gap-2 justify-center flex-grow w-full">
                {filteredImages.map((_, idx) => (
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
              {filteredImages.map((_, idx) => {
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

export const PhotoGallerySection: ComponentConfig<PhotoGallerySectionProps> = {
  label: msg("Photo Gallery Section"),
  fields: photoGallerySectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
      headingLevel: 2,
      imageStyle: {
        layout: "fixed",
        height: 570,
        width: 1000,
        aspectRatio: 1.78,
      },
    },
    data: {
      heading: {
        field: "",
        constantValue: "Gallery",
        constantValueEnabled: true,
      },
      images: {
        field: "",
        constantValue: [DEFAULT_IMAGE, DEFAULT_IMAGE, DEFAULT_IMAGE],
        constantValueEnabled: true,
      },
    },
    liveVisibility: true,
  },
  resolveFields(data, { fields }) {
    const layout = data.props.styles?.imageStyle?.layout ?? "auto";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { image, ...rest } = resolvedImageFields(layout);
    return {
      ...fields,
      styles: {
        ...fields.styles,
        objectFields: {
          // @ts-expect-error ts(2339) objectFields exists
          ...fields.styles.objectFields,
          imageStyle: {
            // @ts-expect-error ts(2339) objectFields exists
            ...fields.styles.objectFields.imageStyle,
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
      <PhotoGallerySectionComponent {...props} />
    </VisibilityWrapper>
  ),
};
