import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../internal/hooks/useMessage.ts";
import { Button } from "../internal/puck/ui/button.tsx";
import {
  ImageContentData,
  TranslatableAssetImage,
  AssetImageType,
  LocalizedAssetImage,
  isLocalizedAssetImage,
  resolveLocalizedAssetImage,
} from "../types/images.ts";
import { useDocument } from "../hooks/useDocument.tsx";
import { type TranslatableStringField } from "./TranslatableStringField.tsx";
import { resolveComponentData } from "../utils/resolveComponentData.tsx";
import { TranslatableString } from "../types/types.ts";
import { msg, pt, type MsgString } from "../utils/i18n/platform.ts";
import {
  FieldTypeData,
  TemplateMetadata,
} from "../internal/types/templateMetadata.ts";
import { DynamicOption } from "../editor/DynamicOptionsSelector.tsx";
import { useTemplateMetadata } from "../internal/hooks/useMessageReceivers.ts";
import { isFakeStarterLocalDev } from "../utils/isFakeStarterLocalDev.ts";
import { YextAutoField } from "./YextAutoField.tsx";

export type ImagePayload = {
  id: string;
  value: ImageContentData;
  locale: string;
};

let pendingImageSession:
  | { messageId: string; apply: (payload: ImagePayload) => void }
  | undefined;

export type ImageField = BaseField & {
  type: "image";
  label?: string | MsgString;
  visible?: boolean;
  hideAltTextField?: boolean;
  maxFileSizeBytes?: number;
  getAltTextOptions?: (
    templateMetadata: TemplateMetadata
  ) => DynamicOption<string>[];
};

type ImageFieldOverrideProps = FieldProps<ImageField>;

export const buildLocatorDisplayOptions = (
  locatorDisplayFields?: Record<string, FieldTypeData>
): DynamicOption<string>[] => {
  if (!locatorDisplayFields) {
    return [];
  }

  return Object.keys(locatorDisplayFields)
    .filter((key) => locatorDisplayFields[key]?.field_type_id === "type.string")
    .map((key) => ({
      label: locatorDisplayFields[key].field_name,
      value: key,
    }));
};

