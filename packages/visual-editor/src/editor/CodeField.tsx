import { CustomField, FieldLabel } from "@measured/puck";
import React from "react";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../internal/hooks/useMessage.ts";

export type codeLanguageOptions =
  | "html"
  | "css"
  | "json"
  | "shell"
  | "java"
  | "javascript"
  | "jsx"
  | "markdown"
  | "typescript";

export type CodeFieldProps = {
  fieldLabel: string;
  codeLanguage: codeLanguageOptions;
};

export const CodeField = ({
  fieldLabel,
  codeLanguage,
}: CodeFieldProps): CustomField<number | string> => {
  return {
    type: "custom",
    render: ({ onChange, value }) => {
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
            onChange(payload.value);
          }
        }
      );

      const handleClick = () => {
        const messageId = `CodeBlock-${Date.now()}`;
        setPendingMessageId(messageId);

        openConstantValueEditor({
          payload: {
            type: "Code",
            value: value,
            id: messageId,
            fieldName: fieldLabel,
            codeLanguage: codeLanguage,
          },
        });

        /** Handles local development testing outside of storm */
        if (
          window.location.href.includes("http://localhost:5173/dev-location")
        ) {
          const userInput = prompt("Enter Code:");
          onChange(userInput ?? "");
        }
      };

      return (
        <FieldLabel label={fieldLabel}>
          <button className="CodeField" onClick={handleClick}>
            <div className="ve-line-clamp-3">{value}</div>
          </button>
        </FieldLabel>
      );
    },
  };
};
