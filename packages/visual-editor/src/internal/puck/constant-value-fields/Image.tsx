import { CustomField, FieldLabel } from "@measured/puck";
import { ImageType } from "@yext/pages-components";
import { pt } from "../../../utils/i18nPlatform.ts";
import * as React from "react";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../../hooks/useMessage";

export const IMAGE_CONSTANT_CONFIG: CustomField<ImageType> = {
  type: "custom",
  //eslint-disable-next-line @typescript-eslint/no-unused-vars remove this
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
        if (pendingMessageId && pendingMessageId === payload?.id) {
          console.log(payload);
          // handle onChange
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
    };

    // handle local development in /starter

    return (
      <FieldLabel label={pt("Image")}>
        <button className="" onClick={handleClick}>
          <div className="ve-line-clamp-3">
            {/** Image or "Choose image" Button */}{" "}
          </div>
        </button>
      </FieldLabel>
    );
  },
};
