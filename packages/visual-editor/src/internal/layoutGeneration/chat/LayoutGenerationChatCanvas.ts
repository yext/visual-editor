import { RegenerationSession } from "../workflows/fullPageRegeneration/RegenerationSession.ts";
import type { RegenerationStep } from "../workflows/fullPageRegeneration/contracts.ts";
import type { Data } from "@puckeditor/core";
import { isDeepEqual } from "../../../utils/deepEqual.ts";
import type { PuckGenerationCatalog } from "../../../utils/createPuckGenerationCatalog.ts";
import { clonePuckResolveData } from "../../utils/clonePuckResolveData.ts";
import { structuralEditResult } from "../workflows/edits/applyEditsToLayout.ts";
import type {
  SectionEditResult,
  SectionEditTask,
} from "../workflows/edits/types.ts";
import { CreationSession } from "../workflows/fullPageGeneration/CreationSession.ts";
import {
  GENERATION_CHANGED_PATHS_LIMIT,
  GENERATION_SNAPSHOT_MAX_BYTES,
} from "../limits.ts";
import { rejectZones } from "../shared/authoredValues.ts";
import type { GenerationCanvasAdapter } from "../shared/contracts.ts";
import { changedChatPaths } from "./chatDiagnostics.ts";
import { previewSections } from "./previewScroll.ts";

type GeneratedContent = Pick<Data, "content">;
export type ChatCanvasAdapter = GenerationCanvasAdapter & {
  beginPresentation?: () => void;
  materializeRegeneration?: (baseline: Data, step: RegenerationStep) => Data;
  validateInitial?: (data: Data) => void;
  readSelection?: () => string | null;
  readSectionLabels?: () => Record<string, string>;
  readComponentLabel?: (type: string) => string;
  /** Apply one section's operations to the latest baseline. */
  materializeSection?: (
    baseline: Data,
    task: SectionEditTask,
    result: SectionEditResult
  ) => Data;
  /** Verify resolution and preserve the section candidate's untouched data. */
  preserveSectionResolution?: (resolved: Data, candidate: Data) => Data;
};

