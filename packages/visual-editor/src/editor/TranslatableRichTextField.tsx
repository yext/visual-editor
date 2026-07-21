import { TranslatableRichText, RichText } from "../types/types.ts";
import { MsgString, pt } from "../utils/i18n/platform.ts";
import { CustomField, FieldLabel } from "@puckeditor/core";
import { resolveComponentData } from "../utils/resolveComponentData.tsx";
import React from "react";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../internal/hooks/useMessage.ts";
import { shouldUseStandaloneLocalPrompt } from "../internal/utils/shouldUseStandaloneLocalPrompt.ts";
import { useTranslation } from "react-i18next";
import { RepeatedSourceFieldContext } from "../fields/repeatedSourceFieldContext.ts";

let pendingRichTextSession:
  | { messageId: string; apply: (payload: any) => void }
  | undefined;

/**
 * Generates a translatableRichText field config
 * @param label optional label. Takes in a value from msg
 */
export function TranslatableRichTextField<
  T extends TranslatableRichText | undefined = TranslatableRichText,
>(label?: MsgString): CustomField<T> {
  return {
    type: "custom",
    render: ({ onChange, value }) => {
      const { i18n } = useTranslation();
      const locale = i18n.language;
      const resolvedValue = value && resolveComponentData(value, locale);
      const fieldLabel = label ? `${pt(label)} (${locale})` : "";
      const sourceField = React.useContext(RepeatedSourceFieldContext);

      const { sendToParent: openConstantValueEditor } = useSendMessageToParent(
        "constantValueEditorOpened",
        TARGET_ORIGINS
      );

      useReceiveMessage(
        "constantValueEditorClosed",
        TARGET_ORIGINS,
        (_, payload) => {
          const session = pendingRichTextSession;
          if (!session || session.messageId !== payload?.id) {
            return;
          }
          pendingRichTextSession = undefined;
          session.apply(payload);
        }
      );

      const handleClick = () => {
        const messageId = `RichText-${Date.now()}`;
        pendingRichTextSession = {
          messageId,
          apply: (payload) => handleNewValue(payload.value, payload.locale),
        };
        const valueForCurrentLocale =
          typeof value === "object" && value !== null && !Array.isArray(value)
            ? ((value as Record<string, any>)[locale] ??
              (value as Record<string, any>).defaultValue)
            : undefined;

        const initialValue = React.isValidElement(resolvedValue)
          ? valueForCurrentLocale?.json
          : valueForCurrentLocale;

        if (shouldUseStandaloneLocalPrompt()) {
          const userInput = prompt(
            "Enter Rich Text (HTML):",
            typeof valueForCurrentLocale === "object" &&
              "html" in valueForCurrentLocale
              ? valueForCurrentLocale?.html
              : undefined
          );
          if (userInput !== null) {
            handleNewValue({ json: "", html: userInput ?? "" }, locale);
          }
          if (pendingRichTextSession?.messageId === messageId) {
            pendingRichTextSession = undefined;
          }
          return;
        }

        openConstantValueEditor({
          payload: {
            type: "RichTextValue", // type: "RichText" is being used in artifact 0.0.8
            value: initialValue,
            id: messageId,
            fieldName: fieldLabel,
            locale: locale,
            sourceField: sourceField,
          },
        });
      };

      const handleNewValue = (newValue: RichText, localeToUpdate: string) => {
        onChange({
          ...(typeof value === "object" && !Array.isArray(value) ? value : {}),
          [localeToUpdate]: newValue,
          hasLocalizedValue: "true",
        } as TranslatableRichText as T);
      };

      return (
        <FieldLabel label={fieldLabel}>
          <button className="RichTextField" onClick={handleClick}>
            <div className="ve-line-clamp-3">{resolvedValue}</div>
          </button>
        </FieldLabel>
      );
    },
  };
}

export type GetDefaultRTFOptions = {
  isBold?: boolean;
};

/**
 * Returns Lexical rich text and matching HTML for text, preserving paragraphs
 * and line breaks from multiline input.
 */
export const getDefaultRTF = (
  text: string,
  options?: GetDefaultRTFOptions
): RichText => {
  const isBold = options?.isBold ?? false;
  const fontWeight = isBold ? "700 !important" : "400";
  const tag = isBold ? "strong" : "span";
  const paragraphs = text.split(/\r?\n(?:\r?\n)+/);

  return {
    json: JSON.stringify({
      root: {
        children: paragraphs.map((paragraph) => ({
          children: paragraph.split(/\r?\n/).flatMap((line, index) => [
            ...(index > 0 ? [{ type: "linebreak", version: 1 }] : []),
            {
              detail: 0,
              format: isBold ? 1 : 0,
              mode: "normal",
              style: "",
              text: line,
              type: "text",
              version: 1,
            },
          ]),
          direction: "ltr",
          format: "",
          indent: 0,
          type: "paragraph",
          version: 1,
        })),
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1,
      },
    }),
    html: paragraphs
      .map(
        (paragraph) =>
          `<p dir="ltr" style="font-size: 14.67px; font-weight: ${fontWeight}; line-height: 18.67px; margin: 0; padding: 3px 2px 3px 2px; position: relative;"><${tag}>${paragraph
            .split(/\r?\n/)
            .map((line) =>
              line
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;")
            )
            .join("<br/>")}</${tag}></p>`
      )
      .join(""),
  };
};
