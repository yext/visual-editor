import * as React from "react";
import * as ReactDOM from "react-dom";
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

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [buttonPosition, setButtonPosition] = React.useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

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

  // Update button position when container moves/resizes
  React.useEffect(() => {
    if (!containerRef.current || !isEmpty || !isEditing) {
      setButtonPosition(null);
      return;
    }

    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setButtonPosition({
          top: rect.top + rect.height / 2,
          left: rect.left + rect.width / 2,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updatePosition();

    // Update on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    // Use MutationObserver to detect DOM changes
    const observer = new MutationObserver(updatePosition);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    // Use ResizeObserver for container size changes
    const resizeObserver = new ResizeObserver(updatePosition);
    resizeObserver.observe(containerRef.current);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [isEmpty, isEditing]);

  if (!isEmpty || !isEditing) {
    return null;
  }

  return (
    <>
      <EntityField
        displayName={pt("fields.image", "Image")}
        fieldId={fieldId}
        constantValueEnabled={!hasParentData && constantValueEnabled}
        fullHeight={fullHeight}
        ref={dragRef}
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
          >
            {/* Placeholder for visual alignment */}
            <div className="text-gray-400">
              <ImagePlus size={24} className="stroke-2" />
            </div>
          </div>
        </div>
      </EntityField>

      {/* Portal the actual clickable button */}
      {buttonPosition &&
        ReactDOM.createPortal(
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-gray-600 hover:bg-transparent"
            style={{
              position: "fixed",
              top: buttonPosition.top,
              left: buttonPosition.left,
              transform: "translate(-50%, -50%)",
              zIndex: 999999,
              cursor: "pointer",
              pointerEvents: "auto",
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleImageSelection();
            }}
            type="button"
            aria-label={pt("addImage", "Add Image")}
          >
            <ImagePlus size={24} className="stroke-2" />
          </Button>,
          document.body
        )}
    </>
  );
};
