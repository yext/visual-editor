import type { Data } from "@puckeditor/core";
import { isDeepEqual } from "../../../../utils/deepEqual.ts";
import { clonePuckResolveData } from "../../../utils/clonePuckResolveData.ts";
import type { GenerationCanvasAdapter } from "../../shared/contracts.ts";
import type { RegenerationStep } from "./contracts.ts";

type RegenerationAdapter = GenerationCanvasAdapter & {
  materializeRegeneration: (baseline: Data, step: RegenerationStep) => Data;
  preserveSectionResolution: (resolved: Data, candidate: Data) => Data;
};

/** Stream isolated steps over the existing page, retaining one undo baseline. */
export class RegenerationSession {
  private active = true;
  private accepted?: Data;
  private expected: Data;
  private steps = new Map<number, string>();
  private replacements = new Map<string, string[]>();
  stepCount = 0;

  constructor(
    private adapter: RegenerationAdapter,
    private baseline: Data
  ) {
    this.expected = clonePuckResolveData(baseline);
  }

  async apply(step: RegenerationStep, index: number, signal: AbortSignal) {
    const assertActive = () => {
      signal.throwIfAborted();
      if (!this.active) throw new Error("Regeneration session ended.");
    };
    assertActive();
    const serialized = JSON.stringify(step);
    if (this.steps.has(index)) {
      if (this.steps.get(index) !== serialized)
        throw new Error("Regeneration changed an already applied step.");
      return;
    }
    if (index !== this.stepCount)
      throw new Error("Regeneration steps must apply in order.");
    const before = clonePuckResolveData(this.adapter.read());
    if (!isDeepEqual(before, this.expected))
      throw new Error(
        "Layout changed during regeneration. Try the request again."
      );
    let candidate: Data;
    try {
      let operations = [step];
      if (step.kind === "reorder" || step.kind === "insert") {
        let anchor = step.anchor;
        if ("componentId" in anchor) {
          const replacement = this.replacements.get(anchor.componentId);
          if (replacement) {
            anchor = {
              ...anchor,
              componentId:
                anchor.position === "before"
                  ? replacement[0]
                  : replacement[replacement.length - 1],
            };
          }
        }
        if (step.kind === "reorder") {
          const sectionIds = this.replacements.get(step.sectionId) ?? [
            step.sectionId,
          ];
          if (
            "componentId" in anchor &&
            sectionIds.includes(anchor.componentId)
          )
            throw new Error("Cannot reorder a section relative to itself.");
          // Moving each section to start/after would otherwise reverse the block.
          const ordered =
            anchor.position === "start" || anchor.position === "after"
              ? [...sectionIds].reverse()
              : sectionIds;
          operations = ordered.map((sectionId) => ({
            ...step,
            sectionId,
            anchor,
          }));
        } else {
          operations = [{ ...step, anchor }];
        }
      }
      candidate = before;
      for (const operation of operations)
        candidate = this.adapter.materializeRegeneration(candidate, operation);
    } catch (cause) {
      const { sections: _sections, ...references } =
        "sections" in step ? step : { ...step, sections: undefined };
      throw new Error(
        `Regeneration step ${index} failed: ${cause instanceof Error ? cause.message : String(cause)} Step references: ${JSON.stringify(references)}.`,
        { cause }
      );
    }
    if (!isDeepEqual(candidate, before)) {
      if (step.kind === "replace") {
        await this.adapter.prepareSection?.(step.sectionId, signal);
        assertActive();
      }
      const resolved = await this.adapter.resolve(
        clonePuckResolveData(candidate)
      );
      assertActive();
      if (!isDeepEqual(before, this.adapter.read()))
        throw new Error(
          "Layout changed during regeneration. Try the request again."
        );
      const preserved = this.adapter.preserveSectionResolution(
        resolved,
        candidate
      );
      const data = {
        ...preserved,
        root: this.baseline.root,
        zones: this.baseline.zones,
      };
      this.adapter.preview?.(data, { follow: step.kind === "insert" });
      this.accepted = clonePuckResolveData(data);
      this.expected = clonePuckResolveData(data);
    }
    if (step.kind === "replace")
      this.replacements.set(
        step.sectionId,
        step.sections.map((section) => section.props.id)
      );
    this.steps.set(index, serialized);
    this.stepCount++;
  }

  /** Cancellation and failure keep completed steps, just like successful completion. */
  finish() {
    if (!this.active) return;
    this.active = false;
    if (this.accepted) {
      // Do not overwrite a concurrent manual change or a different page.
      if (isDeepEqual(this.adapter.read(), this.expected))
        this.adapter.commit(this.accepted, this.baseline);
    }
  }
}
