import { TranslatableRichText, RichText } from "../types/types.ts";
import { MsgString, pt } from "../utils/i18n/platform.ts";
import { CustomField, FieldLabel } from "@measured/puck";
import { resolveTranslatableRichText } from "../utils/resolveTranslatableString.tsx";
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
      const resolvedValue = resolveTranslatableRichText(value, locale);
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
