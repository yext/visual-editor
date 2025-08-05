import { CustomField } from "@measured/puck";
import { ImageType } from "@yext/pages-components";

import { pt } from "@yext/visual-editor";
import * as React from "react";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../../hooks/useMessage";

/** Describes an image's aspect ratio. */
interface ImageAspectRatio {
  horizontalFactor: number;
  verticalFactor: number;
}

/** Describes the dimensions of an image. */
interface ImageDimension {
  width: number;
  height: number;
}

/** Describes the data corresponding to a single image. */
interface ImageData {
  url: string;
  dimension?: ImageDimension; // Undefined for private urls
  exifMetadata?: {
    rotate: number;
  };
}

/** Describes the data corresponding to an image rotation. */
interface ImageRotation {
  degree: number;
}

/** Describes the crop boundary box data */
interface ImageCrop {
  left: number;
  top: number;
  height: number;
  width: number;
  aspectRatio?: ImageAspectRatio;
}

type TransformKind = "CROP" | "ROTATION";

/** Outlines the possible image transformations. */
type ImageTransformation = ImageRotation | ImageCrop;

type ImageTransformations = Partial<Record<TransformKind, ImageTransformation>>;

/** Describes the data corresponding to a piece of image content. */
interface ImageContentData {
  name?: string;
  transformedImage?: ImageData;
  originalImage?: ImageData;
  childImages?: ImageData[];
  transformations?: ImageTransformations;
  sourceUrl?: string;
}

interface ImagePayload {
  id: string;
  value: ImageContentData;
}

export const IMAGE_CONSTANT_CONFIG: CustomField<ImageType> = {
  type: "custom",
  render: ({ onChange, value }) => {
    const [pendingMessageId, setPendingMessageId] = React.useState<
      string | undefined
    >();

    const { sendToParent: openImageAssetSelector } = useSendMessageToParent(
      "constantValueEditorOpened",
      TARGET_ORIGINS
    );

    useReceiveMessage(
      "constantValueEditorClosed",
      TARGET_ORIGINS,
      (_, payload) => {
        const imagePayload = payload as ImagePayload;
        if (pendingMessageId && pendingMessageId === imagePayload.id) {
          const imageData =
            imagePayload.value.transformedImage ??
            imagePayload.value.originalImage;
          if (!imageData) {
            return;
          }
          onChange({
            url: imageData.url,
            height: imageData.dimension?.height ?? 0,
            width: imageData.dimension?.width ?? 0,
          });
        }
      }
    );

    const handleClick = () => {
      const messageId = `ImageAsset-${Date.now()}`;
      setPendingMessageId(messageId);

      openImageAssetSelector({
        payload: {
          type: "ImageAsset",
          value: value,
          id: messageId,
        },
      });

      /** Handles local development testing outside of storm */
      if (window.location.href.includes("http://localhost:5173/dev-location")) {
        const userInput = prompt("Enter Image URL:");
        onChange({
          url: userInput ?? "",
          height: 0,
          width: 0,
        });
      }
    };

    return (
      <>
        {value?.url && (
          <img
            src={value.url}
            alt="Selected Thumbnail"
            className="mt-3 w-full min-h-24 max-h-48 object-cover rounded-md mb-3"
          />
        )}
        <button
          className="text-sm py-1 w-full border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
          onClick={handleClick}
        >
          <div className="ve-line-clamp-3">
            {pt("chooseImage", "Choose Image")}
          </div>
        </button>
      </>
    );
  },
};
