import { TranslatableRichText, RichText } from "../types/types.ts";
import { MsgString, pt } from "../utils/i18nPlatform.ts";
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
            // Handle the new Storm payload structure with locale, rtfJson, and rtfHtml
            if (payload.locale && payload.rtfJson) {
              handleNewValue(payload.rtfJson, payload.locale, payload.rtfHtml);
            } else {
              // Fallback for backward compatibility
              handleNewValue(payload.value || "", locale);
            }
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
            type: "RichText",
            value: initialValue,
            id: messageId,
            fieldName: fieldLabel,
            locale: locale,
          },
        });

        // for local development testing
        if (
          window.location.href.includes("http://localhost:5173/dev-location")
        ) {
          const userInput = prompt("Enter Rich Text (HTML):");
          handleNewValue("", locale, userInput ?? "");
        }
      };

      const handleNewValue = (
        newValue: string,
        targetLocale?: string,
        rtfHtml?: string
      ) => {
        const localeToUpdate = targetLocale || locale;

        // Create a RichText object if we have both JSON and HTML
        const richTextValue = rtfHtml
          ? ({ json: newValue, html: rtfHtml } as RichText)
          : newValue;

        onChange({
          ...(typeof value === "object" && !Array.isArray(value) ? value : {}),
          [localeToUpdate]: richTextValue,
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
