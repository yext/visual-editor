import { SECTION_TASK_CONCURRENCY } from "../limits.ts";
import {
  GenerationError,
  repairGenerationOutput,
} from "../shared/generationErrors.ts";
import type {
  SectionEditResult,
  SectionEditTask,
  SectionTaskOutcome,
} from "./types.ts";
import { validateTaskGraph } from "./utils.ts";

type RunnerOptions = {
  tasks: SectionEditTask[];
  signal: AbortSignal;
  generate: (
    task: SectionEditTask,
    signal: AbortSignal,
    feedback?: string
  ) => Promise<SectionEditResult>;
  commit: (
    task: SectionEditTask,
    result: SectionEditResult | undefined,
    signal: AbortSignal
  ) => Promise<unknown>;
  onOutcome: (outcome: SectionTaskOutcome) => void;
  onProgress?: (
    task: SectionEditTask,
    status: "generating" | "retrying" | "queued"
  ) => void;
};

/** Run two independent tasks at a time; dependencies wait for local application. */
export const runSectionTasks = async (options: RunnerOptions) => {
  validateTaskGraph(options.tasks);
  const controller = new AbortController();
  const stop = () => controller.abort();
  options.signal.addEventListener("abort", stop, { once: true });
  if (options.signal.aborted) {
    stop();
  }
  const outcomes = new Map<string, SectionTaskOutcome>();
  const running = new Map<string, Promise<void>>();
  let fatal: unknown;
  const finish = (
    task: SectionEditTask,
    status: SectionTaskOutcome["status"],
    message: string
  ) => {
    if (outcomes.has(task.taskId)) {
      return;
    }
    const outcome = {
      taskId: task.taskId,
      sectionId: task.sectionId,
      status,
      message,
    };
    outcomes.set(task.taskId, outcome);
    options.onOutcome(outcome);
  };
  const execute = async (task: SectionEditTask) => {
    try {
      await repairGenerationOutput(async (feedback) => {
        controller.signal.throwIfAborted();
        if (task.generateContent !== false) {
          options.onProgress?.(task, feedback ? "retrying" : "generating");
        }
        const result =
          task.generateContent === false
            ? undefined
            : await options.generate(task, controller.signal, feedback);
        controller.signal.throwIfAborted();
        options.onProgress?.(task, "queued");
        try {
          await options.commit(task, result, controller.signal);
        } catch (cause) {
          controller.signal.throwIfAborted();
          // A local resolver may reject values that passed schema validation.
          throw new GenerationError(
            String(cause),
            task.generateContent !== false
          );
        }
        controller.signal.throwIfAborted();
      });
      finish(task, "applied", "Applied successfully.");
    } catch (cause) {
      if (controller.signal.aborted) {
        return;
      }
      finish(
        task,
        "failed",
        cause instanceof Error ? cause.message : String(cause)
      );
      if (cause instanceof GenerationError && cause.transport) {
        fatal = cause;
        stop();
      }
    }
  };
  let wakeAbort!: () => void;
  const aborted = new Promise<void>((resolve) => {
    wakeAbort = resolve;
  });
  controller.signal.addEventListener("abort", wakeAbort, { once: true });
  try {
    while (!controller.signal.aborted && outcomes.size < options.tasks.length) {
      for (const task of options.tasks) {
        if (outcomes.has(task.taskId) || running.has(task.taskId)) {
          continue;
        }
        if (
          task.dependsOn.some(
            (id) => outcomes.has(id) && outcomes.get(id)!.status !== "applied"
          )
        ) {
          finish(task, "skipped", "A required task did not apply.");
        } else if (
          running.size < SECTION_TASK_CONCURRENCY &&
          task.dependsOn.every((id) => outcomes.get(id)?.status === "applied")
        ) {
          const promise = execute(task).finally(() => {
            running.delete(task.taskId);
          });
          running.set(task.taskId, promise);
        }
      }
      if (running.size) {
        await Promise.race([...running.values(), aborted]);
      }
    }
    for (const task of options.tasks) {
      if (!outcomes.has(task.taskId)) {
        finish(task, "cancelled", "Stopped before application completed.");
      }
    }
    return {
      outcomes: options.tasks.map((task) => outcomes.get(task.taskId)!),
      error: fatal,
    };
  } finally {
    options.signal.removeEventListener("abort", stop);
    controller.signal.removeEventListener("abort", wakeAbort);
  }
};
