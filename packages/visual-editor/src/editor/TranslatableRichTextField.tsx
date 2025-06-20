import { TranslatableRichText, RichText } from "../types/types.ts";
import { MsgString, pt } from "../utils/i18nPlatform.ts";
import { CustomField, FieldLabel } from "@measured/puck";
import { getDisplayValue } from "../utils/resolveTranslatableString.tsx";
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
      const resolvedValue = getDisplayValue(value, locale);
      const fieldLabel = (label && pt(label)) + ` (${locale})`;

      const { sendToParent: openConstantValueEditor } = useSendMessageToParent(
        "constantValueEditorOpened",
        TARGET_ORIGINS
      );

      const [pendingMessageId, setPendingMessageId] = React.useState<
        string | undefined
      >();
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

        // Extract the appropriate value to send to Storm
        let valueToSend = resolvedValue;
        if (
          typeof value === "object" &&
          value &&
          !Array.isArray(value) &&
          locale in value
        ) {
          const localeValue = (value as Record<string, any>)[locale];
          if (
            typeof localeValue === "object" &&
            localeValue &&
            "json" in localeValue
          ) {
            // If it's a RichText object, send the JSON
            valueToSend = localeValue.json || "";
          } else if (typeof localeValue === "string") {
            // If it's a string, send as is
            valueToSend = localeValue;
          }
        }

        openConstantValueEditor({
          payload: {
            type: "RichText",
            value: valueToSend,
            id: messageId,
            fieldName: fieldLabel,
            locale: locale, // Send the current locale to Storm
          },
        });

        // localDev
        if (
          window.location.href.includes("http://localhost:5173/dev-location")
        ) {
          handleNewValue(prompt("Enter text:") ?? "", locale);
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
