import { CustomField, FieldLabel } from "@puckeditor/core";
import React from "react";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../internal/hooks/useMessage.ts";
import { pt } from "../utils/i18n/platform.ts";

let pendingCodeMessageId: string | undefined;

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
      const { sendToParent: openConstantValueEditor } = useSendMessageToParent(
        "constantValueEditorOpened",
        TARGET_ORIGINS
      );

      useReceiveMessage(
        "constantValueEditorClosed",
        TARGET_ORIGINS,
        (_, payload) => {
          if (pendingCodeMessageId && pendingCodeMessageId === payload?.id) {
            onChange(payload.value);
            pendingCodeMessageId = undefined;
          }
        }
      );

      const handleClick = () => {
        const messageId = `CodeBlock-${Date.now()}`;
        pendingCodeMessageId = messageId;

        openConstantValueEditor({
          payload: {
            type: "Code",
            value: value,
            id: messageId,
            fieldName: pt(fieldLabel),
            codeLanguage: codeLanguage,
          },
        });

        /** Handles local development testing outside of storm */
        if (
          window.location.href.includes("http://localhost:5173/dev-location")
        ) {
          const userInput = prompt("Enter Code:");
          onChange(userInput ?? "");
          pendingCodeMessageId = undefined;
        }
      };

      return (
        <FieldLabel label={pt(fieldLabel)}>
          <button className="CodeField" onClick={handleClick}>
            <div className="ve-line-clamp-3">{value}</div>
          </button>
        </FieldLabel>
      );
    },
  };
};
