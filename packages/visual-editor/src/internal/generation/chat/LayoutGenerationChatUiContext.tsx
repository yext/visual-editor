import React from "react";
import type { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";

type Chat = ReturnType<typeof useLayoutGenerationChat>;

type LayoutGenerationChatUi = {
  chat: Chat;
  disabled: boolean;
};

/** Private UI state; the canvas bridge remains independent of panel visibility. */
export const LayoutGenerationChatUiContext =
  React.createContext<LayoutGenerationChatUi | null>(null);

/** Only the composer subscribes to draft changes, never the Puck editor. */
export const LayoutGenerationChatDraftContext = React.createContext<{
  draft: string;
  setDraft: (draft: string) => void;
} | null>(null);

/** Key this provider by layout so drafts survive editor remounts, but not layout changes. */
export const LayoutGenerationChatUiProvider = ({
  chat,
  disabled,
  scopeKey,
  children,
}: {
  chat: Chat | null;
  disabled: boolean;
  scopeKey?: string;
  children: React.ReactNode;
}) => {
  const [draft, setDraft] = React.useState("");
  React.useEffect(() => setDraft(""), [scopeKey]);
  const ui = React.useMemo(
    () => (chat ? { chat, disabled } : null),
    [chat, disabled]
  );
  const draftState = React.useMemo(() => ({ draft, setDraft }), [draft]);
  return (
    <LayoutGenerationChatUiContext.Provider value={ui}>
      <LayoutGenerationChatDraftContext.Provider value={draftState}>
        {children}
      </LayoutGenerationChatDraftContext.Provider>
    </LayoutGenerationChatUiContext.Provider>
  );
};
