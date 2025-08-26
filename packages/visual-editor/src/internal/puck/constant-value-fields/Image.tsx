import * as React from "react";
import { AutoField, CustomField, FieldLabel } from "@measured/puck";
import { useTranslation } from "react-i18next";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../../hooks/useMessage";
import { Button } from "../ui/button";
import { ImageContentData, AssetImageType } from "../../../types/images";
import { useDocument } from "../../../hooks/useDocument";
import { TranslatableStringField } from "../../../editor/TranslatableStringField";
import { resolveComponentData } from "../../../utils/resolveComponentData";
import { TranslatableString } from "../../../types/types";
import { msg, pt } from "../../../utils/i18n/platform";

type ImagePayload = {
  id: string;
  value: ImageContentData;
  locale: string;
};

export const IMAGE_CONSTANT_CONFIG: CustomField<AssetImageType | undefined> = {
  type: "custom",
  render: ({ onChange, value, field }) => {
    const { i18n } = useTranslation();
    const streamDocument = useDocument();
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
            alternateText: imagePayload.value.altText
              ? {
                  [imagePayload.locale]: imagePayload.value.altText,
                  hasLocalizedValue: "true",
                }
              : "",
            url: imageData.url,
            height: imageData.dimension?.height ?? 0,
            width: imageData.dimension?.width ?? 0,
            assetImage: payload.value,
          });
        }
      }
    );

    const handleSelectImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      /** Handles local development testing outside of Storm */
      if (window.location.href.includes("http://localhost:5173/dev-location")) {
        const userInput = prompt("Enter Image URL:");
        if (!userInput) {
          return;
        }
        onChange({
          alternateText: value?.alternateText ?? "",
          url: userInput,
          height: 1,
          width: 1,
        });
      } else {
        /** Instructs Storm to open the image asset selector drawer */
        const messageId = `ImageAsset-${Date.now()}`;
        setPendingMessageId(messageId);
        openImageAssetSelector({
          payload: {
            type: "ImageAsset",
            value: value,
            id: messageId,
          },
        });
      }
    };

    const handleDeleteImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      onChange({
        alternateText: value?.alternateText ?? "",
        url: "",
        height: 0,
        width: 0,
      });
    };

    const altTextField = React.useMemo(() => {
      return TranslatableStringField<TranslatableString | undefined>(
        msg("altText", "Alt Text"),
        { types: ["type.string"] }
      );
    }, []);

    const altText = resolveComponentData(
      value?.alternateText ?? "",
      i18n.language,
      streamDocument
    );

    return (
      <>
        {/* Thumbnail */}
        <FieldLabel
          label={field?.label ? pt(field.label) : pt("fields.image", "Image")}
          el="div"
          className="ve-mt-3"
        >
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
                  alt={altText}
                  className="ve-w-full ve-min-h-[126px] ve-max-h-[200px] ve-object-cover ve-rounded-md ve-transition ve-duration-300 group-hover:ve-brightness-75"
                />
                <div className="ve-absolute ve-top-1/2 ve-left-1/2 ve-transform -ve-translate-x-1/2 -ve-translate-y-1/2 ve-w-full ve-h-full ve-flex ve-flex-col ve-gap-3 ve-justify-center ve-items-center ve-opacity-0 hover:ve-opacity-100 ve-transition ve-duration-300">
                  {/* Change Button */}
                  <Button
                    variant="secondary"
                    onClick={handleSelectImage}
                    className="ve-bg-transparent ve-text-primary ve-border-primary ve-border-solid ve-border-2"
                  >
                    {pt("change", "Change")}
                  </Button>

                  {/* Delete Button */}
                  <Button
                    variant="destructive"
                    onClick={handleDeleteImage}
                    className="ve-text-white"
                  >
                    {pt("delete", "Delete")}
                  </Button>
                </div>
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
          value={value?.alternateText}
          onChange={(newValue) =>
            onChange(value ? { ...value, alternateText: newValue } : undefined)
          }
        />
      </>
    );
  },
};
