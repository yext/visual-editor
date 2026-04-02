import { ComplexImageType, ImageType } from "@yext/pages-components";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../../contentBlocks/image/styling.ts";
import { EntityField } from "../../../editor/EntityField.tsx";
import { Image } from "../../atoms/image.tsx";
import { themeManagerCn } from "../../../utils/cn.ts";
import { useBackground } from "../../../hooks/useBackground.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import { getThemeColorCssValue } from "../../../utils/colors.ts";
import {
  AssetImageType,
  isLocalizedAssetImage,
  resolveLocalizedAssetImage,
  TranslatableAssetImage,
} from "../../../types/images.ts";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { PLACEHOLDER } from "./PhotoGallerySection.tsx";
import React, { cloneElement } from "react";
import { useTranslation } from "react-i18next";
import { ThemeColor } from "../../../utils/themeConfigOptions.ts";
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
import { Button } from "../../../internal/puck/ui/button.tsx";
import { updateFields } from "../HeroSection.tsx";

export interface PhotoGalleryWrapperProps {
  data: {
    /**
     * The source of the image data, which can be linked to a Yext field or provided as a constant.
     * @defaultValue A list of 3 placeholder images.
     */
    images: YextEntityField<
      | ImageType[]
      | ComplexImageType[]
      | { assetImage: AssetImageType | TranslatableAssetImage }[]
    >;
  };
  styles: {
    /** Styling options for the gallery images, such as aspect ratio. */
    image: ImageStylingProps;

    /**
     * Determines whether carousel images should fill or fit within the frame.
     * @defaultValue "fill"
     */
    imageFillType?: "fill" | "fit";

    /** Accent color used for carousel arrows and slide indicators. */
    accentColor?: ThemeColor;

    /**
     * Number of images to show in carousel variant at once, either 1, 2, or 3.
     * In Mobile view, only 1 image is shown at a time regardless of this setting.
     * @defaultValue 1
     */
    carouselImageCount: number;
  };

  /** @internal */
  parentData?: {
    variant: "gallery" | "carousel";
  };
}

const photoGalleryWrapperFields: Fields<PhotoGalleryWrapperProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      images: YextField<
        any,
        | ImageType[]
        | ComplexImageType[]
        | { assetImage: AssetImageType | TranslatableAssetImage }[]
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
      imageFillType: YextField(msg("fields.imageFillType", "Image Fill Type"), {
        type: "select",
        options: [
          { label: msg("fields.options.fill", "Fill"), value: "fill" },
          { label: msg("fields.options.fit", "Fit"), value: "fit" },
        ],
        visible: false,
      }),
      accentColor: YextField(msg("fields.accentColor", "Accent Color"), {
        type: "select",
        options: "SITE_COLOR",
      }),
      carouselImageCount: YextField(
        msg("fields.carouselImageCount", "Carousel Image Count"),
        {
          type: "radio",
          options: [
            { label: "1", value: 1 },
            { label: "2", value: 2 },
            { label: "3", value: 3 },
          ],
          visible: false,
        }
      ),
    },
  }),
};

interface DynamicChildColorsProps {
  children: React.ReactElement;
  category: "arrow" | "slide";
  accentColor?: ThemeColor;
}

const DynamicChildColors = ({
  children,
  category,
  accentColor,
}: DynamicChildColorsProps) => {
  const background = useBackground();
  const hasDarkBackground = background?.isDarkColor;
  const accentColorValue = getThemeColorCssValue(accentColor?.selectedColor);

  const dynamicClasses = accentColorValue
    ? category === "slide"
      ? "enabled:bg-[var(--accent-color)] disabled:bg-gray-400"
      : "enabled:text-[var(--accent-color)] disabled:text-gray-400"
    : category === "slide"
      ? hasDarkBackground
        ? "bg-white disabled:bg-gray-400"
        : "bg-palette-primary-dark disabled:bg-gray-400"
      : hasDarkBackground
        ? "text-white disabled:text-gray-400"
        : "text-palette-primary-dark disabled:text-gray-400";

  const dynamicStyle = accentColorValue
    ? ({
        "--accent-color": accentColorValue,
      } as React.CSSProperties)
    : undefined;

  return cloneElement(children, {
    className: themeManagerCn(children.props.className, dynamicClasses),
    style: {
      ...children.props.style,
      ...dynamicStyle,
    },
  });
};

