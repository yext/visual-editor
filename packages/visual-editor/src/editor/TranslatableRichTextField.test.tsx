import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import {
  getDefaultRTF,
  TranslatableRichTextField,
} from "./TranslatableRichTextField.tsx";
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

const RichTextFieldRenderer = ({
  value,
  onChange = vi.fn(),
}: {
  value?: {
    defaultValue?: { html?: string; json?: string };
    en?: { html?: string; json?: string };
    fr?: { html?: string; json?: string };
    hasLocalizedValue?: "true";
  };
  onChange?: ReturnType<typeof vi.fn>;
}): React.ReactNode => {
  const field = TranslatableRichTextField(msg("body", "Body"));

  return field.render({
    field,
    id: "rich-text-field",
    name: "body",
    onChange,
    readOnly: false,
    value,
  } as Parameters<typeof field.render>[0]);
};

describe("TranslatableRichTextField", () => {
  afterEach((): void => {
    vi.restoreAllMocks();
    sendToParentMock.mockReset();
  });

  it("passes the repeated source field to Storm when opening the editor", () => {
    vi.spyOn(window, "parent", "get").mockReturnValue({} as Window);
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

  it("creates valid rich text for multiline content", () => {
    const value = getDefaultRTF(
      'First <paragraph>\nwith "quotes"\n\nSecond & final'
    );

    expect(JSON.parse(value.json!)).toMatchObject({
      root: {
        children: [
          {
            children: [
              { text: "First <paragraph>" },
              { type: "linebreak" },
              { text: 'with "quotes"' },
            ],
          },
          { children: [{ text: "Second & final" }] },
        ],
      },
    });
    expect(value.html).toBe(
      '<p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>First &lt;paragraph&gt;<br/>with &quot;quotes&quot;</span></p><p dir="ltr" style="font-size: 14.67px; font-weight: 400; line-height: 18.67px; margin: 0; padding: 3px 2px 3px 2px; position: relative;"><span>Second &amp; final</span></p>'
    );
  });

  it("when editing rich text locally then the HTML prompt updates the active locale", (): void => {
    const onChange = vi.fn();
    const promptSpy = vi
      .spyOn(window, "prompt")
      .mockReturnValue("<p>New text</p>");
    render(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <RichTextFieldRenderer
          value={{
            en: { html: "<p>Old text</p>", json: "old json" },
            fr: { html: "<p>French text</p>", json: "french json" },
            hasLocalizedValue: "true",
          }}
          onChange={onChange}
        />
      </TemplatePropsContext.Provider>
    );

    fireEvent.click(screen.getByRole("button"));

    expect(promptSpy).toHaveBeenCalledWith("Enter Rich Text (HTML):");
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      en: { html: "<p>New text</p>", json: "" },
      fr: { html: "<p>French text</p>", json: "french json" },
      hasLocalizedValue: "true",
    });
    expect(sendToParentMock).not.toHaveBeenCalled();
  });

  it("when the local prompt is cancelled then rich text stays unchanged", (): void => {
    const onChange = vi.fn();
    vi.spyOn(window, "prompt").mockReturnValue(null);
    render(
      <TemplatePropsContext.Provider value={{ document: {} }}>
        <RichTextFieldRenderer onChange={onChange} />
      </TemplatePropsContext.Provider>
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onChange).not.toHaveBeenCalled();
    expect(sendToParentMock).not.toHaveBeenCalled();
  });
});
