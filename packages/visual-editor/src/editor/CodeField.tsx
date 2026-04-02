import { CustomField, FieldLabel } from "@puckeditor/core";
import React from "react";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../internal/hooks/useMessage.ts";
import { pt } from "../utils/i18n/platform.ts";

let pendingCodeSession:
  | { messageId: string; apply: (payload: any) => void }
  | undefined;

const shouldUseStandaloneLocalPrompt = (): boolean => {
  return (
    window.parent === window ||
    window.location.href.includes("http://localhost:5173/dev-location")
  );
};

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
          const session = pendingCodeSession;
          if (!session || session.messageId !== payload?.id) {
            return;
          }
          pendingCodeSession = undefined;
          session.apply(payload);
        }
      );

      const handleClick = () => {
        const messageId = `CodeBlock-${Date.now()}`;
        pendingCodeSession = {
          messageId,
          apply: (payload) => onChange(payload.value),
        };

        if (shouldUseStandaloneLocalPrompt()) {
          const userInput = prompt("Enter Code:");
          onChange(userInput ?? "");
          if (pendingCodeSession?.messageId === messageId) {
            pendingCodeSession = undefined;
          }
          return;
        }

        openConstantValueEditor({
          payload: {
            type: "Code",
            value: value,
            id: messageId,
            fieldName: pt(fieldLabel),
            codeLanguage: codeLanguage,
          },
        });
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
