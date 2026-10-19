import { validateTaskGraph } from "../../internal/generation/editUtils.ts";
import React from "react";
import { reportChatDiagnostic, reportChatError } from "./chatDiagnostics.ts";
import type { SectionTaskProgress } from "./chatProgress.ts";
import { summarizeSectionOutcomes } from "./chatProgress.ts";
import { LocalEditorChatCanvas } from "./LocalEditorChatCanvas.ts";
import type { GenerationTokenUsage } from "../types.ts";
import type {
  LayoutGenerationRequest,
  SectionEditPlan,
  SectionEditTask,
  SectionTaskOutcome,
} from "../../internal/generation/editProtocol.ts";
import { isBlankGenerationPage } from "../../internal/generation/isBlankGenerationPage.ts";
import {
  ChatGenerationError,
  requestChatGeneration,
} from "./chatGenerationRequest.ts";
import { repairChatOutput, runSectionTasks } from "./sectionTaskRunner.ts";

type ConversationMessage = { role: "user" | "assistant"; content: string };
type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  pending?: boolean;
  sections?: SectionTaskProgress[];
};

/** Keep conversation prose separate from the generated canvas data. */
export const useLocalEditorChat = (api: string, layoutId: string) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [usage, setUsage] = React.useState<GenerationTokenUsage>({
    cachedInput: 0,
    uncachedInput: 0,
    output: 0,
  });
  const [canvas] = React.useState(() => new LocalEditorChatCanvas());
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
    reportChatDiagnostic(api, {
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
      error: error.message.slice(0, 32_768),
      stack: error.stack?.slice(0, 65_536),
    };
    const candidateJson = JSON.stringify(details.candidate);
    if (candidateJson && candidateJson.length > 500_000) {
      details.candidate = { omitted: true, characters: candidateJson.length };
    }
    console.error("[local-editor generation] Chat failed", details);
    setError(error);
    reportChatError(api, details);
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
    setUsage({ cachedInput: 0, uncachedInput: 0, output: 0 });
    setError(null);
  }, [cancel]);
  React.useEffect(() => {
    clear();
    return cancel;
  }, [api, layoutId, clear, cancel]);

  const send = async (prompt: string) => {
    if (!prompt.trim() || activeRequest.current || !canvas.ready) {
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
        complete("Request cancelled before any changes were applied.");
      }
    };
    setMessages([
      ...nextMessages,
      { role: "assistant", text: "Generating layout…", pending: true },
    ]);
    setIsStreaming(true);
    setError(null);
    const request = (
      body: LayoutGenerationRequest,
      signal = controller.signal
    ) =>
      requestChatGeneration(api, body, signal, correlationId, (added) => {
        if (active() && !signal.aborted) {
          setUsage((current) => ({
            cachedInput: current.cachedInput + added.cachedInput,
            uncachedInput: current.uncachedInput + added.uncachedInput,
            output: current.output + added.output,
          }));
        }
      });
    try {
      const selectedComponentId = canvas.selectedComponentId;
      const currentData = canvas.begin();
      const fresh = isBlankGenerationPage(currentData);
      const sectionLabels = fresh ? {} : canvas.sectionLabels;
      showProgress(fresh ? "Generating layout…" : "Planning changes…");
      // Puck records manual changes after 250ms; let pending history settle.
      await new Promise<void>((resolve) => setTimeout(resolve, 260));
      if (!active()) {
        return;
      }
      diagnostics.current.phase = fresh ? "request" : "planning";
      if (fresh) {
        showProgress("Checking page requirements…");
        const prepared = await repairChatOutput((validationFeedback) =>
          request({
            mode: "prepare",
            layoutId,
            currentData,
            messages: requestMessages,
            validationFeedback,
          })
        );
        if (!active()) return;
        if (prepared.type !== "prepared") {
          throw new Error("Expected page preparation output.");
        }
        if (prepared.preparation.question) {
          complete(prepared.preparation.question);
          return;
        }
        showProgress("Generating layout…");
        const event = await repairChatOutput((validationFeedback) =>
          request({
            mode: "create",
            layoutId,
            currentData,
            messages: requestMessages,
            preparation: prepared.preparation,
            validationFeedback,
          })
        );
        if (!active()) {
          return;
        }
        if (event.type !== "accepted") {
          throw new Error("Expected fresh generation output.");
        }
        diagnostics.current.phase = "resolve-and-commit";
        diagnostics.current.candidate = event.spec;
        showProgress("Applying layout…");
        await canvas.commit(event.spec);
        if (active()) {
          complete(event.text);
        }
      } else {
        plan = await repairChatOutput(async (validationFeedback) => {
          if (active()) {
            showProgress(
              validationFeedback ? "Retrying plan…" : "Planning changes…"
            );
          }
          const event = await request({
            mode: "plan",
            layoutId,
            currentData,
            messages: requestMessages,
            selectedComponentId,
            validationFeedback,
          });
          if (event.type !== "planned") {
            throw new ChatGenerationError("Expected an edit plan.", true);
          }
          try {
            validateTaskGraph(event.plan.tasks);
          } catch (cause) {
            throw new ChatGenerationError(String(cause), true);
          }
          return event.plan;
        });
        if (!active()) {
          return;
        }
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
        const result = await runSectionTasks({
          tasks: plan.tasks,
          signal: controller.signal,
          generate: async (task, signal, validationFeedback) => {
            const event = await request(
              {
                mode: "section",
                layoutId,
                messages: requestMessages,
                currentData: canvas.read(task),
                task,
                sharedIntent: plan!.sharedIntent,
                validationFeedback,
              },
              signal
            );
            if (event.type !== "section-result") {
              throw new ChatGenerationError("Expected a section result.", true);
            }
            return event.result;
          },
          commit: async (task, result, signal) => {
            if (!active()) {
              throw new Error("Generation cancelled.");
            }
            await canvas.commitSection(task, result, signal, () =>
              updateProgress(task, "applying")
            );
          },
          onProgress: updateProgress,
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
        if (result.error) {
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
        complete("Request failed before any changes were applied.");
      }
      reportError(cause);
    } finally {
      if (activeRequest.current === controller) {
        canvas.finish();
        activeRequest.current = null;
        finalizeCancelled.current = null;
        setIsStreaming(false);
      }
    }
  };
  return {
    messages,
    isStreaming,
    send,
    clear,
    error,
    usage,
    canvas,
    ready,
    cancel,
  };
};
