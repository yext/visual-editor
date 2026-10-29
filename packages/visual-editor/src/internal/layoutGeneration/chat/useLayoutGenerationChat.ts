import React from "react";
import { runEdits } from "../workflows/edits/runEdits.ts";
import type {
  SectionEditPlan,
  SectionEditTask,
  SectionTaskOutcome,
} from "../workflows/edits/types.ts";
import { isBlankGenerationPage } from "../workflows/fullPageGeneration/isBlankGenerationPage.ts";
import { runFullGeneration } from "../workflows/fullPageGeneration/runFullGeneration.ts";
import {
  GENERATION_CANDIDATE_MAX_CHARACTERS,
  GENERATION_ERROR_MAX_CHARACTERS,
  GENERATION_STACK_MAX_CHARACTERS,
  PUCK_HISTORY_SETTLE_DELAY_MS,
} from "../limits.ts";
import type {
  ConversationMessage,
  GenerationEnvironment,
  GenerationRequestExecutor,
} from "../shared/contracts.ts";
import { executeGeneration as requestChatGeneration } from "../transport/executeGeneration.ts";
import { LayoutGenerationChatCanvas } from "./LayoutGenerationChatCanvas.ts";
import type { SectionTaskProgress } from "./chatProgress.ts";
import { summarizeSectionOutcomes } from "./chatProgress.ts";

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  pending?: boolean;
  sections?: SectionTaskProgress[];
};

