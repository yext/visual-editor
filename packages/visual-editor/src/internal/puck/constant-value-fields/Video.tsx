import * as React from "react";
import { CustomField, FieldLabel } from "@measured/puck";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../../hooks/useMessage";
import { Button } from "../ui/button";
import { AssetVideo } from "../../../types/videos";
import { pt } from "../../../utils/i18n/platform";

type VideoPayload = {
  id: string;
  value: AssetVideo;
  locale: string;
};

export const VIDEO_CONSTANT_CONFIG: CustomField<AssetVideo | undefined> = {
  type: "custom",
  render: ({ onChange, value, field }) => {
    const [pendingMessageId, setPendingMessageId] = React.useState<
      string | undefined
    >();

    const { sendToParent: openVideoAssetSelector } = useSendMessageToParent(
      "constantValueEditorOpened",
      TARGET_ORIGINS
    );

    useReceiveMessage(
      "constantValueEditorClosed",
      TARGET_ORIGINS,
      (_, payload) => {
        const videoPayload = payload as VideoPayload;
        if (pendingMessageId && pendingMessageId === videoPayload.id) {
          if (!videoPayload?.value) {
            return;
          }

          onChange(videoPayload.value);
        }
      }
    );

    const handleSelectVideo = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      /** Handles local development testing outside of Storm */
      if (window.location.href.includes("http://localhost:5173/dev-location")) {
        const userInput = prompt("Enter Video URL:");
        if (!userInput) {
          return;
        }
        const url = new URL(userInput);
        const searchParams = new URLSearchParams(url.search);
        const id = searchParams.get("v") ?? "";

        onChange({
          name: "Local asset",
          id: "0",
          video: {
            url: userInput,
            thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
            id: id,
            title: "Local Video",
            duration: "0:00",
            embeddedUrl: `https://www.youtube.com/embed/${id}`,
          },
        });
      } else {
        /** Instructs Storm to open the video asset selector drawer */
        const messageId = `VideoAsset-${Date.now()}`;
        setPendingMessageId(messageId);
        openVideoAssetSelector({
          payload: {
            type: "VideoAsset",
            value: value,
            id: messageId,
          },
        });
      }
    };

    const handleDeleteVideo = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      onChange(undefined);
    };

    return (
      <FieldLabel
        label={field?.label ? pt(field.label) : pt("fields.video", "Video")}
        el="div"
        className="ve-mt-3"
      >
        <div className="ve-relative ve-group ve-mb-3">
          {/* FieldLabel grabs the onclick event for the first button in its children, 
                and applies it to the whole area covered by the FieldLabel and its children.
                This hidden button catches clicks on the label/video to block unintended behavior. */}
          <button
            className="ve-absolute ve-inset-0 ve-z-10 ve-hidden"
            onClick={(e) => e.stopPropagation()}
          />
          {value?.video?.title && (
            <div className="ve-text-xs ve-text-gray-500 mb-3">
              {value.video.title}
            </div>
          )}
          {value?.video?.url ? (
            <div className="ve-relative">
              {value.video.thumbnail && (
                <img
                  src={value.video.thumbnail}
                  alt={pt("videoThumbnail", "Video Thumbnail")}
                  className="ve-w-full aspect-video ve-object-cover ve-rounded-md ve-transition ve-duration-300 group-hover:ve-brightness-75"
                />
              )}
              <div className="ve-absolute ve-top-1/2 ve-left-1/2 ve-transform -ve-translate-x-1/2 -ve-translate-y-1/2 ve-w-full ve-h-full ve-flex ve-flex-col ve-gap-3 ve-justify-center ve-items-center ve-opacity-0 hover:ve-opacity-100 ve-transition ve-duration-300">
                {/* Change Button */}
                <Button
                  variant="secondary"
                  onClick={handleSelectVideo}
                  className="ve-bg-transparent ve-text-primary ve-border-primary ve-border-solid ve-border-2"
                >
                  {pt("change", "Change")}
                </Button>

                {/* Delete Button */}
                <Button
                  variant="destructive"
                  onClick={handleDeleteVideo}
                  className="ve-text-white"
                >
                  {pt("delete", "Delete")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Choose Video Button */}
              <Button variant="secondary" onClick={handleSelectVideo}>
                {pt("chooseVideo", "Choose Video")}
              </Button>
            </>
          )}
        </div>
      </FieldLabel>
    );
  },
};
