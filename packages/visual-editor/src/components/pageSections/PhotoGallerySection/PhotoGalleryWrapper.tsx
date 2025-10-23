import { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../../contentBlocks/image/styling.ts";
import {
  EntityField,
  Image,
  ImageProps,
  themeManagerCn,
  useBackground,
  useDocument,
  YextEntityField,
  YextField,
  msg,
  pt,
  resolveComponentData,
} from "@yext/visual-editor";
import { AssetImageType } from "../../../types/images";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import { PLACEHOLDER } from "./PhotoGallerySection.tsx";
import React, { cloneElement } from "react";
import { useTranslation } from "react-i18next";
import {
  CarouselProvider,
  Slider,
  Slide,
  ButtonBack,
  ButtonNext,
  Dot,
} from "pure-react-carousel";
import "pure-react-carousel/dist/react-carousel.es.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

export interface PhotoGalleryWrapperProps {
  data: {
    /**
     * The source of the image data, which can be linked to a Yext field or provided as a constant.
     * @defaultValue A list of 3 placeholder images.
     */
    images: YextEntityField<
      ImageType[] | ComplexImageType[] | { assetImage: AssetImageType }[]
    >;
  };
  styles: {
    /** Styling options for the gallery images, such as aspect ratio. */
    image: ImageStylingProps;
  };
}

const photoGalleryWrapperFields: Fields<PhotoGalleryWrapperProps> = {
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
      image: YextField(msg("fields.image", "Image"), {
        type: "object",
        objectFields: ImageStylingFields,
      }),
    },
  }),
};

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

export const PhotoGalleryWrapper: ComponentConfig<{
  props: PhotoGalleryWrapperProps;
}> = {
  label: msg("components.gallery", "Gallery"),
  fields: photoGalleryWrapperFields,
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
      image: {
        aspectRatio: 1.78,
      },
    },
  },
  render: (props) => <PhotoGalleryWrapperComponent {...props} />,
};

const PhotoGalleryWrapperComponent: PuckComponent<PhotoGalleryWrapperProps> = ({
  data,
  styles,
  puck,
}) => {
  const { i18n } = useTranslation();
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
        aspectRatio: styles.image?.aspectRatio,
        width: styles.image?.width || 1000,
      };
    }) ?? [];

  return (
    <>
      {filteredImages && filteredImages.length > 0 ? (
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
                width: `${(styles.image?.width || 1000) + 96}px`,
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
                      width: `min(${styles.image?.width || 1000}px, calc(100vw - 6rem))`,
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
      ) : puck?.isEditing ? (
        <div className="h-50"></div>
      ) : (
        <></>
      )}
    </>
  );
};
