import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { TranslatableRichTextField } from "./TranslatableRichTextField.tsx";
import { RepeatedSourceFieldContext } from "../fields/repeatedSourceFieldContext.ts";
import { msg } from "../utils/i18n/platform.ts";

const { sendToParentMock } = vi.hoisted(() => ({
  sendToParentMock: vi.fn(),
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

vi.mock("../utils/isFakeStarterLocalDev.ts", () => ({
  isFakeStarterLocalDev: () => false,
}));

const RichTextFieldRenderer = ({
  value,
}: {
  value?: { defaultValue?: { html?: string; json?: string } };
}) => {
  const field = TranslatableRichTextField(msg("body", "Body"));

  return field.render({
    field,
    id: "rich-text-field",
    name: "body",
    onChange: vi.fn(),
    readOnly: false,
    value,
  } as Parameters<typeof field.render>[0]);
};

describe("TranslatableRichTextField", () => {
  it("passes the repeated source field to Storm when opening the editor", () => {
    render(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <RepeatedSourceFieldContext.Provider value="c_eventsSection.events">
          <RichTextFieldRenderer />
        </RepeatedSourceFieldContext.Provider>
      </TemplatePropsContext.Provider>
    );

    fireEvent.click(screen.getByRole("button"));

    expect(sendToParentMock).toHaveBeenCalledWith({
      payload: {
        type: "RichTextValue",
        value: undefined,
        id: expect.stringMatching(/^RichText-/),
        fieldName: "Body (en)",
        locale: "en",
        sourceField: "c_eventsSection.events",
      },
    });
  });
});
