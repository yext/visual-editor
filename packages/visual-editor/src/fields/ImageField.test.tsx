import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { YextAutoField } from "./YextAutoField.tsx";
import { type ImageField } from "./ImageField.tsx";

const { sendToParentMock, translatableStringFieldMock } = vi.hoisted(() => ({
  sendToParentMock: vi.fn(),
  translatableStringFieldMock: vi.fn(),
}));

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

vi.mock("../internal/hooks/useMessageReceivers.ts", () => ({
  useTemplateMetadata: () => ({
    locatorDisplayFields: {
      c_title: {
        field_type_id: "type.string",
        field_name: "Title",
      },
      c_photo: {
        field_type_id: "type.image",
        field_name: "Photo",
      },
    },
  }),
}));

vi.mock("./TranslatableStringField.tsx", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./TranslatableStringField.tsx")>();

  return {
    ...actual,
    TranslatableStringField: translatableStringFieldMock,
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

  translatableStringFieldMock.mockImplementation((label: string) => ({
    type: "text",
    label,
  }));

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
    translatableStringFieldMock.mockReset();
    sendToParentMock.mockReset();
  });

  it("passes locator alt text options into the alt text field", () => {
    const getAltTextOptions = vi.fn((templateMetadata) => [
      {
        label: templateMetadata.locatorDisplayFields?.c_title?.field_name ?? "",
        value: "c_title",
      },
    ]);

    renderImageField(
      {
        type: "image",
        label: "Image",
        getAltTextOptions,
      },
      {
        en: {
          alternateText: "",
          url: "https://example.com/image.jpg",
          height: 1,
          width: 1,
        },
        hasLocalizedValue: "true",
      }
    );

    expect(getAltTextOptions).toHaveBeenCalledWith({
      locatorDisplayFields: {
        c_title: {
          field_type_id: "type.string",
          field_name: "Title",
        },
        c_photo: {
          field_type_id: "type.image",
          field_name: "Photo",
        },
      },
    });
    expect(screen.getByText("Alt Text (en)")).toBeDefined();
  });

  it("selects an image URL locally without opening the parent asset drawer", () => {
    const prompt = vi
      .spyOn(window, "prompt")
      .mockReturnValue("https://example.com/image.jpg");
    const { onChange } = renderImageField();

    fireEvent.click(screen.getByRole("button", { name: "Choose Image" }));

    expect(prompt).toHaveBeenCalledWith("Enter Image URL:");
    expect(onChange).toHaveBeenCalledWith({
      en: {
        alternateText: "",
        url: "https://example.com/image.jpg",
        height: 1,
        width: 1,
      },
      hasLocalizedValue: "true",
    });
    expect(sendToParentMock).not.toHaveBeenCalled();
  });
});
