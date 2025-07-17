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
  pt,
  ThemeOptions,
} from "@yext/visual-editor";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/ImageStyling.js";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { GalleryImageType } from "../../types/types";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/1000x570/png";

export interface PhotoGallerySectionProps {
  data: {
    heading: YextEntityField<TranslatableString>;
    images: YextEntityField<
      ImageType[] | ComplexImageType[] | GalleryImageType[]
    >;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    heading: {
      level: HeadingLevel;
      align: "left" | "center" | "right";
    };
    image: ImageStylingProps;
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
  const hasDarkBackground = background?.isDarkBackground;

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
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>(
        msg("fields.heading", "Heading"),
        {
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        }
      ),
      images: YextField<
        any,
        ImageType[] | ComplexImageType[] | GalleryImageType[]
      >(msg("fields.images", "Images"), {
        type: "entityField",
        filter: {
          types: ["type.image"],
          includeListsOnly: true,
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.level", "Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          align: YextField(msg("fields.headingAlign", "Heading Align"), {
            type: "radio",
            options: ThemeOptions.ALIGNMENT,
          }),
        },
      }),
      image: YextField(msg("fields.image", "Image"), {
        type: "object",
        objectFields: ImageStylingFields,
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: true },
      ],
    }
  ),
};

const PhotoGallerySectionComponent = ({
  data,
  styles,
}: PhotoGallerySectionProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const document = useDocument();
  const sectionHeading = resolveTranslatableString(
    resolveYextEntityField(document, data.heading, locale),
    i18n.language
  );

  const resolvedImages = resolveYextEntityField(document, data.images, locale);

  const filteredImages: ImageProps[] = (resolvedImages || [])
    .filter(
      (image): image is ImageType | ComplexImageType | GalleryImageType =>
        !!image
    )
    .map((image) => ({
      image: {
        ...image,
        height: "height" in image && image.height ? image.height : 570,
        width: "width" in image && image.width ? image.width : 1000,
      },
      aspectRatio: styles.image.aspectRatio,
      width: styles.image.width || 1000,
    }));

  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[styles.heading.align];

  return (
    <PageSection
      aria-label={t("photoGallerySection", "Photo Gallery Section")}
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {sectionHeading && (
        <EntityField
          displayName={pt("fields.headingText", "Heading Text")}
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <div className={`flex ${justifyClass}`}>
            <Heading level={styles.heading.level}>{sectionHeading}</Heading>
          </div>
        </EntityField>
      )}
      {filteredImages && filteredImages.length > 0 && (
        <CarouselProvider
          className="flex flex-col gap-8"
          naturalSlideWidth={100}
          naturalSlideHeight={100}
          totalSlides={filteredImages.length}
          isIntrinsicHeight={true}
        >
          <div className="hidden md:flex justify-center w-full">
            <div
              className="flex items-center gap-2"
              style={{
                width: `${(styles.image.width || 1000) + 96}px`,
                maxWidth: "100%",
                minWidth: "fit-content",
              }}
            >
              <DynamicChildColors category="arrow">
                <ButtonBack className="my-auto pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default">
                  <FaArrowLeft className="h-10 w-fit" />
                </ButtonBack>
              </DynamicChildColors>
              <div className="flex flex-col gap-y-8 items-center w-auto">
                <EntityField
                  displayName={pt("fields.images", "Images")}
                  fieldId={data.images.field}
                  constantValueEnabled={data.images.constantValueEnabled}
                >
                  <Slider
                    className="w-auto"
                    style={{ width: styles.image.width || 1000 }}
                  >
                    {filteredImages.map((image, idx) => {
                      return (
                        <Slide index={idx} key={idx}>
                          <div className="flex justify-center">
                            <Image
                              image={image.image}
                              aspectRatio={image.aspectRatio}
                              width={image.width}
                              className="rounded-image-borderRadius"
                            />
                          </div>
                        </Slide>
                      );
                    })}
                  </Slider>
                </EntityField>
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
                <ButtonNext className="pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default my-auto">
                  <FaArrowRight className="h-10 w-fit" />
                </ButtonNext>
              </DynamicChildColors>
            </div>
          </div>
          <div className="flex flex-col gap-y-8 items-center justify-center md:hidden">
            <EntityField
              displayName={pt("fields.images", "Images")}
              fieldId={data.images.field}
              constantValueEnabled={data.images.constantValueEnabled}
            >
              <Slider>
                {filteredImages.map((image, idx) => {
                  return (
                    <Slide index={idx} key={idx}>
                      <div className="flex justify-center">
                        <Image
                          image={image.image}
                          aspectRatio={image.aspectRatio}
                          width={image.width}
                        />
                      </div>
                    </Slide>
                  );
                })}
              </Slider>
            </EntityField>
            <div className="flex justify-between items-center px-4 gap-6 w-full">
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
          </div>
        </CarouselProvider>
      )}
    </PageSection>
  );
};

export const PhotoGallerySection: ComponentConfig<PhotoGallerySectionProps> = {
  label: msg("components.photoGallerySection", "Photo Gallery Section"),
  fields: photoGallerySectionFields,
  defaultProps: {
    data: {
      heading: {
        field: "",
        constantValue: { en: "Gallery", hasLocalizedValue: "true" },
        constantValueEnabled: true,
      },
      images: {
        field: "",
        constantValue: [
          { url: PLACEHOLDER_IMAGE_URL },
          { url: PLACEHOLDER_IMAGE_URL },
          { url: PLACEHOLDER_IMAGE_URL },
        ],
        constantValueEnabled: true,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      heading: {
        level: 2,
        align: "left",
      },
      image: {
        aspectRatio: 1.78,
      },
    },
    liveVisibility: true,
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
