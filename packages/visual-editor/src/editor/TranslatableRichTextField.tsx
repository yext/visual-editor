import { TranslatableRichText } from "../types/types.ts";
import { useDocument } from "../hooks/useDocument.tsx";
import { usePlatformTranslation } from "../utils/i18nPlatform.ts";
import { Translation } from "../internal/types/translation.ts";
import { CustomField, FieldLabel } from "@measured/puck";
import { getDisplayValue } from "../utils/resolveTranslatableString.tsx";
import React from "react";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../internal/hooks/useMessage.ts";

/**
 * Generates a translatableRichText field config
 * @param label optional label. Takes in translation key and TOptions from react-i18next
 */
export function TranslatableRichTextField<
  T extends TranslatableRichText | undefined = TranslatableRichText,
>(label?: Translation): CustomField<T> {
  return {
    type: "custom",
    render: ({ onChange, value }) => {
      const document: { locale: string } = useDocument();
      const locale = document?.locale ?? "en";
      const { t } = usePlatformTranslation();
      const resolvedValue = getDisplayValue(value, locale);
      const fieldLabel =
        (label && t(label.key, label.options)) + ` (${locale})`;

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
        } as T);
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
