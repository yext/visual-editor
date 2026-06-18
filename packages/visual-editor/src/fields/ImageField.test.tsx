import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { YextAutoField } from "./YextAutoField.tsx";
import { type ImageField } from "./ImageField.tsx";

const { sendToParentMock } = vi.hoisted(() => ({
  sendToParentMock: vi.fn(),
}));

const initialUrl = window.location.href;

vi.mock("react-i18next", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-i18next")>();

  return {
    ...actual,
    useTranslation: () => ({
      i18n: { language: "en" },
    }),
  };
});

vi.mock("../internal/hooks/useMessage.ts", () => ({
  TARGET_ORIGINS: [],
  useReceiveMessage: vi.fn(),
  useSendMessageToParent: () => ({
    sendToParent: sendToParentMock,
  }),
}));

vi.mock("../internal/hooks/useMessageReceivers.ts", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("../internal/hooks/useMessageReceivers.ts")
    >();

  return {
    ...actual,
    useTemplateMetadata: () => ({
      locatorDisplayFields: {},
    }),
  };
});

const renderImageField = (
  field: ImageField = {
    type: "image",
    label: "Image",
  },
  value?: unknown
) => {
  const onChange = vi.fn();

  render(
    <TemplatePropsContext.Provider value={{ document: { locale: "en" } }}>
      <YextAutoField
        field={field}
        id="image-field"
        onChange={onChange}
        value={value as any}
      />
    </TemplatePropsContext.Provider>
  );

  return { onChange };
};

describe("ImageField", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sendToParentMock.mockReset();
    window.history.replaceState({}, "", initialUrl);
  });

  it("prompts for an image URL in fake starter local dev", () => {
    window.history.replaceState({}, "", "/dev-location/example");

    const promptSpy = vi
      .spyOn(window, "prompt")
      .mockReturnValue("https://example.com/image.jpg");
    const { onChange } = renderImageField();

    expect(screen.getByText("Image")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Choose Image" }));

    expect(promptSpy).toHaveBeenCalledWith("Enter Image URL:");
    expect(onChange).toHaveBeenCalledWith({
      en: {
        alternateText: "",
        url: "https://example.com/image.jpg",
        height: 1,
        width: 1,
      },
      hasLocalizedValue: "true",
    });
  });

  it("prompts for an image URL in local-editor", () => {
    window.history.replaceState({}, "", "/local-editor");

    const promptSpy = vi
      .spyOn(window, "prompt")
      .mockReturnValue("https://example.com/local-editor-image.jpg");
    const { onChange } = renderImageField();

    fireEvent.click(screen.getByRole("button", { name: "Choose Image" }));

    expect(promptSpy).toHaveBeenCalledWith("Enter Image URL:");
    expect(onChange).toHaveBeenCalledWith({
      en: {
        alternateText: "",
        url: "https://example.com/local-editor-image.jpg",
        height: 1,
        width: 1,
      },
      hasLocalizedValue: "true",
    });
  });
});
