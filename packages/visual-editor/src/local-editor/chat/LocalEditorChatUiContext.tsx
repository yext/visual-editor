import React from "react";
import type { useLocalEditorChat } from "./useLocalEditorChat.ts";

type Chat = ReturnType<typeof useLocalEditorChat>;

type LocalEditorChatUi = {
  chat: Chat;
  disabled: boolean;
};

/** Private UI state; the canvas bridge remains independent of panel visibility. */
export const LocalEditorChatUiContext =
  React.createContext<LocalEditorChatUi | null>(null);

/** Only the composer subscribes to draft changes, never the Puck editor. */
export const LocalEditorChatDraftContext = React.createContext<{
  draft: string;
  setDraft: (draft: string) => void;
} | null>(null);

/** Key this provider by layout so drafts survive editor remounts, but not layout changes. */
export const LocalEditorChatUiProvider = ({
  chat,
  disabled,
  children,
}: {
  chat: Chat | null;
  disabled: boolean;
  children: React.ReactNode;
}) => {
  const [draft, setDraft] = React.useState("");
  const ui = React.useMemo(
    () => (chat ? { chat, disabled } : null),
    [chat, disabled]
  );
  const draftState = React.useMemo(() => ({ draft, setDraft }), [draft]);
  return (
    <LocalEditorChatUiContext.Provider value={ui}>
      <LocalEditorChatDraftContext.Provider value={draftState}>
        {children}
      </LocalEditorChatDraftContext.Provider>
    </LocalEditorChatUiContext.Provider>
  );
};
