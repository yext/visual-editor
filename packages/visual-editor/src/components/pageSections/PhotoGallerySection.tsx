import { useTranslation } from "react-i18next";
import React, { cloneElement } from "react";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
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
  Image,
  ImageProps,
  PageSection,
  themeManagerCn,
  useBackground,
  useDocument,
  YextEntityField,
  YextField,
  VisibilityWrapper,
  msg,
  pt,
  resolveComponentData,
  HeadingTextProps,
} from "@yext/visual-editor";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/image/styling.ts";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { AssetImageType } from "../../types/images";

const PLACEHOLDER_WIDTH = 1000;
const PLACEHOLDER_HEIGHT = 570;
const PLACEHOLDER_IMAGE_URL = `https://placehold.co/${PLACEHOLDER_WIDTH}x${PLACEHOLDER_HEIGHT}/png`;
const PLACEHOLDER: AssetImageType = {
  url: PLACEHOLDER_IMAGE_URL,
  width: PLACEHOLDER_WIDTH,
  height: PLACEHOLDER_HEIGHT,
  assetImage: {
    name: "Placeholder",
  },
};

export interface PhotoGalleryData {
  /**
   * The source of the image data, which can be linked to a Yext field or provided as a constant.
   * @defaultValue A list of 3 placeholder images.
   */
  images: YextEntityField<
    ImageType[] | ComplexImageType[] | { assetImage: AssetImageType }[]
  >;
}

export interface PhotoGalleryStyles {
  /**
   * The background color for the entire section, selected from the theme.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /** Styling options for the gallery images, such as aspect ratio. */
  image: ImageStylingProps;
}

export interface PhotoGallerySectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: PhotoGalleryData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: PhotoGalleryStyles;

  /** @internal */
  slots: {
    HeadingSlot: Slot;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
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
      images: YextField<
        any,
        ImageType[] | ComplexImageType[] | { assetImage: AssetImageType }[]
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
      image: YextField(msg("fields.image", "Image"), {
        type: "object",
        objectFields: ImageStylingFields,
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      HeadingSlot: { type: "slot" },
    },
    visible: false,
  },
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

const PhotoGallerySectionComponent: PuckComponent<PhotoGallerySectionProps> = ({
  data,
  styles,
  slots,
}) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();

  const resolvedImages = resolveComponentData(
    data.images,
    locale,
    streamDocument
  );

  const filteredImages: ImageProps[] =
    resolvedImages?.map((image) => {
      let url = "",
        altText = "";
      if ("assetImage" in image) {
        url = image.assetImage.url;
        altText = resolveComponentData(
          image.assetImage.alternateText ?? "",
          locale,
          streamDocument
        );
      } else if ("image" in image) {
        url = image.image.url;
        altText = resolveComponentData(
          image.image.alternateText ?? "",
          locale,
          streamDocument
        );
      } else {
        altText = resolveComponentData(
          image.alternateText ?? "",
          locale,
          streamDocument
        );
        url = image.url;
      }
      return {
        image: {
          url,
          alternateText: altText,
          height: "height" in image && image.height ? image.height : 570,
          width: "width" in image && image.width ? image.width : 1000,
        },
        aspectRatio: styles.image.aspectRatio,
        width: styles.image.width || 1000,
      };
    }) ?? [];

  return (
    <PageSection
      aria-label={t("photoGallerySection", "Photo Gallery Section")}
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      <slots.HeadingSlot style={{ height: "auto" }} allow={[]} />
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
                maxWidth: "calc(100vw - 2rem)",
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
                    style={{
                      width: `min(${styles.image.width || 1000}px, calc(100vw - 6rem))`,
                      maxWidth: "100%",
                    }}
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
                              sizes={`min(${styles.image.width || 1000}px, calc(100vw - 6rem))`}
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
          <div className="flex flex-col gap-y-8 items-center justify-center md:hidden w-full">
            <EntityField
              displayName={pt("fields.images", "Images")}
              fieldId={data.images.field}
              constantValueEnabled={data.images.constantValueEnabled}
            >
              <Slider className="w-full">
                {filteredImages.map((image, idx) => {
                  return (
                    <Slide index={idx} key={idx}>
                      <div className="flex justify-center w-full px-4">
                        <div
                          className="w-full max-w-full overflow-hidden"
                          style={{
                            maxWidth: `${Math.min(image.width || 1000, 250)}px`,
                            width: "100%",
                          }}
                        >
                          <Image
                            image={image.image}
                            aspectRatio={image.aspectRatio}
                            className="w-full h-auto object-contain"
                            sizes={`${Math.min(image.width || 1000, 250)}px`}
                          />
                        </div>
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

/**
 * The Photo Gallery Section is designed to display a collection of images in a visually appealing format. It consists of a main heading for the section and a flexible grid of images, with options for styling the image presentation.
 * Available on Location templates.
 */
export const PhotoGallerySection: ComponentConfig<{
  props: PhotoGallerySectionProps;
}> = {
  label: msg("components.photoGallerySection", "Photo Gallery Section"),
  fields: photoGallerySectionFields,
  defaultProps: {
    data: {
      images: {
        field: "",
        constantValue: [
          { assetImage: PLACEHOLDER },
          { assetImage: PLACEHOLDER },
          { assetImage: PLACEHOLDER },
        ],
        constantValueEnabled: true,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      image: {
        aspectRatio: 1.78,
      },
    },
    slots: {
      HeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                field: "",
                constantValue: {
                  en: "Gallery",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              level: 2,
              align: "left",
            },
          } satisfies HeadingTextProps,
        },
      ],
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
