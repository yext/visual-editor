import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import {
  TARGET_ORIGINS,
  useReceiveMessage,
  useSendMessageToParent,
} from "../internal/hooks/useMessage.ts";
import { pt, type MsgString } from "../utils/i18n/platform.ts";

let pendingCodeSession:
  { messageId: string; apply: (payload: any) => void } | undefined;

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
  /** Processes HTML templates and JavaScript embedded fields; other code stays authored. */
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
  };

  const codeField =
    window.parent === window.self ? (
      <textarea
        aria-label={translatedLabel || undefined}
        className="ve-w-full ve-min-h-40 ve-rounded ve-border ve-p-3 ve-font-mono ve-text-sm"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    ) : (
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
