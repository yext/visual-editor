import type { Content } from "../../shared/authoredValues.ts";
import type { GenerationTurn } from "../../shared/contracts.ts";
import {
  GenerationError,
  repairGenerationOutput,
} from "../../shared/generationErrors.ts";
import { runSectionTasks } from "./sectionTaskRunner.ts";
import type {
  SectionEditPlan,
  SectionEditResult,
  SectionEditTask,
  SectionTaskOutcome,
} from "./types.ts";
import { validateTaskGraph } from "./utils.ts";

type EditCanvas = {
  read: (task: SectionEditTask) => Content;
  commitSection: (
    task: SectionEditTask,
    result: SectionEditResult | undefined,
    signal: AbortSignal,
    onApplying: () => void
  ) => Promise<unknown>;
};

export type EditProgress =
  | { phase: "planning"; retrying: boolean }
  | { phase: "planned"; plan: SectionEditPlan }
  | {
      phase: "section";
      task: SectionEditTask;
      status: "generating" | "retrying" | "queued" | "applying";
    };

/** Capture selection once, then execute each task against the latest canvas. */
export const runEdits = async ({
  layoutId,
  currentData,
  messages,
  signal,
  active,
  request,
  selectedComponentId,
  canvas,
  onProgress,
  onOutcome,
}: GenerationTurn & {
  selectedComponentId: string | null;
  canvas: EditCanvas;
  onProgress: (progress: EditProgress) => void;
  onOutcome: (outcome: SectionTaskOutcome) => void;
}) => {
  const plan = await repairGenerationOutput(async (validationFeedback) => {
    if (active()) {
      onProgress({ phase: "planning", retrying: !!validationFeedback });
    }
    const event = await request({
      mode: "plan",
      layoutId,
      currentData,
      messages,
      selectedComponentId,
      validationFeedback,
    });
    if (event.type !== "planned") {
      throw new GenerationError("Expected an edit plan.", true);
    }
    try {
      validateTaskGraph(event.plan.tasks);
    } catch (cause) {
      throw new GenerationError(String(cause), true);
    }
    return event.plan;
  });
  if (!active()) {
    return;
  }
  onProgress({ phase: "planned", plan });
  return runSectionTasks({
    tasks: plan.tasks,
    signal,
    generate: async (task, taskSignal, validationFeedback) => {
      const event = await request(
        {
          mode: "section",
          layoutId,
          messages,
          currentData: canvas.read(task),
          task,
          sharedIntent: plan.sharedIntent,
          validationFeedback,
        },
        taskSignal
      );
      if (event.type !== "section-result") {
        throw new GenerationError("Expected a section result.", true);
      }
      return event.result;
    },
    commit: async (task, result, taskSignal) => {
      if (!active()) {
        throw new Error("Generation cancelled.");
      }
      await canvas.commitSection(task, result, taskSignal, () =>
        onProgress({ phase: "section", task, status: "applying" })
      );
    },
    onProgress: (task, status) =>
      onProgress({ phase: "section", task, status }),
    onOutcome,
  });
};
