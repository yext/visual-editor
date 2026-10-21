import { Send, Square } from "lucide-react";
import React from "react";
import { LayoutGenerationChatDraftContext } from "./contexts.tsx";
import type { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";

/** Keep keystrokes local to the composer, away from the transcript and Puck. */
export const LayoutGenerationChatComposer = ({
  chat,
  disabled,
  active,
}: {
  chat: ReturnType<typeof useLayoutGenerationChat>;
  disabled: boolean;
  active: boolean;
}) => {
  const draftState = React.useContext(LayoutGenerationChatDraftContext);
  if (!draftState) {
    throw new Error("Layout chat requires a draft provider.");
  }
  const { draft, setDraft } = draftState;
  const promptRef = React.useRef<HTMLTextAreaElement>(null);
  const scheduleResizeRef = React.useRef<(() => void) | null>(null);

  React.useLayoutEffect(() => {
    const textarea = promptRef.current;
    if (!textarea || !active) {
      return;
    }
    // Native sizing avoids forced layout measurements on every input event.
    if (
      typeof CSS !== "undefined" &&
      CSS.supports?.("field-sizing", "content")
    ) {
      return;
    }
    // Fallback for browsers without field-sizing. Coalesce measurements into
    // one animation frame and keep the observer alive while the panel is open.
    let frame: number | null = null;
    const scheduleResize = () => {
      if (frame !== null) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = null;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
      });
    };
    scheduleResizeRef.current = scheduleResize;
    let width = -1;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width !== width) {
        width = entry.contentRect.width;
        scheduleResize();
      }
    });
    observer.observe(textarea);
    scheduleResize();
    return () => {
      observer.disconnect();
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
      scheduleResizeRef.current = null;
    };
  }, [active]);

  React.useLayoutEffect(() => {
    scheduleResizeRef.current?.();
  }, [draft]);

  const busy = disabled || chat.isStreaming;
  return (
    <form
      className="local-editor-chat-composer"
      onSubmit={(event) => {
        event.preventDefault();
        if (draft.trim() && !busy) {
          void chat.send(draft.trim());
          setDraft("");
        }
      }}
    >
      <textarea
        ref={promptRef}
        rows={3}
        name="prompt"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Describe what you want"
        placeholder="Describe what you want to change…"
        required
        disabled={disabled}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            if (!busy) {
              event.currentTarget.form?.requestSubmit();
            }
          }
        }}
      />
      <div className="local-editor-chat-composer-actions">
        <span
          className={
            chat.isStreaming ? undefined : "local-editor-chat-keyboard-hint"
          }
        >
          {chat.isStreaming
            ? "Generating…"
            : "Enter to send · Shift+Enter for a new line"}
        </span>
        <div className="local-editor-chat-submit-actions">
          {chat.isStreaming && (
            <button
              type="button"
              className="local-editor-chat-stop"
              aria-label="Stop generating"
              onClick={chat.cancel}
            >
              <Square size={14} aria-hidden="true" />
              Stop
            </button>
          )}
          <button
            type="submit"
            className="local-editor-chat-send"
            disabled={busy}
          >
            <Send size={14} aria-hidden="true" />
            Send
          </button>
        </div>
      </div>
    </form>
  );
};
