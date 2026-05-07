import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { msg } from "../utils/i18n/platform.ts";
import { type AssetVideo } from "../types/videos.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import { type VideoField } from "./VideoField.tsx";

const renderField = (
  field: VideoField,
  value?: AssetVideo
): {
  onChange: ReturnType<typeof vi.fn>;
} => {
  const onChange = vi.fn();

  render(
    <YextAutoField
      field={field}
      id="test-field"
      onChange={onChange}
      value={value}
    />
  );

  return { onChange };
};

const videoField: VideoField = {
  type: "video",
  label: msg("fields.video", "Video"),
};

const assetVideo: AssetVideo = {
  id: "asset-video-id",
  name: "Video asset",
  video: {
    id: "youtube-id",
    url: "https://www.youtube.com/watch?v=youtube-id",
    thumbnail: "https://img.youtube.com/vi/youtube-id/hqdefault.jpg",
    title: "Example Video",
    duration: "1:23",
    embeddedUrl: "https://www.youtube.com/embed/youtube-id",
  },
};

describe("VideoField", () => {
  it("renders an empty video selector through YextAutoField", () => {
    renderField(videoField);

    expect(screen.getByText("Video")).toBeDefined();
    expect(screen.getByRole("button", { name: "Choose Video" })).toBeDefined();
  });

  it("renders a selected video with change and delete controls", () => {
    renderField(videoField, assetVideo);

    expect(screen.getByText("Example Video")).toBeDefined();
    expect(screen.getByAltText("Video Thumbnail")).toBeDefined();
    expect(screen.getByRole("button", { name: "Change" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Delete" })).toBeDefined();
  });

  it("clears the selected video when delete is clicked", () => {
    const { onChange } = renderField(videoField, assetVideo);

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});
