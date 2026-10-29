import { msg, pt } from "../../../utils/i18n/platform.ts";
import React from "react";
import { LoaderCircle, MessageSquare, RotateCcw } from "lucide-react";
import { LayoutGenerationChatComposer } from "./LayoutGenerationChatControls.tsx";
import "./layoutGenerationChat.css";
import type { SectionTaskProgress } from "./chatProgress.ts";
import type { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";

const statusLabels: Record<SectionTaskProgress["status"], string> = {
  pending: msg("layoutGenerationChat.status.pending", "Queued"),
  waiting: msg(
    "layoutGenerationChat.status.waiting",
    "Waiting for prerequisites"
  ),
  generating: msg(
    "layoutGenerationChat.status.generating",
    "Generating changes"
  ),
  retrying: msg("layoutGenerationChat.status.retrying", "Retrying changes"),
  queued: msg("layoutGenerationChat.status.queued", "Waiting to apply"),
  applying: msg("layoutGenerationChat.status.applying", "Applying changes"),
  applied: msg("layoutGenerationChat.status.applied", "Applied"),
  failed: msg("layoutGenerationChat.status.failed", "Failed"),
  skipped: msg("layoutGenerationChat.status.skipped", "Skipped"),
  cancelled: msg("layoutGenerationChat.status.cancelled", "Cancelled"),
};

/** The in-editor chat interface */
export const LayoutGenerationChat = ({
  chat,
  disabled,
  active,
}: {
  chat: ReturnType<typeof useLayoutGenerationChat>;
  disabled: boolean;
  active: boolean;
}) => {
  const logRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    logRef.current?.scrollTo?.({ top: logRef.current.scrollHeight });
  }, [chat.messages, active]);

  return (
    <aside
      className="local-editor-chat"
      data-local-editor-chat
      aria-label={pt("layoutGenerationChat.label", "Layout chat")}
    >
      <header className="local-editor-chat-header">
        <div className="local-editor-chat-title">
          <span className="local-editor-chat-icon">
            <MessageSquare size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>
              {pt("layoutGenerationChat.title", "Layout Assistant")}
            </strong>
            <span>
              {pt(
                "layoutGenerationChat.subtitle",
                "Build and refine your page"
              )}
            </span>
          </div>
        </div>
      </header>
      <div className="local-editor-chat-body">
        <div
          ref={logRef}
          className="local-editor-chat-log"
          role="log"
          aria-label={pt(
            "layoutGenerationChat.conversation",
            "Generation conversation"
          )}
        >
          {!chat.messages.length && (
            <div className="local-editor-chat-empty">
              <strong>
                {pt(
                  "layoutGenerationChat.emptyTitle",
                  "What would you like to create?"
                )}
              </strong>
              <p>
                {pt(
                  "layoutGenerationChat.emptyDescription",
                  "Describe a page, or ask for a change to the current layout."
                )}
              </p>
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
                            {pt(statusLabels[section.status])}
                          </span>
                          {section.message && section.status !== "applied" && (
                            <details>
                              <summary>
                                {pt("layoutGenerationChat.details", "Details")}
                              </summary>
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
        <LayoutGenerationChatComposer
          chat={chat}
          disabled={disabled}
          active={active}
        />
        <footer className="local-editor-chat-footer">
          <button
            type="button"
            className="local-editor-chat-reset"
            onClick={chat.clear}
            disabled={chat.isStreaming}
          >
            <RotateCcw size={13} aria-hidden="true" />
            {pt("layoutGenerationChat.newConversation", "New conversation")}
          </button>
        </footer>
      </div>
    </aside>
  );
};
