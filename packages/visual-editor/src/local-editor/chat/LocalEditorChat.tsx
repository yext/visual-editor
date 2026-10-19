import React from "react";
import {
  ChevronUp,
  LoaderCircle,
  MessageSquare,
  RotateCcw,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../internal/puck/ui/Popover.tsx";
import { LocalEditorChatComposer } from "./LocalEditorChatComposer.tsx";
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
  active,
}: {
  chat: ReturnType<typeof useLocalEditorChat>;
  disabled: boolean;
  active: boolean;
}) => {
  const logRef = React.useRef<HTMLDivElement>(null);
  const [usageOpen, setUsageOpen] = React.useState(false);
  React.useEffect(() => {
    if (!active) setUsageOpen(false);
  }, [active]);
  React.useEffect(() => {
    logRef.current?.scrollTo?.({ top: logRef.current.scrollHeight });
  }, [chat.messages, active]);
  return (
    <aside
      className="local-editor-chat"
      data-local-editor-chat
      aria-label="Layout chat"
    >
      <header className="local-editor-chat-header">
        <div className="local-editor-chat-title">
          <span className="local-editor-chat-icon">
            <MessageSquare size={18} aria-hidden="true" />
          </span>
          <div>
            <strong>Layout assistant</strong>
            <span>Build and refine your page</span>
          </div>
        </div>
      </header>
      <div className="local-editor-chat-body">
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
        <LocalEditorChatComposer
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
            New conversation
          </button>
          <Popover open={usageOpen} onOpenChange={setUsageOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="local-editor-chat-usage">
                <ChevronUp size={13} aria-hidden="true" />
                Token usage
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="end"
              sideOffset={8}
              className="local-editor-chat-usage-popover ve-w-auto"
              aria-label="Conversation token usage"
              data-local-editor-chat
            >
              Cached input: {chat.usage.cachedInput.toLocaleString()}
              <br />
              Uncached input: {chat.usage.uncachedInput.toLocaleString()}
              <br />
              Output: {chat.usage.output.toLocaleString()}
            </PopoverContent>
          </Popover>
        </footer>
      </div>
    </aside>
  );
};
