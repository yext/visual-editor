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
import { useTranslation } from "react-i18next";

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

      const [pendingMessageId, setPendingMessageId] = React.useState<
        string | undefined
      >();

      const { sendToParent: openConstantValueEditor } = useSendMessageToParent(
        "constantValueEditorOpened",
        TARGET_ORIGINS
      );

      useReceiveMessage(
        "constantValueEditorClosed",
        TARGET_ORIGINS,
        (_, payload) => {
          if (pendingMessageId && pendingMessageId === payload?.id) {
            handleNewValue(payload.value, payload.locale);
          }
        }
      );

      const handleClick = () => {
        const messageId = `RichText-${Date.now()}`;
        setPendingMessageId(messageId);
        const valueForCurrentLocale =
          typeof value === "object" && value !== null && !Array.isArray(value)
            ? (value as Record<string, any>)[locale]
            : undefined;

        const initialValue = React.isValidElement(resolvedValue)
          ? valueForCurrentLocale?.json
          : valueForCurrentLocale;

        openConstantValueEditor({
          payload: {
            type: "RichTextValue", // type: "RichText" is being used in artifact 0.0.8
            value: initialValue,
            id: messageId,
            fieldName: fieldLabel,
            locale: locale,
          },
        });

        /** Handles local development testing outside of storm */
        if (
          window.location.href.includes("http://localhost:5173/dev-location")
        ) {
          const userInput = prompt("Enter Rich Text (HTML):");
          handleNewValue({ json: "", html: userInput ?? "" }, locale);
        }
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

/** Returns a simple RTF-format p tag wrapper for text  */
export const getDefaultRTF = (
  text: string,
  options?: GetDefaultRTFOptions
): RichText => {
  const isBold = options?.isBold ?? false;
  const format = isBold ? 1 : 0;
  const fontWeight = isBold ? "700 !important" : "400";
  const tag = isBold ? "strong" : "span";

  return {
    json: `{"root":{"children":[{"children":[{"detail":0,"format":${format},"mode":"normal","style":"","text":"${text}","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`,
    html: `<p dir="ltr" style="font-size: 14.67px; font-weight: ${fontWeight}; line-height: 18.67px; color: rgb(0, 0, 0); margin: 0; padding: 3px 2px 3px 2px; position: relative;"><${tag}>${text}</${tag}></p>`,
  };
};
