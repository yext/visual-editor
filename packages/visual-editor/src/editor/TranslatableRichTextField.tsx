import { TranslatableRichText } from "../types/types.ts";
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
            handleNewValue(payload.value);
          }
        }
      );

      const handleClick = () => {
        const messageId = `RichText-${Date.now()}`;
        setPendingMessageId(messageId);
        openConstantValueEditor({
          payload: {
            type: "RichText",
            value: resolvedValue,
            id: messageId,
            fieldName: fieldLabel,
          },
        });

        // localDev
        if (
          window.location.href.includes("http://localhost:5173/dev-location")
        ) {
          handleNewValue(prompt("Enter text:") ?? "");
        }
      };

      const handleNewValue = (newValue: string) => {
        onChange({
          ...(typeof value === "object" && !Array.isArray(value) ? value : {}),
          [locale]: newValue,
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