/** Keep conversation prose separate from the generated canvas data. */
export const useLayoutGenerationChat = (
  environment: GenerationEnvironment | null,
  layoutId: string
) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [canvas] = React.useState(() => new LayoutGenerationChatCanvas());
  canvas.catalog = environment?.catalog;

  const ready = React.useSyncExternalStore(
    canvas.subscribe,
    canvas.getReady,
    () => false
  );

  const previousMessagesRef = React.useRef<ChatMessage[]>([]);
  const history = React.useRef<ConversationMessage[]>([]);
  const activeRequest = React.useRef<AbortController | null>(null);
  const finalizeCancelled = React.useRef<(() => void) | null>(null);
  const diagnostics = React.useRef<Record<string, unknown>>({});
  const diagnosticSequence = React.useRef(0);

  canvas.onDiagnostic = (phase, details) => {
    if (typeof diagnostics.current.correlationId !== "string") {
      return;
    }
    environment?.diagnostics.report("diagnostics", {
      layoutId,
      correlationId: diagnostics.current.correlationId,
      sequence: diagnosticSequence.current++,
      phase,
      details,
    });
  };

  const reportError = (cause: unknown) => {
    const error = cause instanceof Error ? cause : new Error(String(cause));
    const details: Record<string, unknown> = {
      ...diagnostics.current,
      layoutId,
      error: error.message.slice(0, GENERATION_ERROR_MAX_CHARACTERS),
      stack: error.stack?.slice(0, GENERATION_STACK_MAX_CHARACTERS),
    };
    const candidateJson = JSON.stringify(details.candidate);
    if (
      candidateJson &&
      candidateJson.length > GENERATION_CANDIDATE_MAX_CHARACTERS
    ) {
      details.candidate = { omitted: true, characters: candidateJson.length };
    }
    console.error("[layout generation] Chat failed", details);
    setError(error);
    environment?.diagnostics.report("error", details);
  };

  const cancel = React.useCallback(() => {
    activeRequest.current?.abort();
    canvas.finish();
    if (finalizeCancelled.current) {
      finalizeCancelled.current();
    } else {
      setMessages(previousMessagesRef.current);
    }
    finalizeCancelled.current = null;
    activeRequest.current = null;
    setIsStreaming(false);
    setIsCreating(false);
  }, [canvas]);
  canvas.onError = (cause) => {
    cancel();
    reportError(cause);
  };

  const clear = React.useCallback(() => {
    cancel();
    history.current = [];
    previousMessagesRef.current = [];
    setMessages([]);
    setError(null);
  }, [cancel]);

  React.useLayoutEffect(() => {
    clear();
    return () => cancel();
  }, [environment?.model, environment?.transport, layoutId, clear, cancel]);

  const send = async (prompt: string) => {
    if (
      !environment ||
      !prompt.trim() ||
      activeRequest.current ||
      !canvas.ready
    ) {
      return;
    }

    const correlationId = crypto.randomUUID();
    diagnostics.current = {
      correlationId,
      phase: "read-layout",
      historyMessageCount: history.current.length,
    };

    const controller = new AbortController();
    activeRequest.current = controller;

    const active = () =>
      activeRequest.current === controller && !controller.signal.aborted;

    const user: ConversationMessage = { role: "user", content: prompt.trim() };
    const previousMessages = previousMessagesRef.current;
    const nextMessages: ChatMessage[] = [
      ...previousMessages,
      { role: "user", text: user.content },
    ];
    const requestMessages = [...history.current, user];

    let plan: SectionEditPlan | undefined;
    let createdSections = 0;
    const taskOutcomes = new Map<string, SectionTaskOutcome>();
    let completed = false;

    const progress = new Map<string, SectionTaskProgress>();

    const showProgress = (text: string) => {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          text,
          pending: true,
          sections: [...progress.values()],
        },
      ]);
    };

    const updateProgress = (
      task: SectionEditTask,
      status: SectionTaskProgress["status"],
      message?: string
    ) => {
      if (!active()) {
        return;
      }

      const previous = progress.get(task.taskId);
      if (!previous) {
        return;
      }

      progress.set(task.taskId, { ...previous, status, message });

      const applied = [...progress.values()].filter(
        (item) => item.status === "applied"
      ).length;

      showProgress(`${applied} of ${progress.size} sections applied.`);
    };
    const complete = (
      text: string,
      sections?: SectionTaskProgress[],
      historyText = text
    ) => {
      if (completed) {
        return;
      }

      completed = true;
      const result: ChatMessage[] = [
        ...nextMessages,
        { role: "assistant", text, sections },
      ];
      setMessages(result);
      previousMessagesRef.current = result;
      history.current = [
        ...requestMessages,
        { role: "assistant", content: historyText },
      ];
    };

    const completeEdits = (reason?: string) => {
      if (!plan) {
        return;
      }

      const actual = plan.tasks.map(
        (task): SectionTaskOutcome =>
          taskOutcomes.get(task.taskId) ?? {
            taskId: task.taskId,
            sectionId: task.sectionId,
            status: "cancelled",
            message: "Stopped before application completed.",
          }
      );

      const sections = actual.map((outcome): SectionTaskProgress => ({
        ...progress.get(outcome.taskId)!,
        status: outcome.status,
        message: outcome.message,
      }));

      const text = [
        actual.length
          ? summarizeSectionOutcomes(actual)
          : plan.intent === "clarification"
            ? plan.clarification
            : plan.text,
        actual.length ? plan.limitations : null,
        plan.globalStyleGuidance,
        reason,
      ]
        .filter(Boolean)
        .join("\n\n");
      const details = sections
        .map(
          (section) =>
            `${section.label}: ${section.status}. ${section.description} ${section.message}`
        )
        .join("\n");
      complete(text, sections, [text, details].filter(Boolean).join("\n\n"));
    };

    finalizeCancelled.current = () => {
      if (plan) {
        completeEdits("Request cancelled.");
      } else {
        canvas.onDiagnostic("creation-stopped", {
          outcome: "cancelled",
          sectionCount: createdSections,
        });
        complete("Request cancelled before any changes were applied.");
      }
    };

    setMessages([
      ...nextMessages,
      { role: "assistant", text: "Generating layout…", pending: true },
    ]);
    setIsStreaming(true);
    setError(null);

    const request: GenerationRequestExecutor = (
      body,
      signal = controller.signal,
      onCreationContent
    ) =>
      requestChatGeneration(
        body,
        environment,
        signal,
        correlationId,
        onCreationContent
      );
    try {
      const selectedComponentId = canvas.selectedComponentId;
      const currentData = canvas.begin();
      const fresh = isBlankGenerationPage(currentData);
      setIsCreating(fresh);
      const sectionLabels = fresh ? {} : canvas.sectionLabels;
      showProgress(fresh ? "Generating layout…" : "Planning changes…");
      // Puck records manual changes after 250ms; let pending history settle.
      await new Promise<void>((resolve) =>
        setTimeout(resolve, PUCK_HISTORY_SETTLE_DELAY_MS)
      );
      if (!active()) {
        return;
      }
      diagnostics.current.phase = fresh ? "request" : "planning";
      const turn = {
        layoutId,
        currentData,
        messages: requestMessages,
        signal: controller.signal,
        active,
        request,
      };
      if (fresh) {
        const text = await runFullGeneration({
          ...turn,
          canvas,
          onProgress: (event) => {
            switch (event.phase) {
              case "preparing":
                showProgress("Checking page requirements…");
                break;
              case "generating":
                showProgress("Generating layout…");
                break;
              case "revealed":
                createdSections = event.sectionCount;
                diagnostics.current.phase = "streaming-creation";
                showProgress(
                  `${createdSections} sections applied. Generating layout…`
                );
                break;
              case "applying":
                diagnostics.current.phase = "resolve-and-commit";
                diagnostics.current.candidate = event.candidate;
                showProgress("Applying layout…");
                break;
              case "resolved":
                createdSections = event.sectionCount;
                break;
              case "complete":
                createdSections = event.sectionCount;
                canvas.onDiagnostic("creation-stopped", {
                  outcome: "complete",
                  sectionCount: createdSections,
                });
                break;
            }
          },
        });
        if (text !== undefined && active()) {
          complete(text);
        }
      } else {
        const result = await runEdits({
          ...turn,
          canvas,
          selectedComponentId,
          onProgress: (event) => {
            if (event.phase === "planning") {
              showProgress(
                event.retrying ? "Retrying plan…" : "Planning changes…"
              );
            } else if (event.phase === "section") {
              updateProgress(event.task, event.status);
            } else {
              plan = event.plan;
              plan.tasks.forEach((task, index) => {
                const insertion = task.structuralOperations.find(
                  (operation) => operation.kind === "insert"
                );
                progress.set(task.taskId, {
                  taskId: task.taskId,
                  sectionId: task.sectionId,
                  label:
                    sectionLabels[task.sectionId] ??
                    (insertion?.kind === "insert"
                      ? `New section · ${insertion.componentType}`
                      : `Section ${index + 1}`),
                  description: task.description ?? "Update this section.",
                  status: task.dependsOn.length ? "waiting" : "pending",
                });
              });
              showProgress(`0 of ${plan.tasks.length} sections applied.`);
              diagnostics.current.phase = "section-execution";
            }
          },
          onOutcome: (outcome) => {
            canvas.onDiagnostic("task-outcome", { ...outcome });
            if (active()) {
              taskOutcomes.set(outcome.taskId, outcome);
              const task = plan!.tasks.find(
                (task) => task.taskId === outcome.taskId
              )!;
              updateProgress(task, outcome.status, outcome.message);
            }
          },
        });
        if (!active()) {
          return;
        }
        completeEdits();
        if (result?.error) {
          reportError(result.error);
        }
      }
    } catch (cause) {
      if (!active()) {
        return;
      }

      if (plan) {
        completeEdits("Request stopped before completion.");
      } else {
        canvas.onDiagnostic("creation-stopped", {
          outcome: "failed",
          sectionCount: createdSections,
        });
        complete("Request failed before any changes were applied.");
      }
      reportError(cause);
    } finally {
      if (activeRequest.current === controller) {
        canvas.finish();
        activeRequest.current = null;
        finalizeCancelled.current = null;
        setIsStreaming(false);
        setIsCreating(false);
      }
    }
  };
  return {
    messages,
    isStreaming,
    isCreating,
    send,
    clear,
    error,
    canvas,
    ready,
    cancel: () => cancel(),
  };
};
