import React from "react";
import {
  ChevronDown,
  LoaderCircle,
  MessageSquare,
  RotateCcw,
  Send,
  Square,
} from "lucide-react";
import "./localEditorChat.css";
import type { SectionTaskProgress } from "./chatProgress.ts";
import type { useLocalEditorChat } from "./useLocalEditorChat.ts";

const statusLabels: Record<SectionTaskProgress["status"], string> = {
  pending: "Queued",
  waiting: "Waiting for prerequisites",
  generating: "Generating changes",
  retrying: "Retrying changes",
  queued: "Waiting to apply",
  applying: "Applying changes",
  applied: "Applied",
  failed: "Failed",
  skipped: "Skipped",
  cancelled: "Cancelled",
};

export const LocalEditorChat = ({
  chat,
  disabled,
}: {
  chat: ReturnType<typeof useLocalEditorChat>;
  disabled: boolean;
}) => {
  const [open, setOpen] = React.useState(false);
  const logRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    logRef.current?.scrollTo?.({ top: logRef.current.scrollHeight });
  }, [chat.messages, open]);
  const busy = disabled || chat.isStreaming;
  return (
    <aside
      className="local-editor-chat"
      data-open={open}
      aria-label="Layout chat"
    >
      <header className="local-editor-chat-header">
        {open && (
          <div className="local-editor-chat-title">
            <span className="local-editor-chat-icon">
              <MessageSquare size={18} aria-hidden="true" />
            </span>
            <div>
              <strong>Layout assistant</strong>
              <span>Build and refine your page</span>
            </div>
          </div>
        )}
        {chat.isStreaming && (
          <button
            type="button"
            className="local-editor-chat-stop"
            aria-label="Stop generating"
            onClick={chat.cancel}
          >
            <Square size={13} aria-hidden="true" />
            Stop
          </button>
        )}
        <button
          type="button"
          className="local-editor-chat-toggle"
          aria-expanded={open}
          aria-controls="local-editor-chat"
          onClick={() => setOpen(!open)}
        >
          {open ? (
            <>
              <ChevronDown size={16} aria-hidden="true" />
              Hide chat
            </>
          ) : (
            <>
              {chat.isStreaming ? (
                <LoaderCircle
                  className="local-editor-chat-spinner"
                  size={16}
                  aria-hidden="true"
                />
              ) : (
                <MessageSquare size={16} aria-hidden="true" />
              )}
              {chat.isStreaming ? "Show chat · Generating…" : "Show chat"}
            </>
          )}
        </button>
      </header>
      <div
        id="local-editor-chat"
        className="local-editor-chat-body"
        hidden={!open}
      >
        <div
          ref={logRef}
          className="local-editor-chat-log"
          role="log"
          aria-label="Generation conversation"
        >
          {!chat.messages.length && (
            <div className="local-editor-chat-empty">
              <strong>What would you like to create?</strong>
              <p>Describe a page, or ask for a change to the current layout.</p>
            </div>
          )}
          {chat.messages.map(
            (message, index) =>
              message.text && (
                <div
                  key={index}
                  className="local-editor-chat-message"
                  data-role={message.role}
                >
                  <span className="local-editor-chat-role">
                    {message.role === "user" ? "You" : "Assistant"}
                  </span>
                  <p>
                    {message.pending && (
                      <LoaderCircle
                        className="local-editor-chat-spinner"
                        size={15}
                        aria-hidden="true"
                      />
                    )}
                    {message.text}
                  </p>
                  {!!message.sections?.length && (
                    <ul
                      className="local-editor-chat-sections"
                      aria-label="Section progress"
                    >
                      {message.sections.map((section) => (
                        <li key={section.taskId} data-status={section.status}>
                          <strong>{section.label}</strong>
                          <span>{section.description}</span>
                          <span className="local-editor-chat-section-status">
                            {statusLabels[section.status]}
                          </span>
                          {section.message && section.status !== "applied" && (
                            <details>
                              <summary>Details</summary>
                              <p>{section.message}</p>
                            </details>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
          )}
        </div>
        {chat.error && (
          <p className="local-editor-chat-error" role="alert">
            {chat.error.message}
          </p>
        )}
        <form
          className="local-editor-chat-composer"
          onSubmit={(event) => {
            event.preventDefault();
            const prompt = new FormData(event.currentTarget).get("prompt");
            if (typeof prompt === "string" && prompt.trim() && !busy) {
              void chat.send(prompt.trim());
              event.currentTarget.reset();
            }
          }}
        >
          <textarea
            rows={3}
            name="prompt"
            aria-label="Describe what you want"
            placeholder="Describe what you want to change…"
            required
            disabled={busy}
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
            <span>Enter to send · Shift+Enter for a new line</span>
            <button
              type="submit"
              className="local-editor-chat-send"
              disabled={busy}
            >
              <Send size={14} aria-hidden="true" />
              Send
            </button>
          </div>
        </form>
        <footer className="local-editor-chat-footer">
          <button
            type="button"
            className="local-editor-chat-reset"
            onClick={chat.clear}
            disabled={chat.isStreaming}
          >
            <RotateCcw size={13} aria-hidden="true" />
            New conversation
          </button>
          <details className="local-editor-chat-usage">
            <summary>Token usage</summary>
            <p aria-label="Conversation token usage">
              Cached input: {chat.usage.cachedInput.toLocaleString()}
              <br />
              Uncached input: {chat.usage.uncachedInput.toLocaleString()}
              <br />
              Output: {chat.usage.output.toLocaleString()}
            </p>
          </details>
        </footer>
      </div>
    </aside>
  );
};