export const ImageFieldOverride = ({
  field,
  onChange,
  value,
}: ImageFieldOverrideProps) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const templateMetadata: TemplateMetadata = useTemplateMetadata();
  const locale = i18n.language;

  const localizedContainer = React.useMemo<LocalizedAssetImage | undefined>(
    () => (isLocalizedAssetImage(value) ? value : undefined),
    [value]
  );

  const resolvedValue = React.useMemo<AssetImageType | undefined>(
    () => resolveLocalizedAssetImage(value, locale),
    [value, locale]
  );

  const { sendToParent: openImageAssetSelector } = useSendMessageToParent(
    "constantValueEditorOpened",
    TARGET_ORIGINS
  );

  useReceiveMessage(
    "constantValueEditorClosed",
    TARGET_ORIGINS,
    (_, payload) => {
      const imagePayload = payload as ImagePayload;
      if (pendingImageSession?.messageId === imagePayload?.id) {
        const { apply } = pendingImageSession;
        pendingImageSession = undefined;
        apply(imagePayload);
      }
    }
  );

  const handleSelectImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    /** Handles local development testing outside of Storm */
    if (isFakeStarterLocalDev()) {
      const userInput = prompt("Enter Image URL:");
      if (!userInput) {
        return;
      }
      onChange({
        ...localizedContainer,
        [locale]: {
          alternateText: resolvedValue?.alternateText ?? "",
          url: userInput,
          height: 1,
          width: 1,
        },
        hasLocalizedValue: "true",
      } as TranslatableAssetImage);
      pendingImageSession = undefined;
      return;
    }

    /** Instructs Storm to open the image asset selector drawer */
    const messageId = `ImageAsset-${Date.now()}`;
    pendingImageSession = {
      messageId,
      apply: (imagePayload) => {
        const imageData =
          imagePayload.value.transformedImage ??
          imagePayload.value.originalImage;
        if (!imageData) {
          return;
        }

        onChange({
          ...localizedContainer,
          [locale]: {
            alternateText: imagePayload.value.altText
              ? {
                  [imagePayload.locale]: imagePayload.value.altText,
                  hasLocalizedValue: "true",
                }
              : "",
            url: imageData.url,
            height: imageData.dimension?.height ?? 0,
            width: imageData.dimension?.width ?? 0,
            assetImage: imagePayload.value,
          },
          hasLocalizedValue: "true",
        } as TranslatableAssetImage);
      },
    };
    openImageAssetSelector({
      payload: {
        type: "ImageAsset",
        value: resolvedValue,
        id: messageId,
        maxFileSizeBytes: field.maxFileSizeBytes,
      },
    });
  };

  const handleDeleteImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    onChange({
      ...localizedContainer,
      [locale]: {
        alternateText: resolvedValue?.alternateText ?? "",
        url: "",
        height: 0,
        width: 0,
      },
      hasLocalizedValue: "true",
    } as TranslatableAssetImage);
  };

  const altTextOptions = React.useMemo(
    () => field.getAltTextOptions?.(templateMetadata),
    [field.getAltTextOptions, templateMetadata]
  );
  const altTextField = React.useMemo<TranslatableStringField>(() => {
    if (altTextOptions) {
      return {
        type: "translatableString",
        label: msg("altText", "Alt Text"),
        showApplyAllOption: false,
        showFieldSelector: true,
        getOptions: () => altTextOptions,
      };
    }

    return {
      type: "translatableString",
      label: msg("altText", "Alt Text"),
      filter: { types: ["type.string"] },
    };
  }, [altTextOptions]);

  const altText = resolveComponentData(
    resolvedValue?.alternateText ?? "",
    i18n.language,
    streamDocument
  );

  return (
    <>
      {/* Thumbnail */}
      <FieldLabel
        label={field.label ? pt(field.label) : pt("fields.image", "Image")}
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
            type="button"
          />
          {resolvedValue?.url ? (
            <>
              <img
                src={resolvedValue.url}
                alt={altText}
                className="ve-w-full ve-min-h-[126px] ve-max-h-[200px] ve-object-cover ve-rounded-md ve-transition ve-duration-300 group-hover:ve-brightness-75"
              />
              <div className="ve-absolute ve-top-1/2 ve-left-1/2 ve-transform -ve-translate-x-1/2 -ve-translate-y-1/2 ve-w-full ve-h-full ve-flex ve-flex-col ve-gap-3 ve-justify-center ve-items-center ve-opacity-0 hover:ve-opacity-100 ve-transition ve-duration-300">
                <Button
                  variant="secondary"
                  onClick={handleSelectImage}
                  type="button"
                  className="ve-bg-transparent ve-text-primary ve-border-primary ve-border-solid ve-border-2"
                >
                  {pt("change", "Change")}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteImage}
                  type="button"
                  className="ve-text-white"
                >
                  {pt("delete", "Delete")}
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="secondary"
              onClick={handleSelectImage}
              type="button"
            >
              {pt("chooseImage", "Choose Image")}
            </Button>
          )}
        </div>
      </FieldLabel>

      {resolvedValue && !field.hideAltTextField && (
        <FieldLabel label="" el="div">
          <YextAutoField
            field={altTextField}
            id="altText"
            value={resolvedValue.alternateText}
            onChange={(newValue: TranslatableString | undefined) => {
              const updatedImage = {
                ...resolvedValue,
                alternateText: newValue,
              };

              onChange({
                ...localizedContainer,
                [locale]: updatedImage,
                hasLocalizedValue: "true",
              } as TranslatableAssetImage);
            }}
          />
        </FieldLabel>
      )}
    </>
  );
};
