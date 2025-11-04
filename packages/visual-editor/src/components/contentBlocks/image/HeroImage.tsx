import * as React from "react";
import { useTranslation } from "react-i18next";
import { ComponentConfig, PuckComponent } from "@measured/puck";
import {
  useDocument,
  resolveComponentData,
  EntityField,
  Image,
  msg,
  pt,
  imgSizesHelper,
  AssetImageType,
  themeManagerCn,
} from "@yext/visual-editor";
import { ComplexImageType, ImageType } from "@yext/pages-components";
import { updateFields } from "../../pageSections/HeroSection";
import {
  imageDefaultProps,
  ImageWrapperFields,
  ImageWrapperProps,
} from "./Image.tsx";
import { ImagePlus } from "lucide-react";
import { Button } from "../../../internal/puck/ui/button";
import {
  TARGET_ORIGINS,
  useSendMessageToParent,
} from "../../../internal/hooks/useMessage";

export interface HeroImageProps extends ImageWrapperProps {
  /** @internal from the parent Hero Section Component */
  variant?: "classic" | "compact" | "immersive" | "spotlight";
}

const HeroImageComponent: PuckComponent<HeroImageProps> = (props) => {
  const { data, styles, className, puck } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const resolvedImage = resolveComponentData(
    data.image,
    i18n.language,
    streamDocument
  );

  const { sendToParent: openImageAssetSelector } = useSendMessageToParent(
    "constantValueEditorOpened",
    TARGET_ORIGINS
  );

  const buttonRef = React.useRef<HTMLButtonElement>(null);

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

  const handleEmptyImageClick = (
    e?: React.MouseEvent | MouseEvent | PointerEvent
  ) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    // Only open asset drawer if we're in constant value mode
    if (data.image.constantValueEnabled && puck?.isEditing) {
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

  // Attach native event listeners to bypass React's synthetic events and intercept before Puck
  React.useEffect(() => {
    const button = buttonRef.current;
    if (!button || !isEmpty) return;

    const handlePointerDown = (e: PointerEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
    };

    const handlePointerUp = (e: PointerEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
      if (data.image.constantValueEnabled && puck?.isEditing) {
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

    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
      e.preventDefault();
      if (data.image.constantValueEnabled && puck?.isEditing) {
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

    // Use capture phase to intercept before Puck's handlers
    button.addEventListener("pointerdown", handlePointerDown, true);
    button.addEventListener("pointerup", handlePointerUp, true);
    button.addEventListener("click", handleClick, true);

    return () => {
      button.removeEventListener("pointerdown", handlePointerDown, true);
      button.removeEventListener("pointerup", handlePointerUp, true);
      button.removeEventListener("click", handleClick, true);
    };
  }, [
    isEmpty,
    data.image.constantValueEnabled,
    puck?.isEditing,
    openImageAssetSelector,
  ]);

  if (isEmpty) {
    return puck?.isEditing ? (
      <EntityField
        displayName={pt("fields.image", "Image")}
        fieldId={data.image.field}
        constantValueEnabled={data.image.constantValueEnabled}
        fullHeight={true}
      >
        <div className="w-full h-full relative">
          <div
            className={themeManagerCn(
              className ||
                "max-w-full rounded-image-borderRadius w-full h-full",
              "border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors overflow-hidden relative"
            )}
            style={
              styles.aspectRatio ? { aspectRatio: styles.aspectRatio } : {}
            }
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
            onPointerDown={(e) => {
              // Stop Puck from capturing pointer events on the button
              const target = e.target as HTMLElement;
              const isButton = target.closest(
                'button[aria-label*="Add Image"]'
              );
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
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleEmptyImageClick(e);
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

  return (
    <EntityField
      displayName={pt("fields.image", "Image")}
      fieldId={data.image.field}
      constantValueEnabled={data.image.constantValueEnabled}
      fullHeight={true}
    >
      <Image
        image={resolvedImage}
        aspectRatio={styles.aspectRatio}
        width={undefined}
        className={className || "max-w-full rounded-image-borderRadius w-full"}
        sizes={imgSizesHelper({
          base: "calc(100vw - 32px)",
          md: "calc(maxWidth / 2)",
        })}
      />
    </EntityField>
  );
};

export const HeroImage: ComponentConfig<{ props: HeroImageProps }> = {
  label: msg("components.heroImage", "Hero Image"),
  fields: ImageWrapperFields,
  defaultProps: imageDefaultProps,
  resolveFields: (data) => {
    let fields = ImageWrapperFields;

    switch (data.props.variant ?? "classic") {
      case "compact": {
        fields = updateFields(fields, ["styles.objectFields.width"], undefined);
        // compact should also remove the props removed by classic
      }
      case "classic": {
        fields = updateFields(
          fields,
          ["styles.objectFields.aspectRatio.options"],
          // @ts-expect-error ts(2339) objectFields exists
          fields.styles.objectFields.aspectRatio.options.filter(
            (option: { label: string; value: string }) =>
              !["4:1", "3:1", "2:1", "9:16"].includes(option.label)
          )
        );
        break;
      }
    }
    return fields;
  },
  render: (props) => <HeroImageComponent {...props} />,
};
