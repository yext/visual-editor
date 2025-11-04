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
} from "../../../internal/hooks/useMessage";

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
}

export const EmptyImageState: React.FC<EmptyImageStateProps> = ({
  isEmpty,
  isEditing,
  constantValueEnabled,
  constantValue,
  fieldId,
  containerStyle,
  containerClassName,
  fullHeight,
  dragRef,
  hasParentData = false,
}) => {
  const { sendToParent: openImageAssetSelector } = useSendMessageToParent(
    "constantValueEditorOpened",
    TARGET_ORIGINS
  );

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const entityFieldRef = React.useRef<HTMLDivElement | null>(null);

  // Attach native event listeners to intercept before Puck slot handlers
  React.useEffect(() => {
    const button = buttonRef.current;
    const container = containerRef.current;
    const entityField = entityFieldRef.current;
    if (!button || !container || !isEmpty) return;

    const handleClick = (e: MouseEvent) => {
      // Check if the click is on the button or inside it
      if (button.contains(e.target as Node) || e.target === button) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        if (!hasParentData && constantValueEnabled && isEditing) {
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
                value: constantValue,
                id: messageId,
              },
            });
          }
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Check if the pointer down is on the button or inside it
      if (button.contains(e.target as Node) || e.target === button) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      // Check if the pointer up is on the button or inside it
      if (button.contains(e.target as Node) || e.target === button) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();
        if (!hasParentData && constantValueEnabled && isEditing) {
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
                value: constantValue,
                id: messageId,
              },
            });
          }
        }
      }
    };

    // Attach to button directly in capture phase - this intercepts before slot handlers
    button.addEventListener("click", handleClick, true);
    button.addEventListener("pointerdown", handlePointerDown, true);
    button.addEventListener("pointerup", handlePointerUp, true);

    // Also attach to container as backup
    container.addEventListener("click", handleClick, true);
    container.addEventListener("pointerdown", handlePointerDown, true);
    container.addEventListener("pointerup", handlePointerUp, true);

    // Also attach to entityField if available to catch events even earlier
    if (entityField) {
      entityField.addEventListener("click", handleClick, true);
      entityField.addEventListener("pointerdown", handlePointerDown, true);
      entityField.addEventListener("pointerup", handlePointerUp, true);
    }

    return () => {
      button.removeEventListener("click", handleClick, true);
      button.removeEventListener("pointerdown", handlePointerDown, true);
      button.removeEventListener("pointerup", handlePointerUp, true);
      container.removeEventListener("click", handleClick, true);
      container.removeEventListener("pointerdown", handlePointerDown, true);
      container.removeEventListener("pointerup", handlePointerUp, true);
      if (entityField) {
        entityField.removeEventListener("click", handleClick, true);
        entityField.removeEventListener("pointerdown", handlePointerDown, true);
        entityField.removeEventListener("pointerup", handlePointerUp, true);
      }
    };
  }, [
    isEmpty,
    hasParentData,
    constantValueEnabled,
    isEditing,
    openImageAssetSelector,
    constantValue,
  ]);

  if (!isEmpty || !isEditing) {
    return null;
  }

  return (
    <EntityField
      displayName={pt("fields.image", "Image")}
      fieldId={fieldId}
      constantValueEnabled={!hasParentData && constantValueEnabled}
      fullHeight={fullHeight}
      ref={(node) => {
        entityFieldRef.current = node;
        if (dragRef) {
          if (typeof dragRef === "function") {
            dragRef(node);
          } else if ("current" in dragRef) {
            (dragRef as React.MutableRefObject<HTMLDivElement | null>).current =
              node;
          }
        }
      }}
    >
      <div className="w-full h-full relative">
        <div
          ref={containerRef}
          className={themeManagerCn(
            containerClassName ||
              "max-w-full rounded-image-borderRadius w-full h-full",
            "border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden relative"
          )}
          style={containerStyle}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            const isButton = target.closest('button[aria-label*="Add Image"]');
            if (isButton) {
              return;
            }
          }}
          onPointerDown={(e) => {
            // Stop Puck from capturing pointer events on the button
            const target = e.target as HTMLElement;
            const isButton = target.closest('button[aria-label*="Add Image"]');
            if (isButton) {
              e.stopPropagation();
            }
          }}
        >
          <Button
            ref={buttonRef}
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
      </div>
    </EntityField>
  );
};