/** Coordinate canvas updates: one history entry per page generation or section edit. */
export class LayoutGenerationChatCanvas {
  catalog?: PuckGenerationCatalog;
  private adapter?: ChatCanvasAdapter;
  private creation?: CreationSession;
  private regeneration?: RegenerationSession;
  private creationStartedAt = 0;
  private baseline?: Data;
  private revision = 0;
  private sectionQueue: Promise<void> = Promise.resolve();
  private appliedTaskIds = new Set<string>();
  private subscribers = new Set<() => void>();
  private sectionStatuses = new Map<string, "building" | "ready">();
  getSectionStatuses = () => this.sectionStatuses;
  sectionStatus = (sectionId: string) => this.sectionStatuses.get(sectionId);
  buildingSection(sectionId: string) {
    this.sectionStatuses = new Map(this.sectionStatuses);
    this.sectionStatuses.set(sectionId, "building");
    this.notify();
  }
  clearBuildingSection(sectionId: string) {
    if (this.sectionStatuses.get(sectionId) !== "building") return;
    this.sectionStatuses = new Map(this.sectionStatuses);
    this.sectionStatuses.delete(sectionId);
    this.notify();
  }
  /** Presentation state stays outside Puck data and undo history. */
  buildingSections(previous: Data, next: Data) {
    this.sectionStatuses = new Map(this.sectionStatuses);
    const before = new Map(
      previewSections(previous).map((item) => [item.props.id, item])
    );
    for (const item of previewSections(next)) {
      // Creation only appends: resolved props on an accepted prefix must not
      // make earlier sections appear to start building again.
      if (this.creation && before.has(item.props.id)) continue;
      if (!isDeepEqual(before.get(item.props.id), item)) {
        this.sectionStatuses.set(item.props.id, "building");
      }
    }
    this.notify();
  }
  readySections(previous: Data, next: Data) {
    this.sectionStatuses = new Map(this.sectionStatuses);
    const before = new Map(
      previewSections(previous).map((item) => [item.props.id, item])
    );
    const sections = previewSections(next);
    const present = new Set(sections.map((item) => item.props.id));
    for (const item of sections) {
      if (
        this.sectionStatuses.has(item.props.id) &&
        !isDeepEqual(before.get(item.props.id), item)
      ) {
        this.sectionStatuses.set(item.props.id, "ready");
      }
    }
    for (const sectionId of this.sectionStatuses.keys()) {
      if (!present.has(sectionId)) this.sectionStatuses.delete(sectionId);
    }
    this.notify();
  }
  private lastObserved?: Data;
  private lastApplied?: { taskId: string; sectionId: string };
  onDiagnostic: (phase: string, details: Record<string, unknown>) => void =
    () => {};
  onError: (error: unknown) => void = () => {};
  private diagnose(
    phase: string,
    data: Data,
    details: Record<string, unknown> = {},
    captured?: { serialized: string; snapshot: Data }
  ) {
    try {
      const serialized = captured?.serialized ?? JSON.stringify(data);
      const snapshot = captured?.snapshot ?? JSON.parse(serialized);
      const changedPaths = this.lastObserved
        ? changedChatPaths(this.lastObserved, snapshot)
        : [];
      this.lastObserved = snapshot;
      this.onDiagnostic(phase, {
        observedAt: new Date().toISOString(),
        ...this.lastApplied,
        ...details,
        ...this.adapter?.inspect?.(data),
        changedPaths,
        changedPathsLimit: GENERATION_CHANGED_PATHS_LIMIT,
        snapshot:
          new Blob([serialized]).size <= GENERATION_SNAPSHOT_MAX_BYTES
            ? snapshot
            : { omitted: true, characters: serialized.length },
      });
    } catch (error) {
      console.error("Unable to capture canvas diagnostics:", error);
    }
  }
  /** Record Puck changes after history commits, including resolution after the turn ends. */
  observe(data: Data) {
    if (!this.lastApplied) {
      return;
    }
    try {
      const serialized = JSON.stringify(data);
      const snapshot = JSON.parse(serialized);
      if (!isDeepEqual(snapshot, this.lastObserved)) {
        this.diagnose("canvas-observed", data, {}, { serialized, snapshot });
      }
    } catch (error) {
      console.error("Unable to observe canvas diagnostics:", error);
    }
  }
  subscribe = (listener: () => void) => {
    this.subscribers.add(listener);
    return () => {
      this.subscribers.delete(listener);
    };
  };
  getReady = () => this.ready;
  get ready() {
    return !!this.adapter;
  }
  attach(adapter: ChatCanvasAdapter) {
    this.finish();
    this.lastApplied = undefined;
    this.lastObserved = undefined;
    this.adapter = adapter;
    this.notify();
    return () => {
      if (this.adapter !== adapter) {
        return;
      }
      const active = !!this.baseline;
      this.finish();
      this.adapter = undefined;
      this.notify();
      if (active) {
        this.onError(new Error("Editor context changed during generation."));
      }
    };
  }
  begin() {
    if (!this.adapter) {
      throw new Error("The editor is not ready.");
    }
    const data = this.adapter.read();
    rejectZones(data as any);
    this.adapter.validateInitial?.(data);
    this.adapter.beginPresentation?.();
    this.sectionStatuses = new Map();
    this.notify();
    this.lastApplied = undefined;
    this.lastObserved = undefined;
    this.diagnose("turn-start", data);
    this.baseline = clonePuckResolveData(data);
    this.appliedTaskIds.clear();
    this.sectionQueue = Promise.resolve();
    this.revision++;
    return serializeChatLayout(this.baseline);
  }
  /** Read the latest layout for each section request and repair attempt. */
  read(task?: SectionEditTask) {
    if (!this.adapter || !this.baseline) {
      throw new Error("Generation cancelled or editor context changed.");
    }
    const data = this.adapter.read();
    this.diagnose("request-layout", data, {
      taskId: task?.taskId,
      sectionId: task?.sectionId,
    });
    return serializeChatLayout(data);
  }
  /** Read names for the sections present before planning. */
  get sectionLabels() {
    return this.adapter?.readSectionLabels?.() ?? {};
  }
  componentLabel(type: string) {
    return this.adapter?.readComponentLabel?.(type) ?? type;
  }
  get selectedComponentId() {
    return this.adapter?.readSelection?.() ?? null;
  }
  beginCreation() {
    if (!this.adapter || !this.baseline) {
      throw new Error("The editor is not ready.");
    }
    this.creation = new CreationSession(this.adapter, this.baseline);
    this.creationStartedAt = performance.now();
  }
  get createdSectionCount() {
    return this.creation?.sectionCount ?? 0;
  }
  async revealCreation(data: GeneratedContent, signal: AbortSignal) {
    if (!this.creation) {
      throw new Error("Creation session ended.");
    }
    const session = this.creation;
    const started = performance.now();
    const previousCount = session.sectionCount;
    await session.reveal(data, signal);
    if (session.sectionCount !== previousCount) {
      this.onDiagnostic("creation-revealed", {
        sectionCount: session.sectionCount,
        applicationDurationMs: performance.now() - started,
        ...(previousCount === 0
          ? { timeToFirstRevealMs: performance.now() - this.creationStartedAt }
          : {}),
      });
    }
  }
  finishCreation() {
    const creation = this.creation;
    this.creation = undefined;
    creation?.finish();
  }
  beginRegeneration() {
    const adapter = this.adapter;
    if (
      !this.baseline ||
      !adapter?.materializeRegeneration ||
      !adapter.preserveSectionResolution ||
      !adapter.preview
    ) {
      throw new Error("The editor does not support page regeneration.");
    }
    this.regeneration = new RegenerationSession(
      {
        ...adapter,
        materializeRegeneration: adapter.materializeRegeneration,
        preserveSectionResolution: adapter.preserveSectionResolution,
      },
      this.baseline
    );
  }
  async prepareRegenerationSection(sectionId: string, signal: AbortSignal) {
    if (!this.regeneration) throw new Error("Regeneration session ended.");
    await this.adapter?.prepareSection?.(sectionId, signal);
  }
  async applyRegeneration(
    step: RegenerationStep,
    index: number,
    signal: AbortSignal
  ) {
    if (!this.regeneration) throw new Error("Regeneration session ended.");
    await this.regeneration.apply(step, index, signal);
  }
  finishRegeneration() {
    const session = this.regeneration;
    this.regeneration = undefined;
    session?.finish();
  }
  /** Serialize section commits while keeping the current turn open. */
  async commitSection(
    taskInput: SectionEditTask,
    resultInput?: SectionEditResult,
    signal?: AbortSignal,
    onApplying?: () => void
  ): Promise<boolean> {
    const revision = this.revision;
    const adapter = this.adapter;
    const task = clonePuckResolveData(taskInput);
    const result = clonePuckResolveData(
      resultInput ?? structuralEditResult(task)
    );
    const assertActive = () => {
      signal?.throwIfAborted();
      if (
        !this.baseline ||
        revision !== this.revision ||
        adapter !== this.adapter
      ) {
        throw new Error("Generation cancelled or editor context changed.");
      }
    };
    const queued = this.sectionQueue.then(async () => {
      assertActive();
      if (!adapter?.materializeSection || !adapter.preserveSectionResolution) {
        throw new Error("The editor does not support section edits.");
      }
      if (
        task.taskId !== result.taskId ||
        task.sectionId !== result.sectionId
      ) {
        throw new Error("Section result does not match its task.");
      }
      if (this.appliedTaskIds.has(task.taskId)) {
        return false;
      }
      let stage = "baseline";
      try {
        onApplying?.();
        const baseline = clonePuckResolveData(adapter.read());
        this.diagnose(stage, baseline, {
          taskId: task.taskId,
          sectionId: task.sectionId,
          task,
          result,
        });
        rejectZones(baseline as any);
        stage = "materialize";
        const candidate = adapter.materializeSection(baseline, task, result);
        this.diagnose("materialized", candidate, {
          taskId: task.taskId,
          sectionId: task.sectionId,
        });
        stage = "resolve";
        const resolved = await adapter.resolve(clonePuckResolveData(candidate));
        this.diagnose("resolved", resolved, {
          taskId: task.taskId,
          sectionId: task.sectionId,
        });
        assertActive();
        if (!isDeepEqual(adapter.read(), baseline)) {
          this.finish();
          throw new Error(
            "Layout changed during generation. Try the request again."
          );
        }
        stage = "preserve";
        const data = adapter.preserveSectionResolution(resolved, candidate);
        this.diagnose("preserved", data, {
          taskId: task.taskId,
          sectionId: task.sectionId,
        });
        stage = "commit";
        this.lastApplied = { taskId: task.taskId, sectionId: task.sectionId };
        adapter.commit(
          { ...data, root: baseline.root, zones: baseline.zones },
          baseline
        );
        this.diagnose("commit-readback", adapter.read());
        this.appliedTaskIds.add(task.taskId);
        return true;
      } catch (error) {
        try {
          this.diagnose("section-failed", adapter.read(), {
            taskId: task.taskId,
            sectionId: task.sectionId,
            stage,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
        } catch (diagnosticError) {
          console.error(
            "Unable to read failed section diagnostics:",
            diagnosticError
          );
        }
        throw error;
      }
    });
    // Rejections belong to their task; later independent tasks may still apply.
    this.sectionQueue = queued.then(
      () => {},
      () => {}
    );
    return queued;
  }
  finish() {
    this.finishRegeneration();
    this.creation?.discard();
    this.creation = undefined;
    this.revision++;
    this.baseline = undefined;
    this.appliedTaskIds.clear();
    this.sectionQueue = Promise.resolve();
    this.sectionStatuses = new Map(this.sectionStatuses);
    for (const [sectionId, status] of this.sectionStatuses) {
      if (status === "building") this.sectionStatuses.delete(sectionId);
    }
    this.notify();
  }
  private notify() {
    this.subscribers.forEach((listener) => listener());
  }
}

/** Preserve serializable configuration, including unexposed authored properties. */
export const serializeChatLayout = (data: Data): GeneratedContent => {
  rejectZones(data as any);
  return JSON.parse(JSON.stringify({ content: data.content }));
};
