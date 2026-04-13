import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../internal/hooks/useMessage.ts";
import { pt, type MsgString } from "../utils/i18n/platform.ts";

let pendingCodeSession:
  | { messageId: string; apply: (payload: any) => void }
  | undefined;

export type CodeLanguageOptions =
  | "html"
  | "css"
  | "json"
  | "shell"
  | "java"
  | "javascript"
  | "jsx"
  | "markdown"
  | "typescript";

export type CodeField = BaseField & {
  type: "code";
  label?: string | MsgString;
  visible?: boolean;
  codeLanguage: CodeLanguageOptions;
};

type CodeFieldOverrideProps = FieldProps<CodeField> & {
  children: React.ReactNode;
};

export const CodeFieldOverride = ({
  field,
  value,
  onChange,
}: CodeFieldOverrideProps) => {
  const { label, codeLanguage } = field;

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

  const translatedLabel = label && pt(label);

  const handleClick = () => {
    const messageId = `CodeBlock-${Date.now()}`;
    pendingCodeSession = {
      messageId,
      apply: (payload) => onChange(payload.value),
    };

    openConstantValueEditor({
      payload: {
        type: "Code",
        value,
        id: messageId,
        fieldName: translatedLabel,
        codeLanguage,
      },
    });

    /** Handles local development testing outside of storm */
    if (window.location.href.includes("http://localhost:5173/dev-location")) {
      const userInput = prompt("Enter Code:");
      onChange(userInput ?? "");
      if (pendingCodeSession?.messageId === messageId) {
        pendingCodeSession = undefined;
      }
    }
  };

  const codeField = (
    <button type="button" className="CodeField" onClick={handleClick}>
      <div className="ve-line-clamp-3">{value}</div>
    </button>
  );

  return translatedLabel ? (
    <FieldLabel label={translatedLabel}>{codeField}</FieldLabel>
  ) : (
    codeField
  );
};
