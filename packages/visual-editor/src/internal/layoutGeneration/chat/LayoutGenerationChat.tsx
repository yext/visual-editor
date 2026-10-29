import { msg, pt } from "../../../utils/i18n/platform.ts";
import React from "react";
import { LoaderCircle, MessageSquare, RotateCcw } from "lucide-react";
import { LayoutGenerationChatComposer } from "./LayoutGenerationChatControls.tsx";
import "./layoutGenerationChat.css";
import type { SectionTaskProgress } from "./chatProgress.ts";
import type { useLayoutGenerationChat } from "./useLayoutGenerationChat.ts";
import { IntentPageGenerationChatContext } from "./useIntentPageGeneration.ts";

const statusLabels: Record<SectionTaskProgress["status"], string> = {
  pending: msg("layoutGenerationChat.status.pending", "Queued"),
  waiting: "Waiting",
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
  const intent = React.useContext(IntentPageGenerationChatContext);

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
          className="local-editor-chat-log"
          role="log"
          aria-label={pt(
            "layoutGenerationChat.conversation",
            "Generation conversation"
          )}
        >
          {!chat.messages.length && !intent?.eligible && (
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
                            {(section.status === "generating" ||
                              section.status === "retrying") && (
                              <span
                                className="local-editor-chat-progress-dots"
                                aria-hidden="true"
                              >
                                ...
                              </span>
                            )}
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
          {intent?.eligible &&
            !["generating", "clarification", "saving", "completed"].includes(
              intent.state.stage
            ) &&
            !(
              intent.state.stage === "idle" && intent.status === "COMPLETED"
            ) && (
              <div className="local-editor-chat-message" data-role="assistant">
                <span className="local-editor-chat-role">Assistant</span>
                <p role="status">
                  {intent.state.stage === "interrupted"
                    ? "Generation may have been interrupted. You can restart it here."
                    : (intent.state.message ??
                      (intent.state.stage === "idle"
                        ? intent.status === "FAILED"
                          ? "Page generation failed."
                          : `Intent page generation: ${intent.status?.toLowerCase() ?? "ready"}`
                        : `Intent page generation: ${intent.state.stage}`))}
                </p>
                {intent.state.stage === "interrupted" &&
                  intent.state.message && (
                    <p className="local-editor-chat-error" role="alert">
                      {intent.state.message}
                    </p>
                  )}
                {(intent.workflow.canRestart || intent.workflow.restarting) && (
                  <>
                    <p id="intent-generation-restart-description">
                      Restarting will replace the previous attempt.
                    </p>
                    <button
                      type="button"
                      onClick={intent.workflow.restart}
                      disabled={
                        intent.state.busy ||
                        disabled ||
                        !chat.ready ||
                        chat.isStreaming
                      }
                      aria-describedby="intent-generation-restart-description"
                    >
                      Restart generation
                    </button>
                  </>
                )}
                {intent.state.stage === "recovery" && (
                  <>
                    <button type="button" onClick={intent.workflow.recover}>
                      {intent.workflow.recoveryAction === "save"
                        ? "Retry draft save"
                        : "Check draft save status"}
                    </button>
                    {intent.workflow.canRetrySave &&
                      intent.workflow.recoveryAction === "complete" && (
                        <button
                          type="button"
                          onClick={intent.workflow.retrySave}
                        >
                          Recheck attempt and save draft
                        </button>
                      )}
                  </>
                )}
              </div>
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
          canCancel={
            chat.isStreaming || intent?.state.stage === "clarification"
          }
        />
        <footer className="local-editor-chat-footer">
          <button
            type="button"
            className="local-editor-chat-reset"
            onClick={chat.clear}
            disabled={chat.isStreaming || !!intent?.workflow.blocked}
          >
            <RotateCcw size={13} aria-hidden="true" />
            {pt("layoutGenerationChat.newConversation", "New conversation")}
          </button>
        </footer>
      </div>
    </aside>
  );
};
