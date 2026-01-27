import * as React from "react";
import { AutoField, CustomField, FieldLabel } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../../hooks/useMessage";
import { Button } from "../ui/button";
import {
  ImageContentData,
  TranslatableAssetImage,
  AssetImageType,
} from "../../../types/images";
import { useDocument } from "../../../hooks/useDocument";
import { TranslatableStringField } from "../../../editor/TranslatableStringField";
import { resolveComponentData } from "../../../utils/resolveComponentData";
import { TranslatableString } from "../../../types/types";
import { msg, pt } from "../../../utils/i18n/platform";
import { TemplateMetadata } from "../../types/templateMetadata";
import { useTemplateMetadata } from "../../hooks/useMessageReceivers";

export type ImagePayload = {
  id: string;
  value: ImageContentData;
  locale: string;
};

export const IMAGE_CONSTANT_CONFIG: CustomField<
  TranslatableAssetImage | undefined
> = {
  type: "custom",
  render: ({ onChange, value, field }) => {
    const { i18n } = useTranslation();
    const streamDocument = useDocument();
    const templateMetadata: TemplateMetadata = useTemplateMetadata();
    const locale = i18n.language;

    let locales = templateMetadata?.locales || [];
    if (locales.length === 0) {
      try {
        const parsedPageSet = JSON.parse(streamDocument._pageset);
        if (
          parsedPageSet?.scope?.locales &&
          Array.isArray(parsedPageSet.scope.locales)
        ) {
          locales = parsedPageSet.scope.locales;
        } else {
          console.warn("Invalid locale structure in page group data");
        }
      } catch {
        console.warn("failed to retrieve locales from page group");
      }
    }

    const resolvedValue = React.useMemo(() => {
      if (value && "hasLocalizedValue" in value) {
        const localizedValue = value[locale];
        if (typeof localizedValue === "object") {
          return localizedValue;
        }
        return undefined;
      }
      return value;
    }, [value, locale]);

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
          const newValue = {
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
          };

          onChange({
            ...(value && "hasLocalizedValue" in value ? value : {}),
            [locale]: newValue,
            hasLocalizedValue: "true",
          } as TranslatableAssetImage);
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
        const newValue = {
          alternateText: resolvedValue?.alternateText ?? "",
          url: userInput,
          height: 1,
          width: 1,
        };
        onChange({
          ...(value && "hasLocalizedValue" in value ? value : {}),
          [locale]: newValue,
          hasLocalizedValue: "true",
        } as TranslatableAssetImage);
      } else {
        /** Instructs Storm to open the image asset selector drawer */
        const messageId = `ImageAsset-${Date.now()}`;
        setPendingMessageId(messageId);
        openImageAssetSelector({
          payload: {
            type: "ImageAsset",
            value: resolvedValue,
            id: messageId,
          },
        });
      }
    };

    const handleDeleteImage = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      const newValue = {
        alternateText: resolvedValue?.alternateText ?? "",
        url: "",
        height: 0,
        width: 0,
      };

      onChange({
        ...(value && "hasLocalizedValue" in value ? value : {}),
        [locale]: newValue,
        hasLocalizedValue: "true",
      } as TranslatableAssetImage);
    };

    const altTextField = React.useMemo(() => {
      return TranslatableStringField<TranslatableString | undefined>(
        msg("altText", "Alt Text"),
        { types: ["type.string"] }
      );
    }, []);

    const altText = resolveComponentData(
      resolvedValue?.alternateText ?? "",
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
            {resolvedValue?.url ? (
              <>
                <img
                  src={resolvedValue.url}
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

        {locales.length > 1 && (
          <Button
            size="sm"
            variant="small_link"
            onClick={() => {
              if (!resolvedValue) {
                return;
              }

              const valueByLocale = {
                hasLocalizedValue: "true",
                ...locales.reduce(
                  (acc, l) => {
                    const existingLocaleData =
                      value && "hasLocalizedValue" in value
                        ? (value[l] as AssetImageType | undefined)
                        : undefined;

                    acc[l] = {
                      ...resolvedValue,
                      alternateText: existingLocaleData?.alternateText,
                    };
                    return acc;
                  },
                  {} as Record<string, any>
                ),
              };
              onChange(valueByLocale as TranslatableAssetImage);
            }}
            className={"ve-px-0 ve-pb-4 ve-h-auto"}
          >
            {pt("applyAll", "Apply to all locales")}
          </Button>
        )}

        {/* Alt Text Field */}
        <AutoField
          field={altTextField}
          value={resolvedValue?.alternateText}
          onChange={(newValue) => {
            const updatedImage = resolvedValue
              ? { ...resolvedValue, alternateText: newValue }
              : undefined;
            onChange({
              ...(value && "hasLocalizedValue" in value ? value : {}),
              [locale]: updatedImage,
              hasLocalizedValue: "true",
            } as TranslatableAssetImage);
          }}
        />
      </>
    );
  },
};
