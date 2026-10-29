import { pt } from "../../../utils/i18n/platform.ts";
import React from "react";
import type { IntentGenerationResult } from "../workflows/intentPageGeneration/IntentPageGenerationWorkflow.ts";
import { runEdits } from "../workflows/edits/runEdits.ts";
import type {
  SectionEditPlan,
  SectionEditTask,
  SectionTaskOutcome,
} from "../workflows/edits/types.ts";
import { isBlankGenerationPage } from "../workflows/fullPageGeneration/isBlankGenerationPage.ts";
import { runRegeneration } from "../workflows/fullPageRegeneration/runRegeneration.ts";
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

/** Keep conversation prose separate from the generated canvas data.
 * scopeKey controls chat lifetime; layoutId identifies requests and diagnostics. */
export const useLayoutGenerationChat = (
  environment: GenerationEnvironment | null,
  layoutId: string,
  scopeKey = layoutId
) => {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [isGeneratingPage, setIsGeneratingPage] = React.useState(false);
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
  const regenerationPending = React.useRef(false);
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
    regenerationPending.current = false;
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
    setIsGeneratingPage(false);
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
  }, [
    environment?.model,
    environment?.transport,
    layoutId,
    scopeKey,
    clear,
    cancel,
  ]);

  const run = async (
    prompt: string,
    mode: "chat" | "intent" | "intent-continuation"
  ): Promise<IntentGenerationResult> => {
    if (
      !environment ||
      !prompt.trim() ||
      activeRequest.current ||
      !canvas.ready
    ) {
      return false;
    }

    const isIntent = mode !== "chat";
    let regenerating = regenerationPending.current;
    regenerationPending.current = false;
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
    const requestMessages =
      mode === "intent" ? [user] : [...history.current, user];

    let plan: SectionEditPlan | undefined;
    let createdSections = 0;
    let regeneratedSteps = 0;
    const taskOutcomes = new Map<string, SectionTaskOutcome>();
    let completed = false;

    const progress = new Map<string, SectionTaskProgress>();

    const showProgress = (text: string) => {
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          text: isIntent
            ? pt(
                "layoutGenerationChat.creatingIntentPage",
                "Creating intent page..."
              )
            : text,
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
      const building = [...progress.values()].some(
        (section) =>
          section.sectionId === task.sectionId &&
          ["generating", "retrying", "queued", "applying"].includes(
            section.status
          )
      );
      if (building) canvas.buildingSection(task.sectionId);
      else canvas.clearBuildingSection(task.sectionId);

      const applied = [...progress.values()].filter(
        (item) => item.status === "applied"
      ).length;

      showProgress(
        pt(
          "layoutGenerationChat.sectionsApplied",
          "{{applied}} of {{total}} sections applied.",
          { applied, total: progress.size }
        )
      );
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
            message: pt(
              "layoutGenerationChat.applicationStopped",
              "Stopped before application completed."
            ),
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

    const finishRegenerationProgress = (status: "cancelled" | "skipped") => {
      for (const [key, section] of progress) {
        if (section.status !== "applied") {
          progress.set(key, {
            ...section,
            status,
            description:
              status === "skipped"
                ? pt(
                    "layoutGenerationChat.noSectionChange",
                    "No change applied to this section."
                  )
                : section.description,
          });
        }
      }
      return [...progress.values()];
    };

    finalizeCancelled.current = () => {
      if (regenerating) {
        complete(
          pt(
            "layoutGenerationChat.regenerationCancelled",
            "Regeneration cancelled. {{count}} steps completed; remaining sections retained.",
            {
              count: regeneratedSteps,
              defaultValue_one:
                "Regeneration cancelled. {{count}} step completed; remaining sections retained.",
            }
          ),
          finishRegenerationProgress("cancelled")
        );
      } else if (plan) {
        completeEdits(
          pt("layoutGenerationChat.requestCancelled", "Request cancelled.")
        );
      } else {
        canvas.onDiagnostic("creation-stopped", {
          outcome: "cancelled",
          sectionCount: createdSections,
        });
        complete(
          pt(
            "layoutGenerationChat.cancelledBeforeChanges",
            "Request cancelled before any changes were applied."
          )
        );
      }
    };

    setMessages([
      ...nextMessages,
      {
        role: "assistant",
        text: isIntent
          ? pt(
              "layoutGenerationChat.creatingIntentPage",
              "Creating intent page..."
            )
          : pt("layoutGenerationChat.generatingLayout", "Generating layout…"),
        pending: true,
      },
    ]);
    setIsStreaming(true);
    setError(null);

    const request: GenerationRequestExecutor = (
      body,
      signal = controller.signal,
      onCreationContent,
      onRegenerationStep,
      onRegenerationSection
    ) =>
      requestChatGeneration(
        isIntent || regenerating ? { ...body, purpose: "intent" } : body,
        environment,
        signal,
        correlationId,
        onCreationContent,
        onRegenerationStep,
        onRegenerationSection
      );
    try {
      const selectedComponentId = canvas.selectedComponentId;
      const currentData = canvas.begin();
      const blank = isBlankGenerationPage(currentData);
      if (isIntent) regenerating = !blank;
      const fresh = !regenerating && blank;
      setIsGeneratingPage(fresh || regenerating);
      const sectionLabels = fresh ? {} : canvas.sectionLabels;
      if (regenerating) {
        for (const [sectionId, label] of Object.entries(sectionLabels)) {
          progress.set(`section-${sectionId}`, {
            taskId: `section-${sectionId}`,
            sectionId,
            label,
            description: pt(
              "layoutGenerationChat.waitingForDecision",
              "Waiting for a section decision."
            ),
            status: "waiting",
          });
        }
      }
      showProgress(
        fresh
          ? pt("layoutGenerationChat.generatingLayout", "Generating layout…")
          : pt("layoutGenerationChat.planningChanges", "Planning changes…")
      );
      // Puck records manual changes after 250ms; let pending history settle.
      await new Promise<void>((resolve) =>
        setTimeout(resolve, PUCK_HISTORY_SETTLE_DELAY_MS)
      );
      if (!active()) {
        return false;
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
      if (regenerating) {
        showProgress(
          pt("layoutGenerationChat.regeneratingPage", "Regenerating page…")
        );
        diagnostics.current.phase = "regeneration";
        const result = await runRegeneration({
          ...turn,
          canvas,
          onProgress: (step, count) => {
            if (!active()) return;
            regeneratedSteps = count;
            const sectionId =
              step.kind === "insert" ? `insert-${count}` : step.sectionId;
            const label =
              step.kind === "insert"
                ? pt(
                    "layoutGenerationChat.newSection",
                    "New section · {{label}}",
                    {
                      label: step.sections
                        .map((section) => canvas.componentLabel(section.type))
                        .join(", "),
                    }
                  )
                : (sectionLabels[sectionId] ?? sectionId);
            const descriptions = {
              keep: pt(
                "layoutGenerationChat.sectionKept",
                "Kept this section."
              ),
              remove: pt(
                "layoutGenerationChat.sectionRemoved",
                "Removed this section."
              ),
              reorder: pt(
                "layoutGenerationChat.sectionMoved",
                "Moved this section."
              ),
              replace: pt(
                "layoutGenerationChat.sectionUpdated",
                "Updated this section."
              ),
              insert: pt(
                "layoutGenerationChat.sectionAdded",
                "Added this section."
              ),
            };
            const waitingKey = `section-${sectionId}`;
            const taskId =
              progress.get(waitingKey)?.status === "waiting"
                ? waitingKey
                : `regeneration-${count}`;
            progress.set(taskId, {
              taskId,
              sectionId,
              label,
              description: descriptions[step.kind],
              status: "applied",
            });
            diagnostics.current.phase = "streaming-regeneration";
            canvas.onDiagnostic("regeneration-step", {
              kind: step.kind,
              completedSteps: count,
            });
            showProgress(
              pt(
                "layoutGenerationChat.regenerationProgress",
                "{{count}} regeneration steps completed…",
                {
                  count,
                  defaultValue_one: "{{count}} regeneration step completed…",
                }
              )
            );
          },
        });
        if (result && active()) {
          regenerationPending.current = result.clarification;
          complete(
            result.text,
            result.clarification ? [] : finishRegenerationProgress("skipped")
          );
          return result.clarification ? "clarification" : true;
        }
      } else if (fresh) {
        const result = await runFullGeneration({
          ...turn,
          canvas,
          onProgress: (event) => {
            switch (event.phase) {
              case "preparing":
                showProgress(
                  pt(
                    "layoutGenerationChat.checkingRequirements",
                    "Checking page requirements…"
                  )
                );
                break;
              case "generating":
                showProgress(
                  pt(
                    "layoutGenerationChat.generatingLayout",
                    "Generating layout…"
                  )
                );
                break;
              case "revealed":
                createdSections = event.sectionCount;
                diagnostics.current.phase = "streaming-creation";
                showProgress(
                  pt(
                    "layoutGenerationChat.sectionsAppliedGenerating",
                    "{{count}} sections applied. Generating layout…",
                    {
                      count: createdSections,
                      defaultValue_one:
                        "{{count}} section applied. Generating layout…",
                    }
                  )
                );
                break;
              case "applying":
                diagnostics.current.phase = "resolve-and-commit";
                diagnostics.current.candidate = event.candidate;
                showProgress(
                  pt("layoutGenerationChat.applyingLayout", "Applying layout…")
                );
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
        if (result && active()) {
          complete(result.text);
          return result.clarification ? "clarification" : createdSections > 0;
        }
      } else {
        const result = await runEdits({
          ...turn,
          canvas,
          selectedComponentId,
          onProgress: (event) => {
            if (event.phase === "planning") {
              showProgress(
                event.retrying
                  ? pt("layoutGenerationChat.retryingPlan", "Retrying plan…")
                  : pt(
                      "layoutGenerationChat.planningChanges",
                      "Planning changes…"
                    )
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
                      ? pt(
                          "layoutGenerationChat.newSection",
                          "New section · {{label}}",
                          {
                            label: canvas.componentLabel(
                              insertion.componentType
                            ),
                          }
                        )
                      : pt(
                          "layoutGenerationChat.sectionNumber",
                          "Section {{number}}",
                          { number: index + 1 }
                        )),
                  description:
                    task.description ??
                    pt(
                      "layoutGenerationChat.updateSection",
                      "Update this section."
                    ),
                  status: task.dependsOn.length ? "waiting" : "pending",
                });
              });
              showProgress(
                pt(
                  "layoutGenerationChat.sectionsApplied",
                  "{{applied}} of {{total}} sections applied.",
                  { applied: 0, total: plan.tasks.length }
                )
              );
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
          return false;
        }
        completeEdits();
        if (result?.error) {
          reportError(result.error);
        }
      }
    } catch (cause) {
      if (!active()) {
        return false;
      }

      if (regenerating) {
        complete(
          pt(
            "layoutGenerationChat.regenerationStopped",
            "Regeneration stopped. {{count}} steps completed; remaining sections retained.",
            {
              count: regeneratedSteps,
              defaultValue_one:
                "Regeneration stopped. {{count}} step completed; remaining sections retained.",
            }
          ),
          finishRegenerationProgress("cancelled")
        );
      } else if (plan) {
        completeEdits(
          pt(
            "layoutGenerationChat.requestStopped",
            "Request stopped before completion."
          )
        );
      } else {
        canvas.onDiagnostic("creation-stopped", {
          outcome: "failed",
          sectionCount: createdSections,
        });
        complete(
          pt(
            "layoutGenerationChat.failedBeforeChanges",
            "Request failed before any changes were applied."
          )
        );
      }
      reportError(cause);
    } finally {
      if (activeRequest.current === controller) {
        canvas.finish();
        activeRequest.current = null;
        finalizeCancelled.current = null;
        setIsStreaming(false);
        setIsGeneratingPage(false);
      }
    }
    return false;
  };
  return {
    messages,
    isStreaming,
    isGeneratingPage,
    send: async (prompt: string) => {
      await run(prompt, "chat");
    },
    clear,
    generateIntent: (prompt: string, continuation = false) =>
      run(prompt, continuation ? "intent-continuation" : "intent"),
    error,
    canvas,
    ready,
    cancel,
  };
};