type ResolvedGalleryImage = {
  isEmpty: boolean;
  originalIndex: number;
  image: ImageType | AssetImageType;
  aspectRatio?: number;
  width?: number;
  originalImage: unknown;
};

type GalleryRenderProps = {
  allImages: ResolvedGalleryImage[];
  imageWidth: number;
  isEditing: boolean;
  imagesFieldId: string;
  constantValueEnabled?: boolean;
  accentColor?: ThemeColor;
};

const EmptyImage = ({ imageData }: { imageData: ResolvedGalleryImage }) => {
  return (
    <div
      className={themeManagerCn(
        "w-full md:w-auto rounded-image-borderRadius border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden relative"
      )}
      style={{
        aspectRatio: imageData.aspectRatio,
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
        type="button"
        aria-label={pt("addImage", "Add Image")}
      >
        <ImagePlus size={24} className="stroke-2" />
      </Button>
    </div>
  );
};

const DesktopImageItem = ({
  imageData,
  isEditing,
  sizes,
  constrainToParent = false,
  imageFillType = "fill",
}: {
  imageData: ResolvedGalleryImage;
  isEditing: boolean;
  sizes: string;
  constrainToParent?: boolean;
  imageFillType?: "fill" | "fit";
}) => {
  if (imageData.isEmpty && isEditing) {
    return <EmptyImage imageData={imageData} />;
  }

  const imageElement = (
    <Image
      image={imageData.image}
      aspectRatio={imageData.aspectRatio}
      width={imageData.width}
      className={themeManagerCn(
        "rounded-image-borderRadius",
        constrainToParent && "w-full h-auto object-contain max-w-full"
      )}
      sizes={sizes}
      style={{ objectFit: imageFillType === "fit" ? "contain" : "cover" }}
    />
  );

  if (!constrainToParent) {
    return imageElement;
  }

  return (
    <div
      className="w-full max-w-full"
      style={{ maxWidth: `${imageData.width}px` }}
    >
      {imageElement}
    </div>
  );
};

const MobileImageItem = ({
  imageData,
  isEditing,
  imageFillType = "fill",
}: {
  imageData: ResolvedGalleryImage;
  isEditing: boolean;
  imageFillType?: "fill" | "fit";
}) => {
  if (imageData.isEmpty && isEditing) {
    return <EmptyImage imageData={imageData} />;
  }

  return (
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
        sizes={`100vw`}
        style={{ objectFit: imageFillType === "fit" ? "contain" : "cover" }}
      />
    </div>
  );
};

const DesktopCarousel = ({
  allImages,
  imageWidth,
  carouselImageCount,
  isEditing,
  imagesFieldId,
  constantValueEnabled,
  accentColor,
  imageFillType = "fill",
}: GalleryRenderProps & {
  carouselImageCount: number;
  imageFillType?: "fill" | "fit";
}) => {
  const hasCarouselGap = carouselImageCount > 1;
  return (
    <div className="hidden md:flex justify-center w-full">
      <div className="flex items-center justify-center max-w-full gap-2">
        <DynamicChildColors category="arrow" accentColor={accentColor}>
          <ButtonBack className="my-auto pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default">
            <FaArrowLeft className="h-10 w-fit" />
          </ButtonBack>
        </DynamicChildColors>
        <div className="flex flex-col gap-y-8 items-center max-w-full w-full overflow-hidden">
          <EntityField
            displayName={pt("fields.images", "Images")}
            fieldId={imagesFieldId}
            constantValueEnabled={constantValueEnabled}
            className="max-w-full"
          >
            <Slider
              className="w-auto max-w-full"
              style={{
                maxWidth: "100%",
              }}
            >
              {allImages.map((imageData, idx) => {
                return (
                  <Slide index={idx} key={idx}>
                    <div
                      className={themeManagerCn(
                        "flex justify-center",
                        hasCarouselGap && "px-4"
                      )}
                    >
                      <DesktopImageItem
                        imageData={imageData}
                        isEditing={isEditing}
                        sizes={`min(${imageWidth}px, calc((100vw - 6rem) / ${carouselImageCount}))`}
                        constrainToParent
                        imageFillType={imageFillType}
                      />
                    </div>
                  </Slide>
                );
              })}
            </Slider>
          </EntityField>
          <div className="hidden md:flex justify-center w-full max-w-full gap-2">
            {allImages.length < 20 &&
              allImages.map((_, idx) => {
                const afterStyles =
                  "after:content-[' '] after:py-2 after:block";
                return (
                  <div
                    key={idx}
                    className="flex flex-1 min-w-6 max-w-16 justify-center"
                  >
                    <DynamicChildColors
                      category="slide"
                      accentColor={accentColor}
                    >
                      <Dot
                        slide={idx}
                        className={`text-center w-full h-1.5 rounded-full disabled:cursor-default ${afterStyles}`}
                      />
                    </DynamicChildColors>
                  </div>
                );
              })}
          </div>
        </div>
        <DynamicChildColors category="arrow" accentColor={accentColor}>
          <ButtonNext className="pointer-events-auto w-8 h-8 sm:w-10 sm:h-10 disabled:cursor-default my-auto">
            <FaArrowRight className="h-10 w-fit" />
          </ButtonNext>
        </DynamicChildColors>
      </div>
    </div>
  );
};

const MobileCarousel = ({
  allImages,
  isEditing,
  imagesFieldId,
  constantValueEnabled,
  accentColor,
  imageFillType = "fill",
}: GalleryRenderProps & { imageFillType?: "fill" | "fit" }) => {
  return (
    <div className="flex flex-col gap-y-8 items-center justify-center md:hidden w-full">
      <EntityField
        displayName={pt("fields.images", "Images")}
        fieldId={imagesFieldId}
        constantValueEnabled={constantValueEnabled}
        className="max-w-full"
      >
        <Slider className="w-full">
          {allImages.map((imageData, idx) => {
            return (
              <Slide index={idx} key={idx}>
                <div className="flex justify-center w-full max-w-full px-4">
                  <MobileImageItem
                    imageData={imageData}
                    isEditing={isEditing}
                    imageFillType={imageFillType}
                  />
                </div>
              </Slide>
            );
          })}
        </Slider>
      </EntityField>
      <div className="flex justify-between items-center px-4 gap-6 w-full">
        <DynamicChildColors category="arrow" accentColor={accentColor}>
          <ButtonBack className="pointer-events-auto w-8 h-8 disabled:cursor-default">
            <FaArrowLeft className="h-6 w-fit" />
          </ButtonBack>
        </DynamicChildColors>
        <div className="flex gap-2 justify-center flex-grow w-full">
          {allImages.map((_, idx) => (
            <DynamicChildColors
              category="slide"
              key={idx}
              accentColor={accentColor}
            >
              <Dot
                slide={idx}
                className="h-1.5 w-full rounded-full disabled:cursor-default"
              />
            </DynamicChildColors>
          ))}
        </div>
        <DynamicChildColors category="arrow" accentColor={accentColor}>
          <ButtonNext className="pointer-events-auto w-8 h-8 disabled:cursor-default">
            <FaArrowRight className="h-6 w-fit" />
          </ButtonNext>
        </DynamicChildColors>
      </div>
    </div>
  );
};

const GalleryGrid = ({
  allImages,
  imageWidth,
  isEditing,
  imagesFieldId,
  constantValueEnabled,
}: GalleryRenderProps) => {
  return (
    <EntityField
      displayName={pt("fields.images", "Images")}
      fieldId={imagesFieldId}
      constantValueEnabled={constantValueEnabled}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {allImages.map((imageData, idx) => (
          <div key={idx} className="flex justify-center">
            <DesktopImageItem
              imageData={imageData}
              isEditing={isEditing}
              sizes={`(min-width: 1024px) min(${imageWidth}px, calc((100vw - 6rem) / 3)), (min-width: 640px) min(${imageWidth}px, calc((100vw - 4rem) / 2)), min(${imageWidth}px, 100vw)`}
            />
          </div>
        ))}
      </div>
    </EntityField>
  );
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
      imageFillType: "fill",
      carouselImageCount: 1,
    },
  },
  resolveFields: (data) => {
    const isCarousel = data.props.parentData?.variant === "carousel";
    return updateFields(
      photoGalleryWrapperFields,
      [
        "styles.objectFields.carouselImageCount.visible",
        "styles.objectFields.imageFillType.visible",
        "styles.objectFields.accentColor.visible",
      ],
      isCarousel
    );
  },
  render: (props) => <PhotoGalleryWrapperComponent {...props} />,
};

