import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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

vi.mock("../utils/isLocalDev.ts", () => ({
  isLocalDev: () => false,
}));

vi.mock("../internal/utils/shouldUseStandaloneLocalPrompt.ts", () => ({
  shouldUseStandaloneLocalPrompt: () => false,
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
});
