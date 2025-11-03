import * as React from "react";
import { useTranslation } from "react-i18next";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
} from "@measured/puck";
import {
  useDocument,
  resolveComponentData,
  EntityField,
  YextEntityField,
  Image,
  YextField,
  msg,
  pt,
  imgSizesHelper,
  ImgSizesByBreakpoint,
  resolveDataFromParent,
  AssetImageType,
  themeManagerCn,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { ImageStylingFields, ImageStylingProps } from "./styling.ts";
import { ImagePlus } from "lucide-react";
import {
  TARGET_ORIGINS,
  useSendMessageToParent,
} from "../../../internal/hooks/useMessage";
import { Button } from "../../../internal/puck/ui/button";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface ImageWrapperProps {
  data: {
    /** The image to display. */
    image: YextEntityField<ImageType | ComplexImageType | AssetImageType>;
  };

  /** Size and aspect ratio of the image. */
  styles: ImageStylingProps;

  /** @internal Controlled data from the parent section. */
  parentData?: {
    field: string;
    image: ImageType | ComplexImageType | AssetImageType | undefined;
  };

  /** Additional CSS classes to apply to the image. */
  className?: string;

  sizes?: ImgSizesByBreakpoint;

  hideWidthProp?: boolean;
}

export const ImageWrapperFields: Fields<ImageWrapperProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      image: YextField<any, ImageType | ComplexImageType | AssetImageType>(
        msg("fields.options.image", "Image"),
        {
          type: "entityField",
          filter: {
            types: ["type.image"],
          },
        }
      ),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      ...ImageStylingFields,
    },
  }),
};

const ImageWrapperComponent: PuckComponent<ImageWrapperProps> = (props) => {
  const {
    data,
    styles,
    parentData,
    className,
    puck,
    sizes = {
      base: styles.width ? `min(100vw, width)` : "100vw",
      md: styles.width
        ? `min(width, calc((maxWidth - 32px) / 2))`
        : "maxWidth / 2",
    },
    hideWidthProp,
  } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedImage = parentData
    ? parentData?.image
    : resolveComponentData(data.image, i18n.language, streamDocument);

  const { sendToParent: openImageAssetSelector } = useSendMessageToParent(
    "constantValueEditorOpened",
    TARGET_ORIGINS
  );

  const getImageUrl = (
    image: ImageType | ComplexImageType | AssetImageType | undefined
  ): string | undefined => {
    if (!image) return undefined;
    if ("image" in image) {
      return image.image?.url;
    }
    return (image as ImageType | AssetImageType).url;
  };

  const imageUrl = getImageUrl(resolvedImage);
  const isEmpty =
    !resolvedImage ||
    !imageUrl ||
    (typeof imageUrl === "string" && imageUrl.trim() === "");

  const handleEmptyImageClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (!parentData && data.image.constantValueEnabled && puck.isEditing) {
      /** Handles local development testing outside of Storm */
      if (window.location.href.includes("http://localhost:5173")) {
        const userInput = prompt("Enter Image URL:");
        if (!userInput) {
          return;
        }
      } else {
        /** Instructs Storm to open the image asset selector drawer */
        const messageId = `ImageAsset-${Date.now()}`;
        openImageAssetSelector({
          payload: {
            type: "ImageAsset",
            value: data.image.constantValue as AssetImageType | undefined,
            id: messageId,
          },
        });
      }
    }
  };

  if (isEmpty) {
    return puck.isEditing ? (
      <EntityField
        displayName={pt("fields.image", "Image")}
        fieldId={parentData ? parentData.field : data.image.field}
        constantValueEnabled={!parentData && data.image.constantValueEnabled}
        fullHeight
        ref={puck.dragRef}
      >
        <div className="w-full h-full relative">
          <div
            className={themeManagerCn(
              className ||
                "max-w-full rounded-image-borderRadius w-full h-full",
              "border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden relative"
            )}
            style={{
              ...(hideWidthProp
                ? {}
                : styles.width
                  ? { width: `${styles.width}px` }
                  : {}),
              ...(styles.aspectRatio
                ? { aspectRatio: styles.aspectRatio }
                : {}),
            }}
            onClick={(e) => {
              // Only handle clicks that aren't on the button
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
                handleEmptyImageClick(e);
              }}
              onMouseDown={(e) => {
                // Don't prevent default here - let it become a click
                e.stopPropagation();
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleEmptyImageClick(e as any);
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
        </div>
      </EntityField>
    ) : (
      <></>
    );
  }

  const transformedSizes = imgSizesHelper(sizes, `${styles.width}px`);

  return (
    <EntityField
      displayName={pt("fields.image", "Image")}
      fieldId={parentData ? parentData.field : data.image.field}
      constantValueEnabled={!parentData && data.image.constantValueEnabled}
      fullHeight
      ref={puck.dragRef}
    >
      <div className="w-full h-full">
        <Image
          image={resolvedImage}
          aspectRatio={styles.aspectRatio}
          width={hideWidthProp ? undefined : styles.width}
          className={
            className || "max-w-full rounded-image-borderRadius w-full h-full"
          }
          sizes={transformedSizes}
        />
      </div>
    </EntityField>
  );
};

export const imageDefaultProps = {
  data: {
    image: {
      field: "",
      constantValue: {
        url: PLACEHOLDER_IMAGE_URL,
        height: 360,
        width: 640,
      },
      constantValueEnabled: true,
    },
  },
  styles: {
    aspectRatio: 1.78,
    width: 640,
  },
  allowWidthProp: true,
};

export const ImageWrapper: ComponentConfig<{ props: ImageWrapperProps }> = {
  label: msg("components.image", "Image"),
  inline: true,
  fields: ImageWrapperFields,
  defaultProps: imageDefaultProps,
  resolveFields: (data) => {
    const fields = resolveDataFromParent(ImageWrapperFields, data);

    if (data.props.hideWidthProp) {
      return setDeep(fields, "styles.objectFields.width.visible", false);
    }

    return setDeep(fields, "styles.objectFields.width.visible", true);
  },
  render: (props) => <ImageWrapperComponent {...props} />,
};
