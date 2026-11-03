import type { SectionTaskOutcome } from "../workflows/edits/types.ts";

export type SectionTaskProgress = {
  /** The task whose progress is displayed. */
  taskId: string;
  /** The section associated with this task. */
  sectionId: string;
  /** A section name and position captured before edits start. */
  label: string;
  /** A plain-language description of the requested change. */
  description: string;
  /** The current stage or final outcome of the task. */
  status:
    | "pending"
    | "waiting"
    | "generating"
    | "retrying"
    | "queued"
    | "applying"
    | SectionTaskOutcome["status"];
  /** A short explanation when the task finishes. */
  message?: string;
};

/** Summarize actual applications without repeating the planner's promises. */
export const summarizeSectionOutcomes = (outcomes: SectionTaskOutcome[]) => {
  const counts = (["applied", "failed", "skipped", "cancelled"] as const)
    .map((status) => ({
      status,
      count: outcomes.filter((outcome) => outcome.status === status).length,
    }))
    .filter(({ count }) => count > 0)
    .map(({ status, count }) => `${count} ${status}`);
  return `Section changes: ${counts.join(", ")}.`;
};
