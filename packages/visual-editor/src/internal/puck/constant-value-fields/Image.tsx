import { AutoField, CustomField, FieldLabel } from "@measured/puck";
import { ImageType } from "@yext/pages-components";
import {
  msg,
  pt,
  TranslatableString,
  TranslatableStringField,
} from "@yext/visual-editor";
import * as React from "react";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../../hooks/useMessage";
import { Button } from "../ui/button";

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
            alternateText: value?.alternateText ?? "",
            url: imageData.url,
            height: imageData.dimension?.height ?? 0,
            width: imageData.dimension?.width ?? 0,
          });
        }
      }
    );

    const handleSelectImage = (e: React.MouseEvent) => {
      e.stopPropagation();
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
        if (!userInput) {
          return;
        }
        onChange({
          alternateText: value?.alternateText ?? "",
          url: userInput ?? "",
          height: 0,
          width: 0,
        });
      }
    };

    const handleDeleteImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      /* Deleting an image replaces the thumbnail with the "Choose Image" button.
         The click event from this button is still "active", and gets passed off 
         to the new Choose Image button, which triggers the image selector.
         To prevent this, we use setTimeout to delay the onChange call until 
         after the click event is finished. */
      setTimeout(() => {
        onChange({
          alternateText: value?.alternateText ?? "",
          url: "",
          height: 0,
          width: 0,
        });
      }, 0);
    };

    const altTextField = React.useMemo(() => {
      return TranslatableStringField<TranslatableString | undefined>(
        msg("altText", "Alt Text"),
        { types: ["type.string"] }
      );
    }, []);

    return (
      <>
        {/* Thumbnail */}
        <FieldLabel label={pt("Image")} className="ve-mt-3">
          <div className="ve-relative ve-group ve-mb-3">
            {/* FieldLabel grabs the onclick event for the first button in its children, 
                and applies it to the whole area covered by the FieldLabel and its children.
                This hidden button catches clicks on the label/image to block unintended behavior. */}
            <button
              className="ve-absolute ve-inset-0 ve-z-10 ve-hidden"
              onClick={(e) => e.stopPropagation()}
            />
            {value?.url ? (
              <>
                <img
                  src={value.url}
                  alt={value.alternateText}
                  className="ve-w-full ve-min-h-[126px] ve-max-h-[200px] ve-object-cover ve-rounded-md ve-transition ve-duration-300 group-hover:ve-brightness-75"
                />

                {/* Change Button */}
                <Button
                  variant="secondary"
                  onClick={handleSelectImage}
                  className="ve-absolute ve-top-4 ve-left-1/2 ve-transform -ve-translate-x-1/2 ve-opacity-0 group-hover:ve-opacity-100 ve-transition ve-duration-300"
                >
                  {pt("change", "Change")}
                </Button>

                {/* Delete Button */}
                <Button
                  variant="destructive"
                  onClick={handleDeleteImage}
                  className="ve-absolute ve-bottom-4 ve-left-1/2 ve-transform -ve-translate-x-1/2 ve-opacity-0 group-hover:ve-opacity-100 ve-transition ve-duration-300"
                >
                  {pt("delete", "Delete")}
                </Button>
              </>
            ) : (
              <>
                {/* Choose Image Button */}
                <Button variant="secondary" onClick={handleSelectImage}>
                  {pt("chooseImage", "Choose Image")}
                </Button>
              </>
            )}
          </div>
        </FieldLabel>

        {/* Alt Text Field */}
        <AutoField
          field={altTextField}
          value={value.alternateText}
          onChange={(newValue) =>
            onChange({ ...value, alternateText: newValue })
          }
        />
      </>
    );
  },
};
