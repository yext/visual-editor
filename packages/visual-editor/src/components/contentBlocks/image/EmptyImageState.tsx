import * as React from "react";
import {
  EntityField,
  pt,
  themeManagerCn,
  AssetImageType,
} from "@yext/visual-editor";
import { ImagePlus } from "lucide-react";
import { Button } from "../../../internal/puck/ui/button";
import {
  TARGET_ORIGINS,
  useSendMessageToParent,
  useReceiveMessage,
} from "../../../internal/hooks/useMessage";
import { ImagePayload } from "../../../internal/puck/constant-value-fields/Image";

interface EmptyImageStateProps {
  isEmpty: boolean;
  isEditing: boolean;
  constantValueEnabled: boolean;
  constantValue: AssetImageType | undefined;
  fieldId: string;
  containerStyle?: React.CSSProperties;
  containerClassName?: string;
  fullHeight?: boolean;
  dragRef?: React.Ref<HTMLDivElement>;
  hasParentData?: boolean;
  onImageSelected?: (imageData: AssetImageType) => void;
}

export const EmptyImageState: React.FC<EmptyImageStateProps> = ({
  isEmpty,
  isEditing,
  constantValueEnabled,
  constantValue,
  fieldId,
  containerStyle,
  containerClassName,
  dragRef,
  hasParentData = false,
  onImageSelected,
}) => {
  const { sendToParent: openImageAssetSelector } = useSendMessageToParent(
    "constantValueEditorOpened",
    TARGET_ORIGINS
  );

  const [pendingMessageId, setPendingMessageId] = React.useState<
    string | undefined
  >();

  // Listen for image selection response
  useReceiveMessage(
    "constantValueEditorClosed",
    TARGET_ORIGINS,
    React.useCallback(
      (_, payload) => {
        const imagePayload = payload as ImagePayload;
        if (
          pendingMessageId &&
          pendingMessageId === imagePayload.id &&
          onImageSelected
        ) {
          const imageData =
            imagePayload.value.transformedImage ??
            imagePayload.value.originalImage;
          if (!imageData) {
            return;
          }
          onImageSelected({
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
          } as AssetImageType);
        }
      },
      [pendingMessageId, onImageSelected]
    )
  );

  const handleImageSelection = React.useCallback(() => {
    if (!hasParentData && constantValueEnabled && isEditing) {
      if (window.location.href.includes("http://localhost:5173")) {
        const userInput = prompt("Enter Image URL:");
        if (!userInput) {
          return;
        }
        if (onImageSelected) {
          onImageSelected({
            url: userInput,
            height: 1,
            width: 1,
            alternateText: "",
          } as AssetImageType);
        }
      } else {
        const messageId = `ImageAsset-${Date.now()}`;
        setPendingMessageId(messageId);
        openImageAssetSelector({
          payload: {
            type: "ImageAsset",
            value: constantValue,
            id: messageId,
          },
        });
      }
    }
  }, [
    hasParentData,
    constantValueEnabled,
    isEditing,
    constantValue,
    openImageAssetSelector,
    onImageSelected,
  ]);

  if (!isEmpty || !isEditing) {
    return null;
  }

  return (
    <>
      <EntityField
        displayName={pt("fields.image", "Image")}
        fieldId={fieldId}
        constantValueEnabled={!hasParentData && constantValueEnabled}
        fullHeight={false}
        ref={dragRef}
      >
        <div className="w-full relative">
          <div
            className={themeManagerCn(
              containerClassName ||
                "max-w-full rounded-image-borderRadius w-full",
              "border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden relative"
            )}
            style={containerStyle}
          >
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleImageSelection();
              }}
              type="button"
              aria-label={pt("addImage", "Add Image")}
            >
              <ImagePlus size={24} className="stroke-2" />
            </Button>
          </div>
        </div>
      </EntityField>
    </>
  );
};
