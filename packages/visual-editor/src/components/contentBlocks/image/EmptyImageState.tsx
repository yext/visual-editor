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

  const handleImageSelection = React.useCallback(() => {
    if (!hasParentData && constantValueEnabled && isEditing) {
      if (window.location.href.includes("http://localhost:5173")) {
        const userInput = prompt("Enter Image URL:");
        if (!userInput) {
          return;
        }
      } else {
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
  }, [
    hasParentData,
    constantValueEnabled,
    isEditing,
    constantValue,
    openImageAssetSelector,
  ]);

  React.useEffect(() => {
    const button = buttonRef.current;
    if (!button || !isEmpty) return;

    const findSlotWrapper = (element: HTMLElement): HTMLElement | null => {
      let current = element.parentElement;
      while (current) {
        if (current.hasAttribute("data-puck-component")) {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    };

    const slotWrapper = findSlotWrapper(button);

    const interceptClick = (e: Event) => {
      const target = e.target as HTMLElement;

      if (button.contains(target) || target === button) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();

        handleImageSelection();
      }
    };

    const elements = [button, slotWrapper].filter(Boolean) as HTMLElement[];

    document.addEventListener("pointerdown", interceptClick, true);
    document.addEventListener("pointerup", interceptClick, true);
    document.addEventListener("click", interceptClick, true);

    elements.forEach((el) => {
      el.addEventListener("pointerdown", interceptClick, true);
      el.addEventListener("pointerup", interceptClick, true);
      el.addEventListener("click", interceptClick, true);
    });

    const handleMouseEnter = () => {
      if (slotWrapper) {
        slotWrapper.style.setProperty("pointer-events", "none", "important");
        button.style.setProperty("pointer-events", "auto", "important");
      }
    };

    const handleMouseLeave = () => {
      if (slotWrapper) {
        slotWrapper.style.removeProperty("pointer-events");
        button.style.removeProperty("pointer-events");
      }
    };

    button.addEventListener("mouseenter", handleMouseEnter);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("pointerdown", interceptClick, true);
      document.removeEventListener("pointerup", interceptClick, true);
      document.removeEventListener("click", interceptClick, true);

      elements.forEach((el) => {
        el.removeEventListener("pointerdown", interceptClick, true);
        el.removeEventListener("pointerup", interceptClick, true);
        el.removeEventListener("click", interceptClick, true);
      });

      button.removeEventListener("mouseenter", handleMouseEnter);
      button.removeEventListener("mouseleave", handleMouseLeave);

      handleMouseLeave();
    };
  }, [isEmpty, handleImageSelection]);

  if (!isEmpty || !isEditing) {
    return null;
  }

  return (
    <EntityField
      displayName={pt("fields.image", "Image")}
      fieldId={fieldId}
      constantValueEnabled={!hasParentData && constantValueEnabled}
      fullHeight={fullHeight}
      ref={dragRef}
    >
      <div className="w-full h-full relative">
        <div
          className={themeManagerCn(
            containerClassName ||
              "max-w-full rounded-image-borderRadius w-full h-full",
            "border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden relative"
          )}
          style={containerStyle}
        >
          <Button
            ref={buttonRef}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 hover:bg-transparent pointer-events-auto"
            style={{
              position: "absolute",
              zIndex: 9999,
              inset: "50%",
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
            }}
            type="button"
            aria-label={pt("addImage", "Add Image")}
            data-no-drag
          >
            <ImagePlus size={24} className="stroke-2" />
          </Button>
        </div>
      </div>
    </EntityField>
  );
};