const PhotoGalleryWrapperComponent: PuckComponent<PhotoGalleryWrapperProps> = ({
  data,
  styles,
  parentData,
  puck,
}) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();

  const containerRef = React.useRef(null);
  const [visibleSlides, setVisibleSlides] = React.useState(
    styles.carouselImageCount
  );

  const resolvedImages = resolveComponentData(
    data.images,
    locale,
    streamDocument
  );

  const allImages = (resolvedImages || [])
    .map((rawImage, originalIndex) => {
      let image: ImageType | AssetImageType | undefined;
      let altText = "";

      if ("assetImage" in rawImage) {
        if (isLocalizedAssetImage(rawImage.assetImage)) {
          image = resolveLocalizedAssetImage(rawImage.assetImage, locale);
          altText = resolveComponentData(
            image?.alternateText ?? "",
            locale,
            streamDocument
          );
        } else {
          image = rawImage.assetImage;
          altText = resolveComponentData(
            rawImage.assetImage?.alternateText ?? "",
            locale,
            streamDocument
          );
        }
      } else if ("image" in rawImage) {
        image = rawImage.image;
        altText = rawImage.image?.alternateText ?? "";
      } else {
        image = rawImage;
        altText = rawImage.alternateText ?? "";
      }

      const url = image?.url;
      const isEmpty = !url || (typeof url === "string" && url.trim() === "");

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
              url: url,
              alternateText: altText,
              height:
                "height" in rawImage && rawImage.height ? rawImage.height : 570,
              width:
                "width" in rawImage && rawImage.width ? rawImage.width : 1000,
            },
        aspectRatio: styles.image?.aspectRatio,
        width: styles.image?.width || 1000,
        originalImage: rawImage,
      };
    })
    .filter((i) => puck?.isEditing || !i.isEmpty);

  const hasAnyImages = allImages.length > 0;
  const imageWidth = styles.image?.width || 1000;

  const isEditing = Boolean(puck?.isEditing);
  const sharedRenderProps: GalleryRenderProps = {
    allImages,
    imageWidth,
    isEditing,
    imagesFieldId: data.images.field,
    constantValueEnabled: data.images.constantValueEnabled,
    accentColor: styles.accentColor,
  };

  // Update visibleSlides based on container width
  // Mobile view always shows 1 slide
  React.useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;

        if (width < 750) {
          setVisibleSlides(1);
        } else {
          setVisibleSlides(styles.carouselImageCount);
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [styles.carouselImageCount]);

  return (
    <div ref={containerRef}>
      {hasAnyImages ? (
        parentData?.variant === "gallery" ? (
          <GalleryGrid {...sharedRenderProps} />
        ) : (
          <CarouselProvider
            className="flex flex-col gap-8"
            naturalSlideWidth={100}
            naturalSlideHeight={100}
            totalSlides={allImages.length}
            visibleSlides={visibleSlides}
            isIntrinsicHeight={true}
          >
            <DesktopCarousel
              {...sharedRenderProps}
              carouselImageCount={styles.carouselImageCount}
              imageFillType={styles.imageFillType ?? "fill"}
            />
            <MobileCarousel
              {...sharedRenderProps}
              imageFillType={styles.imageFillType ?? "fill"}
            />
          </CarouselProvider>
        )
      ) : puck?.isEditing ? (
        <div className="h-24"></div>
      ) : (
        <></>
      )}
    </div>
  );
};
