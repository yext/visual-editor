import { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../../contentBlocks/image/styling.ts";
import {
  EntityField,
  Image,
  themeManagerCn,
  useBackground,
  useDocument,
  YextEntityField,
  YextField,
  msg,
  pt,
  resolveComponentData,
  AssetImageType,
} from "@yext/visual-editor";
import { AssetImageType as AssetImageTypeImport } from "../../../types/images";
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
import { ImagePlus } from "lucide-react";
import { Button } from "../../../internal/puck/ui/button";
import {
  TARGET_ORIGINS,
  useSendMessageToParent,
} from "../../../internal/hooks/useMessage";

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

  const { sendToParent: openImageAssetSelector } = useSendMessageToParent(
    "constantValueEditorOpened",
    TARGET_ORIGINS
  );

  const resolvedImages = resolveComponentData(
    data.images,
    locale,
    streamDocument
  );

  const getImageUrl = (image: any): string | undefined => {
    if (!image) return undefined;
    if ("assetImage" in image) {
      return image.assetImage?.url;
    }
    if ("image" in image) {
      return image.image?.url;
    }
    return image.url;
  };

  const allImages = (resolvedImages || []).map(
    (image: any, originalIndex: number) => {
      const url = getImageUrl(image);
      const isEmpty = !url || (typeof url === "string" && url.trim() === "");

      let altText = "";
      if ("assetImage" in image) {
        altText = resolveComponentData(
          image.assetImage?.alternateText ?? "",
          locale,
          streamDocument
        );
      } else if ("image" in image) {
        altText = resolveComponentData(
          image.image?.alternateText ?? "",
          locale,
          streamDocument
        );
      } else {
        altText = resolveComponentData(
          image.alternateText ?? "",
          locale,
          streamDocument
        );
      }

      return {
        isEmpty,
        originalIndex,
        image: isEmpty
          ? {
              url: "",
              alternateText: altText,
              height: 570,
              width: 1000,
            }
          : {
              url,
              alternateText: altText,
              height: "height" in image && image.height ? image.height : 570,
              width: "width" in image && image.width ? image.width : 1000,
            },
        aspectRatio: styles.image?.aspectRatio,
        width: styles.image?.width || 1000,
        originalImage: image,
      };
    }
  );

  const handleEmptyImageClick = (
    e: React.MouseEvent | undefined,
    index: number
  ) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (data.images.constantValueEnabled && puck?.isEditing) {
      if (window.location.href.includes("http://localhost:5173")) {
        const userInput = prompt("Enter Image URL:");
        if (!userInput) return;
      } else {
        const messageId = `ImageAsset-${Date.now()}-${index}`;
        const currentImageValue = Array.isArray(data.images.constantValue)
          ? data.images.constantValue[index]
          : undefined;
        const assetImageValue =
          currentImageValue && "assetImage" in currentImageValue
            ? (currentImageValue as { assetImage?: AssetImageTypeImport })
                .assetImage
            : undefined;
        openImageAssetSelector({
          payload: {
            type: "ImageAsset",
            value: assetImageValue,
            id: messageId,
          },
        });
      }
    }
  };

  const hasAnyImages = allImages.length > 0;
  const imageWidth = styles.image?.width || 1000;

  const renderImageOrEmpty = (imageData: (typeof allImages)[0]) => {
    if (imageData.isEmpty && puck?.isEditing) {
      return (
        <div
          className={themeManagerCn(
            "rounded-image-borderRadius border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden relative"
          )}
          style={{
            width: `${imageData.width}px`,
            aspectRatio: imageData.aspectRatio,
          }}
          onClick={(e) => {
            // Only handle clicks that aren't on the button
            const target = e.target as HTMLElement;
            const isButton = target.closest('button[aria-label*="Add Image"]');
            if (isButton) {
              return;
            }
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 hover:bg-transparent !z-[100] pointer-events-auto"
            style={{
              position: "absolute",
              zIndex: 100,
              inset: "50%",
              transform: "translate(-50%, -50%)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleEmptyImageClick(e, imageData.originalIndex);
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleEmptyImageClick(e as any, imageData.originalIndex);
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
            }}
            type="button"
            aria-label={pt("addImage", "Add Image")}
          >
            <ImagePlus size={24} className="stroke-2" />
          </Button>
        </div>
      );
    }
    return (
      <Image
        image={imageData.image}
        aspectRatio={imageData.aspectRatio}
        width={imageData.width}
        className="rounded-image-borderRadius"
        sizes={`min(${imageWidth}px, calc(100vw - 6rem))`}
      />
    );
  };

  return (
    <>
      {hasAnyImages ? (
        <CarouselProvider
          className="flex flex-col gap-8"
          naturalSlideWidth={100}
          naturalSlideHeight={100}
          totalSlides={allImages.length}
          isIntrinsicHeight={true}
        >
          <div className="hidden md:flex justify-center w-full">
            <div
              className="flex items-center gap-2"
              style={{
                width: `${imageWidth + 96}px`,
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
                      width: `min(${imageWidth}px, calc(100vw - 6rem))`,
                      maxWidth: "100%",
                    }}
                  >
                    {allImages.map((imageData, idx) => {
                      return (
                        <Slide index={idx} key={idx}>
                          <div className="flex justify-center">
                            {renderImageOrEmpty(imageData)}
                          </div>
                        </Slide>
                      );
                    })}
                  </Slider>
                </EntityField>
                <div className="hidden md:flex justify-center">
                  {allImages.map((_, idx) => {
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
                {allImages.map((imageData, idx) => {
                  return (
                    <Slide index={idx} key={idx}>
                      <div className="flex justify-center w-full px-4">
                        {imageData.isEmpty && puck?.isEditing ? (
                          <div
                            className={themeManagerCn(
                              "w-full max-w-full rounded-image-borderRadius border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden relative"
                            )}
                            style={{
                              maxWidth: `${Math.min(imageData.width || 1000, 250)}px`,
                              width: "100%",
                              aspectRatio: imageData.aspectRatio,
                            }}
                            onClick={(e) => {
                              const target = e.target as HTMLElement;
                              const isButton = target.closest(
                                'button[aria-label*="Add Image"]'
                              );
                              if (isButton) {
                                return;
                              }
                            }}
                          >
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-gray-600 hover:bg-transparent !z-[100] pointer-events-auto"
                              style={{
                                position: "absolute",
                                zIndex: 100,
                                inset: "50%",
                                transform: "translate(-50%, -50%)",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleEmptyImageClick(
                                  e,
                                  imageData.originalIndex
                                );
                              }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                              }}
                              onMouseUp={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                handleEmptyImageClick(
                                  e as any,
                                  imageData.originalIndex
                                );
                              }}
                              onPointerDown={(e) => {
                                e.stopPropagation();
                              }}
                              type="button"
                              aria-label={pt("addImage", "Add Image")}
                            >
                              <ImagePlus size={24} className="stroke-2" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="w-full max-w-full overflow-hidden"
                            style={{
                              maxWidth: `${Math.min(imageData.width || 1000, 250)}px`,
                              width: "100%",
                            }}
                          >
                            <Image
                              image={imageData.image}
                              aspectRatio={imageData.aspectRatio}
                              className="w-full h-auto object-contain"
                              sizes={`${Math.min(imageData.width || 1000, 250)}px`}
                            />
                          </div>
                        )}
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
                {allImages.map((_, idx) => (
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
